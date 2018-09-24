
var os   = require('os')
var net  = require('net')
var path = require('path')
var Mesh = require('hyperdb-mesh')
var ivm  = require('isolated-vm')
var crypto = require('crypto')
var fs = require('fs')
// biff server node

var MAGIC_PORT = 7190

function handleReceive(pid, callback) {
  // return self.db.get(`/${pid}`, function (e, d) {
  //   if (e) throw e
  //   if (e || !d[0]) callback.apply(null, [ JSON.stringify(e) ])
  //   if (callback && self.ready) callback.apply(null, [null, JSON.stringify(d[0].value) ])
  //    else callback.apply(null, [ JSON.stringify(e) ])
  // })
  callback.apply(null, [null, JSON.stringify({}) ])
}
function handleSetimeout (timer, callback) {
  setTimeout(function () {
    callback.apply(null, [ null, true ])
  }, timer)
}

function biff_server () {
  if (! (this instanceof biff_server)) return new biff_server ()
  this.mesh = Mesh(path.normalize(os.tmpdir()+'/biff.db'), null, // todo mesh key
    { id: 'mailbox', options: { valueEncoding: 'json' }
  })
  var self = this.mesh
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
      // self.db.put(`/${recipient}`, message, function (e) {
      //   if (e) throw e
      // })
    }))
    jail.setSync('_spawn', new ivm.Reference(function (...args) {
      var f = args[0]
      // var b = biff()
      // b.spawn(f).catch(function (e) {
      //   console.log('spawn error ', e)
      // })
    }))
    jail.setSync('_exit', new ivm.Reference(function (...args) {
      console.log('should destroy... ', args)
    }))
    jail.setSync('_receive', new ivm.Reference(handleReceive))
    jail.setSync('_setTimeout', new ivm.Reference(handleSetimeout))
    const code = iso.compileScriptSync(fs.readFileSync(__dirname+'/bootstrap.js').toString())
    code.runSync(context)
    setTimeout(function () {}, 30000)
  }
  function spawn (actor, callback) {
    if (actor.includes('/') && actor.startsWith('/')) {
      actor = fs.readFileSync(actor); }
    const ida = crypto.randomBytes(2).toString('hex')
    const idb = crypto.randomBytes(2).toString('hex')
    const pid = `${ida}:${idb}`
    const src = actor.toString()
    const isolate = new ivm.Isolate({ memoryLimit: 128 })
    const context = isolate.createContextSync()
    self.bootstrap(context, isolate)
    var _actor = isolate.compileScriptSync(`global.self="${pid}"; \n\n ${src}`)
    _actor
      .run(context)
      .then(function () {
        callback(null, pid)
      })
      .catch(function (e) { callback(e); })
  }
  self.db.on('ready', function () {
    self.db.watch('/actors/', function () {
      var s = self.db.createReadStream('/actors/')
      s.on('data', function (d) {
        console.log('>', d)
        if (d[0].value.should_run) {

          if (!d[0].value.hasOwnProperty('code')) return;
          console.log('> loading code :: ', d[0].value.code)
          spawn(d[0].value.code, function (e, pid) {
            if (!e) console.log('spawned::', pid)
          })
        }
        // handle spawn signal
        // handle kill signal
      })
      s.on('end', function () {
        console.log('finished')
      })
    })
  })
  self.server = net.createServer(function (socket) {
    socket.on('data', function (d) {
      var _buff = d.toString();
      if (_buff.startsWith('__spawn')) {
        console.log('spawn')
        var buff = _buff.split('__spawn__')[1]
        if (buff.includes('/') && buff.startsWith('/')) {
          buff = fs.readFileSync(buff).toString(); }
        var id = crypto.randomBytes(4).toString('hex') + ':' + crypto.randomBytes(4).toString('hex')
        self.db.put('/actors/'+id, {
          id: id,
          code: buff,
          should_run: true
        }, function (e) {
          if (e) throw e
          socket.end('spawned @ '+new Date().toISOString())
        })
      } else if (_buff.startsWith('__send')) {
        // send message to a mailbox
        // var id = '123'
        // self.db.put('/actors/'+id+'/mailbox', {
        //   id: id,
        //   message: { a:11, b:22 }
        // }, function (e) {
        //   if (e) throw e
          socket.end('sent to @ '+id)
        // })
      } else if (_buff.startsWith('__recieve')) {
        // send mailbox changes to receiver. until socket close
        // var id = '123'
        // self.db.watch('/actors/'+id+'/mailbox',function (e) {
        //   if (e) throw e
        //   self.db.get('/actors/'+id+'/mailbox', function (e, d) {
        //     if (e) throw e
        //     socket.write('sent to @ '+d[0].value)
        //   })
        // })
      } else if (_buff.startsWith('__kill')) {
        // kill an actor
        // self.db.put('/actors/'+id, {
        //   should_run: false
        // }, function (e) {
        //   if (e) throw e
          socket.end('sent kill signal to @ '+id)
        // })
      }
    })
  }).on('error', function (err) {
    throw err
  })
  self.server.listen(MAGIC_PORT, function () {
  })
}

biff_server ()
/*
*/
