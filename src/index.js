const auditImages = require('./api/audit/image/AuditImages.js');
const auditLinks = require('./api/audit/link/AuditLinks.js');
const auditText = require('./api/audit/text/AuditText.js');
const auditVideos = require('./api/audit/video/AuditVideo.js');
const auditTables = require('./api/audit/table/AuditTables.js')

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
                case 'Discussion':

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

            case 'Discussion':

                return moduleItem.content.message;
        }
    },

    auditModuleItem: async (dom) => {

        let results = {};

        results.images = auditImages(dom);
        results.links = await auditLinks(dom);
        results.text = auditText(dom);
        results.videos = auditVideos(dom);
        results.tables = auditTables(dom);

        return results;
    }
}

/**** Util Functions ****/

function getResource(url) {

    return fetch(`${url}?per_page=80`, {
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