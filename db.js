var mysql = require('mysql2')

var connection_config = require('./connection_config.json')
const run_mode = require('./local_run_mode.json')
const DEBUG = run_mode.debug
var pool = mysql.createPool(connection_config)

var my_email = require('./my_email')

async function query (sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result, fields) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

async function functiePeriodica () {
  //  console.log('Funcție asincronă apelată periodic.')

  try {
    const rezultat = await alerta_gr2()
    console.log(rezultat)
  } catch (error) {
    console.error(error)
  }
}

const interval = 60000
setInterval(functiePeriodica, interval)

async function alerta_gr2 () {
  let sql = 'SELECT * FROM configs'
  const conditii = await query(sql)

  if (conditii.length < 3) {
    return 'Prea putine conditii...'
  }

  sql = `SELECT mac FROM (
    SELECT mac, eroare
    FROM stat_erori
    WHERE eroare < 10
      AND TIME_TO_SEC(durata) >= 15 * 60
      AND data >= NOW() - INTERVAL ? HOUR
      AND mac NOT IN (
        SELECT DISTINCT mac
        FROM avertizari
        WHERE grad = 2
          AND data >= NOW() - INTERVAL 24 HOUR
      )
  ) AS subquery
  GROUP BY mac
  HAVING COUNT(eroare) >= ?;`

  const mac_list1 = await query(sql, [conditii[1].val, conditii[0].val])

  sql = `SELECT mac FROM ( 
    SELECT mac, SUM(TIME_TO_SEC(durata)) AS total_durata 
    FROM stat_erori 
    WHERE eroare < 10 AND TIME_TO_SEC(durata) >= 15 * 60 
      AND data >= NOW() - INTERVAL ? HOUR 
      AND mac NOT IN (
        SELECT DISTINCT mac
        FROM avertizari
        WHERE grad = 2
          AND data >= NOW() - INTERVAL 24 HOUR
      )
    GROUP BY mac
  ) AS subquery 
  WHERE total_durata >= ? * 60 * 60;`

  const mac_list2 = await query(sql, [conditii[3].val, conditii[2].val])

  if (mac_list1.length + mac_list2.length == 0) {
    return 'Nu este nevoie de alerta.'
  }
  let TipGr2 = 0
  if (mac_list1.length > 0) TipGr2 += 1
  if (mac_list2.length > 0) TipGr2 += 2

  const listaMAC = mac_list1
    .map(obj => obj.mac)
    .concat(mac_list2.map(obj => obj.mac))

  for (const mac of listaMAC) {
    sql = `SELECT email_serv AS email, serie, model, judet, localitate, strada, magazin, nrmag, mif,
      resp, tel_resp, log_id.* 
      FROM devices 
      LEFT JOIN (
        SELECT mac, stat_erori.id, data, eroare, lcd, descriere 
        FROM stat_erori 
        LEFT JOIN def_erori ON stat_erori.eroare = def_erori.numar
        WHERE mac = ? AND data >= NOW() - INTERVAL ? HOUR
      ) AS log_id ON devices.mac = log_id.mac 
      WHERE devices.mac = ?;`

    const result = await query(sql, [mac, conditii[3].val, mac])

    if (result.length > 0) {
      console.log(`Pregateste alerta pentru ${mac} catre ${result[0].email}`)

      let de_trimis = result

      // aduga la baza de date eroarea gr2 si citeste id-ul intrarii
      sql = `INSERT INTO stat_erori (mac, nr_balot, eroare, data, durata, activa) 
        VALUES (?, (SELECT nrBaloti FROM devices WHERE mac=?), 20, NOW(), ${TipGr2}, 0)`

      let inset_id = await query(sql, [mac, mac])
      de_trimis.gr2 = inset_id.insertId
      de_trimis.tip = TipGr2
      de_trimis.params = [
        conditii[0].val,
        conditii[1].val,
        conditii[2].val,
        conditii[3].val
      ]

      sql = `INSERT INTO avertizari (nr_eroare, mail_catre, id_eroare, stadiu, mac, grad) 
        VALUES (${TipGr2 + 19}, ?, ?, 3, ?, ?)`

      await query(sql, [de_trimis[0].email, de_trimis.gr2, mac, 2])

      console.log(`Alerta gr2 pregatita pentru ${mac}, detaliile sunt:`)
      console.log(de_trimis)

      // TODO: Trimite alerta prin email către result[0].email

      try {
        my_email.send_email(de_trimis)
        console.log(
          `Email trimis catre ${de_trimis[0].email} pentru alerta ${mac}.`
        )
      } catch (error) {
        console.error(`Eroare la trimiterea emailului pentru ${mac}:`, error)
      }
    }
  }

  return 'Alertele au fost procesate.'
}

/**
 * Updates the ballot count for the device with the given MAC address.
 *
 * Checks the new ballot count against the count in the database.
 * If it matches the expected next count, updates the database.
 * Handles the special "GATA" case to force an increment.
 * Saves ballot data before resetting counters if needed.
 * Calls back to the caller with the updated ballot count.
 */
