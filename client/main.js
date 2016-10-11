import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { MapStyles } from '/client/helpers/styles';
import { Places } from '/client/helpers/places';
import { PlaceTypes } from '/client/helpers/placeTypes';
import { RenderSVG } from '/client/helpers/renderSVG';
import { RenderText } from '/client/helpers/renderText';
import { MarkersCreator } from '/client/helpers/markers';
import './main.html';

var
	map, //map object
	mapOptions //map creation options
	// markers = [], //markers array
	// markerImages, //hash of base64-encoded png images of marker types
	// activeMarkerIdx = -1 // current active marker
;
const useMiami = true;
const miamiLoc = {
	lat: 25.775,
	lng: -80.216
}

// export global vars
window.Places = Places;
window.PlaceTypes = PlaceTypes;

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

	MarkersCreator.init(Math.floor($(window).width() / 7));
});



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
	MarkersCreator.createMarkers(Places, PlaceTypes, map, onAllMarkersReady);
	// addMarkers();
}

function onAllMarkersReady() {
	console.log('[onAllMarkersReady]');
}

Template.map.events({
	'click #button': function(e, t) {
		markers[43].setAnimation(plugin.google.maps.Animation.POPOUT, function(res){console.log('res = ', res);} );
	}
})

// var
// 	trys = 0,
// 	trysMax = 100,
// 	tryInt = 500;

// function addMarkers() {
// 	// we need the map to exist.. but if addMarkers is
// 	if (!map) {
// 		if (trys > trysMax) {
// 			console.warn('failed to make markers -- map wait timeout');
// 			return;
// 		}
// 		trys++;
// 		setTimeout(addMarkers, tryInt);
// 		return;
// 	}

// 	MarkersCreator.createMarkers(Places, PlaceTypes, map, onAllMarkersReady);
// }