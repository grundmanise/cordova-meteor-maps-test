import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { MapStyles } from '/client/helpers/styles';
import { Places } from '/client/helpers/places';

import './main.html';
var
	map, //map object
	mapOptions, //map creation options
	markers = []//markers array
;
const useMiami = true;
const miamiLoc = {
	lat: 25.775,
	lng: -80.216
}

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
		mapOptions.camera.latLng = useMiami ?
			new plugin.google.maps.LatLng(miamiLoc.lat, miamiLoc.lng) :
			new plugin.google.maps.LatLng(loc.lat, loc.lng);
		map = plugin.google.maps.Map.getMap(div, mapOptions);
		map.setStyles(JSON.stringify(MapStyles));
		window.mainMap = map;
		map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
	})
});

function onMapReady() {
	console.log('[onMapReady]');
	addMarkers();
}

function addMarkers() {
	_.forEach(Places, (place) => {
		let markerTypeId = place.type.parent ? place.type.parent.id : place.type.id;
		let icon = Meteor.absoluteUrl(`/png/ic_filCat${markerTypeId}_normal.png`);
		map.addMarker({
			'position': new plugin.google.maps.LatLng(place.latitude, place.longitude),
			'title': place.caption,
			'icon': {
				'url': icon
			}
		}, function(marker) {
			markers.push(marker);
		});
	});
}