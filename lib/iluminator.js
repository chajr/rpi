'use strict';

module.exports = class Iluminator
{
    constructor (config, launched, forceOn, sunCalc, keepAlive) {
        this.statusObject = {};
        this.config = config;
        this.forceOn = forceOn;
        this.sunCalc = sunCalc;
        this.launched = launched;
        this.keepAlive = keepAlive;
    }

    calculate(date) {
        let currentTime = date.getTime();
        let sunsetTime = this.sunCalc.sunset.getTime() + (2 * 60 * 60 *1000);

        this.statusObject.turnOn = this.config.get('workers.autoIlluminate.turnOn').split(':');
        this.statusObject.minTime = this.config.get('workers.autoIlluminate.minimalTime').split(':');
        this.statusObject.maxTime = this.config.get('workers.autoIlluminate.shutDownTime').split(':');

        date.setMinutes(this.statusObject.turnOn[1]);
        date.setHours(this.statusObject.turnOn[0]);

        let onTime = date.getTime();

        date.setMinutes(this.statusObject.minTime[1]);
        date.setHours(this.statusObject.minTime[0]);

        let minimalTime = date.getTime();

        date.setMinutes(this.statusObject.maxTime[1]);
        date.setHours(this.statusObject.maxTime[0]);

        let offTime = date.getTime();

        this.statusObject.launched = this.launched;
        this.statusObject.sunsetLowerThanOn = sunsetTime < onTime;
        this.statusObject.nowGraterThanSunset = currentTime >= sunsetTime;
        this.statusObject.nowGraterThanOn = currentTime >= onTime;
        this.statusObject.isSpacialDay = this.isSpecialDay(date);
        this.statusObject.nowGraterThanMinimal = currentTime >= minimalTime;
        this.statusObject.nowLowerThantOff = currentTime <= offTime;
        this.statusObject.alive = !this.keepAlive && this.statusObject.nowGraterThanOff;
        this.statusObject.force = !this.forceOn && !this.statusObject.turnLightOn;
        this.statusObject.nowGraterThanOff = currentTime >= offTime;
        this.statusObject.turnOffStatus = null;

        this.statusObject.sunsetTime = this.sunCalc.sunset.getHours()
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
    }

    turnLightOn () {
        this.statusObject.turnLightOn = (
            (!this.statusObject.sunsetLowerThanOn && this.statusObject.nowGraterThanSunset)
            || (this.statusObject.sunsetLowerThanOn && this.statusObject.nowGraterThanOn)
            || (
                (
                    this.statusObject.isSpacialDay && this.statusObject.nowGraterThanSunset
                )
                || this.statusObject.nowGraterThanMinimal
            )
        ) && this.statusObject.nowLowerThantOff;
    }

    turnLightOff (forceOff) {
        this.statusObject.turnOffStatus = this.statusObject.launched
            && (this.statusObject.alive || this.statusObject.force || forceOff);
    }

    objectStatus () {
        this.statusObject.turnOnStatus = !this.statusObject.launched && (this.statusObject.turnLightOn || this.forceOn);
        return this.statusObject;
    }

    isSpecialDay (currentDate) {
        if (currentDate.getDay() % 6 === 0) {
            return true;
        }

        let day = currentDate.getDate();
        let month = currentDate.getMonth() +1;
        let special = this.config.get('illuminate_special.' + month);

        if (typeof(special) !== "undefined") {
            return special.indexOf(day) >= 0;
        }

        return false;
    }
};
