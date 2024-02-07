/**
 * Created by CristianUricariu on 13/10/2019.
 */
var raportari2 = true;
page_name = 'raportari2'


$("#incarca_raportari2").on('click', get_all_info);

$(function () {
    $(".raportari2_radio_cash").prop('checked', true);
    if ($("[name=raportari2_radio]").val() == 'operatori') {
        $('.cash_zone').addClass('hide');
        $('.operator_zone').removeClass('hide');
    } else {
        $('.cash_zone').removeClass('hide');
        $('.operator_zone').addClass('hide');
    }

})

$("[name=raportari2_radio]").change(
    function () {
        if ($(this).val() == 'operatori') {
            $('.cash_zone').addClass('hide');
            $('.operator_zone').removeClass('hide');
            get_operators_to_select();
        } else {
            $('.cash_zone').removeClass('hide');
            $('.operator_zone').addClass('hide');
        }
    }

);

function get_all_info() {
    if ($('[name=raportari2_radio]:checked').val() == 'cash') {
        request_raportari2_monetar_monede();
        request_raportari2_monetar_bancnote();
        request_raportari2();
    } else {
        request_operators_raport();
    }
}


function request_operators_raport() {
    if ($('#operator').val().length < 1) {    //operator_chosen
        //        alert('Selectati un operator!');
        $('#operator_chosen').effect("pulsate", {}, 1000);
        return;
    }
    filtre_req = [];
    //    var data = (event.target || event.srcElement).parentNode.firstChild;
    $("#sel_data_msg").html("Încărcare date...");
    var data = datepicker2mysqldate('#datepicker');
    var data2 = datepicker2mysqldate('#datepicker2');
    var valuta = $('#moneda').val();
    var semn = $('#nepreluate').is(':checked') ? ('<' + ($('#preluate').is(':checked') ? '>' : '')) : ($('#preluate').is(':checked') ? '>' : '<>');

    $('#operator').trigger("chosen:updated");
    var operator_selectati = [];
    var operator_selectatix = $('#operator').val();
    $(operator_selectatix).each(function (k, v) {
        operator_selectati.push("'" + v + "'");
    })

    filtre_req.push({ "data_start": data + ':00' });
    filtre_req.push({ "data_end": data2 + ':59' });
    filtre_req.push({ "valuta": valuta });
    filtre_req.push({ "operator": operator_selectati.join() });
    filtre_req.push({ "semn": semn });

    var msg = {
        command: 'request_operators_raport',
        data: filtre_req
    }
    console.log(msg);
    ws.send(JSON.stringify(msg));

}
function request_raportari2() {
    filtre_req = [];
    //    var data = (event.target || event.srcElement).parentNode.firstChild;
    $("#sel_data_msg").html("Încărcare date...");
    var data = datepicker2mysqldate('#datepicker');
    var data2 = datepicker2mysqldate('#datepicker2');
    var valuta = $('#moneda').val();
    filtre_req.push({ "data_start": data + ':00' });
    filtre_req.push({ "data_end": data2 + ':59' });
    filtre_req.push({ "valuta": valuta });
    var msg = {
        command: 'request_raportari2',
        data: filtre_req
    }
    console.log(msg);
    ws.send(JSON.stringify(msg));

}


function request_raportari2_monetar_monede() {
    filtre_req = [];
    //    var data = (event.target || event.srcElement).parentNode.firstChild;
    $("#sel_data_msg").html("Încărcare date...");
    var data = datepicker2mysqldate('#datepicker');
    var data2 = datepicker2mysqldate('#datepicker2');
    var valuta = $('#moneda').val();
    filtre_req.push({ "data_start": data + ':00' });
    filtre_req.push({ "data_end": data2 + ':59' });
    filtre_req.push({ "valuta": valuta });
    var msg = {
        command: 'request_raportari2_monetar_monede',
        data: filtre_req
    }
    ws.send(JSON.stringify(msg));
}


