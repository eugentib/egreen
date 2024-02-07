var preluare = true;
$("#adauga").on('click', insert_row_preluare);
$("#salveaza_inregistrari").on('click', send_table);
$("#incarca_data").on('click', request_data);
$("#sterge_inregistrari").on('click', delete_selected_row);
$('.check_all').click(check_table);
$('#selecteaza_xls').change(handleFile);
page_name = 'preluare'
$("#tabelp tbody").on("dblclick", "tr:not('.nsssss')", load_form_data);

var my_body;

var File_data = {};
var CBtimer;
function resetCBcheck() {
    clearTimeout(CBtimer);
    CBtimer = setTimeout(checkCBduplicate, 500);
}

$('#fcodsac').on("change keydown paste", resetCBcheck);

function checkCBduplicate() {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({
        command: 'checkCBduplicate',
        data: $('#fcodsac').val().toUpperCase()
    }));
    else {
        setTimeout(checkCBduplicate, 1000);
        return;
    }
}

function insert_row_preluare(date, rclass = 'ns') {
    if (date.type !== undefined) {
        date = [];
        $("form#manual_imput_form :input").each(function (index) {
            if (index < 4 && $(this).val() == '') { $(this).effect("pulsate", {}, 500); }
            if (index == 3 && $(this).val() !== '') date.push(parseFloat($(this).val()));
            else date.push($(this).val().toUpperCase());

        });
        if (date[0].length === 0 || date[1].length === 0 || date[2].length === 0 || date[3].length === 0) return;
        $("form#manual_imput_form input[type=text]").each(function () {
            $(this).val("");
        });
        $("#fcodsac").focus();
        rclass = 'editabil';
    }
    var dataset = ['fid', 'fsac', 'fnume', 'foras', 'fvaloared', 'fvaluta', 'fpost', 'fziua', 'fora'];
    var adate = ['id', 'cod_sac', 'client', 'oras', 'valoare_declarata', 'valuta', 'post_alocat', 'data_preluare', 'ora_preluare'];

    date.valoare_declarata = date.valoare_declarata ? Number(date.valoare_declarata).toFixed(2) : '';

    date.id = $('#tabelp tr').length;

    date.ora_preluare = date.data_preluare ? new Date(date.data_preluare.slice(0, -1)).toLocaleTimeString('ro-RO') : "";//new Date().toLocaleTimeString('ro-RO');
    date.data_preluare = date.data_preluare ? new Date(date.data_preluare.slice(0, -1)).toLocaleDateString('ro-RO') : "";//new Date().toLocaleDateString('ro-RO');

    var row = '<tr class="' + rclass + '"><td data-filtru="fck" ><input class="ckbox" type="checkbox"></td>';

    if (date.cod_sac == undefined) {
        var j = 0;
        date[3] = Number(date[3]).toFixed(2)
        row += '<td data-filtru="' + dataset[j] + '">' + date.id + '</td>';    // id
        for (j = 0; j < 6; j++) row += '<td data-filtru="' + dataset[j + 1] + '">' + date[j] + '</td>';
        //        row += '<td data-filtru="' + dataset[++j] + '"></td>';    // post alocat
        row += '<td data-filtru="' + dataset[++j] + '">' + date.data_preluare + '</td>';    // data
        row += '<td data-filtru="' + dataset[++j] + '">' + date.ora_preluare + '</td>';    // ora
    }
    else for (j = 0; j < adate.length; j++) row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + '</td>';
    row += '</tr>';
    my_body += row;
//    $('#tabelp tbody').prepend(row);
}

function array_to_preluare(inregistrari, rclass = 'ns') {        //Se populeaza tabelul din preluare cu datele venite de la server
    console.log(inregistrari);
    my_body = '';
    for (var i = 0; i < inregistrari.length; i++) {
        insert_row_preluare(inregistrari[i], rclass);
    }
    $('#tabelp tbody').html(my_body);
    $("#tabelp tbody tr:not('.trmonetar')").chess_table();
    get_total();
}


function load_form_data(row = (event.target || event.srcElement).parentNode) {
    var i = 2;
    if (typeof (row.cells) === 'undefined') row = row.currentTarget;
    console.log(row);

    //    if (row.classList.contains("ns"))
    $("form#manual_imput_form input[type=text]").each(function () {
        if (i == 6) i++;
        $(this).val(row.cells[i++].innerHTML);
    });
    $("#moneda").val(row.cells[6].innerHTML);
    if (row.classList.contains("ns")) {
        $("#fcodsac").prop("disabled", true);
        $("#moneda").prop("disabled", true);
        $("#adauga").html("Actualizeaza cod sac " + row.cells[2].innerHTML);
    }
    else $("#adauga").html("Editeaza cod sac " + row.cells[2].innerHTML);
    $("#adauga").off().on('click', update_table_row);
    to_edit_row = row;
    window.scrollTo(0, 0);
    $("#nume_client").focus();
}

