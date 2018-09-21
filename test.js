
var biff = require('.')()

biff.spawn(
`
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
)
.then(function (pid) {
	console.log('..', ' pid ', pid)
	// biff.send(pid, 'turnips!')
})
.catch(function (e) { console.log(e); })