function show_monetar_request_raportari2(operator, obj) {
    if ($(obj).hasClass('blue')) {
        $('[row_operator_monet=' + operator + ']').remove();
        $(obj).removeClass('blue').removeClass('fa-search-minus').addClass('fa-search-plus');
        return;
    }
    $('.fa-search-minus').removeClass('blue').removeClass('fa-search-minus').addClass('fa-search-plus');
    $(obj).addClass('blue').removeClass('fa-search-plus').addClass('fa-search-minus');
    $('.row_created_monet').remove();


    request_raportari2_operator_monetar_monede(operator);
    request_raportari2_operator_monetar_bancnote(operator);

}



function request_raportari2_operator_monetar_monede(operator) { //wwwwww

    $("#sel_data_msg").html("Încărcare date...");
    var filtre_req = [];
    var data = "'" + datepicker2mysqldate('#datepicker') + ':00' + "'";
    var data2 = "'" + datepicker2mysqldate('#datepicker2') + ':59' + "'";
    var moneda = $('#moneda').val();
    var nepreluate = $('#nepreluate').is(':checked') ? 1 : 0;
    var semn = $('#nepreluate').is(':checked') ? ('<' + ($('#preluate').is(':checked') ? '>' : '')) : ($('#preluate').is(':checked') ? '>' : '<>');
    filtre_req.push({ "data_start": data });
    filtre_req.push({ "data_end": data2 });
    filtre_req.push({ "valuta": moneda });
    filtre_req.push({ "semn": semn });
    filtre_req.push({ "operator": operator });
    var msg = {
        command: 'request_raportari2_operator_monetar_monede',
        data: filtre_req
    }
    ws.send(JSON.stringify(msg));
}

function request_raportari2_operator_monetar_bancnote(operator) {

    $("#sel_data_msg").html("Încărcare date...");
    var filtre_req = [];
    var data = "'" + datepicker2mysqldate('#datepicker') + ':00' + "'";
    var data2 = "'" + datepicker2mysqldate('#datepicker2') + ':59' + "'";
    var nepreluate = $('#nepreluate').is(':checked') ? 1 : 0;
    var preluate = $('#preluate').is(':checked') ? 1 : 0;
    var moneda = $('#moneda').val();
    var semn = $('#nepreluate').is(':checked') ? ('<' + ($('#preluate').is(':checked') ? '>' : '')) : ($('#preluate').is(':checked') ? '>' : '<>');

    filtre_req.push({ "data_start": data });
    filtre_req.push({ "data_end": data2 });
    filtre_req.push({ "valuta": moneda });
    filtre_req.push({ "semn": semn });
    filtre_req.push({ "operator": operator });


        var msg = {
            command: 'request_raportari2_operator_monetar_bancnote',
            data: filtre_req
        }
        ws.send(JSON.stringify(msg));
}


function request_raportari2_monetar_bancnote() {
    filtre_req = [];
    //    var data = (event.target || event.srcElement).parentNode.firstChild;
    $("#sel_data_msg").html("Încărcare date...");
    var data = datepicker2mysqldate('#datepicker');
    var data2 = datepicker2mysqldate('#datepicker2');
    var valuta = $('#moneda').val();
    filtre_req.push({ "data_start": data + ':00' });
    filtre_req.push({ "data_end": data2 + ':59' });
    filtre_req.push({ "valuta": valuta });
    var msg = {
        command: 'request_raportari2_monetar_bancnote',
        data: filtre_req
    }
    ws.send(JSON.stringify(msg));
}

function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s / 3600); //Get whole hours
    s -= h * 3600;
    var m = Math.floor(s / 60); //Get remaining minutes
    s -= m * 60;
    return (h < 10 ? '0' + h : h) + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s); //zero padding on minutes and seconds
}



function get_decimal(nr) {
    result = (((parseFloat(nr)) * 100) / 100);
    return result ? result : nr;
}


