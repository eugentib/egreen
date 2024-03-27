//var adaugam = false;

var tzoffset = new Date().getTimezoneOffset() * 60000 //offset in milliseconds
var user = localStorage.getItem('n')
functia = localStorage.getItem('r') //vor fi luate din sesiune

$('#user').html(user)

function mouseoverusericon () {
  if (window.matchMedia('(pointer: coarse)').matches) {
    //return false;
  }
  var a = document.getElementById('usermenu')
  a.style.top = '15px'
}
function mouseoutofusericon () {
  var a = document.getElementById('usermenu')
  a.style.top = '-56px'
}

var pg = window.location.pathname.substring(1)
console.log(pg)
if (pg != '') $('div.' + pg).css('background-color', 'rgb(119, 173, 235)')

var tabLinks = new Array()
var contentDivs = new Array()

function datasiora (cand = Date.now(), separator = ' ora ', cs = true) {
  //generez strig cu data si ora locale
  if (cand == null) return ''
  return (
    new Date(cand).toLocaleDateString('ro-RO').substring(0, 10) +
    separator +
    new Date(cand).toLocaleTimeString('ro-RO').substring(0, cs ? 10 : 5)
  )
}

setInterval(function () {
  $('#clock').html(datasiora())
}, 1000)

function objarr2arr (obj) {
  var arr = []
  for (var i = 0; i < obj.length; i++) {
    for (var key in obj[i]) {
      if (arr.indexOf(key) === -1) {
        arr.push(key)
      }
    }
  }
  return arr
}

var timeoutHandle = null // = setTimeout(() => { $("#sel_data_msg").html(""); }, 1000);

function change_password () {
  if ($('#pwd_ch').length) return
  $(
    '<div id="pwd_ch" style="max-width: 300px;><div">Parola veche<br><input type="password" style="z-index:10000" name="old_pass"><br>' +
      'Parola noua<br><input type="password" style="z-index:10000" name="new_pass"></br><div></div>'
  ).dialog({
    modal: true,
    width: 450,
    height: 300,
    title: 'Schimba parola pentru userul ' + user,
    buttons: {
      Logout: {
        class: 'leftButton',
        text: 'Logout',
        click: function () {
          setTimeout(logout_user, 1000)
          $(this).dialog('close').remove()
        }
      },
      OK: function () {
        var pass = {}
        pass.old = $('input[name="old_pass"]').val()
        pass.new = $('input[name="new_pass"]').val()
        save_pass(pass)
        $(this).dialog('close').remove()
      },
      Cancel: function () {
        $(this).dialog('close').remove()
      }
    }
  })
}

function save_pass (pass) {
  console.log(pass)
  console.log(localStorage.getItem('s'))
  if (ws.readyState === WebSocket.OPEN)
    ws.send(
      JSON.stringify({
        command: 'change_upswd',
        data: [md5(pass.new), md5(pass.old), localStorage.getItem('s')]
      })
    )
  else {
    $('#sel_data_msg').html('Se asteapta conectarea...')
    setTimeout(save_pass, 1000)
    return
  }
  setTimeout(logout_user, 2000)
}

function IPToNumber (s) {
  var arr = s.split('.')
  var n = 0
  for (var i = 0; i < 4; i++) {
    n = n * 256
    n += parseInt(arr[i], 10)
  }
  return n
}

