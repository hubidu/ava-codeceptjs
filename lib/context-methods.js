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

module.exports = {
    on, 
    within
}