import { RenderText } from '/client/helpers/renderText';
// var canvg = require('canvg-browser');

var
	i, //current rendering type
	canvas, //canvas object to work on
	placeTypes, //place types to render
	markerImages = {}, //output
	callback, //callback after processing
	markerSize,
	img;

export const RenderSVG = {
	init: function(ms) {
		markerSize = ms;
	},

	renderPlaceTypes(placeTypesToRender, workingCanvas, cb) {
		i = 0;
		canvas = workingCanvas;
		placeTypes = placeTypesToRender;
		callback = cb;
		RenderSVG.prepareMarkerImages();
	},

	prepareMarkerImages: function(type) {
		// let canvas = document.getElementById('canvas');
		if (!placeTypes[i]) {
			console.log('[prepareMarkerImages] all marker images ready');
			callback(markerImages);
			return;
		}
		let field = type ? 'iconMapActiveBase64' : 'iconMapBase64';
		if (!img) {
			img = new Image();
			img.className = 'hidden';
			document.body.appendChild(img);
		}
		let targetWidth = targetHeight = markerSize * 2;
		img.onload = () => {
			RenderText.resizeAndClearCanvas(canvas, targetWidth, targetHeight);
			let ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			RenderSVG.nextMarkerImage();
		}
		img.width = img.height = targetWidth;
		img.src = placeTypes[i][field];
	},

	nextMarkerImage: function() {
		// let canvas = document.getElementById('canvas');
		let type_object = placeTypes[i];
		let isActiveImage = !!markerImages[type_object.id];
		let field = !!markerImages[type_object.id] ? 'iconMapActiveBase64' : 'iconMapBase64';
		let img = canvas.toDataURL("image/png");
		if (!markerImages[type_object.id]) {
			markerImages[type_object.id] = {};
		}
		markerImages[type_object.id][field] = img;
		// let context = canvas.getContext('2d');
		// context.clearRect(0, 0, canvas.width, canvas.height);
		if (isActiveImage) {
			i++;
			RenderSVG.prepareMarkerImages();
			return;
		}
		RenderSVG.prepareMarkerImages(true);
	},

	getTextCanvas(text) {

	}
}