const { test, scenario } = require('ava-codeceptjs')

test.skip('Login to Versicherungs-Center', async t => {
    const { I } = t.context
    
    await I.amOnPage('http://www.check24.de')
    await I.moveCursorTo('.c24-nav-button-text')
    await I.click('#c24-header-bottom > div > nav > div > div.c24-nav-button-wrapper.clearfix > div > span')
    await I.click('Versicherungen', '#c24-mainnav')
    await I.click('Versicherungscenter', '#c24-header-bottom > div > nav > div > div.c24-nav-button-wrapper.clearfix > div')
})

