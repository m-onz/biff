
const ram = require('random-access-memory')
const Mesh = require('hyperdb-mesh')
const crypto = require('crypto')
const ivm = require('isolated-vm')
const fs = require('fs')

function biff () {

  if (! (this instanceof biff)) return new biff ()

  this.mesh = Mesh(ram, null, { id: 'mailbox', options: { valueEncoding: 'json' } })
  var self = this.mesh

  function handleReceive(pid, callback) {
    return self.db.get(`/${pid}`, function (e, d) {
      if (e) throw e
      if (e || !d[0]) callback.apply(null, [ JSON.stringify(e) ])
      if (callback && self.ready) callback.apply(null, [ null, JSON.stringify(d[0].value) ])
       else callback.apply(null, [ JSON.stringify(e) ])
    })
  }
  function handleSetimeout (timer, callback) {
    setTimeout(function () {
      callback.apply(null, [ null, true ])
    }, timer)
  }

  self.bootstrap = function (context, iso) {
    const jail = context.globalReference()
    jail.setSync('global', jail.derefInto())
    jail.setSync('_ivm', ivm)
    jail.setSync('_log', new ivm.Reference(function (...args) {
      args.unshift("log:")
      console.log(...args)
    }))
    jail.setSync('_send', new ivm.Reference(function (...args) {
      var recipient = args[0]
      var message = args[1]
      self.db.put(`/${recipient}`, message, function (e) {
        if (e) throw e
      })
    }))
    jail.setSync('_spawn', new ivm.Reference(function (...args) {
      var f = args[0]
      var b = biff()
      b.spawn(f)
    }))
    jail.setSync('_receive', new ivm.Reference(handleReceive))
    jail.setSync('_setTimeout', new ivm.Reference(handleSetimeout))
    const code = iso.compileScriptSync(fs.readFileSync(__dirname+'/bootstrap.js').toString())
    code.runSync(context)
    setTimeout(function () {}, 30000)
  }

  self.ready = false

  self.on('ready', function () {
    console.log('biff replication key ', self.db.key.toString('hex'))
    self.ready = true
  })
  self.spawn = function (actor) {
    return new Promise(function (resolve, reject) {
      if (!self.ready) return reject('not ready')
      if (actor.includes('/') && actor.startsWith('/')) {
        actor = fs.readFileSync(actor)
      }
      const pid = `${crypto.randomBytes(2).toString('hex')}:${crypto.randomBytes(2).toString('hex')}`
      const src = actor.toString()
      const isolate = new ivm.Isolate({ memoryLimit: 128 })
      const context = isolate.createContextSync()
      self.bootstrap(context, isolate)
      self.db.put(`/${pid}`, {}, function (e) {
        if (e) throw e
      })
      try {
        isolate.compileScriptSync('global.self="'+pid+'";'+src).runSync(context)
        resolve(pid)
      } catch (e) { reject(e); }
    })
  }
  self.send = function (pid, message) {
    self.db.put(`/${pid}`, message, function (e) {
      if (e) throw e
    })
  }
  self.receive = function (pid, callback) {
    self.db.get(`/${pid}`, function (e, d) {
      if (e || !d[0]) return callback(e)
      if (Object.keys(d[0].value).length) callback(null, d[0].value)
        else callback('error')
    })
  }
  return self
}



module.exports = biff
