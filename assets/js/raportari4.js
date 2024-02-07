page_name = 'raportari4'

var adaugam = false;
var denominatii = [];
var den_tmpl;

$("#incarca_raportari3").on('click', get_raportari4_data);
$("#moneda").on('change', get_valute);
$('#show_monede').on('click', ckick_moneda);
$('#show_bancnote').on('click', ckick_moneda);
$('#expand_all').on('click', expand_all);

function expand_all() {
    $('#expand_all').html('<i class="fa fa-search-minus"></i>')
    $(".get_monetar").filter(":visible").trigger("click");
    $('#expand_all').off('click');
    $('#expand_all').on('click', colapse_all);
}

function colapse_all() {
    $('#expand_all').html('<i class="fa fa-search-plus"></i>')
    $('#expand_all').off('click');
    $('#expand_all').on('click', expand_all);
    $(".close_monetar").filter(":visible").trigger("click");
}

function valute_to_denominatii(valuta) {
    den_tmpl = valuta;
    array_to_denominatii();
}

function ckick_moneda() {
    if ($('#show_monede').is(":checked") == false && $('#show_bancnote').is(":checked") == false) $('#show_bancnote').prop('checked', true);
    array_to_denominatii();
}

function array_to_denominatii() {
    console.log(den_tmpl)
    var include_monede = $('#show_monede').is(":checked");
    var include_bancnote = $('#show_bancnote').is(":checked");
    console.log(include_monede);
    denominatii = [];
    if (include_monede)
        $('#colspanMonede').replaceWith('<th id="colspanMonede" colspan="4"><span>Monede</span></th>')
    else
        $('#colspanMonede').replaceWith('<th id="colspanMonede" colspan="4" class="hide"><span></span></th>')
    if (include_bancnote)
        $('#colspanBancnote').replaceWith('<th id="colspanBancnote" colspan="7"><span>Bancnote</span></th>')
    else
        $('#colspanBancnote').replaceWith('<th id="colspanBancnote" colspan="4" class="hide"><span></span></th>')
    var nd = {}, html_denominatii = ``,
        html_filtre = `
    <th class="text-center"><input id="fid" type="text" class="filterN"></th>
    <th class="text-center"><input id="fcodsac" type="text" class="filter"></th>
    <th class="text-center"><input id="fziua" type="text" class="filter"></th>
    <th class="text-center"><input id="fora" type="text" class="filter"></th>
    <th class="text-center"><input id="foperator" type="text" class="filter"></th>
    <th class="text-center"><input id="fmod" type="text" class="filter"></th>
    <th class="text-center"><input id="fpost" type="text" class="filter"></th>
    <th class="text-center"><input id="fvaloare" type="text" class="filter"></th>`;
    den_tmpl.forEach(function (v) {
        if (v.tip == 'COIN') {
            if (include_monede) {
                html_denominatii += `<th style="width: 58px;" class="text-center sort"><span>${v.valoarea}<br></span></th>`;
                html_filtre += `<th class="text-center"><input id="${'C' + v.valoarea.replace('.', '')}" type="text" class="filter"></th>`;
                denominatii.push((v.tip == 'BILL' ? 'B' : 'C') + v.valoarea);
                nd[v.tip] = (nd[v.tip] || 0) + 1;
            }
        } else if (include_bancnote) {
            html_denominatii += `<th style="width: 58px;" class="text-center sort"><span>${v.valoarea}<br></span></th>`;
            html_filtre += `<th class="text-center"><input id="${'B' + v.valoarea}" type="text" class="filter"></th>`;
            denominatii.push((v.tip == 'BILL' ? 'B' : 'C') + v.valoarea);
            nd[v.tip] = (nd[v.tip] || 0) + 1;
        }
    });
    console.log(denominatii);
    $('#colspanBancnote').attr('colspan', nd.BILL);
    $('#colspanMonede').attr('colspan', nd.COIN);
    $('#colspanMonetar').attr('colspan', denominatii.length);
    $("#denominatii").html(html_denominatii);
    $("#fdxxx").html(html_filtre);
    $('.sort').off('click', sort);
    $('.sort').on('click', sort);
    $inputs = $('.filter');
    $inputs.on('input change paste', filtreaza);
    $("#tabelp > tbody").empty();
    $("#tabelp > tfoot").empty();
    $("#footclone").empty();
    $table.floatThead('destroy');
    $table.floatThead(floatParam);

}

function get_raportari4_data() {
    $("#sel_data_msg").html("Încărcare date...");
    var data = datepicker2mysqldate('#datepicker');
    var data2 = datepicker2mysqldate('#datepicker2');
    var msg = {
        command: 'get_from_db_raportari4',
        data: [data + ':00', data2 + ':59', $('#moneda').val()],
        denominatii: denominatii
    }
    ws.send(JSON.stringify(msg));
}

function list_denominatii() {
    let i = 0, out = '', tdem = denominatii.slice();
    tdem = tdem.join('_').replace(/\./g, '').split('_');
    do
        out += `<td  data-filtru="${tdem[i]}" class='expm3'>${denominatii[i].substr(1)}</td>`;
    while (i++ < (denominatii.length - 1))
    return out;
}


