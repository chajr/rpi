var gpio = require('onoff').Gpio;

var pin5 = new gpio(5, 'out');
var pin6 = new gpio(6, 'out');
var pin12 = new gpio(12, 'out');
var pin13 = new gpio(13, 'out');
var pinVal = 0;
var args = process.argv.slice(2);

if (args[0] === 'on') {
    pinVal = 1;
}

pin5.writeSync(pinVal);
pin6.writeSync(pinVal);
pin12.writeSync(pinVal);
pin13.writeSync(pinVal);

console.log('Pin set to: ' + pinVal);