function upd_baloti (mac, nrb, callback) {
  var sql = `SELECT l_pl_c, pl_c, nr_e, nr_e_kip, nrBaloti FROM devices WHERE mac='${mac}'`
  pool.query(sql, [], function (err, result, fields) {
    //    console.log('SQL=', this.sql);
    if (err) {
      console.error(err)
      return
    } else {
      //      console.log("NR Baloti db " + result[0].nrBaloti + " =? " + nrb);
      if (nrb - 1 == result[0].nrBaloti) {
        //        save_balot(mac, result[0].l_pl_c, result[0].nr_e, result[0].nr_e_kip);
        if (result[0].pl_c > 10)
          sql = `UPDATE devices SET l_pl_c='${result[0].pl_c}', 
        presariPEbalot = CONCAT(presariPEbalot, '${result[0].pl_c}',' @ ', NOW(), '\n'), 
        pl_c=0, nr_e=0, nr_e_kip=0, nrBaloti='${nrb}'  WHERE mac='${mac}'`
        else sql = `UPDATE devices SET nrBaloti='${nrb}'  WHERE mac='${mac}'`
        pool.query(sql, [], function (err, result, fields) {
          if (err) {
            console.error(err)
            return
          } else {
            console.log('NR Baloti updated to ' + nrb + ' for ' + mac)
            callback(mac, nrb)
          }
        })
      } else if (nrb == 'GATA') {
        nrb = result[0].nrBaloti + 1
        if (result[0].pl_c > 10) {
          save_balot(
            mac,
            result[0].pl_c,
            result[0].nr_e,
            result[0].nr_e_kip,
            result[0].nrBaloti
          )
          sql = `UPDATE devices SET l_pl_c='${result[0].pl_c}', 
        presariPEbalot = CONCAT(presariPEbalot, '${result[0].pl_c}',' @ ', NOW(), '\n'), 
        pl_c=0, nr_e=0, nr_e_kip=0, nrBaloti=nrBaloti+1  WHERE mac='${mac}'`
          pool.query(sql, [], function (err, result, fields) {
            if (err) {
              console.error(err)
              return
            } else {
              console.log('NR Baloti updated by GATA to ' + nrb + ' for ' + mac)
              callback(mac, nrb)
            }
          })
        } else {
          console.log('NR Baloti pentru ' + mac + ' trebuie verificat')
          console.log(result[0])
        }
      }

      //      callback(result);
    }
  })
}
module.exports.upd_baloti = upd_baloti

/**
 * Saves an error to the database for the given device MAC address.
 *
 * @param {string} mac - The MAC address of the device.
 * @param {number} tip - The error code.
 * @param {Date} [dt] - Optional timestamp to use instead of current time.
 */
function save_err (mac, tip, dt = 0) {
  var sql = `INSERT INTO stat_erori (mac, nr_balot, eroare) VALUES ('${mac}', (SELECT nrBaloti FROM devices WHERE mac='${mac}'),${tip})`
  if (dt)
    sql = `INSERT INTO stat_erori (mac, nr_balot, eroare,data) VALUES ('${mac}', (SELECT nrBaloti FROM devices WHERE mac='${mac}'),${tip},DATE_SUB(NOW(), INTERVAL 15 MINUTE))`
  let err = ''
  if (tip < 11) err = 'EROARE<br>MINORA'
  else err = 'EROARE<br>MAJORA'
  update_status(mac, err)

  pool.query(sql, [], function (err, result, fields) {
    if (err) {
      console.error(err)
      return
    } else {
      console.log('Error inserted for ' + mac)
    }
  })
}
module.exports.save_err = save_err

/**
 * Updates the status message for the device with the given MAC address.
 *
 * @param {string} mac - The MAC address of the device to update.
 * @param {string} status - The new status message to set.
 */
function update_status (mac, status) {
  var sql = `UPDATE devices SET status='${status}', vizibil=1 WHERE mac='${mac}'`

  pool.query(sql, [], function (err, result, fields) {
    if (err) {
      console.error(err)
      return
    } else {
      console.log('Status updated for ' + mac)
    }
  })
}
module.exports.update_status = update_status

/**
 * Ends an active error for the given device MAC address.
 * Sets the error duration in the database.
 * Updates the device status.
 * If no active error is found, tries to end any error.
 *
 * @param {string} mac - The MAC address of the device.
 * @param {string} stat - The status message to set after ending error.
 */
function end_err (mac, stat = 'OK') {
  var sql = `UPDATE stat_erori JOIN avertizari ON stat_erori.id = avertizari.id_eroare
                SET durata=TIMEDIFF(NOW(),stat_erori.data), avertizari.stadiu = 3, stat_erori.activa = 0
              WHERE stat_erori.mac='${mac}' AND stat_erori.activa=1`
  update_status(mac, stat)
  pool.query(sql, [], function (err, result, fields) {
    if (err) {
      console.error(err)
      return
    } else {
      console.log(`Error updated for ${mac} to ${stat}\nresult=`)
      console.log(result)
      if (result.affectedRows != 0) return
      sql = `UPDATE stat_erori SET durata=TIMEDIFF(NOW(),data), stat_erori.activa = 0 WHERE mac='${mac}' AND activa = 1`
      pool.query(sql, [], function (err, result, fields) {
        if (err) {
          console.error(err)
          return
        } else {
          console.log(`Alerte updated for ${mac} to Remediata FARA avertizare`)
          console.log(result)
        }
      })
    }
  })
}
module.exports.end_err = end_err

