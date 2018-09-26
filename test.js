
var assert = require('assert')
var _biff = require('./biff.js')

var biff = _biff ()

biff.spawn (function () {
	console.log('inside a spawned function! ', self)
	send (self, { a: Math.random() })
	setTimeout(1000).then(function () {
		receive(function (message) {
			console.log(message)
			receive(function (message) {
				console.log(message)
				exit()
			})
		})
	})
}, function (e, pid) {
	if (e) return console.log(e)
	var mailbox = biff.receive(pid)
  var once = true
	mailbox.on('message', function (message) {
		console.log(message)
    if (once) {
      assert.ok(typeof message[0].a === 'number')
      once = false
    } else {
      // assert mailbox gets flushed
      console.log('tests passed')
      assert.ok(message.length === 0)
      process.exit(0)
    }
	})
})
