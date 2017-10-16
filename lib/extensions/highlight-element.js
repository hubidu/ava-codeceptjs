/**
 * Display a box grid on the page
 */
function _displayBoxGrid() {
    const browser = this.browser

    return browser.execute(function() {
        var css = '* { border: 1px solid rgba(0, 0, 0, 0.2); }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    })
}

/**
 * Quick and dirty try to highlight elements on a page
 */
function _highlightElement(sel, text, isError = false) {
    const browser = this.browser

    return browser.execute(function (sel, text, isError) {
        var color1 = isError ? 'Orange' : 'Teal';
        var icon = isError ? '&#10006;' : '&#10004;'

        $text = document.getElementById('ava-codeceptjs-text') || document.createElement('span');
        $text.setAttribute('id', 'ava-codeceptjs-text')
        $text.innerHTML = icon + ' ' + text;

        var newdiv = document.getElementById('ava-codeceptjs')
        if (!newdiv) {
            newdiv = document.createElement('div');
            newdiv.appendChild($text);

            newdiv.style['position'] = 'absolute';
            newdiv.style['color'] = 'white';
            newdiv.style['font-size'] = '10px';
            newdiv.style['font-weight'] = 'bold';
            newdiv.style['padding'] = '1px';
            newdiv.style['z-index'] = '1000';
            newdiv.style.opacity = 0.8;
            newdiv.style['pointer-events'] = 'none'; // be able to click through this element
            newdiv.className += 'ava-codeceptjs'
            newdiv.setAttribute('id', 'ava-codeceptjs')
            document.body.appendChild(newdiv);
        }
        // Always update color
        newdiv.style['background-color'] = color1;

        // Find elements matching the given selector
        var xx = document.querySelectorAll(sel);
        // Highlight the first element which was found
        if (xx.length > 0) {
            var element = xx[0];
            var rect = element.getBoundingClientRect();

            newdiv.style.left = rect.left + 'px';
            newdiv.style.top = rect.bottom + 'px';
            newdiv.style.width = (rect.right - rect.left) + 'px';

            element.style.border = "1px solid " + color1;
            // element.style['background-color'] = color2;
        }

    }, sel, text, isError)
}

module.exports = {
    _highlightElement,
    _displayBoxGrid
}