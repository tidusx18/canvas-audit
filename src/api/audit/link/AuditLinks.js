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

    if (text && !/click here|http:\/\/|https:\/\/|www\./i.test(text)) { return true; }
    if (text && /click here|http:\/\/|https:\/\/|www\./i.test(text)) { return false; }
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