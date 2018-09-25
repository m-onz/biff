
// test recursion

var c = `
console.log(self)

function send_demo () {
  send(self, { mess: Math.random() })
  setTimeout(1000).then(function () {
    send_demo ()
  })
}

function recurse () {
  receive(function (messages) {
    if (messages.length) console.log(messages, ' from actor')
    setTimeout(1000).then(function () {
      recurse ()
    })
  })
}
recurse()
send_demo ()
`

biff.spawn(c)
.then(function (pid) {
  console.log(pid)
  setInterval(function () {
    biff.send (pid, { x: Math.random() })
  }, 500)
  setInterval(function () {
    biff.receive(pid, function (e, message) {
      console.log('>', message)
    })
  }, 511)
})
.catch(function (e) { throw e; })

setTimeout(function () {
  process.exit(0)
}, 6000)
