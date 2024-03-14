raportari = true
page_name = 'raportari'

$('#raport_lunar').on('click', get_checked_dts)
$('#incarca_raportari').on('click', get_raport_data)

$('#tabelr tbody').on('click', 'td.get_detali', get_detali)
$('#tabelr tbody').on('click', 'td.close_detali', close_detali)

$('#exporta_inregistrari').on('click', function () {
  var tabelHeader = []
  $('.floatThead-container thead tr').each(function () {
    var row = []
    $(this)
      .find('th:not(:nth-child(-n+2))')
      .each(function () {
        var headerCell = $(this)
        var cellContent
        var inputElement = headerCell.find('input, select')
        if (inputElement.length > 0) {
          cellContent = inputElement.val()
        } else {
          cellContent = headerCell.text().trim()
        }
        row.push(cellContent)
      })
    tabelHeader.push(row)
  })

  var tabelBody = []
  $('#tabelr tbody tr:visible').each(function () {
    var row = []
    $(this)
      .find('td:not(:nth-child(-n+2))')
      .each(function () {
        row.push($(this).text().trim())
      })
    tabelBody.push(row)
  })

  var wb = XLSX.utils.book_new()
  var worksheet = XLSX.utils.json_to_sheet([].concat(tabelHeader, tabelBody), {
    skipHeader: true
  })

  // Setăm lățimea coloanelor la aproximativ 10 unități de caractere
  var colWidth = 10
  var range = XLSX.utils.decode_range(worksheet['!ref'])
  for (var col = range.s.c; col <= range.e.c; col++) {
    var colLetter = XLSX.utils.encode_col(col)
    worksheet['!cols'] = worksheet['!cols'] || []
    worksheet['!cols'][col] = { wch: colWidth }
  }

  XLSX.utils.book_append_sheet(wb, worksheet, 'Foaie1')
  var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })

  function s2ab (s) {
    var buf = new ArrayBuffer(s.length)
    var view = new Uint8Array(buf)
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff
    return buf
  }

  saveAs(
    new Blob([s2ab(wbout)], { type: 'application/octet-stream' }),
    'tabel.xlsx'
  )
})

$('#printeaza_inregistrari').on('click', function () {
  // Cod pentru printarea înregistrărilor
  var tabelHeader = '<thead>'
  $('.floatThead-container thead tr').each(function () {
    var row = "<tr style='border: 1px solid #ccc;'>"
    $(this)
      .find('th:not(:nth-child(-n+2))')
      .each(function () {
        var headerCell = $(this)
        var cellContent
        var inputElement = headerCell.find('input, select')
        if (inputElement.length > 0) {
          cellContent =
            "<div style='border: 1px solid #ccc; padding: 5px;'>" +
            inputElement.val() +
            '</div>'
        } else {
          cellContent = headerCell.html()
        }
        row += '<th>' + cellContent + '</th>'
      })
    row += '</tr>'
    tabelHeader += row
  })
  tabelHeader += '</thead>'

  var tabelBody = '<tbody>'
  $('#tabelr tbody tr:visible').each(function () {
    var row = $(this)
    var cols = ''
    row.find('td:not(:nth-child(-n+2))').each(function () {
      cols += '<td>' + $(this).html() + '</td>'
    })
    tabelBody += '<tr>' + cols + '</tr>'
  })
  tabelBody += '</tbody>'

  var printContents = '<table>' + tabelHeader + tabelBody + '</table>'
  var originalContents = document.body.innerHTML

  // Adăugăm un stil CSS pentru a mări spațiile între coloane
  var printStyle = '<style>table td, table th { padding: 5px 10px; }</style>'

  var printWindow = window.open('', '', 'height=800,width=800')
  printWindow.document.write(
    '<html><head><title>' +
      document.title +
      '</title>' +
      printStyle +
      '</head><body>' +
      printContents +
      '</body></html>'
  )
  printWindow.document.close()
  printWindow.print()
  printWindow.close()
})

