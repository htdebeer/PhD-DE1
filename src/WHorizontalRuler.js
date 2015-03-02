
/*
(c) 2012, Huub de Beer (H.T.de.Beer@gmail.com)
*/

(function() {
  var WHorizontalRuler,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WHorizontalRuler = (function(_super) {

    __extends(WHorizontalRuler, _super);

    function WHorizontalRuler(canvas, x, y, width, height, height_in_mm, spec) {
      var _this = this;
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.height_in_mm = height_in_mm;
      this.spec = spec != null ? spec : {
        orientation: "vertical",
        rounded_corners: 5
      };
      WHorizontalRuler.__super__.constructor.call(this, this.canvas, this.x, this.y, this.width, this.height, this.height_in_mm, this.spec);
      this._draw();
      this._compute_geometry();
      this.widgets.mouseover(function(e) {
        return _this.measure_line.show();
      });
      this.widgets.mouseout(function(e) {
        return _this.measure_line.hide();
      });
      this.widgets.mousemove(function(e) {
        e = jQuery.event.fix(e);
        x = e.pageX - _this.canvas.offset.left - _this.dx;
        return _this._move_measure_line(x);
      });
      this.widgets.click(function(e) {
        return _this._place_pointer(e);
      });
    }

    WHorizontalRuler.prototype._place_pointer = function(e) {
      var T_HEIGHT, T_WIDTH, active, pointer, remove, triangle, unactive, x, _ref;
      e - jQuery.event.fix(e);
      x = e.pageX - this.canvas.offset.left;
      T_WIDTH = 2;
      T_HEIGHT = 10;
      triangle = "l" + T_WIDTH + ",-" + T_HEIGHT + "h-" + (2 * T_WIDTH) + "l" + T_WIDTH + "," + T_HEIGHT + "m0,0";
      pointer = this.canvas.path(("M" + x + "," + this.y) + triangle + ("v-" + (((_ref = this.spec['measure_line_width']) != null ? _ref : 500) - this.height - T_WIDTH - 2)));
      pointer.attr({
        fill: '#222',
        stroke: '#222',
        'stroke-opacity': 0.5,
        'stroke-width': 0.5,
        'fill-opacity': 1,
        'stroke-dasharray': '. '
      });
      active = function(elt) {
        return elt.attr({
          fill: "red",
          stroke: "red",
          'stroke-opacity': 0.5,
          'fill-opacity': 0.5
        });
      };
      unactive = function(elt) {
        return elt.attr({
          fill: "#222",
          stroke: '#222',
          'stroke-opacity': 0.5,
          'stroke-width': 0.5,
          'fill-opacity': 1
        });
      };
      remove = function(elt) {
        elt.unmouseover(active);
        elt.unmouseout(unactive);
        return elt.remove();
      };
      pointer.mouseover(function() {
        return active(this);
      });
      pointer.mouseout(function() {
        return unactive(this);
      });
      pointer.click(function() {
        return remove(this);
      });
      pointer.touchstart(function() {
        return active(this);
      });
      pointer.touchcancel(function() {
        return unactive(this);
      });
      pointer.touchend(function() {
        return remove(this);
      });
      return this.pointers.push(pointer);
    };

    WHorizontalRuler.prototype._move_measure_line = function(x) {
      var MEASURELINE_LENGTH, _ref;
      MEASURELINE_LENGTH = (_ref = this.spec['measure_line_width']) != null ? _ref : 500;
      return this.measure_line.attr({
        path: "M" + x + "," + (this.y - this.dy + this.height) + "v-" + MEASURELINE_LENGTH,
        stroke: 'red',
        'stroke-opacity': 0.5,
        'stroke-width': 1
      });
    };

    WHorizontalRuler.prototype._draw = function() {
      /*
          Draw a vertical ruler
      */
      var background, cmlabel, label, labels, ticks, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      this.unit = this.width / this.height_in_mm;
      background = this.canvas.rect(this.x, this.y, this.width, this.height, (_ref = this.spec.rounded_corners) != null ? _ref : 5);
      background.attr({
        fill: (_ref2 = this.spec.background) != null ? _ref2 : "white",
        stroke: (_ref3 = this.spec.stroke) != null ? _ref3 : "black",
        'stroke-width': (_ref4 = this.spec['stroke-width']) != null ? _ref4 : 2
      });
      this.widgets.push(background);
      ticks = this.canvas.path(this._ticks_path());
      ticks.attr({
        stroke: (_ref5 = this.spec.stroke) != null ? _ref5 : "black"
      });
      this.widgets.push(ticks);
      labels = this._ticks_labels();
      for (_i = 0, _len = labels.length; _i < _len; _i++) {
        label = labels[_i];
        label.attr({
          'font-family': (_ref6 = this.spec['font-family']) != null ? _ref6 : 'sans-serif',
          'font-size': (_ref7 = this.spec['font-size']) != null ? _ref7 : 10,
          'font-weight': 'bold'
        });
        this.widgets.push(label);
      }
      cmlabel = this.canvas.text(this.x + this.width - 11, this.y + this.height - 11, "cm");
      cmlabel.attr({
        'font-family': (_ref8 = this.spec['font-family']) != null ? _ref8 : 'sans-serif',
        'font-size': ((_ref9 = this.spec['font-size']) != null ? _ref9 : 10) + 2,
        'font-weight': 'bold'
      });
      this.widgets.push(cmlabel);
      this.pointers = this.canvas.set();
      this.widgets.push(this.pointers);
      this.measure_line = this.canvas.path("M" + this.x + "," + this.y);
      this.measure_line.hide();
      return this.widgets.push(this.measure_line);
    };

    WHorizontalRuler.prototype._ticks_path = function() {
      /*
          Generate the ticks by moving from tick to tick and drawing a horizontal line
          for every tick.
      */
      var CM_WIDTH, HCM_WIDTH, MM_WIDTH, d, mm, x, y, _ref, _ref2, _ref3, _ref4, _ref5;
      MM_WIDTH = (_ref = this.spec.mm_width) != null ? _ref : 3;
      HCM_WIDTH = (_ref2 = this.spec.hcm_width) != null ? _ref2 : 7;
      CM_WIDTH = (_ref3 = this.spec.cm_width) != null ? _ref3 : 11;
      x = this.x + ((_ref4 = this.spec.border_width) != null ? _ref4 : 2);
      y = this.y;
      d = "";
      for (mm = 2, _ref5 = this.height_in_mm - 1; 2 <= _ref5 ? mm < _ref5 : mm > _ref5; 2 <= _ref5 ? mm++ : mm--) {
        x += this.unit;
        d += "M" + x + "," + y;
        if (mm % 10 === 0) {
          d += "v" + CM_WIDTH;
        } else if (mm % 5 === 0) {
          d += "v" + HCM_WIDTH;
        } else {
          d += "v" + MM_WIDTH;
        }
      }
      return d;
    };

    WHorizontalRuler.prototype._ticks_labels = function() {
      /*
          Draw the labels of the cm ticks
      */
      var X_DISTANCE, Y_DISTANCE, cm, labels, mm, x, y, _ref, _ref2, _ref3, _ref4;
      X_DISTANCE = (_ref = this.spec.x_distance) != null ? _ref : 3;
      Y_DISTANCE = (_ref2 = this.spec.y_distance) != null ? _ref2 : 10;
      x = this.x + ((_ref3 = this.spec.border_width) != null ? _ref3 : 2);
      y = this.y + Y_DISTANCE;
      cm = 0;
      labels = [];
      for (mm = 2, _ref4 = this.height_in_mm - 1; 2 <= _ref4 ? mm < _ref4 : mm > _ref4; 2 <= _ref4 ? mm++ : mm--) {
        x += this.unit;
        if (mm % 10 === 0) {
          cm++;
          labels.push(this.canvas.text(x, y + Y_DISTANCE, "" + cm));
        }
      }
      return labels;
    };

    return WHorizontalRuler;

  })(WRuler);

  window.WHorizontalRuler = WHorizontalRuler;

}).call(this);
