# Raspberry Pi Alarm System (RPiAS)
This _Node JS_ application allow to manage automatic alarm system based on _Raspberry Pi_
computer powered by _Ubuntu Mate OS_ with camera and move detector. Application
record movie and send it to external server after move detection and also has
possibility to inform user about that detection by e-mail or sms. Also application
can handle some other devices like LCD display, LEDs and switches for some status
information and temperature with pressure measurement.

## Features
- Move detection
- Record movies (depend of camera type)
- Send movies to external server
- Build in diagnose system
- Display and switches for quick diagnose without console
- Display system statuses
- Temperature measurement
- Pressure measurement

## List of devices and technologies
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

## Connection schema

## Application setup

### Set Redis with keys:

- **rpia_illuminate_status** - false
- **rpia_illuminate_force_on** - false
- **rpia_illuminate_force_off** - false
- **rpia_illuminate_keep_alive** - false
- **rpia_illuminate_light_1** - false
- **rpia_illuminate_light_2** - false
- **rpia_alert_armed** - false
- **rpia_sms_send** - false (life for 15 min)

### Process setup:
sudo forever start -d /path/app.js system >> /var/log/rpi-mc-system.log
sudo forever start -d /path/app.js autoIlluminate >> /var/log/rpi-mc-autoIlluminate.log
sudo forever start -d /path/app.js display >> /var/log/rpi-a-display.log
sudo forever start -d /path/server.js >> /var/log/rpi-mc-server.log

rsync -vrpogthlq ~/RPiAS/var/img/*.jpg username@remote_host:destination_directory
