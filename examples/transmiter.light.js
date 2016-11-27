var args = process.argv.slice(2);
console.log(args[0]);

try {
    var gpio = require('onoff').Gpio;
    var led = new gpio(17, 'out');
    if (args[0] === 'off') {
        var led2 = new gpio(17, 'in');
    }

    led.writeSync(1);
    console.log(led);
} catch(err) {

}
