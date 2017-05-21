'use strict';

module.exports = class Iluminator
{
    constructor (date, config, launched, forceOn, sunCalc, keepAlive) {
        this.statusObject = {};
        this.config = config;
        this.forceOn = forceOn;

        let currentTime = date.getTime();
        let sunsetTime = sunCalc.sunset.getTime() + (2 * 60 * 60 *1000);

        this.statusObject.turnOn = config.get('workers.autoIlluminate.turnOn').split(':');
        this.statusObject.minTime = config.get('workers.autoIlluminate.minimalTime').split(':');
        this.statusObject.maxTime = config.get('workers.autoIlluminate.shutDownTime').split(':');

        date.setMinutes(this.statusObject.turnOn[1]);
        date.setHours(this.statusObject.turnOn[0]);

        let onTime = date.getTime();

        date.setMinutes(this.statusObject.minTime[1]);
        date.setHours(this.statusObject.minTime[0]);

        let minimalTime = date.getTime();

        date.setMinutes(this.statusObject.maxTime[1]);
        date.setHours(this.statusObject.maxTime[0]);

        let offTime = date.getTime();

        this.statusObject.launched = launched;
        this.statusObject.sunsetLowerThanOn = sunsetTime < onTime;
        this.statusObject.nowGraterThanSunset = currentTime >= sunsetTime;
        this.statusObject.isWeekend = date.getDay() % 6 === 0;
        this.statusObject.nowGraterThanOn = currentTime >= onTime;
        this.statusObject.isSpacialDay = this.isSpecialDay(date);
        this.statusObject.nowGraterThanMinimal = currentTime >= minimalTime;
        this.statusObject.nowLowerThantOff = currentTime <= offTime;
        this.statusObject.alive = !keepAlive && this.statusObject.nowGraterThanOff;
        this.statusObject.force = !forceOn && !this.statusObject.turnLightOn;
        this.statusObject.nowGraterThanOff = currentTime >= offTime;
        this.statusObject.turnOffStatus = null;

        this.statusObject.sunsetTime = sunCalc.sunset.getHours()
            + ':'
            + sunCalc.sunset.getMinutes()
            + ':'
            + sunCalc.sunset.getSeconds()
            + ' '
            + sunCalc.sunset.getDate()
            + '-'
            + (sunCalc.sunset.getMonth() +1)
            + '-'
            + sunCalc.sunset.getFullYear();
    }

    turnLightOn () {
        this.statusObject.turnLightOn = (
            (!this.statusObject.sunsetLowerThanOn && this.statusObject.nowGraterThanSunset)
            || (this.statusObject.sunsetLowerThanOn && this.statusObject.nowGraterThanOn)
            || (
                (
                    (this.statusObject.isWeekend || this.statusObject.isSpacialDay)
                    && this.statusObject.nowGraterThanSunset
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
        this.statusObject.turnOnStatus = !this.statusObject.launched && (turnLightOn || this.forceOn);
        return this.statusObject;
    }

    isSpecialDay (currentDate) {
        let day = currentDate.getDate();
        let month = currentDate.getMonth() +1;
        let special = this.config.get('illuminate_special.' + month);

        if (typeof(special) !== "undefined") {
            return special.indexOf(day) >= 0;
        }

        return false;
    }
};
