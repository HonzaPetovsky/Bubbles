Bubbles.DataValidator = function (data)
{
	var newData = {};
	var bubbles = [];

	if (data.bubbles != undefined) {
		for (key in data.bubbles) {
			bubbles.push(key);
		}
	}

	if (bubbles.length > 0) {

		newData.start = data.start in bubbles ? data.start : bubbles[0];

		if (data.loader != undefined && data.loader.color != undefined && data.loader.url != undefined) {
			newData.loader = data.loader;
		} else return null;

		if (data.view != undefined) {
			newData.view = {"fov":{}};
			newData.view.fov.init = data.view.init != undefined ? data.view.init : 75;
			newData.view.fov.max = data.view.max != undefined ? data.view.max : 85;
			newData.view.fov.min = data.view.min != undefined ? data.view.min : 35;
		} else {
			newData.view = {
				"fov": {
					"init": 75,
					"max": 85,
					"min": 35,
				}
			}
		}

		newData.bubbles = data.bubbles;

		for (key in newData.bubbles) {
			var bubble = newData.bubbles[key];

			if (bubble.image == undefined) {
				return null;
			}
			
			if (bubble.view != undefined) {
				bubble.view.lat = bubble.view.lat != undefined ? bubble.view.lat : 0;
				bubble.view.lon = bubble.view.lon != undefined ? bubble.view.lon : 0;
			} else {
				bubble.view = {
					"lat": 0,
					"lon": 0
				}
			}
			
			if (bubble.hotspots == undefined) {
				bubble.hotspots = [];
			}
		} 

		if (newData.hud == undefined) {
			newData.hud = [];
		}
		
		newData.hud = data.hud;
		newData.map = data.map;

	} else return null;

	return newData;
}