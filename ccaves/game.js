var Game = Engine.extend(function()
{
	this.level  = undefined;
	this.player = undefined;

	this.camera = [0, 0];

	this.constructor = function()
	{
		this.uber(320, 200, 2.90);
		this.debugEnabled = true;
		this.setImageTiles(this.loadImage('graphics/cc1-tiles.png'));
		this.loadJSON('maps/map01.json'/*e1l04.json*/, this.levelLoaded);
		this.start();
	};

	this.levelLoaded = function(response)
	{
		//console.log(response);
		this.level  = response;
		this.player = new Player(
			this.level.player[0] * this.getTileWidth(), 
			this.level.player[1] * this.getTileHeight());
	};

	this.update = function(deltaTime)
	{
		if(this.player != undefined){
			this.player.update(this, deltaTime);

			var minScrollX = (320 / 2 - 16);
			var maxScrollX = (320 / 2 + 16);
			if((this.player.positionX + this.camera[0]) < minScrollX){
				this.camera[0] = minScrollX - this.player.positionX;
			}
			else if((this.player.positionX + this.camera[0]) > maxScrollX){
				this.camera[0] = maxScrollX - this.player.positionX;
			}
			this.camera[0] = Math.max(-320, Math.min(this.camera[0], 0));

			var minScrollY = (200 / 2 - 16);
			var maxScrollY = (200 / 2 + 16);
			if((this.player.positionY + this.camera[1]) < minScrollY){
				this.camera[1] = minScrollY - this.player.positionY;
			}
			else if((this.player.positionY + this.camera[1]) > maxScrollY){
				this.camera[1] = maxScrollY - this.player.positionY;
			}
			this.camera[1] = Math.max(-200, Math.min(this.camera[1], 0));
		}

		this.uber.update(deltaTime);
	};

	this.render = function(deltaTime)
	{
		var context = this.getContext();
		context.save();

		context.translate(this.camera[0], this.camera[1]);

		if(this.level != undefined){
			for(var layer = 0; layer < this.level.data.length; layer++){
				this.renderTiles(0, 0, this.level.data[layer]);
				if(layer == 2){
					if(this.player != undefined){
						this.player.render(this, deltaTime);
					}
				}
			}
		}
		
		//this.renderTile(8, 4, 260);

		/*var tiles = [
			[  0, 738, 739,   0],
			[741, 742, 743, 744],
		];
		this.renderTiles(28, 3, tiles);*/

		if(this.debugEnabled && this.level != undefined){
			context.beginPath();
			var tileWidth  =  game.getTileWidth();
			var tileHeight =  game.getTileHeight();
			var width  = this.level.width  * tileWidth;
			var height = this.level.height * tileHeight;
			for(var y = 0; y < height; y += tileWidth){
				context.moveTo(0, y);
				context.lineTo(width, y);
			}
			for(var x = 0; x < width; x += tileHeight){
				context.moveTo(x, 0);
				context.lineTo(x, height);
			}
			context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
			context.lineWidth   = 0.5;
			context.stroke();
			for(var row = 0; row < this.level.height; row++){
				for(var col = 0; col < this.level.width; col++){
					var tile = col + 'x' + row;
					this.renderString(tile, 
						col * tileWidth,
						row * tileHeight, 4, 'rgba(255, 204, 255, 0.9)');
				}
			}
		}

		context.restore();

		if(this.debugEnabled && this.player != undefined){
			var playerDebug = this.player.toString();
			var context = this.getContext();
			var textMet = context.measureText(playerDebug);
			context.fillStyle = '#000000';
			context.fillRect(0, 4, textMet.width, 8);
			this.renderString(playerDebug, 0, 4);//, this.level]);
		}

		this.uber.render(deltaTime);
	};
});

var Rect = Class.extend(function(){

	this.color  = '#FF0000';

	this.left   = 0;
	this.top    = 0;
	this.right  = 0;
	this.bottom = 0;

	this.constructor = function(left, top, right, bottom)
	{
		this.left   = left   || 0;
		this.top    = top    || 0;
		this.right  = right  || 0;
		this.bottom = bottom || 0;
	};

	this.render = function(game)
	{
		var context = game.getContext();
		context.strokeStyle = this.color;
		context.lineWidth   = 0.5;
		context.strokeRect(
			this.left, this.top, 
			(this.right  - this.left),
			(this.bottom - this.top));
	};

	this.toString = function()
	{
		return '[' + this.left + ', ' + this.top + ', ' + 
			this.right + ', ' + this.bottom + ']';
	};
});

