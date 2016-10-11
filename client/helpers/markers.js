import { RenderText } from '/client/helpers/renderText';
import { RenderSVG } from '/client/helpers/renderSVG';

var
	markers = [], //markers array
	markerImages, //hash of base64-encoded png images of marker types
	activeMarkerIdx = -1, // current active marker
	markerSize,
	totalMarkersReady = 0,
	needToMakeMarkers,
	markerCanvasWidth,
	markerCanvasHeight,
	placeIdx = 0,
	placesQueue;

var
	targetCanvas,
	stringCanvas,
	wordCanvas,
	compositeCanvas;

// window.markerImages = markerImages;
window.markers = markers;
// window.markerSize = markerSize;


function setImmediate(cb) {
	Meteor.setTimeout(cb, 0);
}

export const MarkersCreator = {
	init: function(ms) {
		markerSize = ms;
		RenderSVG.init(ms);
	},

	createMarkers: function(places, placeTypes, map, cb) {
		console.time('typeRender');
		let canvas = document.createElement('canvas');
		RenderText.resizeAndClearCanvas(canvas, markerSize*3, markerSize*3);
		RenderSVG.renderPlaceTypes(placeTypes, canvas, (imgs) => {
			// console.log('[MarkersCreator.createMarkers] types rendered');
			console.timeEnd('typeRender');
			markerImages = imgs;
			window.markerImages = markerImages;
			markerCanvasWidth = canvas.width;
			markerCanvasHeight = canvas.height;
			MarkersCreator.prepareTexts(places, map, cb);
		});

	},

	prepareTexts: function(places, map, cb) {
		console.time('textRender');
		targetCanvas = document.createElement('canvas');
		stringCanvas = document.createElement('canvas');
		wordCanvas = document.createElement('canvas');
		compositeCanvas = document.createElement('canvas');
		document.body.appendChild(compositeCanvas);
		placesQueue = places;

		MarkersCreator.prepareTextWorker(() => {
			console.timeEnd('textRender');
			MarkersCreator.createMarkersReal(map);
		});

		// _.forEach(places, (place) => {
		// 	let markerTypeId = place.type.parent ? place.type.parent.id : place.type.id;
		// 	if (!markerTypeId || !markerImages[markerTypeId])
		// 		return;
		// 	let markerImage = markerImages[markerTypeId].iconMapActiveBase64;
		// });

	},

	prepareTextWorker: function(cb) {
		let place = placesQueue[placeIdx];
		if (!place) {
			// we're finished
			if (cb)
				cb();
			return;
		}

		let markerTypeId = place.type.parent ? place.type.parent.id : place.type.id;
		if (!markerTypeId || !markerImages[markerTypeId]) {
			placeIdx++;
			setImmediate(() => {
				MarkersCreator.prepareTextWorker(cb);
			})
			return;
		}

		let markerImage = markerImages[markerTypeId].iconMapActiveBase64;
		let textParams = {
			maxWidth: 300,
			wordSpacing: 5,
			lineSpacing: 2,
			fontSize: 30
		};

		let {width, height} = RenderText.renderText(place.caption, targetCanvas, stringCanvas, wordCanvas, textParams);
		MarkersCreator.makeTextComposite(compositeCanvas, markerImage, targetCanvas, width, height, (targetWidth, targetHeight) => {
			placesQueue[placeIdx].activeImage = {
				img: compositeCanvas.toDataURL("image/png"),
				w: targetWidth/2,
				h: targetHeight/2,
				aW: targetWidth/4,
				aH: markerCanvasHeight/2
			};
			placesQueue[placeIdx].idx = placeIdx;
			placeIdx++;
			setImmediate(() => {
				MarkersCreator.prepareTextWorker(cb);
			});
		});
	},

	makeTextComposite: function(canvas, markerImage, targetCanvas, width, height, cb) {
		let
			delta = 5,
			targetWidth = Math.max(width, markerCanvasWidth),
			targetHeight = markerCanvasHeight + 3*delta + height,
			markerX = Math.floor((targetWidth - markerCanvasWidth) / 2),
			textX = Math.floor((targetWidth - width) / 2),
			textY = markerCanvasHeight + delta;
		RenderText.resizeAndClearCanvas(canvas, targetWidth, targetHeight);
		let ctx = canvas.getContext('2d');
		ctx.drawImage(targetCanvas, textX, textY);

		let img = new Image();
		img.onload = () => {
			ctx.drawImage(img, markerX, 0);
			if (cb)
				cb(targetWidth, targetHeight);
		}
		img.src = markerImage;
	},

	createMarkersReal: function(map, cb) {
		console.time('markerCreate');
		let places = placesQueue;
		needToMakeMarkers = places.length;
		_.forEach(places, (place) => {
			let {icon, anchor} = MarkersCreator.getMarkerImage(place, false);
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
				marker.set('index', marker.get('place').idx);
				// animate marker
				marker.setAnimation(plugin.google.maps.Animation.POPOUT);
				markers.push(marker);
				marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, MarkersCreator.onMarkerClick);
				if (totalMarkersReady >= needToMakeMarkers) {
					console.timeEnd('markerCreate');
					if (cb)
						cb();
				}
			});
		});
	},

	getMarkerImage: function(place, active, idx) {
		let markerTypeId = place.type.parent ? place.type.parent.id : place.type.id;
		if (!markerTypeId || !markerImages[markerTypeId])
			return {icon: false, anchor: false};
		let field = active ? 'iconMapActiveBase64' : 'iconMapBase64';
		let icon = markerImages[markerTypeId][field];
		if (active)
			return {
				icon: {
					url: placesQueue[idx].activeImage.img,
					size: {
						width: placesQueue[idx].activeImage.w,
						height: placesQueue[idx].activeImage.h
					}
				},
				anchor: {
					x: placesQueue[idx].activeImage.aW,
					y: placesQueue[idx].activeImage.aH
				}
			};
		return {
			icon: {
				url: icon,
				size: {
					width: markerSize,
					height: markerSize
				}
			},
			anchor: {
				x: markerSize/2,
				y: markerSize
			}
		};
	},

	setMarkerImage: function(marker, place, active, idx) {
		let {icon, anchor} = MarkersCreator.getMarkerImage(place, active, idx);
		marker.setIcon(icon);
		marker.setIconAnchor(anchor.x, anchor.y)
	},

	onMarkerClick: function(marker) {
	// console.log('[onMarkerClick] place = ', marker.get('place'));
		var idx = marker.get('index');
		if (activeMarkerIdx > -1) {
			let
				oldActiveMarker = markers[activeMarkerIdx],
				oldPlace = oldActiveMarker.get('place');
			oldActiveMarker.setZIndex(0);
			MarkersCreator.setMarkerImage(oldActiveMarker, oldPlace, false);
		}
		marker.setZIndex(5);
		MarkersCreator.setMarkerImage(marker, marker.get('place'), true, idx);
		// let icon = MarkersCreator.getMarkerImage(marker.get('place'), true, idx);
		// oldActiveMarker.setIcon(icon);
		// oldActiveMarker.setIconAnchor(icon.anchor.x, icon.anchor.y)
		activeMarkerIdx = idx;
		// marker.set
	}
}