function connectws () {
  //Se conecteaza websocket la server si se proceseaza mesajele venite
  ws = new WebSocket('wss://' + window.location.hostname + '/WS')

  ws.onmessage = function (event) {
    if (event.data == 'r') return
    var received = JSON.parse(event.data)
    //        console.log(received)
    //         $("#sel_data_msg").html("");
    switch (received.content) {
      case 'get_expire_from_db':
        if (received.data.length > 0) {
          get_expire_from_db_index_template(received.data)
        }
        break
      case 'preluare_autocomplet':
        if (received.data.length > 0) {
          var array = $.map(received.data, function (value, index) {
            for (p in value) return value[p]
          })
          if (received.dest == 'oras')
            $('#oras').autocomplete({ source: array })
          if (received.dest == 'client')
            $('#nume_client').autocomplete({ source: array })
        }
        break
      default:
        ws_msg(received)
    }
  }

  ws.onopen = function () {
    console.log('WSocket is open...')
    $('#sel_data_msg').html('Conexiune stabilită.')
    setTimeout(function () {
      $('#sel_data_msg').html('')
    }, 5000)
    $('.my_col').css('background', 'rgb(119,173,235)')
    if (page_name == 'devices' || page_name == 'cautare') {
      ws.send(JSON.stringify({ command: 'get_ddev' }))
    }
    var date = new Date()
    var start = new Date(date.getFullYear(), date.getMonth(), 1)
    //        start = date2mysqldate(start);
    var end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    if ($('#datepicker2').length) {
      start = datepicker2mysqldate('#datepicker')
      end = datepicker2mysqldate('#datepicker2')
    } else {
      start = getCurrentDateTimeMySql(start)
      end = getCurrentDateTimeMySql(end)
    }
    if (
      page_name == 'general' ||
      page_name == 'config' ||
      page_name == 'inrolare' ||
      page_name == 'raportari' ||
      page_name == 'oldservice'
    ) {
      ws.send(
        JSON.stringify({
          command: 'get_devices',
          data: [start, end, start, end, 1]
        })
      )
    } else if (page_name == 'service' || page_name == 'devmgr') {
      ws.send(
        JSON.stringify({
          command: 'get_all_devices',
          data: [start, end, start, end, 1]
        })
      )
    }

    ws.timer = setInterval(function () {
      pingpong(ws)
    }, 50000)
  }

  ws.onclose = function (event) {
    console.log(
      'Socket is closed. Reconnect will be attempted in 1 second.',
      event.reason
    )
    clearInterval(ws.timer)
    $('#sel_data_msg').html('Se încearcă reconectarea la server...')
    $('.my_col').css('background', 'blue')
    setTimeout(function () {
      ws = null
      connectws()
    }, 1000)
  }

  ws.onerror = function (err) {
    console.error('Socket encountered error: ', err, 'Closing socket')
    ws.close()
  }
}

function getCurrentDateTimeMySql (acum) {
  var localISOTime = new Date((acum ? acum : Date.now()) - tzoffset)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')
  var mySqlDT = localISOTime
  return mySqlDT
}

function pingpong (ws) {
  ws.send('p')
}
connectws()

$('.check_all').click(check_table)

function check_table () {
  // Se de/biveaza tabelul
  //console.log($(this).closest('table').find('tbody')[0]);
  var t = $(this).closest('table').find('tbody')[0]
  if (t == undefined) {
    let id = $(this).closest('table').attr('class').split(' ')[0]
    t = $('#' + id).find('tbody')[0]
  }
  if (t == undefined) t = table_body
  for (var i = 0; i < t.childNodes.length; i++) {
    if ($(t.children[i]).is(':visible'))
      t.children[i].children[0].children[0].checked = this.checked
  }
}

