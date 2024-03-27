page_name = 'service'

var $table = $('#dt_tabel')

$table.floatThead(floatParam) //*/

function ws_msg (received) {
  switch (received.content) {
    case 'error':
      parse_error(received)
      break
    case 'cfg_updated':
    case 'cfg_inserted':
      cfg_updated()
      break
    case 'devices_data':
      if (received.data.length > -1) {
        $('#dt_tabel tbody').empty()
        array_to_devices(received.data)
        $('#sel_data_msg').html('')
      } else {
        $('#sel_data_msg').html('NU exista configuri!')
        setTimeout(function () {
          $('#sel_data_msg').html('')
        }, 5000)
      }
      break
    default:
      if ('lcd' in received) update_mac_lcd(received)
      else if ('rssi' in received) update_mac_rssi(received)
      else if ('R_sw' in received) update_mac_nrb(received)
      else console.log('Unknown data received: ', received)
  }
}
const nr_col = 9

function update_mac_pl_c (data) {
  $('tr:has(td:contains("' + data.mac + '"))')
    .find(`td:eq(${nr_col})`)
    .html(data.pl_c)
  $('tr:has(td:contains("' + data.mac + '"))')
    .find(`td:eq(${nr_col + 1})`)
    .html(data.l_pl_c)
}
function update_mac_nrb (data) {
  console.log(data)
  $('tr:has(td:contains("' + data.mac + '"))')
    .find(`td:eq(${nr_col + 2})`)
    .html(data.R_sw)
}
function update_mac_lcd (data) {
  if (data.status > 0)
    $('tr[data-mac="' + data.mac + '"]')
      .find(`td:eq(${nr_col - 2})`)
      .css('background-color', 'yellow')
  $('tr:has(td:contains("' + data.mac + '"))')
    .find(`td:eq(${nr_col + 4})`)
    .html('<pre>' + data.lcd + '</pre>')
}
function update_mac_rssi (data) {
  $('tr:has(td:contains("' + data.mac + '"))')
    .find(`td:eq(${nr_col + 5})`)
    .html(data.rssi + ' dBm')
}

function insert_cfg () {
  var ret = false
  $('form#cfg_imput_form :input').each(function (index) {
    if (index < 2 && $(this).val() == '') {
      $(this).effect('pulsate', {}, 500)
      ret = true
    }
  })
  if (ret) return
  ws.send(
    JSON.stringify({
      command: 'push_to_db_cfg',
      data: [[$('#select-dt').val(), $('#select-ch').val()]]
    })
  )
}

function array_to_dt (data) {
  //Se populeaza select
  data.forEach(function (e, i) {
    $('#select-dt').append(
      $('<option></option>')
        .val(e.seria)
        .text(e.model + '/' + e.seria.slice(-4) + '/' + e.masa)
    )
  })
}

function command_device (mac, command) {
  ws.send(
    JSON.stringify({
      mqtt_command: command,
      data: mac
    })
  )
}

function update_device (mac, field, data) {
  ws.send(
    JSON.stringify({
      command: 'update_device',
      field: field,
      data: [data, mac]
    })
  )
}

//$('.ck_vizibil').on('click', ck_update)

$(document).on('click', '.ck_vizibil', function () {
    ck_update.call(this)
})
  
function ck_update () {
    //luam mac din coloana a 2-a 
  var mac = $(this).closest('tr').find('td:eq(1)').text();
  var vizibil = $(this).is(':checked') ? 1 : 0
console.log(mac, vizibil)
  update_device(mac, 'vizibil', vizibil)
}

function insert_row_devices (date, dataset) {
  var adate = [
    'idt',
    'mac',
    'comenzi',
    'sw',
    'localitate',
    'magazin',
    'nrmag',
    'status',
    'vizibil',
    'commands',
    'fscomands',
    'nrBaloti',
    'blc',
    'lcd',
    'rssi'
  ]
  //    console.log(date)
  //  console.log(dataset)

  var row = '<tr class="ns" data-chid="' + date.id + '">'

  for (j = 0; j < adate.length; j++) {
    row += '<td data-filtru="' + dataset[j] + '">'
    if (adate[j] == 'lcd') {
      if (date[adate[j]] == 'OFFLINE') {
        date[adate[j]] +=
          '\n' +
          new Date(date.lastUPDATE.slice(0, -1))
            .toLocaleDateString('ro-RO')
            .substring(0, 5) +
          ' ' +
          new Date(date.lastUPDATE.slice(0, -1))
            .toLocaleTimeString('ro-RO')
            .substring(0, 10)
      }
      row += '<pre>' + date[adate[j]] + '</pre></td>'
    } else if (adate[j] == 'rssi') {
      row += date[adate[j]] + ' dBm</td>'
    } else if (adate[j] == 'vizibil') {
      // adaugam vizibilitatea cu posibilitatea de schimbare la apasare
      row += date[adate[j]]
        ? `<input type="checkbox" checked class="ck_vizibil" />`
        : `<input type="checkbox" class="ck_vizibil" />`
    } else if (adate[j] == 'comenzi') {
      // punem buntone pentru update, reset, simulate
      row += `<button class="btn btn-warning btn-sm" onclick="command_device('${date.mac}','update')">Update</button>`
      row += `<button class="btn btn-danger btn-sm" onclick="command_device('${date.mac}','reset')">Reset</button>`
      row += `<button class="btn btn-info btn-sm" onclick="command_device('${date.mac}','simulate')">Simulate</button>`
    } else if (adate[j] == 'commands') {
      // punem buntone pentru update, reset, simulate
      row += `<button class="btn btn-warning btn-sm" onclick="command_device('${date.mac}','aflash')">AUpdate</button>`
      row += `<button class="btn btn-danger btn-sm" onclick="command_device('${date.mac}','areset')">AReset</button>`
      row += `<button class="btn btn-info btn-sm" onclick="command_device('${date.mac}','stop')">Stop</button>`
    } else if (adate[j] == 'fscomands') {
      // punem buntone pentru update, reset, simulate
      row += `<button class="btn btn-warning btn-sm" onclick="command_device('${date.mac}','fs_update')">FSUpdate</button>`
      row += `<button class="btn btn-info btn-sm" onclick="command_device('${date.mac}','fdir:')">FSdir</button>`
      row += `<button class="btn btn-info btn-sm" onclick="window.location.href = 'devmgr?mac=' + encodeURIComponent('${date.mac}');">Detalii</button>`;
    } else row += date[adate[j]] + '</td>'
  }
  row += '</tr>'
  $('#dt_tabel tbody').prepend(row)
  //    console.log(row);
}

function array_to_devices (inregistrari) {
  //Se populeaza tabelul din procesare cu datele venite de la server
  var dataset = [
    'fid',
    'fmac',
    'fmodel',
    'fvsw',
    'flocalitate',
    'fnumemag',
    'fnumarmag',
    'fsatus',
    'fsatusr',
    'fgrinc',
    'fgre',
    'fnrb',
    'fnrblc',
    'flcd',
    'frssi'
  ]
  console.log(inregistrari)
  $('#dt_tabel tbody').empty()
  for (var i = 0; i < inregistrari.length; i++) {
    inregistrari[i].idt = inregistrari.length - i
    insert_row_devices(inregistrari[i], dataset)
  }
  $('#dt_tabel tbody tr').chess_table()
}
