String.prototype.padRight = function(l, c)
{
	return this + Array(l - this.length + 1).join(c || ' ');
};

String.prototype.padLeft  = function(l, c)
{
	return Array(l - this.length + 1).join(c || ' ') + this;
};

var Engine = Class.extend(function(){

	this.debugEnabled  = false;

	this.engineWidth   = undefined;
	this.engineHeight  = undefined;
	this.engineScale   = undefined;
	this.canvasElement = undefined;
	this.canvasContext = undefined;
	
	this.timerFrame      = undefined;
	this.tickTime        = undefined;
	this.tickAccumulator = 0.0;
	this.tickStepSize    = 60 / 1;

	var imageTiles;
	var imageFont;

	this.tileWidth   = 16;
	this.tileHeight  = 16;
	this.tilesPerRow = 4;

	this.keyMap     = [];
	this.KEY_LEFT   = 37;
	this.KEY_UP     = 38;
	this.KEY_RIGHT  = 39;
	this.KEY_DOWN   = 40;
	this.KEY_JUMP   = 17; // CTRL
	this.KEY_ACTION = 18; // ALT
	

	this.constructor = function(width, height, scale){
		this.engineWidth  = width;
		this.engineHeight = height;
		this.engineScale  = scale;
		this.canvasElement = document.createElement('canvas');
		this.canvasElement.width  = this.engineWidth  * this.engineScale;
		this.canvasElement.height = this.engineHeight * this.engineScale;
		document.body.appendChild(this.canvasElement);
		//window.addEventListener("resize",           this.onWindowResize);
		document.addEventListener("visibilitychange", this.onVisibilityChange, false);
		document.addEventListener("keydown",          this.onKeyDown);
		document.addEventListener("keyup",            this.onKeyUp);
	};

	this.onWindowResize = function(event){
		this.canvasElement.width  = document.documentElement.clientWidth;
		this.canvasElement.height = document.documentElement.clientWidth * 
			(this.engineHeight / this.engineWidth);
		this.updateContext();
	};

	this.updateContext = function(){
		this.canvasContext = this.canvasElement.getContext('2d');
		this.canvasContext.imageSmoothingEnabled       = false;
		this.canvasContext.mozImageSmoothingEnabled    = false;
		this.canvasContext.webkitImageSmoothingEnabled = false;
		this.canvasContext.msImageSmoothingEnabled     = false;
		this.canvasContext.oImageSmoothingEnabled      = false;
	};

	this.onVisibilityChange = function(event){
		if(document.hidden){
			this.stop();
		}else{
			this.start();
		}
	};

	this.onKeyDown = function(event)
	{
		//console.log(event);
		this.updateKeyMap(event, true);
	};

	this.onKeyUp = function(event)
	{
		//console.log(event);
		this.updateKeyMap(event, false);
	};

	this.updateKeyMap = function(event, state)
	{
		switch(event.keyCode){
			case this.KEY_LEFT  :
			case this.KEY_UP    :
			case this.KEY_RIGHT :
			case this.KEY_DOWN  :
			case this.KEY_JUMP  :
			case this.KEY_ACTION:
				this.keyMap[event.keyCode] = state;
				break;

			default:
				return;
		}
		event.preventDefault();
	};

	this.isKeyPressed = function(keyCode)
	{
		return (this.keyMap[keyCode] || false);
	};

	this.loadImage = function(src)
	{
		var image = new Image();
		image.src = src;
		return image;
	};

	this.loadJSON = function(url, success, error)
	{
		var request = new window.XMLHttpRequest();
		request.onreadystatechange = function(){
			if(request.readyState == 4){
				if(request.status == 200){
					success(JSON.parse(request.responseText));
					//success(eval('(' + request.responseText + ')'));
				}
				else if(error != undefined){
					error();
				}
			}
		};
		request.open('GET', url, true);
		request.send(null);
	};

	this.setImageTiles = function(tiles)
	{
		this.imageTiles = tiles;
	};

	this.setImageFont = function(font)
	{
		this.imageFont = font;
	};
	
	this.start = function()
	{
		if(this.timerFrame == undefined){
			console.log('start');
			this.updateContext();
			this.timerFrame = window.requestAnimationFrame(this.tick);
			//this.timerFrame = window.setInterval(this.update, 1000 / 12);
		}
	};

	this.stop = function()
	{
		if(this.timerFrame != undefined){
			console.log('stop');
			window.cancelAnimationFrame(this.timerFrame);
			//window.clearInterval(this.timerFrame);
			this.timerFrame = undefined;
		}
	};

	this.tick = function(tickTime) // tickTime = DOMHighResTimeStamp
	{
		var deltaTime = tickTime - (this.tickTime || tickTime);
		this.tickTime = tickTime;

		this.tickAccumulator += deltaTime;
		while(this.tickAccumulator >= this.tickStepSize){
			this.update(1 / this.tickStepSize);
			this.tickAccumulator -= this.tickStepSize;
		}

		this.renderFrame(1 / deltaTime);

		requestAnimationFrame(this.tick);
	};

	this.renderFrame = function(deltaTime)
	{
		this.canvasContext.save();
		this.canvasContext.scale(
			this.canvasElement.width  / this.engineWidth,
			this.canvasElement.height / this.engineHeight);
		
		this.canvasContext.clearRect(0, 0, this.engineWidth, this.engineHeight);

		/*if(this.debugEnabled){
			this.canvasContext.fillStyle = "#000000";
			this.canvasContext.fillRect(0, 0, this.engineWidth, this.engineHeight);
		}*/

		this.render(deltaTime);

		this.canvasContext.restore();
	};

	this.getTileWidth = function()
	{
		return this.tileWidth;
	};

	this.getTileHeight = function()
	{
		return this.tileHeight;
	};

	this.update = function(deltaTime)
	{
		// game update logic
	};

	this.render = function(deltaTime)
	{
		// game drawing logic
	};

	this.getContext = function()
	{
		return this.canvasContext;
	};
	
	this.renderString = function(string, x, y, size, color)
	{
		this.canvasContext.textBaseline = 'top';
		this.canvasContext.font = (size || 6) + 'px monospace';
		this.canvasContext.fillStyle = color || '#FFFFFF';
		this.canvasContext.fillText(string, x + 1, y);
	}

	this.renderTiles = function(col, row, tiles)
	{
		for(var dy = 0; dy < tiles.length; dy++){
			var tileRow = tiles[dy];
			for(var dx = 0; dx < tileRow.length; dx++){
				this.renderTile(col + dx, row + dy, tileRow[dx]);
			}
		}
	};

	this.renderTile = function(col, row, index)
	{
		this.renderTileXY(col * this.tileWidth, row * this.tileHeight, index);
	};

	this.renderTileXY = function(dx, dy, index)
	{
		if(index <= 0 || index == undefined) return;
		index--;
		var sx = ((index % this.tilesPerRow) | 0) * this.tileWidth;
		var sy = ((index / this.tilesPerRow) | 0) * this.tileHeight;
		this.canvasContext.drawImage(this.imageTiles, 
			sx, sy, this.tileWidth, this.tileHeight,
			dx, dy, this.tileWidth, this.tileHeight);
	};
});

var Sprite = Class.extend(function()
{
	this.positionX = 0;
	this.positionY = 0;

	this.animFrames = [];
	this.animIndex  = 0;

	
	this.constructor = function(x, y)
	{
		this.positionX = x | 0;
		this.positionY = y | 0;
	};

	this.setAnim = function(frames, index)
	{
		this.animFrames = frames;
		if(index != undefined){
			this.animIndex = index;
		}
	};

	this.getAnim = function()
	{
		return this.animFrames;
	};

	this.update = function(game, deltaTime)
	{
		this.animIndex = (++this.animIndex % this.animFrames.length);
	};

	this.render = function(game, deltaTime)
	{
		game.renderTileXY(this.positionX, this.positionY, 
			this.animFrames[this.animIndex]);
	};

	this.toString = function()
	{
		return '<' + 
			this.positionX.toString().padLeft(4) + ', ' + 
			this.positionY.toString().padLeft(4) + '>';
	}
});
