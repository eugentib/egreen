/**
 * Created by CristianUricariu on 29/09/2019.
 */
var raportari_filtre = true;
page_name = 'statistici'


filtre_statistica = [
    { "db": "data_preluare", "nume": "Data preluare" },
    { "db": "data_procesare", "nume": "Data procesare" },
    { "db": "operatiuni.cod_sac", "nume": "Cod Bare" },
    { "db": "oras", "nume": "Localitate CP" },
    { "db": "locatie", "nume": "Locatie CP" },
    { "db": "valoare_declarata", "nume": "Valoare declarata" },
    { "db": "centru", "nume": "Centru" },
    { "db": "valoare_procesata", "nume": "Valoare procesata" },
    { "db": "diferente", "nume": "Diferente" },
    { "db": "fals", "nume": "Fals" },
    { "db": "operator", "nume": "Operator" },
    { "db": "post", "nume": "Post" },
    { "db": "echipament", "nume": "Echipament" },
    { "db": "mod_lucru", "nume": "Mod lucru" },
];
filtre_statistica_monetar = [
   // { "db": "operatiuni.data_preluare", "nume": "Data preluare" },

    { "db": "operatiuni.centru", "nume": "Centru" },
    { "db": "monetare.cod_sac", "nume": "Cod Bare" },
    { "db": "operatiuni.data_procesare", "nume": "Data procesare" },
    { "db": "detaliere_monetare.denominatie", "nume": "Denominatie" },
    { "db": "operatiuni.diferente", "nume": "Diferente" },
    { "db": "monetare.echipament", "nume": "Echipament" },
    { "db": "detaliere_monetare.fals", "nume": "Fals" },
    { "db": "detaliere_monetare.fit", "nume": " Fit" },
    { "db": "operatiuni.oras", "nume": "Localitate CP" },
    { "db": "operatiuni.locatie", "nume": "Locatie CP" },
    { "db": "detaliere_monetare.mix", "nume": " Mix" },
    { "db": "monetare.operator", "nume": "Operator" },
    { "db": "monetare.startTime", "nume": " Ora inceput" },
    { "db": "monetare.endTime", "nume": " Ora sfarsit" },
    { "db": "monetare.post", "nume": "Post" },
    { "db": "monetare.diferenta_timp", "nume": "Timp lucru" },
    { "db": "detaliere_monetare.unfit", "nume": " Unfit" },
    { "db": "monetare.valuta", "nume": " Valuta" },
    { "db": "monetare.valoare_procesata", "nume": "Valoare procesata" },
    { "db": "operatiuni.valoare_declarata", "nume": "Valoare declarata" },
];




function ws_msg(received) {
    switch (received.content) {
        case "filtreaza_client_grup":
            if (received.data.length > 0) {
                insert_row_statistica(received.data,true);
              //  add_even_odd();
              //  $("#tabelp").appendTo(received.data);
                $('.index_th').remove();
                $('.sort_statistici').click(sort_statistici);
            } else { }
            break;


        case "filtreaza_statistica_return":
            if (received.data.length > 0) {
                insert_row_statistica(received.data,false);
                $('.totaluri').remove();
                calcul_total('valoare_declarata');
                calcul_total('valoare_procesata');
                add_even_odd();
                $('.sort_statistici').click(sort_statistici);
            } else { }
            break;

        case "get_from_db_clients_to_select":
            if (received.data.length > 0) {
                $("#client_id").empty();
                $(received.data).each(function (k, v) {
                    var newOption = '<option value="' + v.client + '">' + v.client + '</option>';
                    $('#client_id').append(newOption);
                });
                $('#client_id').trigger("chosen:updated");

                $('#client_id').chosen().on("change", function(event, params) {
                    if (params.selected) {
                        filtreaza_client_grup(params.selected);
                      //  console.log('The option: ' + params.selected + ' was selected.');
                    }
                    if (params.deselected) {
                        $('.section').each(function () {
                            if($(this).attr('data-title') == params.deselected){
                                $(this).remove();
                            }
                        });
                        $('.header').each(function () {
                            if(str_replace('_',' ',$(this).attr('tr_client')) == params.deselected){
                                $(this).remove();
                            }
                        });




                        //  console.log('The option: ' + params.deselected + ' was deselected.');
                    }
                });
                $('.clienti_index').remove();

            } else { }
            break;


        case "raportari_filtre":
            if (received.data.length > 0) {
                $("#tabelp > tbody").empty();
                array_to_raportari(received.data, false);
                $("#sel_data_msg").html("");
            } else {
                $("#sel_data_msg").html("NU exista operatiuni pentru perioada selectată.");
                setTimeout(function () { $("#sel_data_msg").html(""); }, 5000);
            }
            break;
        default: console.log("Unknown data received startistica.js: " + received);
    }
}

