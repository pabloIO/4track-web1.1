'use strict';
 let trackController = {
 	track: function(coords){
 		console.log(coords);
 		io.emit('tracking', coords);
 	}
 };

 module.exports = trackController; 