//Call function get_detali_baloti when user clicks on a checkbox with class ckboxBaloti and the checbox is checked
// and hides the details when the chebox is unchecked
$('body').on('click', '.ckboxBaloti', function () {
  let mac = $(this).attr('id').split('_')[1]
  if ($(this).is(':checked')) {
    let start = $(this).parent().data('start')
    let end = $(this).parent().data('end')
    get_detali_baloti(start, end, mac)
  } else {
    hide_detali_baloti(mac)
  }
})
//call function get_detali_erori when user clicks on a checkbox with class ckboxErori and the checbox is checked
// and hides the details when the chebox is unchecked
$('body').on('click', '.ckboxErori', function () {
  let mac = $(this).attr('id').split('_')[1]
  if ($(this).is(':checked')) {
    let start = $(this).parent().data('start')
    let end = $(this).parent().data('end')
    get_detali_erori(start, end, mac)
  } else {
    hide_detali_erori(mac)
  }
})
//call function get_detali_conexiune when user clicks on a checkbox with class ckboxConexiune and the checbox
// is checked and hides the details when the chebox is unchecked
$('body').on('click', '.ckboxConexiune', function () {
  let mac = $(this).attr('id').split('_')[1]
  if ($(this).is(':checked')) {
    let start = $(this).parent().data('start')
    let end = $(this).parent().data('end')
    get_detali_conexiune(start, end, mac)
  } else {
    hide_detali_conexiune(mac)
  }
})

var my_body

function get_detali_baloti (start, end, mac) {
  ws.send(
    JSON.stringify({
      command: 'get_detali_baloti',
      data: [start, end, mac]
    })
  )
}

function get_detali_erori (start, end, mac) {
  ws.send(
    JSON.stringify({
      command: 'get_detali_erori',
      data: [start, end, mac]
    })
  )
}

function get_detali_conexiune (start, end, mac) {
  ws.send(
    JSON.stringify({
      command: 'get_detali_conexiune',
      data: [start, end, mac]
    })
  )
}

function hide_detali_baloti (mac) {
  $('#' + mac + '_detali_baloti').html('')
}
function hide_detali_erori (mac) {
  $('#' + mac + '_detali_erori').html('')
}
function hide_detali_conexiune (mac) {
  $('#' + mac + '_detali_conexiune').html('')
}

function close_detali () {
  $(this).parent().find('td:eq(1)').html('<i class="fa fa-search-plus">')
  $(this).parent().find('td:eq(1)').toggleClass('close_detali get_detali')
  $(this).parent().next().remove()
  console.log($(this).parent().attr('id'))
  $('.' + $(this).parent().attr('id') + '_detali').remove()
  $('.sort').on('click', sort)
}

function get_detali () {
  let mac = $(this).closest('tr').attr('id')

  let start = datepicker2mysqldate('#datepicker')
  let end = datepicker2mysqldate('#datepicker2')
  console.log(mac)
  show_detali(start, end, mac)
  //  get_detali_baloti(start, end, mac)
}

function get_raport_data () {
  $('.check_all').prop('checked', false)
  var start = datepicker2mysqldate('#datepicker')
  var end = datepicker2mysqldate('#datepicker2')
  console.log(end)
  ws.send(
    JSON.stringify({ command: 'get_devices', data: [start, end, start, end] })
  )
}

function ws_msg (received) {
  switch (received.content) {
    case 'error':
      parse_error(received)
      break

    case 'detali_erori_mac':
      if (received.data) {
        $(`#${received.mac}_detali_erori`).html(
          parse_detali_err(received.data, received.perioada, received.mac)
        )
        add_even_odd('#' + received.mac + `_detali .taberori_${received.mac}`)
        $(`#${received.mac}_detali_erori`).find('.sort').click(sort)
      }
      break
    case 'detali_baloti_mac':
      if (received.data) {
        $(`#${received.mac}_detali_baloti`).html(
          parse_detali_baloti(received.data, received.perioada, received.mac)
        )
        add_even_odd(`#${received.mac}_detali .tabbaoti_${received.mac}`)
        $(`#${received.mac}_detali_baloti`).find('.sort').click(sort)
      }
      break
    case 'detali_conexiune_mac':
      if (received.data) {
        $(`#${received.mac}_detali_conexiune`).html(
          parse_detali_conexiune(received.data, received.perioada, received.mac)
        )
        add_even_odd(`#${received.mac}_detali .tabconexiune_${received.mac}`)
        $(`#${received.mac}_detali_conexiune`).find('.sort').click(sort)
      }
      break
    case 'devices_data':
      if (received.data.length > -1) {
        $('#tabelr tbody').empty()
        array_to_devices(received.data)
        $('#sel_data_msg').html('')
      }
      break
    case 'get_baloti_pe_luni':
      if (received.data.length > -1) {
        //                $('#tabelr tbody').empty();
        datePeLuna(received.data, received.perioada)
        //              $("#sel_data_msg").html("");
      }
      break
    default:
      if (
        'lcd' in received ||
        'rssi' in received ||
        'nrb' in received ||
        'pl_c' in received
      );
      else if ('responsabil' in received) {
        //date live
        update_responsabil(received)
      } else {
        console.log('Unknown data received: ')
        console.log(received)
      }
  }
}

