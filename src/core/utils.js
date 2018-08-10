
//fast way to remove all children from the element
export function clearElement( el) {
	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
}