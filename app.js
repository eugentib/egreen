var express = require("express");
var ejs = require("ejs");
var path = require("path");
var WebSocket = require("ws");
var events = require("events");
var fs = require("fs-extra");

var my_mqtt = require("./my_mqtt");

var db = require("./db");

function get_top() {
  db.get_topics(my_mqtt.subscribe2arr);
}

my_mqtt.mqtt_msg.on("new_msg", msg_nou);
my_mqtt.mqtt_msg.on("connected", get_top);

function getBaloti(message_str, mac) {
  //    console.log(mac, ' = ', message_str);
  if (
    message_str.slice(2, 10) == "BALOTI :" ||
    message_str.slice(1, 9) == "BALOTI :" ||
    message_str.slice(0, 8) == "BALOTI :"
  ) {
    let nrb = parseInt(message_str.slice(10));
    //   console.log(mac + '           =             ' + message_str.slice(10)+' => '+nrb);
    db.upd_baloti(mac, nrb, broadcast_nrb);
  }
}

function broadcast_nrb(mac, nrb) {
  let to_send = {};
  to_send.mac = mac;
  to_send.nrb = nrb;
  broadcastf(to_send);
}

async function broadcast_nrp(mac, nrp) {
  let to_send = {};
  to_send.mac = mac;
  to_send.pl_c = nrp.pl_c;
  to_send.l_pl_c = nrp.l_pl_c;
  await broadcastAsync(to_send);
}

function getPlaca(msg, mac) {
  if (msg == "PLACA INAINTE ") {
    db.upd_placa(mac, 1, broadcast_nrp);
    return true;
  }
  if (msg == "BALOTUL E GATA") {
    db.upd_baloti(mac, "GATA", broadcast_nrb);
    return true;
  }
}

var mac_err = {};
const alert_timout = 60000 * 15; //Timpul dupa care se trimite alerta
function salveaza_eroare_gr3(mac, err) {
  if (mac in mac_err) {
    console.log(`Salveaza eroare pentru mac ${mac} cu numarul ${err}.`);
    db.save_err(mac, err, 15); //  Memoreaza eroarea in db pentru a trimite catre mail si web
    mac_err[mac].send_alert = setTimeout(alerta_gr3, 5000, mac, err);
  }
}
function alerta(mac, err) {
  console.log(`Trimit alerta pentru mac ${mac} cu eroarea ${err}.`);
  db.alerta(mac, err, broadcastf); //  Memoreaza alerta in db si trimite catre mail si web
}
function alerta_gr3(mac, err) {
  console.log(`Trimit alerta_gr3 pentru mac ${mac} cu eroarea ${err}.`);
  db.alerta(mac, err, broadcastf); //  Memoreaza alerta in db si trimite catre mail si web
}

function clear_error(mac, msg = "OK") {
  clearTimeout(mac_err[mac].send_alert);
  clearTimeout(mac_err[mac].save_alert);
  delete mac_err[mac];
  db.end_err(mac, msg);
  let to_send = {};
  to_send.mac = mac;
  to_send.responsabil = "";
  broadcastf(to_send);
}

function parse_new_LCD_msg(msg) {
  //este PRESA sau BALOT?
  {
    //memoreaza si trimte catre web

    return;
  }
  //este scroll?
  {
    //trimite catre web

    return;
  }
  //este eroare?
  {
    //DA avem deja eroarea ASTA vazuta?

    {
      //NU
      //stergem eroarea veche si timerele aferente daca exista
      //Memoram eroare noua, pornim timer si transmitem catre web
    }
  }
}

