(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.LineSegment = (function() {
    var defineProperties;

    defineProperties = function(in_properties) {
      var out_properties, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      out_properties = {};
      out_properties.straight = (_ref = in_properties.straight) != null ? _ref : false;
      out_properties.color = (_ref2 = in_properties.color) != null ? _ref2 : 'black';
      out_properties.line_width = (_ref3 = in_properties.line_width) != null ? _ref3 : 1;
      out_properties.highlight = (_ref4 = in_properties.highlight) != null ? _ref4 : 'red';
      out_properties.control_line_color = (_ref5 = in_properties.control_line_color) != null ? _ref5 : 'gray';
      out_properties.control_line_dash = '-';
      out_properties.background = (_ref6 = in_properties.background) != null ? _ref6 : 'yellow';
      out_properties.background_opacity = (_ref7 = in_properties.background_opacity) != null ? _ref7 : 0.7;
      return out_properties;
    };

    function _Class(canvas, start, control_start, end, control_end, properties) {
      this.canvas = canvas;
      this.start = start;
      this.control_start = control_start;
      this.end = end;
      this.control_end = control_end;
      if (properties == null) properties = {};
      this.select = __bind(this.select, this);
      this.highlight = __bind(this.highlight, this);
      this.properties = defineProperties(properties);
      this.view = this.canvas.set();
      this.draw();
      this.control_end.hide();
      this.control_start.hide();
      this.highlighted = false;
      this.back.mouseover(this.highlight);
      this.back.mouseout(this.highlight);
      this.selected = false;
      this.start.add_line(this);
      this.end.add_line(this);
      this.control_start.add_line(this);
      control_end.add_line(this);
      this.update();
    }

    _Class.prototype.update = function() {
      var path;
      path = this.update_path(this.start, this.control_start, this.end, this.control_end);
      this.line.attr({
        path: path
      });
      this.back.attr({
        path: path
      });
      this.start_control_line.attr({
        path: this.update_control_path(this.start, this.control_start)
      });
      return this.end_control_line.attr({
        path: this.update_control_path(this.end, this.control_end)
      });
    };

    _Class.prototype.highlight = function() {
      if (this.highlighted) {
        this.back.unclick(this.select);
        return this.highlighted = false;
      } else {
        this.back.click(this.select);
        return this.highlighted = true;
      }
    };

    _Class.prototype.select = function() {
      if (this.selected) {
        this.hide_controls();
        this.line.attr({
          'stroke-width': this.properties.line_width
        });
        return this.selected = false;
      } else {
        if (!this.properties.straight) this.show_controls();
        this.line.attr({
          'stroke-width': this.properties.line_width * 1.5
        });
        return this.selected = true;
      }
    };

    _Class.prototype.make_straight = function() {
      return this.properties.straight = true;
    };

    _Class.prototype.make_curve = function() {
      return this.properties.straight = false;
    };

    _Class.prototype.show_controls = function() {
      this.control_start.show();
      this.control_end.show();
      this.start_control_line.show();
      return this.end_control_line.show();
    };

    _Class.prototype.hide_controls = function() {
      this.control_start.hide();
      this.control_end.hide();
      this.start_control_line.hide();
      return this.end_control_line.hide();
    };

    _Class.prototype.draw = function() {
      var path;
      path = this.update_path(this.start, this.control_start, this.end, this.control_end);
      this.line = this.canvas.path(path);
      this.line.attr({
        stroke: this.properties.color,
        'stroke-width': this.properties.line_width
      });
      this.back = this.canvas.path(path);
      this.back.attr({
        stroke: this.properties.background,
        'stroke-opacity': 0,
        'stroke-width': this.properties.line_width * 4
      });
      this.start_control_line = this.canvas.path(this.update_control_path(this.start, this.control_start));
      this.start_control_line.attr({
        stroke: this.properties.control_line_color,
        'stroke-dasharray': this.properties.control_line_dash,
        'stroke-width': 0.5
      });
      this.start_control_line.hide();
      this.end_control_line = this.canvas.path(this.update_control_path(this.end, this.control_end));
      this.end_control_line.attr({
        stroke: this.properties.control_line_color,
        'stroke-dasharray': this.properties.control_line_dash,
        'stroke-width': 0.5
      });
      this.end_control_line.hide();
      this.view.push(this.back, this.line, this.start_control_line, this.end_control_line);
      this.line.toBack();
      return this.back.toBack();
    };

    _Class.prototype.update_path = function(s, cs, e, ce) {
      var path;
      if (this.properties.straight) {
        return path = "M" + s.x + "," + s.y + "C" + s.x + "," + s.y + "," + e.x + "," + e.y + "," + e.x + "," + e.y;
      } else {
        return path = "M" + s.x + "," + s.y + "C" + cs.x + "," + cs.y + "," + ce.x + "," + ce.y + "," + e.x + "," + e.y;
      }
    };

    _Class.prototype.update_control_path = function(p, c) {
      return "M" + p.x + "," + p.y + "L" + c.x + "," + c.y;
    };

    return _Class;

  })();

}).call(this);
