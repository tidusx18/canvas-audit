function AuditText(dom) {

	let content = getContent(dom);
	let results = {};

	if(!content) { return null; }

	try {

	// results.allCaps = auditCaps(content);
	results.underlinedWords = auditUnderlined(content);
	results.fontFamily = auditFontFamily(content);
	results.fontSize = auditFontSize(content);
	// results.blackboardReferences = auditBbReferences(content);

	} catch(err) {
		console.log('ERROR: ', err, '\n')
	}

	return results;
}

function getContent(dom) {

	return dom;
}

function auditCaps(content) {

	const text = content.querySelector('body').innerText;
	const blocks = text.trim().match(/.+$/gm);
	const threshold = 30;

	for(let i=1; i<blocks.length; i++) {

		let totalchars = blocks[i].match(/\w/g) || [];
		let caps = blocks[i].match(/[A-Z]/g) || [];
		let percentage = Math.round( (caps.length / totalchars.length) * 100 );

		if(percentage >= threshold)	{ return true; }
	}

	return false;
}

function auditUnderlined(content) {

	let hasUnderlined = content.querySelector('*[style*=underline]');

	return hasUnderlined ? true : false;
}

function auditFontFamily(content) {

	let hasUserDefinedFontFamily = content.querySelector('*[style*=font-family]');

	return hasUserDefinedFontFamily ? true : false;
}

function auditFontSize(content) {

	let hasUserDefinedFontSize = content.querySelector('*[style*=font-size]');

	return hasUserDefinedFontSize ? true : false;
}

// function auditSpelling(content) {

// 	// audit spelling
// 	const text = getProperty(content, 'innerText');
// 	const words = text.trim().match(/\w+/g);
// 	let results = [];

// 	console.log('Checking spelling...')

// 	for(let i=1; i<words.length; i++) {

// 		let spellchecker = new Spellchecker();

// 		// Parse hunspell dictionary that can be serialized as JSON
// 		let dictionary = spellchecker.parse({
// 		    aff: fs.readFileSync(path.join( base, 'index.aff'), 'utf-8'),
// 		    dic: fs.readFileSync(path.join(base, 'index.dic'), 'utf-8')
// 		});

// 		// Load a dictionary
// 		spellchecker.use(dictionary);

// 		let isRight = spellchecker.check(words[i]);

// 		if(!isRight) { console.log(words[i]); results.push(words[i]); }
// 	}

// 	if(results.length > 0) { return results; }

// 	return null;
// }

// function auditBbReferences(content) {

// 	return false;
// }

module.exports = AuditText;