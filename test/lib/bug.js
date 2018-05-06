let Config = require('../../lib/config');
let Iluminator = require('../../lib/iluminatorNg');
let assert = require('assert');

describe('iluminatorNg bugs', function(){
    describe('time calculation', function(){
        it('check time calculation when off time less than sunset', function(){
            let sunset = new SunCalcMock(new Date(2018, 5, 5, 20, 8, 0));
            let Ilum = createIlluminatorObject(0, 0, {sunset: sunset}, new Date(2018, 5, 5, 17, 40, 0));

            let iluminatorLog = Ilum.prepareLog();

            assert.equal(iluminatorLog.shouldTurnLightOn, false);
            assert.equal(iluminatorLog.downBorderRaw, 1528218000000);
            assert.equal(iluminatorLog.downBorder, '19:0:0 5-6-2018');
        });
    });
});

/**
 * @param launched boolean
 * @param forceOn boolean
 * @param sunCalc Object
 * @param date Object
 * @returns Iluminator
 */
function createIlluminatorObject(launched, forceOn, sunCalc, date) {
    let config = new Config('../etc/config_test-bug.json');
    let redisMock = new RedisMock(config);

    let iluminator = new Iluminator(config, redisMock, 1);

    iluminator.calculateTimes(date, sunCalc, launched, forceOn).calculateRange();

    return iluminator
}

class RedisMock {
    constructor (config) {
        this.minimal_time = config.get('workers.autoIlluminate.turnOn');
        this.turn_on = config.get('workers.autoIlluminate.minimalTime');
        this.shut_down_time = config.get('workers.autoIlluminate.shutDownTime');
    }

    getData (key, callback) {
        switch (key) {
            case 'illuminate_minimal_time_1':
                callback(this.minimal_time);
                break;

            case 'illuminate_turn_on_1':
                callback(this.turn_on);
                break;

            case 'illuminate_shut_down_time_1':
                callback(this.shut_down_time);
                break;
        }
    }
}

class SunCalcMock {
    constructor (date) {
        /** @var Date **/
        this.date = date;
    }
    getTime() {
        return this.date.getTime();
    }
    getHours() {
        return this.date.getHours();
    }
    getMinutes() {
        return this.date.getMinutes();
    }
    getSeconds() {
        return this.date.getSeconds();
    }
    getDate() {
        return this.date.getDate();
    }
    getMonth() {
        return this.date.getMonth();
    }
    getFullYear() {
        return this.date.getFullYear();
    }
}
