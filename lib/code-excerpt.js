const fs = require('fs')
const codeExcerpt = require('code-excerpt')

module.exports = source => {
    let contents;
	try {
		contents = fs.readFileSync(source.file, 'utf8');
	} catch (err) {
		throw err
	}
	const excerpt = codeExcerpt(contents, source.line, { around: 3 });
	if (!excerpt) {
		return null;
    }
    
    return excerpt
}