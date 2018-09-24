
/*

demo app 1

run with... biff app.js

we can access node API from the main program.
there is no need to import using require.

*/

spawn(__dirname+'/actor.js')
  .then(function (pid) {
    console.log('> ', pid)
    setInterval(function () {
      send(pid, { m: Math.random() })
    }, 1000)
  })
