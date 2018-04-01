#!/bin/bash

USER=$1; 

redis-cli set rpia_illuminate_status_1 false
redis-cli set rpia_illuminate_status_2 false
redis-cli set rpia_illuminate_status_3 false
redis-cli set rpia_illuminate_force null
redis-cli set rpia_illuminate_light_1 false
redis-cli set rpia_illuminate_light_2 false
redis-cli set rpia_illuminate_light_3 false
redis-cli set rpia_illuminate_minimal_time_1 19:00
redis-cli set rpia_illuminate_turn_on_1 17:30
redis-cli set rpia_illuminate_shut_down_time_1 22:10
redis-cli set rpia_illuminate_minimal_time_2 19:00
redis-cli set rpia_illuminate_turn_on_2 17:30
redis-cli set rpia_illuminate_shut_down_time_2 22:10
redis-cli set rpia_illuminate_minimal_time_3 19:00
redis-cli set rpia_illuminate_turn_on_3 17:30
redis-cli set rpia_illuminate_shut_down_time_3 22:10
redis-cli set rpia_alert_armed false
redis-cli set rpia_sms_send false
redis-cli set rpia_error_led false
redis-cli set rpia_lcd_light false
redis-cli set rpia_lcd_message_0 ""
redis-cli set rpia_lcd_message_1 ""
#expire 15 min
redis-cli expire rpia_sms_send 900

sudo touch /var/log/rpi-mc-system.log
sudo touch /var/log/rpi-mc-autoIlluminateNg.log
sudo touch /var/log/rpi-mc-server.log
sudo touch /var/log/rpi-a-display.log
sudo touch /var/log/rpi-mc-light.log
sudo touch /var/log/rpi-error-led.log
sudo touch /var/log/rpi-commandConsummer.log
sudo touch /var/log/rpi-executor.log
sudo touch /var/log/rpi-a-alert.log
sudo touch /var/log/rpi-a-lcd.log
sudo touch /var/log/rpi-logCompressor.log
sudo chown $USER:$USER /var/log/rpi-mc-system.log
sudo chown $USER:$USER /var/log/rpi-mc-server.log
sudo chown $USER:$USER /var/log/rpi-a-display.log
sudo chown $USER:$USER /var/log/rpi-mc-autoIlluminateNg.log
sudo chown $USER:$USER /var/log/rpi-mc-light.log
sudo chown $USER:$USER /var/log/rpi-error-led.log
sudo chown $USER:$USER /var/log/rpi-commandConsummer.log
sudo chown $USER:$USER /var/log/rpi-executor.log
sudo chown $USER:$USER /var/log/rpi-a-alert.log
sudo chown $USER:$USER /var/log/rpi-a-lcd.log
sudo chown $USER:$USER /var/log/rpi-logCompressor.log

sudo touch /etc/init.d/rpi-mc.sh
sudo chmod +x /etc/init.d/rpi-mc.sh
sudo update-rc.d rpi-mc.sh start

chmod 0777 var/log
ln -s ~/config.json etc/config.json

npm install

rsync -vrtq --log-file=/var/log/rpi-a-img.log RPiAS_directory/var/img/* user@host:~/path;
