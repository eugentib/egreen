var procesare = true;
page_name = 'procesare';
var my_body;

function insert_row_procesare(date) {
    var dataset;
    if (page_name == 'procesare') dataset = ['fid', 'flocal', 'fcentru', 'foperator', 'fpost', 'fcodsac', 'fclient', 'fvaluta', 'fvaloare', 'ftip', 'fziua'];
    else dataset = ['fid', 'flocal', 'fcentru', 'fpost', 'fcodsac', 'fclient', 'fvaluta', 'fvaloare', 'ftip', 'fziua'];
    var adate = [];
    for (var key in date) {
        if (adate.indexOf(key) === -1) {
            adate.push(key);
        }
    }

    date.valoare_procesata = date.valoare_procesata ? Number(date.valoare_procesata).toFixed(2) : '';
    var r_id = date.cod_sac + (date.id_monetar ? '_' + date.id_monetar : '');

    date.id = $('#tabelp tr').length;

    date.data_procesare = date.data_procesare ? new Date(date.data_procesare.slice(0, -1)).toLocaleDateString('ro-RO') : '';
    date.endTime = date.endTime ? new Date(date.endTime.slice(0, -1)).toLocaleDateString('ro-RO') : '';

    var row = '<tr class="ns" id="' + r_id + '"><td data-filtru="fck" class="get_monetar"><i class="fa fa-search-plus"></i></td>';

    for (j = 0; j < adate.length; j++) row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + '</td>';
    row += '</tr>';
    my_body += row;
//    $('#tabelp tbody').prepend(row);
}

function array_to_procesare(inregistrari, salvabil) {        //Se populeaza tabelul din procesare cu datele venite de la server
//    console.log(inregistrari)
    my_body = '';
    for (var i = 0; i < inregistrari.length; i++) {
        insert_row_procesare(inregistrari[i]);
    }
    $('#tabelp tbody').html(my_body);
    $("#tabelp tbody tr:not('.trmonetar')").chess_table();
    get_total();
}

function adauga_monetar(id) {    //id este in forma "editeaza_idmonetar"
    console.log(id.split('_')[1]);
    var cod_sac = $('#' + id).data('cod_sac');
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({
        command: "insert_m_monetar",
        data: [
            user,
            id.split('_')[1],
            id.split('_')[1]
        ]
    }));
    else {
        setTimeout(adauga_monetar, 1000);
        return;
    }
}

function close_monetar_m() {
    $(this).parent().find("td:first").html("<i class=\"fa fa-search-plus\">");
    $(this).parent().find("td:first").toggleClass('close_monetar get_monetar');
    $(this).parent().next().remove();
}


function edit_monetar(id) {     //id este in forma "editeaza_idmonetar"
    console.log($('#' + id));    //Activeaza editarea monetarului
    if ($('#' + id).html() == '<i class="fa fa-edit" style="font-size: 15px;color: rgb(0,0,0);"></i>&nbsp; &nbsp;Editeaza') {
        if ($('.trmonetar:has(p)').length) {
            custom_alert('Exista alt monetar in editare<br>Renunțați sau salvați pentru a putea edita!');
            return;
        }
        $('#' + id).html('<p><i class="fa fa-save" style="color: rgb(0,0,0);font-size: 15px;"></i>&nbsp; &nbsp;Salvează</p>');
        var id = id.split('_')[1];
        console.log(id);
        $(".ascuns." + id).toggleClass('ascuns vizibil');
        $('.mf.' + id).css({ "background": "#AAAAAA", "pointer-events": "all" });
        $('.mf').inputFilter(function (value) {
            return /^-?\d*$/.test(value);
        });
    } else {
        //Dezactiveaza editare si trimite datele din monetar pentru salvare
        var cod_sac = $('#' + id).data('cod_sac');
        var valuta = $('#' + id).data('valuta');
        $('#' + id).html('<i class="fa fa-edit" style="font-size: 15px;color: rgb(0,0,0);"></i>&nbsp; &nbsp;Editeaza');
        var moneatar_id = id.split('_').pop();
        //        moneatar_id = moneatar_id[moneatar_id.length-1];

        var date = [], dateov = [], save = false;
        var temp = [null, null, null, null, null, null]
        var tempov = [null, null, null, null]
        var denominatie, nume, calitate;
        $('.mf.' + moneatar_id).map(function () {
            var cantitate = $(this).val();  // cantitatea modificata
            var cov = $(this).data('ov');   // cantitatea originala
            if (cantitate == '' || cantitate == '0' || cantitate == 0) cantitate = null;
            if (denominatie != $(this).data('denominatie')) {
                if (save) {
                    date.push(temp);
                    dateov.push(tempov);
                    temp = [null, null, null, null, null, null];
                    tempov = [null, null, null, null];
                    save = false;
                }
                denominatie = $(this).data('denominatie');
                nume = $(this).attr('name').split(' ');
                temp[0] = moneatar_id;
                temp[1] = denominatie;
                calitate = nume[0];
                switch (calitate) {
                    case 'fit': temp[2] = cantitate; tempov[0] = cov; break;
                    case 'unfit': temp[3] = cantitate; tempov[1] = cov; break;
                    case 'mix': temp[4] = cantitate; tempov[2] = cov; break;
                    case 'fals': temp[5] = cantitate; tempov[3] = cov; break;
                }
                if (cov != $(this).val()) { save = true; console.log(temp); }
            } else {
                nume = $(this).attr('name').split(' ');
                temp[0] = moneatar_id;
                calitate = nume[0];
                switch (calitate) {
                    case 'fit': temp[2] = cantitate; tempov[0] = cov; break;
                    case 'unfit': temp[3] = cantitate; tempov[1] = cov; break;
                    case 'mix': temp[4] = cantitate; tempov[2] = cov; break;
                    case 'fals': temp[5] = cantitate; tempov[3] = cov; break;
                }
                if (cov != $(this).val()) { save = true; console.log(temp); }
            }
        })
        if (save) { date.push(temp); dateov.push(tempov); }
        if (date.length) {
            console.log(date);  //{"nume":"Dumitrascu Sorin","vi":[[null,null,"",""]],"vf":[["274",500,null,null,"1",null]]}
            var msg = {
                command: 'update_monetar',
                data: [date],
                cod_sac: cod_sac,
                valuta: valuta,
                user: {
                    nume: user,
                    tabel: page_name,
                    vi: dateov,
                    vf: date,
                }
            }
            if ($("#incarca_reconcilieri").length > 0) msg.command = 'update_monetar_dif';
            ws.send(JSON.stringify(msg));
        }

        $(".vizibil").toggleClass('vizibil ascuns');
        $('.mf.' + moneatar_id).css({ "background": "none", "pointer-events": "none" });
    }
}