const nr_col = 12

function selMacCol (data) {
  return 'tr[id="' + data.mac + '"]'
}

function update_responsabil (data) {
  $(selMacCol(data)).find(`td:eq(${nr_col})`).html(data.responsabil)
}

var od

function displayGeneratingDialog () {
  const $dialog = $('<div>').html('Se genereaza raport...')

  $dialog.dialog({
    title: 'Generare raport',
    modal: true,
    open () {
      $(this).parent().find('.ui-dialog-titlebar-close').hide()
    }
  })
  return $dialog
}

function closeDialog ($dialog) {
  $dialog.dialog('close')
}

function datePeLuna (date, perioada) {
  closeDialog(od)
  console.log(date)
  console.log(perioada)
  let msg = `<table id="tabluni" class="tabluni table table-bordered table-dark">
    <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;">
        <tr class="text-center">
        <th class="sort">Nr. Crt.</th>
        <th class="sort">Numar</th>
        <th class="sort">Nume magazin</th>`
  var total = {}
  total.general = 0
  for (let property in date[0]) {
    console.log(`${property}: ${date[0][property]}`)
    if (
      property != 'mac' &&
      property != 'nrmag' &&
      property != 'magazin' &&
      property != 'blc'
    ) {
      msg += `<th class="sort">${property}</th>`
      total[property] = 0
    }
  }
  msg += `<th class="sort">Total</th>
    </tr>
    </thead>
    <tbody>`
  for (let index in date) {
    msg += `<tr><td>${parseInt(index) + 1}</td>`
    for (let property in date[index]) {
      if (property != 'mac') {
        msg += `<td>${date[index][property] || 0}</td>`
        total[property] += parseInt(date[index][property]) || 0
        if (property == 'blc')
          total.general += parseInt(date[index][property]) || 0
      }
    }
    msg += `</tr>`
  }

  msg += `<tr style="color: rgb(235,242,250);background-color: #444444!important;" class="nosort"><td> </td><td> </td><td>Total</td>`
  for (let property in date[0]) {
    console.log(`${property}: ${date[0][property]}`)
    if (
      property != 'mac' &&
      property != 'nrmag' &&
      property != 'magazin' &&
      property != 'blc'
    ) {
      msg += `<td>${total[property]}</td>`
    }
  }
  msg += `<td>${total.general}</td></tr></tbody></table>`
  let titlu =`Raport lunar pentru perioada de la ${mysql2ro(
    perioada[0]
  )} până la ${mysql2ro(
    perioada[1]
  )} generat la ${new Date().toLocaleString('ro-RO')}`

  $('<div class="rapo" style="text-align:center;"></div>')
    .html(msg)
    .dialog({
      open: function (event, ui) {
        console.log('avem dialog')
        add_even_odd('#tabluni')
        $('.sort').click(sort)
      },
      title: titlu,
      resizable: true,
      modal: true,
      width: 1100,
      buttons: {
        Print: {
          text: 'Print',
          click: function () {
            const printContents = `<h3>${titlu}</h3>${
              document.getElementById('tabluni').outerHTML
            }`
            // Adăugăm un stil CSS pentru a mări spațiile între coloane și alinia celulele pe centru
            var printStyle =
              '<style>table td, table th { padding: 5px 10px; text-align: center; } table td:nth-child(3), table th:nth-child(3) { text-align: left; }</style>'
            var printWindow = window.open('', '', 'height=800,width=800')
            printWindow.document.write(
              '<html><head><title>' +
                document.title +
                '</title>' +
                printStyle +
                '</head><body>' +
                printContents +
                '</body></html>'
            )
            printWindow.document.close()
            printWindow.print()
            printWindow.close()
          }
        },
        Export: {
          class: 'leftButton',
          text: 'Export',
          click: function () {
            // Adauga cod pentru exportul tabelului folosind functia @#exportaInregistrari
            var tabel = $('#tabluni')
            var tabelClone = tabel.clone()
            exportaInregistrari(tabel, tabelClone, titlu)          
          }
        },
        Anulează: {
          text: 'Anulează',
          click: function () {
            $(this).dialog('destroy')
          }
        }
      }
    })
}

