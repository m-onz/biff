
/*

  demo app

  run with... biff app.js
  or...       npm start

  we can access node API from the main program.
  there is no need to import using require.

*/

var actor1 = ''
var actor2 = ''

spawn(__dirname+'/actor.js')
  .then(function (pid) {
    console.log('> ', pid)
    actor1 = pid
    setInterval(function () {
      send(pid, { self: actor2, m: Math.random() })
    }, 1000)
  })

spawn(__dirname+'/actor.js')
  .then(function (pid) {
    console.log('> ', pid)
    actor2 = pid
    setTimeout(function () {
      send(actor2, { self: actor1, m: Math.random() })
    }, 1000)
  })

console.log('we have fs access here::', fs.readdirSync(__dirname))