function json2array(json){
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        result.push(
            {
                "filtru": key,
                "valoare": json[key]
            }
        );
    });
    return result;
}

function insert_row_statistica(obj_data,append) {
    arrays = [];
    $("#tabelp").show();


    if(append == false)  {       $("#tabelp > tbody").empty();}
    if($('.grupare_clienti').length == 0)  {       $("#tabelp").empty();}

    var cels = '<th  class="index_th">#</th>'; var cels2 = ''; var body = '';
    var table_header = '' +
        '<thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;">';


    $(obj_data).each(function (o,jsons) {
        $(jsons).each(function (k,json) {
            arrays = (json2array(json));
         });
    });
    let number_col = arrays.length;
    col_with = Math.round(parseFloat($(window).width()) / number_col);
    $(arrays).each(function (k,array) {
        filtru = (array.filtru);
        val = (array.valoare);
         cels += '<th class="text-left sort_statistici" style="width: '+col_with+'px;color: rgb(235,242,250);">' +
             '<span style="color: rgb(235,242,250);">'+ucfirst(filtru.replace('_',' '),true) +'&nbsp;<br></span>'+
            '<i class="fa fa-sort float-right" style="color: rgb(235,242,250);margin-top: -18px;margin-right: 6px;"></i>' +
            '</th>';
    });

    table_header += ' <tr class="text-center text-light"> ' + cels + '</tr>';
    $(arrays).each(function (k,array) {
        filtru = (array.filtru);
        val = (array.valoare);
      //  cels2 += '<th class="text-center"><input id="'+filtru+'" type="text" class="filter_statistica"></th> ';
    });

    table_header += '  <tr class="text-center text-light" style="background-color: #d6dee7; "> ' + cels2 + '</tr></thead>';


    $(obj_data).each(function (o,jsons) {
        $(jsons).each(function (k,json) {
            nume_client = json.client;
            body += '<tr data-title="'+json.client+'" class="section">';
            arrays = (json2array(json));
            $(arrays).each(function (k,array) {
                filtru = (array.filtru);
                val = (array.valoare);
                body += '<td data-filtru="'+filtru+'" tr_copii_client="'+str_replace(' ','_',nume_client) +'">' + filter_val(val,filtru) + '</td>';
            });
            body += '</tr>';
        });
    });

    if(append == false) {           //filtrare
        console.log('filtrare');
        body = '<tbody>' + body+ '</tbody>';
        var tablex = table_header + body;
        if(!$(obj_data)) { tablex = 'Nici un rezultat! Redefineste filtrele';}
        $("#tabelp").html(tablex);
    } else {                         //grupare clienti
        console.log('grupare clienti');
        tr_header = '<tr class="header" tr_client="'+str_replace(' ','_',nume_client)+'">' + '</tr>';

        if($("#tabelp tbody").length < 1){ //primul client selectat
            if(!$(obj_data)) { tablex = '<h2>Nici un rezultat! Redefineste filtrele</h2>';}
            body = table_header + '<tbody class="grupare_clienti">' + tr_header + body+tablex+ '</tbody>';
            $("#tabelp").html( body );
        } else {
            if(!$(obj_data)) { tablex = '<h2>Nici un rezultat! Redefineste filtrele</h2>';}
            $("#tabelp tbody").append( tr_header + body +tablex );
        }

    }

    var $inputs = $('.filter');
    $inputs.on('input change paste', filtreaza);
    $('.sort').click(sort);


    var valoare_declarata = 0;
    var valoare_procesata = 0;

    $('.header').each(function (k,header_obj) {
        clientx = $(header_obj).attr('tr_client');
        $(arrays).each(function (k,array) {
            $('[tr_copii_client='+clientx+']').each(function (kk,tr_copii_client) {
               if($(tr_copii_client).attr('data-filtru') == 'valoare_declarata'){
                   valoare_declarata = parseFloat($(tr_copii_client).text()) ? round(parseFloat($(tr_copii_client).text()),2) : 0 + (valoare_declarata);
               }
                if($(tr_copii_client).attr('data-filtru') == 'valoare_procesata'){
                    valoare_procesata = parseFloat($(tr_copii_client).text()) ? parseFloat($(tr_copii_client).text()) : 0 + parseFloat(valoare_procesata);
                }
            });
        })
        nume_client =  $(header_obj).attr('tr_client');
        var td_header =  '<td style="text-align: left" colspan="'+number_col+'">' +
            '<span style="color: #0b3e6f">' + nume_client + '</span>   ' +
            ($('[db=valoare_declarata]') . hasClass('filtru_active') ? '<span>Valoare declarata: '+round(valoare_declarata,2)+'</span>    ' : '') +
            ($('[db=valoare_procesata]') . hasClass('filtru_active') ? '<span>Valoare procesata: '+round(valoare_procesata,2)+'</span>    ' : '') +
            '</td>';
        $(header_obj).html(td_header);
    });
    $('.header').css('background', 'rgb(119, 173, 235)');


}

