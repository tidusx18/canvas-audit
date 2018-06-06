function AuditImages(dom) {

	let images = getImages(dom);

	if(!images) { return null; }

	let results = [];

	for(let image of images) {

		let imageAudit = {};

		imageAudit.alt = imageAlt(image);
		imageAudit.src = imageSrc(image);

		results.push(imageAudit);
	}

	return results;
}

function getImages(dom) {

	return dom.querySelectorAll('img');
}

function imageAlt(image) {

	let alt = image.alt;

	if(alt) { return alt.trim(); }
	if(!alt) { return null }
}

function imageSrc(image) {

	let source = image.src;

	if(source) { return source.trim(); }
	if(!source) { return null; }
}

module.exports = AuditImages;