
var biff = require('.')()

var c = `
send(self, 'turnips')
receive(self).then(function (x) {
	console.log(x)
	receive(self).then(function (x) {
		console.log(x)
		receive(self).then(function (x) {
			console.log(x)
			spawn('function a () { console.log(22); spawn("console.log(55)") } a();')
		})
	})
})`

biff.spawn(__dirname+'/example.js')
.then(function (pid) {
	console.log('example pid')
})

biff.spawn(c)
.then(function (pid) {
	console.log('..', ' pid ', pid)
	setTimeout(function () {
		biff.send(pid, { a: Math.random() })
		biff.receive(pid, function (e, inbox) {
			console.log(inbox)
		})
	}, 1000)
})
.catch(function (e) { console.log(e); })
