export function roundRect (ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
		const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (let side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fill();
	}
	if (stroke) {
		ctx.stroke();
	}

}

export function isInside (pos, area) {
	return (pos.x >= area.x - 5 && pos.x <= area.x + 5)
		&& (pos.y >= area.y - 5 && pos.y <= area.y + 5);
}


export function getEventPosition (event) {

	const rect = event.currentTarget.getBoundingClientRect();

	const eventX = event.touches ? event.touches[0].clientX : event.clientX;
	const eventY = event.touches ? event.touches[0].clientY : event.clientY;

	return {
		x: eventX - rect.left,
		y: eventY - rect.top
	};
}

