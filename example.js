
console.log('self>', self)

send(self, 'turnips')

receive(self).then(function (x) {

	console.log('> ', x)

	setTimeout(function () {
		spawn('function a () { console.log(22); spawn("console.log(55)") } a();')
		console.log('WINNING !!!!!!')
	}, 1000)

})