var $table = $('#tabelr')

floatParam.top= 94

$table.floatThead(floatParam) //*/

function insert_row_raportari (date, dataset) {
  var adate = [
    'idt',
    'nrmag',
    'magazin',
    'localitate',
    'model',
    'devsw',
    'serie',
    'downtime',
    'minore',
    'majore',
    'responsabil',
    'blc'
  ]

  var icon = '<i class="fa fa-search-plus"></i>'

  var row =
    '<tr class="ns" id="' +
    date.mac +
    '"><td data-filtru="fck"><input class="ckbox" type="checkbox"></td><td data-filtru="lens"  class="get_detali">' +
    icon +
    '</td>'

  for (j = 0; j < adate.length; j++)
    row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + '</td>'
  row += '</tr>'
  $('#tabelr tbody').prepend(row)
  //    $('#tabelr tbody').append(row);
}

function array_to_devices (inregistrari) {
  //Se populeaza tabelul din procesare cu datele venite de la server
  var dataset = [
    'fid',
    'fnrmag',
    'fnume',
    'flocalitate',
    'fmodel',
    'fvsw',
    'fserie',
    'fdownt',
    'femi',
    'fema',
    'fresp',
    'fnrb'
  ]
  console.log(inregistrari)
  $('#dt_tabel tbody').empty()
  for (var i = 0; i < inregistrari.length; i++) {
    inregistrari[i].idt = inregistrari.length - i
    insert_row_raportari(inregistrari[i], dataset)
  }
  $('#tabelr tbody tr').chess_table()
  //    $("#tabelr tbody").on("click", "td.get_detali", get_detali);
}

$.urlParam = function (name) {
  var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
    window.location.href
  )

  return results ? results[1] : 0
}

var quick_view = $.urlParam('quick_view')

if (quick_view.length > 0) {
  $('nav').hide()
  $('.my_col').hide()
  setTimeout(function () {
    $('.get_detali').trigger('click')
  }, 300)
}

function get_raport (arr) {
  let start = datepicker2mysqldate('#datepicker')
  let end = datepicker2mysqldate('#datepicker2')

  ws.send(
    JSON.stringify({
      command: 'get_baloti_date',
      data: [start, end, arr]
    })
  )
}

const getCheckedDeviceIds = () => {
  const checkedIds = $('#tabelr .ckbox:checkbox:checked')
    .map(function () {
      return $(this).closest('tr').attr('id')
    })
    .get()

  if (checkedIds.length === 0) {
    return displayNoDevicesSelectedDialog()
  }

  getReport(checkedIds)
}

const displayNoDevicesSelectedDialog = () => {
  const message =
    'Selectati unul sau mai multe echipamente pentru raport lunar!'

  $('<div style="text-align:center;"></div>')
    .html(message)
    .dialog({
      title: 'Atentie!',
      resizable: false,
      modal: true,
      width: 500,
      buttons: {
        Anulează: function () {
          $(this).dialog('close')
        }
      }
    })
}

