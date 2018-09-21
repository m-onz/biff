
var biff = require('.')()

biff.spawn(`function a () {
	console.log(33)
	send(123, 'hello world! from SEND')
}
receive(11).then(function (message) {
	console.log(message)
})
a();
a();
a();`)
.then(function (pid) {
	console.log(pid, ' pid')
	biff.send(pid, 'turnips!')
})
.catch(function (e) { throw e; })

/*

test

get a source file from disk as a  buffer (a file) and turn it into a string
wrap spawn code in Imediately invoking expression?



*/
