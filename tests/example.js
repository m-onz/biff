console.log('<self>', self)
//
function reciever () {
  receive(function (message) {
    if (message) console.log(message)
    setTimeout(5000).then(function () {
      reciever ()
    })
  })
}

function sender () {
  send(self, { m: Math.random() })
  setTimeout(5000).then(function () {
    sender ()
  })
}

sender()
reciever ()
