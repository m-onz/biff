
spawn(function() {

  function fibonacci(num) {
    if (num <= 1) return 1;
    return fibonacci(num - 1) + fibonacci(num - 2)
  }

  emit('turnips', { self: self, message: 'hello world!', fib: fibonacci(11) })

  var cache = []

  function check_channel () {
    on('turnips', function (messages) {
      messages.forEach(function (m) {
        if (cache.includes(m.id)) return;
        cache.push(m.id)
        console.log(m)
      })
      check_channel ()
    })
  }

  check_channel ()
})
