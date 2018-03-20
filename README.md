ava-codeceptjs
==============

Concurrent, opinionated UI Testing. Using ava, codeceptjs, webdriverio and chrome.

## Why

- Writing UI tests in Cucumber/Gherkin syntax feels clunky and is extremely hard to troubleshoot (BTW "Business People" don't care about UI tests anyway).
- CodeceptJS' fluent and concise API is just fine for browser testing
- Page objects are a great way to organize your tests and they should just be "Plain Old Javascript Objects" (not like CodeceptJS)
- Async/Await lets you write tests in a synchronous like style. No need for under-the-hood promise chain magic (like in CodeceptJS)
- As a maintainer of an UI test suite I need concise error messages. Avas code excerpts are perfect for this.
- Chrome headless is currently the most reliable option to run your tests. Phantomjs will no longer be maintained, Nightmarejs is flakey.

## Features

A complete sample project is available in https://github.com/hubidu/ava-codeceptjs-examples

- Run your UI tests concurrently and reduce total test execution time
- Use ava's watch mode to automatically run affected tests on code changes
- Uses async/await. No promise chain magic under the hood.
- Uses ava's great assertion library, code excerpts, before/after hooks etc.
- Use ava's snapshot feature to take an html snapshot of a part of the page and compare it to previous snapshots
- Automatically wait for elements to become visible before clicking, filling input fields or validating assertions
- Automatically make a screenshot when a test fails
- Automatically take screenshots of assertions
- Use "plain" Javascript objects as page objects and require them explicitly in your tests. No global configuration and dependency injection magic.
- Get meaningful stacktraces even in page object functions

## Install

TBD

## Backlog

- Make report dir configurable
- Rerun failed tests first, then the rest
- Add codecept command and parameters to screenshot
- IDEA Confirm a test failure by immediately retrying the test
- IDEA screenshot gallery of pages: Add a screenshot to the gallery
- IDEA Time ajax requests
- Using say could use t.log
- Extract tags (@...) from test titles
- step stacktrace should be ignored in screenshot output
- IDEA highlight all clickable elements in error screenshots for better trouble shooting
- IDEA Log structured data (like json) for reports
- Replace codeceptjs file upload with a version without global variables
- Remove from stacktraces: at WebDriverIO.wrapped [as see] (C:\\Users\\stefan.huber\\projects\\server-cons
- Can I find out if an element is still being animated (to avoid situations like "Element <svg width="30" height="30">...</svg> is not clickable at point (46, 503). Other element would receive the click: <div class="OnboardingBanner">...</div>")
- Improve element highlighting in screenshots
- Need a cool full-text search to find tests efficiently
- Also save screenshots on failed ava assertions
- Map codeceptjs assertion errors to ava assertion error
- Suppport webdriverio errors
- Better when in headless mode: Would be nice if chrome would not steal the focus