function delete_selected_row() {//$(this).closest('.tr').remove();
    $(".ckbox").each((i, element) => {
        if (element.checked) {
            element.closest('tr').remove();
        }
    });
    get_total();
    index_table();
}

function index_table(t = $("#tabelp tbody")[0]) {         //Se indexeaza tabelul
    for (var i = 0; i < t.childNodes.length;) {
        $(t.children[i]).removeClass("odd even");
        if (i % 2) $(t.children[i]).addClass("odd");
        else $(t.children[i]).addClass("even");
        if ($("#incarca_nealocate").length == 0 && $("#incarca_reconcilieri").length == 0) t.children[i].children[1].innerHTML = t.childNodes.length - (i++);
        else i++;
    }
}


function update_table_row() {
    if ($('#fcodsac').val() == '') {
        custom_alert("Cod de bare invalid", "Nepermis!");
        return
    }

    var date = new Date();
    var i = 2;
    $("#fcodsac").prop("disabled", false);
    $("#moneda").prop("disabled", false);

    if (to_edit_row === 1) {
        update_cod_sac();
        $("form#manual_imput_form input[type=text]").each(function () {
            $(this).val("");
        });
        $("#adauga").html("Adaugă înregistrare");
        $("#adauga").off().on('click', insert_row_preluare);
        $("#fcodsac").focus();
    } else {
        if ($("#adauga").html().includes("Actualizeaza")) update_cod_sac();
        row = to_edit_row;
        to_edit_row = 1;
        //    row.classList.remove("ns");
        $("form#manual_imput_form input[type=text]").each(function () {
            if (i == 6) i++;
            if (i == 5) row.cells[i++].innerHTML = parseFloat($(this).val()).toFixed(2);
            else if (i == 2) row.cells[i++].innerHTML = $(this).val().toUpperCase();
            else row.cells[i++].innerHTML = $(this).val().toUpperCase();
            $(this).val("");
        });
        row.cells[6].innerHTML = $("#moneda").val();
        row.cells[8].innerHTML = date.toLocaleDateString('ro-RO');
        row.cells[9].innerHTML = date.toLocaleTimeString('ro-RO');
        $("#adauga").html("Adaugă înregistrare");
        $("#adauga").off().on('click', insert_row_preluare);
        $("#fcodsac").focus();
        get_total();
    }
}


function table2array() {
    var tableInfo = Array.prototype.map.call(document.querySelectorAll('#tabelp tr'), function (tr) {
        if (!$(tr).hasClass("ns")) return Array.prototype.map.call(tr.querySelectorAll('td'), function (td) {
            return td.innerHTML;
        });
    });
    tableInfo.shift();
    tableInfo = tableInfo.filter((elem) => { return elem });
    var arr2send = [];
    var temp = [];
    var l = tableInfo.length;
    for (var i = 0; i < l; i++) {
        temp = tableInfo.pop();
        temp.shift();
        temp.shift();
        arr2send[i] = temp.splice(0, 6);
    }
    return arr2send;
}

function send_table() {
    var arr2send = table2array();
    console.log(arr2send);
    if (arr2send.length == 0) return;
    var msg = {
        command: 'push_data_db_preluare',
        data: [arr2send]
    }
    ws.send(JSON.stringify(msg));
}

function update_cod_sac() {
    var arr2send = form2array();
    console.log(arr2send);
    if (arr2send.length == 0) return;
    var msg = {
        command: 'edit_data_db_preluare',
        data: [[arr2send]],
        cod_sac: arr2send[0],
        user: {
            nume: user,
            tabel: page_name,
            vi: dateov,
            vf: arr2send.slice(1),
        }
    }
    if (JSON.stringify(msg.user.vi) != JSON.stringify(msg.user.vf))
        ws.send(JSON.stringify(msg));
}

function form2array() {
    var arr2send = [];
    //msg_data:  [ [ [ 'cod_sac', 'client', 'oras', 'suma', 'moneda', 'post' ] ] ]
    arr2send.push($("#fcodsac").val());
    arr2send.push($("#nume_client").val().toUpperCase());
    arr2send.push($("#oras").val().toUpperCase());
    arr2send.push(parseFloat($("#suma").val()).toFixed(2));
    arr2send.push($("#moneda").val());
    arr2send.push($("#post_alocat").val().toUpperCase());

    return arr2send;
}

