(function (){
	window.performance = (window.performance || {});

	window.performance.now = (function(){
		return (
			window.performance.now ||
			window.performance.webkitNow ||
			window.performance.msNow ||
			window.performance.mozNow ||
			window.performance.oNow ||
			Date.now ||
			function(){
				return +new Date();
			}
		);
	})();

	window.requestAnimationFrame = (function(){
		return (
			window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			function(callback){
				return setTimeout(function(){
					var time = window.performance.now();
					callback(time);
				}, 16);
			}
		);
	})();

	window.cancelAnimationFrame = (function(){
		return (
			window.cancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.msCancelAnimationFrame ||
			window.oCancelAnimationFrame ||
			function(id){
				clearTimeout(id);
			}
		);
	})();
})();