function round(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

function str_replace (search, replace, subject) {

    var i = 0
    var j = 0
    var temp = ''
    var repl = ''
    var sl = 0
    var fl = 0
    var f = [].concat(search)
    var r = [].concat(replace)
    var s = subject
    s = [].concat(s)

    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + ''
            repl = r[0]
            s[i] = (temp).split(f[j]).join(repl)
            if (typeof countObj !== 'undefined') {
                countObj.value += ((temp.split(f[j])).length - 1)
            }
        }
    }
    return s[0]
}





function insert_row_raportari(date) {
    //    console.log(date);
    var dataset = ['fid', 'flocal', 'fcentru', 'fpost', 'fcodsac', 'fclient', 'fvaluta', 'fvaloared', 'fvaloare', 'fziuap', 'fziua', 'fdif', 'ffals'];
    var adate = [];
    for (var key in date) {
        if (adate.indexOf(key) === -1) {
            adate.push(key);
        }
    }

    date.valoare_procesata = date.valoare_procesata ? Number(date.valoare_procesata).toFixed(2) : '';
    date.valoare_declarata = date.valoare_declarata ? Number(date.valoare_declarata).toFixed(2) : '';
    date.diferente = date.diferente ? Number(date.diferente).toFixed(2) : '';
    date.diferente = date.diferente == '0.00' ? '' : date.diferente;

    var dif = date.valoare_procesata == '' ? 'style = "background: yellow;"' : '';
    dif = date.diferente !== '' ? 'style = "background: red;"' : dif;

    var r_id = date.cod_sac;

    date.id = $('#tabelp tr').length;
    date.fals = date.fals ? '<div class="transparent">!</div><i class="fa fa-exclamation-circle"></i>' + date.fals : '';

    date.data_preluare = date.data_preluare ? new Date(date.data_preluare.slice(0, -1)).toLocaleDateString('ro-RO') : '';
    date.data_procesare = date.data_procesare ? new Date(date.data_procesare.slice(0, -1)).toLocaleDateString('ro-RO') : '';

    var row = '<tr class="ns" id="' + r_id + '"><td data-filtru="fck" ' + dif + ' class="get_monetar"></td>';
    //var row = '<tr class="ns" id="' + r_id + '"><td data-filtru="fck" ' + dif + ' class="get_monetar"><i class="fa fa-search-plus"></i></td>';

    for (j = 0; j < adate.length; j++) row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + '</td>';
    row += '</tr>';
    $('#tabelp tbody').prepend(row);
}

