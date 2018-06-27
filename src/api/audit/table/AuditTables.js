function AuditTables(dom) {

	let body = dom.body;
	// let results = {};

	if(!body) { return null; }

	try {

	return auditTables(body);
	// let hasTable = auditTables(body);

	// return hasTable ? true : false;

	} catch(err) {
		console.log('ERROR: ', err, '\n')
	}

	// return results;
}

function auditTables(body) {

	let hastables = body.querySelector('table');

	return hastables ? true : false;
}

module.exports = AuditTables;