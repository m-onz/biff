
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

function recurse () {
  receive(function (messages) {
    if (messages) console.log(messages, ' from actor')
    setTimeout(1000).then(function () {
      recurse ()
    })
  })
}

recurse()

setTimeout(4000).then(function () {
  exit(self)
})
