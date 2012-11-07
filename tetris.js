// define game constants
tetris = {
	grid_width: 10,
	grid_height: 22
}

// load a new game of Tetris to the canvas
tetris.load = function(canvas) {
	this.currentGame = new tetris.Game(canvas);
	
	document.body.onkeypress = this.currentGame.keyPressed;
}

// Game Class

tetris.Game = function(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.linesCleared = 0;
	
	this.grid = new tetris.Grid(this, tetris.grid_width, tetris.grid_height);
	
	this.start();
}

// start the game
tetris.Game.prototype.start = function() {
	this.currentShape = this.nextShape();
	this.draw();

	var game = this;
	this.gravityTimer = setInterval(function() { game.applyGravity() }, 1000);
}

// end the game
tetris.Game.prototype.over = function() {
	clearInterval(this.gravityTimer);
	this.draw();
	alert('Game Over! You cleared ' + this.linesCleared + ' lines.');
	tetris.load(this.canvas);
}

// draw the grid and the current shape to the canvas
tetris.Game.prototype.draw = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	
	this.grid.draw();
	this.currentShape.draw(this.grid);
}

// move the current shape down one line
tetris.Game.prototype.applyGravity = function() {
	var nextPositions = tetris.PositionHelper.translateDown(this.currentShape.positions);
	
	if (this.grid.arePositionsValid(nextPositions)) {
		// shape can move down without colliding
		this.currentShape.positions = nextPositions;
		this.currentShape.center.top++;
	} else {
		// shape has collided, turn it into debris and load the next shape
		this.grid.addPositionsAsDebris(this.currentShape.positions);
		this.removeLines();
		this.currentShape = this.nextShape();
		
		if (!this.grid.arePositionsValid(this.currentShape.positions)) {
			// newly added shape has collided, game over
			this.over();
		}
	}
	
	this.draw();
}

// remove full lines from the grid
tetris.Game.prototype.removeLines = function() {
	this.linesCleared += this.grid.removeLines();
}

// returns a random Shape object
tetris.Game.prototype.nextShape = function() {
	var shapes = [tetris.ShapeFactory.newIShape,
				tetris.ShapeFactory.newJShape,
				tetris.ShapeFactory.newLShape,
				tetris.ShapeFactory.newOShape,
				tetris.ShapeFactory.newZShape,
				tetris.ShapeFactory.newTShape,
				tetris.ShapeFactory.newSShape];
				
	var r = Math.floor(Math.random() * shapes.length);
	var s = new shapes[r](this);
	return s;
}

// move the current shape to the left one space
tetris.Game.prototype.moveLeft = function() {
	var nextPositions = tetris.PositionHelper.translateLeft(this.currentShape.positions);
	
	if (this.grid.arePositionsValid(nextPositions)) {
		this.currentShape.positions = nextPositions;
		this.currentShape.center.left--;
	}
	
	this.draw();
}

// move the current shape to the right one space
tetris.Game.prototype.moveRight = function() {
	var nextPositions = tetris.PositionHelper.translateRight(this.currentShape.positions);
	
	if (this.grid.arePositionsValid(nextPositions)) {
		this.currentShape.positions = nextPositions;
		this.currentShape.center.left++;		
	}
	
	this.draw();
}

// rotate the current shape
tetris.Game.prototype.rotate = function() {
	if (this.currentShape.rotate) {
		nextPositions = this.currentShape.rotate();
		
		if (this.grid.arePositionsValid(nextPositions)) {
			this.currentShape.positions = nextPositions;
			this.draw();
		} else {
			this.currentShape.orientation--;
			if (this.currentShape.orientation < 0) this.currentShape.orientation = 3;
		}
	}
}

// capture when keys are pressed and route to the proper handler
tetris.Game.prototype.keyPressed = function(e) {

    var evt = e || window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    
    //alert(charCode);
    
    switch (charCode) {
    	case 119:
    	case 87:
    		tetris.currentGame.rotate();
    		break;
        case 97:
        case 65:
        	tetris.currentGame.moveLeft();
            break;
        case 115:
        case 83:
        	tetris.currentGame.applyGravity();
            break;        
        case 100:
        case 68:    
        	tetris.currentGame.moveRight();
            break;
        
    }
}

