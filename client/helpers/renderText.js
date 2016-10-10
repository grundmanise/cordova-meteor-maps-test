export const RenderText = {
	// textOptions = {
	//   maxWidth: 100, (px)
	//   wordSpacing: 5, (px)
	//   lineSpacing: 5, (px)
	//   fontSize: 15, (px)
	// }
	// all pixel-sizes are for 375x667 screen and translated automatically
	renderText(text, targetCanvas, stringCanvas, wordCanvas, textOptions) {
		let
			words = text.split(' '),
			index = 0,
			finished = false,
			width = 0,
			top = 0,
			stringHeight = RenderText.tranlatePixels(textOptions.fontSize) + 8,
			lineHeight = RenderText.tranlatePixels(textOptions.fontSize + textOptions.lineSpacing),
			ctx = targetCanvas.getContext('2d'),
			maxWidth = RenderText.tranlatePixels(textOptions.maxWidth);
		RenderText.resizeAndClearCanvas(targetCanvas, maxWidth, lineHeight*5);
		while (!finished) {
			({index, finished, width} = RenderText.renderString(words, stringCanvas, wordCanvas, index, textOptions));
			// console.log('[renderText] index = ', index, ', finished = ', finished, ', width = ', width);
			let x = Math.floor((maxWidth - width)/2);
			ctx.drawImage(stringCanvas, 0, 0, width, stringHeight, x, top, width, stringHeight);
			top += lineHeight;
		}
		return {height: top, width: maxWidth};
	},

	renderString(words, stringCanvas, wordCanvas, index, textOptions) {
		// put words one by one
		// when next word width is bigger than maxWidth --
		// center string and return

		// set up canvas
		let
			width = RenderText.tranlatePixels(textOptions.maxWidth),
			height = +RenderText.tranlatePixels(textOptions.fontSize)+8,
			fontSize = RenderText.tranlatePixels(textOptions.fontSize),
			currentLeft = 0,
			wordSpacing = RenderText.tranlatePixels(textOptions.wordSpacing);
		RenderText.resizeAndClearCanvas(stringCanvas, width, height);
		let ctx = stringCanvas.getContext('2d');

		for (let i = index; i < words.length; i++) {
			// after this call wordCanvas contains rendered word with shadow
			let {textWidth} = RenderText.renderWord(words[i], wordCanvas, textOptions.fontSize);
			let nextLeft = textWidth + currentLeft + wordSpacing;
			if (nextLeft > width) {
				// ok, we're finished with this string -- return
				return {index: i, finished: false, width: currentLeft};
			}
			ctx.drawImage(wordCanvas, currentLeft, 0);
			currentLeft = nextLeft;
		}
		return {index: words.length, finished: true, width: currentLeft};
	},

	// renders one word, and returns its size
	renderWord(word, canvas, fontSize) {
		let {ctx} = RenderText.setRenderingStyle(canvas, fontSize);
		let textWidth = Math.round(ctx.measureText(word).width);
		RenderText.resizeAndClearCanvas(canvas, +textWidth+4, +fontSize+8);

		// reset context after resize.
		// parentheses are needed for correct DESTRUCTURING ASSIGNMENT
		({ctx} = RenderText.setRenderingStyle(canvas, fontSize));
		RenderText.setShadowStyle(ctx);

		ctx.fillText(word, 2, fontSize-2);
		return {textWidth, fontSize};
	},

    // @include font-size(15)
    // font-weight: 600;
    // color: $beige;
	setRenderingStyle(canvas, fontSize) {
		let ctx = canvas.getContext('2d');
		// let effectiveFontSize = RenderText.tranlatePixels(fontSize);
		ctx.font = `${fontSize}px svgrendertext`;
		ctx.fillStyle = "rgb(250, 248, 244)";
		return {ctx};
	},

    // text-shadow: 0 0 2px $warmGrey90;
	setShadowStyle(ctx) {
		ctx.shadowColor = "rgba(157, 150, 150, 0.9)";
		ctx.shadowBlur = 2;
	},

	tranlatePixels(pixels) {
		return Math.round(pixels / 667 * $(window).height());
	},

	resizeAndClearCanvas(canvas, width, height) {
		$(canvas).css('width', width + 'px');
		$(canvas).css('height', height + 'px');
		canvas.width = width;
		canvas.height = height;
		let ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},
}