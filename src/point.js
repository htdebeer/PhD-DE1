(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Point = (function() {
    var defineProperties;

    function _Class(canvas, x, y, properties) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      if (properties == null) properties = {};
      this.stopdrag = __bind(this.stopdrag, this);
      this.startdrag = __bind(this.startdrag, this);
      this.move = __bind(this.move, this);
      this.highlight = __bind(this.highlight, this);
      this.properties = defineProperties(properties);
      this.view = {};
      this.draw(this.properties.size);
      this.highlighted = false;
      this.view.mouseover(this.highlight);
      this.view.mouseout(this.highlight);
      this.line = {};
      this.view.drag(this.move, this.startdrag, this.stopdrag);
    }

    defineProperties = function(in_properties) {
      var out_properties, _ref, _ref2, _ref3, _ref4;
      out_properties = {};
      out_properties.shape = (_ref = in_properties.shape) != null ? _ref : 'circle';
      out_properties.color = (_ref2 = in_properties.color) != null ? _ref2 : 'black';
      out_properties.size = (_ref3 = in_properties.size) != null ? _ref3 : 5;
      out_properties.highlight = (_ref4 = in_properties.highlight) != null ? _ref4 : 'red';
      return out_properties;
    };

    _Class.prototype.set_line = function(line) {
      this.line = line;
    };

    _Class.prototype.remove_line = function(line) {
      return this.lines["delete"](line);
    };

    _Class.prototype.toFront = function() {
      return this.view.toFront();
    };

    _Class.prototype.make_draggable = function() {
      return this.view.drag(this.move, this.startdrag, this.stopdrag);
    };

    _Class.prototype.make_undraggable = function() {
      this.highlighted = false;
      this.view.attr({
        fill: this.properties.color
      });
      return this.view.undrag();
    };

    _Class.prototype.show = function() {
      return this.view.show();
    };

    _Class.prototype.hide = function() {
      return this.view.hide();
    };

    _Class.prototype.highlight = function() {
      if (this.highlighted) {
        this.view.attr({
          fill: this.properties.color
        });
        return this.highlighted = false;
      } else {
        this.view.attr({
          fill: this.properties.highlight
        });
        return this.highlighted = true;
      }
    };

    _Class.prototype.move = function(dx, dy, x, y, e) {
      var tx, ty;
      tx = dx - this.ox;
      ty = dy - this.oy;
      this.ox = dx;
      this.oy = dy;
      this.x += tx;
      this.y += ty;
      this.view.transform("...T" + tx + "," + ty);
      this.line.x += tx;
      return this.line.y += ty;
    };

    _Class.prototype.startdrag = function(x, y, e) {
      this.ox = 0;
      this.oy = 0;
      return this.view.attr({
        'fill-opacity': 0.5
      });
    };

    _Class.prototype.stopdrag = function(x, y, e) {
      return this.view.attr({
        'fill-opacity': 1
      });
    };

    _Class.prototype.draw = function(size) {
      var radius, x, y;
      radius = size / 2;
      switch (this.properties.shape) {
        case 'circle':
          this.view = this.canvas.circle(this.x, this.y, radius);
          break;
        case 'rect':
          x = this.x - radius;
          y = this.y - radius;
          this.view = this.canvas.rect(x, y, size, size);
      }
      return this.view.attr({
        fill: this.properties.color,
        stroke: this.properties.color,
        'stroke-width': radius * 2,
        'stroke-opacity': 0
      });
    };

    return _Class;

  })();

}).call(this);
