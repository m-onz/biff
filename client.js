
var json_stream = require('duplex-json-stream')
var net = require('net')

function client () {
  if (! (this instanceof client)) return new client ()
  this.client = json_stream(net.connect(9999))
  var self = this.client
  self.spawn = function (actor) {
    console.log('sending spawn :: ', actor)
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'spawn',
        actor: actor
      })
      self.once('data', function (data) {
        resolve(data.spawned)
      })
    })
  }
  self.receive = function (pid) {
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'receive',
        pid: pid
      })
      self.once('data', function (data) {
        resolve(data)
      })
    })
  }
  self.send = function (pid, message) {
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'send',
        pid: pid,
        message: message
      })
      self.once('data', function (data) {
        resolve(data)
      })
    })
  }
  self.kill = function (pid) {
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'kill',
        pid: pid
      })
      self.once('data', function (data) {
        resolve(data)
      })
    })
  }
  return self
}

module.exports = client
