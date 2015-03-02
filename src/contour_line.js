(function() {

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.ContourLine = (function() {

    function _Class(left, top, width, height, mm_per_pixel, record) {
      var FOOTHEIGHT, STEMHEIGHT, STEMWIDTH;
      this.mm_per_pixel = mm_per_pixel;
      this.record = record != null ? record : false;
      this.mid = {
        x: left,
        y: Math.floor(top + height / 2)
      };
      this.min = {
        x: left - width,
        y: top,
        width: 25
      };
      this.max = {
        x: left + width,
        y: top + height
      };
      FOOTHEIGHT = 20;
      STEMWIDTH = 10;
      STEMHEIGHT = 20;
      this.foot = {
        x: Math.floor(this.mid.x + width / 3),
        y: this.max.y,
        border: 'foot',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0
          },
          c2: {
            x: 0,
            y: 0
          }
        }
      };
      this.stem = {
        x: Math.floor(this.mid.x + width / 3),
        y: Math.floor(this.max.y - FOOTHEIGHT),
        border: 'stem',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0
          },
          c2: {
            x: 0,
            y: 0
          }
        }
      };
      this.bowl = {
        x: Math.floor(this.mid.x + width / 3),
        y: Math.floor(this.max.y - (FOOTHEIGHT + STEMHEIGHT)),
        border: 'bowl',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0
          },
          c2: {
            x: 0,
            y: 0
          }
        }
      };
      this.edge = {
        x: Math.floor(this.mid.x + width / 3),
        y: Math.floor(this.max.y - (height / 2)),
        border: 'edge',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          },
          c2: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          }
        }
      };
      this.points = [this.edge, this.bowl, this.stem, this.foot];
    }

    _Class.prototype.get_point = function(p) {
      return this.points[p];
    };

    _Class.prototype.get_point_above_height = function(h) {
      var p;
      p = 0;
      while (p < this.points.length && this.points[p].y < h) {
        p++;
      }
      return p - 1;
    };

    _Class.prototype.can_add_point = function(x, y) {
      var p, point, result;
      result = false;
      p = this.get_point_above_height(y);
      if (p !== -1) {
        point = this.points[p];
        if (point.y === y) {
          result = false;
        } else {
          result = true;
        }
      }
      return result;
    };

    _Class.prototype.can_remove_point = function(p) {
      return this.points[p].border === 'none';
    };

    _Class.prototype.can_move_point = function(p, x, y, r) {
      var result;
      if (r == null) r = 1;
      result = false;
      if ((this.mid.x + r <= x && x <= this.max.x) && (this.min.y <= y && y <= this.max.y)) {
        if ((0 < p && p < this.points.length - 1)) {
          if ((this.points[p - 1].y + r < y && y < this.points[p + 1].y - r)) {
            result = true;
          }
        } else {
          if (p === 0) {
            result = y < this.points[p + 1].y && x >= (this.mid.x + this.min.width);
          } else {
            result = this.points[p - 1].y < y;
          }
        }
      }
      return result;
    };

    _Class.prototype.can_move_control_point = function(p, x, y) {
      var above, below;
      if (p < this.points.length - 1) {
        above = this.points[p];
        below = this.points[p + 1];
        return (this.mid.x <= x && x <= this.max.x) && (above.y <= y && y <= below.y);
      } else {
        return false;
      }
    };

    _Class.prototype.can_move_border = function(border, x, y) {};

    _Class.prototype.find_point_at = function(y, r) {
      var p, _ref;
      if (r == null) r = 1;
      p = 0;
      while (p < this.points.length && !(((y - r) <= (_ref = this.points[p].y) && _ref <= (y + r)))) {
        p++;
      }
      return p = p === this.points.length ? -1 : p;
    };

    _Class.prototype.find_point_near = function(x, y, r) {
      var ar, found, _ref;
      if (r == null) r = 1;
      found = -1;
      ar = 0;
      while (found === -1 && ar < r) {
        found = Math.max(this.find_point_at(y + ar), this.find_point_at(y - ar));
        if (found !== -1 && (x - ar <= (_ref = this.points[found].x) && _ref <= x + ar)) {
          break;
        } else {
          found = -1;
        }
        ar++;
      }
      return found;
    };

    _Class.prototype.add_point = function(x, y, representation) {
      var above, below, head, p, point, tail;
      p = this.get_point_above_height(y);
      head = [];
      if (!(p < 0)) head = this.points.slice(0, p + 1 || 9e9);
      tail = this.points.slice(p + 1);
      above = this.points[p];
      below = this.points[p + 1];
      point = {
        x: x,
        y: y,
        border: 'none',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          },
          c2: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          }
        },
        representation: representation
      };
      above.segment.c2.y = y - Math.abs(above.segment.c2.y - below.y);
      this.points = head.concat(point, tail);
      return point;
    };

    _Class.prototype.remove_point = function(p) {
      var head, tail;
      head = this.points.slice(0, p);
      tail = p === this.points.length - 1 ? [] : this.points.slice(p + 1);
      return this.points = head.concat(tail);
    };

    _Class.prototype.move_point = function(p, x, y) {
      this.points[p].x = x;
      this.points[p].y = y;
      if (this.points[p].segment.type === 'curve') this.set_control_points(p);
      if (p !== 0 && this.points[p - 1].segment.type === 'curve') {
        return this.set_control_points(p - 1);
      }
    };

    _Class.prototype.set_control_points = function(p) {
      var above, below, dxc1, dxc2, dy;
      if (p !== this.points.length - 1) {
        above = this.points[p];
        below = this.points[p + 1];
        dxc1 = Math.abs(this.mid.x - above.x) / 2;
        dxc2 = Math.abs(this.mid.x - below.x) / 2;
        dy = Math.abs(above.y - below.y) / 4;
        above.segment.c1.x = above.x - dxc1;
        above.segment.c1.y = above.y + dy;
        above.segment.c2.x = below.x - dxc2;
        return above.segment.c2.y = below.y - dy;
      }
    };

    _Class.prototype.make_curve = function(p) {
      var point_segment;
      point_segment = this.points[p].segment;
      point_segment.type = 'curve';
      return this.set_control_points(p);
    };

    _Class.prototype.make_straight = function(p) {
      this.points[p].segment.type = 'straight';
      this.points[p].segment.c1.representation.remove();
      this.points[p].segment.c1.line.remove();
      this.points[p].segment.c2.line.remove();
      this.points[p].segment.c2.representation.remove();
      this.points[p].segment.c1.representation = null;
      this.points[p].segment.c1.line = null;
      this.points[p].segment.c2.line = null;
      return this.points[p].segment.c2.representation = null;
    };

    _Class.prototype.move_control_point = function(p, cp, x, y) {
      var point;
      if (cp === 1) {
        point = this.points[p].segment.c1;
      } else {
        point = this.points[p].segment.c2;
      }
      point.x = x;
      return point.y = y;
    };

    _Class.prototype.move_border = function(border, x, y) {};

    _Class.prototype.to_path = function() {
      var i, p, path, q;
      p = this.points[0];
      path = "M" + p.x + "," + p.y;
      i = 0;
      while (i < this.points.length - 1) {
        p = this.points[i];
        q = this.points[i + 1];
        switch (p.segment.type) {
          case 'straight':
            path += "L" + q.x + "," + q.y;
            break;
          case 'curve':
            path += "C" + p.segment.c1.x + "," + p.segment.c1.y + "," + p.segment.c2.x + "," + p.segment.c2.y + "," + q.x + "," + q.y;
        }
        i++;
      }
      return path;
    };

    _Class.prototype.to_glass_path = function(part) {
      var i, mid, mirror, p, path, q;
      if (part == null) part = 'full';
      i = 0;
      switch (part) {
        case 'full':
          i = 0;
          break;
        case 'base':
          while (this.points[i].border !== 'bowl') {
            i++;
          }
      }
      p = this.points[i];
      path = "M" + p.x + "," + p.y;
      while (i < this.points.length - 1) {
        p = this.points[i];
        q = this.points[i + 1];
        switch (p.segment.type) {
          case 'straight':
            path += "L" + q.x + "," + q.y;
            break;
          case 'curve':
            path += "C" + p.segment.c1.x + "," + p.segment.c1.y + "," + p.segment.c2.x + "," + p.segment.c2.y + "," + q.x + "," + q.y;
        }
        i++;
      }
      mid = this.mid;
      mirror = function(x) {
        return x - 2 * (x - mid.x);
      };
      p = this.points[i];
      path += "H" + (mirror(p.x));
      while (i > 0) {
        p = this.points[i];
        q = this.points[i - 1];
        if (part === 'base' && p.border === 'bowl') {
          path += "H" + p.x + "H" + (mirror(p.x));
          break;
        }
        switch (q.segment.type) {
          case 'straight':
            path += "L" + (mirror(q.x)) + "," + q.y;
            break;
          case 'curve':
            path += "C" + (mirror(q.segment.c2.x)) + "," + q.segment.c2.y + "," + (mirror(q.segment.c1.x)) + "," + q.segment.c1.y + "," + (mirror(q.x)) + "," + q.y;
        }
        i--;
      }
      return path;
    };

    _Class.prototype.to_glass = function(spec) {
      var glass, height_in_mm, midbowl, midedge, midfoot, midstem, path;
      height_in_mm = Math.floor((this.foot.y - this.edge.y) * this.mm_per_pixel);
      path = this.to_relative_path();
      midfoot = {
        x: this.mid.x,
        y: this.foot.y
      };
      midstem = {
        x: this.mid.x,
        y: this.stem.y
      };
      midbowl = {
        x: this.mid.x,
        y: this.bowl.y
      };
      midedge = {
        x: this.mid.x,
        y: this.edge.y
      };
      glass = new Glass(path, midfoot, midstem, midbowl, midedge, height_in_mm, spec);
      return glass;
    };

    _Class.prototype.from_glass = function(glass) {
      var factor, mm_per_pixel;
      mm_per_pixel = glass.height_in_mm / (glass.foot.y - glass.edge.y);
      return factor = this.mm_per_pixel / mm_per_pixel;
    };

    _Class.prototype.to_relative_path = function() {
      var elt, path, relpath, relsegs, seg, _i, _j, _len, _len2;
      path = this.to_path();
      relsegs = Raphael.pathToRelative(path);
      relpath = "";
      for (_i = 0, _len = relsegs.length; _i < _len; _i++) {
        seg = relsegs[_i];
        for (_j = 0, _len2 = seg.length; _j < _len2; _j++) {
          elt = seg[_j];
          relpath += "" + elt + " ";
        }
      }
      return relpath.replace(/\s$/, '');
    };

    return _Class;

  })();

}).call(this);
