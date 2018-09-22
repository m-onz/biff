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
  global.receive = function (mailbox, callback) {
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
  // util
  let setTimeout = _setTimeout
  delete _setTimeout
  global.__setTimeout = function (timer, callback) {
    return new Promise((resolve, reject) => {
      const callback = new ivm.Reference(function () {
        resolve()
      })
      setTimeout.apply(null, [ timer, callback ])
    })
  }
  global.setTimeout = function (cb, timer) {
    global.__setTimeout(timer).then(cb)
  }
}
//
