const { test } = require('ava')
const { inBrowser } = require('../../index.js')

const createDuckDuckGoPage = I => {
  return new class DuckDuckGoPage {
    async gotoPage() {
      await I.amOnPage('https://duckduckgo.com/')
    }

    async seeDuckDuckGoLogo() {
      await I.see('DuckDuckGo', '#logo_homepage_link')
    }

    async seeDuckDuckFooWillFail() {
      await I.see('DuckDuckFoo', '#logo_homepage_link') // Its ok to fail here. Check the code excerpt
    }
  }
}

test('it should be able to encapsulate a page interface through page objects',
inBrowser(async (t, I) => {
  const DuckDuckGoPage = createDuckDuckGoPage(I)

  await t.on(DuckDuckGoPage, async I => {
    await I.gotoPage()
    await I.seeDuckDuckGoLogo()
  })
}))

test('running in browser errors in page objects should produce code excerpt, stacktrace of actual failed location and error screenshot @failing',
inBrowser(async (t, I) => {
  const DuckDuckGoPage = createDuckDuckGoPage(I)

  await t.on(DuckDuckGoPage, async I => {
    await I.gotoPage()
    await I.seeDuckDuckFooWillFail()
  })
}))
