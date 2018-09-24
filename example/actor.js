
console.log(self)

function recurse () {
  receive(function (messages) {
    if (messages) console.log(messages, ' from actor')
    setTimeout(1000).then(function () {
      recurse ()
    })
  })
}

recurse()
