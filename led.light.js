var gpio = require('onoff').Gpio;


var led = new gpio(26, 'out');
var button = new gpio(19, 'in', 'both');
var status = 0;
led.writeSync(status);
//led.writeSync(1);
function light(err, state) {
  if (err) { 
    console.log(err); 
  }

  console.log(state);
  console.log(status);
  console.log('------');

  if(state == 1) {
    if (status) {
      led.writeSync(0);
      status = 0;
    } else {
      led.writeSync(1);
      status = 1;
    }
  }  
}
 
button.watch(light);


/*
var led = new gpio(26, 'out');
var button = new gpio(19, 'in', 'both');
button.watch(function(err, value) {
	if (value == 1) {
		console.log('button on');
	} else {
		console.log('button off');
	}
	led.writeSync(value);
});
*/