// Grid Class
// Represents the grid the game is played on
tetris.Grid = function(game, w, h) {
	this.game  = game;
	this.width = w-1;
	this.height = h-1;
		
	this.blockWidth = game.canvas.width / tetris.grid_width;
	this.blockHeight = game.canvas.height / tetris.grid_height;	
		
	this.context = game.canvas.getContext('2d');
	
	// a grid of potential Block elements representing the debris of stopped shapes
	this.cells = new Array(tetris.grid_height);
	for (var i=0; i<this.cells.length; i++) {
		this.cells[i] = new Array(tetris.grid_width);
	}
} 

// returns true if the grid has a debris Block at that position
tetris.Grid.prototype.hasBlockAtPosition = function(position) {
	return this.cells[position.top][position.left] != undefined;
}

// draws a block onto the canvas at the specified position of specified color
tetris.Grid.prototype.drawBlockAtPosition = function(position, color) {
	// easel.js draw method
	/*var g = new createjs.Graphics();
	
	g.beginStroke('#000').beginFill(color).drawRect(
		position.left * this.blockWidth, 
		position.top * this.blockHeight,
		this.blockHeight,
		this.blockWidth).draw(this.context);*/
	
	// straight HTML5 draw method
	this.context.beginPath();
	this.context.rect(position.left * this.blockWidth,
					position.top * this.blockHeight,
					this.blockHeight,
					this.blockWidth);
	this.context.fillStyle = color;
	this.context.fill();
	this.context.lineWidth = 2;
	this.context.strokeStyle = 'black';
	this.context.stroke();		
}

// draws a Block object to the canvas
tetris.Grid.prototype.drawBlock = function(block) {
	this.drawBlockAtPosition(block, block.color);
}

// draws the grid to the canvas
tetris.Grid.prototype.draw = function() {
	for (var i=0; i<this.cells.length; i++) {
		for (var j=0; j<this.cells[i].length; j++) {
			var cell = this.cells[i][j];
			
			if (cell) {
				this.drawBlock(cell);
			}
		}
	}	
}

// determines if the array of positions are valid (i.e., within the
// the bounds of the board and not colliding with debris blocks)
tetris.Grid.prototype.arePositionsValid = function(positions) {
	for (var i=0; i<positions.length; i++) {
		var position = positions[i];
		
		if (position.top < 0 || position.top > this.height) {
			return false;
		}
		
		if (position.left < 0 || position.left > this.width) {
			return false;
		}
		
		if (this.hasBlockAtPosition(position)) {
			return false;
		}
	}
	
	return true;
}

// adds postions to the grid as static debris blocks
tetris.Grid.prototype.addPositionsAsDebris = function(positions) {
	for (var i=0; i<positions.length; i++) {
		var position = positions[i];
		
		this.cells[position.top][position.left] = new tetris.Block(position.left, position.top, 'gray');
	}
}

// removes full lines from the grid
tetris.Grid.prototype.removeLines = function() {
	var clearedLines = 0;
	for (var i=0; i<this.cells.length; i++) {
		var isFull = true;
		for (var j=0; j<this.cells[i].length; j++) {
			var cell = this.cells[i][j];
			
			if (!cell) {
				isFull = false;
			}
		}
		
		if (isFull) {
			clearedLines++;
			this.removeLine(i);
		}
	}
	
	return clearedLines;	
}

// removes the specified line from the grid
tetris.Grid.prototype.removeLine = function(lineNum) {	
	for (var i=lineNum; i>0; i--) {
		this.cells[i] = this.cells[i-1].slice();
		
		for (var j=0; j<this.cells[0].length; j++) {
			var cell = this.cells[i][j];
			if (cell) {
				cell.top++;
			}
		}
	}
	
	newRow = new Array(this.cells[0].length);
	this.cells[0] = newRow;	
}

// Shape Class
// Represents a moving shape
tetris.Shape = function() {
}

// draw the shape to the canvas
tetris.Shape.prototype.draw = function(grid) {
	for (var i=0; i<this.positions.length; i++) {
		grid.drawBlockAtPosition(this.positions[i], '#FFF');
	}
}

// Shape Factory "Class"
// instantiates the various Tetris shapes
tetris.ShapeFactory = {};
tetris.ShapeFactory.newOShape = function(game) {
	var square = new tetris.Shape();
	var m = Math.floor(game.grid.width / 2);
	square.positions = [new tetris.Position(m, 0), 
						new tetris.Position(m+1, 0),
						new tetris.Position(m, 1),
						new tetris.Position(m+1, 1)];
	square.center = new tetris.Position(m, 0);
			
	return square;
}

