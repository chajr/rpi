'use strict';

module.exports = class Iluminator
{
    constructor (config, redis, pinNumber) {
        this.statusObject = {};
        this.config = config;
        this.redis = redis;
        this.pinNumber = pinNumber;

        this.turnOn = [];
        this.minTime = [];
        this.maxTime = [];
    }

    calculateTimes (date, sunCalc, launched, force) {
        this.getRedisData('minimal_time', this.pinNumber);
        this.getRedisData('turn_on', this.pinNumber);
        this.getRedisData('shut_down_time', this.pinNumber);

        this.force = force;
        this.sunCalc = sunCalc;
        this.launched = launched;
        this.date = date;

        this.currentTime = this.date.getTime();

        this.date.setMinutes(this.turnOn[1]);
        this.date.setHours(this.turnOn[0]);

        this.onTime = this.date.getTime();

        this.date.setMinutes(this.minTime[1]);
        this.date.setHours(this.minTime[0]);

        this.minimalTime = this.date.getTime();

        this.date.setMinutes(this.maxTime[1]);
        this.date.setHours(this.maxTime[0]);

        this.offTime = this.date.getTime();

        this.sunsetTime = this.sunCalc.sunset.getTime();
        this.isSpecial = this.isSpecialDay();

        this.downBorder = this.onTime;

        return this;
    }

    calculateRange () {
        if (this.sunsetTime < this.onTime && this.sunsetTime < this.minimalTime) {
            if (this.isSpecial) {
                this.downBorder = this.sunsetTime;
            } else {
                this.downBorder = this.onTime;
            }
        }

        if (this.sunsetTime >= this.onTime && this.sunsetTime < this.minimalTime) {
            this.downBorder = this.sunsetTime;
        }

        if (this.sunsetTime >= this.minimalTime && this.sunsetTime < this.offTime) {
            this.downBorder = this.minimalTime;
        }

        this.shouldTurnLightOn = this.downBorder <= this.currentTime && this.currentTime <= this.offTime;

        return this;
    }

    static convertDate (date) {
        if (typeof date === 'number') {
            date = new Date(date);
        }

        return date.getHours()
            + ':'
            + date.getMinutes()
            + ':'
            + date.getSeconds()
            + ' '
            + date.getDate()
            + '-'
            + (date.getMonth() +1)
            + '-'
            + date.getFullYear();
    }

    prepareLog () {
        let logData = {};

        logData.sunsetTimeRaw = this.sunCalc.sunset;
        logData.sunsetTime = Iluminator.convertDate(this.sunCalc.sunset);
        logData.isSpecial = this.isSpecial;
        logData.currentTimeRaw = this.currentTime;
        logData.currentTime = Iluminator.convertDate(this.currentTime);
        logData.onTimeRaw = this.onTime;
        logData.onTime = Iluminator.convertDate(this.onTime);
        logData.minimalTimeRaw = this.minimalTime;
        logData.minimalTime = Iluminator.convertDate(this.minimalTime);
        logData.offTimeRaw = this.offTime;
        logData.offTime = Iluminator.convertDate(this.offTime);
        logData.downBorderRaw = this.downBorder;
        logData.downBorder = Iluminator.convertDate(this.downBorder);
        logData.shouldTurnLightOn = this.shouldTurnLightOn;
        logData.force = this.force;
        logData.launched = this.launched;
        logData.turnOn = this.turnOn;
        logData.minTime = this.minTime;
        logData.maxTime = this.maxTime;
        logData.pinNumber = this.pinNumber;

        return logData;
    }

    turnLightOn () {
        if (this.force === 'on') {
            return true;
        }

        if (this.force === 'off') {
            return false;
        }

        if (!this.launched) {
            return this.shouldTurnLightOn;
        }

        return false;
    }

    static xor (a, b) {
        return (a || b) && !(a && b);
    }

    turnLightOff () {
        if (this.force === 'on') {
            return false;
        }

        if (this.force === 'off') {
            return true;
        }

        if (this.launched) {
            return !this.shouldTurnLightOn;
        }

        return false;
    }

    isSpecialDay () {
        if (this.date.getDay() % 6 === 0) {
            return true;
        }

        let day = this.date.getDate();
        let month = this.date.getMonth() +1;
        let special = this.config.get('illuminate_special.' + month);

        if (typeof(special) !== "undefined") {
            return special.indexOf(day) >= 0;
        }

        return false;
    }

    getRedisData (status, pinNumber) {
        this.redis.getData('illuminate_' + status + '_' + pinNumber, (data) => {
            if (data) {
                switch (status) {
                    case 'minimal_time':
                        this.turnOn = data.split(':');
                        break;

                    case 'turn_on':
                        this.minTime = data.split(':');
                        break;

                    case 'shut_down_time':
                        this.maxTime = data.split(':');
                        break;
                }
            }
        });
    }
};