function array_to_raportari(inregistrari, salvabil) {        //Se populeaza tabelul din procesare cu datele venite de la server
    console.log(inregistrari)
    for (var i = 0; i < inregistrari.length; i++) {
        insert_row_raportari(inregistrari[i]);
    }
    $("#tabelp tbody tr:not('.trmonetar')").chess_table();
}

function update_row_raportari(cod_sac, valoare_procesata, fals) {
    $('#' + cod_sac + ' td:eq(13)').html(fals ? '<div class="transparent">!</div><i class="fa fa-exclamation-circle"></i>' : '');
    $('#' + cod_sac + ' td:eq(9)').html(Number(valoare_procesata).toFixed(2));
    let diff = $('#' + cod_sac + ' td:eq(9)').html() - $('#' + cod_sac + ' td:eq(8)').html();
    if (diff) diff = diff.toFixed(2); else diff = '';
    if (valoare_procesata > 0) {
        if (diff !== '') $('#' + cod_sac + ' td:eq(0)').css('background-color', 'red');
        else $('#' + cod_sac + ' td:eq(0)').css('background-color', 'inherit');
    }
    $('#' + cod_sac + ' td:eq(12)').html(diff);
}



function toggle_btn(obj) {
    if ($(obj).hasClass('filtru_inactive')) { //e dezactivat
        $(obj).removeClass('filtru_inactive').addClass('filtru_active');
    } else {
        $(obj).removeClass('filtru_active').addClass('filtru_inactive');
    }
}

function get_changed_select_value(select_obj) {
    $(select_obj).chosen().on("change", function(event, params) {
        if (params.selected) {
            return params.selected;
          //  console.log('The option: ' + params.selected + ' was selected.');
        }
        if (params.deselected) {
          //  console.log('The option: ' + params.deselected + ' was deselected.');
        }
    });
}

function filtreaza_client_grup(client) {  //grupare
    var filtre = [];

    var filtre_req = [];
    var data = "'"+datepicker2mysqldate('#datepicker') + ':00'+"'";
    var data2 = "'"+datepicker2mysqldate('#datepicker2') + ':59' +"'";

    filtre_req.push({ "client": client} );
    filtre_req.push({ "data_start":data  });
    filtre_req.push({ "data_end": data2 });
    filtre = get_filtre_selected();
    filtre_req.push({ "filtre": filtre.join() });
    var msg = {
        command: "filtreaza_client_grup",
        data: filtre_req
    }
    ws.send(JSON.stringify(msg));
}

function show_raportari_sac(cod_sac,td) {
    var iframe_view = '<iframe style="border: none; height: 900px" width="'+$(window).width()+'" src="/raportari?quick_view='+cod_sac+'"></iframe>';
    temp_row = '<tr><td colspan="'+$('th').length/2+'">'+iframe_view+'</td></tr>';
    if($(td).find('i').hasClass('fa-search-plus')){ //open
        $(td).closest('tr').after(temp_row);
        $(td).find('i').removeClass('fa-search-plus').addClass('fa-search-minus').addClass('3x');
    } else {
        $(td).closest('tr').next('tr').remove();
        $(td).find('i').removeClass('fa-search-minus').addClass('fa-search-plus').removeClass('3x');
    }


}
function date_convert_date(date_time) {
    var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var date = new Date(date_time);
    var year = date.getFullYear();
    var month = date.getMonth() < 10  ? '0'+date.getMonth() : date.getMonth();
    var day = date.getDate() < 10  ? '0'+date.getDate() : date.getDate();
    var convdataTime = day+'-'+month+'-'+year;
    return convdataTime

}
function date_convert(date_time) {
    var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var date = new Date(date_time);
    var year = date.getFullYear();
    var month = date.getMonth() < 10  ? '0'+date.getMonth() : date.getMonth();
    var day = date.getDate() < 10  ? '0'+date.getDate() : date.getDate();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var convdataTime = day+'-'+month+'-'+year+' <br>'+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return convdataTime

}
function filter_val(val,column_name) {
    if($.isNumeric(val) && val < 10){ val = val;}

    if(  column_name == 'startTime' || column_name == 'endTime'  ) {
        return val ? date_convert(val) : '';
    }
    else if(column_name == 'data_procesare' || column_name == 'data_preluare'){
        return val ?  date_convert_date(val) : '';
    }
    else if(column_name == 'valoare_declarata' || column_name == 'valoare_procesata' || column_name == 'diferente') {
        return val>0 ?  '<span style="color:'+(column_name == 'diferente' ? ' red ' : '') +'">' +  Number(val).toFixed(2) + '</span>' : '';
    }
    else if(column_name == 'fals') {
        return val ? '<div class="transparent" style="color: red">!</div><i class="fa fa-exclamation-circle red"></i> '+ val : '';
    }
    else if(column_name == 'cod_sac') {
        return val ? '<a style="cursor: pointer" onclick="show_raportari_sac(\'' + val+ '\',this)">'+val+' <i class="fa fa-search-plus"></i></a>' : '';
    }
    else if(column_name == 'operator' || column_name == 'fit' || column_name == 'unfit'  || column_name == 'mix' ) {    return val ? val : '';}
    else if(column_name == 'echipament') {    return val ? val : '';}
    else if(column_name == 'post') {    return val ? val : '';}
    else if(column_name == 'mod_lucru') {    return val ? val : '';}

    else { return val; }
}

