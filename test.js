var fs = require('fs')
var chalk = require('chalk')
var success = require('success-symbol')
var error = require('error-symbol')

var getSongArtistTitle = require('./')

function stringifyTitle (o) {
  return o ? '"' + o[0] + '" - "' + o[1] + '"' : 'nothing'
}

function testFailed (result, expected) {
  console.error(chalk.red('   ' + error + ' expected ' + stringifyTitle(expected)))
  console.error(chalk.red('     but got  ' + stringifyTitle(result)))
}
function testSucceeded (result) {
  console.log(chalk.green('   ' + success + ' got ' + stringifyTitle(result)))
}

function runTest (plugins, test) {
  var expected = test.slice(1)

  console.log('  ' + test[0])
  var result = getSongArtistTitle(test[0], plugins)
  if (!result || result[0] !== expected[0] || result[1] !== expected[1]) {
    testFailed(result, expected)
    return false
  }
  testSucceeded(result)
  return true
}

function runSuite (suite) {
  var score = { fail: 0, success: 0 }
  suite.tests
    .map(runTest.bind(null, suite.plugins))
    .forEach(function (success) {
      if (success) {
        score.success++
      } else {
        score.fail++
      }
    })
  return score
}

function readTest (test) {
  return test.split('\n').filter(function (line) {
    return line.substr(0, 2) !== '//'
  })
}

var PLUGINS = /^plugins: (.*?)$/
function readSuite (pathName) {
  var tests = fs.readFileSync(pathName, 'utf8')
    .split('\n\n')

  var plugins = [ 'base' ]
  var pluginsLine = tests[0].match(PLUGINS)
  if (pluginsLine) {
    plugins = pluginsLine[1].split(',').map(function (str) { return str.trim() })
    tests.shift()
  }
  return {
    tests: tests.map(readTest),
    plugins: plugins
  }
}

var suites = fs.readdirSync('test')
var total = { fail: 0, success: 0 }
suites.forEach(function (suiteName) {
  var suite = readSuite('test/' + suiteName)

  var title = suiteName.replace(/\.txt$/, '')
  console.log(title)
  console.log(title.replace(/./g, '-'))

  var result = runSuite(suite)
  console.log(
    chalk.red(' ' + error + ' ' + result.fail) + '  ' +
    chalk.green(' ' + success + ' ' + result.success)
  )
  total.fail += result.fail
  total.success += result.success
})

if (total.fail > 0) {
  process.exit(1)
}