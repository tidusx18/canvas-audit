Handlebars.registerHelper('hasTitle', (link) => {

    if(link.title) { return `<li><span class="property-name">Title:</span> ${link.title}</li>`; }
    if(link.href.includes('fiu.instructure.com')) { return `<li>${createIssue('Missing Title')}</li>`; }

});


Handlebars.registerHelper('hasAlt', (alt) => {

    if(alt) { return `<li><span class="property-name">Alt:</span> ${alt}</li>`; }

    return `<li>${createIssue('Missing Alt')}</li>`;

});


Handlebars.registerHelper('isContextual', (isContextual) => {

    if(isContextual === null) { return `<li style="color: green;">Linked Image</li>`; }
    if(!isContextual) { return `<li>${createIssue('Not Contextual')}</li>`; }

});


Handlebars.registerHelper('bbRef', (hasBlackboardReference) => {

    if(hasBlackboardReference) { return `<li>${createIssue('Blackboard Reference')}</li>`; }

});


Handlebars.registerHelper('pearsonRef', (hasPearsonReference) => {

    if(hasPearsonReference) { return `<li>${createIssue('Pearson Reference')}</li>`; }

});


Handlebars.registerHelper('isReachable', (isReachable) => {

    if(!isReachable) { return `<li>${createIssue('Review for Broken Link')}</li>`; }

});


Handlebars.registerHelper('textWarnings', (warnings) => {

    let html = '<span class="issue">';

    if(warnings.allCaps) { html += 'Review for All Caps<br>' }
    if(warnings.fontFamily) { html += 'Review for Font Family<br>' }
    if(warnings.fontSize) { html += 'Review for Font Size<br>' }
    if(warnings.underlinedWords) { html += 'Review for Underlined Words<br>' }
    if(warnings.blackboardReferences) { html += 'Review for Blackboard References in Text' }

    html += '</span>';

    return html;

});


Handlebars.registerHelper('tableWarning', (tables) => {

    let html = '<span class="issue">';

    if(tables) { html += 'Review for <table> in HTML<br>' }

    html += '</span>';

    return html;

});


function createIssue(text) {

    return `<span class="issue">${text}</span>`;

}


window.addEventListener('message', receiveMessage);
window.opener.postMessage('', 'https://fiu.instructure.com');


function receiveMessage(event) {

        if (event.origin !== 'https://fiu.instructure.com') { return; }

        document.title = `${event.data.data.title} Audit Report`;

        fetch('https://raw.githubusercontent.com/tidusx18/canvas-audit/master/src/report/template.hbs')
        .then( response => response.text() )
        .then( response => {

            let templateSource  = response;
            let template = Handlebars.compile(templateSource);
            let html = template(event.data);

            document.body.innerHTML = html;

        });

}