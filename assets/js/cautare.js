page_name = 'cautare';

function ws_msg(received) {
    switch (received.content) {
        case "error":
            parse_error(received);
            break;
        case "cfg_updated":
        case "cfg_inserted":
            cfg_updated();
            break;
        case "ddev_data":
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
        //        else if ('rssi' in received) update_mac_rssi(received);
        //        else if ('scroll' in received) update_mac_scr(received);
        //        else if ('pl_c' in received) update_mac_pl_c(received);
        else
            console.log("Unknown data received: ", received);
    }
}

var scroll = {};
function get_scroll(mac, txt) {
    if (mac in scroll) {
        let len = scroll[mac].length;
        let temp = scroll[mac];
        let cmp = txt.slice(0, 15);
        let cmpn = txt.slice(1);
        let pos = scroll[mac].indexOf(cmp);
        $('tr:has(td:contains("' + mac + '"))').find('td:eq(2)').html('<pre>' + pos + '\n' + scroll[mac] + '\n' + cmp + '</pre>');
        if (pos >= 0) {
            if (pos < 95) scroll[mac] = temp.slice(0, pos) + txt + temp.slice(pos + 15);
            else
                scroll[mac] = temp.slice(0, pos) + txt;
        } else if (txt == "*** MASCHINENFAB") scroll[mac] = txt + temp.slice(16);
        else if(0){
            cmp = txt.slice(0, 14);
            pos = scroll[mac].indexOf(cmp);
            if (pos >= 0) {
                if (pos < 95) scroll[mac] = temp.slice(0, pos) + txt + temp.slice(pos + 15);
                else
                    scroll[mac] = temp.slice(0, pos) + txt;
            }
        }
        if (len != scroll[mac].length) {
//            $('tr:has(td:contains("' + mac + '"))').find('td:eq(6)').html($('tr:has(td:contains("' + scroll[mac] + '"))').find('td:eq(5)').html());
  //          $('tr:has(td:contains("' + mac + '"))').find('td:eq(5)').html(scroll[mac]);
            $('tr:has(td:contains("' + mac + '"))').find('td:eq(4)').html(len);
            console.log('Scroll[' + mac + ']=' + scroll[mac]);
        }
    } else {
        scroll[mac] = txt;
    }

}

function update_mac_lcd(data) {
    $('tr:has(td:contains("' + data.mac + '"))').find('td:eq(3)').html('<pre>' + data.lcd + '</pre>');
    if ((data.lcd.slice(0, 16) == 'PRESA E OK     K'))
        get_scroll(data.mac, data.lcd.slice(17));

}
function update_mac_scr(data) {
    $('tr:has(td:contains("' + data.mac + '"))').find('td:eq(6)').html($('tr:has(td:contains("' + data.mac + '"))').find('td:eq(5)').html());
    $('tr:has(td:contains("' + data.mac + '"))').find('td:eq(5)').html(data.scroll);
}
function update_mac_rssi(data) {
    $('tr:has(td:contains("' + data.mac + '"))').find('td:eq(4)').html(data.rssi + ' dBm');
}

function update_mac_pl_c(data) {
    $('tr:has(td:contains("' + data.mac + '"))').find('td:eq(10)').html(data.pl_c);
    $('tr:has(td:contains("' + data.mac + '"))').find('td:eq(11)').html(data.l_pl_c);
}

function insert_cfg() {
    var ret = false;
    $("form#cfg_imput_form :input").each(function (index) {
        if (index < 2 && $(this).val() == '') { $(this).effect("pulsate", {}, 500); ret = true; }
    });
    if (ret) return;
    ws.send(JSON.stringify({
        "command": "push_to_db_cfg",
        "data": [[$("#select-dt").val(), $("#select-ch").val()]]
    }));
}

function array_to_dt(data) {        //Se populeaza select
    data.forEach(function (e, i) {
        $('#select-dt').append($('<option></option>').val(e.seria).text(e.model + '/' + e.seria.slice(-4) + '/' + e.masa));
    });
}

function insert_row_devices(date, dataset) {
    //    var adate = ['idt', 'mac', 'model', 'devsw', 'localitate', 'magazin', 'nrmag', 'status', 'status_rev', 'downtime', 'grad', 'gre', 'nrBaloti', 'lcd', 'rssi'];
    var adate = ['idt', 'mac', 'sw', 'lcd', 'rssi', 'scroll', 'lastScroll'];
    console.log(date)
    console.log(dataset)

    var row = '<tr class="ns" data-chid="' + date.id + '">';

    for (j = 0; j < adate.length; j++) {
        row += '<td data-filtru="' + dataset[j] + '">';
        if ((adate[j] == 'lcd') || (adate[j] == 'sw')) {
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
    var dataset = ['fid', 'fmac', 'fvsw', 'flcd', 'frssi', 'fscr', 'flscr'];
    console.log(inregistrari)
    $("#dt_tabel tbody").empty();
    for (var i = 0; i < inregistrari.length; i++) {
        inregistrari[i].idt = inregistrari.length - i;
        insert_row_devices(inregistrari[i], dataset);
    }
    $("#dt_tabel tbody tr").chess_table();
}
