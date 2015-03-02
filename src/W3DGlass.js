
/*

(c) 2012, Huub de Beer, H.T.de.Beer@gmail.com
*/

(function() {
  var W3DGlass,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  W3DGlass = (function(_super) {

    __extends(W3DGlass, _super);

    function W3DGlass(canvas, x, y, glass, spec) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.glass = glass;
      this.spec = spec != null ? spec : {};
      W3DGlass.__super__.constructor.call(this, this.canvas, this.x, this.y, this.glass, this.spec);
      this._draw();
      this.place_at(this.x, this.y);
    }

    W3DGlass.prototype.fill_to_height = function(height_in_mm) {
      /*
          Update the fill-parts to correspond to a water level equal to the height_in_mm.
      */
      var diameter, height, length, right;
      diameter = function(length, glass) {
        return Math.abs(Raphael.getPointAtLength(glass.path, length).x - glass.foot.x) * 2;
      };
      height = this.glass.foot.y - (height_in_mm * this.glass.unit);
      if (height <= this.glass.bowl.y) {
        this.points.water_level = {};
        this.points.water_level.length = length = this.lengths[height_in_mm * Glass.TENTH_OF_MM];
        this.points.water_level.right = right = Raphael.getPointAtLength(this.glass.path, length);
        this.points.water_level.left = {
          x: right.x - diameter(length, this.glass),
          y: right.y
        };
        this.current_length = length;
        this.fillback.attr({
          path: this._create_path('bowl', 'water_level', 'back')
        });
        return this.fillfront.attr({
          path: this._create_path('bowl', 'water_level', 'front')
        });
      }
    };

    W3DGlass.prototype._draw = function() {
      var baseback, basefront, basemid, bowlback, bowlfront, bowlmid, max_ml_representation, max_x, max_y, maxpoint;
      bowlback = this.canvas.path(this._create_path('bowl', 'edge', 'back'));
      bowlback.attr({
        fill: '344-#fff:10-#eee:75',
        'fill-opacity': 0.4,
        stroke: '#eee'
      });
      this.widgets.push(bowlback);
      baseback = this.canvas.path(this._create_path('foot', 'bowl', 'back'));
      baseback.attr({
        fill: '344-#eee-#fff-#eee-#ccc',
        'fill-opacity': 0.4,
        stroke: '#eee'
      });
      this.widgets.push(baseback);
      this.fillback = this.canvas.path("m0,0");
      this.fillback.attr({
        fill: '348-#abf-#abf:50',
        'fill-opacity': 0.4,
        stroke: 'none'
      });
      this.widgets.push(this.fillback);
      bowlmid = this.canvas.path(this._create_path('bowl', 'edge', 'mid'));
      bowlmid.attr({
        stroke: '#eee'
      });
      this.widgets.push(bowlmid);
      basemid = this.canvas.path(this._create_path('foot', 'bowl', 'mid'));
      basemid.attr({
        stroke: '#eee'
      });
      this.widgets.push(basemid);
      this.fillfront = this.canvas.path("m0,0");
      this.fillfront.attr({
        fill: '348-#abf-#abf:50',
        'fill-opacity': 0.4,
        stroke: 'none'
      });
      this.widgets.push(this.fillfront);
      bowlfront = this.canvas.path(this._create_path('bowl', 'edge', 'front'));
      bowlfront.attr({
        fill: '270-#fff-#eee:5',
        'fill-opacity': 0.4,
        stroke: '#eee'
      });
      this.widgets.push(bowlfront);
      basefront = this.canvas.path(this._create_path('foot', 'bowl', 'front'));
      basefront.attr({
        fill: '350-#eee:5-#eee:15',
        'fill-opacity': 0.2,
        stroke: '#eee'
      });
      this.widgets.push(basefront);
      maxpoint = Raphael.getPointAtLength(this.glass.path, this.lengths[this.glass.maximum_height * Glass.TENTH_OF_MM]);
      max_x = maxpoint.x;
      max_y = maxpoint.y;
      this.max_ml = new MeasureLine(this.glass.maximum_volume, this.glass.maximum_height, this.glass, {
        x: max_x,
        y: max_y
      }, 'right', true, false);
      max_ml_representation = new WMeasureLine(this.canvas, max_x, max_y, this.max_ml, this.glass.foot, {
        bend: true
      });
      return this.widgets.push(max_ml_representation.widgets);
    };

    W3DGlass.prototype._create_path = function(bottom, top, kind) {
      /*
          Create the paths of this glass for bowl and base
      */
      var left, path, right;
      path = "";
      switch (kind) {
        case 'back':
          right = Raphael.path2curve(Raphael.getSubpath(this.glass.path, this.points[top].length, this.points[bottom].length));
          left = this._mirror_path_vertically(right, this.glass.foot.x);
          bottom = this._connect(this.points[bottom].right, this.points[bottom].left, false, 'belowbend');
          top = this._connect(this.points[top].left, this.points[top].right, false, 'abovebend');
          path += right + bottom + left + top;
          break;
        case 'front':
          right = Raphael.path2curve(Raphael.getSubpath(this.glass.path, this.points[top].length, this.points[bottom].length));
          left = this._mirror_path_vertically(right, this.glass.foot.x);
          top = this._connect(this.points[top].right, this.points[top].left, false, 'belowbackbend');
          bottom = this._connect(this.points[bottom].right, this.points[bottom].left, false, 'belowbend');
          path += right + bottom + left + top;
          break;
        case 'mid':
          path += this._connect(this.points[bottom].left, this.points[bottom].right, true, 'abovebend');
      }
      return path;
    };

    W3DGlass.prototype._connect = function(p1, p2, move, type) {
      var BIGBEND, SMALLBEND, d, dh, path;
      if (move == null) move = false;
      if (type == null) type = "straight";
      /*
      */
      SMALLBEND = 15;
      BIGBEND = 10;
      path = "";
      if (move) path = "M" + p1.x + "," + p1.y;
      d = Math.abs(p1.x - p2.x);
      switch (type) {
        case "straight":
          path = path + ("H" + p2.x);
          this.dh = 0;
          break;
        case "abovebend":
          dh = d / SMALLBEND;
          path = path + ("c5,-" + dh + "," + (d - 5) + ",-" + dh + "," + d + ",0");
          break;
        case "abovebackbend":
          dh = d / SMALLBEND;
          path = path + ("c5,-" + dh + ",-" + (d - 5) + ",-" + dh + ",-" + d + ",0");
          break;
        case "belowbend":
          this.dh = d / BIGBEND;
          path = path + ("c0," + this.dh + ",-" + d + "," + this.dh + ",-" + d + ",0");
          break;
        case "belowbackbend":
          this.dh = d / BIGBEND;
          path = path + ("c0," + this.dh + "," + d + "," + this.dh + "," + d + ",0");
      }
      return path;
    };

    W3DGlass.prototype._compute_geometry = function() {
      var base, bowl;
      bowl = Raphael.pathBBox(this._create_path('bowl', 'edge', 'front'));
      base = Raphael.pathBBox(this._create_path('foot', 'bowl', 'front'));
      this.geometry = {};
      this.geometry.top = bowl.y;
      this.geometry.left = Math.min(base.x, bowl.x);
      this.geometry.bottom = base.y2;
      this.geometry.right = Math.max(base.x2, bowl.b2);
      this.geometry.width = Math.max(base.width, bowl.width);
      this.geometry.height = this.points.foot.left.y - this.points.edge.left.y;
      return this.geometry.center = {
        x: (this.geometry.right - this.geometry.left) / 2 + this.geometry.left,
        y: (this.geometry.bottom - this.geometry.top) / 2 + this.geometry.top
      };
    };

    return W3DGlass;

  })(WGlass);

  window.W3DGlass = W3DGlass;

}).call(this);
