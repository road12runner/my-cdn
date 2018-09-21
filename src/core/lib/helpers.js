export function bytesToSize(bytes) {
	const sizes = ['Bytes', 'KB', 'MB'];
	if (bytes === 0) {
		return 'n/a';
	}
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

export function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
	let hr = Math.floor(secs / 3600);
	let min = Math.floor((secs - (hr * 3600))/60);
	let sec = Math.floor(secs - (hr * 3600) -  (min * 60));

	if (hr < 10) {hr = "0" + hr; }
	if (min < 10) {min = "0" + min;}
	if (sec < 10) {sec = "0" + sec;}
	if (hr) {hr = "00";}
	return `${hr}:${min}${sec}`;
}
