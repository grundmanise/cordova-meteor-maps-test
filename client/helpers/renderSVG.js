var canvg = require('canvg-browser');

var
	i, //current rendering type
	canvas, //canvas object to work on
	placeTypes, //place types to render
	markerImages = {}, //output
	callback; //callback after processing

export const RenderSVG = {
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
		let svg = atob(placeTypes[i][field].substr(26));
		let options = {
			log: true,
			ignoreMouse: true,
			// ignoreDimensions: true,
			renderCallback: RenderSVG.nextMarkerImage,
			// scaleWidth: markerSize * 3,  //oversampling for retina screens. TODO: use devicePixelRatio
			// scaleHeight: markerSize * 3
		};

		canvg(canvas, svg, options);
	},

	nextMarkerImage: function() {
		// let canvas = document.getElementById('canvas');
		let img = canvas.toDataURL("image/png");
		let type_object = placeTypes[i];
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
			RenderSVG.prepareMarkerImages();
			return;
		}
		RenderSVG.prepareMarkerImages(true);
	}
}