'use strict';

module.exports = class Gpio
{
    constructor (pinNumber, mode) {
        this.pinNumber = pinNumber;
        this.mode = mode;
    }

    writeSync (mode) {
        console.log(mode + '; ' + this.pinNumber + '; ' + this.mode);
    }
};
