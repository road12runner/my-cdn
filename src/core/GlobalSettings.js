export default class GlobalSettings {
    constructor() { }

    // Get query string
    getQueryString (field, url) {
        let href = url ? url : window.location.href;
        let reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
        let string = reg.exec(href);
        return string ? string[1] : null;
    };

    // HANDOVER KEY HANDLING BY URL - (rootdomain/index.html?hkey=your_handoverkey)
    handoverKeyByURL() {
        const hkey = this.getQueryString('hkey');

        const currentHkey = document.getElementById("aam-designer").getAttribute("data-handoverkey");
        // if hkey is there in url replace with default handover key
        if (hkey) {
            document.getElementById("aam-designer").setAttribute("data-handoverkey", hkey);
        } else {
            console.log("Running with default handoverkey : ", currentHkey);
        }
    }
    
    // Language Handling By URL - (/index.html?languageId=fr-FR)
    langIdByURL() {
        const languageIdKey = 'languageId';
        return this.getQueryString(languageIdKey);
    }
}