function draw_grafic(dataX) {
    valoarea_declarata_num = get_decimal(dataX[0].valoare_declarata);
    valoare_procesata_nume = get_decimal(dataX[0].valoare_procesata);
    // Construct options first and then pass it as a parameter
    var options = {
        animationEnabled: true,
        title: {
            text: "CASH FLOW",
            fontFamily: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            fontSize: 30,

        },
        toolTip: {
            enabled: false,
        },
        colorSet: "greenShades",
        axisY: {
            title: "",
            suffix: "",
            titleFontSize: 20,
            labelFontSize: 14,
            includeZero: false
        },
        axisX: {
            labelFontSize: 14,
            //  title: "Inregistrari de la: "+$('#datepicker').val()+" pana la: "+$('#datepicker2').val()+""
        },
        data: [{
            type: "column",
            yValueFormatString: "#.##00#",
            dataPoints: [
                // {indexLabel: '{y}'},
                { label: (valoarea_declarata_num ? valoarea_declarata_num.toFixed(2) : 0) + " " + $('#moneda').val() + " - Valoare declarată", color: "orange", y: valoarea_declarata_num },
                { label: (valoare_procesata_nume ? valoare_procesata_nume.toFixed(2) : 0) + " " + $('#moneda').val() + " - Valoare procesată", color: "green", y: valoare_procesata_nume },
            ]
        }]
    };
    $("#chartContainer1").CanvasJSChart(options);

}

function draw_grafic_bancnote(dataX) {

    var arr = [];
    var fit = [];
    var unfit = [];
    var mix = [];
    $(dataX).each(function () {     //25500.00 (RON 500)
        arr.push({
            "y": this.valoare,
            "label": " " + this.valoare.toFixed(2) + " (" + $('#moneda').val() + " " + this.denominatie + ")"
        });
        fit.push({
            "y": this.fit,
            "label": " " + this.valoare.toFixed(2) + " (" + $('#moneda').val() + " " + this.denominatie + ")"
        });
        unfit.push({
            "y": this.unfit,
            "label": " " + this.valoare.toFixed(2) + " (" + $('#moneda').val() + " " + this.denominatie + ")"
        });
        mix.push({
            "y": this.mix,
            "label": " " + this.valoare.toFixed(2) + " (" + $('#moneda').val() + " " + this.denominatie + ")"
        });
    });

    // Construct options first and then pass it as a parameter
    var options = {
        animationEnabled: true,
        title: {
            text: "BANCNOTE",
            fontFamily: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            fontSize: 30,
        },
        colorSet: "",

        axisY: {
            title: "",
            suffix: "",
            includeZero: false,
            labelFontSize: 14,
            minimum: 0
        },
        toolTip: {
            enabled: false,
        },
        legend: {
            fontSize: 20,
        },
        colorSet: "greenShades",
        axisX: {
            labelMaxWidth: 140,
            labelFontSize: 14,
            fontFamily: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            titleFontSize: 24,
            title: "Valoarea totală: " + $('#bancnote').find('[total]').text()
        },
        data: [
            {
                type: "column",
                yValueFormatString: "#.##00#",
                dataPoints: fit,
                showInLegend: true,
                name: "FIT",
                legendText: "FIT",
            },
            {
                type: "column",
                yValueFormatString: "#.##00#",
                dataPoints: unfit,
                showInLegend: true,
                name: "UNFIT",
                legendText: "UNFIT",
            },
            {
                type: "column",
                yValueFormatString: "#.##00#",
                dataPoints: mix,
                showInLegend: true,
                name: "MIX",
                legendText: "MIX",
            }

        ]
    };

    CanvasJS.addColorSet("greenShades",
        [//colorSet Array

            "#99bc60",
            "#c55051",
            "#4a80b9",


        ]);

    var chart = new CanvasJS.Chart("chartContainer1_bancnote", options)
    chart.render();

    // $("#chartContainer1_bancnote").CanvasJSChart(options);

}


function draw_grafic_monede(dataX) {
    var arr = [];
    $(dataX).each(function () {  //"label": this.denominatie + "(" +this.valoare+$('#moneda').val()+")"
        //    arr.push({"y":this.valoare,"label": (this.denominatie > 0.09 ? this.denominatie+'0' : this.denominatie) + " (" +this.valoare+$('#moneda').val()+")" });
        arr.push({ "y": this.valoare, "label": " " + this.valoare.toFixed(2) + " (" + $('#moneda').val() + " " + this.denominatie + ")" });
    })

    // Construct options first and then pass it as a parameter
    var options = {
        animationEnabled: true,
        title: {
            text: "MONEDE",
            fontFamily: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            fontSize: 30,

        },
        colorSet: "greenShades",
        axisY: {
            title: "",
            suffix: "",
            includeZero: false,
            minimum: 0,
            labelFontSize: 14,
        },
        toolTip: {
            enabled: false,
        },
        axisX: {
            labelFontSize: 14,
            valueFormatString: "0.00",
            titleFontSize: 24,
            fontFamily: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            title: "Valoarea totală: " + $('#monede').find('[total]').text(),
            fontSize: 20,

        },
        data: [
            {
                type: "column",
                yValueFormatString: "0.00",
                xValueFormatString: "0.00",
                dataPoints: arr
            },

        ]
    };
    $("#chartContainer1_monede").CanvasJSChart(options);
}

