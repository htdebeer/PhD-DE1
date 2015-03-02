(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Line = (function() {
    var defineProperties;

    defineProperties = function(inp) {
      var outp, _ref, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      outp = {};
      outp.background_color = (_ref = inp.background) != null ? _ref : 'white';
      outp.background_opacity = (_ref2 = inp.background_opacity) != null ? _ref2 : 0;
      outp.line = {};
      outp.line.width = (_ref3 = inp.line_width) != null ? _ref3 : 1;
      outp.line.color = (_ref4 = inp.line_color) != null ? _ref4 : 'black';
      outp.line.color_selected = (_ref5 = inp.line_color_selected) != null ? _ref5 : 'orange';
      outp.line.color_highlighted = (_ref6 = inp.line_color_highlighted) != null ? _ref6 : 'red';
      outp.line.dash = (_ref7 = inp.line_dash) != null ? _ref7 : '';
      outp.point = {};
      outp.point.size = (_ref8 = inp.point_size) != null ? _ref8 : 5;
      outp.point.shape = (_ref9 = inp.point_shape) != null ? _ref9 : 'circle';
      outp.point.color = (_ref10 = inp.point_color) != null ? _ref10 : 'black';
      outp.point.color_selected = (_ref11 = inp.point_color_selected) != null ? _ref11 : 'orange';
      outp.point.color_highlighted = (_ref12 = inp.point_color_highlighted) != null ? _ref12 : 'red';
      outp.control = {};
      outp.control.size = (_ref13 = inp.control_size) != null ? _ref13 : 5;
      outp.control.shape = (_ref14 = inp.control_shape) != null ? _ref14 : 'rect';
      outp.control.color = (_ref15 = inp.control_color) != null ? _ref15 : 'green';
      outp.control.color_selected = (_ref16 = inp.control_color_selected) != null ? _ref16 : 'green';
      outp.control.color_highlighted = (_ref17 = inp.control_color_highlighted) != null ? _ref17 : 'blue';
      return outp;
    };

    function _Class(canvas, x, y, width, height, properties) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      if (properties == null) properties = {};
      this.add_end_point = __bind(this.add_end_point, this);
      this.draw_line = __bind(this.draw_line, this);
      this.add_start_point = __bind(this.add_start_point, this);
      this.prop = defineProperties(properties);
      this.points = [];
      this.segments = [];
      this.container = this.canvas.set();
      this.draw();
      this.temp_line = this.canvas.path("M0,0");
      this.container.mousedown(this.add_start_point);
    }

    _Class.prototype.add_start_point = function(e, x, y) {
      this.new_point = new CoffeeGrounds.Point(this.canvas, x - this.canvas.offset.left, y - this.canvas.offset.top, this.prop.point);
      this.points.push(this.new_point);
      this.container.mousemove(this.draw_line);
      this.container.unmousedown(this.add_start_point);
      return this.container.mouseup(this.add_end_point);
    };

    _Class.prototype.draw_line = function(e, dx, dy, x, y) {
      var sx, sy;
      sx = this.new_point.x;
      sy = this.new_point.y;
      this.temp_line.attr({
        path: "M" + sx + "," + sy + "L" + (dx - this.canvas.offset.left) + "," + (dy - this.canvas.offset.top),
        stroke: this.prop.line.color
      });
      return this.temp_line.show();
    };

    _Class.prototype.add_end_point = function(e, x, y) {
      this.container.unmousemove(this.draw_line);
      this.container.unmouseup(this.add_end_point);
      this.temp_line.hide();
      this.new_end_point = new CoffeeGrounds.Point(this.canvas, x - this.canvas.offset.left, y - this.canvas.offset.top, this.prop.point);
      this.points.push(this.new_end_point);
      return this.container.mousedown(this.add_start_point);
    };

    _Class.prototype.set_constraints = function(constraints) {
      this.constraints = constraints;
    };

    _Class.prototype.add_segment = function(start, end, kind) {
      if (!(start && end)) {
        this.start = start;
        return this.end = end;
      }
    };

    _Class.prototype.draw = function() {
      this.background = this.canvas.rect(this.x, this.y, this.width, this.height);
      this.background.attr({
        'fill': this.prop.background_color,
        'fill-opacity': this.prop.background_opacity,
        'stroke': 'black',
        'cursor': 'crosshair'
      });
      return this.container.push(this.background);
    };

    return _Class;

  })();

}).call(this);
