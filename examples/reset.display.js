var gpio = require('onoff').Gpio;
var Lcd = require('lcd'),
  lcd = new Lcd({
    rs: 12,
    e: 21,
    data: [5, 6, 17, 18],
    cols: 16,
    rows: 2
  });

var lcdLight = new gpio(4, 'out');
var ledErr = new gpio(24, 'out');
var ledOk = new gpio(25, 'out');

lcd.clear();
ledErr.writeSync(0);
ledOk.writeSync(0);
//  lcd.close();
  lcdLight.writeSync(0);
//  process.exit();
