
var json_stream = require('duplex-json-stream')
var biff = require('.')()
var net = require('net')

module.exports = function server () {
  if (! (this instanceof server)) return new server ()
  this.server = net.createServer(function (socket) {
    socket = json_stream(socket)
    socket.on('data', function (data) {
      switch (data.cmd) {
        case 'spawn':
          biff.spawn(data.actor)
            .then(function (pid) {
              console.log('handle spawn')
              socket.write({ spawned: pid })
            }).catch(function (e) { socket.end(''+e) })
        break;
        case 'send':
          console.log('handle send')
          biff.send(data.pid, data.message)
            .then(function (ok) {
              socket.write({ sent: ok })
            }).catch(function (e) { socket.write(''+e) })
        break;
        case 'receive':
          console.log('handle receive')
          biff.receive(data.pid)
            .then(function (mailbox) {
              socket.write({ mailbox: mailbox })
            }).catch(function (e) { socket.write(''+e) })
        break;
        case 'kill':
          console.log('handle kill')
          biff.kill(data.pid)
            .then(function (mailbox) {
              socket.write({ killed: data.pid })
            }).catch(function (e) { socket.write(''+e) })
        break;
        default:
          console.log('no handler found for ', data.cmd)
        break;
      }
    })
  })
  return this.server
}
