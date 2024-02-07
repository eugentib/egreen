page_name = 'inrolare';

$(".nav-item").on('click', function (e) {
    //   e.preventDefault; 
    console.log($(this).data('cmd'));
    ws.send(JSON.stringify({ "command": $(this).data('cmd') }));
});//*/

function ws_msg(received) {
    switch (received.content) {
        case "devices_data":
            if (received.data.length > -1) {
                $('#dt_tabel tbody').empty();
                array_to_dturi(received.data);
                $("#sel_data_msg").html("");
            } else {
                $("#sel_data_msg").html("NU exista DT-uri!");
                setTimeout(function () { $("#sel_data_msg").html(""); }, 5000);
            }
            break;

        default: //console.log("Unknown data received: " + received);
    }
}


function insert_row_dturi(date, dataset) {
    var adate = ['idt', 'mac', 'model', 'serie', 'mif', 'judet', 'localitate', 'strada', 'magazin', 'nrmag', 'resp', 'tel_resp'];
    // console.log(date)
    //   console.log(dataset)

    var row = '<tr class="ns" id="' + date.mac + '"><td data-filtru="fckdt"><i class="fa fa-pencil" aria-hidden="true"></i></td>';

    for (j = 0; j < adate.length; j++) row += '<td data-filtru="' + dataset[j] + '">' + date[adate[j]] + '</td>';
    row += '</tr>';
    $('#dt_tabel tbody').prepend(row);
}

function array_to_dturi(inregistrari) {        //Se populeaza tabelul din procesare cu datele venite de la server
    var dataset = ['fidt', 'fmac', 'fmodel', 'fserie', 'fmif', 'fjudet', 'flocalitate', 'fstrada', 'fnume', 'fnumarmag', 'fresp', 'ftelresp'];
    console.log(inregistrari)
    $("#dt_tabel tbody").empty();
    for (var i = 0; i < inregistrari.length; i++) {
        inregistrari[i].idt = inregistrari.length - i;
        insert_row_dturi(inregistrari[i], dataset);
    }
    $("#dt_tabel tbody tr").chess_table();
    $('.fa-pencil').on('click', edit_check);
}



function save_check() {
    $(this).off('click', save_check).on('click', edit_check).removeClass("fa-floppy-o").addClass("fa-pencil");
    let mac = $(this).parents('tr').attr('id');
    console.log('mac ', mac);
    let vals = [];
    $(this).parents('tr').find('td:gt(2)').each(function () {
        let val = $(this).find("input").val();
        let datasiorar
        vals.push(val);
        $(this).html(val);
    });
    vals.push(mac);
    console.log(vals);
    ws.send(JSON.stringify({
        "command": "edit_devices",
        "data": vals
    }));

}


function edit_check() {
    $(this).off('click', edit_check).on('click', save_check).removeClass("fa-pencil").addClass("fa-floppy-o");
    $(this).parents('tr').find('td:gt(2)').each(function () {
        let html = $(this).html();
        let input = $('<input class="editdt" type="text" />');
        input.val(html);
        $(this).html(input);
    });
}