var dataset, data_filtru, my_body;

function insert_row_raportari3(date) {
    var r_id = date.fcodsac;
//    console.log(dataset, date)

    date.fid = 0;//$('#tabelp tbody tr').length;

    date.fvaloare = Number(date.fvaloare).toFixed(2);
    date.fora = new Date(date.fziua.slice(0, -1)).toLocaleTimeString('ro-RO');
    date.fziua = new Date(date.fziua.slice(0, -1)).toLocaleDateString('ro-RO');

    var row = '<tr class="ns" id="' + r_id + '">';

    for (j = 0; j < dataset.length; j++)
        row += '<td data-filtru="' + data_filtru[j] + '">' + date[dataset[j]] + '</td>';

    row += '</tr>';
    my_body += row;
//    $('#tabelp tbody').prepend(row);
}

function array_to_raportari3(inregistrari) {        //Se populeaza tabelul din procesare cu datele venite de la server
    console.log(inregistrari)
    my_body = '';
    dataset = ['fid', 'fcodsac', 'fziua', 'fora', 'foperator', 'fmod', 'fpost', 'fvaloare'],
        data_filtru = dataset.slice();
    dataset.push(...denominatii);
    data_filtru.push(...denominatii.join('_').replace(/\./g, '').split('_'));
    for (var i = 0; i < inregistrari.length; i++) {
        insert_row_raportari3(inregistrari[i]);
    }
    $('#tabelp tbody').html(my_body);
    //    $("#tabelp tbody tr:not('.trmonetar')").chess_table();
    get_total3();
}

function get_total3() {
    var total_proc = 0;
    var bancnote = {}, bt = '';
    var valoare_bancnote = {}, nb = '';
    var monede = {}, mt = '';
    var valoare_monede = {}, nm = '';
    denominatii.forEach((den) => {
        if (den[0] == 'B') bancnote[den] = 0;
        else monede[den] = 0;
    });

    var total_r = $('#tabelp tbody tr:visible').not('.trmonetar').length;//tr:not('[class=rowSkip]')" $("span[id*=foo]")
    console.log('trr', total_r)
    $('#tabelp tbody tr:visible').not('.expm3').each((i, v) => {
        $(v).children('td:nth-child(1)').html(total_r - i);
        total_proc += parseFloat($(v).children('td[data-filtru="fvaloare"]').html() || 0);
        denominatii.forEach((den) => {
            if (den[0] == 'B') bancnote[den] += parseFloat($(v).children(`td[data-filtru="${den}"]`).html() || 0);
            else monede[den] += parseFloat($(v).children(`td[data-filtru="${den.replace(/\./g, '')}"]`).html() || 0);
        });
    })
    $("#tabelp tbody tr:not('.trmonetar'):visible").chess_table();
    console.log(total_proc, bancnote, monede)
    denominatii.forEach((den) => {
        if (den[0] == 'B') {
            nb += `<td>${bancnote[den]}</td>`;
            //            bt += `<td>${Number(bancnote[den] * parseFloat(den.substr(1))).toFixed(2)}</td>`;
            bt += `<td>${Number(bancnote[den] * parseFloat(den.substr(1))).toFixed(0)}</td>`;
            valoare_bancnote[den] = bancnote[den] * parseFloat(den.substr(1));
        }
        else {
            nm += `<td>${monede[den]}</td>`;
            mt += `<td>${Number(monede[den] * parseFloat(den.substr(1))).toFixed(2)}</td>`;
            valoare_monede[den] = monede[den] * parseFloat(den.substr(1));
        }
    })

    //    if (nm != '') nm += '<'
    console.log(valoare_bancnote, valoare_monede)


    var info_procesare;

    $("#tabelp").find('tfoot').html($('<tr><td colspan="7">Total numarate</td><td></td>' + nb + nm + '</tr>' +
        `<tr><td colspan='7'>Total sume</td><td>${total_proc.toFixed(2)}</td>${bt + mt}`));

    //        $('#f_total_procesat').html(info_procesare);
    //    console.log(total_preluare)
    var evt = new UIEvent('resize');
    window.dispatchEvent(evt);
    ////*/
    setTimeout(function () {
        if ($(document).height() > $(window).height()) {
            // scrollbar

            var clogrp = '<colgroup>';//'<col style="width: 25px;">'; $("#tabelp").offsetWidth
            var clone = $("#tabelp").find('tfoot').html(), i = 0;
            console.log(clone)
            $("#tabelp thead tr:last th").each(function () {
                console.log($(this), $(this)[0].offsetWidth);
                $($("#footclone").find('tr').children()[i++]).width($(this)[0].offsetWidth);
                clogrp += '<col style="width: ' + $(this)[0].offsetWidth + 'px;">';
            });
            clogrp += '</colgroup>';
            $('#f_total_procesat').html('<table class="table tabelr3foot" id="footclone">' + clogrp + '<tbody></tbody><tfoot>' + clone + '</tfoot></table>');

            //        $("#footclone").removeAttr('style');
        } else $('#f_total_procesat').html('');
    }, 100);
}

$('title').html($('title').html() + '>Raportari4');

