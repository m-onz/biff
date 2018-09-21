
const crypto = require('crypto')
const ivm = require('isolated-vm')
const fs = require('fs')

let mailboxes = {}

function bootstrap (context, iso) {
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
    mailboxes[recipient].push(message)
  }))
  jail.setSync('_spawn', new ivm.Reference(function (...args) {
    var f = args[0]
    var b = biff()
    b.spawn(f)
  }))
  jail.setSync('_receive', new ivm.Reference(handleReceive))
  const code = iso.compileScriptSync(fs.readFileSync("./bootstrap.js").toString())
  code.runSync(context)
}

function biff () {
  if (! (this instanceof biff)) return new biff ()
  this.spawn = function (actor) {
    return new Promise(function (resolve, reject) {
      const pid = `<${crypto.randomBytes(2).toString('hex')}::${crypto.randomBytes(2).toString('hex')}>`
      const src = actor.toString()
      const isolate = new ivm.Isolate({ memoryLimit: 128 })
      const context = isolate.createContextSync()
      mailboxes[pid] = []
      bootstrap(context, isolate)
      try {
        isolate.compileScriptSync('global.self="'+pid+'";'+src).runSync(context)
        resolve(pid)
      } catch (e) { reject(e); }
    })
  }
  this.send = function (pid, message) {
    mailboxes[pid].push(message)
  }
  this.receive = function (pid, callback) {
    try {
      callback(null, mailboxes[pid])
    } catch (e) { callback(e); }
  }
}

function handleReceive(pid, callback) {
  var r = mailboxes[pid]
  if (!r) r = {}
  callback.apply(null, [null, JSON.stringify(r)])
}

module.exports = biff
