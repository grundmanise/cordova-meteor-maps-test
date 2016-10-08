import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';
var map, mapOptions;

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
	    'zoom': 14,
	    'bearing': 0
	  }
	};
	plugin.google.maps.Map.setDebuggable(true);
	Tracker.autorun(() => {
		Session.set('location', Geolocation.latLng());
	})
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
		mapOptions.camera.latLng = new plugin.google.maps.LatLng(loc.lat, loc.lng);
		map = plugin.google.maps.Map.getMap(div, mapOptions);
		window.mainMap = map;
		map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
	})
});

function onMapReady() {
	console.log('[onMapReady]');
	// map.animateCamera({
	// 	target: {lat: 37.422359, lng: -122.084344},
	// 	zoom: 17,
	// 	tilt: 0,
	// 	bearing: 0,
	// 	duration: 5000
	// });
}