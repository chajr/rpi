var gpio = require('onoff').Gpio;

var detector = new gpio(21, 'in', 'both');
var counter = 0;

function light(err, state) {
    if (err) {
        console.log(err);
    }

    if (state == 1) {
        console.log('move detected: ' + ++counter);
        console.log("\n");
    } else {
        console.log('no move');
        console.log("\n");
    }
}

detector.watch(light);
