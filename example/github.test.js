const { scenario } = require('ava-codeceptjs')

const Smth = require('./Smth.js')

scenario.beforeEach(async t => {
  const { I } = t.context

  await I.resizeWindow('maximize')
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

// scenario('ava only', async t => {
//     t.is('foo', 'bar')
//     // throw new Error('BOOM')
//     console.log(t._test.assertError)
// })

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

scenario.only('register', async t => {
  const { I, within } = t.context

  await within('.js-signup-form', I, async () => {
    await I.fillField('user[login]', 'User');
    await I.fillField('user[email]', 'user@user.com');
    await I.fillField('user[password]', 'user@user.com');
    // await I.fillField('q', 'aaa');
    await I.click('Sign up for GitHub');
  });
  await I.see('There were problems creating your account');
  await I.click('Explore');
  await I.seeInCurrentUrl('/explore');
});