const { scenario } = require('ava-codeceptjs')

const Smth = require('./Smth.js')

scenario.beforeEach(async t => {
  const { I } = t.context

  await I.resizeWindow(1900, 800)
  await Smth(I).openGitHub();
})

scenario('search for codeceptjs', async t => {
  const { I } = t.context

  await I.amOnPage('https://github.com/search');

  await I.say('Searching for codeceptjs ...');

  await I.fillField('Search GitHub', 'CodeceptJS');
  await I.pressKey('Enter');
  await I.see('Codeception/CodeceptJS', 'a');
});

scenario.failing('should fail because the page does not exist', async t => {
  const { I } = t.context

  await I.amOnPage('foo')
})

scenario('signin should fail showing error message', async t => {
  const { I } = t.context
   
  await I.say('Signing in to github with non-existing account...');
  
  await I.click('Sign in');
  await I.see('Sign in to GitHub');

  await I.fillField('Username or email address', 'something@totest.com');
  await I.fillField('Password', '123456');
  await I.click('Sign in');

  await I.say('I should now see an error message')

  await I.see('Incorrect username or password.', '.flash-error');
});

scenario('make sure the signup form stays the same', async t => {
  const { I } = t.context

  const signupHtml = await I.grabHTMLFrom('.btn.btn-primary.btn-large.f4.btn-block')
  t.snapshot(signupHtml)
})

scenario('register', async t => {
  const { I } = t.context

  await t.within('.js-signup-form', async () => {
    // TODO I think this fails sometimes because there is global state in WebDriverIOHelper
    await I.fillField('user[login]', 'User');
    await I.fillField('user[email]', 'user@user.com');
    await I.fillField('user[password]', 'user@user.com');

    await I.see('Sign up for GitHub')
    await I.click('Sign up for GitHub');
  });
  await I.see('There were problems creating your account');
  await I.click('Explore');
  await I.seeInCurrentUrl('/explore');
});