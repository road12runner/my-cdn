export const LAYER_CATEGORY_ID = {
	card : 1,
	text : 2,
	logo : 3
};


export const LAYER_TYPE = {
	CARD: 'card',
	TEXT: 'text',
	LOGO: 'logo'
};


export const SPECIAL_EFFECTS_INTENSITY = {
	LOW: 1,
	MEDIUM: 2,
	HIGH: 3
};



export const environments = {
	uk: {
		'apiurl': 'https://uk.personalcard.net/pcs/api/v1',
		'cdnurl': 'https://uk.personalcard.net/pcs/cdn/V2/App/Skins/',
		'apitrackerurl': 'https://uk.personalcard.net/apitracker'
	},
	us: {
		'apiurl': 'https://us.personalcard.net/pcs/api/v1',
		'cdnurl': 'https://us.personalcard.net/pcs/cdn/V2/App/Skins/',
		'apitrackerurl': 'https://us.personalcard.net/apitracker'
	},
	syd: {
		'apiurl': 'https://au.personalcard.net/api/v1',
		'cdnurl': 'https://au.personalcard.net/pcs/cdn/V2/App/Skins/',
		'apitrackerurl': 'https://au.personalcard.net/apitracker'
	},
	sta: {
		'apiurl': 'https://staging.serversidegraphics.com/pcs/api/v1',
		'cdnurl': 'https://staging.serversidegraphics.com/pcs/cdn/V2/App/Skins/',
		'apitrackerurl': 'https://staging.serversidegraphics.com/apitracker'
	},
	uat: {
		'apiurl': 'https://uat.serversidegraphics.com/pcs/api/v1',
		'cdnurl': 'https://uat.serversidegraphics.com/pcs/cdn/V2/App/Skins/',
		'apitrackerurl': 'https://uat.serversidegraphics.com/apitracker'
	},
	dev: {
		'apiurl': 'https://devserver.serversidegraphics.com/pcs/api/v1',
		'cdnurl': 'https://devserver.serversidegraphics.com/pcs/cdn/V2/App/Skins/',
		'apitrackerurl': 'https://devserver.serversidegraphics.com/apitracker'
	},
	default: {
		'apiurl': 'https://localhost/api',
		'cdnurl': 'https://localhost/PCS/CDN/V2/App/Skins/',
		'apitrackerurl': 'https://localhost/apitracker'
	}
};