/**
 * Generates an alert for the given device MAC address and error code.
 * Logs the alert. Stores alert details in the database.
 * Sends alert info via websockets and email based on error severity.
 *
 * @param {string} mac - The MAC address of the device.
 * @param {number} error - The error code.
 * @param {function} broadcastf - The websocket broadcast function.
 */
function alerta (mac, eroare, broadcastf) {
  console.log('alerta pentru ', mac, ' cu eroare ', eroare)
  //  citeste mail responsabil
  let email = 'email_kauf'
  if (eroare > 10) {
    email = 'email_serv'
  }
  var sql = `SELECT ${email} AS email,serie,model,judet,localitate,strada,magazin,nrmag,mif,
      resp, tel_resp, log_id.* FROM devices 
              LEFT JOIN(
                SELECT mac, stat_erori.id, data, eroare, lcd, descriere FROM stat_erori 
                  LEFT JOIN def_erori ON stat_erori.eroare=def_erori.numar
                  WHERE mac='${mac}' AND activa = 1
                ) AS log_id ON devices.mac = log_id.mac 
              WHERE devices.mac='${mac}';`
  pool.query(sql, [], function (err, result, fields) {
    if (err) {
      console.error(err)
      console.log(`Nu am putut formula alerta pentru ${mac}`)
      return
    } else {
      console.log(`Pregateste alerta pentru ${mac} catre ${result[0].email}`)
      //  salveaza in alerte
      let de_trimis = result[0]
      sql = `INSERT INTO avertizari (nr_eroare, mail_catre, id_eroare , stadiu, mac,grad) 
            VALUES (${result[0].eroare}, '${result[0].email}', ${
        result[0].id
      }, 1, '${mac}',${eroare > 10 ? 1 : 0})`
      pool.query(sql, [], function (err, result, fields) {
        if (err) {
          console.error(err)
          return
        } else {
          console.log(`Alerta pregatita pentru ${mac}, detaliile sunt:`)
          console.log(de_trimis)
          //  trimite catre web
          let to_send = {}
          to_send.mac = mac
          if (eroare < 10) to_send.responsabil = 'Personal Kaufland'
          else to_send.responsabil = 'Furnizor Service'
          broadcastf(to_send)
          //  trimite mail
          my_email.send_email(de_trimis)
        }
      })
    }
  })
}
module.exports.alerta = alerta

/**
 * Saves balot counter data to the database.
 *
 * @param {string} mac - The MAC address of the device
 * @param {number} nr_p - The page number
 * @param {number} nr_e - The error number
 * @param {number} nr_e_kip - The kip error number
 * @param {number} nrBalot - The current balot counter value
 */
function save_balot (mac, nr_p, nr_e, nr_e_kip, nrBalot) {
  var sql = `INSERT INTO stat_baloti (mac, nr_p, nr_e, nr_e_kip, nrBalot) VALUES ('${mac}', ${nr_p}, ${nr_e}, ${nr_e_kip}, ${
    nrBalot + 1
  })`
  pool.query(sql, [], function (err, result, fields) {
    if (err) {
      console.error(err)
      return
    } else {
      console.log('Contor error updated for ' + mac)
    }
  })
}

function save_rssi (mac, rssi) {
  var sql = `INSERT INTO stat_rssi (mac, rssi) VALUES ('${mac}', ${rssi})`
  pool.query(sql, [], function (err, result, fields) {
    if (err) {
      console.error(err)
      return
    } else {
    }
  })
}
module.exports.save_rssi = save_rssi

/**
 * Updates the plate counter for a given device in the database.
 * If the plate (pl) parameter is 0 and it's the first count, the function returns early.
 * If the plate is 0, it resets the plate counter (pl_c) and appends the current count and timestamp to the presariPEbalot field.
 * Otherwise, it increments the plate counter by 1.
 * After updating, it logs the updated count and last count and executes a callback with the updated values.
 *
 * @param {string} mac - The MAC address of the device
 * @param {number} pl - The plate count to be added (0 to reset and log the count)
 * @param {function} callback - A callback function to be called after updating the plate counter with the signature (mac, { pl_c, l_pl_c })
 */
function upd_placa (mac, pl, callback) {
  var sql = `SELECT pl_c,l_pl_c FROM devices WHERE mac='${mac}'`
  pool.query(sql, [], function (err, result, fields) {
    if (err) {
      console.error(err)
      return
    } else {
      var cc = result[0].pl_c + 1
      var lc = result[0].l_pl_c
      if (pl == 0 && cc == 1) return
      if (pl == 0)
        sql = `UPDATE devices SET l_pl_c='${cc}', presariPEbalot = CONCAT(presariPEbalot, '${cc}',' @ ', NOW(), '\n'), pl_c=0  WHERE mac='${mac}'`
      else sql = `UPDATE devices SET pl_c=pl_c+1  WHERE mac='${mac}'`
      pool.query(sql, [], function (err, result, fields) {
        if (err) {
          console.error(err)
          return
        } else {
          console.log(
            'Contor placa updated for ' +
              mac +
              ' count=' +
              cc +
              ' last count=' +
              lc
          )
          callback(mac, { pl_c: cc, l_pl_c: lc })
        }
      })
    }
  })
}
module.exports.upd_placa = upd_placa