var Player = Sprite.extend(function()
{
	var GRAVITY = 32;

	var animStillRight = [261];
	var animWalkRight  = [262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272];
	var animStillLeft  = [273];
	var animWalkLeft   = [274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284];
	var animJumpRight  = [285];
	var animJumpLeft   = [286];
	var animShootRight = [287];
	var animShootLeft  = [288];

	this.velX		= 0;
	this.velY		= 0;
	this.isJumping	= false;

	this.collided   = false;

	this.playerBounds = new Rect();

	this.debug = '';


	this.constructor = function(x, y)
	{
		this.uber(x, y);
		this.setAnim(animStillRight, 0);
	};

	this.update = function(game, deltaTime)
	{
		this.debug = '';

		if(game.isKeyPressed(game.KEY_JUMP)){
			if(!this.isJumping){
				this.isJumping = true;
				this.velY = -400;
			}
		}
		if(game.isKeyPressed(game.KEY_LEFT)){
			this.setAnim(this.isJumping ? animJumpLeft : animWalkLeft);
			this.velX = Math.min(0, Math.max(this.velX - 32, -192));
		}
		else if(game.isKeyPressed(game.KEY_RIGHT)){
			this.setAnim(this.isJumping ? animJumpRight : animWalkRight);
			this.velX = Math.max(0, Math.min(this.velX + 32,  192));
		}
		else if(!this.isJumping){
			var anim = this.getAnim();
			if(anim == animWalkLeft || anim == animJumpLeft){
				this.setAnim(animStillLeft, 0);
				this.velX = 0;
			}else if(anim == animWalkRight || anim == animJumpRight){
				this.setAnim(animStillRight, 0);
				this.velX = 0;
			}
		}
		
		this.velY += GRAVITY;

		var dx = (this.velX * deltaTime) | 0;
		var dy = (this.velY * deltaTime) | 0;

		var tileWidth    = game.getTileWidth();
		var tileHeight   = game.getTileHeight();

		this.playerBounds.left   = this.positionX + dx;
		this.playerBounds.top    = this.positionY + dy;
		this.playerBounds.right  = this.positionX + dx + tileWidth;
		this.playerBounds.bottom = this.positionY + dy + tileHeight;
		
		var leftTile   = ((this.playerBounds.left   / tileWidth) | 0);
		var rightTile  = ((this.playerBounds.right  / tileWidth) | 0);
		var topTile    = ((this.playerBounds.top    / tileHeight) | 0);
		var bottomTile = ((this.playerBounds.bottom / tileHeight) | 0);

		this.debug += ' ' + 
			leftTile  + 'x' + topTile + ':' + 
			rightTile + 'x' + bottomTile;

		var obstacles = game.level.data[2];

		this.collided = false;

		if(this.velX != 0){
			var tileHorz = (this.velX < 0 ? leftTile : rightTile);
			for(var tileVert = topTile; tileVert < bottomTile; tileVert++){
				if(obstacles[tileVert][tileHorz] != 0){
					if(this.velX < 0){
						dx -= this.playerBounds.left  - ((tileHorz + 1) * tileWidth);
					}else{
						dx -= this.playerBounds.right - (tileHorz * tileWidth);
					}
					this.velX = 0;
					this.collided = true;
				}
			}
		}
		if(this.velY != 0){
			var tileVert = (this.velY < 0 ? topTile : bottomTile);
			for(var tileHorz = leftTile; tileHorz <= rightTile; tileHorz++){
				if(obstacles[tileVert][tileHorz] != 0){
					if(this.velY < 0){
						dy += this.playerBounds.top    - (tileVert * tileHeight);
					}else{
						dy -= this.playerBounds.bottom - (tileVert * tileHeight);
					}
					this.velY = 0;
					if(this.isJumping){
						this.isJumping = false;
					}
					this.collided = true;
					break;
				}
			}
		}
		this.debug += ' ' + this.playerBounds.toString();
		this.debug += ' ' + this.collided.toString().padRight(5);
		this.debug += ' ' + this.isJumping.toString().padRight(5);

		// dont fall of the bottom of the map (debug only)
		if(this.positionY + dy > (400 - 48)){
			dy -= ((this.positionY + dy) - (400 - 48));
			this.velY = 0;
			if(this.isJumping){
				this.isJumping = false;
			}
		}

		this.positionX += dx;
		this.positionY += dy;

		this.playerBounds.left   = this.positionX;
		this.playerBounds.top    = this.positionY;
		this.playerBounds.right  = this.positionX + tileWidth - 1;
		this.playerBounds.bottom = this.positionY + tileHeight;
		
		this.uber.update(game, deltaTime);
	};

	this.render = function(game)
	{
		this.uber.render(game);
		this.playerBounds.render(game);
	};

	this.tileToPixel = function(game, pos)
	{
		return (pos / game.getTileHeight()) | 0;
	};

	this.toString = function()
	{
		return '[Player' + this.uber.toString() + 
			'{' + 
				this.velX.toString().padLeft(4) + ',' + 
				this.velY.toString().padLeft(4) + '}' +
				this.debug + ']';
	};
});