function custom_alert (message, title) {
  if (!message) message = 'No Message to Display.'
  $('<div style="text-align:center;"></div>')
    .html(message)
    .dialog({
      title: title,
      resizable: false,
      modal: true,
      width: 500,
      buttons: {
        Ok: function () {
          $(this).dialog('close')
        }
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

function mysql2ro (mysqld) {
  if (mysqld == null) return ' '
  let data = mysqld.split(/[- .:T]/)
  if (data.length < 3) return ' '
  return [
    data[2],
    '-',
    data[1],
    '-' + data[0],
    ' ',
    data[3],
    ':',
    data[4]
  ].join('')
}
function datepicker2mysqldate (ref) {
  let data = $(ref)
    .val()
    .split(/[- .:]/)
  return [
    data[2],
    '-',
    data[1],
    '-' + data[0],
    ' ',
    data[4],
    ':',
    data[5]
  ].join('')
}
function date2mysqldate (date) {
  var data = date.split(/[- .:]/)
  return data[2] + '-' + data[1] + '-' + data[0] + ' ' + data[3] + ':' + data[4]
}

function request_data () {
  //    var data = (event.target || event.srcElement).parentNode.firstChild;
  $('#sel_data_msg').html('Încărcare date...')
  var data = datepicker2mysqldate('#datepicker')
  var data2 = datepicker2mysqldate('#datepicker2')
  var smsg = {
    command: 'get_from_db_preluare',
    data: [data + ':00', data2 + ':59']
  }

  if (typeof raportari_filtre === 'boolean')
    smsg.command = 'get_from_db_raportari_filtre'
  ws.send(JSON.stringify(smsg))
  console.log(smsg)
}

var to_edit_row = 1
var oluna = 1000 * 3600 * 24 * 30

var acum = new Date()
var firstDay = new Date(acum.getFullYear(), acum.getMonth(), 1)
var lastDay = new Date(acum.getFullYear(), acum.getMonth() + 1, 0)

//$('#datepicker').val((new Date(Date.now())).toLocaleDateString('ro-RO').substring(0, 10).replace(/\//g, ".") + " ora 00:00");
$('#datepicker').val(
  new Date(firstDay)
    .toLocaleDateString('ro-RO')
    .substring(0, 10)
    .replace(/\//g, '.') + ' ora 00:00'
)
//$('#datepicker2').val((new Date(Date.now())).toLocaleDateString('ro-RO').substring(0, 10).replace(/\//g, ".") + " ora 23:59");
$('#datepicker2').val(
  new Date(lastDay)
    .toLocaleDateString('ro-RO')
    .substring(0, 10)
    .replace(/\//g, '.') + ' ora 23:59'
)

var formatDatepicker = {
  dateFormat: 'dd.mm.yy',
  timeFormat: "'ora 'HH:mm",
  defaultDate: 0
}

$('#datepicker').datetimepicker(formatDatepicker)
$('#datepicker2').datetimepicker(formatDatepicker)

$.ui.autocomplete.filter = function (array, term) {
  var matcher = new RegExp('^' + $.ui.autocomplete.escapeRegex(term), 'i')
  return $.grep(array, function (value) {
    return matcher.test(value.label || value.value || value)
  })
}

;(function ($) {
  $.fn.inputFilter = function (inputFilter) {
    return this.on(
      'input keydown keyup mousedown mouseup select contextmenu drop',
      function () {
        if (inputFilter(this.value)) {
          this.oldValue = this.value
          this.oldSelectionStart = this.selectionStart
          this.oldSelectionEnd = this.selectionEnd
        } else if (this.hasOwnProperty('oldValue')) {
          this.value = this.oldValue
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd)
        }
      }
    )
  }
})(jQuery)

$('#suma').inputFilter(function (value) {
  return /^-?\d*[.]?\d{0,2}$/.test(value)
})

$('.sort').click(sort)

function getRandomColor () {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function ucfirst (str, force) {
  str = force ? str.toLowerCase() : str
  return str.replace(/(\b)([a-zA-Z])/, function (firstLetter) {
    return firstLetter.toUpperCase()
  })
}

function ucwords (str, force) {
  str = force ? str.toLowerCase() : str
  return str.replace(/(\b)([a-zA-Z])/g, function (firstLetter) {
    return firstLetter.toUpperCase()
  })
}

function sort () {
  var table = $('#' + $(this).parents('table').attr('class').split(' ')[0])
  console.log('sort ', table, ' index ', $(this).index())
  var lastrow = table.find('tbody tr.nosort')
  var rows = table
    .find('tbody tr:not([style*="display: none"])')
    .toArray()
    .sort(comparer($(this).index()))
  this.asc = !this.asc
  if (!this.asc) {
    rows = rows.reverse()
  }
  for (var i = 0; i < rows.length; i++) {
    $(rows[i])
      .find('[data-filtru=fid]')
      .text(i + 1) // Reindexeaza tabelul
    $(rows[i]).removeClass('odd even')
    if (i % 2) $(rows[i]).addClass('odd')
    else $(rows[i]).addClass('even')
    table.append(rows[i])
  }
  table.append(lastrow)
}

function comparer (index) {
  return function (a, b) {
    var valA = getCellValue(a, index),
      valB = getCellValue(b, index)
    return $.isNumeric(valA) && $.isNumeric(valB)
      ? valA - valB
      : valA.toString().localeCompare(valB)
  }
}

function getCellValue (row, index) {
  return $(row).children('td').eq(index).text()
}

$(window).on('beforeunload', function () {
  //    return confirm("Are you sure you want to leave?");
})

function unique (array) {
  return array.filter(function (el, index, arr) {
    return index == arr.indexOf(el)
  })
}

function selecteaza_toti (obj) {
  // $(obj).closest('div').find('select');
  $('select[multiple] option').prop('selected', 'selected')
  $('select').trigger('chosen:updated')
}
function get_operators_to_select () {
  $('#operator_div').removeClass('hide')
  if ($('#operator').find('option').length != false) {
    $('#operator_div').removeClass('hide')
    return
  }
  // return;
  var msg = {
    command: 'get_operators_to_select',
    data: 'operator'
  }
  ws.send(JSON.stringify(msg))
}

var $inputs = $('.filter')
$inputs.on('input change paste', filtreaza)

function add_even_odd (id = '#dt_tabel') {
  var table = $(id)
  //    console.log('table = ', table);
  if (!table.length) table = $('#tabelr')
  //    console.log('table = ', table);
  var rows = table.find('tbody tr:not([style*="display: none"])').toArray()
  let index = 1

  for (var i = 0; i < rows.length; i++) {
    //        console.log('row = ', rows[i]);

    $(rows[i])
      .find('[data-filtru=fid]')
      .text(index++) // Reindexeaza tabelul
    $(rows[i]).removeClass('odd even')
    if (i % 2) $(rows[i]).addClass('odd')
    else $(rows[i]).addClass('even')
    table.append(rows[i])
  }
}

function mysqTimestamp2ROziua (data) {
  let t = data.split(/[-T:]/) //[ "2023", "10", "24T20", "10", "17.000Z" ]
  console.log(t)
  return t[2] + '-' + t[1] + '-' + t[0]
}

function ROziua2mysqTimestamp (data) {
  let t = data.split(/[- :]/) //[ "2023", "10", "24T20", "10", "17.000Z" ]
  console.log(t)
  return t[2] + '-' + t[1] + '-' + t[0]
}

function enable_cb (onv) {
  if (onv) {
    $('input.ckbox,.check_all').removeAttr('disabled')
  } else {
    $('input.ckbox,.check_all').attr('disabled', true)
  }
}

function filtreaza () {
  var target = $(this).parents('table').attr('class').split(' ')[0]
  focus_id = this.id
  console.log('focus_id = ', focus_id)
  console.log('target_id = ', target)
  var autoarr = $(
    '#' + target + ' tr td:nth-child(' + (this.parentNode.cellIndex + 1) + ')'
  )
    .map(function () {
      return $(this).text()
    })
    .get()
  $(this).autocomplete({ source: unique(autoarr) })
  var $filterableRows = $('#' + target + ' tbody').find('tr')
  $filterableRows
    .hide()
    .filter(function () {
      return (
        $(this)
          .find('td')
          .filter(function () {
            var tdText = $(this).text().toUpperCase(),
              inputValue = $('#' + $(this).data('filtru'))
                .val()
                .toUpperCase()

            // Verifică dacă input-ul este un checkbox
            if ($('#' + $(this).data('filtru')).attr('type') === 'checkbox') {
              // Dacă input-ul este un checkbox, verifică starea checkbox-ului din celulă
              return (
                $(this).find('input[type="checkbox"]').prop('checked') ===
                $('#' + $(this).data('filtru')).prop('checked')
              )
            } else {
              // Altfel, verifică dacă textul din celulă conține valoarea din input
              return tdText.indexOf(inputValue) !== -1
            }
          }).length === $(this).find('td').length
      )
    })
    .show()

  add_even_odd()

  setTimeout(function () {
    document.getElementById(focus_id).focus()
  }, 100)
}

var floatParam = {
  // thead cells
  headerCellSelector: 'tr:visible:first>*:visible',
  top: 56,
  useAbsolutePositioning: false,
  zIndex: 10
  //    autoReflow: true,
  //    position: 'fixed'
}

function aranjaza_tabel () {
  console.log('Refocus')
  if (document.activeElement.id) focus_id = document.activeElement.id
  //console.log(focus_id, document.activeElement.id)
  document.getElementById(focus_id).focus()
}

jQuery.fn.extend({
  chess_table: function () {
    $(this).filter(':odd').removeClass('odd even').addClass('odd')
    $(this).filter(':even').removeClass('odd even').addClass('even')
    return this
  }
})

function logout_user () {
  localStorage.clear()
  window.location.href = '/index.html'
}

$.extend($.expr[':'], {
  containsExact: $.expr.createPseudo
    ? $.expr.createPseudo(function (text) {
        return function (elem) {
          return $.trim(elem.innerHTML.toLowerCase()) === text.toLowerCase()
        }
      })
    : // support: jQuery <1.8
      function (elem, i, match) {
        return $.trim(elem.innerHTML.toLowerCase()) === match[3].toLowerCase()
      },

  containsExactCase: $.expr.createPseudo
    ? $.expr.createPseudo(function (text) {
        return function (elem) {
          return $.trim(elem.innerHTML) === text
        }
      })
    : // support: jQuery <1.8
      function (elem, i, match) {
        return $.trim(elem.innerHTML) === match[3]
      },

  containsRegex: $.expr.createPseudo
    ? $.expr.createPseudo(function (text) {
        var reg = /^\/((?:\\\/|[^\/]) )\/([mig]{0,3})$/.exec(text)
        return function (elem) {
          return RegExp(reg[1], reg[2]).test($.trim(elem.innerHTML))
        }
      })
    : // support: jQuery <1.8
      function (elem, i, match) {
        var reg = /^\/((?:\\\/|[^\/]) )\/([mig]{0,3})$/.exec(match[3])
        return RegExp(reg[1], reg[2]).test($.trim(elem.innerHTML))
      }
})