/**
 * Retrieves MQTT topic names for all devices.
 *
 * Calls back with an array of topic strings for each device's status values.
 * Also includes some fixed topics like "LWT" and "Kaufland/ESP8266_All".
 *
 * Clears any pending alerts after retrieving the topics.
 *
 * @param {Function} callback - Called with array of topic name strings
 */
function get_topics (callback) {
  console.log('GET Topics: ')
  var top = ['Kaufland/ESP8266_All', 'LWT']
  pool.query('SELECT * FROM `devices`', function (error, results) {
    if (error) throw error
    for (var i = 0; i < results.length; i++) {
      top.push('Kaufland/' + results[i].mac + '/lcd')
      top.push('Kaufland/' + results[i].mac + '/rssi')
      top.push('Kaufland/' + results[i].mac + '/sw')
      top.push('Kaufland/' + results[i].mac + '/scr')
      top.push('Kaufland/' + results[i].mac + '/vsw')
      top.push('Kaufland/' + results[i].mac + '/R_sw')
      top.push('Kaufland/' + results[i].mac + '/model')
      top.push('Kaufland/' + results[i].mac + '/nrbalot')
      top.push('Kaufland/' + results[i].mac + '/Uptime')
      top.push('Kaufland/' + results[i].mac + '/Time')
      top.push('Kaufland/' + results[i].mac + '/file_content')
      top.push('Kaufland/' + results[i].mac + '/file_contentp')
      top.push('Kaufland/' + results[i].mac + '/FW_ver')
      top.push('Kaufland/' + results[i].mac + '/crash')
      top.push('Kaufland/' + results[i].mac + '/HEAP')
    }
    //    console.log(top);
    callback(top)
    //Clear pending alert
    pool.query(
      "UPDATE `avertizari` SET `stadiu` = '3' WHERE `avertizari`.`stadiu` = 1",
      function (error, results) {
        if (error) throw error
      }
    )
  })
}
module.exports.get_topics = get_topics

/**
 * Updates a specific field of a device in the database or inserts a new device if it does not exist.
 *
 * If the field being updated is "lcd", the lastLCD timestamp is also set to the current time.
 * If the field is "LWT", the device's lcd field is updated, and lastUPDATE is set to the current time.
 *
 * @param {string} mac - The MAC address of the device to update.
 * @param {string} field - The field of the device to update.
 * @param {string} data - The new value for the specified field.
 */
var upd_dev = function (mac, field, data) {
  let sql = `INSERT INTO devices ( mac,${field}) VALUES (?) ON DUPLICATE KEY UPDATE ${field}=?`
  if (field == 'lcd') sql += ',lastLCD=NOW()'
  if (field == 'LWT') {
    sql = `INSERT INTO devices ( mac, lcd) VALUES (?) ON DUPLICATE KEY UPDATE lcd=?, status='OFFLINE', lastUPDATE=NOW()`

    query(
      `INSERT INTO stat_conexiuni (mac)  SELECT '${mac}' WHERE NOT EXISTS (
      SELECT 1 FROM stat_conexiuni  WHERE mac = '${mac}' AND data_online IS NULL
    );`,
      []
    )
      .then(console.log('Conexiune inchisa pentru ' + mac))
      .catch(err => {
        console.error(err)
      })
  }
  if (field == 'ONLINE') {
    update_status(mac, 'OK')
    query(
      `UPDATE stat_conexiuni SET data_online=NOW(), durata = TIMEDIFF(NOW(), data_offline) WHERE mac='${mac}' and data_online IS NULL`,
      []
    )
      .then(console.log('Conexiune restabilita pentru ' + mac))
      .catch(err => {
        console.error(err)
      })
    return
  }
  pool.query(sql, [[mac, data], data], function (err, result, fields) {
    //    console.log('SQL=', this.sql);
    if (err) {
      console.log('ERROR')
      console.error(err)
      if (err.errno == 1062)
        callback({
          for: msg.command,
          content: 'error',
          Error: err.sqlMessage,
          errno: err.errno
        })
      return
      //    console.log("DB Result: " , result);
    } else {
      //   console.log("DB Result: " , resp);
      //      callback(result);
    }
  })
}

module.exports.upd_dev = upd_dev

/**
 * Updates the scroll value of a device in the 'ddev' table or inserts a new device if it does not exist.
 * If the device exists, it updates the 'scroll' field and sets 'lastScrUpdate' to the current time.
 * If the device does not exist, it inserts a new record with the given 'mac' and 'scroll' values.
 *
 * @param {string} mac - The MAC address of the device to update or insert.
 * @param {string} data - The new scroll value for the device.
 */
var upd_ddev = function (mac, data) {
  var sql = `UPDATE ddev SET lastScroll=scroll WHERE mac='${mac}';INSERT INTO ddev ( mac, scroll) VALUES (?) ON DUPLICATE KEY UPDATE scroll=? ,lastScrUpdate=NOW()`

  pool.query(sql, [[mac, data], data], function (err, result, fields) {
    //        console.log('SQL=', this.sql);
    if (err) {
      console.log('ERROR')
      console.error(err)
      if (err.errno == 1062)
        callback({
          for: msg.command,
          content: 'error',
          Error: err.sqlMessage,
          errno: err.errno
        })
      return
      //    console.log("DB Result: " , result);
    } else {
      //   console.log("DB Result: " , resp);
      //      callback(result);
    }
  })
}