tetris.ShapeFactory.newIShape = function(game) {
	var ishape = new tetris.Shape();
	var m = Math.floor(game.grid.width / 2);
	ishape.center = new tetris.Position(m, 1);
	ishape.orientation = -1;
	
	ishape.rotate = function() {
		var c = this.center;
		this.orientation++;
		if (this.orientation > 3) this.orientation = 0;
		 
		switch (this.orientation) {
			case 0:
				return [new tetris.Position(c.left, c.top-1),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left, c.top+1),
						new tetris.Position(c.left, c.top+2)];
			case 1:
				return [new tetris.Position(c.left-2, c.top+1),
						new tetris.Position(c.left-1, c.top+1),
						new tetris.Position(c.left, c.top+1),
						new tetris.Position(c.left+1, c.top+1)];
			case 2:
				return [new tetris.Position(c.left-1, c.top-1),
						new tetris.Position(c.left-1, c.top),
						new tetris.Position(c.left-1, c.top+1),
						new tetris.Position(c.left-1, c.top+2)];
			case 3:
				return [new tetris.Position(c.left-2, c.top-1),
						new tetris.Position(c.left-1, c.top-1),
						new tetris.Position(c.left, c.top-1),
						new tetris.Position(c.left+1, c.top-1)];				
		}
	}
	
	ishape.positions = ishape.rotate();
	
	return ishape;
}

tetris.ShapeFactory.newJShape = function(game) {
	var jshape = new tetris.Shape();
	var m = Math.floor(game.grid.width / 2);
	jshape.center = new tetris.Position(m, 1);
	jshape.orientation = -1;
					
	jshape.rotate = function() {
		var c = this.center;
		this.orientation++;
		if (this.orientation > 3) this.orientation = 0;
		 
		switch (this.orientation) {
			case 0:
				return [new tetris.Position(c.left, c.top-1),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left, c.top+1),
						new tetris.Position(c.left-1, c.top+1)];
			case 1:
				return [new tetris.Position(c.left-1, c.top-1),
						new tetris.Position(c.left-1, c.top),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left+1, c.top)];
			case 2:
				return [new tetris.Position(c.left, c.top-1),
						new tetris.Position(c.left+1, c.top-1),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left, c.top+1)];
			case 3:
				return [new tetris.Position(c.left-1, c.top),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left+1, c.top),
						new tetris.Position(c.left+1, c.top+1)];
		}
	}
	
	jshape.positions = jshape.rotate();
					
	return jshape;	
}

tetris.ShapeFactory.newLShape = function(game) {
	var lshape = new tetris.Shape();
	var m = Math.floor(game.grid.width / 2);
	lshape.center = new tetris.Position(m, 1);
	lshape.orientation = -1;
	
	lshape.rotate = function() {
		var c = this.center;
		this.orientation++;
		if (this.orientation > 3) this.orientation = 0;
		 
		switch (this.orientation) {
			case 0:	
				return [new tetris.Position(c.left, c.top-1),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left, c.top+1),
						new tetris.Position(c.left+1, c.top+1)];
			case 1:
				return [new tetris.Position(c.left-1, c.top),
						new tetris.Position(c.left-1, c.top+1),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left+1, c.top)];
			case 2:
				return [new tetris.Position(c.left-1, c.top-1),
						new tetris.Position(c.left, c.top-1),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left, c.top+1)];
			case 3:
				return [new tetris.Position(c.left-1, c.top),
						new tetris.Position(c.left, c.top),
						new tetris.Position(c.left+1, c.top),
						new tetris.Position(c.left+1, c.top-1)];
		}
	}
	
	lshape.positions = lshape.rotate();
					
	return lshape;	
}