function get_filtre_selected_monetare() {
    filtre = [];
      //  $('.filtreaza_statistica').each(function () {
        $('.filtre_select').each(function () {
            if (1) {
           // if ($(this).hasClass('filtru_active')) {
               // selectie = $(this).attr('db');
                selectie = str_replace('--','.',$(this).val());
                if (selectie == 'monetare.diferenta_timp') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) {
                        selectie = "(SELECT TIMEDIFF(endTime,startTime) from monetare where monetare.id_monetar=detaliere_monetare.id_monetar) as diferenta_timp";
                    } else { //tabel principal monetare
                        selectie = "TIMEDIFF(endTime,startTime) as diferenta_timp";
                    }
                }
                if (selectie == 'detaliere_monetare.fit') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) {}
                    else { //tabel principal monetare
                        selectie = "(SELECT sum(fit) FROM `detaliere_monetare` WHERE detaliere_monetare.id_monetar = monetare.id_monetar) as fit";
                    }
                }
                if (selectie == 'detaliere_monetare.unfit') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) {}
                    else { //tabel principal monetare
                        selectie = "(SELECT sum(unfit) FROM `detaliere_monetare` WHERE detaliere_monetare.id_monetar = monetare.id_monetar) as unfit";
                    }
                }
                if (selectie == 'detaliere_monetare.mix') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) {}
                    else { //tabel principal monetare
                        selectie = "(SELECT sum(mix) FROM `detaliere_monetare` WHERE detaliere_monetare.id_monetar = monetare.id_monetar) as mix";
                    }
                }
                if (selectie == 'detaliere_monetare.denominatie') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) {}
                    else { //tabel principal monetare
                        selectie = "( SELECT GROUP_CONCAT(denominatie) FROM `detaliere_monetare`  WHERE detaliere_monetare.id_monetar = monetare.id_monetar) as denominatie";
                    }
                }
                if (selectie == 'detaliere_monetare.fals') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) {}
                    else { //tabel principal monetare
                        selectie = "(SELECT sum(fals) FROM detaliere_monetare WHERE  detaliere_monetare.id_monetar = monetare.id_monetar and monetare.fals IS NOT NULL) AS fals ";
                    }
                }
                if (selectie == 'operatiuni.data_procesare') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) { }
                    else { //tabel principal monetare
                        selectie = "(SELECT operatiuni.data_procesare FROM `operatiuni` WHERE monetare.cod_sac=operatiuni.cod_sac limit 1) as data_procesare";
                    }
                }
                if (selectie == 'operatiuni.oras') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) { }
                    else { //tabel principal monetare
                        selectie = "(SELECT operatiuni.oras FROM `operatiuni` WHERE monetare.cod_sac=operatiuni.cod_sac limit 1) as oras";
                    }
                }
                if (selectie == 'operatiuni.locatie') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) { }
                    else { //tabel principal monetare
                        selectie = "(SELECT operatiuni.locatie FROM `operatiuni` WHERE monetare.cod_sac=operatiuni.cod_sac limit 1) as locatie";
                    }
                }
                if (selectie == 'operatiuni.valoare_declarata') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) { }
                    else { //tabel principal monetare
                        selectie = "(SELECT operatiuni.valoare_declarata FROM `operatiuni` WHERE monetare.cod_sac=operatiuni.cod_sac limit 1) as valoare_declarata";
                    }
                }
                if (selectie == 'operatiuni.centru') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) { }
                    else { //tabel principal monetare
                        selectie = "(SELECT operatiuni.centru FROM `operatiuni` WHERE monetare.cod_sac=operatiuni.cod_sac limit 1) as centru";
                    }
                }
                if (selectie == 'operatiuni.diferente') {
                    if ($("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active')) { }
                    else { //tabel principal monetare
                        selectie = "(SELECT operatiuni.diferente FROM `operatiuni` WHERE monetare.cod_sac=operatiuni.cod_sac limit 1) as diferente";
                    }
                }
                if(selectie.length > 0) {
                    filtre.push(selectie);
                }
            }
        });

    return filtre;
}


