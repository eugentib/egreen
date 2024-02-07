var login = true;

page_name = 'login';
//login
/*
if (window.location.pathname != '/index.html' && localStorage.getItem('n') == null || (localStorage.getItem('n') != null && localStorage.getItem('s').length != 32)) {
    window.location.href = "/index.html";
}
*/
function checkSubmit(e) {
    if (e && e.keyCode == 13) {
        get_login_data();
    }
}


//login


valabilite_sesiune = 60 * 1000 * 60 * 8;
var md5 = function (value) {
    return CryptoJS.MD5(value).toString();
}
function get_one_user_data(user) {
    ws.send(JSON.stringify({ "command": "get_one_user_data", "user": user }));
}
function set_login_session_db() {
    var user = $('#user').val().toLowerCase();
    var password = md5($('#parola').val());

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var year = dateObj.getUTCFullYear();

    var sesiune = md5(user + password + year + '-' + month);
    var exp = 0;
    exp = parseInt($.now()) + valabilite_sesiune;
    var msg = {
        command: "set_login_session",
        "data": [sesiune, exp, user]
    }
    ws.send(JSON.stringify(msg));
}
function get_login_data() {
    var mesaj = '';
    $('#user').prop('disabled', true);
    $('#parola').prop('disabled', true);
    var user = $('#user').val().toLowerCase();
    var password = md5($('#parola').val());
    // if(user.length < 3){ mesaj += '<p>Userul nu este valid</p>';}
    //  if($('#parola').val().length < 5){ mesaj += '<p>Verificați parola</p>';}
    if (mesaj.length > 0) {
        $("#raspuns_login").html(mesaj).css('color', 'red'); return 0;
        $('#user').prop('disabled', false);
        $('#parola').prop('disabled', false);
    }
    var msg = {
        command: "get_login_data",
        data: {
            "username": user,
            "password": password
        }
    }
    ws.send(JSON.stringify(msg));
}


function set_login_session_local(data) {
    var user = data.username;
    var password = md5($('#parola').val());
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var year = dateObj.getUTCFullYear();
    localStorage.setItem('s', data.sesiune);
    localStorage.setItem('n', data.nume);
    localStorage.setItem('r', data.rol);
    localStorage.setItem('e', data.expire);
    window.location.href = "/general";

}
function get_expire_from_db_index_template(data) {

    if (data[0].rol != localStorage.getItem('r')) { logout_user(); }
    if (data[0].sesiune != localStorage.getItem('s')) { logout_user(); }
    exp_sesiune = parseInt(localStorage.getItem('e'));
    exp_db = parseInt(data[0].expire);
    if (exp_sesiune == null) {
        logout_user();
    }
    else if (exp_db == exp_sesiune && exp_sesiune < parseInt($.now())) {
        logout_user();
    }
    else if (exp_db != exp_sesiune) {
        logout_user();
    }
    localStorage.setItem('d', Base64.encode(JSON.stringify(data)));
    check_rights();
    check_rights_pag(page_name);

}

function ws_msg(received) {
    switch (received.content) {
        case "get_login_data":
            if (received.data.length > 0) {
                raspuns = received.data[0]['COUNT(username)'];
                if ($.isNumeric(raspuns) && raspuns == 0) {
                    $('#user').prop('disabled', false);
                    $('#parola').prop('disabled', false);
                    $("#raspuns_login").html('Utilizatorul sau parola nu sunt corecte').css('color', 'red');
                } else if ($.isNumeric(raspuns) && raspuns == 1) {
                    $("#raspuns_login").html('Autentificare cu succes').css('color', 'green');
                    setTimeout(function () {
                        console.log("L1");
                        set_login_session_db();
                    }, 500);
                }
            } else { }
            break;
        case "set_login_session":
            if (received.data['warningStatus'] == 0) {
                console.log("L2");
                ws.send(JSON.stringify({ "command": "get_one_user_data_to_session", "data": [$('#user').val().toLowerCase()] }));
            }
            else { console.log("L22",received.data);}
            break;
        case "get_one_user_data_to_session":
            if (received.data.length > 0) {
                console.log("L3");

                set_login_session_local(received.data[0]);
            }
            else { }
            break;
        default: console.log("Unknown data received-login.js: " + received);
    }
}

function check_rights_pag(tab) {
    if (window.location.pathname == '/index.html') { return }
    console.log('Check_rights_pag: ' + tab);
    if ($('.menu_' + tab).hasClass('hide')) {
        window.location.href = "/home";
    }
    if (typeof localStorage.getItem('d') === 'undefined' || localStorage.getItem('d') == null) { return; }
    // var data =  JSON.parse(Base64.decode(localStorage.getItem('d')))[0];
    //  if(tab == 'raportari' && data.raportari < 1){   window.location.href="/preluare";}
    //  if(tab == 'statistica' && data.statistica < 1){   window.location.href="/preluare";}
    //  if(tab == 'preluare' && data.preluare < 1){   window.location.href="/procesare";}
    //   if(tab == 'procesare' && data.procesare < 1){   window.location.href="/preluare";}
}

function check_rights() {
/*    console.log(window.location.pathname);
    if (window.location.pathname == '/index.html') { return }

    if (typeof localStorage.getItem('d') === 'undefined' || localStorage.getItem('d') == null) {
        console.log('Eroare Sesiune!');
        //logout_user();
        return;
    }


    var data = JSON.parse(Base64.decode(localStorage.getItem('d')))[0];

    var one_page = 0;
    var menus = ['preluare', 'procesare', 'nealocate', 'reconcilieri', 'raportari', 'raportari2', 'raportari3', 'raportari4', 'setari', 'admin', 'service', 'statistici'];
    if (data.preluare > 0) { $('.menu_preluare').removeClass('hide'); one_page++; }

    if (data.setari > 0) { $('.menu_setari').removeClass('hide'); $('.menu_setari').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.admin > 0) { $('.menu_admin').removeClass('hide'); $('.menu_admin').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.service > 0) { $('.menu_service').removeClass('hide'); $('.menu_service').closest('.has_child_div').removeClass('hide'); one_page++; }

    if (data.procesare > 0) { $('.menu_procesare').removeClass('hide'); $('.menu_procesare').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.nealocate > 0) { $('.menu_nealocate ').removeClass('hide'); $('.menu_nealocate').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.reconcilieri > 0) { $('.menu_reconcilieri').removeClass('hide'); $('.menu_reconcilieri').closest('.has_child_div').removeClass('hide'); one_page++; }

    if (data.raportari > 0) { $('.menu_raportari').removeClass('hide'); $('.menu_raportari').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.statistica > 0) { $('.menu_statistici').removeClass('hide'); $('.menu_statistici').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.raportari2 > 0) { $('.menu_raportari2').removeClass('hide'); $('.menu_raportari2').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.raportari3 > 0) { $('.menu_raportari3').removeClass('hide'); $('.menu_raportari3').closest('.has_child_div').removeClass('hide'); one_page++; }
    if (data.raportari4 > 0) { $('.menu_raportari4').removeClass('hide'); $('.menu_raportari4').closest('.has_child_div').removeClass('hide'); one_page++; }

    console.log('Sesiune activa!' + one_page + " drepturi acces");
    if (one_page == 0) {
        window.location.href = "/admin";
    }

/*
    $('.has_child_div').each(function () {
        toate_link = $(this).find('a').length;
        toate_link_ascunse = $(this).find('a.hide').length;
        if (toate_link_ascunse != toate_link) { $(this).show(); }
    });//*/
}


var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },

    // public method for decoding

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },

    // private method for UTF-8 encoding

    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },

    // private method for UTF-8 decoding

    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

