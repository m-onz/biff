
# biff

Experimental actor system using isolated javascript runtimes

```js

var biff = require('@m-onz/biff')()

biff.spawn(__filename).catch(function (e) {})

biff.spawn(`
function a () {
	console.log(33)
	send(123, 'hello world! from SEND')
}
receive().then(function (message) {
	console.log(message)
})
a()
`)
.then(function (pid) {
	console.log(pid, ' pid')
	biff.send(pid, 'turnips!')
})
.catch(function (e) { throw e; })

```

## actor methods

```js

console.log('pid>', self)

send(self, 'hello world')

receive(self).then(function (message) {
	console.log(message)
	spawn('console.log(11)')
})

```
