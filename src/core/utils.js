
//fast way to remove all children from the element
export function clearElement( el) {
	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
}



// extract parameters from URL query
export const getUrlParams = (search = '') => {
	const hashes = search.slice(search.indexOf('?') + 1).split('&');
	return hashes.reduce((acc, hash) => {
		// eslint-disable-next-line
		const [key, val] = hash.split('=');
		return {
			...acc,
			[key]: decodeURIComponent(val)
		};
	}, {});
};