var gpio = require('onoff').Gpio;

var pin5 = new gpio(5, 'out');
var pin6 = new gpio(6, 'out');
var pin12 = new gpio(12, 'out');
var pin13 = new gpio(13, 'out');

pin5.writeSync(1); 
pin6.writeSync(1); 
pin12.writeSync(1); 
pin13.writeSync(1); 

