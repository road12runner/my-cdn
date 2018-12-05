const MAX_IMAGES = 20;
const FACEBOOK_URL = 'https://graph.facebook.com/';
import AppSettings from '../AppSettings';

import {performGetRequest} from './api';

export async function getFacebookUserId ({id, token}) {
	const fbUrl = `${FACEBOOK_URL}${id}/?fields=id&access_token=${token}`;
	const result = await performGetRequest(fbUrl);
	if (!result) {
		throw new Error('Failed to received facebook user id');
	}
	return result.id;
}

export function facebookAuth (facebookAppId) {
	const url = `https://www.facebook.com/dialog/oauth?client_id=${facebookAppId}&response_type=token&scope=user_photos,public_profile,email&redirect_uri=${window.location.href}`;
	window.location.replace(url);
}


export function getFacebookToken () {
	const FACEBOOK_TOKEN = 'access_token=';
	const idx = window.location.href.indexOf(FACEBOOK_TOKEN);
	if (idx > -1) {
		const token = window.location.href.substr(idx + FACEBOOK_TOKEN.length).split('&')[0];
		AppSettings.FacebookData = {
			token,
			id: 'me'
		};

		window.location.replace('#');
		// slice off the remaining '#' in HTML5:
		if (typeof window.history.replaceState == 'function') {
			history.replaceState({}, '', window.location.href.slice(0, -1));
		}

		return token;
	}
}


export function getCategories({userId, token}) {
	const fbUrl = `${FACEBOOK_URL}${userId}/albums?fields=images,name,id,height,width,source&access_token=${token}`;
	return performGetRequest(fbUrl);
}

export function getUserPhotos({userId, token}) {
	const fbUrl =`${FACEBOOK_URL}${userId}/photos?fields=images,name,id,height,width,source&access_token=${token}`;
	return performGetRequest(fbUrl);
}

export function getImages({categoryId, token}) {

	const photosUrl =`${FACEBOOK_URL}${categoryId}/photos?fields=images,name,id,height,width,source&access_token=${token}&limit=${MAX_IMAGES}`;
	//ServerSide.Lib.Utils.Log('GetFacebookPhotos');
	return performGetRequest(photosUrl);
}

export function getData(url) {
	return performGetRequest(url);
}





