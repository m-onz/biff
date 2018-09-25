
/*

  demo app

  run with... biff app.js
  or...       npm start

  we can access node API from the main program.
  there is no need to import using require.

*/

http.createServer(function (req, res) {

  spawn (__dirname+'/actor.js').then(function (pid) {
    send(pid, { req: req.url }).then(function () {
      setTimeout(function () {
        receive('server').then(function (message) {
          if (Object.keys(message.mailbox).length) {
            res.end(JSON.stringify(message))
          } else {
            res.end(JSON.stringify([]))
          }
        })
      }, 11)
    })
  })

}).listen(3000, function () {

  http.get('http://localhost:3000', function (socket) {
    socket.on('data', function (d) {
      console.log('>>>> socket', d.toString())
    })
  })

})
