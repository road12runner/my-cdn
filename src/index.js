import App from './App';

export function designer () {
	function start() {
		console.log('start designer');
		
		const app = new App({el: 'aam-designer'});
		
	}
	
	return {
		start: start
	}
}


//window.aam = aam;