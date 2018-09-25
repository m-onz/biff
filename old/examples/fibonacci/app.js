
var incro = 0

spawn(`
console.log(self)
function mailbox (callback) {
  receive(function (messages) {
    var _messages = Object.assign({}, messages)
    if (typeof _messages === 'object' && Object.keys(_messages).length) callback(_messages)
    setTimeout(500).then(function () {
      mailbox (callback)
    })
  })
}
mailbox(function (message) {
  console.log(message)
})

`).then(function (self) {
  console.log('self ', self)
  spawn(__dirname+'/actor.js')
    .then(function (pid) {
      console.log('p ', pid)
      setInterval(function () {
        console.log('fibonacci of ', incro)
        send(pid, { self: self, num: Math.floor(incro++) })
      }, 2000)
    })
    .catch(function (e) {
      console.log('error in actor ', e)
    })
})
