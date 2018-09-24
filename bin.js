#!/usr/bin/env node

var assert = require('assert')
var path = require('path')
var biff = require('.')()
var vm   = require('vm')
var fs   = require('fs')

// review exposed node interfaces
//
global.fs = fs
global.biff = biff
global.assert = assert
global.__dirname = process.cwd()
global.process = process
global.spawn = biff.spawn
global.send = biff.send
global.receive = biff.receive

try {
  var args = process.argv.slice(2)
  var file = args[0]
  var _script = fs.readFileSync(path.normalize(file))

  //  biff
  global.biff.on('ready', function () {
    var script = new vm.Script(_script, { filename: 'biff.vm' })
    script.runInThisContext()
  })

} catch (e) { throw e; }
