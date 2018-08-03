## Done

- Report source code
- Extract tags from test title
- Report performance logs
- Support | in test titles

## Doing


## Backlog

- Try long stacktraces to get consistent stacktraces: Seems that stacktraces are quite arbitrary, sometimes including the test file, sometimes not
- Use bifrost-io to generate report data
- Standard assertion thrown in the test should create a screenshot (success=false)
- Autowait before click: Use waitForEnabled instead of waitForVisible
- Improve codeceptjs errors: for see(text, element): error message should also contain the actual text of the element. So enhance "expected element #logo_homepage_link to include "DuckDuckFoo"" should also contain but found "About DuckDuckGo"
- IDEA screenshot gallery of pages: Add a screenshot to the gallery
- Using say could use t.log
- IDEA highlight all clickable elements in error screenshots for better trouble shooting
- IDEA Log structured data (like json) for reports
- Replace codeceptjs file upload with a version without global variables
- Remove from stacktraces: at WebDriverIO.wrapped [as see] (C:\\Users\\stefan.huber\\projects\\server-cons
- Can I find out if an element is still being animated (to avoid situations like "Element <svg width="30" height="30">...</svg> is not clickable at point (46, 503). Other element would receive the click: <div class="OnboardingBanner">...</div>")
- Also save screenshots on failed ava assertions
