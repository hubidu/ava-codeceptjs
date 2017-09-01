const { wrap } = require('./wrap-methods')

/**
 * Do something in context of page object
 */
async function on (PageObjectOrClazz, handlerFn) {
    if (!PageObjectOrClazz) throw new Error('Expected to get a page object instance or a page object class')

    const actor = this.context.I
    // Create an instance of the page object class
    // and wrap its methods to intercept and map exceptions
    let wrappedPageObject
    if (typeof PageObjectOrClazz === 'function') {
        wrappedPageObject = wrap(new PageObjectOrClazz(actor))
    } else if (typeof PageObjectOrClazz === 'object') {
        if (PageObjectOrClazz.$isWrapped) {
            wrappedPageObject = PageObjectOrClazz
        }
        else {
            wrappedPageObject = wrap(PageObjectOrClazz)
        }
    } else {
        new Error('Expected to get a page object instance or a page object class')        
    }

    // Attach some context information
    if (!actor._test) throw new Error('Expected _test property on actor')
    // wrappedPageObject.outputDir = this.context.I._test.outputDir
    // Keep reference to actor for screenshotting
    wrappedPageObject.actor = actor

    return await handlerFn(wrappedPageObject)
}

/**
 * Do something in context of an element on the page
 */
async function within (sel, handlerFn) {
    const actor = this.context.I

    await actor.waitForVisible(sel)

    await actor._withinBegin(sel)
    try {
        await handlerFn()
    } catch (err) {
        await actor._withinEnd()
        throw err    
    }
    await actor._withinEnd()
}

/**
 * Outline the test using steps
 */
async function step(desc) {
    desc = desc.trim()
    if (typeof desc === 'object') desc = JSON.stringify(desc, null, 2)
    
    this.log(desc)

    const { context } = this
    
    const { I } = context
    await I.say(desc) // Note: for that to work I must fix _createOutputDirIfNecessary

    if (!context._report) return

    const { _report: report } = context
    report.outline.steps.forEach(step => {
        if(step.name === desc) {
            step.success = true
        }
    })
}

module.exports = {
    on, 
    within,
    step
}