var dateov;
function edit_cs(date) {
    dateov = $.map(date, function (value, index) {
        if (index != 'data_preluare' && index != 'cod_sac') return [value];
    });
    $("#fcodsac").val(date.cod_sac);
    $("#nume_client").val(date.client);
    $("#oras").val(date.oras);
    $("#suma").val(date.valoare_declarata);
    $("#moneda").val(date.valuta);
    $("#post_alocat").val(date.post_alocat);

    $("#adauga").html("Actualizeaza cod sac " + date.cod_sac);
    $("#adauga").off().on('click', update_table_row);
    $("#fcodsac").prop("disabled", true);
    $("#moneda").prop("disabled", true);
    to_edit_row = 1;
    window.scrollTo(0, 0);
    $("#nume_client").focus();
}

function ws_msg(received) {
    switch (received.content) {
        case "RcheckCBduplicate":
            if (received.data.length) cod_sac_existent(received.data[0]);
            else search_file();
            break;
        default: console.log("Unknown data received: ", received);
    }
}

function search_file() {
    var cod_sac = $('#fcodsac').val().toUpperCase();

    if (cod_sac.length == 0) return

    if (File_data[cod_sac] !== undefined) {
        console.log("Clientul este", File_data[cod_sac]);
        beep();
        if (File_data[cod_sac].post_alocat == '') {
            $('#tabelp tr td').filter(function () {
                return $(this).text() === cod_sac && $(this).text().length === cod_sac.length;
            }).parent().trigger('dblclick');
            //        load_form_data(row[0]);
        } else {
            File_data[cod_sac].post_alocat = '';
            insert_row_preluare(File_data[cod_sac], 'editabil');
            $('#fcodsac').val('');
        }
    } else if ($('#tabelp tr td').filter(function () {
        return $(this).text() === cod_sac && $(this).text().length === cod_sac.length;
    }).parent().length > 0) {
        beep();
        console.log('Cod ' + cod_sac + ' in tabel', $('#tabelp tr').find('td:containsExact(' + cod_sac + ')').parent())
        $('#tabelp tr td').filter(function () {
            return $(this).text() === cod_sac && $(this).text().length === cod_sac.length;
        }).parent().trigger('dblclick');
    }
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}

function cod_sac_existent(date) {
    $(`<div style="text-align:center" id="cs_existent">
    Codul ${$('#fcodsac').val()} exista<br>din data 
        ${new Date(date.data_preluare.slice(0, -1)).toLocaleDateString('ro-RO')}
        pentru client:<br> ${date.client}</div>`).dialog({
        modal: true,
        minWidth: 370,
        close: function (event, ui) { $(this).dialog('close').remove(); },
        title: " Cod de bare existent! ",
        buttons: {
            'Editează': function () {
                edit_cs(date);
                $(this).dialog('close').remove();
            },
            'Ok': function () {
                $(this).dialog('close').remove();
            }
        }
    });
    $('#fcodsac').val("");
}

function rtry() {
    if (!$('#sel_file_msg').length) {
        window.requestAnimationFrame(rtry);
    } else {
        $('#sel_file_msg').html("Încărcare fișier...");
    }
};

function handleFile(e) {
    if (e.target.files.length == 0) return;
    $('#sel_file_msg').html("Încărcare fișier...");
    rtry();
    var files = e.target.files, f = files[0];
    var filename = f.name.split(".")

    if ((filename[filename.length - 1] == "xls") || (filename[filename.length - 1] == "xlsx")) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });

            var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.RepClientSumeColectateRemise, { header: "A" });
            console.log(XL_row_object);

            var test = {
                "B": "Nume Client",
                "C": "Nume Locatie",
                "D": "Regiune G4S",
                "E": "Judet",
                "F": "Oras",
                "G": "Tip",
                "H": "Data realizarii",
                "I": "Cod sac",
                "J": "Tip operatie",
                "K": "Expeditor",
                "L": "Destinatar",
                "M": "Tip sac",
                "N": "Valuta",
                "O": "Suma"
            };
            var i = 3;
            if (JSON.stringify(test) === JSON.stringify(XL_row_object[2])) {
                $('#sel_file_msg').html("Fișier încărcat");
                while (i < XL_row_object.length) {
                    //                    console.log(XL_row_object[i]);
                    if (XL_row_object[i].J === 'Colectare' || XL_row_object[i].J === 'Colectare TU')
                        File_data[XL_row_object[i].I.toUpperCase()] = {
                            "cod_sac": XL_row_object[i].I.toUpperCase(),
                            "client": XL_row_object[i].C.toUpperCase(),
                            "oras": XL_row_object[i].F.toUpperCase(),
                            "valoare_declarata": XL_row_object[i].O,
                            "valuta": XL_row_object[i].N.toUpperCase(),
                        } //'cod_sac', 'client', 'oras', 'valoare_declarata', 'valuta'
                    i++;
                }
                console.log(File_data);
            } else $("#sel_file_msg").html("Fișier incompatibil.");
        };
        reader.readAsBinaryString(f);
    } else $("#sel_file_msg").html("Fișier incompatibil.");
    //    setTimeout(function () { $("#sel_file_msg").html(""); }, 5000);
}
