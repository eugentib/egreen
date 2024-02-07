var admin = true;
var users = {};
$("#adauga_u").on('click', insert_user);
$("#sterge_u").on('click', get_checked_ids);

$('#log_tab').on('click', request_log);
$('#incarca_log').on('click', request_log);

$("#adauga_dt").on('click', insert_dturi);
$("#sterge_dt").on('click', get_checked_dts);
page_name = 'admin'
console.log($("#rol"));

function display_c() {
    var refresh = 1000; // Refresh rate in milli seconds
    mytime = setTimeout('display_ct()', refresh)
}
function toISOLocal(d) {
    var z = n => (n < 10 ? '0' : '') + n;
    var off = d.getTimezoneOffset();
    var sign = off < 0 ? '+' : '-';
    off = Math.abs(off);

    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' +
        z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes()) +
        ':' + z(d.getSeconds()) + sign + z(off / 60 | 0) + z(off % 60);
}
function display_ct() {
    var x = new Date()
    var month = x.getMonth() + 1;
    var day = x.getDate();
    var year = x.getFullYear();
    if (month < 10) { month = '0' + month; }
    if (day < 10) { day = '0' + day; }
    var d3 = day + '-' + month + '-' + year;

    var hour = x.getHours();
    var minute = x.getMinutes();
    var second = x.getSeconds();
    if (hour < 10) { hour = '0' + hour; }
    if (minute < 10) { minute = '0' + minute; }
    if (second < 10) { second = '0' + second; }
    var h3 = hour + ':' + minute + ':' + second

    document.getElementById('t2').value = x.toLocaleString('ro-RO').replace(',', ' ');
    document.getElementById('ts2').value = x.toLocaleString('ro-RO').replace(',', ' ');
    document.getElementById('t1').value = toISOLocal(x).split('+')[0].replace('T', ' ');
    display_c();
}


$("#tab_dt").on('click', () => { ws.send(JSON.stringify({ "command": "get_from_db_dturi" })); });

function ws_msg(received) {
    switch (received.content) {
        case "users_updated":
        case "user_inserted":
            user_updated();
            break;
        case "users_data":
            ws.send(JSON.stringify({
                "command": "get_from_db_roluri",
            }));
            if (received.data.length > 0) {
                $('#u_tabel tbody').empty(); console.log('empty');

                array_to_users(received.data);
                $("#sel_data_msg").html("");
            } else {
                $("#sel_data_msg").html("NU exista useri!");
                setTimeout(function () { $("#sel_data_msg").html(""); }, 5000);
            }
            break;
        case "dturi_updated":
        case "dturi_inserted":
            dturi_updated();
            break;
        case "db_log_data":
            console.log(received.data);
            load_log_table(received.data);
            break;
        case "dturi_data":
            if (received.data.length > -1) {
                $('#dt_tabel tbody').empty();
                array_to_dturi(received.data);
                $("#sel_data_msg").html("");
            } else {
                $("#sel_data_msg").html("NU exista DT-uri!");
                setTimeout(function () { $("#sel_data_msg").html(""); }, 5000);
            }
            break;

        case "roluri_data":
            update_rol_select(received.data);
            break;
        case "users_data":
        default: console.log("Unknown data received: " + received);
    }
}

function strip_null(arr) {
    var temp = [];
    arr.forEach((v, i) => {
        v.forEach
        temp.push(Array.from(v, item => item || 0));
    });
    return temp;
}

