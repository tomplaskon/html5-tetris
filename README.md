html5-tetris
============

An HTML5 version of Tetris. Easy to use.

Usage
=====
1.  include the script in your HTML header:

	&lt;head&gt;
		&lt;script src="tetris.js"&gt;&lt;/script&gt;
	&lt;/head&gt;

2. include a canvas element with an id:

	&lt;canvas id="game_canvas" width="200" height="440"&gt;&lt;/canvas&gt;

3. call tetris.load() and pass in the canvas object:

	&lt;body onload="tetris.load(document.getElementById('game_canvas'))"&gt;

4. You're done. Have fun!

Sample Code
===========

See index.html for a working sample.