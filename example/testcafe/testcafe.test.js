const { test } = require('ava-codeceptjs')

const Page = require('./page-model')

// Page model
const page = new Page();

test.beforeEach(async t => {
  const { I } = t.context

  I.amOnPage('https://devexpress.github.io/testcafe/example/')
})

// Tests
test('Text typing basics', async t => {
    // await t
    //     .typeText(page.nameInput, 'Peter')                      // Type name
    //     .typeText(page.nameInput, 'Paker', { replace: true })   // Replace with last name
    //     .typeText(page.nameInput, 'r', { caretPos: 2 })         // Correct last name
    //     .expect(page.nameInput.value).eql('Parker');            // Check result
  const { I } = t.context

  await I.fillField(page.nameInput, 'Peter')
  await I.fillField(page.nameInput, 'Paker')
  await I.fillField(page.nameInput, 'Parker')

  await I.seeInField(page.nameInput, 'Parker') // TODO Why use seeInField and not see in this case?
});


test('Click an array of labels and then check their states', async t => {
    const { I } = t.context
    
    for (const feature of page.featureList) {
        // await t
        //     .click(feature.label)
        //     .expect(feature.checkbox.checked).ok();

        await I.checkOption(feature)
        await I.seeCheckboxIsChecked(feature)
    }
});


// test('Dealing with text using keyboard', async t => {
//     await t
//         .typeText(page.nameInput, 'Peter Parker')           // Type name
//         .click(page.nameInput, { caretPos: 5 })             // Move caret position
//         .pressKey('backspace')                              // Erase a character
//         .expect(page.nameInput.value).eql('Pete Parker')    // Check result
//         .pressKey('home right . delete delete delete')      // Pick even shorter form for name
//         .expect(page.nameInput.value).eql('P. Parker');     // Check result
// });


// test('Moving the slider', async t => {
//     const initialOffset = await page.slider.handle.offsetLeft;

//     await t
//         .click(page.triedTestCafeCheckbox)
//         .dragToElement(page.slider.handle, page.slider.tick.withText('9'))
//         .expect(page.slider.handle.offsetLeft).gt(initialOffset);
// });


// test('Dealing with text using selection', async t => {
//     await t
//         .typeText(page.nameInput, 'Test Cafe')
//         .selectText(page.nameInput, 7, 1)
//         .pressKey('delete')
//         .expect(page.nameInput.value).eql('Tfe');   // Check result
// });


// test('Handle native confirmation dialog', async t => {
//     await t
//         .setNativeDialogHandler(() => true)
//         .click(page.populateButton);

//     const dialogHistory = await t.getNativeDialogHistory();

//     await t.expect(dialogHistory[0].text).eql('Reset information before proceeding?');

//     await t
//         .click(page.submitButton)
//         .expect(page.results.innerText).contains('Peter Parker');
// });


// test('Pick option from select', async t => {
//     await t
//         .click(page.interfaceSelect)
//         .click(page.interfaceSelectOption.withText('Both'))
//         .expect(page.interfaceSelect.value).eql('Both');
// });


// test('Filling a form', async t => {
//     // Fill some basic fields
//     await t
//         .typeText(page.nameInput, 'Bruce Wayne')
//         .click(page.macOSRadioButton)
//         .click(page.triedTestCafeCheckbox);

//     // Let's leave a comment...
//     await t
//         .typeText(page.commentsTextArea, "It's...")
//         .wait(500)
//         .typeText(page.commentsTextArea, '\ngood');

//     // I guess, I've changed my mind
//     await t
//         .wait(500)
//         .selectTextAreaContent(page.commentsTextArea, 1, 0)
//         .pressKey('delete')
//         .typeText(page.commentsTextArea, 'awesome!!!');

//     // Let's submit our form
//     await t
//         .wait(500)
//         .click(page.submitButton)
//         .expect(page.results.innerText).contains('Bruce Wayne');
// });