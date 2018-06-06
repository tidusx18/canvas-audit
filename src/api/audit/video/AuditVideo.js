function AuditVideo(dom) {

	let videoSources = /vivo|egnyte|youtube|vimeo|lynda/i;

	// check dom
	if( dom.querySelector('video') ) { return true; }

	// check links
	let links = getLinks(dom);

	for(let link of links) { if( videoSources.test(link.href) ) { return true; } }

	// check iframes
	let iframes = getFrames(dom);

	for( let iframe of iframes) {

		if( videoSources.test(iframe.src) ) { return true; }
	}

	return null;
}

function getFrames(dom) {

    return dom.querySelectorAll('iframe');
}

function getLinks(dom) {

	return dom.querySelectorAll('a');
}

module.exports = AuditVideo;