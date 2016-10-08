import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { MapStyles } from '/client/helpers/styles';
import { Places } from '/client/helpers/places';
import { PlaceTypes } from '/client/helpers/placeTypes';
var canvg = require('canvg-browser');

import './main.html';
var
	map, //map object
	mapOptions, //map creation options
	markers = [], //markers array
	markerImages = {}, //hash of base64-encoded png images of marker types
	activeMarkerIdx = -1 // current active marker
;
const useMiami = true;
const miamiLoc = {
	lat: 25.775,
	lng: -80.216
}
var markerSize;

// export global vars
window.Places = Places;
window.PlaceTypes = PlaceTypes;
window.markerImages = markerImages;
window.markers = markers;
window.markerSize = markerSize;

Meteor.startup(() => {
	console.log('[Meteor.startup]')
	mapOptions = {
	  'backgroundColor': 'white',
	  'mapType': plugin.google.maps.MapTypeId.ROADMAP,
	  'controls': {
	    'compass': false,
	    'myLocationButton': false,
	    'indoorPicker': false,
	    'zoom': false
	  },
	  'gestures': {
	    'scroll': true,
	    'tilt': false,
	    'rotate': false,
	    'zoom': true
	  },
	  'camera': {
	    'tilt': 0,
	    'zoom': 10,
	    'bearing': 0
	  }
	};
	plugin.google.maps.Map.setDebuggable(false);
	plugin.google.maps.Map.setBackgroundColor('white');
	Tracker.autorun(() => {
		Session.set('location', Geolocation.latLng());
	});

	markerSize = Math.floor($(window).width() / 7);
	prepareMarkerImages();
});

var i = 0;
function prepareMarkerImages(type) {
	let canvas = document.getElementById('canvas');
	if (!PlaceTypes[i]) {
		console.log('[prepareMarkerImages] all marker images ready');
		addMarkers();
		return;
	}
	let field = type ? 'iconMapActiveBase64' : 'iconMapBase64';
	let svg = atob(PlaceTypes[i][field].substr(26));
	let options = {
		log: true,
		ignoreMouse: true,
		// ignoreDimensions: true,
		renderCallback: nextMarkerImage,
		// scaleWidth: markerSize * 3,  //oversampling for retina screens. TODO: use devicePixelRatio
		// scaleHeight: markerSize * 3
	};

	canvg(canvas, svg, options);
}

function nextMarkerImage() {
	let canvas = document.getElementById('canvas');
	let img = canvas.toDataURL("image/png");
	let type_object = PlaceTypes[i];
	let not_first = !!markerImages[type_object.id];
	let field = !!markerImages[type_object.id] ? 'iconMapActiveBase64' : 'iconMapBase64';
	if (!markerImages[type_object.id]) {
		markerImages[type_object.id] = {};
	}
	markerImages[type_object.id][field] = img;
	let context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (not_first) {
		i++;
		prepareMarkerImages();
		return;
	}
	prepareMarkerImages(true);
}

var inited = false;
Template.map.onRendered(() => {
	console.log('[Map.onRendered]');
	Tracker.autorun( () => {
		let loc = Session.get('location');
		if (!loc)
			return;
		if (inited)
			return;
		let div = document.getElementById('map');
		mapOptions.camera.latLng = useMiami ?
			new plugin.google.maps.LatLng(miamiLoc.lat, miamiLoc.lng) :
			new plugin.google.maps.LatLng(loc.lat, loc.lng);
		map = plugin.google.maps.Map.getMap(div, mapOptions);
		map.clear();
		map.setStyles(JSON.stringify(MapStyles));
		window.mainMap = map;
		inited = true;
		map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
	})
});

function onMapReady() {
	console.log('[onMapReady]');
	// addMarkers();
}

function onMarkerClick(marker) {
	// console.log('[onMarkerClick] place = ', marker.get('place'));
	if (activeMarkerIdx > -1) {
		let
			oldActiveMarker = markers[activeMarkerIdx],
			oldPlace = oldActiveMarker.get('place');
		oldActiveMarker.setZIndex(0);
		oldActiveMarker.setIcon(getMarkerImage(oldPlace, false));
	}
	marker.setZIndex(5);
	marker.setIcon(getMarkerImage(marker.get('place'), true));
	activeMarkerIdx = marker.get('index');
	// marker.set
}

function getMarkerImage(place, active) {
	let markerTypeId = place.type.parent ? place.type.parent.id : place.type.id;
	if (!markerTypeId || !markerImages[markerTypeId])
		return false;
	let field = active ? 'iconMapActiveBase64' : 'iconMapBase64';
	let icon = markerImages[markerTypeId][field];
	return {
		url: icon,
		size: {
			width: markerSize,
			height: markerSize
		}
	};
}

function onAllMarkersReady() {
	console.log('[onAllMarkersReady]');
}

var
	trys = 0,
	trysMax = 100,
	tryInt = 500,
	totalMarkersReady = 0,
	needToMakeMarkers = Places.length;
function addMarkers() {
	if (!map) {
		if (trys > trysMax) {
			console.warn('failed to make markers -- map wait timeout');
			return;
		}
		trys++;
		setTimeout(addMarkers, tryInt);
		return;
	}
	_.forEach(Places, (place) => {
		let icon = getMarkerImage(place, false);
		if (!icon) {
			needToMakeMarkers--;
			return;
		}
		map.addMarker({
			// no title => no infowindow!
			// title: place.caption,
			position: new plugin.google.maps.LatLng(place.latitude, place.longitude),
			place: place,
			id: place.id,
			draggable: false,
			icon
		}, function(marker) {
			totalMarkersReady++;
			marker.set('index', markers.length);
			markers.push(marker);
			marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, onMarkerClick);
			if (totalMarkersReady >= needToMakeMarkers)
				onAllMarkersReady();
		});
	});
}