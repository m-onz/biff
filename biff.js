
var Mesh = require('hyperdb-mesh')
var ivm  = require('isolated-vm')
var crypto = require('crypto')
var Ev = require('events').EventEmitter
var path = require('path')
var fs = require('fs')
var os = require('os')

function _biff () {
	if (! (this instanceof _biff)) return new _biff ()
	var self = this
	console.log('db::', os.tmpdir()+'/biff.db')
	self.mesh = Mesh(path.normalize(os.tmpdir()+'/biff.db'), null, // todo mesh key
		{ id: 'mailbox', options: { valueEncoding: 'json' }
	})
	self.db = self.mesh.db
	self.handleReceive = function (pid, callback) {
		var s = self.db.createReadStream('/actors/'+pid)
		var messages = []
		var keys = []
		s.on('data', function (d) {
			messages.push(d[0].value)
			keys.push(d[0].key)
		})
		s.on('end', function () {
			// flush messages
			keys.forEach(function (k) {
				self.db.del(k)
			})
			setTimeout(function () {
				callback.apply(null, [ null, JSON.stringify(messages) ])
			}, 11)
		})
	}
	self.handleSetimeout = function (timer, callback) {
		setTimeout(function () {
			callback.apply(null, [ null, true ])
		}, timer)
	}
	self.bootstrap = function (context, iso) {
		var jail = context.globalReference()
		jail.setSync('global', jail.derefInto())
		jail.setSync('_ivm', ivm)
		jail.setSync('_log', new ivm.Reference(function (...args) {
			args.unshift("log:")
			console.log(...args)
		}))
		jail.setSync('_send', new ivm.Reference(function (...args) {
			var recipient = args[0]
			var message = args[1]
			self.send(recipient, message).then(function (ok) {
				console.log(ok)
			}).catch(function (e) {
				console.log('error during send ', e)
			})
		}))
		jail.setSync('_spawn', new ivm.Reference(function (...args) {
			var f = args[0]
			self.spawn(f).then(function (pid) {
				console.log('<spawned>', pid)
			}).catch(function (e) { console.log('error during spawn::', e)})
		}))
		jail.setSync('_exit', new ivm.Reference(function (...args) {
			console.log('should destroy... ', args)
			self.kill(args[0]).then(function () {
				console.log('<killing>', args[0])
				jail.release()
				iso.dispose()
			}).catch(function (e) { console.log('error killing actor::', e)})
		}))
		jail.setSync('_receive', new ivm.Reference(self.handleReceive))
		jail.setSync('_setTimeout', new ivm.Reference(self.handleSetimeout))
		var code = iso.compileScriptSync(fs.readFileSync(__dirname+'/bootstrap.js').toString())
		code.runSync(context)
		setTimeout(function () {}, 30000)
	}
	this.spawn = function (fun, callback) {
		var ida = crypto.randomBytes(2).toString('hex')
		var idb = crypto.randomBytes(2).toString('hex')
		var pid = `${ida}:${idb}`
		var src = fun+''
		var isolate = new ivm.Isolate({ memoryLimit: 128 })
		var context = isolate.createContextSync()
		self.bootstrap(context, isolate)
		isolate.compileScriptSync(`global.self="${pid}";\n\n(${src})()`)
		.run(context)
		.then(function () {
			console.log('<', pid, '>')
			if (typeof callback === 'function') callback(null, pid)
		})
		.catch(function (e) {
			if (typeof callback === 'function') callback(e)
		})
		return fun
	}
	this.send = function (pid, message) {
		console.log('send ', pid , ' ', message)
		self.db.put('/actors/'+pid+'/'+new Date().toISOString(), message)
	}
	this.receive = function (pid) {
		var e = new Ev
		self.db.watch('/actors/'+pid, function () {
			var s = self.db.createReadStream('/actors/'+pid)
			var messages = []
			var keys = []
			s.on('data', function (d) {
				messages.push(d[0].value)
				keys.push(d[0].key)
			})
			s.on('end', function () {
				e.emit('message', messages)
				// flush messages
				// keys.forEach(function (k) {
				// 	self.db.del(k)
				// })
			})
		})
		return e
	}
	return this
}

module.exports = _biff
