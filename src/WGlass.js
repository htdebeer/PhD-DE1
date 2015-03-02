
/*
*/

(function() {
  var WGlass,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WGlass = (function(_super) {

    __extends(WGlass, _super);

    function WGlass(canvas, x, y, glass, spec) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.glass = glass;
      this.spec = spec != null ? spec : {};
      WGlass.__super__.constructor.call(this, this.canvas, this.x, this.y, this.spec);
      this.points = this._compute_points(this.glass);
      this.lengths = this._compute_lengths_at_heigth();
    }

    WGlass.prototype._compute_points = function(glass) {
      /*
          Compute points, lengths, and paths between points for the edge, foot, stem, and bowl
      */
      var diameter, length, line, points, right, _i, _len, _ref;
      diameter = function(length) {
        return Math.abs(Raphael.getPointAtLength(glass.path, length).x - glass.foot.x) * 2;
      };
      points = {};
      length = 0;
      _ref = ['edge', 'bowl', 'stem', 'foot'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        points[line] = {};
        points[line].length = length = this._length_at_y(glass.path, glass[line].y, length);
        points[line].right = right = Raphael.getPointAtLength(glass.path, length);
        points[line].left = {
          x: right.x - diameter(length),
          y: right.y
        };
      }
      return points;
    };

    WGlass.prototype._compute_lengths_at_heigth = function() {
      var height, height_in_pixels, length, lengths, max_length;
      lengths = [];
      length = 0;
      max_length = Raphael.getTotalLength(this.glass.path);
      height = this.glass.height_in_mm * Glass.TENTH_OF_MM;
      while (height > 0) {
        height_in_pixels = this.glass.foot.y - ((height * this.glass.unit) / Glass.TENTH_OF_MM);
        while (length < max_length && Raphael.getPointAtLength(this.glass.path, length).y < height_in_pixels) {
          length++;
        }
        lengths[height] = length;
        height--;
      }
      lengths[0] = this.points.foot.length;
      return lengths;
    };

    WGlass.prototype._length_at_y = function(path, y, start) {
      var length, max_length;
      if (start == null) start = 0;
      /*
            Find the length on the path the path hat intersects the horizontal line at y
      */
      length = start;
      max_length = Raphael.getTotalLength(path);
      while (length < max_length && Raphael.getPointAtLength(path, length).y < y) {
        length++;
      }
      return length;
    };

    WGlass.prototype._mirror_path_vertically = function(path, x_line) {
      /*
      */
      var cp1x, cp1y, cp2x, cp2y, cpath, cpathsegs, mirror, mirror_x, mirrorlist, segment, x, y, _i, _len, _ref, _ref2, _ref3, _ref4;
      mirror_x = function(x) {
        return x_line - Math.abs(x_line - x);
      };
      cpath = Raphael.path2curve(path);
      cpathsegs = Raphael.parsePathString(cpath);
      mirror = "";
      mirrorlist = [];
      _ref = cpathsegs[0].slice(1, 3), x = _ref[0], y = _ref[1];
      _ref2 = cpathsegs.slice(1, cpathsegs.length + 1 || 9e9);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        segment = _ref2[_i];
        _ref3 = segment.slice(1, 5), cp1x = _ref3[0], cp1y = _ref3[1], cp2x = _ref3[2], cp2y = _ref3[3];
        mirrorlist.push([mirror_x(cp2x), cp2y, mirror_x(cp1x), cp1y, mirror_x(x), y]);
        _ref4 = segment.slice(5, 7), x = _ref4[0], y = _ref4[1];
      }
      mirror = ((function() {
        var _j, _len2, _ref5, _results;
        _ref5 = mirrorlist.reverse();
        _results = [];
        for (_j = 0, _len2 = _ref5.length; _j < _len2; _j++) {
          segment = _ref5[_j];
          _results.push('C' + segment.join(","));
        }
        return _results;
      })()).join("");
      return mirror;
    };

    return WGlass;

  })(Widget);

  window.WGlass = WGlass;

}).call(this);
