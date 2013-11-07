Comeon
======

CommonJS module loader for browsers

Usage
-----

Link comeon.js to the page with `data-path` and `data-main` attributes that define where your modules are placed and which of them is the main respectively:

	<script src="http://rawgithub.com/avgaltsev/comeon/master/comeon.js" data-path="scripts/" data-main="main"></script>

Or do it without magic:

	<script src="http://rawgithub.com/avgaltsev/comeon/master/comeon.js"></script>
	
	<script>
		
		window.onload = function () {
			
			// Each instance of Comeon has its own path configuration and module cache
			var comeon = new Comeon("scripts/");
			
			// Entry point
			comeon.run("main");
			
			// Another entry point
			comeon.run("another-main");
			
		};
		
	</script>