module.exports.upd_ddev = upd_ddev

function getMonth (idx) {
  var objDate = new Date()
  objDate.setDate(1)
  objDate.setMonth(idx - 1)

  return objDate.toLocaleString('ro-RO', { month: 'short' })
}

function dateRange (startDate, endDate) {
  var start = startDate.split('-')
  var end = endDate.split('-')
  var startYear = parseInt(start[0])
  var endYear = parseInt(end[0])
  var dates = []

  for (var i = startYear; i <= endYear; i++) {
    var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1
    var startMon = i === startYear ? parseInt(start[1]) - 1 : 0
    for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
      var month = j + 1
      var displayMonth = getMonth(month)
      dates.push([month, i, [displayMonth, i].join('')])
    }
  }
  return dates
}

function NdateRange (startDate, endDate) {
  var start = new Date(startDate)
  start.setHours(start.getHours() + 2)
  var end = new Date(endDate)
  end.setHours(end.getHours() + 2)
  var intervals = []

  while (start <= end) {
    var monthStart = new Date(start)

    var monthEnd = new Date(start)
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1, 0)
    monthEnd.setUTCHours(23, 59, 59, 999)

    if (monthEnd > end) {
      monthEnd = new Date(end)
    }

    var formattedMonth = start.toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short'
    })

    var startDateString = monthStart
      .toISOString()
      .replace(/(\.\d{3}Z)/g, '')
      .replace(/(T)/g, ' ')
    var endDateString = monthEnd
      .toISOString()
      .replace(/(\.\d{3}Z)/g, '')
      .replace(/(T)/g, ' ')

    intervals.push([startDateString, endDateString, formattedMonth])
    start.setUTCMonth(start.getUTCMonth() + 1, 1)
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)
  }

  return intervals
}

