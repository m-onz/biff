
/*

  demo app

  run with... biff app.js
  or...       npm start

  we can access node API from the main program.
  there is no need to import using require.

*/

var actor1 = ''

spawn(__dirname+'/actor.js')
  .then(function (pid) {
    console.log('> ', pid)
    setInterval(function () {
      send(pid, { self: pid, m: Math.random() })
    }, 1000)
  })
  .catch(function (e) {
    console.log('error in actor ', e)
  })

console.log('we have fs access here::', fs.readdirSync(__dirname))

setTimeout(function () {
  process.exit(0)
}, 6000)
