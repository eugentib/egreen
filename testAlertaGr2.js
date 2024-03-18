var mysql = require('mysql2')

var connection_config = require('./connection_config.json')
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

//Insereaza in db multiple erori care sa declaseze alerta gr2
async function insereazaErori (mac) {
  let sql = `INSERT INTO stat_erori (mac, nr_balot, eroare, data, durata, activa) VALUES (?, (SELECT nrBaloti FROM devices WHERE mac=?), 9, DATE_SUB(NOW(), INTERVAL ? MINUTE), SEC_TO_TIME (?*60), 0)`

  let params = [
    [mac, mac, 100, 16],
    [mac, mac, 75, 16],
    [mac, mac, 50, 16],
    [mac, mac, 25, 16]
  ]

  await Promise.all(params.map(param => query(sql, param)))
}
// Sterge din db alertele gr2 din ultimele 24 de ore pentru mac
async function stergeAlerteGr2Vechi (mac) {
  let sql =
    'DELETE FROM avertizari WHERE mac = ? AND grad = 2 AND data >= DATE_SUB(NOW(), INTERVAL 1 DAY)'
  await query(sql, [mac])
}

// Sterge alerte si inseraza erori
async function declanseazaAlertaGr2 (mac) {
  await stergeAlerteGr2Vechi(mac)
  await insereazaErori(mac)
}

declanseazaAlertaGr2('80646FABCA2F')
  .then(() => {
    console.log(`Alerta GR2 declansata pentru mac 80646FABCA2F`)
  })
  .catch(err => {
    console.error(err)
  })
