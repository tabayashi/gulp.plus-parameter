'use strict';
var kindof  = require('kind-of');
var merge   = require('merge');
var arraify = function(value) {
  return Array.isArray(value) ? value : [value];
};

var Collection = Object.defineProperties({}, {
  key: {
    value: function(key) {
      var index = parseInt(key);
      return index.toString() === key ? index : key;
    },
  },

  has: {
    value: function(subject, key) {
      var kind = kindof(subject);
      if (['undefined', 'null'].includes(kind)) {
        return false;
      }

      if ('array' === kind && 'number' === kindof(key)) {
        return true;
      }

      return subject.hasOwnProperty(key);
    },
  },

  value: {
    value: function(subject, key) {
      if (Collection.has(subject, key)) {
        return subject[key];
      }
      return void 0;
    },
  },
});

var Recursive = Object.defineProperties({}, {
  set: {
    value: function(subject, path, variable, disallowUpdate) {
      if (!path || path.length === 0) {
        return subject;
      }

      if (['null','undefined'].includes(kindof(subject))) {
        return subject;
      }

      if ('string' === kindof(path)) {
        return Recursive.set(
          subject,
          path.split('.').map(Collection.key),
          variable,
          disallowUpdate
        );
      }
      path = arraify(path);

      var key   = path[0];
      var value = Collection.value(subject, key);
      var undef = 'undefined' === kindof(value);

      if (path.length === 1) {
        if (undef || !disallowUpdate) {
          subject[key] = variable;
        }
        return value;
      }

      if (undef) {
        subject[key] = 'number' === kindof(path[1]) ? [] : {};
      }

      return Recursive.set(
        subject[key],
        path.slice(1),
        variable,
        disallowUpdate
      );
    },
  },

  get: {
    value: function(subject, path, ace) {
      if (!path || path.length === 0) {
        return subject;
      }

      if ('string' === kindof(path)) {
        return Recursive.get(
          subject,
          path.split('.').map(Collection.key),
          ace
        );
      }
      path = arraify(path);

      var key   = path[0];
      var value = Collection.value(subject, key);

      if ('undefined' === kindof(value)) {
        return ace;
      }

      if (path.length === 1) {
        return value;
      }

      return Recursive.get(value, path.slice(1), ace);
    }
  },

  has: {
    value: function(subject, path) {
      if (!path || path.length === 0) {
        return !!subject;
      }

      if ('string' === kindof(path)) {
        return Recursive.has(
          subject,
          path.split('.').map(Collection.key)
        );
      }
      path = arraify(path);

      var key = path[0];
      if (!Collection.has(subject, key)) {
        return false;
      }

      if (path.length === 1) {
        return true;
      }

      return Recursive.has(Collection.value(subject, key), path.slice(1));
    },
  },
});

function Parameter(object) {
  if (!(this instanceof Parameter)) {
    return new Parameter(object);
  }

  if (object instanceof Parameter) {
    return new Parameter(clone(object.data));
  }

  this.init(object);
}

Object.defineProperties(Parameter.prototype, {
  constructor: {
    value: Parameter,
  },

  init: {
    value: function(object) {
      this.empty();
      merge(this.data, object);
      return this;
    },
  },

  get: {
    value: function(path, ace) {
      return Recursive.get(this.data, path, ace);
    },
  },

  set: {
    value: function(path, variable, disallowUpdate) {
      Recursive.set(this.data, path, variable, disallowUpdate);
      return this;
    },
  },

  has: {
    value: function(path) {
      return Recursive.has(this.data, path);
    },
  },

  ace: {
    value: function(path, variable) {
      Recursive.set(this.data, path, merge({}, variable, this.data), true);
      return this;
    },
  },

  default: {
    value: function() {
      return this.ace.apply(this, arguments);
    },
  },

  clone: {
    value: function(path) {
      return new Parameter(merge(true, this.get(path)));
    },
  },

  merge: {
    value: function(path, variable) {
      this.set(path, merge(this.get(path), variable));
      return this;
    },
  },

  empty: {
    value: function() {
      switch (kindof(this.data)) {
        case 'array': {
          this.data.splice(0, this.data.length);
          break;
        }
        case 'object': {
          Object.keys(this.data).forEach(function(name) {
            delete this.data[name];
          }, this);
          break;
        }
        default: {
          this.data = {};
        }
      }
      return this;
    },
  },

  dump: {
    value: function() {
      var data = merge(true, this.data);
      this.empty();
      return data;
    },
  },
});

module.exports = Parameter;
