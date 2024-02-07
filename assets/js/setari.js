var setari = true;

$("#roluri_tab").on('click', () => { ws.send(JSON.stringify({ "command": "get_from_db_roluri" })); });
$("#adauga_r").on('click', adauga_rol);
$("#sterge_r").on('click', sterge_rol);
$("#val_tab").on('click', get_all_valute); //onselect
$("#moneda").on('change', get_valute);

$("#adauga_v").on('click', adauga_valuta);
$("#sterge_v").on('click', sterge_valuta);
$("#adauga_d").on('click', adauga_denominatie);
$("#sterge_d").on('click', sterge_denominatie);

page_name = 'setari'

function ws_msg(received) {
    switch (received.content) {
        case "roluri_updated":
        case "roluri_inserted":
            roluri_updated();
            break;
        case "valute_inserted":
            get_all_valute();
            get_valute();
            break;
        case "valute_deleted":
            $("#moneda option[value='" + received.for[0] + "']").remove()
            get_valute();
            break;
        case "roluri_data":
            if (received.data.length > 0) {
                array_to_roluri(received.data);
                $("#sel_data_msg").html("");
            } else {
                $("#sel_data_msg").html("NU exista DT-uri!");
                setTimeout(function () { $("#sel_data_msg").html(""); }, 5000);
            }
            break;

        default: console.log("Unknown data received: " + received);
    }
}

function adauga_valuta() {
    if ($('#add_v').length) return;
    $(`<div style="text-align:center" id="del_v">
        <input type="text" style="z-index:10000; text-transform: uppercase;" name="new_v">
        <br>(Maxim 12 caractere si fără spați)</div>`).dialog({
        modal: true,
        minWidth: 370,
        close: function (event, ui) { $(this).dialog('close').remove(); },
        title: "Introduceți acronimul pentru noua valută ",
        buttons: {
            'OK': function () {
                var new_v = {};
                new_v = $('input[name="new_v"]').val().toUpperCase().replace(/\s/g, '');;
                if (new_v == '') { $('input[name="new_v"]').effect("pulsate", {}, 500); }
                else {
                    save_val(new_v);
                    $(this).dialog('close').remove();
                }
            },
            'Cancel': function () {
                $(this).dialog('close').remove();
            }
        }
    });
}

function save_val(new_v) {
    var ret = 0;
    $("#moneda option").each(function () {
        new_v == $(this).val() ? ret++ : null;
    });

    if (ret) {
        custom_alert("Valuta " + new_v + " există deja!", 'Atenție!')
        return;
    }

    ws.send(JSON.stringify({
        "command": "push_to_db_valute",
        "data": [new_v]
    }));
}

function sterge_valuta() {
    if ($('#del_v').length) return;
    $(`<div style="text-align:center" id="del_v">
        <br>Se va șterge valuta ${$('#moneda').val()}
        <br> &nbsp</div>`).dialog({
        modal: true,
        minWidth: 370,
        close: function (event, ui) { $(this).dialog('close').remove(); },
        title: " Atenție! ",
        buttons: {
            'OK': function () {
                del_val($('#moneda').val());
                $(this).dialog('close').remove();
            },
            'Cancel': function () {
                $(this).dialog('close').remove();
            }
        }
    });
}

function del_val(val) {
    ws.send(JSON.stringify({
        "command": "delete_db_valute",
        "data": [val]
    }));
}

function adauga_denominatie() {
    if ($('#add_d').length) return;
    $(`<div id="add_d" style="text-align:center">
    Valoare  <input id="suma" type="text" style="z-index:10000; width: 120px; text-transform: uppercase;" name="new_d">
    <br><select class="form-control" id="new_tip"
        style="font-weight: 700; width: 120px;margin:auto">
        <option value="BILL" selected="">Bancnota</option>
        <option value="COIN">Moneda</option>
    </select>
    </div>`).dialog({
        modal: true,
        minWidth: 270,
        close: function (event, ui) { $(this).dialog('close').remove(); },
        title: "Introduceți noua denominație ",
        buttons: {
            'OK': function () {
                var new_d = [];
                new_d.push($('#moneda').val());
                new_d.push($('input[name="new_d"]').val());
                if (new_d[1] == '') { $('input[name="new_d"]').effect("pulsate", {}, 500); }
                else {
                    new_d[1] = parseFloat(new_d[1])
                    if (new_d[1] < 1) new_d[1] = new_d[1].toFixed(2);
                    else new_d[1] = new_d[1].toFixed(0);
                    new_d.push($('#new_tip').val());
                    save_den(new_d);
                    $(this).dialog('close').remove();
                }
            },
            'Cancel': function () {
                $(this).dialog('close').remove();
            }
        }
    });
    $("#suma").inputFilter(function (value) {
        return /^-?\d*[.]?\d{0,2}$/.test(value);
    });
}

