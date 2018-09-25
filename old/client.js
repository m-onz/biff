
var json_stream = require('duplex-json-stream')
var net = require('net')
var Ev = require('events').EventEmitter

function client () {
  if (! (this instanceof client)) return new client ()
  this.client = json_stream(net.connect(9999))
  var self = this.client
  self.output = new Ev
  self.on('data', function (d) {
    self.output.emit('channel', d)
  })
  self.spawn = function (actor) {
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'spawn',
        actor: actor
      })
      self.output.once('channel', function (data) {
        console.log('spawning')
        console.log(data)
        resolve(data.spawned)
      })
      self.on('error', reject)
    })
  }
  self.receive = function (pid) {
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'receive',
        pid: pid
      })
      self.output.once('channel', function (data) {
        resolve(data)
      })
      self.on('error', reject)
    })
  }
  self.send = function (pid, message) {
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'send',
        pid: pid,
        message: message
      })
      self.output.once('channel', function (data) {
        resolve(data)
      })
      self.on('error', reject)
    })
  }
  self.kill = function (pid) {
    return new Promise(function (resolve, reject) {
      self.write({
        cmd: 'kill',
        pid: pid
      })
      self.output.once('channel', function (data) {
        resolve(data)
      })
      self.on('error', reject)
    })
  }
  return self
}

module.exports = client
