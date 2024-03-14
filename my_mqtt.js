const mqtt = require('mqtt') //https://www.npmjs.com/package/mqtt
const EventEmitter = require('events')
const fs = require('fs')

var mqtt_msg = new EventEmitter()
module.exports.mqtt_msg = mqtt_msg

var Base64 = {
  _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  encode: function (e) {
    var t = ''
    var n, r, i, s, o, u, a
    var f = 0
    e = Base64._utf8_encode(e)
    while (f < e.length) {
      n = e.charCodeAt(f++)
      r = e.charCodeAt(f++)
      i = e.charCodeAt(f++)
      s = n >> 2
      o = ((n & 3) << 4) | (r >> 4)
      u = ((r & 15) << 2) | (i >> 6)
      a = i & 63
      if (isNaN(r)) {
        u = a = 64
      } else if (isNaN(i)) {
        a = 64
      }
      t =
        t +
        this._keyStr.charAt(s) +
        this._keyStr.charAt(o) +
        this._keyStr.charAt(u) +
        this._keyStr.charAt(a)
    }
    return t
  },
  decode: function (e) {
    var t = ''
    var n, r, i
    var s, o, u, a
    var f = 0
    e = e.replace(/[^A-Za-z0-9+/=]/g, '')
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++))
      o = this._keyStr.indexOf(e.charAt(f++))
      u = this._keyStr.indexOf(e.charAt(f++))
      a = this._keyStr.indexOf(e.charAt(f++))
      n = (s << 2) | (o >> 4)
      r = ((o & 15) << 4) | (u >> 2)
      i = ((u & 3) << 6) | a
      t = t + String.fromCharCode(n)
      if (u != 64) {
        t = t + String.fromCharCode(r)
      }
      if (a != 64) {
        t = t + String.fromCharCode(i)
      }
    }
    t = Base64._utf8_decode(t)
    return t
  },
  _utf8_encode: function (e) {
    e = e.replace(/rn/g, 'n')
    var t = ''
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n)
      if (r < 128) {
        t += String.fromCharCode(r)
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode((r >> 6) | 192)
        t += String.fromCharCode((r & 63) | 128)
      } else {
        t += String.fromCharCode((r >> 12) | 224)
        t += String.fromCharCode(((r >> 6) & 63) | 128)
        t += String.fromCharCode((r & 63) | 128)
      }
    }
    return t
  },
  _utf8_decode: function (e) {
    var t = ''
    var n = 0
    var r = (c1 = c2 = 0)
    while (n < e.length) {
      r = e.charCodeAt(n)
      if (r < 128) {
        t += String.fromCharCode(r)
        n++
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1)
        t += String.fromCharCode(((r & 31) << 6) | (c2 & 63))
        n += 2
      } else {
        c2 = e.charCodeAt(n + 1)
        c3 = e.charCodeAt(n + 2)
        t += String.fromCharCode(
          ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        )
        n += 3
      }
    }
    return t
  }
}

console.log(Base64.encode('01'))

//require('console-stamp')(console, 'HH:MM:ss.l');

//Get MQTT credentials

//Get MQTT subs
var topics = ['Kaufland/ESP8266_All', 'LWT']

//Connect MQTT

var Broker_URL = ['mqtt://egreen.iotnet.ro']

var options = [
  {
    clientId: 'MyMQTTtoDB_' + new Date().getTime(),
    port: 1883,
    username: 'lora',
    password: 'SorinEugen1',
    keepalive: 60
  }
]

var mqttclient
for (let c = 0; c < Broker_URL.length; c++) {
  mqttclient = mqtt.connect(Broker_URL[c], options[c])
  mqttclient.on('connect', mqtt_connected)
  mqttclient.on('reconnect', mqtt_reconnect)
  mqttclient.on('error', mqtt_error)
  mqttclient.on('message', mqtt_messsageReceived)
  mqttclient.on('close', mqtt_close)
}

function subscribe2arr (topics) {
  for (var i = 0; i < topics.length; i++) {
    console.log('Subscribing to ' + topics[i])
    mqttclient.subscribe(topics[i], mqtt_subscribe)
  }
}
module.exports.subscribe2arr = subscribe2arr

function mqtt_connected () {
  console.log('MQTT connected') //,client);
  for (let c = 0; c < Broker_URL.length; c++) {
    for (var i = 0; i < topics.length; i++) {
      console.log('Subscribing to ' + topics[i])
      mqttclient.subscribe(topics[i], mqtt_subscribe)
    }
  }
  mqtt_msg.emit('connected')
}

function mqtt_reconnect (err) {
  console.log('Reconnect MQTT')
  if (err) {
    console.error(err)
  }
  //	setTimeout(function (){
  options.clientId = 'MyMQTTtoDB_R' + new Date().getTime()
  //		client = mqtt.connect(Broker_URL, options);
  //	}, 30000); // How long do you want the delay to be (in milliseconds)? //
}

function mqtt_error (err) {
  console.log('Error!')
  if (err) {
    console.error(err)
  }
}

function new_device (message_str) {
  var mac = topic_split(message_str)[1]
  console.log(`New device ? ${message_str}`)
  if (!topics.includes(message_str)) {
    topics.push(message_str)
    mqttclient.subscribe(message_str, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/sw`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/R_sw`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/FW_ver`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/crash`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/rssi`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/scr`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/nrbalot`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/model`, mqtt_subscribe)
    mqttclient.subscribe(`Kaufland/${mac}/vsw`, mqtt_subscribe)
  }
}

