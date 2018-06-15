// ==UserScript==
// @name         Canvas Util: Audit Course
// @namespace    http://github.com/tidusx18
// @version      0.0.2
// @description  Audits a Canvas course for ADA criteria and generates a report.
// @author       Daniel Victoriano <victoriano518@gmail.com>
// @include      /https:\/\/fiu\.instructure\.com/courses/\d{1,8}$/
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const auditImages = __webpack_require__(1);
const auditLinks = __webpack_require__(2);
const auditText = __webpack_require__(3);
const auditVideos = __webpack_require__(4);

course = {

    getCourse: async() => {

        return getResource(convertToApiUrl(document.location.href));
    },

    getModules: async() => {

        return getResource(`${convertToApiUrl(document.location.href)}/modules`);
    },

    getModuleItems: async(module) => {

        let moduleItems = await getResource(module.items_url);
        let results = [];

        for (let moduleItem of moduleItems) {

            switch (moduleItem.type) {

                case 'ExternalUrl':
                case 'ExternalTool':
                case 'File':
                case 'SubHeader':
                case undefined:
                case null:

                    results.push(moduleItem);
                    continue;

                case 'Assignment':
                case 'Page':
                case 'Quiz':

                    moduleItem.content = await getResource(moduleItem.url);
                    results.push(moduleItem);
            }

        }

        return results;
    },

    getModuleItemContent: (moduleItem) => {

        switch (moduleItem.type) {

            case 'ExternalUrl':
            case 'ExternalTool':
            case 'File':
            case 'SubHeader':
            case undefined:
            case null:

                return null;

            case 'Page':

                return moduleItem.content.body;

            case 'Assignment':
            case 'Quiz':

                return moduleItem.content.description;
        }
    },

    auditModuleItem: async (dom) => {

        let results = {};

        results.images = auditImages(dom);
        results.links = await auditLinks(dom);
        results.text = auditText(dom);
        results.videos = auditVideos(dom);

        return results;
    }
}

/**** Util Functions ****/

function getResource(url) {

    return fetch(url, {
            credentials: 'same-origin'
        })
        .then((data) => data.text())
        .then((data) => { return JSON.parse(data.replace('while(1);', '')) });
}

function convertToApiUrl(url) {

    return url.replace('fiu.instructure.com', 'fiu.instructure.com/api/v1');
}

function makeMenu() {

    let header = document.querySelector('#right-side-wrapper .course-options');
    let button = document.createElement('a');
    button.setAttribute('class', 'btn button-sidebar-wide btn-primary');
    button.innerText = 'Audit Course';

    return header.appendChild(button);
}

/**** End Util Functions ****/

async function init() {

    let overlay = document.createElement('div');
    overlay.style = 'width: 100%;height: 100%;background-color: rgb(0, 0, 0, 0.5);display: flex;position: fixed;top: 0;left: 0;z-index: 9999;align-items: center;justify-content: center;';
    overlay.id = 'audit-overlay'

    let modal = document.createElement('div');
    modal.style = 'display: flex;height: 100px;box-shadow: 0px 0px 10px -2px #000000;border-radius: 10px;background-color: #ffffff;width: 200px;align-content: center;align-items: center;justify-content: center;';

    modal.innerHTML = '<p>Audit in Progress...';
    overlay.appendChild(modal);
    document.body.append(overlay);

    let results = {};
    let modules = await course.getModules();

    for (let module of modules) {

        module.moduleItems = await course.getModuleItems(module);

        for (let item of module.moduleItems) {

            let itemContent = course.getModuleItemContent(item)

            if (!itemContent) { continue; };

            let parser = new DOMParser();
            let dom = parser.parseFromString(itemContent, 'text/html');

            item.auditResults = await course.auditModuleItem(dom);
        }
    }

    results.data = modules;
    results.data.title = window.document.title;
    console.log(results);

    window.addEventListener('message', (event) => {

        if (event.origin !== 'https://tidusx18.github.io') { return; }

        event.source.postMessage(results, 'https://tidusx18.github.io');
        console.log('Message event triggered');

    });

    document.getElementById('audit-overlay').remove();

    window.open(`https://tidusx18.github.io/audit-results.html`);

}


makeMenu().addEventListener( 'click', init );

/***/ }),
/* 1 */
/***/ (function(module, exports) {

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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

async function AuditLink(dom) {

    let links = getLinks(dom);
    let results = [];

    for (let link of links) {

        let linkAudit = {};

        linkAudit.href = linkHref(link);

        if(/\/preview$/im.test(linkAudit.href)) { continue; }

        linkAudit.title = linkTitle(link);
        linkAudit.anchorText = linkText(link);
        linkAudit.bbReference = bbReference(link);
        linkAudit.pearsonReference = pearsonReference(link);
        linkAudit.contextualAnchorText = hasContextualAnchorText(link);
        linkAudit.isReachable = await isReachable(link);

        results.push(linkAudit);
    }

    return results;
}

function getLinks(dom) {

    return dom.querySelectorAll('a');
}

function linkHref(link) {

    return link.href ? link.href.trim() : null;
}

function linkTitle(link) {

    return link.title ? link.title.trim() : null;
}

function linkText(link) {

    return link.innerText ? link.innerText.trim() : null;
}

function hasContextualAnchorText(link) {

    let text = link.innerText;

    if (text && !/click here|http:\/\/|https:\/\/|www\.|\.(?:com|net|org|io|gov|edu)/i.test(text)) { return true; }
    if (text && /click here|http:\/\/|https:\/\/|www\.|\.(?:com|net|org|io|gov|edu)/i.test(text)) { return false; }
    if (!text) { return null; }
}

function bbReference(link) {

    let href = link.href;

    if (/xid-|blackboard.com|@X@|bbcswebdav|listContentEditable.jsp/i.test(href)) { return true; }

    return null;
}

function pearsonReference(link) {

    let href = link.href;

    if (href.includes('pearson')) { return true; }

    return null;
}

async function isReachable(link) {

    // console.log('Auditing Link: ', link)

    return new Promise((resolve, reject) => {

        GM_xmlhttpRequest({

            method: 'GET',
            url: link,
            timeout: 5000,
            onload: (response) => {
                resolve(response.status === 200 ? true : false);
            },
            onabort: (response) => {
                resolve(false);
            },
            onerror: (response) => {
                resolve(false);
            },
            ontimeout: (response) => {
                resolve(false);
            }
        });
    });
}

module.exports = AuditLink;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

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

/***/ }),
/* 4 */
/***/ (function(module, exports) {

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

/***/ })
/******/ ]);