function get_errors(mac, message_str) {
  // check for errors
  let err = -1;
  if (message_str.slice(0, 16) != "PRESA E OK     K") {
    //  Erori majore
    if (message_str.slice(0, 16) == "ERROR NR.     11") {
      err = 11;
    } else if (message_str.slice(0, 16) == "ERROR NR.     12") {
      err = 12;
    } else if (message_str.slice(0, 16) == "DESCHIDERE USA  ") {
      err = 2;
    } else if (message_str.slice(0, 16) == "CLAPE DESCHISE  ") {
      err = 3;
    } else if (message_str.slice(0, 16) == "OPRIRE URGENTA  ") {
      err = 4;
    } else if (message_str.slice(0, 6) == "ONLINE") {
      if (mac in mac_err) clear_error(mac);
    }
  } else {
    //  Erori minore
    if (message_str.slice(17, 31) == "SENSOR FAULT !") {
      err = 1;
    }
    if (message_str.slice(17, 33) == "KIPPTASTER:   15") {
      err = 10;
    }
  }
  if (err > 0) {
    if (mac in mac_err) {
      clearTimeout(mac_err[mac].send_alert);
      clearTimeout(mac_err[mac].save_alert);
    }
    mac_err[mac] = { err: err };
    if (err < 2 || err > 4) {
      // eroare NU este intarziata
      db.save_err(mac, mac_err[mac].err);
      if (err != 10)
        mac_err[mac].send_alert = setTimeout(alerta, alert_timout, mac, err);
    } else {
      //  eroarea trebuie intarziata
      mac_err[mac].save_alert = setTimeout(
        salveaza_eroare_gr3,
        alert_timout - 5000,
        mac,
        err
      );
    }
  }
  if (mac in mac_err) {
    if (mac_err[mac].err > 0) {
      console.log(
        "Eroarea " +
        mac_err[mac].err +
        " in pre_stergere la " +
        mac +
        " de mesaj " +
        message_str
      );
      mac_err[mac].err = 0;
    } else {
      console.log("eroare stearsa la " + mac + " de mesaj " + message_str);
      clear_error(mac);
    }
  }
  if (err != -1) {
    console.log("eroare modificata la " + mac + " de mesaj " + message_str);
  } else err = 0;
  return err;
}

async function msg_nou(topic_arr, message_str) {
  //    console.log(topic_arr, ' = ', message_str);
  var mac = topic_arr[1];
  var field = topic_arr[2];
  if (field == "lcd") {
    if (message_str.slice(0, 16) != "PRESA E OK     K")
      console.log(topic_arr, " = ", message_str);
    message_str = message_str.slice(0, 16) + "\n" + message_str.slice(16);
    update_device(mac, field, message_str);
    getBaloti(message_str.slice(16), mac);
    getPlaca(message_str.slice(0, 14), mac);

    let err = get_errors(mac, message_str);
    let to_send = {};
    to_send.mac = mac;
    if (err < 2 && err > 4) to_send.status = err;
    else to_send.status = 0;
    to_send.lcd = message_str;
    await broadcastAsync(to_send);
  } else if (field == "rssi") {
    db.save_rssi(mac, message_str);
    update_device(mac, field, message_str);
    let to_send = {};
    to_send.mac = mac;
    to_send.rssi = message_str;
    await broadcastAsync(to_send);
  } else if (field == "FW_ver") {
    update_device(mac, "sw", message_str);
  } else if (field == "vsw") {
    update_device(mac, "devsw", message_str + "<br>SLD");
  } else if (field == "nrbalot") {
    update_device(mac, "nrBaloti", message_str);
  } else if (field == "scr") {
    db.upd_ddev(mac, message_str);
    let to_send = {};
    to_send.mac = mac;
    to_send.scroll = message_str;
    await broadcastAsync(to_send);
  } else if (topic_arr[0] == "LWT") {
    console.log(message_str, " went OFFLINE ");
    update_device(message_str, topic_arr[0], "OFFLINE");
    if (mac in mac_err) clear_error(mac, "OFFLINE");
    let to_send = {};
    to_send.mac = message_str;
    to_send.lcd = "OFFLINE";
    await broadcastAsync(to_send);
  }
}

