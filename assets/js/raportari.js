raportari = true;
page_name = "raportari";

$("#raport_lunar").on("click", get_checked_dts);
$("#incarca_raportari").on("click", get_raport_data);

$("#tabelr tbody").on("click", "td.get_detali", get_detali);
$("#tabelr tbody").on("click", "td.close_detali", close_detali);

var my_body;

function close_detali() {
  $(this).parent().find("td:eq(1)").html('<i class="fa fa-search-plus">');
  $(this).parent().find("td:eq(1)").toggleClass("close_detali get_detali");
  $(this).parent().next().remove();
  console.log($(this).parent().attr("id"));
  $("." + $(this).parent().attr("id") + "_detali").remove();
  $(".sort").on("click", sort);
}

function get_detali() {
  let mac = $(this).closest("tr").attr("id");

  let start = datepicker2mysqldate("#datepicker");
  let end = datepicker2mysqldate("#datepicker2");
  console.log(mac);
  ws.send(
    JSON.stringify({ command: "get_detali_erori", data: [start, end, mac] })
  );
}

function get_raport_data() {
  var start = datepicker2mysqldate("#datepicker");
  var end = datepicker2mysqldate("#datepicker2");
  console.log(end);
  ws.send(
    JSON.stringify({ command: "get_devices", data: [start, end, start, end] })
  );
}

function ws_msg(received) {
  switch (received.content) {
    case "error":
      parse_error(received);
      break;

    case "detali_erori_mac":
      if (received.data) {
        show_detali(received.data, received.perioada, received.mac);
        ws.send(
          JSON.stringify({
            command: "get_detali_baloti",
            data: [
              received.perioada[0],
              received.perioada[1],
              received.data[0].mac,
            ],
          })
        );
      }
      break;
    case "detali_baloti_mac":
      if (received.data) {
        $(`#${received.mac}_detali_baloti`).html(
          parse_detali_baloti(received.data, received.perioada, received.mac)
        );
        add_even_odd("#" + received.mac + `_detali .tabbaoti${received.mac}`);
        $(`#tabbaoti${received.mac}`).find(".sort").click(sort);

        //                ws.send(JSON.stringify({ "command": "get_detali_baloti", "data": [received.perioada[0], received.perioada[1], received.data[0].mac] }));
      }
      break;
    case "devices_data":
      if (received.data.length > -1) {
        $("#tabelr tbody").empty();
        array_to_devices(received.data);
        $("#sel_data_msg").html("");
      }
      break;
    case "get_baloti_pe_luni":
      if (received.data.length > -1) {
        //                $('#tabelr tbody').empty();
        datePeLuna(received.data, received.perioada);
        //              $("#sel_data_msg").html("");
      }
      break;
    default:
      if (
        "lcd" in received ||
        "rssi" in received ||
        "nrb" in received ||
        "pl_c" in received
      );
      else if ("responsabil" in received) {
        //date live
        update_responsabil(received);
      } else {
        console.log("Unknown data received: ");
        console.log(received);
      }
  }
}

const nr_col = 12;

function selMacCol(data) {
  return 'tr[id="' + data.mac + '"]';
}

function update_responsabil(data) {
  $(selMacCol(data)).find(`td:eq(${nr_col})`).html(data.responsabil);
}

var od;

function displayGeneratingDialog(){
    const $dialog = $("<div>").html("Se genereaza raport...");

    $dialog.dialog({
      title: "Generare raport",
      modal: true,
      open() {
        $(this).parent().find(".ui-dialog-titlebar-close").hide();
      },
    });
  return $dialog;
};

function closeDialog($dialog) {
  $dialog.dialog('close');
}

