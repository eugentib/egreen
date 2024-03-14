page_name = 'config'

$('.nav-item').on('click', function (e) {
  //   e.preventDefault;
  console.log($(this).data('cmd'))
  ws.send(JSON.stringify({ command: $(this).data('cmd') }))
}) //*/

function ws_msg (received) {
  switch (received.content) {
    case 'error':
      parse_error(received)
      break
    case 'devices_data':
      if (received.data.length) {
        $('#dt_tabel tbody').empty()
        array_to_dturi(received.data)
      }
      break
    case 'l2_conf':
      if (received.data.length) {
        $('#l2_tabel tbody').empty()
        array_to_l2(received.data)
      }
      break

    default: //console.log("Unknown data received: " + received); l2_conf
  }
}

function save_check () {
  $(this)
    .off('click', save_check)
    .on('click', edit_check)
    .removeClass('fa-floppy-o')
    .addClass('fa-pencil')
  let mac = $(this).parents('tr').attr('id')
  console.log('mac ', mac)
  let vals = []
  let col = 5
  if ($(this).parents('table').attr('id') == 'l2_tabel') col = 1
  $(this)
    .parents('tr')
    .find(`td:gt(${col})`)
    .each(function () {
      let val = $(this).find('input').val()
      let datasiorar
      if (this.cellIndex == 6) {
        val = datepicker2mysqldate($(this).find('input'))
        console.log(val)
        datasiorar = datasiora(val, ' ', false)
      }
      vals.push(val)
      if (this.cellIndex == 6) $(this).html(datasiorar)
      else if (this.cellIndex > 8) {
        $(this).html(val.replaceAll(',', ',<br>').replaceAll(';', ';<br>'))
      } else $(this).html(val)
    })
  vals.push(mac)
  console.log(vals)
  ws.send(
    JSON.stringify({
      command: col != 1 ? 'config_devices' : 'set_config',
      data: vals
    })
  )
}

function edit_check () {
  $(this)
    .off('click', edit_check)
    .on('click', save_check)
    .removeClass('fa-pencil')
    .addClass('fa-floppy-o')
  let col = 5
  if ($(this).parents('table').attr('id') == 'l2_tabel') col = 1
  $(this)
    .parents('tr')
    .find(`td:gt(${col})`)
    .each(function () {
      let html = $(this).html()
      let input = $('<input class="editdt" type="text" />')
      if (this.cellIndex == 6) {
        input.datetimepicker({
          dateFormat: 'dd.mm.yy',
          timeFormat: 'HH:mm',
          defaultDate: 0
        })
      } else if (this.cellIndex > 8) {
        input = $('<input class="editdt" type="email" />')
        html = html.replaceAll(',<br>', ',').replaceAll(';<br>', ';')
      }
      input.val(html)
      $(this).html(input)
    })
}

function insert_row_dturi (date, dataset) {
  var adate = [
    'idt',
    'serie',
    'model',
    'localitate',
    'nrmag',
    'dataRevizie',
    'intervalRevizie',
    'intervalBaloti',
    'email_serv',
    'email_kauf'
  ]
  // console.log(date)
  //   console.log(dataset)

  var row =
    '<tr class="ns" id="' +
    date.mac +
    '"><td data-filtru="fckdt"><i class="fa fa-pencil" aria-hidden="true"></i></td>'

  for (j = 0; j < adate.length; j++) {
    if (j == 5)
      row +=
        '<td data-filtru="' +
        dataset[j] +
        '" data-mysql="' +
        date[adate[j]] +
        '">' +
        datasiora(
          (date[adate[j]] ? date[adate[j]] : '').slice(0, -1),
          ' ',
          false
        ) +
        '</td>'
    else if (j == 9)
      row +=
        '<td data-filtru="' +
        dataset[j] +
        '">' +
        (date[adate[j]] ? date[adate[j]] : '')
          .replaceAll(',', ',<br>')
          .replaceAll(';', ';<br>') +
        '</td>'
    else
      row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + '</td>'
  }
  row += '</tr>'
  $('#dt_tabel tbody').prepend(row)
}

function array_to_dturi (inregistrari) {
  //Se populeaza tabelul din procesare cu datele venite de la server
  var dataset = [
    'fid',
    'fserie',
    'fmodel',
    'flocalitate',
    'fnumarmag',
    'fultimaR',
    'fintervalZ',
    'fintervalB',
    'fenmailS',
    'fenmailK'
  ]
  console.log(inregistrari)
  $('#dt_tabel tbody').empty()
  for (var i = 0; i < inregistrari.length; i++) {
    inregistrari[i].idt = inregistrari.length - i
    insert_row_dturi(inregistrari[i], dataset)
  }
  $('#dt_tabel tbody tr').chess_table()
  $('.fa-pencil').on('click', edit_check)
  // După încărcarea datelor în tabel
  rerandareTabel('dt_tabel')
}