function update_device(mac, field, data) {
  db.upd_dev(mac, field, data);
}

//var wss = new WebSocket.Server({ port: 8081, path: "/WS" });

//const { WebSocket } = require('ws');

const wss = new WebSocket.Server({ port: 8081, path: "/WS" });

wss.on("connection", async (ws, req) => {

  ws.on("message", async (rmsg) => {

    if (rmsg != "p") {

      try {

        const msg = JSON.parse(rmsg);

        let result;

        if (msg.broadcast !== true && msg.hasOwnProperty("command")) {
          result = await handleDbRequestAsync(msg);
        } else {
          console.log("Unknown data received", rmsg.toString());
          return;
        }

        if (result.broadcast) {
          await broadcastAsync(result);
        }

        ws.send(JSON.stringify(result));

      } catch (err) {
        console.error(err);
      }

    } else {
      // Ping pong logic
      //console.log('WebSocket received ' + rmsg);
      //            console.log('WebSocket was pinged');
      ws.send("r");
      return;
    }

  });

  ws.on("close", () => {
    console.log("WebSocket closed");
  });

  // Logging logic  

});


async function handleDbRequestAsync(msg) {

  return new Promise((resolve, reject) => {
    db.request_db(msg, (result, err) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

}

async function broadcastAsync(result) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(result));
    }
  });
}

/*
function broadcastf(result) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(result));
    }
  });
}

wss.on("connection", (ws, req) => {
  ws.on("message", (rmsg) => {
    if (rmsg != "p");
    else {
      //console.log('WebSocket received ' + rmsg);
      //            console.log('WebSocket was pinged');
      ws.send("r");
      return;
    }
    var msg = JSON.parse(rmsg);
    if (msg.broadcast !== true && msg.hasOwnProperty("command"))
      db.request_db(msg, (result, err) => {
        if (err) console.error(err);
        else {
          if (result.broadcast) broadcastf(result);
          ws.send(JSON.stringify(result));
        }
      });
    else {
      //            arm.request(msg, ws);
      console.log("WebSocket received unknown data", rmsg.toString);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket was closed");
  });
  log_ip.write(
    my_mqtt.timp() + " " + req.headers["x-forwarded-for"] + " via WS\n"
  );
});
//  */
//Assign the event handler to an event:
//eventEmitter.on('mqtt_transaction', broadcast_transaction);
//eventEmitter.on('txt_ready', broadcast_txt);

var app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use("/assets", express.static(path.join(__dirname, "/assets")));

var pjson = require("./package.json");

console.log(pjson.version);

app.listen("3001", () => {
  console.log("Server started on port 3001...");
});

var log_ip = fs.createWriteStream("./log/ips.txt", { flags: "a" });

app.get("/favicon.ico", (req, res) => {
  log_ip.write(
    my_mqtt.timp() + " " + req.headers["x-forwarded-for"] + " via HTTP\n"
  );
  res.sendFile("favicon.ico", { root: "." });
});

app.get("/", (req, res) => {
  res.render("login", { versiune: pjson.version });
});
app.get("/index.html", (req, res) => {
  res.render("login", { versiune: pjson.version });
});

app.get("/devices", (req, res) => {
  res.render("devices", { versiune: pjson.version });
});

app.get("/inrolare", (req, res) => {
  res.render("inrolare", { versiune: pjson.version });
});

app.get("/raport", (req, res) => {
  res.render("raport", { versiune: pjson.version });
});

app.get("/raportari", (req, res) => {
  res.render("raportari", { versiune: pjson.version });
});

app.get("/general", (req, res) => {
  res.render("general", { versiune: pjson.version });
});

app.get("/service", (req, res) => {
  res.render("service", { versiune: pjson.version });
});

app.get("/config", (req, res) => {
  res.render("config", { versiune: pjson.version });
});

app.get("/cautare", (req, res) => {
  res.render("cautare", { versiune: pjson.version });
});