function request_db (msg, callback) {
  //  console.log("msg: ", msg);
  console.log('msg_data: ', msg.data)
  var sql,
    resp = {
      content: '',
      data: ''
    }
  let i = 0
  // Start the timer with a unique label
  //  console.time('TotalRequestTime')
  switch (msg.command) {
    case 'update_device': //update un anumit camp pentru device
      sql = `UPDATE devices SET ${msg.field}=? WHERE mac=?`
      break
    case 'get_login_data': //verific daca exista date in db
      sql =
        "SELECT COUNT(username) FROM users where password = '" +
        msg.data['password'] +
        "' and username = '" +
        msg.data['username'] +
        "' "
      resp.content = 'get_login_data'
      resp.dest = msg.data
      break
    case 'set_login_session':
      sql =
        'UPDATE `users` SET `sesiune` = ?,expire = ?  WHERE  `username` = ? '
      resp.content = 'set_login_session'
      break
    case 'get_one_user_data_to_session':
      sql =
        "SELECT `id`,`nume`,`username`,`password`,`rol`,`sesiune`,`expire`  FROM `users` WHERE `username` = '" +
        msg.data[0] +
        "' "
      resp.content = 'get_one_user_data_to_session'
      resp.dest = msg.data
      break
    case 'change_upswd':
      sql =
        'UPDATE `users` SET `password` = ? WHERE `users`.`password` = ? AND users.sesiune = ?'
      resp.content = 'users_updated'
      break

    case 'get_from_db_l2':
      sql = 'SELECT * FROM `configs` WHERE id<5'
      resp.content = 'l2_conf'
      break

    case 'get_devices':
      sql = `SELECT devices.*, 
      SEC_TO_TIME(SUM(TIME_TO_SEC(CASE WHEN stat_erori.eroare > 10 THEN stat_erori.durata ELSE '00:00:00' END))) AS downtime,
      COALESCE(baloti_counts.blc, 0) AS blc,
      COUNT(CASE WHEN stat_erori.eroare < 11 THEN 1 END) AS minore,
      COUNT(CASE WHEN stat_erori.eroare > 10 THEN 1 END) AS majore,
      CASE
        WHEN nr_eroare<10 THEN 'Personal Kaufland'
        WHEN nr_eroare>10 THEN 'Furnizor Service'
        ELSE ' '
      END AS responsabil,
      CASE
        WHEN CURDATE() > DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY) AND nrBaloti > intervalBaloti + balotiRevizie THEN CONCAT('Depasita <br>(', DATEDIFF(CURDATE(), DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY)), ' zile, ', nrBaloti - (intervalBaloti + balotiRevizie), ' baloti)')
        WHEN CURDATE() > DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY) THEN CONCAT('Depasita <br>(', DATEDIFF(CURDATE(), DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY)), ' zile)')
        WHEN nrBaloti > intervalBaloti + balotiRevizie THEN CONCAT('Depasita <br>(', nrBaloti - (intervalBaloti + balotiRevizie), ' baloti)')
        ELSE 'In termen'
      END AS revizie
          FROM devices 
          LEFT JOIN (SELECT sb.mac AS mac,
             -(IFNULL((SELECT MAX(nrBalot) FROM stat_baloti sb1 WHERE sb1.mac = sb.mac AND sb1.data < ?),
             (SELECT MIN(nrBalot) FROM stat_baloti sb1 WHERE sb1.mac = sb.mac)) - 
             IFNULL((SELECT MAX(nrBalot) FROM stat_baloti sb2 WHERE sb2.mac = sb.mac AND sb2.data < ?),
             (SELECT MIN(nrBalot) FROM stat_baloti sb2 WHERE sb2.mac = sb.mac))) 
             AS blc 
             FROM (SELECT DISTINCT mac FROM stat_baloti) sb) AS baloti_counts ON devices.mac = baloti_counts.mac
          LEFT JOIN avertizari ON devices.mac = avertizari.mac AND avertizari.stadiu<3
          LEFT JOIN stat_erori ON devices.mac = stat_erori.mac AND stat_erori.data BETWEEN ? AND ?
          WHERE devices.vizibil = ${msg.data[4]}
          GROUP BY devices.mac
          ORDER BY devices.nrmag DESC`
      resp.content = 'devices_data'
      break

    case 'get_all_devices':
      sql = `SELECT devices.balotiRevizie, devices.dataRevizie, devices.devsw, devices.email_kauf, devices.email_serv, devices.gol, devices.id, devices.intervalBaloti,devices.intervalRevizie,devices.judet,devices.l_pl_c,devices.lastLCD,devices.lastUPDATE,devices.lcd,devices.localitate,devices.mac,devices.magazin,devices.mif,devices.model,devices.nrBaloti,devices.nr_e,devices.nr_e_kip,devices.nrmag,devices.pl_c,devices.resp,devices.rssi,devices.serie,devices.status,devices.status_rev,devices.strada,devices.sw,devices.tel_resp,devices.vizibil,devices.zero, 
        SEC_TO_TIME(SUM(TIME_TO_SEC(CASE WHEN stat_erori.eroare > 10 THEN stat_erori.durata ELSE '00:00:00' END))) AS downtime,
        COALESCE(baloti_counts.blc, 0) AS blc,
        COUNT(CASE WHEN stat_erori.eroare < 11 THEN 1 END) AS minore,
        COUNT(CASE WHEN stat_erori.eroare > 10 THEN 1 END) AS majore,
        CASE
          WHEN nr_eroare<10 THEN 'Personal Kaufland'
          WHEN nr_eroare>10 THEN 'Furnizor Service'
          ELSE ' '
        END AS responsabil,
        CASE
          WHEN CURDATE() > DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY) AND nrBaloti > intervalBaloti + balotiRevizie THEN CONCAT('Depasita <br>(', DATEDIFF(CURDATE(), DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY)), ' zile, ', nrBaloti - (intervalBaloti + balotiRevizie), ' baloti)')
          WHEN CURDATE() > DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY) THEN CONCAT('Depasita <br>(', DATEDIFF(CURDATE(), DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY)), ' zile)')
          WHEN nrBaloti > intervalBaloti + balotiRevizie THEN CONCAT('Depasita <br>(', nrBaloti - (intervalBaloti + balotiRevizie), ' baloti)')
          ELSE 'In termen'
        END AS revizie
            FROM devices 
            LEFT JOIN (SELECT sb.mac AS mac,
               -(IFNULL((SELECT MAX(nrBalot) FROM stat_baloti sb1 WHERE sb1.mac = sb.mac AND sb1.data < ?),
               (SELECT MIN(nrBalot) FROM stat_baloti sb1 WHERE sb1.mac = sb.mac)) - 
               IFNULL((SELECT MAX(nrBalot) FROM stat_baloti sb2 WHERE sb2.mac = sb.mac AND sb2.data < ?),
               (SELECT MIN(nrBalot) FROM stat_baloti sb2 WHERE sb2.mac = sb.mac))) 
               AS blc 
               FROM (SELECT DISTINCT mac FROM stat_baloti) sb) AS baloti_counts ON devices.mac = baloti_counts.mac
            LEFT JOIN avertizari ON devices.mac = avertizari.mac AND avertizari.stadiu<3
            LEFT JOIN stat_erori ON devices.mac = stat_erori.mac AND stat_erori.data BETWEEN ? AND ?
            GROUP BY devices.mac
            ORDER BY devices.nrmag DESC`
      resp.content = 'devices_data'
      break

    case 'get_ddev':
      sql = `SELECT devices.presariPEbalot AS sw, devices.id, devices.rssi, devices.nr_e, devices.mac, devices.lcd, devices.pl_c, ddev.scroll, devices.nr_e_kip 
      FROM devices LEFT JOIN ddev ON devices.mac = ddev.mac`
      resp.content = 'ddev_data'
      break
    case 'delete_db_dturi':
      sql = `DELETE dturi,configs FROM dturi LEFT JOIN configs ON dturi.seria=configs.serie 
      WHERE dturi.seria IN (?)`
      resp.content = 'dturi_updated'
      break
    case 'edit_devices':
      sql =
        'UPDATE `devices` SET `model` = ?,`serie` = ?,`mif` = ?,`judet` = ?,`localitate` = ?,`strada` = ?,`magazin` = ?,`nrmag` = ?,`resp` = ?,`tel_resp` = ? WHERE  `mac` = ?'
      resp.content = 'device_updated'
      break
    case 'config_devices': // Ultima revizie  Interval zile  Interval baloti   Email service  Email Kaufland
      sql =
        'UPDATE `devices` SET `dataRevizie` = ?,`intervalRevizie` = ?,`intervalBaloti` = ?,`email_serv` = ?,`email_kauf` = ? WHERE  `mac` = ?'
      resp.content = 'device_updated'
      break
    case 'set_config': //
      sql = 'UPDATE `configs` SET `val` = ? WHERE  `id` = ?'
      resp.content = 'configs_updated'
      break

    /**
     * Handles the "get_baloti_date" message to return balot count data
     * between two dates.
     * - Verifies if two dates are passed in the message
     * - Generates a date range array from the passed dates
     * - Builds a SQL query to get balot counts for each month between the dates
     * - Also gets total balot count for the whole period
     * - Limits device results to only devices passed in the message
     */
    case 'get_baloti_date':
      resp.content = 'get_baloti_pe_luni'
      // Verificare pentru cererea "get_baloti_date"
      if (msg.data.length > 1) {
        let perioada = NdateRange(msg.data[0], msg.data[1])
        resp.perioada = []
        resp.perioada.push(msg.data[0])
        resp.perioada.push(msg.data[1])
        /**
 * Constructs a SQL query to retrieve the number of balots for each device within a specified date range.
 * The query calculates the difference in balot count for each month in the range (provided by `perioada`),
 * as well as the total difference for the entire period. It includes the device's MAC address, store number,
 * and store name. The results are limited to the devices specified in the `msg.data` array.
 *
 * The query uses a series of conditional subqueries to handle cases where balot data may not exist
 * exactly at the start or end of a month or the entire period. It falls back to the closest available
 * data point within the range when necessary.
 *
 * The final SQL statement is constructed dynamically by iterating over each month in the `perioada` array,
 * appending calculated columns for each month's balot count difference, and then adding a final column
 * for the total count difference over the entire period.
 *
 * This query is part of a larger switch-case statement that handles different database operations based
 * on the provided case key. The case "get_baloti_date" corresponds to this particular query.
 /**
  * Handles constructing SQL queries to retrieve balot count data between two dates.
  * 
  * Takes the start and end dates, generates a SQL query that calculates the balot 
  * count for each month between those dates as well as the total count across the
  * whole period.
  * 
  * Includes conditional logic in the query to handle cases where balot data may not
  * exist exactly at the start or end of a month/period. Falls back to closest data.
  * 
  * Limits query results to only devices passed in original message.
  * 
  * Returns balot count data object containing device, store info, and counts for
  * each month plus total period count.
  */
        /**
         * Handles database queries for retrieving balot count data between two dates.
         *
         * Takes in the start and end dates, constructs a SQL query to calculate the
         * balot count for each month between those dates as well as the total count.
         *
         * Query includes conditional logic to handle missing data at month start/end.
         *
         * Limits results to only devices passed in original message.
         *
         * Returns balot count data object with device, store info, and counts for
         * each month plus total period count.
         */

        sql = `SELECT devices.mac,devices.nrmag,devices.magazin`

        for (let lunaAn of perioada) {
          sql += `,\n IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '${lunaAn[1]}' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data >= '${lunaAn[1]}' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1)) -
          (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '${lunaAn[0]}' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
          (SELECT nrBalot FROM stat_baloti WHERE data > '${lunaAn[0]}' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS '${lunaAn[2]}'`
        }

        /*
        for (let lunaAn of perioada) {
          sql += `,\n COALESCE(
          COALESCE(MAX(CASE WHEN stat_baloti.data <= '${lunaAn[1]}' THEN stat_baloti.nrBalot END), 
           MIN(CASE WHEN stat_baloti.data >= '${lunaAn[1]}' THEN stat_baloti.nrBalot END)) -
          COALESCE(MAX(CASE WHEN stat_baloti.data < '${lunaAn[0]}' THEN stat_baloti.nrBalot END), 
           MIN(CASE WHEN stat_baloti.data > '${lunaAn[0]}' THEN stat_baloti.nrBalot END)),
          0
        ) AS '${lunaAn[2]}'`
        }
        // 

        sql += `,\n COALESCE(
          COALESCE(MAX(CASE WHEN stat_baloti.data <= '${msg.data[1]}' THEN stat_baloti.nrBalot END), 
           MIN(CASE WHEN stat_baloti.data >= '${msg.data[1]}' THEN stat_baloti.nrBalot END)) -
          COALESCE(MAX(CASE WHEN stat_baloti.data < '${msg.data[0]}' THEN stat_baloti.nrBalot END), 
           MIN(CASE WHEN stat_baloti.data > '${msg.data[0]}' THEN stat_baloti.nrBalot END)),
          0
        ) AS blc
            FROM devices 
            LEFT JOIN stat_baloti ON devices.mac = stat_baloti.mac AND 
            stat_baloti.data BETWEEN ? AND ?
            WHERE
                devices.mac IN (?)
            GROUP BY devices.mac ORDER BY devices.nrmag ASC;  ` //*/
        sql += `,\n(IFNULL((SELECT nrBalot FROM stat_baloti WHERE data <= '${msg.data[1]}' AND stat_baloti.mac=devices.mac ORDER BY data DESC LIMIT 1),
            (SELECT nrBalot FROM stat_baloti WHERE data >= '${msg.data[1]}' AND stat_baloti.mac=devices.mac ORDER BY data ASC LIMIT 1))) -
            (IFNULL((SELECT nrBalot FROM stat_baloti WHERE data < '${msg.data[0]}' AND devices.mac = stat_baloti.mac ORDER BY data DESC LIMIT 1),
            (SELECT nrBalot FROM stat_baloti WHERE data > '${msg.data[0]}' AND devices.mac = stat_baloti.mac ORDER BY data ASC LIMIT 1))) AS blc
                FROM devices 
                LEFT JOIN stat_baloti ON devices.mac = stat_baloti.mac AND 
                stat_baloti.data BETWEEN ? AND ?
                WHERE
                    devices.mac IN (?)
                GROUP BY devices.mac  ORDER BY devices.nrmag ASC;`
      } else return
      break

    case 'get_detali_erori':
      resp.content = 'detali_erori_mac'
      // Verificare pentru cererea "get_detali_erori"
      if (msg.data.length > 1) {
        resp.perioada = []
        resp.perioada.push(msg.data[0])
        resp.perioada.push(msg.data[1])
        resp.mac = msg.data[2]
        sql = `SELECT 
        se.id AS id,
        se.data AS data,
        se.durata AS durata,
        se.activa AS activa,
        se.eroare AS eroare,
        de.descriere AS descriere,
        de.lcd AS lcd,
        IFNULL(a.data, '') AS data_alerta,
        IFNULL(a.mail_catre, '') AS mail_catre,
        IFNULL(a.stadiu, 0) AS stadiu,
        se.mac AS mac,
        CASE 
            WHEN se.eroare < 11 THEN 'Minora'
            ELSE 'Majora'
        END AS tip_eroare,
        DATE_ADD(se.data, INTERVAL TIME_TO_SEC(se.durata) SECOND) AS data_ora_rezolvare
    FROM 
        stat_erori se
    LEFT JOIN 
        def_erori de ON se.eroare = de.id
    LEFT JOIN 
        avertizari a ON se.id = a.id_eroare
    WHERE 
        se.data BETWEEN ? AND ?
        AND se.mac = ?
        ORDER BY se.data ASC`
      } else return
      break

    case 'get_detali_baloti':
      resp.content = 'detali_baloti_mac'
      // Verificare pentru cererea "get_baloti_date"
      if (msg.data.length > 1) {
        resp.perioada = []
        resp.perioada.push(msg.data[0])
        resp.perioada.push(msg.data[1])
        resp.mac = msg.data[2]
        sql = `SELECT 
          ROW_NUMBER() OVER (ORDER BY sb.data) AS id,
          sb.nrBalot AS nrBalot,
          sb.nr_p AS nr_p,
          sb.data AS data
      FROM 
          stat_baloti sb
      WHERE 
          sb.data BETWEEN ? AND ?
          AND sb.mac = ?
          ORDER BY sb.data ASC`
      } else return
      break
    case 'get_detali_conexiune':
      resp.content = 'detali_conexiune_mac'
      // Verificare pentru cererea "get_detali_conexiune"
      if (msg.data.length > 1) {
        resp.perioada = []
        resp.perioada.push(msg.data[0])
        resp.perioada.push(msg.data[1])
        resp.mac = msg.data[2]
        sql = `SELECT
          ROW_NUMBER() OVER (ORDER BY sc.data_offline) AS id,
          sc.data_offline AS data_offline,
          sc.data_online AS data_online,
          IFNULL(sc.durata, '') AS durata
          FROM stat_conexiuni sc
          WHERE sc.data_offline BETWEEN ? AND ?
          AND sc.mac = ?
          ORDER BY sc.data_offline ASC`
      } else return
      break

    default:
      console.log(`Unknown DB command ${msg.command}`)
      return
      break
  }
  //  console.log('SQL=', sql);
  //  console.time('queryTime')
  pool.query(sql, msg.data, function (err, result, fields) {
    // Stop the timer and log the time taken for the query
    if (DEBUG) {
      if (
        msg.command == 'get_baloti_date' ||
        msg.command == 'get_devices' ||
        resp.content == 'detali_baloti_mac' ||
        resp.content == 'devices_data'
      )
        console.log('SQL=\n', this.sql)
      //      console.timeEnd('queryTime')
      //    console.timeEnd('TotalRequestTime')
    }
    if (err) {
      console.log('ERROR at SQL=', this.sql)
      console.error(err)
      if (err.errno == 1062)
        callback({
          for: msg.command,
          content: 'error',
          Error: err.sqlMessage,
          errno: err.errno
        })
      return
      //    console.log("DB Result: " , result);
    } else {
      resp.data = result
      //      console.log('DB Result: ', resp)
      callback(resp)
    }
  })
}

if (!Object.prototype.forEach) {
  Object.defineProperty(Object.prototype, 'forEach', {
    value: function (callback, thisArg) {
      if (this == null) {
        throw new TypeError('Not an object')
      }
      thisArg = thisArg || window
      for (var key in this) {
        if (this.hasOwnProperty(key)) {
          callback.call(thisArg, this[key], key, this)
        }
      }
    }
  })
}

module.exports.request_db = request_db
module.exports.pool = pool
