
spawn(function () {
  setTimeout(500).then(function () {
    receive(function (message) {
      console.log(message)
    })
  })
  function fibonacci(num) {
    if (num <= 1) return 1;
    return fibonacci(num - 1) + fibonacci(num - 2)
  }
  send(self, { fib: 22, result: fibonacci (22) })
}, function () {
  setTimeout(function () {
    spawn (function () {
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
    	var mailbox = receive(pid)
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
  }, 1000)
})