tetris.ShapeFactory.newZShape = function(game) {
	var zshape = new tetris.Shape();
	var m = Math.floor(game.grid.width / 2);
	zshape.center = new tetris.Position(m, 0);
	zshape.orientation = -1;
	
	zshape.rotate = function() {
		var c = this.center;
		this.orientation++;
		if (this.orientation > 3) this.orientation = 0;
		 
		switch (this.orientation) {
			case 0:	
			return [new tetris.Position(c.left-1, c.top),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left, c.top+1),
					new tetris.Position(c.left+1, c.top+1)];
			case 1:
			return [new tetris.Position(c.left, c.top-1),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left-1, c.top),
					new tetris.Position(c.left-1, c.top+1)];
			case 2:
			return [new tetris.Position(c.left-1, c.top-1),
					new tetris.Position(c.left, c.top-1),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left+1, c.top)];
			case 3:
			return [new tetris.Position(c.left+1, c.top-1),
					new tetris.Position(c.left+1, c.top),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left, c.top+1)];
		}
	}	
	
	zshape.positions = zshape.rotate();	
				
	return zshape;	
}

tetris.ShapeFactory.newTShape = function(game) {
	var tshape = new tetris.Shape();
	var m = Math.floor(game.grid.width / 2);
	tshape.orientation = -1;
	tshape.center = new tetris.Position(m, 1);
				
	tshape.rotate = function() {
		var c = this.center;
		this.orientation++;
		if (this.orientation > 3) this.orientation = 0;
		 
		switch (this.orientation) {
			case 0:
			return [new tetris.Position(c.left, c.top-1),
					new tetris.Position(c.left-1, c.top),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left+1, c.top)];
			case 1:
			return [new tetris.Position(c.left, c.top-1),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left+1, c.top),
					new tetris.Position(c.left, c.top+1)];
			case 2:
			return [new tetris.Position(c.left-1, c.top),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left+1, c.top),
					new tetris.Position(c.left, c.top+1)];
			case 3:
			return [new tetris.Position(c.left, c.top-1),
					new tetris.Position(c.left-1, c.top),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left, c.top+1)];
		}
	}
	
	tshape.positions = tshape.rotate();	
		
	return tshape;	
}

tetris.ShapeFactory.newSShape = function(game) {
	var sshape = new tetris.Shape();
	var m = Math.floor(game.grid.width / 2);
	sshape.orientation = -1;
	sshape.center = new tetris.Position(m, 1);
	
	sshape.rotate = function() {
		var c = this.center;
		this.orientation++;
		if (this.orientation > 3) this.orientation = 0;
		 
		switch (this.orientation) {
			case 0:
			return [new tetris.Position(c.left-1, c.top),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left, c.top-1),
					new tetris.Position(c.left+1, c.top-1)];
			case 1:
			return [new tetris.Position(c.left, c.top-1),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left+1, c.top),
					new tetris.Position(c.left+1, c.top+1)];
			case 2:
			return [new tetris.Position(c.left-1, c.top+1),
					new tetris.Position(c.left, c.top+1),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left+1, c.top)];
			case 3:
			return [new tetris.Position(c.left-1, c.top-1),
					new tetris.Position(c.left-1, c.top),
					new tetris.Position(c.left, c.top),
					new tetris.Position(c.left, c.top+1)];
		}
	}
	
	sshape.positions = sshape.rotate();	
						
	return sshape;	
}


// Position Class
// Represents a position on the Tetris grid
tetris.Position = function(left, top) {
	this.top = top;
	this.left = left;
}

// Position Helper "Class"
// Helps manipulate arrays of positions
tetris.PositionHelper = {};

// returns an array of new positions which have been translated down one space
tetris.PositionHelper.translateDown = function(positions) {
	var nextPositions = [];
	for (var i=0; i<positions.length; i++) {
		nextPositions.push(new tetris.Position(positions[i].left, positions[i].top+1));
	}
	
	return nextPositions;
}

// returns an array of new positions which have been translated left one space
tetris.PositionHelper.translateLeft = function(positions) {
	var nextPositions = [];
	for (var i=0; i<positions.length; i++) {
		nextPositions.push(new tetris.Position(positions[i].left-1, positions[i].top));
	}
	
	return nextPositions;
}


// returns an array of new positions which have been translated right one space
tetris.PositionHelper.translateRight = function(positions) {
	var nextPositions = [];
	for (var i=0; i<positions.length; i++) {
		nextPositions.push(new tetris.Position(positions[i].left+1, positions[i].top));
	}
	
	return nextPositions;
}


// Block Class
// Represents a Tetris debris block
tetris.Block = function(left, top, color) {
	this.left = left;
	this.top = top;
	this.color = color;
}