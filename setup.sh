#!/bin/bash

USER = $1;

redis-cli set rpia_illuminate_status false
redis-cli set rpia_illuminate_force_on false
redis-cli set rpia_illuminate_force_off false
redis-cli set rpia_illuminate_keep_alive false
redis-cli set rpia_illuminate_light_1 false
redis-cli set rpia_illuminate_light_2 false
redis-cli set rpia_alert_armed false
redis-cli set rpia_sms_send false
redis-cli set rpia_error_led false
redis-cli set rpia_lcd_light false
redis-cli set rpia_lcd_message_0 ""
redis-cli set rpia_lcd_message_1 ""
redis-cli set rpia_alert_led false
redis-cli expire rpia_sms_send 900

sudo touch /var/log/rpi-mc-system.log
sudo touch /var/log/rpi-mc-autoIlluminate.log
sudo touch /var/log/rpi-a-display.log
sudo touch /var/log/rpi-mc-server.log
sudo touch /var/log/rpi-error-led.log
sudo touch /var/log/rpi-commandConsummer.log
sudo touch /var/log/rpi-executor.log
sudo touch /var/log/rpi-a-alert.log
sudo chown $USER:$USER /var/log/rpi-mc-system.log
sudo chown $USER:$USER /var/log/rpi-mc-server.log
sudo chown $USER:$USER /var/log/rpi-a-display.log
sudo chown $USER:$USER /var/log/rpi-mc-autoIlluminate.log
sudo chown $USER:$USER /var/log/rpi-error-led.log
sudo chown $USER:$USER /var/log/rpi-commandConsummer.log
sudo chown $USER:$USER /var/log/rpi-executor.log
sudo chown $USER:$USER /var/log/rpi-a-alert.log

sudo touch /etc/init.d/rpi-mc.sh
sudo chmod +x /etc/init.d/rpi-mc.sh
sudo update-rc.d rpi-mc.sh start

chmod 0777 var/log
ln -s ~/config.json etc/config.json

npm install
