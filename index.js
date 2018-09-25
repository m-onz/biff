
var crypto = require('crypto')
var Mesh = require('hyperdb-mesh')
var ivm  = require('isolated-vm')
var path = require('path')
var fs = require('fs')
var os = require('os')
var client = require('./client.js')

function biff () {
  if (! (this instanceof biff)) return new biff ()
  var self = this
  console.log('db::', os.tmpdir()+'/biff.db')
  self.mesh = Mesh(path.normalize(os.tmpdir()+'/biff.db'), null, // todo mesh key
    { id: 'mailbox', options: { valueEncoding: 'json' }
  })
  self.db = self.mesh.db
  self.handleReceive = function (pid, callback) {
    self.receive(pid).then(function (mailbox) {
      callback.apply(null, [null, JSON.stringify(mailbox) ])
    }).catch(function (e) {
      callback.apply(null, [null, JSON.stringify(e) ])
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
  self.spawn = function (actor) {
    return new Promise(function (resolve, reject) {
      if (actor.includes('/') && actor.startsWith('/')) {
        actor = fs.readFileSync(actor); }
      var ida = crypto.randomBytes(2).toString('hex')
      var idb = crypto.randomBytes(2).toString('hex')
      var pid = `${ida}:${idb}`
      var src = actor.toString()
      var isolate = new ivm.Isolate({ memoryLimit: 128 })
      var context = isolate.createContextSync()
      self.bootstrap(context, isolate)
      isolate.compileScriptSync(`global.self="${pid}";\n\n${src}`)
        .run(context)
        .then(function () {
          console.log('<', pid, '>')
          resolve(pid)
        })
        .catch(reject)
    })
  }
  self.send = function (pid, message) {
    return new Promise(function (resolve, reject) {
      self.db.get(`/actors/${pid}`, function (e, d) {
        var queue = []
        if (d && d[0] && d[0].hasOwnProperty('value')) queue = d[0].value
        queue.push(message)
        self.db.put(`/actors/${pid}`, queue, function (e) {
          if (e) return reject (e)
          setTimeout(function () {
            resolve({ sent: pid })
          }, 50)
        })
      })
    })
  }
  self.receive = function (pid) {
    return new Promise(function (resolve, reject) {
      self.db.get(`/actors/${pid}`, function (e, d) {
        if (e || !d[0]) return reject (e)
        var queue = d[0].value
        if (!queue.length) return resolve([])
        var latest = queue.pop()
        self.db.put(`/actors/${pid}`, queue, function (e, d) {
          if (e) return reject(e)
          resolve(latest)
        })
      })
    })
  }
  self.kill = function (pid) {
    return new Promise(function (resolve, reject) {
      self.db.del(`/actors/${pid}`, function (e, d) {
        if (e) return reject (e)
        resolve({ killed: pid })
      })
    })
  }
  return self
}

module.exports = {
  lib: biff,
  client: client
}