function rerandareTabel(tabelId) {
    var tabel = document.getElementById(tabelId);
    if (tabel) {
      // Distrugeți instanța curentă a pluginului floatThead
      $(tabel).floatThead('destroy');
  
      var clona = tabel.cloneNode(true);
      clona.style.tableLayout = 'auto';
      tabel.parentNode.replaceChild(clona, tabel);
  
      // Reconstruiți o nouă instanță a pluginului floatThead
      $(clona).floatThead(floatParam);
    }
  }
function array_to_l2 (inregistrari) {
  //Se populeaza tabelul din procesare cu datele venite de la server
  var dataset = [
    'fid',
    'fserie',
    'fmodel',
    'flocalitate',
    'fnumarmag',
    'fultimaR',
    'fintervalZ',
    'fintervalB',
    'fenmailS',
    'fenmailK'
  ]
  console.log(inregistrari)
  $('#l2_tabel tbody').empty()
  for (var i = 0; i < inregistrari.length; i++) {
    if (i % 2 == 0)
      $('#l2_tabel tbody').append(
        `<tr><td style="border: none;"></td></tr><tr><td style="border: none;"></td></tr>`
      )
    insert_row_l2(inregistrari[i], i)
  }
  $('#l2_tabel tbody tr').chess_table()
  $('.fa-pencil').on('click', edit_check) //.prop('checked', true);
}

function insert_row_l2 (date, i) {
  var row =
    '<tr class="ns" id="' +
    date.id +
    '" ><td data-filtru="fckdt" style="width: 10%;"><i class="fa fa-pencil" aria-hidden="true"></i></td>'
  row += '<td style="text-align: left;">' + date.camp + '</td>'
  row += '<td>' + date.val + '</td>'

  row += '</tr>'
  $('#l2_tabel tbody').append(row)
}

function get_checked_dts () {
  arr = []
  $('#dt_tabel .ckbox:checkbox:checked').each((i, e) => {
    arr.push($(e).closest('tr').find('td:eq(2)').html())
  })
  var msg = 'Sterge echipamentul cu seria:'
  if (arr.length > 1) msg = 'Sterge echipamentele cu seriile:'
  if (arr.length)
    $('<div style="text-align:center;"></div>')
      .html(msg + arr.join())
      .dialog({
        title: 'Atentie!',
        resizable: false,
        modal: true,
        width: 500,
        buttons: {
          Ok: function () {
            delete_dt(arr)
            $(this).dialog('close')
          },
          Anulează: function () {
            $(this).dialog('close')
          }
        }
      })
  return arr
}
function get_checked_dt () {
  arr = []
  $('#dt_tabel .ckbox:checkbox:checked').each((i, e) => {
    arr.push($(e).closest('tr').find('td:eq(2)').html())
  })

  if (arr.length > 1) {
    var msg = 'Selectati doar un echipament pentru editare!'
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
  } else if (arr.length > 0) {
    $('#edit_dt').off('click', get_checked_dt)
    $('#edit_dt').on('click', save_dt)
    dev2save = arr[0]
    enable_cb(0)
    $('#edit_dt').html('Salveaza')
    $('#dt_tabel .ckbox:checkbox:checked')
      .parents('tr')
      .find('td:gt(2)')
      .each(function () {
        var html = $(this).html()
        var input = $('<input class="editdt" type="text" />')
        input.val(html)
        $(this).html(input)
      })
  } else {
    var msg = 'Selectati un echipament pentru editare!'
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
  return arr
}
var dev2save
function save_dt () {
  var arr = []
  $('#edit_dt').on('click', get_checked_dt)
  $('#edit_dt').off('click', save_dt)
  $('#edit_dt').html('Editeaza')
  enable_cb(1)
  $('#dt_tabel .ckbox:checkbox:checked')
    .parents('tr')
    .find('td:gt(2)')
    .each(function () {
      var html = $(this).find('input').val()
      arr.push(html)
      $(this).html(html)
    })
  arr.push(dev2save)
  console.log(arr)
  ws.send(
    JSON.stringify({
      command: 'edit_devices',
      data: arr
    })
  )
}
