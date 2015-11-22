var gpio = require('onoff').Gpio;
var Lcd = require('lcd');
var startTime = new Date().getTime();
var ledErr = new gpio(24, 'out');
var ledOk = new gpio(25, 'out');
var buttonLight = new gpio(19, 'in', 'both');
var buttonDisp = new gpio(26, 'in', 'both');
var status = 0;
var dispStatus = 0;
var lcdLight = new gpio(4, 'out');
var int0;
var int1;
var int2;

try {
  startDisplay();

  ledErr.writeSync(0);
  ledOk.writeSync(1);
  lcdLight.writeSync(0);

  lcd.on('ready', function() {
    display();
  });
} catch (e) {
  ledOk.writeSync(0); 
  ledErr.writeSync(1); 
  console.log(e);
}

function light(err, state) {
  if (err) {
    console.log(err);
    ledOk.writeSync(0);  
    ledErr.writeSync(1);
  }

  if(state == 1) {
    if (status) {
      lcdLight.writeSync(0);
      status = 0;
    } else {
      lcdLight.writeSync(1);
      status = 1;
    }
  }
}

function display() {
  switch (dispStatus) {
    case 0:
      lcd.clear();

      int0 = setInterval(function() {
        lcd.setCursor(0, 0);
        lcd.print('status: ok');
        lcd.once('printed', function () {
          lcd.setCursor(0, 1);
          lcd.print(new Date().toString().substring(16, 24));
        });
      }, 1000);

      console.log(1);
      break;

    case 1:
      clearInterval(int0);
      lcd.clear();
      lcd.close();
      startDisplay();

      int1 = setInterval(function() {
        lcd.setCursor(0, 0);
        lcd.print('running time:');
        lcd.once('printed', function () {
          lcd.setCursor(0, 1);
             var currentTime = new Date().getTime();
             var calc = currentTime - startTime;
             var diff = new Date(calc);
             lcd.print((diff.getHours() -1) + ':' + diff.getMinutes() + ':' + diff.getSeconds());
        });
      }, 1000);

      console.log(2);
      break;

    case 2:
      clearInterval(int1);
      lcd.clear();
      lcd.close();
      startDisplay();

      int2 = setInterval(function() {
        lcd.setCursor(0, 0);
        lcd.print('some message :)'); 
      }, 1000);

      console.log(3);
      break;

    case 3:
      clearInterval(int2);
      lcd.clear();
      console.log(4);
      break;
  }
}

function disp(err, state) {
  if (err) {
    console.log(err);
    ledOk.writeSync(0); 
    ledErr.writeSync(1);
  }
  
  if(state == 1) {
    dispStatus++;

    if (dispStatus > 3) {
      dispStatus = 0;
    }

    display();
  } 
}

function startDisplay() {
  lcd = new Lcd({
    rs: 12,
    e: 21,
    data: [5, 6, 17, 18],
    cols: 16,
    rows: 2
  });
}

buttonLight.watch(light);
buttonDisp.watch(disp);
 
