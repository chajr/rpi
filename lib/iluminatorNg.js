'use strict';

module.exports = class Iluminator
{
    constructor (config, launched, force, sunCalc, date) {
        this.statusObject = {};
        this.config = config;
        this.force = force;
        this.sunCalc = sunCalc;
        this.launched = launched;
        this.date = date;

        this.turnOn = this.config.get('workers.autoIlluminate.turnOn').split(':');
        this.minTime = this.config.get('workers.autoIlluminate.minimalTime').split(':');
        this.maxTime = this.config.get('workers.autoIlluminate.shutDownTime').split(':');

        this.calculateTimes();
    }

    calculateTimes () {
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
        if (this.launched) {
            return false;
        } else {
            if (this.force === 'on') {
                return true;
            } else if (this.force === 'off') {
                return false;
            } else {
                if (this.onTime <= this.currentTime) {
                    if (this.currentTime <= this.sunsetTime) {
                        if (this.minimalTime < this.currentTime) {
                            return true;
                        } else {
                            if (this.minimalTime < this.sunsetTime) {
                                return true;
                            } else {
                                if (this.currentTime < this.sunsetTime) {
                                    return false;
                                } else {
                                    if (this.isSpecial) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    } else {
                        return true;
                    }
                }
            }
        }
    }

    turnLightOff () {
        return false;
    }

    objectStatus () {
        
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

    xor (a, b) {
        return (a || b) && !(a && b);
    }
};
