
/*
(c) 2012, Huub de Beer, H.T.de.Beer@gmail.com
*/

(function() {
  var WMeasureLine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WMeasureLine = (function(_super) {

    __extends(WMeasureLine, _super);

    function WMeasureLine(canvas, x, y, ml, foot, spec) {
      var _this = this;
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.ml = ml;
      this.foot = foot;
      this.spec = spec != null ? spec : {};
      this.end = __bind(this.end, this);
      this.start = __bind(this.start, this);
      this.drag = __bind(this.drag, this);
      WMeasureLine.__super__.constructor.call(this, this.canvas, this.x, this.y, this.spec);
      this._draw();
      if (this.ml.movable) {
        this.widgets.mouseover(function(e) {
          return _this.border.attr({
            fill: 'gold',
            'fill-opacity': 0.25,
            'stroke-opacity': 0.75,
            cursor: 'move'
          });
        });
        this.widgets.mouseout(function(e) {
          return _this.border.attr({
            'stroke-opacity': 0,
            cursor: 'default',
            fill: 'white',
            'fill-opacity': 0
          });
        });
        this.widgets.drag(this.drag, this.start, this.end);
      }
    }

    WMeasureLine.prototype.drag = function(dx, dy, x, y, e) {
      var tx, ty;
      tx = Math.floor(dx - this.dpo.x);
      ty = Math.floor(dy - this.dpo.y);
      this.x += tx;
      this.y += ty;
      this.widgets.transform("...t" + tx + "," + ty);
      this.dpo = {
        x: dx,
        y: dy
      };
      this._compute_geometry();
      this.ml.position.x = this.x;
      this.ml.position.y = this.y;
      return this.ml.glass.change_measure_line(this.ml.volume, (this.foot - this.y) / this.ml.glass.unit);
    };

    WMeasureLine.prototype.show = function() {
      return this.widgets.show();
    };

    WMeasureLine.prototype.hide = function() {
      return this.widgets.hide();
    };

    WMeasureLine.prototype.start = function() {
      var _ref;
      this.dpo = (_ref = this.dpo) != null ? _ref : {};
      this.dpo = {
        x: 0,
        y: 0
      };
      return this.border.attr({
        'fill': 'gold',
        'fill-opacity': 0.05
      });
    };

    WMeasureLine.prototype.end = function() {
      return this.border.attr({
        'fill': 'white',
        'fill-opacity': 0
      });
    };

    WMeasureLine.prototype._draw = function() {
      var BENDINESS, LABELSKIP, TICKWIDTH, bbox, label, labelleft, tick, tickpath, _ref, _ref2, _ref3, _ref4, _ref5;
      TICKWIDTH = (_ref = this.spec['thickwidth']) != null ? _ref : 10;
      LABELSKIP = (_ref2 = this.spec['labelskip']) != null ? _ref2 : 5;
      BENDINESS = 6;
      this.bend = (_ref3 = this.spec.bend) != null ? _ref3 : false;
      switch (this.ml.side) {
        case 'right':
          if (this.bend) {
            tickpath = "M" + this.ml.position.x + "," + this.ml.position.y + "c0," + 2 + ",-" + BENDINESS + "," + BENDINESS + ",-" + TICKWIDTH + "," + BENDINESS;
          } else {
            tickpath = "M" + this.ml.position.x + "," + this.ml.position.y + "h-" + TICKWIDTH;
          }
          tick = this.canvas.path(tickpath);
          label = this.canvas.text(0, 0, "" + this.ml.volume + " ml");
          label.attr({
            'font-family': (_ref4 = this.spec['font-family']) != null ? _ref4 : 'sans-serif',
            'font-size': (_ref5 = this.spec['font-size']) != null ? _ref5 : 12,
            'text-anchor': 'start'
          });
          bbox = label.getBBox();
          labelleft = this.ml.position.x - LABELSKIP - bbox.width - TICKWIDTH;
          if (this.bend) {
            label.attr({
              x: labelleft,
              y: this.ml.position.y + BENDINESS
            });
          } else {
            label.attr({
              x: labelleft,
              y: this.ml.position.y
            });
          }
          bbox = label.getBBox();
          this.border = this.canvas.rect(bbox.x, bbox.y, bbox.width + TICKWIDTH, bbox.height);
          this.border.attr({
            stroke: 'black',
            fill: 'white',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'stroke-dasharray': '. '
          });
          break;
        case 'left':
          tickpath = "M" + this.ml.position.x + "," + this.ml.position.y + "h" + TICKWIDTH;
      }
      this.widgets.push(tick, label, this.border);
      bbox = this.widgets.getBBox();
      this.width = bbox.width;
      return this.height = bbox.height;
    };

    return WMeasureLine;

  })(Widget);

  window.WMeasureLine = WMeasureLine;

}).call(this);