function get_checked_dts () {
  arr = []
  $('#tabelr .ckbox:checkbox:checked').each((i, e) => {
    arr.push($(e).closest('tr').attr('id'))
  })

  if (arr.length > 0) {
    od = displayGeneratingDialog()
    get_raport(arr)
  } else {
    var msg = 'Selectati unul sau mai multe echipamente pentru raport lunar!'
    $('<div style="text-align:center;"></div>')
      .html(msg)
      .dialog({
        title: 'Atentie!',
        resizable: false,
        modal: true,
        width: 500,
        buttons: {
          Anulează: function () {
            $(this).dialog('close')
          }
        }
      })
    return
  }
}

function show_detali (start, end, mac) {
  //     Se afiseaza detali in linea urmatoare fata de codul de sac
  var row = $('#' + mac)

  //  console.log(row, date)
  //  console.log('Deschide row')
  //  console.log(row)
  $('.sort').off('click')
  $(row).find('td:eq(1)').html('<i class="fa fa-search-minus">')
  $(row).find('td:eq(1)').toggleClass('get_detali close_detali')
  $('#' + mac + '_detali').remove()
  var colsp = 13
  row.after(`<tr class='trdetali' id='${mac}_detali'><td style='padding-left: 10px;padding-right: 5px;border: none;text-align: left;vertical-align: top;' colspan='3' data-start='${start}' data-end='${end}'>
  <input class="ckboxBaloti" id="ckboxBaloti_${mac}" type="checkbox"> BALOTI<br>
  <input class="ckboxErori" id="ckboxErori_${mac}" type="checkbox"> ERORI<br>
  <input class="ckboxConexiune" id="ckboxConexiune_${mac}" type="checkbox"> OFFLINE<br>
  </td>
    <td style='padding-left: 9px;padding-right: 40px;border: none;' colspan='${colsp}' align='center'>
    <div id="${mac}_detali_baloti" style="text-align:center;"></div>
    <div id="${mac}_detali_erori" style="text-align:center;"></div>
    <div id="${mac}_detali_conexiune" style="text-align:center;"></div>
    </td></tr>`)
}

function parse_detali_err (date, perioada, mac) {
  //console.log(date)
  //  console.log(perioada)
  let msg = `<table id="taberori_${mac}" class="taberori_${mac}" style="width: 100%; margin-bottom: 1rem;">
    <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;">
    <tr class="text-center">
    <th class="nosort" colspan="8">ERORI si EMAIL-uri transmise in perioada de la ${mysql2ro(
      perioada[0]
    )} până la ${mysql2ro(perioada[1])}</th>
    ${buton_print}
    </tr>
    <tr class="text-center">
    <th class="sort">Numar</th>
    <th class="sort">Eroare</th>
    <th class="sort">Tip eroare</th>
    <th class="sort">Data si ora aparitie</th>
    <th class="sort">Data si ora remediere</th>
    <th class="sort">Durata eroare</th>
    <th class="sort">Email transmis</th>
    <th class="sort">Remediere conform manual</th>
    ${buton_export}
    </tr>
    </thead>
    <tbody>`
  let date_index = [
    'id',
    'lcd',
    'tip_eroare',
    'data',
    'data_ora_rezolvare',
    'durata',
    'mail_catre',
    'descriere'
  ]
  for (let index in date) {
    msg += `<tr>`
    if (date[index].activa == 1) {
      date[index].data_ora_rezolvare = ' '
      date[index].durata = ''
    }
    for (let property in date_index) {
      if (property != 3 && property != 4)
        msg += `<td>${date[index][date_index[property]]}</td>`
      else msg += `<td>${mysql2ro(date[index][date_index[property]])}</td>`
    }
    msg += `</tr>`
  }

  msg += `</tbody></table>`
  return msg
}

