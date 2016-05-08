Bubbles.Leaflet = function (mapData, actionTrigger, canvas)
{
	this.leaflet = document.createElement('div');
	this.leaflet.id = "bubbles-map";
	this.leaflet.style.cssText  = 'position:absolute;';
	this.leaflet.style.width = mapData.width+"px";
	this.leaflet.style.height = mapData.height+"px";

	switch (mapData.align) {
		case 'center':
			var left = canvas.offsetWidth/2-mapData.width/2+mapData.position.x;
			var top = canvas.offsetHeight/2-mapData.height/2-mapData.position.y;
			this.leaflet.style.top = top+"px";
			this.leaflet.style.left = left+"px";
			break;
		case 'left':
			var top = canvas.offsetHeight/2-mapData.height/2-mapData.position.y;
			this.leaflet.style.top = top+"px";
			this.leaflet.style.left = mapData.position.x+"px";
			break;
		case 'right':
			var top = canvas.offsetHeight/2-mapData.height/2-mapData.position.y;
			this.leaflet.style.top = top+"px";
			this.leaflet.style.right = mapData.position.x+"px";
			break;
		case 'top':
			var left = canvas.offsetWidth/2-mapData.width/2+mapData.position.x;
			this.leaflet.style.top = mapData.position.y+"px";
			this.leaflet.style.left = left+"px";
			break;
		case 'bottom':
			var left = canvas.offsetWidth/2-mapData.width/2+mapData.position.x;
			this.leaflet.style.bottom = mapData.position.y+"px";
			this.leaflet.style.left = left+"px";
			break;
		case 'lefttop':
		case 'topleft':
			this.leaflet.style.top = mapData.position.y+"px";
			this.leaflet.style.left = mapData.position.x+"px";
			break;
		case 'leftbottom':
		case 'bottomleft':
			this.leaflet.style.bottom = mapData.position.y+"px";
			this.leaflet.style.left = mapData.position.x+"px";
			break;
		case 'righttop':
		case 'topright':
			this.leaflet.style.top = mapData.position.y+"px";
			this.leaflet.style.right = mapData.position.x+"px";
			break;
		case 'rightbottom':
		case 'bottomright':
			this.leaflet.style.bottom = mapData.position.y+"px";
			this.leaflet.style.right = mapData.position.x+"px";
			break;
	}

	if (!mapData.visible) {
		this.leaflet.style.display = 'none';
	}

	this.map = L.map(this.leaflet).setView([mapData.map.lat, mapData.map.lon], mapData.map.zoom);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(this.map);


	var bubblesMarker = L.Marker.extend({
		options: { 
			target: null
		}
	});

	for (key in mapData.markers) {
		new bubblesMarker([mapData.markers[key].lat, mapData.markers[key].lon], {target: mapData.markers[key].target}).on('click', function() {
			actionTrigger.trigger({"action": "changeBubble", "id": this.options.target})
		}).addTo(this.map);
	}
}

Bubbles.Leaflet.prototype.getDomElement = function ()
{
	return this.leaflet;
}