var assert = require('assert');
var minify = require('../lib/minify-glsl');

describe('Minifies GLSL code.', () => {
  it('Should correctly minify floating point numbers.', () => {
    assert.equal(minify('0.00001'), '.00001');
    assert.equal(minify('0.1'), '.1');
    assert.equal(minify('0.0'), '0.');
    assert.equal(minify('10.0'), '10.');
    assert.equal(minify('1.0'), '1.');
    assert.equal(minify('0.'), '0.');
    assert.equal(minify('10.'), '10.');
    assert.equal(minify('1.00000'), '1.');
    assert.equal(minify('0.00000'), '0.');
    assert.equal(minify('000.00000'), '0.');
    assert.equal(minify('0.001'), '.001');
    assert.equal(minify('20.001'), '20.001');

    // assert.equal(minify('rgb2.x'), 'rgb2.x');
    // assert.equal(minify('rgb2.0x'), 'rgb2.0x');
    // assert.equal(minify('.0'), '0.');
    // assert.equal(minify('.00000'), '0.'');
  });
});