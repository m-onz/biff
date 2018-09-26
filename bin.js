#!/usr/bin/env node

var assert = require('assert')
var path = require('path')
var biff = require('./biff.js')()
var vm = require('vm')
var fs = require('fs')
var net = require('net')
var http = require('http')

// exposed node interfaces
//
global.fs = fs
global.biff = biff
global.net  = net
global.http = http
global.assert = assert
global.__dirname = process.cwd()
global.process = process
global.spawn = biff.spawn
global.send = biff.send
global.receive = biff.receive
global.kill = biff.kill
global.self = '\n\n FAILURE! you are trying to run an actor in parent scope!' +
'\n\n Try running npm start instead\n\n'

try {
  var args = process.argv.slice(2)
  var file = args[0]
  var _script = fs.readFileSync(path.normalize(file))

  //  biff
  var script = new vm.Script(_script, { filename: 'biff.vm' })
  script.runInThisContext()

} catch (e) { throw e; }
