let Config = require('../../lib/config');
let Iluminator = require('../../lib/iluminatorNg');
let assert = require('assert');

describe('Test Auto Illuminate Library', function() {
    describe('', function () {
        it('', function () {
            assert.equal(Iluminator.xor(true, false), true);
            assert.equal(Iluminator.xor(false, true), true);

        });
    });
});
