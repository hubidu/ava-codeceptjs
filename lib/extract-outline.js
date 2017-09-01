const trim = str =>  {
    if (str.match(/^\s*[\{]/)) {
        return str.trim()
    } else {
        return str.trim()
        .replace(/^\s*["']/, '')
        .replace(/["']\s*$/, '')
        .trim()
    }
}

const convertToObj = str => {
    try {
        return str.indexOf('{') > -1 ? JSON.parse(str) : str
    } catch (err) {
        console.log(`WARN Failed to parse json step ${str}`, err.message)
        return str
    }
}

const extractOutline = source => {
    const lines = source.split('\n')

    return lines
        .map(l => l.trim())
        .filter(l => l.match(/step\s*\((.*)\)/))
        .map(l => l.match(/step\s*\((.*)\)/)[1])
        .map(l => trim(l))
        .map(l => convertToObj(l))
}

module.exports = {
    extractOutline
}