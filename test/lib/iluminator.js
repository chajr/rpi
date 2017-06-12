let config = require('../../lib/config');
let Iluminator = require('../../lib/iluminator');
let assert = require('assert');

describe('Test Illuminate Library', function(){
    describe('Test special day', function(){
        it('should return that current day is special day', function(){
            let Ilum = createIlluminatorObject(0, 0, {}, 0);
            let isSpecial = Ilum.isSpecialDay(new Date(2017, 4, 3));

            assert.equal(isSpecial, true);
        });

        it('should return that current day is normal day', function(){
            let Ilum = createIlluminatorObject(0, 0, {}, 0);
            let isSpecial = Ilum.isSpecialDay(new Date(2017, 5, 12));

            assert.equal(false, isSpecial);
        });

        it('should return that current day is weekend', function(){
            let Ilum = createIlluminatorObject(0, 0, {}, 0);
            let isSpecial = Ilum.isSpecialDay(new Date(2017, 5, 11));

            assert.equal(true, isSpecial);
        });
    });
});

function createIlluminatorObject(launched, forceOn, sunCalc, keepAlive) {
    return new Iluminator(config, launched, forceOn, sunCalc, keepAlive);
}
