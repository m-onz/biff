#!/usr/bin/env node

var assert = require('assert')
var path = require('path')
var biff = require('.')()
var vm   = require('vm')
var fs   = require('fs')

global.fs = fs
global.biff = biff
global.assert = assert
global.__dirname = __dirname
global.process = process

try {
  var args = process.argv.slice(2)
  var file = args[0]
  var _script = fs.readFileSync(path.normalize(file))
  var script = new vm.Script(_script, { filename: 'biff.vm' })
  //  biff
  script.runInThisContext()
} catch (e) { throw e; }