function draw_grafic_total_operator(dataX) {
    var arr = []; var arrx = [];
    $(dataX).each(function () {
        if(this.diferenta > 0) {
            arrx.push({
                "y": (parseFloat(this.diferenta / (60))),
                "label": this.nume_operator + " (" + (secondsTimeSpanToHMS(this.diferenta)) + ")"
            });
        }
    });
    arr = arrx.sort(function (a, b) {
        var keyA = new Date(a.y),
            keyB = new Date(b.y);
        // Compare the 2 dates
        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
    });


    // Construct options first and then pass it as a parameter
    var options = {
        animationEnabled: true,
        title: {
            text: "Raportări timp procesat / operator",
            fontFamily: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            fontSize: 30,

        },
        toolTip: {
            enabled: false,
        },
        colorSet: "greenShades",
        axisY: {
            title: "",
            suffix: "",
            includeZero: false,
            labelFontSize: 14,
        },
        axisX: {
            labelFontSize: 14,
            labelMaxWidth: 140,

            //    title: "Inregistrari de la: "+$('#datepicker').val()+" pana la: "+$('#datepicker2').val()+" (ore)"
        },
        data: [
            {
                type: "column",
                yValueFormatString: "#.##",
                dataPoints: arr
            },

        ]
    };
    $("#chartContainer1_operatori").CanvasJSChart(options);
}

function get_table_total(tabel, attr) {
    total = 0;
    $('#' + tabel + ' [' + attr + ']').each(function () {
        total += parseFloat($(this).text()) ? parseFloat($(this).text()) : 0;
    })
    return total;
}

$('.sort2').click(function () {
    var table = $(this).parents('table').eq(0)
    console.log('sort ', table);
    var rows = table.find('tr:gt(0):not(.nume_total_tr)').toArray().sort(comparer($(this).index()))
    this.asc = !this.asc
    if (!this.asc) { rows = rows.reverse() }
    for (var i = 0; i < rows.length; i++) { table.append(rows[i]) }
})

function comparer(index) {
    return function (a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index)
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
    }
}
function getCellValue(row, index) { return $(row).children('td').eq(index).text() }


