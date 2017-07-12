'use strict'

describe('Parameter', function() {
  var Parameter = require('../src/index.js');
  describe('.prototype', function() {
    var _;
    beforeEach(function() {
      _ = Parameter();
    });

    describe('#constructor(object: Object): Parameter', function() {
      it('should create instance with new keyword', function() {
        expect(new Parameter()).to.be.an.instanceof(Parameter);
      });

      it('should create instance without new keyword', function() {
        expect(Parameter()).to.be.an.instanceof(Parameter);
      });
    });

    describe('#data', function() {
      it('should have property data that to be an Object', function() {
        expect(_).to.have.property('data')
                 .that.to.be.an.instanceof(Object);
      });
    });

    describe('#set(hierarchy :string, variable: any, '
                + 'disallowUpdate: boolean): Parameter', function() {
      it('should store deep hierarchical values', function() {
        _.set('foo.bar.buz', 1);
        expect(_.data.foo.bar.buz).to.be.equal(1);
      });

      it('should not replace values '
        + 'if given disallowUpdate is true', function() {
        _.set('foo.bar.buz', 1);
        _.set('foo.bar.buz', 100, true);
        expect(_.data.foo.bar.buz).to.be.equal(1);
      });
    });

    describe('#get(hierarchy: string, ace: any): any', function() {
      it('should fetch deep hierarchical values', function() {
        _.set('foo.bar.buz', 100);
        expect(_.get('foo.bar.buz')).to.be.equal(100);
        _.set('path.to.array', [1,2,3]);
        expect(_.get('path.to.array.2')).to.be.equal(3);
      });

      it('should return given ace '
        + 'unless defined hierarchical value', function() {
        expect(_.get('foo.bar.buz', 100)).to.be.equal(100);
        expect(_.get('path.to.array.2', 100)).to.be.equal(100);
      });
    });

    describe('#has(hierarchy: string): boolean', function() {
      it('should return boolean '
        + 'whether hierarchical value define or not', function() {
        _.set('foo.bar.buz', 100);
        expect(_.has('foo.bar.buz')).to.be.true;
        _.set('path.to.array', [1,2,3]);
        expect(_.has('path.to.array.2')).to.be.true;
        expect(_.has()).to.be.true;
        expect(_.has('path.to.object')).to.be.false;
        expect(_.has('path.to.array.4')).to.be.true;
      });
    });

    describe('#clone(hierarchy: string): Parameter', function() {
      it('should return parameters object '
        + 'cloned with given hierarchical value', function() {
        var $;
        _.set('foo.bar.buz', 100);
        $ = _.clone('foo');
        expect($.get('bar.buz')).to.be.equal(100);
        $ = _.clone();
        expect($.get('foo.bar.buz')).to.be.equal(100);
      });
    });
  })
});
