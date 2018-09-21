
var ivm = require('isolated-vm')
var fs = require('fs')

function bootstrap(context, iso) {
  const jail = context.globalReference()
  jail.setSync('global', jail.derefInto())
  jail.setSync('_ivm', ivm);
  jail.setSync('_log', new ivm.Reference(function (...args) {
    args.unshift("v8:")
    console.log(...args);
  }))
  jail.setSync('_send', new ivm.Reference(function (...args) {
    args.unshift("v8:")
    console.log(...args);
  }))
  jail.setSync('_receive', new ivm.Reference(handleReceive))
  const code = iso.compileScriptSync(fs.readFileSync("./bootstrap.js").toString())
  code.runSync(context)
  // setTimeout(() => true, 30000)
}

module.exports = function biff () {
  if (! (this instanceof biff)) return new biff ()

  this.spawn = function (actor) {
    return new Promise(function (resolve, reject) {
      var pid = Math.random()
      const src = actor.toString()
      const isolate = new ivm.Isolate({ memoryLimit: 128 })
      const context = isolate.createContextSync()
      bootstrap(context, isolate)
      var r = isolate.compileScriptSync(src).runSync(context)
      if (r) resolve(r)
        else reject('error running actor! ', pid)
    })
  }

}

function handleReceive(mailbox, callback) {
  console.log(`receive`)
  var v8resp = {
    i: mailbox,
    a: Math.random(),
    t: new Date().toISOString()
  }
  callback.apply(null, [null, JSON.stringify(v8resp)])
  //   callback.apply(null, [err.toString()])
}
