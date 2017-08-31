let Config = require('../../lib/config');
let autoIlluminateNg = require('../../src/autoIlluminateNg');
let assert = require('assert');

describe('Test Auto Illuminate Library', function() {
    describe('', function () {
        it('', function () {
            // assert.equal(Iluminator.xor(true, false), true);
            // assert.equal(Iluminator.xor(false, true), true);
            
            // let redis = new RedisMock();
            

        });
    });
});

class RedisMock
{
    connect () {
        this.data = [];
    }
    
    getData (key, callback) {
        callback(this.data[key]);
    }
    
    setData (key, value) {
        this.data[key] = value;
    }
}
