
/*
*/

(function() {
  var WContourGlass,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WContourGlass = (function(_super) {

    __extends(WContourGlass, _super);

    function WContourGlass(canvas, x, y, glass, spec) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.glass = glass;
      this.spec = spec != null ? spec : {};
      this.stop_manual_diff = __bind(this.stop_manual_diff, this);
      this.hide_longdrink = __bind(this.hide_longdrink, this);
      this.show_longdrink = __bind(this.show_longdrink, this);
      this.start_manual_diff = __bind(this.start_manual_diff, this);
      WContourGlass.__super__.constructor.call(this, this.canvas, this.x, this.y, this.glass, this.spec);
      this._draw();
      this.place_at(this.x, this.y);
      this.move_handler = null;
      this.graph = null;
    }

    WContourGlass.prototype.start_manual_diff = function() {
      this.glasspane.mouseover(this.show_longdrink);
      return this.glasspane.mouseout(this.hide_longdrink);
    };

    WContourGlass.prototype.show_longdrink = function() {
      var _ref;
      this.longdrink.show();
      this.lml.show();
      this.lbl.show();
      this.ll.show();
      this.lf.show();
      this.llp.show();
      this.lrp.show();
      this.move_handler = (_ref = this.move_handler) != null ? _ref : this.move_longdrink(this);
      return this.glasspane.mousemove(this.move_handler);
    };

    WContourGlass.prototype.hide_longdrink = function() {
      this.longdrink.hide();
      this.lml.hide();
      this.lbl.hide();
      this.ll.hide();
      this.lf.hide();
      this.llp.hide();
      this.lrp.hide();
      this.lgl.hide();
      return this.gp.hide();
    };

    WContourGlass.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: x - this.canvas.canvas.parentNode.offsetLeft,
        y: y - this.canvas.canvas.parentNode.offsetTop
      };
      return point;
    };

    WContourGlass.prototype.set_graph = function(graph) {
      return this.graph = graph;
    };

    WContourGlass.prototype.del_graph = function() {
      return this.graph = null;
    };

    WContourGlass.prototype.move_longdrink = function(glassrep) {
      var _this = this;
      return function(e, x, y) {
        var BELOW, OVER_GRAPH_LENGTH, compute_vol, gheight, gpx, gpy, gvol, h, halfvol, halfvolpx, hi, left, length, lglpath, line, p, path, ph, py, r, right, rmm, vol;
        p = glassrep.fit_point(x, y);
        py = p.y - _this.dy;
        ph = glassrep.points.foot.right.y - py;
        h = Math.ceil((ph / glassrep.glass.unit) * Glass.TENTH_OF_MM);
        length = glassrep.lengths[h];
        right = Raphael.getPointAtLength(glassrep.glass.path, length);
        left = right.x - 2 * (right.x - glassrep.glass.edge.x);
        r = (right.x - left) / 2;
        rmm = r / glassrep.glass.unit;
        hi = Math.floor(20 * glassrep.glass.unit);
        compute_vol = function(rmm, h) {
          var hmm;
          hmm = h / glassrep.glass.unit;
          return Math.floor(Math.PI * Math.pow(rmm, 2) * hmm / 1000);
        };
        while ((compute_vol(rmm, hi) % 2) !== 0 && (compute_vol(rmm, hi) % 10) !== 5) {
          hi++;
        }
        vol = compute_vol(rmm, hi);
        BELOW = 10 * glassrep.glass.unit;
        if (_this.spec.diff_graph && _this.graph) {
          OVER_GRAPH_LENGTH = 1000;
          gheight = Math.ceil(ph / glassrep.glass.unit);
          gvol = _this.glass.volume_at_height(gheight);
          line = _this.graph.computer_line;
          gpx = line.min.x + gvol / line.x_unit.per_pixel;
          gpy = line.max.y - (gheight / 10) / line.y_unit.per_pixel;
          halfvol = vol / 2;
          halfvolpx = halfvol / line.x_unit.per_pixel;
          lglpath = "M" + gpx + "," + gpy + "l" + halfvolpx + "," + (-hi + BELOW) + "M" + gpx + "," + gpy + "l-" + halfvolpx + "," + BELOW;
          _this.lgl.attr({
            path: lglpath
          });
          _this.lgl.show().toFront();
          _this.gp.attr({
            cx: gpx,
            cy: gpy
          });
          _this.gp.show().toFront();
        } else {
          _this.lgl.hide();
          _this.gp.hide();
          OVER_GRAPH_LENGTH = 0;
        }
        _this.lf.attr({
          x: left + _this.dx,
          y: right.y + _this.dy,
          width: right.x - left,
          height: BELOW
        });
        path = "M" + right.x + "," + (right.y - hi + BELOW) + "H" + (-_this.dx + 10);
        path += "M" + right.x + "," + (right.y - hi + BELOW) + "h" + OVER_GRAPH_LENGTH;
        _this.lml.attr({
          path: path,
          transform: "t" + _this.dx + "," + _this.dy
        });
        _this.lml.toFront();
        path = "M" + right.x + "," + (right.y + BELOW) + "H" + (-_this.dx + 10);
        path += "M" + right.x + "," + (right.y + BELOW) + "h" + OVER_GRAPH_LENGTH;
        _this.lbl.attr({
          path: path,
          transform: "t" + _this.dx + "," + _this.dy
        });
        _this.lbl.toFront();
        path = "M" + right.x + "," + (right.y + BELOW) + "v-" + (hi + 10) + "M" + right.x + "," + (right.y + BELOW) + "L" + left + "," + (right.y + BELOW) + "v-" + (hi + 10);
        _this.longdrink.attr({
          path: path,
          transform: "t" + _this.dx + "," + _this.dy
        });
        _this.llp.attr({
          cx: left + _this.dx,
          cy: right.y + _this.dy
        });
        _this.lrp.attr({
          cx: right.x + _this.dx,
          cy: right.y + _this.dy
        });
        return _this.ll.attr({
          text: "" + vol + " ml",
          transform: "t" + (left + _this.dx + 10) + "," + (right.y - hi + _this.dy - 10 + BELOW)
        });
      };
    };

    WContourGlass.prototype.stop_manual_diff = function() {
      this.longdrink.hide();
      this.lgl.hide();
      this.gp.hide();
      this.glasspane.unmousemove(this.move_handler);
      this.glasspane.unmouseover(this.show_longdrink);
      return this.glasspane.unmouseout(this.hide_longdrink);
    };

    WContourGlass.prototype.fill_to_height = function(height_in_mm) {
      /*
          Update the fill-part to correspond to a water level equal to the height_in_mm.
      */
      var diameter, height, left, length, right;
      diameter = function(length, glass) {
        return Math.abs(Raphael.getPointAtLength(glass.path, length).x - glass.foot.x) * 2;
      };
      height = this.glass.foot.y - (height_in_mm * this.glass.unit);
      if (height < this.glass.bowl.y) {
        this.points.water_level = {};
        this.points.water_level.length = length = this.lengths[height_in_mm * Glass.TENTH_OF_MM];
        this.points.water_level.right = right = Raphael.getPointAtLength(this.glass.path, length);
        this.points.water_level.left = {
          x: right.x - diameter(length, this.glass),
          y: right.y
        };
        right = Raphael.path2curve(Raphael.getSubpath(this.glass.path, this.points.water_level.length, this.points.bowl.length));
        left = this._mirror_path_vertically(right, this.glass.bowl.x);
        return this.water_level.attr({
          path: right + ("H" + this.points.bowl.left.x) + left
        });
      }
    };

    WContourGlass.prototype._draw = function() {
      var base, bowl, max_ml_representation, max_x, max_y, maxpoint;
      this.paths = this._create_paths();
      base = this.canvas.path(this.paths.base);
      base.attr({
        fill: '#aaa',
        stroke: 'black',
        'stroke-width': 2
      });
      this.widgets.push(base);
      this.water_level = this.canvas.path("M0,0");
      this.water_level.attr({
        fill: '#abf',
        'fill-opacity': 0.4,
        stroke: 'none'
      });
      this.widgets.push(this.water_level);
      bowl = this.canvas.path(this.paths.bowl);
      bowl.attr({
        stroke: 'black',
        'stroke-width': 2
      });
      this.widgets.push(bowl);
      maxpoint = Raphael.getPointAtLength(this.glass.path, this.lengths[this.glass.maximum_height * Glass.TENTH_OF_MM]);
      max_x = maxpoint.x;
      max_y = maxpoint.y;
      this.max_ml = new MeasureLine(this.glass.maximum_volume, this.glass.maximum_height, this.glass, {
        x: max_x,
        y: max_y
      }, 'right', true, false);
      max_ml_representation = new WMeasureLine(this.canvas, max_x, max_y, this.max_ml);
      this.widgets.push(max_ml_representation.widgets);
      this.lf = this.canvas.rect(0, 0, 0, 0);
      this.lf.attr({
        fill: 'orange',
        'fill-opacity': 0.5,
        'stroke': 'none'
      });
      this.lf.hide();
      this.lml = this.canvas.path("M0,0");
      this.lml.attr({
        stroke: 'orange',
        'stroke-opacity': 0.5,
        'stroke-dasharray': '-'
      });
      this.lml.hide();
      this.lbl = this.canvas.path("M0,0");
      this.lbl.attr({
        stroke: 'orange',
        'stroke-opacity': 0.5,
        'stroke-dasharray': '-'
      });
      this.lbl.hide();
      this.longdrink = this.canvas.path("M0,0");
      this.longdrink.attr({
        stroke: 'orange',
        'stroke-width': 3,
        'stroke-opacity': 0.9
      });
      this.longdrink.hide();
      this.lgl = this.canvas.path("M0,0");
      this.lgl.attr({
        stroke: 'orange',
        'stroke-width': 3,
        'stroke-opacity': 0.9
      });
      this.lgl.hide();
      this.gp = this.canvas.circle(0, 0, 2);
      this.gp.attr({
        fill: 'gray'
      });
      this.gp.hide();
      this.ll = this.canvas.text(0, 0, "250 ml");
      this.ll.attr({
        'font-family': 'sans-serif',
        'font-size': '12pt',
        'text-anchor': 'start',
        fill: 'gray'
      });
      this.ll.hide();
      this.llp = this.canvas.circle(0, 0, 2);
      this.llp.attr({
        fill: 'gray'
      });
      this.llp.hide();
      this.lrp = this.canvas.circle(0, 0, 2);
      this.lrp.attr({
        fill: 'gray'
      });
      this.lrp.hide();
      this.glasspane = this.canvas.path(this.paths.bowl);
      this.glasspane.attr({
        fill: 'white',
        'fill-opacity': 0,
        'stroke-width': 5,
        'stroke-opacity': 0
      });
      return this.widgets.push(this.glasspane);
    };

    WContourGlass.prototype._create_paths = function() {
      /*
          Create the path of the part of this glass
      */
      var left, paths, right;
      paths = {};
      right = Raphael.path2curve(Raphael.getSubpath(this.glass.path, this.points.bowl.length, this.points.foot.length));
      left = this._mirror_path_vertically(right, this.glass.foot.x);
      paths.base = right + ("H" + this.points.foot.left.x) + left;
      right = Raphael.path2curve(Raphael.getSubpath(this.glass.path, this.points.edge.length, this.points.bowl.length));
      left = this._mirror_path_vertically(right, this.glass.foot.x);
      paths.bowl = right + ("H" + this.points.bowl.left.x) + left;
      return paths;
    };

    WContourGlass.prototype._compute_geometry = function() {
      var base, bowl;
      base = Raphael.pathBBox(this.paths.base);
      bowl = Raphael.pathBBox(this.paths.bowl);
      this.geometry = {};
      this.geometry.top = bowl.y;
      this.geometry.left = Math.min(base.x, bowl.x);
      this.geometry.bottom = base.y2;
      this.geometry.right = Math.max(base.x2, bowl.b2);
      this.geometry.width = Math.max(base.width, bowl.width);
      this.geometry.height = base.height + bowl.height;
      return this.geometry.center = {
        x: (this.geometry.right - this.geometry.left) / 2 + this.geometry.left,
        y: (this.geometry.bottom - this.geometry.top) / 2 + this.geometry.top
      };
    };

    return WContourGlass;

  })(WGlass);

  window.WContourGlass = WContourGlass;

}).call(this);