function parse_detali_baloti (date, perioada, mac) {
  console.log(date)
  //  console.log(perioada)
  let msg = `<table id="tabbaoti_${mac}" class="tabbaoti_${mac}" style="width: 80%; margin-bottom: 1rem;">
    <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;">
    <tr class="text-center">
    <th class="nosort" colspan="4">BALOTI finalizati in perioada de la ${mysql2ro(
      perioada[0]
    )} până la ${mysql2ro(perioada[1])} </th>
    ${buton_print}
    </tr>
    <tr class="text-center">
    <th class="sort">Nr. Crt.</th>
    <th class="sort">Numar balot</th>
    <th class="sort">Nr. presari</th>
    <th class="sort">Data si ora efectuare</th>
    ${buton_export}
    </tr>
    </thead>
    <tbody>`
  let date_index = ['id', 'nrBalot', 'nr_p', 'data']
  for (let index in date) {
    msg += `<tr>`
    for (let property in date_index) {
      if (property != 3) msg += `<td>${date[index][date_index[property]]}</td>`
      else msg += `<td>${mysql2ro(date[index][date_index[property]])}</td>`
    }
    msg += `</tr>`
  }

  msg += `</tbody></table>`
  return msg
}

function parse_detali_conexiune (date, perioada, mac) {
  console.log(date)
  //  console.log(perioada)
  let msg = `<table id="tabconexiune_${mac}" class="tabconexiune_${mac}" style="width: 80%; margin-bottom: 1rem;"">
    <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;">
    <tr class="text-center">
    <th class="nosort" colspan="4">CONEXIUNI pierdute in perioada de la ${mysql2ro(
      perioada[0]
    )} până la ${mysql2ro(perioada[1])} </th>
    ${buton_print}
    </tr>
    <tr class="text-center">
    <th class="sort">Nr. Crt.</th>
    <th class="sort">Data si ora pierdere</th>
    <th class="sort">Data si ora restabilire</th>
    <th class="sort">Durata offline</th>
    ${buton_export}
    </tr>
    </thead>
    <tbody>`
  let date_index = ['id', 'data_offline', 'data_online', 'durata']
  for (let index in date) {
    msg += `<tr>`
    for (let property in date_index) {
      if (property != 1 && property != 2)
        msg += `<td>${date[index][date_index[property]]}</td>`
      else msg += `<td>${mysql2ro(date[index][date_index[property]])}</td>`
    }
    msg += `</tr>`
  }
  msg += `</tbody></table>`
  return msg
}

var buton_print = `<th class="nosort .no-print" style="background-color: #ebf2fa;border: none; width: 8rem;">
  <button class="btn btn-primary float-right printeaza_inregistrari" type="button" style="color: rgb(4,4,4);height: 30px;width: 98px;">
    <i class="fa fa-print" style="font-size: 20px;color: rgb(0,0,0);margin-top: 0px;">
    </i>   Print
  </button>
</th>`
var buton_export = `<th class="nosort no-print" style="background-color: #ebf2fa;border: none;">
  <button class="btn btn-primary float-right exporta_inregistrari" type="button" style="color: rgb(0,0,0);height: 30px;">
    <i class="fa fa-file-excel-o" style="font-size: 20px;margin-top: 0px;">
    </i>   Export
  </button>
</th>`

/**
 * Prints the table to a new window for the user to print.
 *
 * Clones the table, removes any elements not needed for printing,
 * extracts the table type and MAC from the id, gets the store name and number,
 * opens a print window, writes the HTML and styles, appends the table,
 * prints the window, then closes it.
 */