function save_den(new_d) {
    var ret = 0;
    console.log(new_d)
    $("#moneda option").each(function () {
        new_d == $(this).val() ? ret++ : null;
    });

    if (ret) {
        custom_alert("Denominația " + new_d + " există deja!", 'Atenție!')
        return;
    }

    ws.send(JSON.stringify({
        "command": "push_den_to_db_valute",
        "data": [new_d]
    }));
}


function sterge_denominatie() {
    if ($('#del_d').length) return;
    var date = [], disp = '';
    $('#tab-2 input:checked').each(function () {
        console.log($(this))
        var t = [];
        var row = $(this).closest('tr');
        t.push($(row).attr('id'));
        date.push(t);
    });
    date.forEach((v, i) => {
        console.log($("#" + v + " td:nth-child(5)").text());
        disp += $("#" + v + " td:nth-child(5)").text();
        if ((date.length > 1) && (i != date.length - 1))
            if (i == date.length - 2) disp += ' și ';
            else disp += ', ';
    });
    console.log(disp);
    $(`<div style="text-align:center" id="del_d">
            <br>Se va șterge denominatia ${disp}
            <br>pentru valuta ${$('#moneda').val()}
            <br> &nbsp</div>`).dialog({
        modal: true,
        minWidth: 370,
        close: function (event, ui) { $(this).dialog('close').remove(); },
        title: " Atenție! ",
        buttons: {
            'OK': function () {
                ws.send(JSON.stringify({
                    "command": "delete_den_db_valute",
                    "data": date
                }));
                $(this).dialog('close').remove();
            },
            'Cancel': function () {
                $(this).dialog('close').remove();
            }
        }
    });
}

function insert_row_roluri(date) {
    var adate = [];
    for (var key in date) {
        if (adate.indexOf(key) === -1) {
            if (key != 'service' && key != 'statistica') adate.push(key);
        }
    }

    var j = 0;
    var row = '<tr id="' + date[adate[j++]] + '"><td style="text-align: center;"><input class="ckbox" type="checkbox"></td>';
    row += '<td><input type="text" style="width: 160px;text-align: left;" name="rol" class="mf" value="' + date[adate[j++]] + '"></td>';

    for (; j < adate.length; j++) row += '<td><input class="rckbox" type="checkbox" ' + (date[adate[j]] == 1 ? 'checked' : '') + '></td>';
    row += '</tr>';
    $('#rol_tabel tbody').append(row);
}

function array_to_roluri(inregistrari) {        //Se populeaza tabelul din procesare cu datele venite de la server
    console.log(inregistrari)
    $("#rol_tabel tbody").empty();
    for (var i = 0; i < inregistrari.length; i++) {
        insert_row_roluri(inregistrari[i]);
    }
    $('#rol_tabel tbody tr').chess_table();
    $("input.rckbox").attr("disabled", true);
    $('.ckbox').off().on('click', check_edit);
    //    $("#rol_tabel tbody tr").on('dblclick', load_roluri_form_data);
}

function roluri_updated() {
    console.log('update');
    ws.send(JSON.stringify({ "command": "get_from_db_roluri" }));
}

function adauga_rol() {
    console.log('adauga_rol');
    $('#0').remove();
    insert_row_roluri({ 'id': 0, 'rol': 'Rol nou', 'p1': 0, 'p2': 0, 'p3': 0, 'p4': 0, 'p5': 0, 'p6': 0, 'p7': 0, 'p8': 0, 'p9': 0, 'p10': 0 });
    $("#adauga_r").html('Salvează rol').off().on('click', salveaza_rol);
    $('#0 .mf').css({ "background": "#ccc", "pointer-events": "all" });
    $('#0 .ckbox').off().on('click', check_edit).prop('checked', true);
    $('#rol_tabel tbody tr').chess_table();
}

