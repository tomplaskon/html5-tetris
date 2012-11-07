html5-tetris
============

An HTML5 version of Tetris. Easy to use.

## Usage

Include the script in your HTML header:

	<head>
		<script src="tetris.js"></script
	</head>

Include a canvas element with an id:

	<canvas id="game_canvas" width="200" height="440"></canvas>

Call tetris.load() and pass in the canvas object:

	<body onload="tetris.load(document.getElementById('game_canvas'))">

And you're done. Have fun!

## Sample Code

See index.html for a working sample.