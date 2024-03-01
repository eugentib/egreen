page_name = 'general';

var $table = $('#dt_tabel');

var floatParam = {
    // thead cells
    headerCellSelector: 'tr:visible:first>*:visible',
    top: 56,
    useAbsolutePositioning: false,
    zIndex: 10,
    //    autoReflow: true,
    //    position: 'fixed'
};

$table.floatThead(floatParam); //*/

function ws_msg(received) {
    switch (received.content) {
        case "error":
            parse_error(received);
            break;
        case "cfg_updated":
        case "cfg_inserted":
            cfg_updated();
            break;
        case "devices_data":
            if (received.data.length > -1) {
                $('#dt_tabel tbody').empty();
                array_to_devices(received.data);
                $("#sel_data_msg").html("");
            } else {
                $("#sel_data_msg").html("NU exista configuri!");
                setTimeout(function () { $("#sel_data_msg").html(""); }, 5000);
            }
            break;
        default: if ('lcd' in received) update_mac_lcd(received);
        else if ('rssi' in received) update_mac_rssi(received);
        else if ('nrb' in received) update_mac_nrb(received);
        else if ('pl_c' in received) update_mac_pl_c(received);
        else console.log("Unknown data received: ", received);
    }
}
const nr_col = 9;

function selMacCol(data){return 'tr[data-mac="' + data.mac + '"]';}
function update_mac_pl_c(data) {
    $(selMacCol(data)).find(`td:eq(${nr_col})`).html(data.pl_c);
    $(selMacCol(data)).find(`td:eq(${nr_col + 1})`).html(data.l_pl_c);
}
function update_mac_nrb(data) {
    $(selMacCol(data)).find(`td:eq(${nr_col + 2})`).html(data.nrb);
}

function update_mac_lcd(data) {
    if (data.status > 0) {
        let msg = 'EROARE<br>MINORA';
        let color = "yellow";
        if (data.status > 10) { msg = 'EROARE<br>MAJORA'; color = "red"; }
        $(selMacCol(data)).find(`td:eq(${nr_col - 2})`).html(msg).css("background-color", color);
    }else if(data.status == 'OFFLINE') { $(selMacCol(data)).find(`td:eq(${nr_col - 2})`).html('OFFLINE').css("background-color", "orange"); }
    else { $(selMacCol(data)).find(`td:eq(${nr_col - 2})`).html('OK').css("background-color", $(selMacCol(data)).find(`td:eq(${nr_col - 3})`).css("background-color")); }
    $(selMacCol(data)).find(`td:eq(${nr_col + 3})`).html('<pre>' + data.lcd + '</pre>');
}

function update_mac_rssi(data) {
    $(selMacCol(data)).find(`td:eq(${nr_col + 4})`).html(data.rssi + ' dBm');
}

function insert_row_devices(date, dataset) {
    //    var adate = ['idt', 'mac', 'model', 'devsw', 'localitate', 'magazin', 'nrmag', 'status', 'status_rev', 'downtime', 'grad', 'gre', 'nrBaloti', 'lcd', 'rssi'];
    var adate = ['idt', 'nrmag', 'magazin', 'localitate', 'model', 'devsw', 'serie', 'status', 'revizie', 'pl_c', 'l_pl_c', 'nrBaloti', 'lcd', 'rssi'];
    //    console.log(date)
    //  console.log(dataset)

    var row = '<tr class="ns" data-mac="' + date.mac + '">';

    for (j = 0; j < adate.length; j++) {
        if (adate[j] == 'status') {
            if (date[adate[j]] == 'EROARE<br>MINORA') row += '<td style="background-color:yellow" data-filtru="' + dataset[j] + '">';
            else if (date[adate[j]] == 'EROARE<br>MAJORA') row += '<td style="background-color:red" data-filtru="' + dataset[j] + '">';
            else if (date[adate[j]] == 'OFFLINE') {row += '<td style="background-color:orange" data-filtru="' + dataset[j] + '">';
            date.status += "<br>" + new Date(date.lastUPDATE.slice(0, -1)).toLocaleDateString('ro-RO').substring(0, 5) + ' ' + new Date(date.lastUPDATE.slice(0, -1)).toLocaleTimeString('ro-RO').substring(0, 10);}
            else row += '<td data-filtru="' + dataset[j] + '">';
        }
        else row += '<td data-filtru="' + dataset[j] + '">';

        if (adate[j] == 'lcd') {
            if (date[adate[j]] == "OFFLINE") { date[adate[j]] += "\n" + new Date(date.lastUPDATE.slice(0, -1)).toLocaleDateString('ro-RO').substring(0, 5) + ' ' + new Date(date.lastUPDATE.slice(0, -1)).toLocaleTimeString('ro-RO').substring(0, 10); }
            row += '<pre>' + date[adate[j]] + '</pre></td>';
        }
        else if (adate[j] == 'rssi') {
            row += date[adate[j]] + ' dBm</td>';
        }

        else
            row += date[adate[j]] + '</td>';
    }
    row += '</tr>';
    $('#dt_tabel tbody').prepend(row);
    //    console.log(row);
}


function array_to_devices(inregistrari) {        //Se populeaza tabelul din procesare cu datele venite de la server
    var dataset = ['fid', 'fnrmag', 'fnumemag', 'flocalitate', 'fmodel', 'fvsw', 'fserie', 'fsatus', 'fsatusr', 'fnrpbc', 'fnrpbp', 'fnrb', 'flcd', 'frssi'];
    console.log(inregistrari)
    $("#dt_tabel tbody").empty();
    for (var i = 0; i < inregistrari.length; i++) {
        inregistrari[i].idt = inregistrari.length - i;
        insert_row_devices(inregistrari[i], dataset);
    }
    $("#dt_tabel tbody tr").chess_table();
}
