# Raspberry Pi Alarm System (RPiAS)
This _Node JS_ application allow to manage automatic alarm system based on _Raspberry Pi_
computer powered by _Ubuntu Mate OS_ with camera and move detector. Application
record movie and send it to external server after move detection and also has
possibility to inform user about that detection by e-mail or sms. Also application
can handle some other devices like LCD display, LEDs and switches for some status
information and temperature with pressure measurement.

### Features
- Move detection
- Record movies (depend of camera type)
- Send movies to external server
- Build in diagnose system
- Display and switches for quick diagnose without console
- Display system statuses
- Temperature measurement
- Pressure measurement

### List of devices and technologies
- Raspberry Pi B+
- Ubuntu Mate OS
- Node JS 4.2
- Move detector `HC-SR501`
- 160 degree Camera HD Night Vision H
- Camera IR LED modules
- LCD display 2x16
- Green LED
- Red LED
- 3x Tact switch
- Resistors (2.2 kOhm, 2x 100 Ohm, 2x 10 kOhm)

### Connection schema

### Redis setup

Set data with keys:

- **illuminate_status** - false
- **illuminate_force_on** - false
- **illuminate_force_off** - false
- **illuminate_keep_alive** - false