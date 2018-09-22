
console.log('self>', self)

send(self, 'turnips')

receive(function (message) {

	console.log('> ', message)

	setTimeout(function () {
		spawn('function a () { console.log(22); spawn("console.log(55)") } a();')
		console.log('WINNING !!!!!!')
	}, 1000)

})
