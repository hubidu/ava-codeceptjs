ava-codeceptjs
==============

Concurrent UI Testing with opinionated stack. Using ava, codeceptjs, webdriverio and chrome. 

## Features

- Tests are run concurrently speeding up total execution time
- Use ava's watch mode to automatically run changed tests during development
- Uses async/await. No promise chain magic under the hood.
- Uses ava's great assertion library, code excerpts, before/after hooks etc.
- Automatically wait for elements before clicking, filling input fields or validating assertions
- Automatically make a screenshot when a test fails
- Automatically take screenshots of assertions

## Install


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

- Improve element highlighting in screenshots
- Try ava snapshot feature
- Try ava failing test feature
- Still problems creating screenshot directories
- DOES NOT WORK: Make full page screenshots
- test name should be part of the output directory
- Extend Auto-Wait to all methods which are using selectors
- Save screenshot when ava assertion fails
- Try chrome headless
- Mark failed area on page
- Map codeceptjs assertion errors to ava assertion error
- Suppport webdriverio errors
- Convenience functions to login/cache login session (speed up login)
- Store last successful screenshot and show on error compared with error screen
- Record test duration
- Transparent page objects for multiple devices
- Would be nice if chrome would not steal the focus
- Remove wrapped methods from call stack: WebDriverIO.wrapped [as seeNumberOfElements] (wrap-methods.js:34:31)
- Would be cool to integrate something like quokka