function salveaza_rol() {
    var data = [$('#0 input.mf').val()], ret = -1;
    $('input.mf').each(function () {
        data[0] == $(this).val() ? ret++ : null;
    });

    if (ret) {
        custom_alert("Rolul definit există deja!", 'Atenție!')
        return;
    }

    $('#0 input.rckbox').each(function () {
        data.push($(this).is(":checked"));
    });
    data.push(0);   //rol service
    $("#adauga_r").html('Adaugă rol').off().on('click', adauga_rol);
    $('#0 .mf').css({ "background": "none", "pointer-events": "none" });
    $("input.rckbox").attr("disabled", true);
    ws.send(JSON.stringify({
        "command": "push_to_db_roluri",
        "data": [data]
    }));
}

function check_edit() {
    var ret = 0;
    console.log('ck');

    $('input.ckbox').each(function () {
        var row_id = $(this).closest('tr').attr('id');
        if ($(this).is(":checked")) {
            ret++;
            $('#' + row_id + ' .mf').css({ "background": "#ccc", "pointer-events": "all" });
            $('#' + row_id + ' input.rckbox').attr("disabled", false);
        } else {
            $('#' + row_id + ' .mf').css({ "background": "none", "pointer-events": "none" });
            $('#' + row_id + ' input.rckbox').attr("disabled", true);
        }
    });
    if (!(ret)) {
        $('#0').remove();
        $("#adauga_r").html('Adaugă rol').off().on('click', adauga_rol);
        return;
    }
    $("#adauga_r").html('Salvează editări').off().on('click', salveaza_editari);
}

function sterge_rol() {
    var date = [];
    $('input.mf').each(function () {
        if ($(this).css("pointer-events") == 'all') {
            var t = [];
            var row = $(this).closest('tr');
            t.push($(row).attr('id'));
            date.push(t);
        }
    });
    ws.send(JSON.stringify({
        "command": "delete_db_roluri",
        "data": date
    }));
}

function salveaza_editari() {
    console.log('salveaza_editari');
    var ret = 0;
    var date = [];
    $('input.mf').each(function () {
        if ($(this).css("pointer-events") == 'all') {
            var t = [];
            var row = $(this).closest('tr');
            t.push($(row).attr('id'));
            t.push($('#' + t[0] + ' input.mf').val())

            $('input.mf').each(function () {
                t[1] == $(this).val() ? ret++ : null;
            });
            ret--;

            $('#' + t[0] + ' input.rckbox').each(function () {
                t.push($(this).is(":checked"));
            });
            t.push(0);// rol service
            date.push(t);
        }
    });

    if (ret) {
        custom_alert("Aveti roluri identice!", 'Atenție!')
        return;
    }
    console.log(date);
    ws.send(JSON.stringify({
        "command": "update_db_roluri",
        "data": [date]
    }));

    $('.mf').css({ "background": "none", "pointer-events": "none" });
    $("input.rckbox").attr("disabled", true);
    $("#adauga_r").html('Adaugă rol').off().on('click', adauga_rol);
}


function insert_row_valute(date) {
    var adate = ['id', 'id_display', 'valuta', 'tip', 'valoarea'];

    var j = 0;
    var row = '<tr id="' + date[adate[j++]] + '"><td><input class="ckbox" type="checkbox"></td>';
    row += '<td>' + date[adate[j++]] + '</td>';

    for (; j < adate.length; j++)
        if (j != 4) row += '<td>' + date[adate[j]] + '</td>';
        else row += '<td style="text-align:right">' + date[adate[j]] + '</td>';
    row += '</tr>';
    if (date.tip == 'Bancnota') $('#bill_tabel tbody').append(row);
    else $('#coin_tabel tbody').append(row);
}

function array_to_valute(inregistrari) {        //Se populeaza tabelul din procesare cu datele venite de la server
    console.log(inregistrari)
    $("#bill_tabel tbody").empty();
    $("#coin_tabel tbody").empty();
    for (var i = 0; i < inregistrari.length; i++) {
        inregistrari[i].id_display = i + 1;
        if (inregistrari[i].tip == 'BILL') inregistrari[i].tip = 'Bancnota';
        else if (inregistrari[i].tip == 'COIN') inregistrari[i].tip = 'Moneda';
        else break;
        insert_row_valute(inregistrari[i]);
    }
    $('#bill_tabel tbody tr').chess_table();
    $('#coin_tabel tbody tr').chess_table();
    $('.ckbox').off().on('click', check_edit);
    //    $("#rol_tabel tbody tr").on('dblclick', load_roluri_form_data);
}

