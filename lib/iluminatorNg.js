'use strict';

module.exports = class Iluminator
{
    constructor (config) {
        this.statusObject = {};
        this.config = config;

        this.turnOn = this.config.get('workers.autoIlluminate.turnOn').split(':');
        this.minTime = this.config.get('workers.autoIlluminate.minimalTime').split(':');
        this.maxTime = this.config.get('workers.autoIlluminate.shutDownTime').split(':');
    }

    calculateTimes (date, sunCalc, launched, force) {
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

        return this;
    }

    prepareLog () {
        let sunsetTime = this.sunCalc.sunset.getHours()
            + ':'
            + this.sunCalc.sunset.getMinutes()
            + ':'
            + this.sunCalc.sunset.getSeconds()
            + ' '
            + this.sunCalc.sunset.getDate()
            + '-'
            + (this.sunCalc.sunset.getMonth() +1)
            + '-'
            + this.sunCalc.sunset.getFullYear();

        return this;
    }

    turnLightOn () {
        if (!this.launched) {
            if (this.force === 'on') {
                return true;
            } else if (this.force === 'off') {
                return false;
            }

            if (this.onTime <= this.currentTime) {
                if (this.currentTime <= this.sunsetTime) {
                    return this.calculateTurnOn();
                }

                return true;
            }

            return this.calculateTurnOn();
        }

        return false;
    }

    static xor (a, b) {
        return (a || b) && !(a && b);
    }

    calculateTurnOn () {
        if (
            this.minimalTime <= this.currentTime
            || this.minimalTime <= this.sunsetTime
        ) {
            return true;
        }

        if (this.currentTime > this.sunsetTime) {
            return this.isSpecial;
        }

        return false;
    }

    turnLightOff () {
        if (this.launched) {
            if (this.force === 'on') {
                return false;
            } else if (this.force === 'off') {
                return true;
            }

            if (this.currentTime < this.onTime) {
                return true;
            }

            if (this.currentTime < this.sunsetTime) {
                return true;
            }

            if (this.currentTime > this.offTime) {
                return true;
            }
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

    objectStatus () {
        return {
            
        };
    }
};