function get_filtre_selected() {
    filtre = [];
 //   $('.filtreaza_statistica').each(function () {
    $('.filtre_select').each(function () {
        if (1) {
        //if ($(this).hasClass('filtru_active')) {
            selectie = str_replace('--','.',$(this).val());
            if (selectie == 'fals') {
                selectie = "(SELECT monetare.fals FROM monetare WHERE cod_sac=operatiuni.cod_sac AND monetare.fals=1) AS fals ";
            }
            if (selectie == 'operator') {
                selectie = " (SELECT CONCAT(nume,'<BR>',operator) FROM monetare " +
                    "LEFT JOIN users AS u ON u.cod_bare = monetare.operator " +
                    "WHERE monetare.cod_sac = operatiuni.cod_sac and monetare.operator IS NOT NULL limit 1) AS `operator` ";
            }
            if (selectie == 'post') {   //xxxx
                selectie = " (SELECT post FROM monetare " +
                    "WHERE monetare.cod_sac = operatiuni.cod_sac and monetare.operator IS NOT NULL limit 1) AS `post` ";
            }

            if (selectie == 'mod_lucru') {
                selectie = " (SELECT mod_lucru FROM monetare " +
                    "WHERE monetare.cod_sac = operatiuni.cod_sac and monetare.operator IS NOT NULL limit 1) AS `mod_lucru` ";
            }

            if (selectie == 'echipament') {
                selectie = " (SELECT post FROM monetare " +
                    "WHERE monetare.cod_sac = operatiuni.cod_sac and monetare.operator IS NOT NULL limit 1) AS `echipament` ";
            }
            if(selectie.length > 0) {
                filtre.push(selectie);
            }
        }
    });
    return filtre;
}


function calcul_total(column_name){
    valoare_declarata = []; valoare_declarata_e = ''; monezi = [];
    $('[data-filtru='+column_name+']').each(function (k,td) {
        val = $(td).find('span').text();
        moneda = $(td).closest('tr').find('[data-filtru=valuta]').text();
        if (typeof monezi[moneda]=='undefined') { monezi[moneda] = moneda;}
                    valoare_declarata[moneda] = parseFloat(val) ? round(parseFloat(val),2) : 0 + (valoare_declarata[moneda]);

        });
    if (typeof monezi['RON']!='undefined'){ valoare_declarata_e += valoare_declarata['RON'] + ' RON | ';}
    if (typeof monezi['EUR']!='undefined'){ valoare_declarata_e += valoare_declarata['EUR'] + ' EUR | ';}
    if (typeof monezi['USD']!='undefined'){ valoare_declarata_e += valoare_declarata['USD'] + ' USD | ';}



     valoare_declarata_txt =  '<div class="totaluri" style="float: left">'+ucfirst(column_name.replace('_',' '),true)+':'+valoare_declarata_e+'</div>    ';
    $('.tfooter').before('<div class="totaluri" style="float: left">'+valoare_declarata_txt+'</div>');
}