function insert_row_loguri(date) {
    var dataset = ['fid', 'fdata', 'fora', 'foperator', 'ftip', 'foriginal', 'ffinal'];
    var adate = [];
    console.log(date);
    for (var key in date) {
        if (adate.indexOf(key) === -1) {
            if (key != 'cod_sac') adate.push(key);
        }
    }
    //    date.vi='<span style="white-space: nowrap;"></span>';
    var temp = '';
    if (date.id_monetar) {
        tip = [, , 'fit', 'unfit', 'mix', 'fals'];
        date.vi = strip_null(date.vi);
        date.vf = strip_null(date.vf);
        date.vf.forEach((v, i) => {
            var t = '';
            console.log(v, ' ', i);
            for (j = 2; j < 6; j++) {
                if (date.vf[i][j] != date.vi[i][j - 2]) t += '<span>Pentru denominația ' + v[1] +
                    ' tip <strong>' + tip[j] + '</strong> din ' + date.vi[i][j - 2] + ' in ' + v[j] + '</span> <br>';
            }
            temp += t;
        });
        date.vi = '<div style="text-align:left; padding-left:15px">' + temp + '</div>';
    } else {
        date.id_monetar = date.cod_sac;
        if (date.vf[0] != date.vi[0]) {
            temp += '<span>Câmpul <strong>Nume client</strong> din ' + date.vi[0] + ' in ' + date.vf[0] + '</span> <br>';
        }
        if (date.vf[1] != date.vi[1]) {
            temp += '<span>Câmpul <strong>Oras</strong> din ' + date.vi[1] + ' in ' + date.vf[1] + '</span> <br>';
        }
        if (date.vf[2] != date.vi[2]) {
            temp += '<span>Câmpul <strong>Suma</strong> din ' + date.vi[2] + ' in ' + date.vf[2] + '</span> <br>';
        }
        if (date.vf[3] != date.vi[3]) {
            temp += '<span>Câmpul <strong>Valuta</strong> din ' + date.vi[3] + ' in ' + date.vf[3] + '</span> <br>';
        }
        date.vi = '<div style="text-align:left; padding-left:15px">' + temp + '</div>';
    }
    date.ora_evt = new Date(date.data.slice(0, -1)).toLocaleTimeString('ro-RO');
    date.data_evt = new Date(date.data.slice(0, -1)).toLocaleDateString('ro-RO');
    var j = 0;
    var row = '<tr class="ns"><td data-filtru="' + dataset[j++] + '"> ' + date.id_monetar +
        ' </td><td data-filtru="' + dataset[j++] + '">' + date.data_evt + '</td><td data-filtru="' +
        dataset[j++] + '">' + date.ora_evt + '</td>';

    for (; j < 6; j++) row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j - 1]] + '</td>';
    row += '</tr>';
    $('#log_tabel tbody').prepend(row);
}


function load_log_table(inregistrari) {
    console.log(inregistrari)
    $("#log_tabel tbody").empty(); 0
    for (var i = 0; i < inregistrari.length; i++) {
        inregistrari[i].vf = JSON.parse(inregistrari[i].vf);
        inregistrari[i].vi = JSON.parse(inregistrari[i].vi);
        insert_row_loguri(inregistrari[i]);
    }
    $('#log_tabel tbody tr').chess_table();
}

function request_log() {
    //    $("#sel_data_msg").html("Încărcare date...");  setTimeout(() => { $("#sel_data_msg").html(""); }, 1000);
    var data = datepicker2mysqldate('#datepicker');
    var data2 = datepicker2mysqldate('#datepicker2');
    var msg = {
        command: 'read_log_db',
        data: [data + ':00', data2 + ':59']
    }
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    else {
        $("#sel_data_msg").html("Se asteapta conectarea...");
        setTimeout(request_log, 1000);
        return;
    }

}

function update_rol_select(roluri) {
    console.log(roluri);
    $.each(roluri, function (i, item) {
        $('#rol').append($('<option>', {
            value: item.rol,
            text: item.rol
        }));
    });
}

function insert_row_users(date, dataset) {
    //    console.log(date);
    var adate = [];
    for (var key in date) {
        if (adate.indexOf(key) === -1) {
            if (key != 'password') adate.push(key);
        }
    }

    var row = '<tr class="ns" id="' + date.id + '"><td data-filtru="fck"><input class=\"ckbox\" type=\"checkbox\"></td>';

    for (j = 0; j < adate.length; j++) row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + '</td>';
    row += '</tr>';
    $('#u_tabel tbody').prepend(row);
}

function array_to_users(inregistrari) {        //Se populeaza tabelul din procesare cu datele venite de la server
    var dataset = ['fid', 'fnume', 'fuser', 'frol', 'flegitimatie'];
    //    console.log(inregistrari)
    $("#u_tabel tbody").empty();
    for (var i = 0; i < inregistrari.length; i++) {
        insert_row_users(inregistrari[i], dataset);
        users[inregistrari[i].id] = inregistrari[i].password;
    }
    $("#u_tabel tbody tr").chess_table().on('dblclick', load_user_form_data);
}



var md5 = function (value) {
    return CryptoJS.MD5(value).toString();
}
