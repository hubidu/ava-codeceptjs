ava-codeceptjs
==============

Concurrent, opinionated UI Testing. Just ava, codeceptjs and chrome.

## Install

Run

```bash
  npm i ava-codeceptjs --save-dev
```

## Why

- Writing UI tests in Cucumber/Gherkin syntax feels clunky and is extremely hard to troubleshoot (BTW "Business People" don't care about UI tests anyway).
- CodeceptJS' fluent and concise high-level API is perfrect for end-to-end testing
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