function datePeLuna(date, perioada) {
  closeDialog(od);
  console.log(date);
  console.log(perioada);
  let msg = `<table id="tabluni" class="tabluni table table-bordered table-dark">
    <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;">
        <tr class="text-center">
            <th class="sort">Numar</th>
            <th class="sort">Nume magazin</th>`;
  var total = {};
  total.general = 0;
  for (let property in date[0]) {
    console.log(`${property}: ${date[0][property]}`);
    if (
      property != "mac" &&
      property != "nrmag" &&
      property != "magazin" &&
      property != "blc"
    ) {
      msg += `<th class="sort">${property}</th>`;
      total[property] = 0;
    }
  }
  msg += `<th class="sort">Total</th>
    </tr>
    </thead>
    <tbody>`;
  for (let index in date) {
    msg += `<tr>`;
    for (let property in date[index]) {
      if (property != "mac") {
        msg += `<td>${date[index][property]}</td>`;
        total[property] += parseInt(date[index][property]);
        if (property == "blc") total.general += parseInt(date[index][property]);
      }
    }
    msg += `</tr>`;
  }

  msg += `<tr style="color: rgb(235,242,250);background-color: #444444!important;" class="nosort"><td> </td><td>Total</td>`;
  for (let property in date[0]) {
    console.log(`${property}: ${date[0][property]}`);
    if (
      property != "mac" &&
      property != "nrmag" &&
      property != "magazin" &&
      property != "blc"
    ) {
      msg += `<td>${total[property]}</td>`;
    }
  }
  msg += `<td>${total.general}</td></tr></tbody></table>`;

  $('<div class="rapo" style="text-align:center;"></div>')
    .html(msg)
    .dialog({
      open: function (event, ui) {
        console.log("avem dialog");
        add_even_odd("#tabluni");
        $(".sort").click(sort);
      },
      title: `Raport lunar pentru perioada de la ${mysql2ro(
        perioada[0]
      )} până la ${mysql2ro(perioada[1])}`,
      resizable: true,
      modal: true,
      width: 1100,
      buttons: {
        Anulează: function () {
          $(this).dialog("destroy");
        },
      },
    });
}

var $table = $("#tabelr");

var floatParam = {
  // thead cells
  headerCellSelector: "tr:visible:first>*:visible",
  top: 94,
  useAbsolutePositioning: false,
  zIndex: 10,
  //    autoReflow: true,
  //    position: 'fixed'
};
$table.floatThead(floatParam); //*/

function insert_row_raportari(date, dataset) {
  var adate = [
    "idt",
    "nrmag",
    "magazin",
    "localitate",
    "model",
    "devsw",
    "serie",
    "downtime",
    "minore",
    "majore",
    "responsabil",
    "blc",
  ];

  var icon = '<i class="fa fa-search-plus"></i>';

  var row =
    '<tr class="ns" id="' +
    date.mac +
    '"><td data-filtru="fck"><input class="ckbox" type="checkbox"></td><td data-filtru="lens"  class="get_detali">' +
    icon +
    "</td>";

  for (j = 0; j < adate.length; j++)
    row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + "</td>";
  row += "</tr>";
  $("#tabelr tbody").prepend(row);
  //    $('#tabelr tbody').append(row);
}

function array_to_devices(inregistrari) {
  //Se populeaza tabelul din procesare cu datele venite de la server
  var dataset = [
    "fid",
    "fnrmag",
    "fnume",
    "flocalitate",
    "fmodel",
    "fvsw",
    "fserie",
    "fdownt",
    "femi",
    "fema",
    "fresp",
    "fnrb",
  ];
  console.log(inregistrari);
  $("#dt_tabel tbody").empty();
  for (var i = 0; i < inregistrari.length; i++) {
    inregistrari[i].idt = inregistrari.length - i;
    insert_row_raportari(inregistrari[i], dataset);
  }
  $("#tabelr tbody tr").chess_table();
  //    $("#tabelr tbody").on("click", "td.get_detali", get_detali);
}

$.urlParam = function (name) {
  var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(
    window.location.href
  );

  return results ? results[1] : 0;
};

var quick_view = $.urlParam("quick_view");

if (quick_view.length > 0) {
  $("nav").hide();
  $(".my_col").hide();
  setTimeout(function () {
    $(".get_detali").trigger("click");
  }, 300);
}

function get_raport(arr) {
  var start = datepicker2mysqldate("#datepicker");
  var end = datepicker2mysqldate("#datepicker2");

  ws.send(
    JSON.stringify({
      command: "get_baloti_date",
      data: [start, end, arr],
    })
  );
}

const getCheckedDeviceIds = () => {
  const checkedIds = $("#tabelr .ckbox:checkbox:checked").map(function() {
    return $(this).closest("tr").attr("id");
  }).get();

  if (checkedIds.length === 0) {
    return displayNoDevicesSelectedDialog(); 
  }

  getReport(checkedIds);
}

const displayNoDevicesSelectedDialog = () => {
  const message = "Selectati unul sau mai multe echipamente pentru raport lunar!";
  
  $('<div style="text-align:center;"></div>')
    .html(message)
    .dialog({
      title: "Atentie!",
      resizable: false,
      modal: true,
      width: 500,
      buttons: {
        Anulează: function() {
          $(this).dialog("close");
        }
      }
    });
}


