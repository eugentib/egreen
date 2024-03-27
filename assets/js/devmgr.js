page_name = 'devmgr'

function updateFields (device) {
  $('#inputMAC').val(device.mac)
  $('#inputNrMag').val(device.nrmag)
  $('#swVersion').val(device.sw)
  $('#nrBatolti').val(device.nrBaloti)
  $('#nrPresari').val(device.pl_c)
}
// Adăugarea evenimentelor onchange și onenter
$('#inputMAC, #inputNrMag').on('change autocompleteselect', function () {
  var enteredValue = $(this).val()
  console.log('OnChange:' + enteredValue)
  var selectedDevice = devices.find(function (device) {
    return device.mac === enteredValue || device.nrmag === enteredValue
  })

  if (selectedDevice) updateFields(selectedDevice)
})

$('#inputMAC, #inputNrMag').on('autocompleteselect', function (event, ui) {
  var selectedValue = ui.item.value
  console.log('OnSelect:' + selectedValue)
  var selectedDevice = devices.find(function (device) {
    return device.mac === selectedValue || device.nrmag === selectedValue
  })

  if (selectedDevice) updateFields(selectedDevice)
})

function getSuggestions (term, callback) {
  // Filtrează MAC-urile pe baza valorii 'term'
  var filteredSuggestions = macAddresses.filter(function (mac) {
    return mac.toLowerCase().indexOf(term.toLowerCase()) !== -1
  })

  // Apelează funcția de callback cu sugestiile filtrate
  callback(filteredSuggestions)
}

function check_url () {
  var urlParams = new URLSearchParams(window.location.search)
  var macFromUrl = urlParams.get('mac')

  if (macFromUrl) {
    var selectedDevice = devices.find(function (device) {
      return device.mac === macFromUrl
    })

    if (selectedDevice) {
      $('#inputMAC').val(selectedDevice.mac)
      $('#inputNrMag').val(selectedDevice.nrmag)
      updateFields(selectedDevice)
    }
  }
}

var devices
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
        devices = received.data
        console.log(received.data)
        var macAddresses = $.map(received.data, function (value, index) {
          return value.mac
        })
        var nrMagValues = $.map(received.data, function (value, index) {
          return value.nrmag
        })

        $('#inputMAC').autocomplete({
          source: function (request, response) {
            var term = $.ui.autocomplete.escapeRegex(request.term)
            var regex = new RegExp(term, 'i')
            var filteredMacAddresses = $.grep(macAddresses, function (value) {
              return regex.test(value)
            })
            response(filteredMacAddresses)
          }
        })

        $('#inputNrMag').autocomplete({
          source: function (request, response) {
            var term = $.ui.autocomplete.escapeRegex(request.term)
            var regex = new RegExp(term, 'i')
            var filteredNrMagValues = $.grep(nrMagValues, function (value) {
              return regex.test(value)
            })
            response(filteredNrMagValues)
          }
        })
        check_url()
      }
      break
    default:
      if (received.mac == $('#inputMAC').val()) {
        if ('lcd' in received) update_lcd(received)
        else {
          console.log('Device data received:', received)
          if ('rssi' in received) update_rssi(received)
          else if ('R_sw' in received) update_sw_resp(received)
          else if ('nrb' in received) update_nrb(received)
          else if ('file_content' in received) update_lastFileContent(received)
          else if ('heap' in received) update_heap(received)
          else if ('uptime' in received) update_uptime(received)
          else if ('pl_c' in received) update_pl_c(received)
          else console.log('Unknown data received: ', received)
        }
      }
  }
}

function update_uptime (data) {
  $('#uptime').val(data.uptime)
}

function update_heap (data) {
  $('#heap').val(data.heap)
}


function formatFileData(data) {
  // Împărțim textul în două părți: numele fișierului și datele JSON
  let separatorIndex = data.indexOf(':');
  let fileName = data.slice(0, separatorIndex);
  let jsonData = JSON.parse(data.slice(separatorIndex + 1));

  // Extragem valorile din obiectul JSON
  let startAt = jsonData.StartAt;
  let numarBalot = jsonData.NumarBalot;
  let numarPresari = jsonData.NumarPresari;
  let endAt = jsonData.EndAt;

  // Formatăm timpii în formatul dorit
  let startAtFormatted = formatTimestamp(startAt);
  let endAtFormatted = endAt?formatTimestamp(endAt):"";

  // Construim textul formatat
  let formattedText = `Nume fisier: ${fileName}\n`;
  formattedText += `Inceput la: ${startAtFormatted}\n`;
  formattedText += `Numar balot: ${numarBalot}\n`;
  formattedText += `Numar presari: ${numarPresari}\n`;
  formattedText += `Terminat la: ${endAtFormatted}`;

  return formattedText;
}

function formatTimestamp(timestamp) {
  let date = new Date(timestamp * 1000);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  // Formatăm ora, minutele și secundele cu zero în față dacă sunt mai mici de 10
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  // Formatăm ziua și luna cu zero în față dacă sunt mai mici de 10
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  return `${hours}:${minutes}:${seconds} in ${day}.${month}.${year}`;
}


function update_lastFileContent (data) {
  $('#lastFileContent').val(formatFileData(data.file_content))
}
function update_pl_c (data) {
  $('#nrPresari').val(data.pl_c)
}
function update_nrb (data) {
  $('#nrBatolti').val(data.nrb)
}
function update_lcd (data) {
  $('#lcd').val(data.lcd)
}
function update_rssi (data) {
  $('#rssi').val(data.rssi)
}

function update_sw_resp (data) {
  $('#sw_resp').val(data.R_sw)
}

function command_device (mac, command) {
  ws.send(
    JSON.stringify({
      mqtt_command: command,
      data: mac
    })
  )
}

//Aduga funcționalitate pentru butoanele de comenzi
$('#readBalNrBtn').click(function () {
  command_device(
    $('#inputMAC').val(),
    `fread:/trimise/balot_${$('#nrBatolti').val()}.data`
  )
})
$('#updateBtn').click(function () {
  command_device($('#inputMAC').val(), 'update')
})
$('#resetBtn').click(function () {
  command_device($('#inputMAC').val(), 'reset')
})

$('#startSIMBtn').click(function () {
  command_device($('#inputMAC').val(), 'simulate')
})

$('#stopSIMBtn').click(function () {
  command_device($('#inputMAC').val(), 'stop')
})

$('#updateATmegaBtn').click(function () {
  command_device($('#inputMAC').val(), 'aflash')
})

$('#resetATmegaBtn').click(function () {
  command_device($('#inputMAC').val(), 'areset')
})

$('#listDirBtn').click(function () {
  command_device($('#inputMAC').val(), 'fdir:')
})

$('#listTrimiseBtn').click(function () {
  command_device($('#inputMAC').val(), 'fdir:/trimise/')
})

$('#updateFSBtn').click(function () {
  command_device($('#inputMAC').val(), 'fs_update')
})

$('#getLastBalotBtn').click(function () {
  command_device($('#inputMAC').val(), 'fread:balot_last.data')
})

$('#resetBalotiBtn').click(function () {
  command_device($('#inputMAC').val(), 'clearAllBaloti')
})