$(document).on('click', '.printeaza_inregistrari', function () {
  var tabel = $(this).closest('table')
  var tabelClone = tabel.clone()

  // Eliminăm elementele care nu trebuie printate
  tabelClone.find('.printeaza_inregistrari').remove()
  tabelClone.find('.no-print').remove()
  tabelClone.find('table').remove() // Eliminăm tabelele secundare

  // Extragem tipul tabelului și MAC-ul din id-ul sau clasa tabelului
  var tabelId = tabel.attr('id') || tabel.attr('class')
  var tabelTip = 'Necunoscut'
  var tabelMac = 'Necunoscut'
  if (tabelId) {
    var tabelParts = tabelId.split('_')
    tabelTip = tabelParts[0].replace('tab', '')
    tabelMac = tabelParts[1]
  }

  // Extragem numele magazinului și numărul magazinului din rândul cu id=mac
  var numeMagazin = $('#' + tabelMac + ' td:nth-child(5)')
    .text()
    .trim()
  var nrMagazin = $('#' + tabelMac + ' td:nth-child(4)')
    .text()
    .trim()

  // Creăm un element temporar pentru a printa tabelul
  var printWindow = window.open('', '', 'height=800,width=800')
  var printDoc = printWindow.document
  printDoc.open()
  printDoc.write('<!DOCTYPE html><html><head><title>Print Tabel</title>')
  printDoc.write('<style>')
  printDoc.write('body { font-family: Arial, sans-serif; }')
  printDoc.write('table { border-collapse: collapse; width: 100%; }')
  printDoc.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: center;}')
  printDoc.write(
    'th { background-color: #f2f2f2; font-weight: bold; text-align: left; }'
  )
  printDoc.write('thead tr { background-color: #dddddd; }')
  printDoc.write('</style>')
  printDoc.write('</head><body>')
  printDoc.write(
    '<h2>Tabel ' +
      tabelTip +
      ' pentru magazinul ' +
      numeMagazin +
      ' nr ' +
      nrMagazin +
      '</h2>'
  )

  // Creăm elementele DOM pentru tabel și le atașăm la fereastra temporară
  var tabelElement = printDoc.createElement('table')
  tabelElement.innerHTML = tabelClone.html()
  printDoc.body.appendChild(tabelElement)

  printDoc.write('</body></html>')
  printDoc.close()
  printWindow.print()
  printWindow.close()
})

function exportaInregistrari (tabel, tabelClone, titluFisier) {
  // Eliminăm elementele care nu trebuie exportate
  tabelClone.find('.printeaza_inregistrari').remove()
  tabelClone.find('.no-print').remove()
  tabelClone.find('.exporta_inregistrari').remove() // Eliminăm butonul de export

  // Extragem tipul tabelului și MAC-ul din id-ul sau clasa tabelului
  var tabelId = tabel.attr('id') || tabel.attr('class')
  var tabelTip = 'Necunoscut'
  var tabelMac = 'Necunoscut'
  if (tabelId) {
    var tabelParts = tabelId.split('_')
    tabelTip = tabelParts[0].replace('tab', '')
    tabelMac = tabelParts[1]
  }

  // Extragem numele magazinului și numărul magazinului din rândul cu id=mac
  var numeMagazin = $('#' + tabelMac + ' td:nth-child(5)')
    .text()
    .trim()
  var nrMagazin = $('#' + tabelMac + ' td:nth-child(4)')
    .text()
    .trim()

  // Inserăm titlul fișierului la începutul tabelului, dacă este setat
  if (titluFisier) {
    var titluRow = $(
      '<tr><th colspan="' +
        tabelClone.find('th').length +
        '">' +
        titluFisier +
        '</th></tr>'
    )
    tabelClone.find('thead').prepend(titluRow)
  }

  // Creăm un obiect WorkBook și un obiect WorkSheet folosind SheetJS
  var wb = XLSX.utils.book_new()
  var ws = XLSX.utils.table_to_sheet(tabelClone.get(0))

  // Setăm lățimea coloanelor la aproximativ 15 unități de caractere
  var colWidth = 19
  var range = XLSX.utils.decode_range(ws['!ref'])
  for (var col = range.s.c; col <= range.e.c; col++) {
    ws['!cols'] = ws['!cols'] || []
    ws['!cols'][col] = { wch: colWidth }
  }

  // Adăugăm foaia de calcul în cartea de lucru
  var sheetName = titluFisier || 'Sheet1'
  if (sheetName.length > 31) {
    sheetName = sheetName.substring(0, 31)
  }
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Generăm un fișier Excel
  var excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  // Creăm un link pentru descărcarea fișierului Excel
  var link = document.createElement('a')
  link.setAttribute(
    'href',
    window.URL.createObjectURL(
      new Blob([excelBuffer], { type: 'application/octet-stream' })
    )
  )
  link.setAttribute(
    'download',
    (titluFisier ? titluFisier + '.xlsx' : '') ||
      'Tabel_' + tabelTip + '_' + numeMagazin + '_' + nrMagazin + '.xlsx'
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

$(document).on('click', '.exporta_inregistrari', function () {
  var tabel = $(this).closest('table')
  var tabelClone = tabel.clone()
  exportaInregistrari(tabel, tabelClone)
})
