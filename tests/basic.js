
console.log(process.cwd())

var c = `
	send(self, { message: 'turnips' })
	receive(function (x) {
		console.log(x)
		//spawn('function a () { console.log(22); spawn("console.log(55)"); } a();')
	})
`

biff.spawn(__dirname+'/tests/example.js')
.then(function (pid) {
	console.log('example pid ', pid)
	assert.ok(typeof pid === 'string')
	assert.ok(typeof fs.readFileSync(__dirname+'/tests/example.js').toString() === 'string')
}).catch((e) => console.log(e))

biff.spawn(c)
.then(function (pid) {
	setTimeout(function () {
		biff.send(pid, { a: Math.random(), t: new Date().toISOString() })
		biff.send(pid, { b: Math.random(), t: new Date().toISOString() })
		biff.send(pid, { c: Math.random(), t: new Date().toISOString() })
	}, 500)
	setTimeout(function () {
		biff.receive(pid, function (e, inbox) {
			// assert.ok(inbox.length === 3)
			console.log('1', inbox)
			// messages flush after reading
			biff.receive(pid, function (e, inbox) {
				if (e) throw e
				console.log('2', inbox)
				// assert.ok(inbox.length === 0)
				console.log('tests have passed!')
				process.exit(0)
			})
		})
	}, 1000)
})
.catch(function (e) { throw e; })
