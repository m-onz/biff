
console.log(process.cwd())

var c = `console.log(11);`

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
	}, 500)
	setTimeout(function () {
		biff.receive(pid, function (e, inbox) {
			console.log(inbox, ' inbox')
			assert.ok(typeof inbox === 'object')
			console.log('tests have passed!')
			process.exit(0)
		})
	}, 1000)
})
.catch(function (e) { throw e; })
