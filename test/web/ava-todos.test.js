const { test } = require('ava')
const { implementIt } = require('../index.js')

// ava todo won't work since it does not allow a test method
// test.todo('Implement this exciting test case')

test('a new super exciting feature', implementIt())