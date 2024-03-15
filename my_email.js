const { getMaxListeners } = require('events');
const nodemailer = require('nodemailer');
const fs = require('fs')

const email_config = require('./email_config.json')
const transporter = nodemailer.createTransport(email_config);

let message = `<p>Please use the below token to reset your password with the <code>/apiRouter/reset-password</code> api route:</p>
<p><code></code></p>`; // Here you can replace the message with your HTML code.

var mailOptions = {
    from: 'prese@iotnet.ro',
    to: 'eugen.tib@gmail.com', // the user email
    subject: ' Probleme la presa',
    html: `<h4>Reset Password</h4>
${message}`
};


function comp_serv(date) {
    let template_serv = `<p>Buna ziua,<br><br>
    Suntem magazinul ${date.nrmag}, ${date.magazin}, din ${date.strada}, ${date.localitate}, ${date.judet} si avem afisata pe ecranul presei eroarea "${date.lcd}".<br>
    Presa este model ${date.model} cu seria ${date.serie} si MIF-ul ${date.mif}.<br>
    Persoana de contact este ${date.resp}, telefon ${date.tel_resp}.<br><br>
    Multumim!<br><br>
    Acesta este un mesaj transmis automat. Va rugam sa nu raspundeti la acest email.
    </p>`;
    return template_serv;
}

function comp_kauf(date) {
    let template_kauf = `<p>Buna ziua,<br><br>
Suntem magazinul ${date.nrmag}, ${date.magazin}, din ${date.strada}, ${date.localitate}, ${date.judet} si avem afisata pe ecranul presei eroarea "${date.lcd}".<br>
Presa este model ${date.model} cu seria ${date.serie} si MIF-ul ${date.mif}.<br>
Remediere eroare ${date.lcd}: ${date.descriere}.<br>
Persoana de contact este ${date.resp}, telefon ${date.tel_resp}.<br><br>
Multumim!<br><br>
Acesta este un mesaj transmis automat. Va rugam sa nu raspundeti la acest email.</p>`;
    return template_kauf;
}

function comp_subiect(date) {
    let subiect = `Tichet ${date.id} - Kaufland - ${date.nrmag} ${date.magazin} ${date.localitate} eroare ${date.lcd}`;
    return subiect;
}



function send_email(date) {
    let maillist = date.email.replace(/(;| |,)+/g, ',');
    console.log(maillist);
    let a_mail = maillist.split(',');
    mailOptions.to = a_mail[0];
    a_mail.push('trimise@iotnet.ro');
    mailOptions.cc = a_mail.slice(1).join(',');
    if (date.eroare < 11) mailOptions.html = comp_kauf(date);
    else mailOptions.html = comp_serv(date);
    mailOptions.subject = comp_subiect(date);
    mail_log = fs.createWriteStream('./log/emails_sent.txt', { flags: 'a' })
    //Log email data in local file
    mail_log.write(JSON.stringify(mailOptions) + '\n')

		
   /* transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
    });	//*/
}
module.exports.send_email = send_email;