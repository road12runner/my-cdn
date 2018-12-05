import axios from 'axios';
import qs from 'qs';
//const  = ServerSide.Configuration.Urls.Api;
//const hostname = 'https://localhost/api';
const hostname = 'https://devserver.serversidegraphics.com/pcs/api/v1';
// https://devserver.serversidegraphics.com/pcs/api/v1/designers/21b32de0-09de-4ec2-a505-1a00eb9d3ac4
import {LAYER_CATEGORY_ID} from '../constants';


export const CustomImageType = {
	Image : "Image",
	Facebook : "Facebook"
};



function createQuery(arr) {
	const qs = [];
	for(var key in arr) {
		qs.push(key + '=' + arr[key]);
	}
	return qs.join('&');
}


export async function performGetRequest(url) {

	let  result;
	try {
		const response = await axios.get(url);
		result = response.data;
	} catch (e) {
		console.log('error', e);
	}

	return result;

	// return new Promise( (resolve, reject) => {
	// 		axios.get(url).then( response => {
	//
	// 			if (response.status === 200) {
	// 				resolve(response.data);
	// 			} else {
	// 				console.error('Oops. Api response has bad status', response.status);
	// 				resolve(null);
	// 			}
	//
	//
	// 		}).catch( error => {
	// 			console.error('Failed to perform api request', error);
	// 			resolve(null);
	// 		})
	// });

}



async function performPostRequest(url, data = {}, encoding = 'application/json') {

	let result = null;

	let params = data;

	if ("application/x-www-form-urlencoded" === encoding) {
		params  = qs.stringify(params);
	}

	try {
		const response  = await axios.post(url, params, { headers : {"Content-Type" : encoding}});
		result = response.data;
	} catch (e) {
		console.log('error', e);
	}


	return result;
}


async function performBlobPostRequest(url, data = {}, encoding = 'application/json') {

	let result = null;

	const formData = new FormData();
	formData.append('picture', data);

	try {
		const response  = await axios.post(url, formData, { headers : {"Content-Type" : encoding}});
		result = response.data;
	} catch (e) {
		console.log('error', e);
	}


	return result;
}



async function performPutRequest(url, data = {}) {

	let result = null;

	try {
		const response  = await axios.put(url, data);
		result = response.data
	} catch (e) {
		console.log('error', e);
	}

	return result;
}


export async function getDesigner(handoverKey) {
	return await performGetRequest([hostname, 'designers', handoverKey ].join('/'));
}


export function getDataByUrl(url) {
	return performGetRequest(url);
}

export function createClient(handoverKey, params={} ) {
	const url = [hostname, 'designers', handoverKey, 'clientdesigns'].join('/');
	return performPostRequest(url, params, 'application/x-www-form-urlencoded');
}


export function getLanguage(handoverKey, lanugageId) {
	return performGetRequest([hostname, 'designers', handoverKey, 'languages', lanugageId].join('/'))
}

export function submitLayer(handoverKey, layerType) {
	const layerParam = `?type=${layerType}`;
	return performPostRequest([hostname, 'designers', handoverKey, 'layers', layerParam].join('/'));
}

export function submitCard(handoverKey, cardImageId, data) {
	return performPutRequest([hostname, 'designers', handoverKey, 'clientdesigns', cardImageId].join('/'), data);
}

export function uploadCustomImage(handoverKey, cardImageId, layerId, blobData) {

	return performBlobPostRequest([hostname, 'designers', handoverKey, 'ClientDesigns', cardImageId, `Uploads?layerid=${layerId}`].join('/'), blobData);
	// var layerid = layer ? _module.LayerCategory[layer] : _module.LayerCategory.Card;
	// return ServerSide.Network.RestClient.MakeRestPath('designers', designer.HandoverKey, 'ClientDesigns', client.CardImageId, 'Uploads?layerid=' + layerid + wrap);

}




export function postRedirect(url) {

	const form = document.createElement('form');

	form.method = 'post';
	form.action = url;

	const fields = [];

	this.addValue = function(key, value) {
		if (key in fields) {
			fields[key].value = value;
		} else {
			form.appendChild(function() {
				const hiddenField = document.createElement('input');
				hiddenField.type = 'hidden';
				hiddenField.name = key;
				hiddenField.value = value;
				fields[key] = hiddenField;
				return hiddenField;
			} ());
		}
	};

	this.submit = function(breakframe) {
		document.body.appendChild(form);
		if (breakframe) {
			form.target = '_top';
		}
		form.submit();
	};

}

export function getRedirect(url) {

	const _params = {};

	this.addValue = function(key, value) {
		_params[key] = value;
	};

	this.submit = function(breakFrame) {

		if (breakFrame) {
			window.top.location = url + (url.indexOf('?') === -1 ? '?' : '&') + createQuery(_params);
		}
		else {
			window.location = url + (url.indexOf('?') === -1 ? '?' : '&') + createQuery(_params);
		}
	};

}


export function getImageUploadUrl(handoverKey, clientId, layerId) {
	const layer = layerId ? LAYER_CATEGORY_ID[layerId] : LAYER_CATEGORY_ID.Card;
	return [hostname, 'designers', handoverKey, 'ClientDesigns', clientId, `Uploads?layerid=${layer}`].join('/');
}


export function uploadImageByUrl(hanoverKey, clientId, url, imageType) {

	const postUrl = [hostname, 'designers', hanoverKey, 'ClientDesigns', clientId, 'Uploads'].join('/');
	return performPostRequest(postUrl, {Url : url, Type : imageType});

}


