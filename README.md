ava-codeceptjs
==============

Concurrent, opinionated UI Testing. Using ava, codeceptjs, webdriverio and chrome. 

## Why

- Writing UI tests in Gherkin syntax does not make sense. "Business People" won't bother to read the tests anyway.
- UI tests are for developers/testers. They must be quick to write, simple to troubleshoot and easy to maintain. Developer productivity is paramount.
- Running tests concurrently will speed up your feedback loop tremendously
- I love Codeceptjs fluent and concise API
- IMHO chrome headless is currently the best option to run your tests in

## Features

- UI tests can run concurrently to speed up total execution time of the test suite
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

- Use test name (and path) when creating output directory for screenshots
- Add test case examples demonstrating features to README
- Improve element highlighting in screenshots
- Still problems creating screenshot directories (on windows in watch mode when visual studio code is running)
- Could automatically run selenium standalone in dev mode
- DOES NOT WORK: Make full page screenshots
- Need a cool full-text search to find tests
- Extend Auto-Wait to all methods which are using selectors
- Also save screenshots on failed ava assertions
- Map codeceptjs assertion errors to ava assertion error
- Suppport webdriverio errors
- Convenience functions to login/cache login session (speed up login)
- Store last successful screenshot and show on error compared with error screen
- Record test duration
- Transparent page objects for multiple devices
- Would be nice if chrome would not steal the focus
- Remove wrapped methods from call stack: WebDriverIO.wrapped [as seeNumberOfElements] (wrap-methods.js:34:31)
- Would be cool to integrate something like quokka