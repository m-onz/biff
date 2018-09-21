
console.log('self>', self)

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
})
