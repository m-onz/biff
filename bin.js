#!/usr/bin/env node

var path = require('path')
var biff = require('.')()
var vm   = require('vm')
var fs   = require('fs')

global.require = require
global.biff = biff
global.__dirname = __dirname
global.process = process
global.fs = fs

try {
  var args = process.argv.slice(2)
  var file = args[0]
  var _script = fs.readFileSync(path.normalize(file))
  var script = new vm.Script(_script, { filename: 'biff.vm' })
  //  biff
  script.runInThisContext()
} catch (e) { throw e; }
