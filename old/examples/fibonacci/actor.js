
console.log('from actor example ', self)

function mailbox (callback) {
  receive(function (messages) {
    var _messages = Object.assign({}, messages)
    if (typeof _messages === 'object' && Object.keys(_messages).length) callback(_messages)
    setTimeout(0).then(function () {
      mailbox (callback)
    })
  })
}

function fibonacci(num) {
  if (num <= 1) return 1;
  return fibonacci(num - 1) + fibonacci(num - 2);
}

mailbox(function (message) {
  console.log('demo')
  send(message.self, { input: message.num, result: fibonacci(message.num) })
})
