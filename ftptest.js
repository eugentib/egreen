var EasyFtp = require('easy-ftp');

var ftp = new EasyFtp();
var config = {
    host: '192.168.100.5',
    port: '2221',
    username: 'extuser',
    password: 'extpass',
    //        path: global.ftp.path,
    type: 'ftp'
};

ftp
    .on("open", () => {
        console.log("ftp connected!");
        ftp.upload('./monetare_trimise/EVN10000000b10cb38f_1601641766997.xml', '1601641766997.xml', function (err) {
            console.log("ftp trimis");
            if (err) console.log(err);
            ftp.close();
        });
    })
    .on('error', function (error) { console.error('ftp Error happened', error); })

ftp.connect(config);