function get_checked_dts() {
  arr = [];
  $("#tabelr .ckbox:checkbox:checked").each((i, e) => {
    arr.push($(e).closest("tr").attr("id"));
  });

  if (arr.length > 0) {
    od = displayGeneratingDialog();
    get_raport(arr);
  } else {
    var msg = "Selectati unul sau mai multe echipamente pentru raport lunar!";
    $('<div style="text-align:center;"></div>')
      .html(msg)
      .dialog({
        title: "Atentie!",
        resizable: false,
        modal: true,
        width: 500,
        buttons: {
          Anulează: function () {
            $(this).dialog("close");
          },
        },
      });
    return;
  }
}

function show_detali(date, perioada, mac) {
  //     Se afiseaza detali in linea urmatoare fata de codul de sac
  console.log(date);
  var row = $("#" + mac);

  //  console.log(row, date)
  //  console.log('Deschide row')
  //  console.log(row)
  $(".sort").off("click");
  $(row).find("td:eq(1)").html('<i class="fa fa-search-minus">');
  $(row).find("td:eq(1)").toggleClass("get_detali close_detali");
  $("#" + mac + "_detali").remove();
  var colsp = 14;
  row.after(`<tr class='trdetali' id='${mac}_detali'>
    <td style='padding-left: 90px;padding-right: 40px;border: none;
    'colspan='${colsp}' align='center'><div class="rapo" style="text-align:center;">
    ${parse_detali_err(date, perioada, mac)}</div>
    <div id="${mac}_detali_baloti" style="text-align:center;"></div>
    </td></tr>`);

  add_even_odd("#" + mac + `_detali .taberori${mac}`);
  $("#" + mac + "_detali")
    .find(".sort")
    .click(sort);
}

function parse_detali_err(date, perioada, mac) {
  //console.log(date)
  //  console.log(perioada)
  let msg = `<table id="taberori${mac}" class="taberori${mac}">
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
    <th class="sort">Timp eroare</th>
    <th class="sort">Email transmis</th>
    <th class="sort">Remediere conform manual</th>
    ${buton_export}
    </tr>
    </thead>
    <tbody>`;
  let date_index = [
    "id",
    "lcd",
    "tip_eroare",
    "data",
    "data_ora_rezolvare",
    "durata",
    "mail_catre",
    "descriere",
  ];
  for (let index in date) {
    msg += `<tr>`;
    if (date[index].activa == 1) {
      date[index].data_ora_rezolvare = " ";
      date[index].durata = "";
    }
    for (let property in date_index) {
      if (property != 3 && property != 4)
        msg += `<td>${date[index][date_index[property]]}</td>`;
      else msg += `<td>${mysql2ro(date[index][date_index[property]])}</td>`;
    }
    msg += `</tr>`;
  }

  msg += `</tbody></table>`;
  return msg;
}

function parse_detali_baloti(date, perioada, mac) {
  console.log(date);
  //  console.log(perioada)
  let msg = `<table id="tabbaoti${mac}" class="tabbaoti${mac}" style="width: 80%;margin-top: 2rem;">
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
    <tbody>`;
  let date_index = ["id", "nrBalot", "nr_p", "data"];
  for (let index in date) {
    msg += `<tr>`;
    for (let property in date_index) {
      if (property != 3) msg += `<td>${date[index][date_index[property]]}</td>`;
      else msg += `<td>${mysql2ro(date[index][date_index[property]])}</td>`;
    }
    msg += `</tr>`;
  }

  msg += `</tbody></table>`;
  return msg;
}

var buton_print = `<th class="nosort" style="background-color: #ebf2fa;border: none;"><button class="btn btn-primary float-right" type="button" id="printeaza_inregistrari"
style="color: rgb(4,4,4);height: 30px;width: 98px;"><i class="fa fa-print"
    style="font-size: 20px;color: rgb(0,0,0);margin-top: 0px;"></i>   Print</button></th>`;
var buton_export = `<th class="nosort" style="background-color: #ebf2fa;border: none;"><button class="btn btn-primary float-right"
type="button" id="exporta_inregistrari"
style="color: rgb(0,0,0);height: 30px;"><i class="fa fa-file-excel-o"
    style="font-size: 20px;margin-top: 0px;"></i>   Export</button></th>`;
