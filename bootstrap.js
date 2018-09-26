//
new function () {
  let ivm = _ivm;
  delete _ivm;
  let log = _log;
  delete _log;
  global.console = {
    log: function (...args) {
      log.applyIgnored(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
    }
  }
  let receive = _receive
  delete _receive
  global.__receive = function (mailbox, callback) {
    return new Promise((resolve, reject) => {
      const callback = new ivm.Reference(function (err, resp) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(resp))
        }
      })
      receive.apply(null, [mailbox, callback])
    })
  }
  global.receive = function (cb) {
    __receive(self).then(cb).catch(cb)
  }
  let on = _on
  delete _on
  global.__on = function (channel, callback) {
    return new Promise((resolve, reject) => {
      const callback = new ivm.Reference(function (err, resp) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(resp))
        }
      })
      on.apply(null, [channel, callback])
    })
  }
  global.on = function (channel, cb) {
    __on(channel).then(cb).catch(cb)
  }
  let send = _send;
  delete _send;
  global.send = function (...args) {
    send.applyIgnored(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
  }
  let spawn = _spawn;
  delete _spawn;
  global.spawn = function (...args) {
    spawn.applyIgnored(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
  }
  let exit = _exit;
  delete _exit;
  global.exit = function (...args) {
    exit.applyIgnored(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
  }
  let emit = _emit;
  delete _emit;
  global.emit = function (...args) {
    emit.applyIgnored(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
  }
  // util
  let setTimeout = _setTimeout
  delete _setTimeout
  global.setTimeout = function (timer, callback) {
    return new Promise((resolve, reject) => {
      const callback = new ivm.Reference(function (err, resp) {
        if (err) {
          reject(err)
        } else {
          resolve(resp)
        }
      })
      setTimeout.apply(null, [ timer, callback ])
    })
  }
}
//
