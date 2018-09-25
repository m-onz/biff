
/*
  actors do not have access to nodes API...

  try {
    console.log(process)
    var fail = require('will-fail')
  } catch (e) {
    console.log('.', e)
  }

  the above will fail.

  You must use message passing ONLY to interface with node.
*/

console.log('from actor example ', self)

function mailbox (callback) {
  receive(function (messages) {
    var _messages = Object.assign({}, messages)
    try {
      if (typeof _messages === 'object' && Object.keys(_messages).length) callback(_messages)
    } catch (e) {}
    setTimeout(0).then(function () {
      mailbox (callback)
    })
  })
}
mailbox(function (message) {
  if (message.hasOwnProperty('req')) {
    send('server::'+self, { message: Math.random() })
  }
})
