var gpio = require('onoff').Gpio;
var led = new gpio(13, 'out');
var button = new gpio(5, 'in', 'both');
var status = 0;
var date;
var time = 0;
var currentState = 0;

led.writeSync(status);
//led.writeSync(1);

function light(err, state) {
    if (err) { 
        console.log(err); 
    }

    console.log('state: ' + state);
    console.log('status: ' + status);

    if(state == 1) {
        date = new Date;
        currentState = date.getTime();

        console.log('current state: ' + currentState);
        console.log('time: ' + time);
        if (currentState < time +500) {
            console.log('time mismatch');
            return;
        }

        if (status) {
            led.writeSync(0);
            status = 0;
        } else {
            led.writeSync(1);
            status = 1;
        }

        date = new Date;
        time = date.getTime();
    }

    console.log('current state: ' + currentState);
    console.log('time: ' + time);
    console.log('status: ' + status);
    console.log('------');
}

button.watch(light);
