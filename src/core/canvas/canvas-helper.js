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

	const rect = event.currentTarget.getBoundingClientRect() ;
	const eventX = event.touches ? event.touches[0].clientX : event.clientX;
	const eventY = event.touches ? event.touches[0].clientY : event.clientY;

	return {
		x: eventX - rect.left  - rect.width / 2,
		y: eventY - rect.top - rect.height /2
	};
}



export function allInside (vertices, coverage) {

	const box = {
		top: coverage.y,
		bottom: coverage.y + coverage.height,
		left: coverage.x,
		right: coverage.x + coverage.width
	};

	return vertices[0].y > box.top
		&& vertices[1].y > box.top
		&& vertices[2].y > box.top
		&& vertices[3].y > box.top
		&& vertices[0].x > box.left
		&& vertices[1].x > box.left
		&& vertices[2].x > box.left
		&& vertices[3].x > box.left
		&& vertices[0].x < box.right
		&& vertices[1].x < box.right
		&& vertices[2].x < box.right
		&& vertices[3].x < box.right
		&& vertices[0].y < box.bottom
		&& vertices[1].y < box.bottom
		&& vertices[2].y < box.bottom
		&& vertices[3].y < box.bottom;
}


/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
export function doPolygonsIntersect (a, b) {
	var polygons = [a, b];
	var minA, maxA, projected, i, i1, j, minB, maxB;

	for (i = 0; i < polygons.length; i++) {

		// for each polygon, look at each edge of the polygon, and determine if it separates
		// the two shapes
		var polygon = polygons[i];
		for (i1 = 0; i1 < polygon.length; i1++) {

			// grab 2 vertices to create an edge
			var i2 = (i1 + 1) % polygon.length;
			var p1 = polygon[i1];
			var p2 = polygon[i2];

			// find the line perpendicular to this edge
			var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

			minA = maxA = undefined;
			// for each vertex in the first shape, project it onto the line perpendicular to the edge
			// and keep track of the min and max of these values
			for (j = 0; j < a.length; j++) {
				projected = normal.x * a[j].x + normal.y * a[j].y;
				if (isUndefined(minA) || projected < minA) {
					minA = projected;
				}
				if (isUndefined(maxA) || projected > maxA) {
					maxA = projected;
				}
			}

			// for each vertex in the second shape, project it onto the line perpendicular to the edge
			// and keep track of the min and max of these values
			minB = maxB = undefined;
			for (j = 0; j < b.length; j++) {
				projected = normal.x * b[j].x + normal.y * b[j].y;
				if (isUndefined(minB) || projected < minB) {
					minB = projected;
				}
				if (isUndefined(maxB) || projected > maxB) {
					maxB = projected;
				}
			}

			// if there is no overlap between the projects, the edge we are looking at separates the two
			// polygons, and we know there is no overlap
			if (maxA < minB || maxB < minA) {
				console.log("polygons don't intersect!");
				return false;
			}
		}
	}
	return true;
}

function isUndefined (val) {
	return val === undefined;
}



export function hexToRgb (hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
