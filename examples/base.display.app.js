var gpio = require('onoff').Gpio;
var Lcd = require('lcd'),
  lcd = new Lcd({
    rs: 20,
    e: 16,
    data: [17, 25, 24, 23],
    cols: 8,
    rows: 2
  });

lcd.on('ready', function() {
  var led = new gpio(13, 'out');
  led.writeSync(1);

  setInterval(function() {
    lcd.setCursor(0, 0);
    lcd.print('kocham cie :*');
    lcd.once('printed', function () {
      lcd.setCursor(0, 1);
      lcd.print(new Date().toString().substring(16, 24));
    });
    console.log(new Date().toString().substring(16, 24));
  }, 1000);
});

// If ctrl+c is hit, free resources and exit.
//process.on('SIGINT', function() {
process.on('SIGILL', function() {
  lcd.clear();
  lcd.close();
  process.exit();
  led.writeSync(0);
});
