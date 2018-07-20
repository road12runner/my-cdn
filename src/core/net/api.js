import axios from 'axios';

//const  = ServerSide.Configuration.Urls.Api;
//const hostname = 'https://localhost/api';
const hostname = 'https://devserver.serversidegraphics.com/pcs/api/v1';
// https://devserver.serversidegraphics.com/pcs/api/v1/designers/21b32de0-09de-4ec2-a505-1a00eb9d3ac4

function createQuery(arr) {
	const qs = [];
	for(var key in arr) {
		qs.push(key + '=' + arr[key]);
	}
	return qs.join('&');
}


async function performGetRequest(url) {

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


export async function getDesigner(handoverKey) {
	return await performGetRequest([hostname, 'designers', handoverKey, ].join('/'));
}


export function getDataByUrl(url) {
	return performGetRequest(url);
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