function timp () {
  let timestamp = Date.now()

  let dateObject = new Date(timestamp)
  let ms = String(dateObject.getMilliseconds()).padStart(3, '0')
  let s = String(dateObject.getSeconds()).padStart(2, '0')
  let m = String(dateObject.getMinutes()).padStart(2, '0')
  let h = String(dateObject.getHours()).padStart(2, '0')
  let date = String(dateObject.getDate()).padStart(2, '0')
  let month = dateObject.getMonth() + 1

  return `[${month}-${date} ${h}:${m}:${s}.${ms}]`
}
module.exports.timp = timp

var msg_log = {}
msg_log.scr = {}

function log_message (mac, msg) {
  if (mac in msg_log) {
    //msg_log[mac].write(msg.slice(16) + "\n");
    msg_log[mac].write(timp() + msg + '\n')
  } else {
    msg_log[mac] = fs.createWriteStream('./log/' + mac + '.txt', { flags: 'a' })
    //msg_log[mac].write(msg.slice(16) + "\n");
    msg_log[mac].write(timp() + msg + '\n')
  }
}

var scroll = {}
function get_scroll (mac, txt) {
  if (mac in scroll) {
    let len = scroll[mac].length
    let temp = scroll[mac]
    let cmp = txt.slice(0, 15)
    let pos = scroll[mac].indexOf(cmp)
    if (pos >= 0) {
      //			if (!scroll[mac].includes(txt))
      //				scroll[mac] = scroll[mac].slice(0, pos) + txt;
      if (len < 111)
        scroll[mac] = temp.slice(0, pos) + txt + temp.slice(pos + 16)
      else scroll[mac] = temp.slice(0, pos) + txt
    } else if (txt == '*** MASCHINENFAB') scroll[mac] = txt + temp.slice(16)
    if (len != scroll[mac].length)
      msg_log.log[mac].write(timp() + scroll[mac] + '\n')
    //			console.log('Sc[' + mac + ']=' + scroll[mac]);
  } else {
    scroll[mac] = txt
    if (!('log' in msg_log)) msg_log.log = {}
    msg_log.log[mac] = fs.createWriteStream('./log/scroll_' + mac + '.txt', {
      flags: 'a'
    })
    msg_log.log[mac].write(timp() + scroll[mac] + '\n')
  }
}

function mqtt_messsageReceived (topic, message, packet) {
  if (message.length == 34) {
    var message_str = message.toString().slice(0, 32) //convert byte array to str
  } else var message_str = message.toString() //convert byte array to str

  var topic_arr = topic_split(topic)

  //    mqtt_msg.emit('new_msg',topic_arr, message_str);

  if (topic_arr[0] != 'Kaufland' && topic_arr[0] != 'LWT') {
    console.log('Topic neinteresant :', topic_arr)
    return
  }
  if (topic_arr[1] == 'ESP8266_All') new_device(message_str)
  else {
    if (topic_arr[0] == 'LWT') log_message(message_str, 'OFFLINE')
    let mac = topic_arr[1]
    if (topic_arr[2] == 'lcd') {
      if (mac == 'x80646FA929F3') {
        log_message(mac, message_str)
      } else {
        if (
          message_str.slice(0, 16) == 'PRESA E OK     K' &&
          message_str.slice(16) != 'KIPPTASTER:   15' &&
          message_str.slice(16, 30) != 'SENSOR FAULT !'
        )
          get_scroll(mac, message_str.slice(16))
        else log_message(mac, message_str)
      }
    }
    if (topic_arr[2] == 'scr') {
      if (!(mac in msg_log.scr)) {
        msg_log.scr[mac] = fs.createWriteStream(
          './log/dev_scroll_' + mac + '.txt',
          { flags: 'a' }
        )
        msg_log.scr[mac].write(timp() + message_str + '\n')
      } else msg_log.scr[mac].write(timp() + message_str + '\n')
    }
    mqtt_msg.emit(
      'new_msg',
      JSON.parse(JSON.stringify(topic_arr)),
      JSON.parse(JSON.stringify(message_str))
    )
  }
}

function mqtt_close () {
  console.log('Close MQTT')
}

function mqtt_subscribe (err, granted) {
  console.log('Subscribed to ', granted)
  if (err) {
    console.error(err)
  }
}

//Subscribe MQTT

//ON new MQTT message

//Check if topic is known
function is_kn_topic (topic) {
  var ret = false
  Object.keys(kn_topics).forEach(function (key) {
    if (topic == kn_topics[key]) ret = true
  })
  return ret
}

async function mqtt_command (msg) {
  let mac = msg.data
  let command = msg.mqtt_command
  mqttclient.publish(`Kaufland/${mac}/sw`, command)
  console.log(`Sent command ${command} to ${mac}`)
  return {}
}
module.exports.mqtt_command = mqtt_command

function topic_split (topic) {
  var topic_arr = topic.split('/') //convert to array
  return topic_arr
}

function getKeyByValue (object, value) {
  return Object.keys(object).find(key => object[key] === value)
}

module.exports.client = mqttclient

//Send message to WS

//ON new WS message

//Create MQTT message

//Send message to MQTT
