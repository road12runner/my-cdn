
const TEXT_ELEMENTS = ['H1', 'H2', 'H3', 'H4', 'H5', 'SPAN', 'P'];


function getText(path, lanugageData) {

	let val = '';
	const tokens = path.split('.');
	if (tokens && tokens.length > 0) {

		val = lanugageData[tokens[0]] || '';
		if (tokens.length  > 1) {
			for (let i = 1; i < tokens.length; i++) {
				val =  val[tokens[i]];
			}

		}

	}

	return val ;
}

export default function localize( el , languageData) {

	if (el.getAttribute) {
		const langToken = el.getAttribute('data-ref');
		if (langToken) {
			const text = getText(langToken, languageData) || '';
			if (el.hasAttribute('title')) {
				el.setAttribute('title',  text);
			} else {
				el.innerHTML = text;
			}

		}

		if (languageData.LanguageId.indexOf('ar-') > -1) {
			if (TEXT_ELEMENTS.indexOf(el.nodeName)) {
				this.setAttribute('dir', 'rtl');
			}
		}
	}

	if (el.childNodes) {
		for (const node of el.childNodes) {
			localize(node, languageData)
		}
	}

}