function filtreaza_statistica() {
    $('#client_id').val('');          $('#client_id').trigger("chosen:updated");
    var filtre = [];
    var filtre_req = []; var clients_selectati = [];
    var clients_selectatix = $('#client_id').val();
    $(clients_selectatix).each(function (k,v) {
        clients_selectati.push("'" + v + "'");
    })

    var data = "'"+datepicker2mysqldate('#datepicker') + ':00'+"'";
    var data2 = "'"+datepicker2mysqldate('#datepicker2') + ':59' +"'";

    filtre_req.push({ "client": clients_selectati.join() });
    filtre_req.push({ "data_start":data  });
    filtre_req.push({ "data_end": data2 });

    filtre = get_filtre_selected();
    var tip_selectie = "filtreaza_statistica";

    if($('[name=tip_selectie]:checked').val() == 'monetar'){
          tip_selectie = $("[db_btn=detaliere_monetare--denominatie]").hasClass('filtru_active') ? "filtreaza_statistica_monetare_denominatie" : "filtreaza_statistica_monetare";
        filtre = get_filtre_selected_monetare();
    }
    filtre_req.push({ "filtre": filtre.join() });

    var monede_bancnote = "";
    if($('[name=tip_selectie]:checked').val() == 'monetar') {
        var monede_bancnote_var = $('[name=monede_bancnote]:checked').val();
        if (typeof  monede_bancnote_var === 'undefined') {}
        else {
            if ($('[name=monede_bancnote]:checked').val() == 'monede') {
                monede_bancnote = 'monede';
            }
            if ($('[name=monede_bancnote]:checked').val() == 'bancnote') {
                monede_bancnote = 'bancnote';
            }
        }
    }
    filtre_req.push({"monede_bancnote": monede_bancnote});

    var msg = {
        command: tip_selectie,
        data: filtre_req
    }
    ws.send(JSON.stringify(msg));
}

function reseteaza_filtre() {
    $('.raspuns_filtre_select').html('');
    $('.filtru_active').each(function () {
        $(this).removeClass('filtru_active').addClass('filtru_inactive');
    });
    init_filtre();
}
function toggle_filtre(obj,position) {
    $(obj).removeClass('new_select');
    results = [];
    filtru_selectat = $(obj).val();
   // $(obj).prop('disabled',true);
    if(filtru_selectat == ""){return; }
    $('.raspuns_filtre').find('button[db_btn='+filtru_selectat+']').removeClass('filtru_inactive').addClass('filtru_active');
    $('.filtru_inactive').each(function () {
        results.push({"db":$(this).attr('db'),"nume":$(this).text()})
    })
    init_select(results,position++);

}
function init_select(array_select,position) {
    position++; opt ='<option value="">Selecteaza un filtru</option>';
    if($('.new_select').length > 0){ return;}
    $('.raspuns_filtre_select').append('<div style="width: 150px;float: left;"> <select style="" onchange="toggle_filtre(this,'+position+')"' +
        ' class="filtre_select pozitie_'+position+' new_select" id="filtre_select" data-placeholder="Selecteaza un filtru"></select></div>');

    $.each(array_select, function (idx, obj) {
        opt += '<option value="' + str_replace('.','--',obj.db) + '" db="' + obj.db + '">&nbsp; &nbsp;' + obj.nume +'</option>';
    });
  $('.pozitie_'+position).html(opt);
}
function init_filtre() {
    $('#client_id').val('');   $('#client_id').trigger("chosen:updated");
    $("#tabelp > tbody").empty();
    $('#filtreaza_statistica').show();

    get_clients();
    filtre_statisticaX = [];

    $('.tabel_raportari').hide();
    filtre_statisticaX = $.parseJSON(JSON.stringify(filtre_statistica));
    if($('[name=tip_selectie]:checked').val() == 'monetar'){
        $('.monede_bancnote').removeClass('hide');
        $('#reset_statistica').show();
        filtre_statisticaX = $.parseJSON(JSON.stringify(filtre_statistica_monetar));
    } else {
        $('.monede_bancnote').addClass('hide');
    }
    html_btn = '';
        array_select = filtre_statisticaX;
    init_select(array_select,0);
    $.each(filtre_statisticaX, function (idx, obj) {
        html_btn += '<div style="margin-left:5px;color: rgb(4,4,4);height: 40px;padding: 5px;">' +
            '<button style="height: 100%" class="btn btn-primary filtru_inactive float-left filtreaza_statistica"' +
            ' db="' + obj.db + '" db_btn="'+str_replace('.','--',obj.db)+'" type="button" onclick="toggle_btn($(this))">' +
            '&nbsp; &nbsp;' + obj.nume
        '</button></div>';
    });
    $('.raspuns_filtre').html(html_btn);
}