function ws_msg(received) {
    $("#sel_data_msg").html("");
    switch (received.content) {
        case "request_raportari2":
            if (received.data.length > 0 || 1) {
                draw_grafic(received.data);

            } else { }
            break;


        case "request_raportari2_monetar_monede":
            if (received.data.length > 0 || 1) {
                var row = ""; var row2 = "";
                var i = 0;
                $(received.data).each(function (k, val) {
                    i++;
                    row += '<tr>' +
                        '<td index>' + i + '</td>' +
                        '<td denominatie>' + val.denominatie + '</td>' +
                        '<td canti>' + (parseFloat(val.mix)) + '</td>' +
                        '<td valoare>' + (parseFloat(val.valoare, 2)).toFixed(2) + '</td>' +
                        '</tr>';

                });
                $('#monede tbody').html(row);
                row2 += '<tr>' +
                    '<td colspan="2" nume_total>Total</td>' +
                    '<td>' + get_table_total('monede', 'canti') + '</td>' +
                    '<td total>' + get_table_total('monede', 'valoare').toFixed(2) + '</td>' +
                    '</tr>';
                $('#monede tbody').html($('#monede tbody').html() + row2);
                // $('#monede').removeClass('hide').DataTable();
                $('#monede').removeClass('hide');
                draw_grafic_monede(received.data);
                add_even_odd('#monede');
            } else { }
            break;


        case "request_raportari2_operator_monetar_monede":  //wwwwww
            if (received.data.length > 0 || 1) {
                row = ""; row2 = "";
                var i = 0;

                var header_tabel_monede = '<table id="monede_operator" class="hover " style="max-width: 400px" align="center"> <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;"> ' +
                    '<tr> <th colspan="4" class="th center">Monetar monede</th> </tr> ' +
                    '<tr class="center"> <th class="th" index>Nr. crt.</th> <th class="th">Denominatie</th> <th class="th">Nr. monede</th> <th class="th" style="">Valoare</th> </tr> ' +
                    '</thead> <tbody> </tbody> ' +
                    '</table>';

                $(received.data).each(function (k, val) {
                    i++;
                    row += '<tr>' +
                        '<td index>' + i + '</td>' +
                        '<td denominatie>' + val.denominatie + '</td>' +
                        '<td canti>' + (parseFloat(val.mix)) + '</td>' +
                        '<td valoare>' + (parseFloat(val.valoare, 2)).toFixed(2) + '</td>' +
                        '</tr>';
                });
                $('[row_operator=' + received.operator + ']').after('<tr row_operator_monet="' + received.operator + '" class="row_created_monet"><td colspan="4">' + header_tabel_monede + '</td></tr>');
                $('#monede_operator tbody').html(row);
                row2 += '<tr>' +
                    '<td colspan="2" nume_total>Total</td>' +
                    '<td>' + get_table_total('monede_operator', 'canti') + '</td>' +
                    '<td total>' + get_table_total('monede_operator', 'valoare').toFixed(2) + '</td>' +
                    '</tr>';
                $('#monede_operator tbody').html($('#monede_operator tbody').html() + row2);
                $('#monede_operator').removeClass('hide'); //.DataTable()
                //  draw_grafic_bancnote(received.data);
                add_even_odd('#monede_operator');

            } else { }
            break;


        case "request_raportari2_operator_monetar_bancnote":  //wwwwww
            if (received.data.length > 0 || 1) {
                row = ""; row2 = "";
                var i = 0;

                var header_tabel_monede = '<table id="monede_operator" class="hover " style="max-width: 400px" align="center"> <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;"> ' +
                    '<tr> <th colspan="4" class="th center">Monetar monede</th> </tr> ' +
                    '<tr class="center"> <th class="th" index>Nr. crt.</th> <th class="th">Denominatie</th> <th class="th">Nr. monede</th> <th class="th" style="">Valoare</th> </tr> ' +
                    '</thead> <tbody> </tbody> ' +
                    '</table>';
                var header_tabel_bancnote = ' <table id="bancnote_operator" class="tabelpX tablec hover" style="width: 600px" align="center"> <thead class="text-primary" style="color: rgb(235,242,250);background-color: #444444!important;"> ' +
                    '<tr> <th colspan="8" class="th center">Monetar bancnote</th> </tr>' +
                    ' <tr class="center"> <th class="th sort2" style="width: 12%;" index>Nr. crt.</th> ' +
                    '<th class="th " style="width: 20%;">Denominatie</th> ' +
                    '<th class="th " style="width: 20%;">Nr. bancnote</th> ' +
                    '<th class="th" style="width: 7%;">Fit</th> ' +
                    '<th class="th" style="width: 7%;">Unfit</th> ' +
                    '<th class="th" style="width: 7%;">Mix</th> ' +
                    '<th class="th" style="width: 7%;">Fals</th> ' +
                    '<th class="th " style="">Valoare </th> ' +
                    '</tr> ' +
                    '</thead> <tbody> </tbody> ' +
                    '</table>';



                $(received.data).each(function (k, val) {
                    i++;
                    row += '<tr>' +
                        '<td index>' + i + '</td>' +
                        '<td denominatie>' + val.denominatie + '</td>' +
                        '<td nr_bancnote>' + val.nr_bancnote + '</td>' +
                        '<td fit>' + val.fit + '</td>' +
                        '<td unfit>' + val.unfit + '</td>' +
                        '<td mix>' + val.mix + '</td>' +
                        '<td fals>' + val.fals + '</td>' +
                        '<td valoare>' + Math.round(parseFloat(val.valoare, 2)).toFixed(2) + '</td>' +
                        '</tr>';
                });
                $('[row_operator=' + received.operator + ']').after('<tr row_operator_monet="' + received.operator + '" class="row_created_monet"><td colspan="4">' + header_tabel_bancnote + '</td></tr>');
                $('#bancnote_operator tbody').html(row);
                row2 += '<tr class="nume_total_tr">' +
                    '<td colspan="2" nume_total>Total</td>' +
                    '<td>' + get_table_total('bancnote_operator', 'nr_bancnote') + '</td>' +
                    '<td>' + get_table_total('bancnote_operator', 'fit') + '</td>' +
                    '<td>' + get_table_total('bancnote_operator', 'unfit') + '</td>' +
                    '<td>' + get_table_total('bancnote_operator', 'mix') + '</td>' +
                    '<td>' + get_table_total('bancnote_operator', 'fals') + '</td>' +
                    '<td total>' + get_table_total('bancnote_operator', 'valoare').toFixed(2) + '</td>' +
                    '</tr>';
                $('#bancnote_operator tbody').html($('#bancnote_operator tbody').html() + row2);
                $('#bancnote_operator').removeClass('hide'); //.DataTable()
                //  draw_grafic_bancnote(received.data);
                add_even_odd('#bancnote_operator');

            } else { }
            break;

        case "request_raportari2_monetar_bancnote":
            if (received.data.length > 0 || 1) {
                row = ""; row2 = "";
                var i = 0;
                $(received.data).each(function (k, val) {
                    i++;
                    row += '<tr>' +
                        '<td index>' + i + '</td>' +
                        '<td denominatie>' + val.denominatie + '</td>' +
                        '<td nr_bancnote>' + val.nr_bancnote + '</td>' +
                        '<td fit>' + val.fit + '</td>' +
                        '<td unfit>' + val.unfit + '</td>' +
                        '<td mix>' + val.mix + '</td>' +
                        '<td valoare>' + Math.round(parseFloat(val.valoare, 2)).toFixed(2) + '</td>' +
                        '</tr>';
                });

                $('#bancnote tbody').html(row);
                row2 += '<tr class="nume_total_tr">' +
                    '<td colspan="2" nume_total>Total</td>' +
                    '<td>' + get_table_total('bancnote', 'nr_bancnote') + '</td>' +
                    '<td>' + get_table_total('bancnote', 'fit') + '</td>' +
                    '<td>' + get_table_total('bancnote', 'unfit') + '</td>' +
                    '<td>' + get_table_total('bancnote', 'mix') + '</td>' +
                    '<td total>' + get_table_total('bancnote', 'valoare').toFixed(2) + '</td>' +
                    '</tr>';
                $('#bancnote tbody').html($('#bancnote tbody').html() + row2);
                $('#bancnote').removeClass('hide'); //.DataTable()
                draw_grafic_bancnote(received.data);
                add_even_odd('#bancnote');

            } else { }
            break;



        case "request_operators_raport":
            if (received.data.length > 0 || 1) {
                var total = []; tfooter = "";
                // $($('#operator').val()).each(function (k,operator) {
                $($('#operator > option')).each(function (k, operator) {
                    total.push({ "operator": $(this).val(), "nume_operator": $(this).text(), "diferenta": 0, "valoare_procesata": 0 });
                });
                $(total).each(function (k, op) {
                    $(received.data).each(function (k2, val) {
                        if (val.operator == total[k]['operator']) {
                            total[k]['diferenta'] = parseFloat(total[k]['diferenta']) + parseFloat(val.diferenta);
                            total[k]['valoare_procesata'] = parseFloat(total[k]['valoare_procesata']) + parseFloat(val.valoare_procesata);
                            //  total[k]['nume_operator'] =  val.nume_operator ? val.nume_operator : val.operator ;
                        }
                    })
                });


                var row = ""; var row2 = "";
                var i = 0;

                arr = total.sort(function (a, b) {
                    var keyA = new Date(a.diferenta),
                        keyB = new Date(b.diferenta);
                    // Compare the 2 dates
                    if (keyA > keyB) return -1;
                    if (keyA < keyB) return 1;
                    return 0;
                });

                $(arr).each(function (k, val) {
                    i++;
                    if (val.valoare_procesata > 0) row2 += '<tr row_operator="' + val.operator + '">' +
                        '<td class="center" index_operator style="width: 10%;text-align: center">' + i + '   <i onclick="show_monetar_request_raportari2(\'' + val.operator + '\',this)" class="fa fa-search-plus"></i></td>' +
                        '<td operator style="width: 30%;text-align: center">' + (val.nume_operator ? val.nume_operator : val.operator) + '</td>' +
                        '<td valoare_procesata style="width: 30%;">' + precise_round(val.valoare_procesata, 2) + '</td>' +
                        '<td style="width: 30%;">' + secondsTimeSpanToHMS((parseFloat(val.diferenta))) + '<span diferenta class="hide">' + val.diferenta + '</span></td>' +
                        '</tr>';

                });
                $('#operators_raport tbody').html(row2);

                tfooter += '<tr>' +
                    //                    '<td style="width: 10%;" nume_total></td>' +
                    '<td colspan=2 operator style="width: 40%">Total</td>' +
                    '<td style="width: 30%;" align="right" operators_raport_head>' + get_table_total('operators_raport', 'valoare_procesata').toFixed(2) + '</td>' +
                    '<td total operators_raport_head style="width: 30%">' + secondsTimeSpanToHMS(get_table_total('operators_raport', 'diferenta')) + '</td>' +

                    '</tr>';
                $('#operators_raport tbody').html(row2);
                $('#operators_raport_total tbody').html(tfooter);
                // $('#monede').removeClass('hide').DataTable();
                $('#operators_raport').removeClass('hide');
                $('#operators_raport_total').removeClass('hide');
                $('#operators_raport_head').removeClass('hide');

                add_even_odd('#operators_raport');

                draw_grafic_total_operator(total);
            } else { }
            break;


        case "show_monetar_request_raportari2":
            if (received.data.length > 0) {
                console.log(received.data);
                console.log(received.operator);
            }
            break;
        case "get_expire_from_db":
            if (received.data.length > 0) {
                get_expire_from_db_index_template(received.data);
            }
            break;

        default: console.log("Unknown data received raportari2.js: " + received);
    }
}
function precise_round(num, decimals) {
    var t = Math.pow(10, decimals);
    return (Math.round((num * t) + (decimals > 0 ? 1 : 0) * (Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
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

function json2array(json) {
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function (key) {
        result.push(
            {
                "filtru": key,
                "valoare": json[key]
            }
        );
    });
    return result;
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

function str_replace(search, replace, subject) {

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




function array_to_raportari(inregistrari, salvabil) {        //Se populeaza tabelul din procesare cu datele venite de la server
    for (var i = 0; i < inregistrari.length; i++) {
        insert_row_raportari(inregistrari[i]);
    }
    $("#tabelp tbody tr:not('.trmonetar')").chess_table();
}



function filtreaza_client_grup(client) {  //grupare
    var filtre = [];

    var filtre_req = [];
    var data = "'" + datepicker2mysqldate('#datepicker') + ':00' + "'";
    var data2 = "'" + datepicker2mysqldate('#datepicker2') + ':59' + "'";

    filtre_req.push({ "client": client });
    filtre_req.push({ "data_start": data });
    filtre_req.push({ "data_end": data2 });
    filtre = get_filtre_selected();
    filtre_req.push({ "filtre": filtre.join() });
    var msg = {
        command: "filtreaza_client_grup",
        data: filtre_req
    }
    ws.send(JSON.stringify(msg));
}

function date_convert_date(date_time) {
    var months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(date_time);
    var year = date.getFullYear();
    var month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var convdataTime = day + '-' + month + '-' + year;
    return convdataTime

}
function date_convert(date_time) {
    var months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(date_time);
    var year = date.getFullYear();
    var month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var convdataTime = day + '-' + month + '-' + year + ' <br>' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return convdataTime

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


$('title').html($('title').html() + '>Raportari2');

jQuery('body').dropdownChosen();

$('.sort').click(sort);