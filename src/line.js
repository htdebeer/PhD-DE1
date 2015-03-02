(function() {

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Line = (function() {

    function _Class(left, top, width, height, x_unit, y_unit, record) {
      this.x_unit = x_unit;
      this.y_unit = y_unit;
      this.record = record != null ? record : false;
      this.min = {
        x: left,
        y: top
      };
      this.max = {
        x: this.min.x + width,
        y: this.min.y + height
      };
      if (this.record) {
        this.history = [];
        this.start_time = Date.now();
      }
      this.points = [];
      this.selected = {
        point: -1,
        line: -1
      };
      this.move_buffer = {
        x: 0,
        y: 0
      };
    }

    _Class.prototype.to_json = function() {
      var eo, eopoint, index, point, _len, _ref;
      eo = {
        x_unit: this.x_unit,
        y_unit: this.y_unit,
        min: {
          x: this.min.x,
          y: this.min.y
        },
        max: {
          x: this.max.x,
          y: this.max.y
        },
        record: this.record,
        points: []
      };
      if (this.record) {
        eo.start_time = this.start_time;
        eo.history = this.history.join(' ');
      }
      _ref = this.points;
      for (index = 0, _len = _ref.length; index < _len; index++) {
        point = _ref[index];
        eopoint = {
          index: index,
          x: point.x,
          y: point.y
        };
        switch (point.segment.type) {
          case 'none':
            eopoint.segment = 'none';
            break;
          case 'straight':
            eopoint.segment = 'straight';
            break;
          case 'curve':
            eopoint.segment = 'curve';
            eopoint.c1 = {
              x: point.segment.c1.x,
              y: point.segment.c1.y
            };
            eopoint.c2 = {
              x: point.segment.c2.x,
              y: point.segment.c2.y
            };
            break;
          case 'freehand':
            eopoint.segment = 'freehand';
            eopoint.path = point.segment.path;
        }
        eo.points[index] = eopoint;
      }
      return JSON.stringify(eo);
    };

    _Class.prototype.get_point = function(p) {
      return this.points[p];
    };

    _Class.prototype.find_point_at = function(x) {
      var p;
      p = 0;
      while (p < this.points.length && this.points[p].x !== x) {
        p++;
      }
      return p = p === this.points.length ? -1 : p;
    };

    _Class.prototype.point_in_circle = function(p, x, y, r) {
      var q, result;
      q = this.points[p];
      result = ((q.x - r < x && x < q.x + r)) && ((q.y - r < y && y < q.y + r));
      return result;
    };

    _Class.prototype.find_point_near = function(x, y, r) {
      var ar, found, _ref;
      if (r == null) r = 1;
      found = -1;
      ar = 0;
      while (found === -1 && ar < r) {
        found = Math.max(this.find_point_at(x + ar), this.find_point_at(x - ar));
        if (found !== -1 && (y - ar <= (_ref = this.points[found].y) && _ref <= y + ar)) {
          break;
        } else {
          found = -1;
        }
        ar++;
      }
      return found;
    };

    _Class.prototype.find_point_around = function(x, y, r) {
      var ax, ay, p;
      if (r == null) r = 10;
      ax = x;
      ay = y;
      while (p < this.points.length && !this.point_in_circle(p, x, y, r)) {
        p++;
      }
      return p = p !== this.points.length ? p : -1;
    };

    _Class.prototype.find_point_to_the_left_of = function(x) {
      var p;
      p = 0;
      while (p < this.points.length && this.points[p].x < x) {
        p++;
      }
      p -= 1;
      return p;
    };

    _Class.prototype.can_add_point = function(x, y) {
      var p, result;
      result = false;
      if (((this.min.x <= x && x <= this.max.x)) && ((this.min.y <= y && y <= this.max.y))) {
        p = this.find_point_to_the_left_of(x);
        if (p === -1) {
          result = true;
        } else {
          if (p === this.points.length - 1) {
            result = true;
          } else {
            if (this.points[p + 1].x !== x && this.points[p].segment.type === 'none') {
              result = true;
            } else {
              result = false;
            }
          }
        }
      } else {
        result = false;
      }
      return result;
    };

    _Class.prototype.can_remove_point = function(p) {
      var result;
      result = false;
      if (p === 0) {
        result = this.points[0].segment.type === 'none';
      } else {
        if (this.points.length > 1) {
          result = this.points[p - 1].segment.type === 'none' && this.points[p].segment.type === 'none';
        }
      }
      return result;
    };

    _Class.prototype.can_add_line = function(x) {
      var p;
      p = this.find_point_to_the_left_of(x);
      return (-1 < p && p < this.points.length - 1) && this.points[p].segment.type === 'none';
    };

    _Class.prototype.can_add_line_to_point = function(p) {
      return this.points[p].segment.type === 'none' && p !== this.points.length;
    };

    _Class.prototype.can_remove_line_from_point = function(p) {
      return this.points[p].segment.type !== 'none';
    };

    _Class.prototype.can_move_point = function(p, x, y) {
      var result;
      result = false;
      if ((this.min.x <= x && x <= this.max.x) && (this.min.y <= y && y <= this.max.y)) {
        if ((0 < p && p < this.points.length - 1)) {
          if ((this.points[p - 1].x < x && x < this.points[p + 1].x)) {
            result = true;
          }
        } else {
          if (this.points.length === 1) {
            result = true;
          } else {
            if (p === 0) {
              result = x < this.points[p + 1].x;
            } else {
              result = this.points[p - 1].x < x;
            }
          }
        }
      }
      return result;
    };

    _Class.prototype.can_move_control_point = function(p, x, y) {
      var result;
      result = false;
      if ((this.min.x <= x && x <= this.max.x) && (this.min.y <= y && y <= this.max.y)) {
        result = true;
      }
      return result;
    };

    _Class.prototype.start_time = function() {
      return this.start_time = Date.now();
    };

    _Class.prototype.add_point = function(x, y, rep) {
      var head, p, point, tail, time;
      p = this.find_point_to_the_left_of(x);
      head = [];
      if (!(p < 0)) head = this.points.slice(0, p + 1 || 9e9);
      tail = p === this.points.length - 1 ? [] : this.points.slice(p + 1);
      point = {
        x: x,
        y: y,
        segment: {
          type: 'none'
        },
        representation: rep
      };
      this.points = head.concat(point, tail);
      if (this.record) {
        time = Date.now() - this.start_time;
        this.history.push("AP" + (p + 1) + ":" + x + "," + y + "@" + time);
      }
      return point;
    };

    _Class.prototype.remove_point = function(p) {
      var head, tail, time;
      head = this.points.slice(0, p);
      tail = p === this.points.length - 1 ? [] : this.points.slice(p + 1);
      this.points = head.concat(tail);
      if (this.record) {
        time = Date.now() - this.start_time;
        return this.history.push("RP" + p + "@" + time);
      }
    };

    _Class.prototype.add_straight_line = function(p) {
      var time;
      this.points[p].segment.type = 'straight';
      if (this.record) {
        time = Date.now() - this.start_time;
        return this.history.push("AS" + p + "@" + time);
      }
    };

    _Class.prototype.add_curved_line = function(p, d, left, right, lleft, lright) {
      var time;
      this.points[p].segment.type = 'curve';
      this.points[p].segment.c1 = {
        x: this.points[p].x + d,
        y: this.points[p].y,
        representation: left,
        line: lleft
      };
      this.points[p].segment.c2 = {
        x: this.points[p + 1].x - d,
        y: this.points[p + 1].y,
        representation: right,
        line: lright
      };
      if (this.record) {
        time = Date.now() - this.start_time;
        return this.history.push("AC" + p + "@" + time);
      }
    };

    _Class.prototype.add_freehand_line = function(p, path) {
      var time;
      this.points[p].segment.type = 'freehand';
      this.points[p].segment.path = path;
      if (this.record) {
        time = Date.now() - this.start_time;
        return this.history.push("AF" + p + ":" + path + "@" + time);
      }
    };

    _Class.prototype.remove_line = function(p) {
      var time;
      this.points[p].segment.type = 'none';
      if (this.record) {
        time = Date.now() - this.start_time;
        return this.history.push("RL" + p + "@" + time);
      }
    };

    _Class.prototype.move_point = function(p, x, y, do_record) {
      var time;
      if (do_record == null) do_record = false;
      if (!do_record) {
        this.points[p].x = x;
        this.points[p].y = y;
      }
      if (this.record) {
        if (do_record) {
          time = Date.now() - this.start_time;
          return this.history.push("MP" + p + ":" + this.move_buffer.x + "," + this.move_buffer.y + "@" + time);
        } else {
          return this.move_buffer = {
            x: x,
            y: y
          };
        }
      }
    };

    _Class.prototype.move_control_point1 = function(p, x, y, do_record) {
      var time;
      if (do_record == null) do_record = false;
      if ((this.min.x <= x && x <= this.max.x) && (this.min.y <= y && y <= this.max.y)) {
        if (!do_record) {
          this.points[p].segment.c1.x = x;
          this.points[p].segment.c1.y = y;
        }
      }
      if (this.record) {
        if (do_record) {
          time = Date.now() - this.start_time;
          return this.history.push("M1C" + p + ":" + this.move_buffer.x + "," + this.move_buffer.y + "@" + time);
        } else {
          return this.move_buffer = {
            x: x,
            y: y
          };
        }
      }
    };

    _Class.prototype.move_control_point2 = function(p, x, y, do_record) {
      var time;
      if (do_record == null) do_record = false;
      if ((this.min.x <= x && x <= this.max.x) && (this.min.y <= y && y <= this.max.y)) {
        if (!do_record) {
          this.points[p].segment.c2.x = x;
          this.points[p].segment.c2.y = y;
        }
      }
      if (this.record) {
        if (do_record) {
          time = Date.now() - this.start_time;
          return this.history.push("M2C" + p + ":" + this.move_buffer.x + "," + this.move_buffer.y + "@" + time);
        } else {
          return this.move_buffer = {
            x: x,
            y: y
          };
        }
      }
    };

    _Class.prototype.select_line = function(p) {
      this.selected.line = p;
      return this.selected.point = -1;
    };

    _Class.prototype.select_point = function(p) {
      this.selected.point = p;
      return this.selected.line = -1;
    };

    _Class.prototype.deselect = function() {
      this.selected.point = -1;
      return this.selected.line = -1;
    };

    _Class.prototype.to_path = function() {
      var i, p, path, q;
      path = '';
      i = 0;
      while (i < this.points.length) {
        p = this.points[i];
        q = this.points[i + 1];
        switch (p.segment.type) {
          case 'none':
            path += "M" + p.x + "," + p.y;
            break;
          case 'straight':
            path += "M" + p.x + "," + p.y + "L" + q.x + "," + q.y;
            break;
          case 'curve':
            path += "M" + p.x + "," + p.y + "C" + p.segment.c1.x + "," + p.segment.c1.y + "," + p.segment.c2.x + "," + p.segment.c2.y + "," + q.x + "," + q.y;
            break;
          case 'freehand':
            path += p.segment.path;
        }
        i++;
      }
      return path;
    };

    return _Class;

  })();

}).call(this);
