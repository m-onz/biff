
var net = require('net')

var MAGIC_PORT = 7190

// var c = net.connect(MAGIC_PORT)
//
// c.write('__spawn__;'+'console.log(22);')
//
// c.on('data', function (d) {
//   console.log('>>', d.toString())
// })

// client.

function biff () {
  if (! (this instanceof biff)) return new biff ()
  var self = this;
  setInterval(function () {}, 5000)
  self.spawn = function (file_or_code, callback) {
    var socket = net.connect(MAGIC_PORT)
    if (typeof callback === 'function') socket.on('data', callback)
    socket.write('__spawn__')
    socket.write(file_or_code)
    socket.on('error', function () {
      socket.end()
    })
    // socket.end('__end__')
  }
  self.receive = function (pid, callback) {
    var socket = net.connect(MAGIC_PORT)
    if (typeof callback === 'function') socket.on('data', callback)
    socket.write('__receive__')
    socket.write(pid)
    // socket.on('error', function () {
    //   socket.end()
    // })
  }
  self.send = function (pid, message, callback) {
    var socket = net.connect(MAGIC_PORT)
    if (typeof callback === 'function') socket.on('data', callback)
    socket.write('__send__')
    socket.write(pid)
    socket.write('__message__'+message)
    // socket.end('__end__')
  }
  self.kill = function (pid, callback) {
    var socket = net.connect(MAGIC_PORT)
    if (typeof callback === 'function') socket.on('data', callback)
    socket.write('__kill__')
    socket.write(pid)
    // socket.end('__end__')
  }
  return self
}

var b = biff()

// b.spawn(`function () {
//   console.log(11)
// }`, function (d) {
//   console.log(d.toString())
// })

b.spawn(__dirname+'/tests/example.js', function (pid) {
  console.log(pid.toString())
  b.send(pid, { message: 'from parent' })
  // b.receive(pid, function (e, message) {
    // parent can receive
    // b.kill(pid)
  // })
})
