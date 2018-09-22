
console.log(process.cwd())

var c = `
	send(self, 'turnips')
	receive(function (x) {
		spawn('function a () { console.log(22); spawn("console.log(55)") } a();')
	})
`

biff.spawn(__dirname+'/example.js')
.then(function (pid) {
	console.log('example pid ', pid)
	assert.ok(typeof pid === 'string')
	assert.ok(typeof fs.readFileSync(__dirname+'/example.js').toString() === 'string')
})

biff.spawn(c)
.then(function (pid) {
	setTimeout(function () {
		biff.send(pid, { a: Math.random(), t: new Date().toISOString() })
		biff.send(pid, { b: Math.random(), t: new Date().toISOString() })
		biff.send(pid, { c: Math.random(), t: new Date().toISOString() })
	}, 500)
	setTimeout(function () {
		biff.receive(pid, function (e, inbox) {
			assert.ok(inbox.length === 3)
			// messages flush after reading
			biff.receive(pid, function (e, inbox) {
				if (e) throw e
				assert.ok(inbox.length === 0)
				console.log('tests have passed!')
				process.exit(0)
			})
		})
	}, 1000)
})
.catch(function (e) { throw e; })
