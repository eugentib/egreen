const { getMaxListeners } = require('events')
const nodemailer = require('nodemailer')
const fs = require('fs')

const email_config = require('./email_config.json')
const transporter = nodemailer.createTransport(email_config)
const run_mode = require('./run_mode.json')
const DEBUG = run_mode.debug

let message = `<p>Please use the below token to reset your password with the <code>/apiRouter/reset-password</code> api route:</p>
<p><code></code></p>` // Here you can replace the message with your HTML code.

var mailOptions = {
  from: 'prese@iotnet.ro',
  to: 'eugen.tib@gmail.com', // the user email
  subject: ' Probleme la presa',
  html: `<h4>Reset Password</h4>
${message}`
}

function comp_serv_gr2 (datea) {
  let date = datea[0]
  let template_serv_gr2 = `<p>Buna ziua,<br><br>
    Suntem magazinul ${date.nrmag}, ${date.magazin}, din ${date.strada}, ${date.localitate}, ${date.judet} si va anuntam ca s-au depasit conditiile de nerezolvare a erorilor minore:<br>`
  if (datea.tip == 1 || datea.tip == 3)
    template_serv_gr2 += `  -	S-au transmis ${datea.params[0]} email-uri in ${datea.params[1]} ore.`
  if (datea.tip == 2 || datea.tip == 3)
    template_serv_gr2 += `  -	Timpul cumulat afisare erori este de ${datea.params[2]} ore intr-un interval analizat de ${datea.params[3]} ore.
    
    Pe ecranul presei au fost afisate urmatoarele erori: <br>`
  for (let i = 0; i < datea.length; i++) {
    template_serv_gr2 += `<li>${datea[i].lcd}</li>`
  }

  template_serv_gr2 += `<br>Presa este model ${date.model} cu seria ${date.serie} si MIF-ul ${date.mif}.<br>
    Persoana de contact este ${date.resp}, telefon ${date.tel_resp}.<br><br>
    Multumim!<br><br>
    Acesta este un mesaj transmis automat. Va rugam sa nu raspundeti la acest email.
    </p>`
  return template_serv_gr2
}
function comp_serv (date) {
  let template_serv = `<p>Buna ziua,<br><br>
    Suntem magazinul ${date.nrmag}, ${date.magazin}, din ${date.strada}, ${date.localitate}, ${date.judet} si avem afisata pe ecranul presei eroarea "${date.lcd}".<br>
    Presa este model ${date.model} cu seria ${date.serie} si MIF-ul ${date.mif}.<br>
    Persoana de contact este ${date.resp}, telefon ${date.tel_resp}.<br><br>
    Multumim!<br><br>
    Acesta este un mesaj transmis automat. Va rugam sa nu raspundeti la acest email.
    </p>`
  return template_serv
}

function comp_kauf (date) {
  let template_kauf = `<p>Buna ziua,<br><br>
Suntem magazinul ${date.nrmag}, ${date.magazin}, din ${date.strada}, ${date.localitate}, ${date.judet} si avem afisata pe ecranul presei eroarea "${date.lcd}".<br>
Presa este model ${date.model} cu seria ${date.serie} si MIF-ul ${date.mif}.<br>
Remediere eroare ${date.lcd}: ${date.descriere}.<br>
Persoana de contact este ${date.resp}, telefon ${date.tel_resp}.<br><br>
Multumim!<br><br>
Acesta este un mesaj transmis automat. Va rugam sa nu raspundeti la acest email.</p>`
  return template_kauf
}

function comp_subiect (date) {
  return `Tichet ${date.id} - Kaufland - ${date.nrmag} ${date.magazin} ${date.localitate} eroare ${date.lcd}`
}
function comp_subiect_gr2 (date) {
  return `Tichet ${date.gr2} - Kaufland - ${date[0].nrmag} ${date[0].magazin} ${date[0].localitate} erori multiple`
}

function send_email (date) {
  let maillist = ''
  if ('gr2' in date) {
    maillist = date[0].email.replace(/(;| |,)+/g, ',')
    mailOptions.html = comp_serv_gr2(date)
    mailOptions.subject = comp_subiect_gr2(date)
  } else {
    maillist = date.email.replace(/(;| |,)+/g, ',')
    if (date.eroare < 11) mailOptions.html = comp_kauf(date)
    else mailOptions.html = comp_serv(date)
    mailOptions.subject = comp_subiect(date)
  }
  console.log(maillist)
  let a_mail = maillist.split(',')
  mailOptions.to = a_mail[0]
  a_mail.push('trimise@iotnet.ro')
  mailOptions.cc = a_mail.slice(1).join(',')
  mail_log = fs.createWriteStream('./log/emails_sent.txt', { flags: 'a' })
  //Log email data in local file
  mail_log.write(JSON.stringify(mailOptions) + '\n')

  if (DEBUG == false)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log('Message sent: %s', info.messageId)
    }) //*/
}
module.exports.send_email = send_email
