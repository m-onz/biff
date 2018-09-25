
/*

  http demo

*/

http.createServer(function (req, res) {

  var timeout = setTimeout(function () {
    res.end()
  }, 4000)

  spawn (__dirname+'/actor.js').then(function (pid) {
    send(pid, { req: req.url }).then(function () {
      receive('server::'+pid).then(function (message) {
        if (message.hasOwnProperty('mailbox') && Object.keys(message.mailbox).length) {
          res.end(JSON.stringify(message))
        } else {
          res.end(JSON.stringify([]))
        }
        clearInterval(timeout)
        kill(pid)
        kill('server::'+pid) // delete the temporary channel
      })
    })
  })

}).listen(3000, function () {

  http.get('http://localhost:3000', function (socket) {
    socket.on('data', function (d) {
      console.log('>>>> socket', d.toString())
    })
  })

})
