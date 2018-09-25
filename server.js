
var json_stream = require('duplex-json-stream')
var biff = require('.')()
var net = require('net')

var server = net.createServer(function (socket) {
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

server.listen(9999)

//

var client = json_stream(net.connect(9999))

client.write({
  cmd: 'spawn',
  actor: `
  setTimeout(2000).then(function () {
    send(self, { a: 22 })
    setTimeout(2000).then(function () {
    receive(function (mailbox) { console.log(mailbox); })
    })
  })
  `
})

client.on('data', function (response) {
  console.log('>>> ', response)
  if (response.spawned) {
    var pid = response.spawned
    setInterval(function () {
      client.write({
        cmd: 'send',
        pid: pid,
        message: { b: Math.random() }
      })
    }, 2000)
    setInterval(function () {
      client.write({
        cmd: 'receive',
        pid: pid
      })
    }, 3000)
  }
})

/*
client.write({
  cmd: 'kill',
  pid: '123'
})

client.write({
  cmd: 'x',
  pid: 'x'
})
*/
