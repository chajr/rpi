#!/bin/bash

redis-cli set rpia_illuminate_status false
redis-cli set rpia_illuminate_force_on false
redis-cli set rpia_illuminate_force_off false
redis-cli set rpia_illuminate_keep_alive false
redis-cli set rpia_illuminate_light_1 false
redis-cli set rpia_illuminate_light_2 false
redis-cli set rpia_alert_armed false
redis-cli set rpia_sms_send false
redis-cli expire rpia_sms_send 900
