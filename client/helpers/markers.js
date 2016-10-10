import { RenderText } from '/client/helpers/renderText';
import { RenderSVG } from '/client/helpers/renderSVG';

var
	markers = [], //markers array
	markerImages, //hash of base64-encoded png images of marker types
	activeMarkerIdx = -1, // current active marker
	markerSize,
	totalMarkersReady = 0,
	needToMakeMarkers;

export const MarkersCreator = {
	init: function(ms) {
		markerSize = ms;
	},

	createMarkers: function(places, placeTypes, map, cb) {
		let canvas = document.createElement('canvas');
		RenderSVG.renderPlaceTypes(placeTypes, canvas, (imgs) => {
			markerImages = imgs;
			MarkersCreator.createMarkersReal(places, map);
		});
	},

	createMarkersReal: function(places, map, cb) {
		needToMakeMarkers = places.length;
		_.forEach(places, (place) => {
			let icon = MarkersCreator.getMarkerImage(place, false);
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
				marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, MarkersCreator.onMarkerClick);
				if (totalMarkersReady >= needToMakeMarkers)
					if (cb)
						cb();
			});
		});
	},

	getMarkerImage: function(place, active) {
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
		}
	},

	onMarkerClick: function(marker) {
	// console.log('[onMarkerClick] place = ', marker.get('place'));
		if (activeMarkerIdx > -1) {
			let
				oldActiveMarker = markers[activeMarkerIdx],
				oldPlace = oldActiveMarker.get('place');
			oldActiveMarker.setZIndex(0);
			oldActiveMarker.setIcon(MarkersCreator.getMarkerImage(oldPlace, false));
		}
		marker.setZIndex(5);
		marker.setIcon(MarkersCreator.getMarkerImage(marker.get('place'), true));
		activeMarkerIdx = marker.get('index');
		// marker.set
	}
}