function get_clients() {
    // return;
    var client = 'client';
    var msg = {
        command: "get_from_db_clients",
        data: "client"
    }
    ws.send(JSON.stringify(msg));
}

function tip_selectie_change() {
    $('.raspuns_filtre_select').html('');
    if($('[name=tip_selectie]:checked').val() == 'monetar'){
        $('#client_id').closest('.row').hide()
    } else {
        $('#client_id').closest('.row').show()
    }
    init_filtre();
}
tip_selectie = $('[name=tip_selectie]');
$(tip_selectie).change(function () {
    tip_selectie_change();
});



function sort_statistici() {
    var table = $("#" + $(this).parents('table').attr('class').split(' ')[0]);
        $('[data-filtru=index]').remove();
        $('.clienti_index').remove();

    var rows = table.find('tbody tr').toArray().sort(comparer($(this).index()))
    this.asc = !this.asc
    if (!this.asc) { rows = rows.reverse() }
    for (var i = 0; i < rows.length; i++) {
        index = i+1;
        if($('[data-filtru=data_preluare]').length > 0) {
            $(rows[i]).find('[data-filtru=data_preluare]').before('<td data-filtru="index">' + (index) + '</td>');
        } else {
            $(rows[i]).find('[data-filtru=client]').before('<td  data-filtru="index" class="clienti_index">' + (index) + '</td>');
        }

        $(rows[i]).removeClass("odd even");
        if (i % 2) $(rows[i]).addClass("odd");
        else $(rows[i]).addClass("even");
        table.append(rows[i]);
    }

}

//tip_selectie_change();

$('#incarca_raportari1').click(function () {
    setTimeout(function () {
        var tot = [];
        var result = [];
        var result_procesat = []; var info = '';
        var width = $('#tabelp').width();
        $('[data-filtru=fvaloared]').each(function () {
            moneda = $(this).closest('tr').find('[data-filtru=fvaluta]').text();
            var valoare_procesata = $(this).closest('tr').find('[data-filtru=fvaloare]').text();
            tot.push({
                    "moneda": moneda,
                    "valoare": Number($(this).text()) || 0,
                    "valoare_procesata": Number(valoare_procesata) || 0
                }
            );
        });

        for (var i = 0; i < tot.length; i++) {
            result[tot[i]['moneda']] = (Number(result[tot[i]['moneda']]) || 0) + (Number(tot[i]['valoare']) || 0);
            result_procesat[tot[i]['moneda']] = (Number(result_procesat[tot[i]['moneda']]) || 0) + (Number(tot[i]['valoare_procesata']) || 0);
        }
        info = 'Valoare preluata:';
        info += Number(result.RON) ? '  ' + result.RON + 'RON ' : '';
        info += Number(result.EUR) ? '  ' + result.EUR + 'EUR ' : '';

        info += ' | Valoare procesata:';
        info += Number(result_procesat.RON) ? '  ' + result_procesat.RON + 'RON ' : '';
        info += Number(result_procesat.EUR) ? '  ' + result_procesat.EUR + 'EUR ' : '';

        var footer = '' + '<div style="position:fixed !important; bottom:0px; left:0px; width:' + width + 'px; ' +
            'text-align: center;  margin-left: 15px; z-index:1000; color:white; background-color:  rgb(119, 173, 235)"' +
            ' class="floatThead-container">' + info +
            '</div>';
        $('.table-responsive').after(footer);
        $('.table-responsive').css("margin-bottom", '20px');

    }, 500);
});

$('title').html($('title').html() + ' > Statistica');

jQuery('body').dropdownChosen();

