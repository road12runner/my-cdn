import axios from 'axios';
import qs from 'qs';
import {LAYER_CATEGORY_ID, environments} from '../constants';
import AppSettings from '../AppSettings';

export const CustomImageType = {
	Image : "Image",
	Facebook : "Facebook"
};



function getHostname() {
	return environments[AppSettings.environment].apiurl;
}


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
	return await performGetRequest([getHostname(), 'designers', handoverKey ].join('/'));
}


export function getDataByUrl(url) {
	return performGetRequest(url);
}

export function createClient(handoverKey, params={} ) {
	const url = [getHostname(), 'designers', handoverKey, 'clientdesigns'].join('/');
	return performPostRequest(url, params, 'application/x-www-form-urlencoded');
}


export function getLanguage(handoverKey, lanugageId) {
	return performGetRequest([getHostname(), 'designers', handoverKey, 'languages', lanugageId].join('/'))
}

export function submitLayer(handoverKey, layerType) {
	const layerParam = `?type=${layerType}`;
	return performPostRequest([getHostname(), 'designers', handoverKey, 'layers', layerParam].join('/'));
}

export function submitCard(handoverKey, cardImageId, data) {
	return performPutRequest([getHostname(), 'designers', handoverKey, 'clientdesigns', cardImageId].join('/'), data);
}

export function uploadCustomImage(handoverKey, cardImageId, layerId, blobData) {

	return performBlobPostRequest([getHostname(), 'designers', handoverKey, 'ClientDesigns', cardImageId, `Uploads?layerid=${layerId}`].join('/'), blobData);
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
	return [getHostname(), 'designers', handoverKey, 'ClientDesigns', clientId, `Uploads?layerid=${layer}`].join('/');
}


export function uploadImageByUrl(hanoverKey, clientId, url, imageType) {

	const postUrl = [getHostname(), 'designers', hanoverKey, 'ClientDesigns', clientId, 'Uploads'].join('/');
	return performPostRequest(postUrl, {Url : url, Type : imageType});

}


