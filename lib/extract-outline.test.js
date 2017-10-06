const {test} = require('ava')
const { extractOutline } = require('./extract-outline')

test('it should extract the step outline from test source', t => {
    const sourceCode = `
        async ({step}, I) => {
            step ('I go to the duckduckgo page')
            await I.amOnPage('https://duckduckgo.com/')
            await I.see('DuckDuckGo', '#logo_homepage_link')
        
            step   ('I search for "github ava"')
            await I.fillField('#search_form_input_homepage', 'github ava')
            await I.click('#search_button_homepage')
        
            step({ "foo": "bar" })
            await I.see('GitHub - avajs/ava: Futuristic JavaScript test runner', 'h2.result__title')
        })    
    `
    const steps = extractOutline(sourceCode)
    t.truthy(steps)
    t.is(3, steps.length)
    t.is(steps[0], 'I go to the duckduckgo page')
    t.is(steps[1], 'I search for "github ava"')
    t.deepEqual(JSON.parse(steps[2]), { 
        foo: 'bar' 
    })
})

// test.only(t => {
//     console.log('step (\'I go to the duckduckgo page\')'.match(/step\s*\((.*)\)/)[1])
// })