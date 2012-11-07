html5-tetris
============

An HTML5 version of Tetris. Easy to use.

Usage
=====
1. include the script in your HTML header:

<head>
  <script src="tetris.js"></script>
</head>

2. include a canvas element with an id:

<canvas id="game_canvas" width="200" height="440"></canvas>

3. call tetris.load() and pass in the canvas object:

<body onload="tetris.load(document.getElementById('game_canvas'))">

4. You're done. Have fun!

Sample Code
===========

See index.html for a working sample.