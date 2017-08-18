ava-codeceptjs
==============

Concurrent, opinionated UI Testing. Using ava, codeceptjs, webdriverio and chrome. 

## Why

- Writing UI tests in Cucumber/Gherkin syntax feels clunky and is hard to troubleshoot (BTW "Business People" don't care about your tests anyway). CodeceptJS fluent and concise API is just fine for browser testing.
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

- DONE Auto-Wait for elements automatically on 'click'
- DONE Create valid error screenshot file names
- DONE Save error screenshot to output directory
- DONE Save debug screenshots automatically after each step
- DONE cleanup error screenshots before each test run
- DONE Code excerpt broken on codeceptjs exceptions
- DONE In error screenshots: Show a grid of all boxes
    * { 
      border: 1px solid rgba(0, 0, 0, 0.3);
    }
- DONE Try ava snapshot feature
- DONE Try ava failing test feature
- DONE Try chrome headless
- DONE Mark failed area on page
- DONE Use test name (and path) when creating output directory for screenshots
- DONE 'within' might fail, because I need to wait for context object to become visible first
- DONE Refactor check24 tests into separate files (ava concurrency is file concurrency)
- DONE t.on should return new page object instance
- DONE Refactor ava-codecept code
- DONE Move examples to separate project
- DONE NEED IDEA How to run same test case on/for multiple devices
- DONE Still problems with ava --watch and removing directories (seems to be a windows problem)
- DONE Store screenshot with stacktrace in report
- DONE Display page title (and url) in the error screenshot
- DONE Save browser logs to disk on error
- DONE Also show the 'original' stack trace (from within page object or function)
- DONE Create a report file which can be used to create a nice, detailed test report

- Improve element highlighting: dont change highlighted element and if element can not be found add command to top of page
- Add logs to report.json
- Use webdriverio scrollTo function when taking the error screenshot
- Remove from stacktraces: at WebDriverIO.wrapped [as see] (C:\\Users\\stefan.huber\\projects\\server-cons
- Can I find out if an element is still being animated (to avoid situations like "Element <svg width="30" height="30">...</svg> is not clickable at point (46, 503). Other element would receive the click: <div class="OnboardingBanner">...</div>")
- Strange names for beforeEach functions: "catchingErrorsFn for ..."
- In a CI environment: How can we better detect serious problems and notify responsible people
- Add test case examples to the README demonstrating the individual features
- IDEA: Only save the last I.see... screenshot in a row
- Try again: Make full page screenshots
- Conditionally check for elements
- Can now check for browser console errors
- Improve element highlighting in screenshots
- IDEA: Take screenshots also before button clicks (or make that configurable?)
- Serve and watch output directory by http
- Mark tests as critical and "fire event" (e. g. send http request) when test fails
- Still problems creating screenshot directories (on windows in watch mode when visual studio code is running)
- Need a cool full-text search to find tests efficiently
- Extend Auto-Wait to all methods which are using selectors
- Also save screenshots on failed ava assertions
- Map codeceptjs assertion errors to ava assertion error
- Suppport webdriverio errors
- Convenience functions to login/cache login session (speed up login)
- Store last successful screenshot and show on error compared with error screen
- Record test duration
- Integrate with a password/account manager software (e. g. passbolt)
- Transparent page objects for multiple devices
- Better when in headless mode: Would be nice if chrome would not steal the focus
- Remove wrapped methods from call stack: WebDriverIO.wrapped [as seeNumberOfElements] (wrap-methods.js:34:31)
- Would be cool to integrate something like quokka