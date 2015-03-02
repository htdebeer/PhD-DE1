
/*
glass.coffee version 0.1

Modeling different glasses

(c) 2012 Huub de Beer Huub@heerdebeer.org

Long description
*/

(function() {
  var Glass, MeasureLine, W3DGlass, WContourGlass, WGlass, WMeasureLine, WRuler, WVerticalRuler, Widget,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Glass = (function() {

    Glass.TENTH_OF_MM = 10;

    Glass.prototype.to_json = function() {
      var export_object, ml, vol, _ref;
      export_object = {
        path: this.path,
        foot: {
          x: this.foot.x,
          y: this.foot.y
        },
        stem: {
          x: this.stem.x,
          y: this.stem.y
        },
        bowl: {
          x: this.bowl.x,
          y: this.bowl.y
        },
        edge: {
          x: this.edge.x,
          y: this.edge.y
        },
        height_in_mm: this.height_in_mm,
        spec: this.spec,
        measure_lines: {},
        nr_of_measure_lines: this.nr_of_measure_lines
      };
      _ref = this.measure_lines;
      for (vol in _ref) {
        ml = _ref[vol];
        export_object.measure_lines[vol] = {
          volume: ml.model.volume,
          height: ml.model.height,
          initial_position: ml.model.initial_position,
          position: {
            x: ml.model.position.x,
            y: ml.model.position.y
          },
          side: ml.model.side,
          movable: ml.model.movable,
          visible: ml.model.visible
        };
      }
      return JSON.stringify(export_object);
    };

    function Glass(path, foot, stem, bowl, edge, height_in_mm, spec) {
      var import_object, ml, _ref;
      if (spec == null) {
        spec = {
          round_max: "cl",
          mm_from_top: 5
        };
      }
      /*
              pre:
                  path is the right hand side of the countour of the glass
                ∧ 0 ≤ foot.y 
                ∧ foot.y ≤ stem.y 
                ∧ stem.y ≤ bowl.y
                ∧ bowl.y < edge.y
                ∧ 0 < height_in_mm
      
              post:
                  is_empty
      */
      if (arguments.length === 1) {
        import_object = JSON.parse(path);
        this.path = import_object.path;
        this.foot = import_object.foot;
        this.stem = import_object.stem;
        this.bowl = import_object.bowl;
        this.edge = import_object.edge;
        this.height_in_mm = import_object.height_in_mm;
        this.spec = (_ref = import_object != null ? import_object.spec : void 0) != null ? _ref : {
          round_max: "cl",
          mm_from_top: 5
        };
        this.measure_lines = {};
        for (ml in import_object.measure_lines) {
          this.measure_lines[ml.volume] = {
            height: ml.height,
            volume: ml.volume,
            model: new MeasureLine(ml.volume, ml.height, this, ml.initial_position, ml.side, ml.visible, ml.movable),
            representation: null
          };
          this.measure_lines[ml.volume].position = ml.position;
        }
        this.nr_of_measure_lines = import_object.nr_of_measure_lines;
      } else {
        this.path = path;
        this.foot = foot;
        this.stem = stem;
        this.bowl = bowl;
        this.edge = edge;
        this.height_in_mm = height_in_mm;
        this.measure_lines = {};
        this.spec = spec;
        this.nr_of_measure_lines = 0;
      }
      this.unit = Math.abs(this.edge.y - this.foot.y) / this.height_in_mm;
      this.bowl_start = this.height_in_mm - (Math.abs(this.bowl.y - this.edge.y) / this.unit);
      this.r = [];
      this.r = this._compute_r(this.path, this.foot, this.height_in_mm, this.unit);
      this.vol = [];
      this.speed = [];
      this.maximum_volume = 0;
      this.maximum_height = 0;
      this.maximum_speed = 0;
      this._determine_maximum(this.height_in_mm - this.spec.mm_from_top, this.spec.round_max);
      this.make_empty();
    }

    Glass.prototype.compute_speed = function() {
      var dh, dvol, h, h_max, v_prev, vol, _results;
      h = 0;
      h_max = this.vol.length - 1;
      while (this.vol[h] === 0) {
        h++;
      }
      this.speed[0] = 0;
      v_prev = 0;
      this.maximum_speed = 0;
      _results = [];
      while (h <= h_max) {
        vol = this.vol[h];
        dh = 0;
        while (h <= h_max && v_prev === vol) {
          h++;
          dh += 0.01;
          vol = this.vol[h];
        }
        dvol = vol - v_prev;
        this.speed[vol] = dh / dvol;
        this.maximum_speed = Math.max(this.maximum_speed, this.speed[vol]);
        v_prev = vol;
        _results.push(h++);
      }
      return _results;
    };

    Glass.prototype.add_measure_line = function(vol, height, model, representation, on_the_glass) {
      if (on_the_glass == null) on_the_glass = true;
      /*
            Add a measure line to the list with measure lines. A measure line is a pair (vol, height). Vol in ml and height in mm
      */
      if (on_the_glass) {
        this.measure_lines[vol] = {
          height: height,
          volume: vol,
          model: model,
          representation: representation
        };
      } else {
        this.measure_lines[vol] = {
          height: -1,
          volume: vol,
          model: model,
          representation: representation
        };
      }
      return this.nr_of_measure_lines++;
    };

    Glass.prototype.get_measure_line = function(vol) {
      if (this.measure_lines[vol] != null) {
        return this.measure_lines[vol];
      } else {
        return -1;
      }
    };

    Glass.prototype.measure_line_is_correct = function(vol) {
      var height;
      if (this.measure_lines[vol] != null) {
        height = this.measure_lines[vol].height;
        if (this.vol[height] != null) {
          return this.vol[height] === vol;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    Glass.prototype.change_measure_line = function(vol, height, on_the_glass) {
      if (on_the_glass == null) on_the_glass = true;
      return this.measure_lines[vol].height = on_the_glass ? height : -1;
    };

    Glass.prototype.del_measure_line = function(vol) {
      if ((this.measure_lines[vol] != null) && vol !== this.maximum_volume) {
        delete this.measure_lines[vol];
        return this.nr_of_measure_lines--;
      }
    };

    Glass.prototype.make_empty = function(initial_value) {
      if (initial_value == null) initial_value = 0;
      /*
              Empty this glass 
      
              pre:
                  True
      
              post:
                  current_height = 0
                ∧ current_volume = 0
      */
      this.current_volume = 0;
      this.current_height = 0;
      this.current_height = this.fill_to_volume(initial_value);
      this.current_height++;
      return this.current_graph = "M0,0";
    };

    Glass.prototype.is_empty = function() {
      /*
              Is this glass empty?
      
              pre:
                  True
      
              post:
                  True
      
              return:
                  current_volume = 0
      */      return this.current_volume === 0;
    };

    Glass.prototype.is_full = function() {
      /*
              Is this glass full?
      
              pre:
                  True
      
              post:
                  True
      
              return:
                  current_volume = maximum_volume
      */      return this.current_volume === this.maximum_volume;
    };

    Glass.prototype.fill_to_height = function(height) {
      /*
              Fill this glass up to height and return corresponding volume
      
              pre: 
                  height, 0 ≤ height ≤ maximum_height
      
              post:
                  current_height = height
                ∧ current_volume = volume_at_height(height)
      
              return:
                  volume_at_height(height)
      */      if (height <= this.maximum_height) {
        this.current_height = height;
      } else {
        this.current_height = this.maximum_height;
      }
      this.current_volume = this.volume_at_height(this.current_height);
      return this.current_volume;
    };

    Glass.prototype.fill_to_volume = function(volume) {
      /*
              Fill this glass up to volume and return the corresponding water level height.
      
              pre:
                  volume, 0 ≤ volume ≤ maximum_volume
      
              post:
                  current_volume = volume
                ∧ current_height = height_at_volume(volume)
      
              return:
                  height_at_volume(volume)
      */      if (volume <= this.maximum_volume) {
        this.current_volume = volume;
      } else {
        this.current_volume = this.maximum_volume;
      }
      this.current_height = this.height_at_volume(this.current_volume);
      return this.current_height;
    };

    Glass.prototype.speed_at_height = function(height) {
      return this.speed[height * Glass.TENTH_OF_MM];
    };

    Glass.prototype.speed_at_volume = function(vol) {
      var h;
      h = height_at_volume(vol);
      return this.speed[h * Glass.TENTH_OF_MM];
    };

    Glass.prototype.volume_at_height = function(height) {
      /*
              Compute the volume of the water in this glass when it is filled up to
              height. Take in account the shape of the glass: only the bowl of the
              glass can be filled.
      
              pre:
                  height: water level height in mm
      
              post:
                  volume = (∫h: 0 ≤ h ≤ height: πr(h)^2)
      
              return:
                  volume in ml
      */
      var HSTEP, dvol, h;
      HSTEP = 0.01;
      h = Math.ceil(height * Glass.TENTH_OF_MM);
      if (!(this.vol[h] != null)) {
        if (h === 0) {
          this.vol[0] = 0;
          this.speed[0] = 0;
        } else {
          if ((0 <= height && height < this.bowl_start)) {
            this.vol[h] = 0 + this.volume_at_height((h - 1) / Glass.TENTH_OF_MM);
            this.speed[h] = 0;
          } else {
            dvol = Math.PI * Math.pow(this.r[h] / Glass.TENTH_OF_MM, 2) * HSTEP;
            this.vol[h] = dvol + this.volume_at_height((h - 1) / Glass.TENTH_OF_MM);
            this.speed[h] = dvol !== 0 ? HSTEP / dvol : 0;
            this.maximum_speed = Math.max(this.maximum_speed, this.speed[h]);
          }
        }
      }
      return this.vol[h];
    };

    Glass.prototype.height_at_volume = function(volume) {
      /*
              Compute the height of the water level in this glass when there is volume water in it.
      
              pre:
                  0 ≤ volume 
      
              post:
                  height = (h: 0 ≤ h ≤ total_height: vol[h + 1] > volume ∧ vol[h-1] < volume)
              
              return:
                  height in mm
      */
      var height, maxheight;
      height = this.current_height * Glass.TENTH_OF_MM;
      maxheight = this.height_in_mm * Glass.TENTH_OF_MM;
      while (!(this.vol[height] > volume || height >= maxheight)) {
        height++;
      }
      return Math.floor(height / Glass.TENTH_OF_MM);
    };

    Glass.prototype.get_current_graph = function() {
      return this.current_graph = this.graph[Math.ceil(this.current_height * Glass.TENTH_OF_MM)];
    };

    Glass.prototype.create_graph = function(paper, graph, line, x_axis, speed) {
      var EPSILON, add_time, dspeed, dtime, dvol, h, p, path, ptmm, speed_before, speed_step, vollast, x, y;
      if (speed == null) speed = false;
      EPSILON = 0.01;
      switch (x_axis) {
        case 'vol':
          if (speed) {
            ptmm = 1 / 100 / line.y_unit.per_pixel;
            dvol = 0;
            this.graph = [];
            path = "M0,0";
            h = 0;
            while (this.vol[h] === 0) {
              this.graph.push(path);
              h++;
            }
            x = line.min.x;
            y = line.max.y - (this.speed[h] / line.y_unit.per_pixel);
            path = "M" + x + "," + y;
            vollast = 0;
            this.graph.push(path);
            speed_before = this.speed[h];
            while (h < this.vol.length && this.vol[h] < this.maximum_volume) {
              dvol = this.vol[h] - vollast;
              vollast = this.vol[h];
              dspeed = speed_before !== 0 ? this.speed[h] - speed_before : 0;
              speed_before = this.speed[h];
              speed_step = dspeed / line.y_unit.per_pixel * (-1);
              path += "l" + (dvol / line.x_unit.per_pixel) + "," + speed_step;
              this.graph.push(path);
              h++;
            }
            graph.attr({
              path: path
            });
            line.add_point(x, y, graph);
            p = line.find_point_at(x);
            return line.add_freehand_line(p, path);
          } else {
            ptmm = 1 / 100 / line.y_unit.per_pixel;
            dvol = 0;
            this.graph = [];
            path = "M0,0";
            h = 0;
            while (this.vol[h] === 0) {
              this.graph.push(path);
              h++;
            }
            x = line.min.x;
            y = line.max.y - (h / 100 / line.y_unit.per_pixel);
            path = "M" + x + "," + y;
            vollast = 0;
            this.graph.push(path);
            while (h < this.vol.length && this.vol[h] < this.maximum_volume) {
              dvol = this.vol[h] - vollast;
              vollast = this.vol[h];
              path += "l" + (dvol / line.x_unit.per_pixel) + ",-" + ptmm;
              this.graph.push(path);
              h++;
            }
            graph.attr({
              path: path
            });
            line.add_point(x, y, graph);
            p = line.find_point_at(x);
            return line.add_freehand_line(p, path);
          }
          break;
        case 'time':
          ptmm = 1 / 100 / line.y_unit.per_pixel;
          dtime = 0;
          this.graph = [];
          path = "M0,0";
          h = 0;
          while (this.vol[h] === 0) {
            this.graph.push(path);
            h++;
          }
          x = line.min.x;
          y = line.max.y - (h / 100 / line.y_unit.per_pixel);
          path = "M" + x + "," + y;
          vollast = 0;
          add_time = 0;
          this.graph.push(path);
          while (h < this.vol.length && this.vol[h] < this.maximum_volume) {
            dvol = this.vol[h] - vollast;
            vollast = this.vol[h];
            add_time = dvol / speed;
            path += "l" + (add_time / line.x_unit.per_pixel) + ",-" + ptmm;
            this.graph.push(path);
            h++;
          }
          graph.attr({
            path: path
          });
          line.add_point(x, y, graph);
          p = line.find_point_at(x);
          return line.add_freehand_line(p, path);
      }
    };

    Glass.prototype._compute_r = function(path, foot, total_height, unit) {
      /*
              Given a path and the coordinate of the foot on the mid-line of the
              glass, compute the radius of the glass at every height.
              
              pre:
                  path: SVG path of contour of the right side of the glass
                ∧ foot: point of the foot or bottom of the glass on the mid line
              
              post:
                  (∀ h: 0 ≤ h ≤ total_height: r[h] = radius of glass at height h in mm/10 in mm) 
      
              return:
                  r
      */
      var height, length_on_path, point_on_length, r, _ref;
      r = [];
      length_on_path = 0;
      for (height = _ref = total_height * Glass.TENTH_OF_MM; _ref <= 0 ? height <= 0 : height >= 0; _ref <= 0 ? height++ : height--) {
        point_on_length = Raphael.getPointAtLength(path, length_on_path);
        while (Math.abs(foot.y - point_on_length.y) > height * unit / Glass.TENTH_OF_MM) {
          length_on_path++;
          point_on_length = Raphael.getPointAtLength(path, length_on_path);
        }
        r[height] = Math.abs(point_on_length.x - foot.x) / unit;
      }
      return r;
    };

    Glass.prototype._determine_maximum = function(total_height, round_to) {
      var factor, total_volume;
      if (round_to == null) round_to = "cl";
      /*
              Determine the maximum volume and corresponding maximum height of this 
              glass. Round to the first ml, cl, dl, or l below total_height.
      
              pre:
                  0 ≤ total_height
                ∧ round_to ∈ {ml, cl, dl, l}
      
              post:
                  0 ≤ maximum_height < total_height
                ∧ maximum_volume = volume_at_height(maximum_height)
                ∧ height_at_volume(maximum_volume + 1 round_to) >= total_height
      */
      total_volume = this.volume_at_height(total_height);
      factor = 10;
      switch (round_to) {
        case "ml":
          factor = 1;
          break;
        case "cl":
          factor = 10;
          break;
        case "dl":
          factor = 100;
          break;
        case "l":
          factor = 1000;
      }
      this.maximum_volume = Math.floor(total_volume / factor) * factor;
      this.current_height = 0;
      return this.maximum_height = this.height_at_volume(this.maximum_volume);
    };

    return Glass;

  })();

  window.Glass = Glass;

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

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Button = (function() {

    _Class.WIDTH = 34;

    _Class.set_width = function(width) {
      return this.WIDTH = width;
    };

    _Class.BASEPATH = '.';

    _Class.set_base_path = function(basepath) {
      if (basepath == null) basepath = '.';
      return this.BASEPATH = basepath;
    };

    function _Class(paper, button) {
      var _ref, _ref2, _ref3, _ref4;
      this.paper = paper;
      this.prop = this.initialize_properties();
      this.x = (_ref = button != null ? button.x : void 0) != null ? _ref : 0;
      this.y = (_ref2 = button != null ? button.y : void 0) != null ? _ref2 : 0;
      this.icon = (_ref3 = button != null ? button.icon : void 0) != null ? _ref3 : "none.png";
      this.tooltip = (_ref4 = button != null ? button.tooltip : void 0) != null ? _ref4 : "";
      this.draw();
    }

    _Class.prototype.initialize_properties = function() {
      return {
        corners: 2,
        normal: {
          fill: 'white',
          stroke: 'silver',
          'fill-opacity': 1,
          'stroke-opacity': 0.5,
          'stroke-width': 0.5
        },
        disabled: {
          fill: 'gray',
          stroke: 'silver',
          'fill-opacity': 0.5,
          'stroke-opacity': 0.8
        },
        activated: {
          'stroke-width': 2,
          fill: 'yellow',
          stroke: 'gray',
          'fill-opacity': 0.25,
          'stroke-opacity': 1
        },
        switched_on: {
          fill: 'purple',
          'stroke-width': 2,
          stroke: 'gray',
          'fill-opacity': 0.25,
          'stroke-opacity': 1
        },
        highlight: {
          fill: 'orange',
          stroke: 'gray',
          'fill-opacity': 0.5,
          'stroke-opacity': 1
        }
      };
    };

    _Class.prototype.draw = function() {
      var basepath, width;
      width = CoffeeGrounds.Button.WIDTH;
      this.back = this.paper.rect(this.x, this.y, width, width);
      this.back.attr(this.prop.normal);
      basepath = CoffeeGrounds.Button.BASEPATH;
      this.image = this.paper.image("" + basepath + "/" + this.icon + ".png", this.x + 1, this.y + 1, width - 2, width - 2);
      this.image.attr({
        'font-family': 'sans-serif',
        'font-size': "" + (width - 2) + "px",
        title: this.tooltip
      });
      return this.elements = this.paper.set(this.back, this.image);
    };

    return _Class;

  })();

  CoffeeGrounds.ActionButton = (function(_super) {

    __extends(_Class, _super);

    function _Class(paper, button) {
      var _ref;
      this.paper = paper;
      this.activate = __bind(this.activate, this);
      _Class.__super__.constructor.call(this, this.paper, button);
      this.action = (_ref = button != null ? button.action : void 0) != null ? _ref : function() {};
      this.elements.click(this.activate);
    }

    _Class.prototype.activate = function() {
      return this.action();
    };

    _Class.prototype.disable = function() {
      this.back.attr(this.prop.disabled);
      return this.elements.unclick(this.activate);
    };

    _Class.prototype.enable = function() {
      this.back.attr(this.prop.normal);
      return this.elements.click(this.activate);
    };

    return _Class;

  })(CoffeeGrounds.Button);

  CoffeeGrounds.SwitchButton = (function(_super) {

    __extends(_Class, _super);

    function _Class(paper, button) {
      var _ref, _ref2, _ref3;
      this.paper = paper;
      this["switch"] = __bind(this["switch"], this);
      _Class.__super__.constructor.call(this, this.paper, button);
      this.switched_on = (_ref = button != null ? button.switched_on : void 0) != null ? _ref : false;
      this.on_switch_on = (_ref2 = button != null ? button.on_switch_on : void 0) != null ? _ref2 : function() {};
      this.on_switch_off = (_ref3 = button != null ? button.on_switch_off : void 0) != null ? _ref3 : function() {};
      if (this.switched_on) {
        this.back.attr(this.prop.switched_on);
        this.on_switch_on();
      } else {
        this.on_switch_off();
      }
      this.elements.click(this["switch"]);
    }

    _Class.prototype["switch"] = function() {
      if (this.switched_on) {
        this.switched_on = false;
        this.back.attr(this.prop.normal);
        return this.on_switch_off();
      } else {
        this.switched_on = true;
        this.back.attr(this.prop.switched_on);
        return this.on_switch_on();
      }
    };

    _Class.prototype.disable = function() {
      this.back.attr(this.prop.disabled);
      return this.elements.unclick(this["switch"]);
    };

    _Class.prototype.enable = function() {
      this.back.attr(this.prop.normal);
      return this.elements.click(this["switch"]);
    };

    return _Class;

  })(CoffeeGrounds.Button);

  CoffeeGrounds.OptionButton = (function(_super) {

    __extends(_Class, _super);

    function _Class(paper, button, group) {
      var _ref, _ref2;
      this.paper = paper;
      this.group = group;
      this.select = __bind(this.select, this);
      _Class.__super__.constructor.call(this, this.paper, button);
      this.value = (_ref = button.value) != null ? _ref : "no value given";
      this.on_select = (_ref2 = button != null ? button.on_select : void 0) != null ? _ref2 : function() {
        return "";
      };
      if (button.chosen) {
        this.back.attr(this.prop.activated);
        this.group.value = this.value;
      }
      this.elements.click(this.select);
    }

    _Class.prototype.select = function() {
      var button, _i, _len, _ref;
      _ref = this.group.buttons;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        button = _ref[_i];
        button.deselect();
      }
      this.back.attr(this.prop.activated);
      this.group.value = this.value;
      return this.on_select();
    };

    _Class.prototype.deselect = function() {
      return this.back.attr(this.prop.normal);
    };

    _Class.prototype.disable = function() {
      this.back.attr(this.prop.disabled);
      return this.elements.unclick(this.select);
    };

    _Class.prototype.enable = function() {
      this.back.attr(this.prop.normal);
      return this.elements.click(this.select);
    };

    return _Class;

  })(CoffeeGrounds.Button);

  CoffeeGrounds.ButtonGroup = (function() {

    function _Class(paper, buttonlist) {
      var button, _i, _len;
      this.paper = paper;
      this.buttons = [];
      this.value = "";
      for (_i = 0, _len = buttonlist.length; _i < _len; _i++) {
        button = buttonlist[_i];
        this.buttons.push(new CoffeeGrounds.OptionButton(this.paper, button, this));
      }
    }

    _Class.prototype.disable = function() {
      var button, _i, _len, _ref, _results;
      _ref = this.buttons;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        button = _ref[_i];
        _results.push(button.disable());
      }
      return _results;
    };

    _Class.prototype.enable = function() {
      var button, _i, _len, _ref, _results;
      _ref = this.buttons;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        button = _ref[_i];
        _results.push(button.enable());
      }
      return _results;
    };

    _Class.prototype.select = function(button) {
      var i, _i, _len, _ref, _results;
      _ref = this.buttons;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        if (i.value === button) {
          _results.push(i.select());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    _Class.prototype.deselect = function(button) {
      var i, _i, _len, _ref, _results;
      _ref = this.buttons;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        if (i.value === button) {
          _results.push(i.deselect());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return _Class;

  })();

  window.Graph = (function() {

    function _Class(paper, x, y, width, height, properties) {
      var MARGIN, ticks,
        _this = this;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.move_control_point_start = __bind(this.move_control_point_start, this);
      this.add_curve = __bind(this.add_curve, this);
      this.add_line = __bind(this.add_line, this);
      this.remove = __bind(this.remove, this);
      this.move_point_start = __bind(this.move_point_start, this);
      this.add_point = __bind(this.add_point, this);
      this.mousemove = __bind(this.mousemove, this);
      this.mouseover = __bind(this.mouseover, this);
      this.mouseout = __bind(this.mouseout, this);
      this.delta_out = __bind(this.delta_out, this);
      this.delta_move = __bind(this.delta_move, this);
      this.delta_over = __bind(this.delta_over, this);
      this.spec = this.initialize_properties(properties);
      this.PADDING = 2;
      this.BUTTON_WIDTH = 34;
      this.POINT_WIDTH = 3;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      this.BUTTON_SEP = 5;
      this.GROUP_SEP = this.BUTTON_WIDTH * 0.6;
      this.GRAPH_SEP = 15;
      this.AXIS_WIDTH = 50;
      this.GRAPH_HEIGHT = this.height - this.PADDING - this.BUTTON_WIDTH - this.GRAPH_SEP - this.AXIS_WIDTH - this.PADDING;
      this.GRAPH_WIDTH = this.width - this.PADDING - this.AXIS_WIDTH - this.PADDING;
      this.ORIGIN = {
        x: this.x + this.PADDING + this.AXIS_WIDTH,
        y: this.y + this.PADDING + this.BUTTON_WIDTH + this.GRAPH_SEP + this.GRAPH_HEIGHT
      };
      this.raster = this.paper.path("M0,0");
      CoffeeGrounds.Button.set_base_path(this.spec.icon_path);
      this.actions = {
        normal: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'select',
            icon: 'edit-select',
            tooltip: 'Selecteer en beweeg punten',
            on_select: function() {
              return _this.change_mode('normal');
            },
            enabled: true,
            "default": true
          },
          cursor: 'default'
        },
        point: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'edit-node',
            tooltip: 'Zet een punt',
            on_select: function() {
              return _this.change_mode('point');
            },
            enabled: true
          },
          cursor: 'crosshair'
        },
        straight: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'straight-line',
            tooltip: 'Trek een rechte lijn',
            on_select: function() {
              return _this.change_mode('straight');
            },
            enabled: true
          },
          cursor: 'default'
        },
        curve: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'draw-bezier-curves',
            tooltip: 'Trek een kromme lijn',
            on_select: function() {
              return _this.change_mode('curve');
            },
            enabled: true
          },
          cursor: 'default'
        },
        remove: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'dialog-close',
            tooltip: 'Verwijder punt of lijn',
            on_select: function() {
              return _this.change_mode('remove');
            },
            enabled: true
          },
          cursor: 'default'
        },
        delta: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'inspect',
            icon: 'draw-triangle',
            tooltip: 'Bepaal de snelheid',
            on_select: function() {
              return _this.change_mode('delta');
            },
            enabled: true
          },
          cursor: 'crosshair'
        },
        sigma: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'inspect',
            icon: 'office-chart-area',
            tooltip: 'Bepaal de verandering',
            on_select: function() {
              return _this.change_mode('sigma');
            },
            enabled: true
          },
          cursor: 'default'
        },
        computer: {
          button: {
            type: 'switch',
            group: 'switch',
            icon: 'office-chart-line',
            tooltip: 'Laat computergrafiek zien / verberg',
            switched_on: false,
            on_switch_on: function() {
              var deltapath;
              _this.computer_graph.show();
              _this.computer_graph_shown = true;
              deltapath = _this.computer_graph.attr('path');
              return _this.deltaline.attr({
                path: deltapath
              });
            },
            on_switch_off: function() {
              var deltapath;
              _this.computer_graph.hide();
              _this.computer_graph_shown = false;
              deltapath = _this.user_line.to_path();
              return _this.deltaline.attr({
                path: deltapath
              });
            }
          }
        },
        raster: {
          button: {
            type: 'switch',
            icon: 'view-grid',
            group: 'switch',
            tooltip: 'Laat raster zien / verberg',
            switched_on: true,
            on_switch_on: function() {
              return _this.raster.show();
            },
            on_switch_off: function() {
              return _this.raster.hide();
            }
          }
        },
        export_png: {
          button: {
            type: 'action',
            icon: 'image-x-generic',
            group: 'export',
            tooltip: 'Download als een PNG afbeelding',
            action: function() {}
          }
        },
        export_svg: {
          button: {
            type: 'action',
            icon: 'image-svg',
            group: 'export',
            tooltip: 'Download als een SVG afbeelding',
            action: function() {
              return _this.export_svg();
            }
          }
        }
      };
      MARGIN = 20;
      this.x_axis = this.spec.x_axis;
      this.x_axis.origin = {
        x: this.ORIGIN.x,
        y: this.ORIGIN.y
      };
      this.x_axis.width = this.GRAPH_WIDTH;
      this.y_axis = this.spec.y_axis;
      this.y_axis.origin = {
        x: this.ORIGIN.x,
        y: this.ORIGIN.y
      };
      this.y_axis.width = this.GRAPH_HEIGHT;
      this.user_line = new CoffeeGrounds.Line(this.ORIGIN.x, this.ORIGIN.y - this.GRAPH_HEIGHT, this.GRAPH_WIDTH, this.GRAPH_HEIGHT, this.x_axis.unit, this.y_axis.unit, true);
      this.computer_line = new CoffeeGrounds.Line(this.ORIGIN.x, this.ORIGIN.y - this.GRAPH_HEIGHT, this.GRAPH_WIDTH, this.GRAPH_HEIGHT, this.x_axis.unit, this.y_axis.unit, true);
      this.delta_y = 50;
      ticks = this.parse_tickspath(this.y_axis.tickspath);
      this.delta_y = ticks.length * (ticks.distance / this.y_axis.unit.per_pixel);
      this.draw();
      this.mode = 'normal';
      this.click = '';
      if (this.spec.computer_graph) {
        this.computer_graph_shown = true;
        this.computer_graph.show();
      } else {
        this.computer_graph_shown = false;
        this.computer_graph.hide();
      }
      this.points_draggable = false;
      this.cp_points_draggable = false;
      this.elements.mouseover(this.mouseover);
      this.elements.mouseout(this.mouseout);
      this.deltaline.mouseover(this.delta_over);
      this.deltaline.mousemove(this.delta_move);
      this.deltaline.mouseout(this.delta_out);
    }

    _Class.prototype.get_user_line = function() {
      return this.user_line;
    };

    _Class.prototype.set_user_line = function(line) {
      this.user_line = line;
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.delta_over = function(e, x, y) {
      this.deltaline.attr({
        cursor: 'none'
      });
      return this.delta_move(e, x, y);
    };

    _Class.prototype.delta_move = function(e, x, y) {
      var EPSILON, SMALL_EPSILON, bigstep, dx, dy, factor, length, mx_length, p, path, patharr, point, pointn, seg;
      p = this.fit_point(x, y);
      if (p.x > this.user_line.min.x + 1) {
        EPSILON = 0.5;
        SMALL_EPSILON = 0.001;
        patharr = this.deltaline.attr('path');
        path = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = patharr.length; _i < _len; _i++) {
            seg = patharr[_i];
            _results.push("" + seg[0] + (seg.slice(1).join(',')));
          }
          return _results;
        })()).join("");
        length = 0;
        bigstep = 50;
        mx_length = this.deltaline.getTotalLength();
        while (length < (mx_length - bigstep) && this.deltaline.getPointAtLength(length).x < p.x) {
          length += bigstep;
        }
        length -= bigstep;
        while (length < mx_length && Math.abs(this.deltaline.getPointAtLength(length).y - p.y) > EPSILON && this.deltaline.getPointAtLength(length).x < p.x) {
          length++;
        }
        point = this.deltaline.getPointAtLength(length);
        pointn = this.deltaline.getPointAtLength(length + 1);
        if (point.x && pointn.x && point.y && pointn.y) {
          dy = pointn.y - point.y;
          dx = pointn.x - point.x;
          if (dx && dy) {
            this.deltapoint.attr({
              cx: point.x,
              cy: point.y
            });
            this.deltapoint.show();
            factor = 0;
            if (!(((-1 * SMALL_EPSILON) < dy && dy < SMALL_EPSILON))) {
              factor = this.delta_y / dy / 2;
            }
            this.delta_ll.attr({
              path: "M" + (point.x - dx * factor) + "," + (point.y - dy * factor) + "L" + (point.x + dx * factor) + "," + (point.y + dy * factor)
            });
            this.delta_ll.show();
            this.dyh.attr({
              path: "M" + this.user_line.min.x + "," + (point.y + dy * factor) + "L" + (point.x + dx * factor) + "," + (point.y + dy * factor)
            });
            this.dyl.attr({
              path: "M" + this.user_line.min.x + "," + (point.y - dy * factor) + "L" + (point.x - dx * factor) + "," + (point.y - dy * factor)
            });
            this.dxl.attr({
              path: "M" + (point.x - dx * factor) + "," + this.user_line.max.y + "L" + (point.x - dx * factor) + "," + (point.y - dy * factor)
            });
            this.dxh.attr({
              path: "M" + (point.x + dx * factor) + "," + this.user_line.max.y + "L" + (point.x + dx * factor) + "," + (point.y + dy * factor)
            });
            this.dyh.show();
            this.dyl.show();
            this.dxh.show();
            return this.dxl.show();
          }
        }
      }
    };

    _Class.prototype.delta_out = function(e, x, y) {
      this.deltapoint.hide();
      this.delta_ll.hide();
      this.dyh.hide();
      this.dyl.hide();
      this.dxh.hide();
      this.dxl.hide();
      return this.deltaline.attr({
        cursor: this.actions[this.mode].cursor
      });
    };

    _Class.prototype.initialize_properties = function(properties) {
      var button, index, p, _len, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      p = {};
      p.x_axis = properties.x_axis;
      p.y_axis = properties.y_axis;
      p.raster = true;
      p.buttons = (_ref = properties != null ? properties.buttons : void 0) != null ? _ref : ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'computer', 'raster'];
      p.point = {};
      p.point.size = (_ref2 = properties != null ? (_ref3 = properties.point) != null ? _ref3.size : void 0 : void 0) != null ? _ref2 : 2;
      p.icon_path = (_ref4 = properties != null ? properties.icon_path : void 0) != null ? _ref4 : 'lib/icons';
      p.computer_graph = (_ref5 = properties != null ? properties.computer_graph : void 0) != null ? _ref5 : false;
      p.editable = (_ref6 = properties != null ? properties.editable : void 0) != null ? _ref6 : true;
      if (!p.editable) {
        _ref7 = p.buttons;
        for (index = 0, _len = _ref7.length; index < _len; index++) {
          button = _ref7[index];
          if (button === 'point' || button === 'straight' || button === 'curve' || button === 'remove' || button === 'normal') {
            delete p.buttons[index];
          }
        }
      }
      return p;
    };

    _Class.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: x - this.paper.canvas.parentNode.offsetLeft,
        y: y - this.paper.canvas.parentNode.offsetTop
      };
      return point;
    };

    _Class.prototype.mouseout = function(e, x, y) {
      this.elements.unmousemove(this.mousemove);
      return this.reset_mouse();
    };

    _Class.prototype.mouseover = function(e, x, y) {
      return this.elements.mousemove(this.mousemove);
    };

    _Class.prototype.mousemove = function(e, x, y) {
      var a, d, left, p, q, r, right, s;
      p = this.fit_point(x, y);
      this.elements.attr({
        cursor: this.actions[this.mode].cursor
      });
      switch (this.mode) {
        case 'normal':
          this.reset_mouse();
          break;
        case 'point':
          if (this.user_line.can_add_point(p.x, p.y)) {
            if (this.click !== this.mode) {
              this.elements.click(this.add_point);
              this.click = this.mode;
            }
          } else {
            this.elements.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'straight':
          if (this.user_line.can_add_line(p.x)) {
            if (this.click !== this.mode) {
              this.elements.click(this.add_line);
              this.click = this.mode;
            }
            q = this.user_line.find_point_to_the_left_of(p.x);
            left = this.user_line.get_point(q);
            right = this.user_line.get_point(q + 1);
            this.potential_line.attr({
              path: "M" + left.x + "," + left.y + "L" + right.x + "," + right.y,
              stroke: 'green'
            });
            this.potential_line.show();
          } else {
            this.reset_mouse();
            this.elements.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'curve':
          if (this.user_line.can_add_line(p.x)) {
            if (this.click !== this.mode) {
              this.elements.click(this.add_curve);
              this.click = this.mode;
            }
            q = this.user_line.find_point_to_the_left_of(p.x);
            left = this.user_line.get_point(q);
            right = this.user_line.get_point(q + 1);
            d = (right.x - left.x) / 4;
            this.potential_line.attr({
              path: "M" + left.x + "," + left.y + "C" + (left.x + d) + "," + left.y + "," + (right.x - d) + "," + right.y + "," + right.x + "," + right.y,
              stroke: 'gold'
            });
            this.potential_line.show();
          } else {
            q = this.user_line.find_point_to_the_left_of(p.x);
            if (q !== -1) r = this.user_line.get_point(q);
            if (q !== -1 && r.segment.type === 'curve') {
              this.potential_line.hide();
            } else {
              this.reset_mouse();
              this.elements.attr({
                cursor: 'not-allowed'
              });
            }
          }
          break;
        case 'remove':
          q = this.user_line.find_point_to_the_left_of(p.x);
          r = this.user_line.find_point_near(p.x, p.y, this.POINT_WIDTH * 5);
          this.remove_line.hide();
          this.remove_point.hide();
          if (r !== -1) {
            if (this.user_line.can_remove_point(r)) {
              if (this.click !== this.mode) {
                this.elements.click(this.remove);
                this.click = this.mode;
              }
              s = this.user_line.get_point(r);
              this.remove_point.attr({
                cx: s.x,
                cy: s.y
              });
              this.remove_point.show();
            }
          } else if (q !== -1) {
            if (this.user_line.can_remove_line_from_point(q)) {
              if (this.click !== this.mode) {
                this.elements.click(this.remove);
                this.click = this.mode;
              }
              r = this.user_line.get_point(q);
              s = this.user_line.get_point(q + 1);
              this.remove_line.attr({
                x: r.x,
                width: s.x - r.x
              });
              this.remove_line.show();
            }
          } else {
            this.reset_mouse();
            this.elements.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'sigma':
          a = 1;
      }
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.add_point = function(e, x, y) {
      var p, point, q;
      p = this.fit_point(x, y);
      point = this.paper.circle(p.x, p.y, this.POINT_WIDTH * 2);
      point.attr({
        fill: 'blue',
        stroke: 'blue',
        'fill-opacity': 0.3
      });
      q = this.user_line.add_point(p.x, p.y, point);
      return point.drag(this.move_point(this, q), this.move_point_start, this.move_point_end(this, q));
    };

    _Class.prototype.make_draggable = function() {
      var point, _i, _len, _ref, _ref2;
      this.points_draggable = (_ref = this.points_draggable) != null ? _ref : false;
      if (!this.points_draggable) {
        _ref2 = this.user_line.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          point.representation.drag(this.move_point(this, point), this.move_point_start, this.move_point_end(this, point));
          point.representation.attr({
            fill: 'blue',
            stroke: 'blue',
            r: this.POINT_WIDTH * 2,
            'fill-opacity': 0.3
          });
        }
        return this.points_draggable = true;
      }
    };

    _Class.prototype.move_point = function(graph, point) {
      var _this = this;
      return function(dx, dy, x, y, e) {
        var newp, p, tx, ty;
        tx = dx - graph.dpo.x;
        ty = dy - graph.dpo.y;
        p = graph.user_line.find_point_at(point.x);
        newp = {
          x: point.x + tx,
          y: point.y + ty
        };
        if (graph.user_line.can_move_point(p, newp.x, newp.y)) {
          graph.user_line.move_point(p, newp.x, newp.y);
          graph.dpo = {
            x: dx,
            y: dy
          };
          point.representation.attr({
            cx: point.x,
            cy: point.y
          });
          return graph.user_graph.attr({
            path: graph.user_line.to_path()
          });
        } else {

        }
      };
    };

    _Class.prototype.move_point_start = function(x, y, e) {
      var _ref;
      this.dpo = (_ref = this.dpo) != null ? _ref : {};
      return this.dpo = {
        x: 0,
        y: 0
      };
    };

    _Class.prototype.move_point_end = function(graph, point) {
      var _this = this;
      return function(e) {
        var p;
        graph.user_graph.attr({
          path: graph.user_line.to_path()
        });
        p = graph.user_line.find_point_at(point.x);
        return graph.user_line.move_point(p, 0, 0, true);
      };
    };

    _Class.prototype.make_undraggable = function() {
      var point, _i, _len, _ref, _ref2;
      this.points_draggable = (_ref = this.points_draggable) != null ? _ref : false;
      if (this.points_draggable) {
        _ref2 = this.user_line.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          point.representation.undrag();
          point.representation.attr({
            fill: 'black',
            stroke: 'black',
            r: this.POINT_WIDTH,
            'fill-opacity': 1
          });
        }
        return this.points_draggable = false;
      }
    };

    _Class.prototype.reset_mouse = function() {
      this.click = '';
      this.elements.unclick(this.remove);
      this.elements.unclick(this.add_point);
      this.elements.unclick(this.add_line);
      this.elements.unclick(this.add_curve);
      this.potential_line.hide();
      this.remove_point.hide();
      return this.remove_line.hide();
    };

    _Class.prototype.remove = function(e, x, y) {
      var p, q, r;
      p = this.fit_point(x, y);
      q = this.user_line.find_point_near(p.x, p.y, this.POINT_WIDTH * 5);
      if (q >= 0) {
        if (this.user_line.can_remove_point(q)) {
          r = this.user_line.get_point(q);
          r.representation.remove();
          this.user_line.remove_point(q);
          this.user_graph.attr({
            path: this.user_line.to_path()
          });
          this.remove_line.hide();
          return this.remove_point.hide();
        }
      } else {
        q = this.user_line.find_point_to_the_left_of(p.x);
        if (q >= 0 && this.user_line.can_remove_line_from_point(q)) {
          r = this.user_line.get_point(q);
          if (r.segment.type === 'curve') {
            r.segment.c1.representation.remove();
            r.segment.c2.representation.remove();
            r.segment.c1.line.remove();
            r.segment.c2.line.remove();
          }
          this.user_line.remove_line(q);
          this.user_graph.attr({
            path: this.user_line.to_path()
          });
          this.remove_line.hide();
          return this.remove_point.hide();
        }
      }
    };

    _Class.prototype.add_line = function(e, x, y) {
      var p, q;
      p = this.fit_point(x, y);
      q = this.user_line.find_point_to_the_left_of(p.x);
      this.user_line.add_straight_line(q);
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.add_curve = function(e, x, y) {
      var cleft, clleft, clright, cright, d, left, p, q, right;
      p = this.fit_point(x, y);
      q = this.user_line.find_point_to_the_left_of(p.x);
      left = this.user_line.get_point(q);
      right = this.user_line.get_point(q + 1);
      d = (right.x - left.x) / 4;
      cleft = this.paper.circle(left.x + d, left.y, this.POINT_WIDTH * 2);
      cleft.attr({
        fill: 'gold',
        stroke: 'gold',
        'fill-opacity': 0.3
      });
      cleft.drag(this.move_control_point(this, left, right, cleft, 1), this.move_control_point_start, this.move_control_point_end(this, left, cleft, 1));
      clleft = this.paper.path("M" + left.x + "," + left.y + "L" + (left.x + d) + "," + left.y);
      clleft.attr({
        stroke: 'gold',
        'stroke-dasharray': '.'
      });
      cright = this.paper.circle(right.x - d, right.y, this.POINT_WIDTH * 2);
      cright.attr({
        fill: 'gold',
        stroke: 'gold',
        'fill-opacity': 0.3
      });
      cright.drag(this.move_control_point(this, left, right, cright, 2), this.move_control_point_start, this.move_control_point_end(this, left, cright, 2));
      clright = this.paper.path("M" + right.x + "," + right.y + "L" + (right.x - d) + "," + right.y);
      clright.attr({
        stroke: 'gold',
        'stroke-dasharray': '.'
      });
      this.user_line.add_curved_line(q, d, cleft, cright, clleft, clright);
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.change_mode = function(mode) {
      var deltapath;
      this.mode = mode;
      this.elements.attr({
        cursor: this.actions[this.mode].cursor
      });
      this.reset_mouse();
      if (this.mode === 'point') {
        this.make_draggable();
      } else {
        this.make_undraggable();
      }
      if (this.mode === 'curve') {
        this.make_cp_draggable();
      } else {
        this.make_cp_undraggable();
      }
      if (this.mode === 'delta') {
        this.elements.unmouseover(this.mouseover);
        this.elements.unmouseout(this.mouseout);
        this.elements.unmousemove(this.mousemove);
        if (this.computer_graph_shown) {
          deltapath = this.computer_graph.attr('path');
        } else {
          deltapath = this.user_line.to_path();
        }
        this.deltaline.attr({
          path: deltapath
        });
        return this.deltaline.toFront().show();
      } else {
        this.elements.mouseover(this.mouseover);
        this.elements.mouseout(this.mouseout);
        return this.deltaline.hide();
      }
    };

    _Class.prototype.make_cp_undraggable = function() {
      var point, s, _i, _len, _ref, _ref2;
      this.cp_points_draggable = (_ref = this.cp_points_draggable) != null ? _ref : false;
      if (this.cp_points_draggable) {
        _ref2 = this.user_line.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          s = point.segment;
          if (s.type === 'curve') {
            point.segment.c1.representation.hide();
            point.segment.c2.representation.hide();
            point.segment.c1.line.hide();
            point.segment.c2.line.hide();
          }
        }
        return this.cp_points_draggable = false;
      }
    };

    _Class.prototype.make_cp_draggable = function() {
      var next_point, point, s, _i, _len, _ref, _ref2;
      this.cp_points_draggable = (_ref = this.cp_points_draggable) != null ? _ref : false;
      if (!this.cp_points_draggable) {
        _ref2 = this.user_line.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          s = point.segment;
          if (s.type === 'curve') {
            point.segment.c1.representation.attr({
              cx: point.segment.c1.x,
              cy: point.segment.c1.y
            });
            point.segment.c1.representation.show();
            point.segment.c2.representation.attr({
              cx: point.segment.c2.x,
              cy: point.segment.c2.y
            });
            point.segment.c2.representation.show();
            point.segment.c1.line.attr({
              path: "M" + point.x + "," + point.y + "L" + point.segment.c1.x + "," + point.segment.c1.y
            });
            point.segment.c1.line.show();
            next_point = this.user_line.get_point(this.user_line.find_point_at(point.x) + 1);
            point.segment.c2.line.attr({
              path: "M" + next_point.x + "," + next_point.y + "L" + point.segment.c2.x + "," + point.segment.c2.y
            });
            point.segment.c2.line.show();
          }
        }
        return this.cp_points_draggable = true;
      }
    };

    _Class.prototype.export_svg = function() {
      var a, bb, blob, svgString, _ref, _ref2;
      svgString = this.paper.toSVG();
      a = document.createElement('a');
      a.download = 'mySvg.svg';
      a.type = 'image/svg+xml';
      bb = new ((_ref = window.BlobBuilder) != null ? _ref : WebKitBlobBuilder);
      bb.append(svgString);
      blob = bb.getBlob('image/svg+xml');
      a.href = ((_ref2 = window.URL) != null ? _ref2 : webkitURL).createObjectURL(blob);
      return a.click();
    };

    _Class.prototype.hide = function() {
      return this.elements.hide();
    };

    _Class.prototype.show = function() {
      return this.elements.show();
    };

    _Class.prototype.draw = function() {
      var _ref;
      this.elements = this.paper.set();
      this.elements.push(this.draw_pane(false));
      this.elements.push(this.draw_axis(this.x_axis));
      this.elements.push(this.draw_axis(this.y_axis));
      if ((_ref = this.spec) != null ? _ref.raster : void 0) {
        this.elements.push(this.draw_raster(this.x_axis, this.y_axis));
      }
      this.computer_graph = this.paper.path("M0,0");
      this.computer_graph.attr({
        stroke: 'dodgerblue',
        'stroke-width': 2
      });
      this.elements.push(this.computer_graph);
      this.computer_graph.hide();
      this.user_graph = this.paper.path("M0,0");
      this.user_graph.attr({
        stroke: 'black',
        'stroke-width': 2
      });
      this.potential_line = this.paper.path("M0,0");
      this.potential_line.attr({
        stroke: 'blue',
        'stroke-opacity': 0.5,
        'stroke-width': 2,
        'stroke-dasharray': '.'
      });
      this.potential_line.hide();
      this.remove_point = this.paper.circle(0, 0, 12);
      this.remove_point.attr({
        stroke: 'red',
        fill: 'red',
        'fill-opacity': 0.25
      });
      this.remove_point.hide();
      this.remove_line = this.paper.rect(0, this.ORIGIN.y - this.GRAPH_HEIGHT, 0, this.GRAPH_HEIGHT);
      this.remove_line.attr({
        stroke: 'red',
        fill: 'red',
        'fill-opacity': 0.25
      });
      this.remove_line.hide();
      this.deltaline = this.paper.path("M0,0");
      this.deltaline.attr({
        'stroke-width': 15,
        stroke: 'green',
        'stroke-opacity': 0
      });
      this.deltaline.hide();
      this.delta_ll = this.paper.path("M0,0");
      this.delta_ll.attr({
        stroke: 'orange',
        'stroke-width': 3
      });
      this.delta_ll.hide();
      this.deltapoint = this.paper.circle(0, 0, 3);
      this.deltapoint.attr({
        fill: 'gray'
      });
      this.deltapoint.hide();
      this.dyh = this.paper.path("M0,0");
      this.dyh.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dyh.hide();
      this.dyl = this.paper.path("M0,0");
      this.dyl.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dyl.hide();
      this.dxh = this.paper.path("M0,0");
      this.dxh.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dxh.hide();
      this.dxl = this.paper.path("M0,0");
      this.dxl.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dxl.hide();
      this.elements.push(this.deltapoint, this.delta_ll, this.dyh, this.dyl, this.dxh, this.dxl);
      this.draw_buttons();
      this.elements.push(this.user_graph, this.potential_line, this.remove_point, this.remove_line);
      this.elements.push(this.draw_pane(true));
      return this.elements.push(this.deltaline);
    };

    _Class.prototype.move_control_point = function(graph, point, point2, cp, kind) {
      var _this = this;
      return function(dx, dy, x, y, e) {
        var newp, p, tx, ty;
        tx = dx - graph.dpo.x;
        ty = dy - graph.dpo.y;
        p = graph.user_line.find_point_at(point.x);
        newp = {
          x: cp.attr('cx') + tx,
          y: cp.attr('cy') + ty
        };
        if (graph.user_line.can_move_control_point(p, newp.x, newp.y)) {
          if (kind === 1) {
            graph.user_line.move_control_point1(p, newp.x, newp.y);
            point.segment.c1.line.attr({
              path: "M" + point.x + "," + point.y + "L" + newp.x + "," + newp.y
            });
          } else if (kind === 2) {
            graph.user_line.move_control_point2(p, newp.x, newp.y);
            point.segment.c2.line.attr({
              path: "M" + point2.x + "," + point2.y + "L" + newp.x + "," + newp.y
            });
          }
          graph.dpo = {
            x: dx,
            y: dy
          };
          cp.attr({
            cx: newp.x,
            cy: newp.y
          });
          return graph.user_graph.attr({
            path: graph.user_line.to_path()
          });
        } else {

        }
      };
    };

    _Class.prototype.move_control_point_start = function(x, y, e) {
      var _ref;
      this.dpo = (_ref = this.dpo) != null ? _ref : {};
      return this.dpo = {
        x: 0,
        y: 0
      };
    };

    _Class.prototype.move_control_point_end = function(graph, point, cp, kind) {
      var _this = this;
      return function(x, y, e) {
        var p;
        graph.user_graph.attr({
          path: graph.user_line.to_path()
        });
        p = graph.user_line.find_point_at(point.x);
        switch (kind) {
          case 1:
            return graph.user_line.move_control_point1(p, 0, 0, true);
          case 2:
            return graph.user_line.move_control_point2(p, 0, 0, true);
        }
      };
    };

    _Class.prototype.switch_mode = function(mode) {
      return this.mode = mode;
    };

    _Class.prototype.draw_buttons = function() {
      var action, button, buttongroup, group, name, optiongroup, optiongroups, sep, x, y, _ref, _ref2, _ref3, _ref4, _results;
      x = this.ORIGIN.x;
      y = this.ORIGIN.y - this.GRAPH_HEIGHT - this.GRAPH_SEP - this.BUTTON_WIDTH;
      this.mode = "";
      group = '';
      optiongroups = {};
      sep = 0;
      this.buttons = {};
      _ref = this.actions;
      for (name in _ref) {
        action = _ref[name];
        if (__indexOf.call(this.spec.buttons, name) >= 0) {
          button = action.button;
          if (group !== '') {
            if (button.group === group) {
              x += this.BUTTON_WIDTH + this.BUTTON_SEP;
            } else {
              x += this.BUTTON_WIDTH + this.GROUP_SEP;
            }
          }
          group = button.group;
          switch (button.type) {
            case 'action':
              this.buttons.name = new CoffeeGrounds.ActionButton(this.paper, {
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                action: button.action
              });
              break;
            case 'switch':
              this.buttons.name = new CoffeeGrounds.SwitchButton(this.paper, {
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                switched_on: (_ref2 = button != null ? button.switched_on : void 0) != null ? _ref2 : false,
                on_switch_on: button.on_switch_on,
                on_switch_off: button.on_switch_off
              });
              break;
            case 'group':
              optiongroups[button.option_group] = (_ref3 = optiongroups[button.option_group]) != null ? _ref3 : [];
              optiongroups[button.option_group].push({
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                value: name,
                on_select: button.on_select,
                chosen: (_ref4 = button["default"]) != null ? _ref4 : false
              });
          }
        }
      }
      _results = [];
      for (name in optiongroups) {
        optiongroup = optiongroups[name];
        buttongroup = new CoffeeGrounds.ButtonGroup(this.paper, optiongroup);
        _results.push((function() {
          var _i, _len, _ref5, _results2;
          _ref5 = buttongroup.buttons;
          _results2 = [];
          for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
            button = _ref5[_i];
            _results2.push(this.buttons[button.value] = button);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    _Class.prototype.draw_pane = function(glass) {
      var pane;
      if (glass == null) glass = false;
      pane = this.paper.rect(this.ORIGIN.x, this.ORIGIN.y - this.GRAPH_HEIGHT, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
      if (glass) {
        pane.attr({
          fill: 'white',
          opacity: 0,
          stroke: 'white',
          cursor: 'default'
        });
      } else {
        pane.attr({
          fill: 'white',
          stroke: 'white',
          cursor: 'default'
        });
      }
      return pane;
    };

    _Class.prototype.draw_raster = function(x_axis, y_axis) {
      var d, distance, i, origin, path, x_ticks, y_ticks;
      origin = x_axis.origin;
      path = "M" + origin.x + "," + origin.y;
      x_ticks = this.parse_tickspath(x_axis.tickspath);
      distance = x_ticks.distance / x_axis.unit.per_pixel;
      d = i = 0;
      while (d < x_axis.width - distance) {
        d += distance;
        path += "M" + (origin.x + d) + "," + origin.y + "v-" + y_axis.width;
        i = (i + 1) % x_ticks.length;
      }
      y_ticks = this.parse_tickspath(y_axis.tickspath);
      distance = y_ticks.distance / y_axis.unit.per_pixel;
      d = i = 0;
      while (d < y_axis.width - distance) {
        d += distance;
        path += "M" + origin.x + "," + (origin.y - d) + "h" + x_axis.width;
        i = (i + 1) % y_ticks.length;
      }
      this.raster = this.paper.path(path);
      this.raster.attr({
        stroke: 'silver',
        'stroke-opacity': 0.5,
        'stroke-width': 0.5
      });
      return this.raster;
    };

    _Class.prototype.draw_axis = function(axis) {
      var AXISLABELSEP, LABELSEP, TICKSLENGTH, albb, axis_label, d, distance, flabel, i, label, labels, origin, path, ticks, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      TICKSLENGTH = (_ref = (_ref2 = this.spec) != null ? _ref2.tickslength : void 0) != null ? _ref : 10;
      LABELSEP = (_ref3 = (_ref4 = this.spec) != null ? _ref4.labelsep : void 0) != null ? _ref3 : 5;
      AXISLABELSEP = (_ref5 = (_ref6 = this.spec) != null ? _ref6.axislabelsep : void 0) != null ? _ref5 : 30;
      labels = this.paper.set();
      origin = axis.origin;
      path = "M" + origin.x + "," + origin.y;
      if (axis.orientation === 'vertical') {
        path += "v-" + axis.width;
      } else {
        path += "h" + axis.width;
      }
      ticks = this.parse_tickspath(axis.tickspath);
      distance = ticks.distance / axis.unit.per_pixel;
      d = i = label = 0;
      while (d < axis.width - distance) {
        d += distance;
        label += ticks.distance;
        if (axis.orientation === 'vertical') {
          path += "M" + origin.x + "," + (origin.y - d) + "h-";
          if (ticks[i].label) {
            if (this.y_axis.unit.symbol === 'cm/ml') {
              labels.push(this.paper.text(origin.x - TICKSLENGTH - LABELSEP * 3, origin.y - d, "" + (label.toFixed(2))));
            } else {
              labels.push(this.paper.text(origin.x - TICKSLENGTH - LABELSEP * 2, origin.y - d, "" + label));
            }
          }
        } else {
          path += "M" + (origin.x + d) + "," + origin.y + "v";
          if (ticks[i].label) {
            flabel = (label * 10) % 10 === 0 ? label : label.toFixed(1);
            labels.push(this.paper.text(origin.x + d, origin.y + TICKSLENGTH + LABELSEP, "" + flabel));
          }
        }
        if (ticks[i].size === 'small') {
          path += "" + (TICKSLENGTH / 2);
        } else {
          path += "" + TICKSLENGTH;
        }
        i = (i + 1) % ticks.length;
      }
      labels.push(this.paper.text(origin.x - LABELSEP, origin.y + LABELSEP, "0"));
      axis_label = this.paper.text(0, 0, axis.label);
      axis_label.attr({
        'font-size': 14,
        'text-anchor': 'start'
      });
      albb = axis_label.getBBox();
      axis_label.attr({
        x: origin.x + axis.width - albb.width,
        y: origin.y + AXISLABELSEP
      });
      if (axis.orientation === 'vertical') {
        if (this.y_axis.unit.symbol === 'cm/ml') {
          axis_label.transform("r-90," + origin.x + "," + origin.y + "t0,-" + (2.55 * AXISLABELSEP));
        } else {
          axis_label.transform("r-90," + origin.x + "," + origin.y + "t0,-" + (2.25 * AXISLABELSEP));
        }
      }
      labels.forEach(function(l) {
        return l.attr({
          'font-size': 12
        });
      });
      return this.paper.set(this.paper.path(path), labels);
    };

    _Class.prototype.parse_tickspath = function(s) {
      var c, match, pattern, tick, ticklength, tickpattern, ticks, _i, _len;
      pattern = /(\d+(?:\.\d+)?)((?:t|T|l|L)+)/;
      match = pattern.exec(s);
      ticklength = parseFloat(match[1]);
      tickpattern = match[2];
      ticks = [];
      ticks.distance = ticklength;
      for (_i = 0, _len = tickpattern.length; _i < _len; _i++) {
        c = tickpattern[_i];
        tick = {};
        switch (c) {
          case 't':
            tick.label = false;
            tick.size = 'small';
            break;
          case 'T':
            tick.label = false;
            tick.size = 'large';
            break;
          case 'l':
            tick.label = true;
            tick.size = 'small';
            break;
          case 'L':
            tick.label = true;
            tick.size = 'large';
        }
        ticks.push(tick);
      }
      return ticks;
    };

    return _Class;

  })();

  /*
   (c) 2012, Huub de Beer, Huub@heerdebeer.org
  */

  MeasureLine = (function() {

    MeasureLine.EPSILON = 0.01;

    MeasureLine.prototype.to_json = function() {
      var export_object;
      export_object = {
        volume: this.volume,
        height: this.height,
        initial_position: this.initial_position,
        position: {
          x: this.position.x,
          y: this.position.y
        },
        side: this.side,
        movable: this.movable,
        visible: this.visible
      };
      return JSON.stringify(export_object);
    };

    MeasureLine.prototype.from_json = function(mljson) {
      this.volume = mljson.volume;
      this.height = mljson.height;
      this.initial_position = mljson.initial_position;
      this.position = mljson.position;
      this.side = mljson.side;
      this.movable = mljson.movable;
      return this.visible = mljson.visible;
    };

    function MeasureLine(volume, height, glass, initial_position, side, visible, movable) {
      this.volume = volume;
      this.height = height;
      this.glass = glass;
      this.initial_position = initial_position != null ? initial_position : {
        x: -1,
        y: -1
      };
      this.side = side != null ? side : 'right';
      this.visible = visible != null ? visible : false;
      this.movable = movable != null ? movable : true;
      this.set_position(this.initial_position);
    }

    MeasureLine.prototype.reset = function() {
      /*
      */      return this.set_position(this.initial_position);
    };

    MeasureLine.prototype.hide = function() {
      return this.visible = false;
    };

    MeasureLine.prototype.show = function() {
      return this.visible = true;
    };

    MeasureLine.prototype.set_position = function(position) {
      /*
          Set the position of this measure line. Position is a point (x, y). Subsequently the height in mm can be computed.
      */      this.position = position;
      return this.height = (this.glass.foot.y - this.position.y) / this.glass.unit;
    };

    MeasureLine.prototype.is_correct = function() {
      /*
          Is this measure line on the correct height on the glass? That is: is the error smaller than epsilon?
      */      return Math.abs(this.error) <= MeasureLine.EPSILON;
    };

    MeasureLine.prototype.error = function() {
      /*
          The distance of this measure line to the correct position in mm. A negative error means it is too hight, a positive distance that it is too low
      */      return (this.glass.height_at_volume(this.volume)) - this.height;
    };

    return MeasureLine;

  })();

  window.MeasureLine = MeasureLine;

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Tap = (function() {

    function _Class(paper, x, y, glass, graph, properties) {
      var _ref,
        _this = this;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.glass = glass;
      this.graph = graph;
      this.full = __bind(this.full, this);
      this.fill_to_next_ml = __bind(this.fill_to_next_ml, this);
      this.fill = __bind(this.fill, this);
      this.start = __bind(this.start, this);
      this.pause = __bind(this.pause, this);
      this.empty = __bind(this.empty, this);
      this.PADDING = 5;
      this.spec = this.initialize_properties(properties);
      this.BUTTON_WIDTH = 34;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      this.BUTTON_SEP = 5;
      this.TIME_LABEL_SEP = 10;
      this.TAB_SEP = 5;
      this.GROUP_SEP = 15;
      CoffeeGrounds.Button.set_base_path(this.spec.icon_path);
      this.actions = {
        start: {
          button: {
            type: 'group',
            value: 'start',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-skip-backward',
            tooltip: 'Maak het glas leeg',
            on_select: function() {
              _this.change_mode('start');
              return _this.empty();
            },
            enabled: true,
            "default": true
          }
        },
        pause: {
          button: {
            type: 'group',
            value: 'pause',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-playback-pause',
            tooltip: 'Pauzeer het vullen van het glas',
            on_select: function() {
              _this.change_mode('pause');
              return _this.pause();
            },
            enabled: true
          }
        },
        play: {
          button: {
            type: 'group',
            value: 'play',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-playback-start',
            tooltip: 'Vul het glas',
            on_select: function() {
              _this.change_mode('play');
              return _this.start();
            },
            enabled: true
          }
        },
        end: {
          button: {
            type: 'group',
            value: 'end',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-skip-forward',
            tooltip: 'Vul glas tot het volgende maatstreepje op het glas',
            on_select: function() {
              _this.change_mode('end');
              return _this.fill_to_next_ml();
            },
            enabled: true
          }
        },
        time: {
          button: {
            type: 'switch',
            group: 'option',
            icon: 'chronometer',
            tooltip: 'Laat de tijd zien',
            on_switch_on: function() {
              _this.time_label.show();
              return _this.timer = true;
            },
            on_switch_off: function() {
              _this.time_label.hide();
              return _this.timer = false;
            }
          }
        }
      };
      this.mode = 'start';
      this.timer = false;
      this.volume = 0;
      this.time = 0;
      this.speed = this.spec.speed;
      this.time_step = 50;
      this.ml_per_time_step = (this.speed / 1000) * this.time_step;
      this.speed_per_msec = this.speed / 1000;
      this.msec_per_tenth_ml = 1 / (this.speed_per_msec * 10);
      this.sec_per_tenth_ml = 1 / (this.speed * 10);
      this.filling = false;
      this.id = 0;
      this.draw();
      if ((_ref = this.graph) != null) {
        _ref.attr({
          path: this.glass.get_current_graph()
        });
      }
    }

    _Class.prototype.empty = function() {
      var _ref;
      this.time = 0;
      this.volume = 0;
      this.update_labels();
      this.filling = false;
      this.glass.make_empty(this.sec_per_tenth_ml);
      this.spec.glass_to_fill.fill_to_height(this.glass.current_height);
      if ((_ref = this.graph) != null) {
        _ref.attr({
          path: this.glass.get_current_graph()
        });
      }
      return this.stream.hide();
    };

    _Class.prototype.pause = function() {
      this.stream.hide();
      clearInterval(this.id);
      return this.filling = false;
    };

    _Class.prototype.start = function() {
      clearInterval(this.id);
      this.filling = true;
      this.id = setInterval(this.fill, this.time_step);
      return this.stream.show();
    };

    _Class.prototype.fill = function() {
      var water_level_height, _ref;
      if (this.filling && !this.glass.is_full()) {
        this.time += this.time_step / 1000;
        this.volume += this.ml_per_time_step;
        this.update_labels();
        this.glass.fill_to_volume(this.volume);
        this.spec.glass_to_fill.fill_to_height(this.glass.current_height);
        water_level_height = (this.spec.glass_to_fill.points.water_level.left.y - this.spec.glass_to_fill.points.edge.left.y) + this.spec.stream_extra;
        if ((_ref = this.graph) != null) {
          _ref.attr({
            path: this.glass.get_current_graph()
          });
        }
        return this.stream.attr({
          height: water_level_height
        });
      } else if (this.glass.is_full()) {
        return this.simulation.select('end');
      }
    };

    _Class.prototype.fill_to_next_ml = function() {
      var height, ml, next_height, vol, _ref, _ref2;
      this.stream.hide();
      height = this.glass.current_height;
      next_height = this.glass.maximum_height;
      _ref = this.glass.measure_lines;
      for (vol in _ref) {
        ml = _ref[vol];
        if (ml.height > height) next_height = Math.min(next_height, ml.height);
      }
      this.glass.fill_to_height(Math.ceil(next_height));
      this.volume = this.glass.current_volume;
      if (next_height === this.glass.maximum_height) {
        this.volume = this.glass.maximum_volume;
      }
      this.time = this.volume / this.speed;
      this.filling = false;
      this.update_labels();
      clearInterval(this.id);
      this.spec.glass_to_fill.fill_to_height(this.glass.current_height);
      return (_ref2 = this.graph) != null ? _ref2.attr({
        path: this.glass.get_current_graph()
      }) : void 0;
    };

    _Class.prototype.full = function() {
      var _ref;
      this.stream.hide();
      this.volume = this.glass.maximum_volume;
      this.time = this.sec_per_tenth_ml * this.volume * 10;
      this.filling = false;
      this.glass.fill_to_volume(this.volume);
      this.update_labels();
      clearInterval(this.id);
      this.spec.glass_to_fill.fill_to_height(this.glass.current_height);
      return (_ref = this.graph) != null ? _ref.attr({
        path: this.glass.get_current_graph()
      }) : void 0;
    };

    _Class.prototype.update_labels = function() {
      this.label.attr({
        text: "" + (this.volume.toFixed(1)) + " ml"
      });
      return this.time_label.attr({
        text: "" + (this.time.toFixed(1)) + " seconden"
      });
    };

    _Class.prototype.change_mode = function(mode) {
      return this.mode = mode;
    };

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      p = {};
      p.speed = (_ref = properties != null ? properties.speed : void 0) != null ? _ref : 5;
      p.time = (_ref2 = properties != null ? properties.time : void 0) != null ? _ref2 : false;
      p.buttons = (_ref3 = properties != null ? properties.buttons : void 0) != null ? _ref3 : ['start', 'pause', 'play', 'end', 'time'];
      if (!p.time && __indexOf.call(p.buttons, 'time') >= 0) {
        delete p.buttons[p.buttons.indexOf('time')];
      }
      p.glass_to_fill = (_ref4 = properties != null ? properties.glass_to_fill : void 0) != null ? _ref4 : {
        fill_to_height: function(h) {
          return true;
        }
      };
      p.runnable = (_ref5 = properties != null ? properties.runnable : void 0) != null ? _ref5 : true;
      if (!p.runnable) p.buttons = [];
      p.icon_path = (_ref6 = properties != null ? properties.icon_path : void 0) != null ? _ref6 : 'lib/icons';
      p.stream_extra = (_ref7 = properties != null ? properties.stream_extra : void 0) != null ? _ref7 : 0;
      return p;
    };

    _Class.prototype.draw = function() {
      var LABEL_SEP, bblabel, bbtap, stream_x, stream_y, tapbb, tappath, tapx, tapy, tlbb;
      this.time_label = this.paper.text(this.x, this.y + this.PADDING + this.BUTTON_WIDTH + this.TIME_LABEL_SEP, "30,9 seconden");
      this.time_label.attr({
        'font-family': 'sans-serif',
        'font-size': '18pt',
        'text-anchor': 'end'
      });
      tlbb = this.time_label.getBBox();
      this.time_label.hide();
      this.draw_buttons();
      tappath = "M 0 27.5 V 20 A 10 10 90 0 1 10 10 L 20 10 V 5                    H 12.5 A 1.25 1.25 90 0 1 12.5 2.25 H 21.25                     A 1.25 1.25 180 0 1 23.75 2.25 H 32.5                     A 1.25 1.25 90 0 1 32.5 5 H 25 V 10                    H 40 V 5 A 2.5 2.5 90 0 1 42.5 2.5 V 27.5                    A 2.5 2.5 90 0 1 40 25 V 20 H 12.5                    A 2.5 2.5 90 0 0 10 22.5 V 27.5 Z";
      this.tap = this.paper.path(tappath);
      this.tap.attr({
        stroke: '#bbb',
        fill: '#ddd',
        'fill-opacity': 0.2,
        transform: 's3'
      });
      tapbb = this.tap.getBBox(true);
      tapx = this.x + (this.BUTTONS_GROUP_WIDTH - tapbb.width) / 2;
      tapy = this.y + this.PADDING + this.BUTTON_WIDTH + this.TIME_LABEL_SEP + tlbb.height * 2 + this.TIME_LABEL_SEP;
      this.tap.transform("...T" + tapx + "," + tapy);
      this.time_label.attr({
        x: this.x + (this.BUTTONS_GROUP_WIDTH - tlbb.width) / 2 + tlbb.width,
        text: "0 seconden",
        y: this.y + this.PADDING + this.BUTTON_WIDTH + this.TIME_LABEL_SEP + tlbb.height / 3
      });
      bbtap = this.tap.getBBox();
      this.label = this.paper.text(0, 0, "888,8 ml");
      this.label.attr({
        'font-family': 'Helvetica, Arial, sans-serif',
        'font-size': 18,
        'text-anchor': 'end'
      });
      bblabel = this.label.getBBox();
      LABEL_SEP = 10;
      this.label.attr({
        x: bbtap.x + bbtap.width - LABEL_SEP,
        y: bbtap.y + bbtap.height - bblabel.height - LABEL_SEP * 1.5,
        text: "0 ml"
      });
      stream_x = bbtap.x + 3;
      stream_y = bbtap.y2;
      this.stream = this.paper.rect(stream_x, stream_y, 25, 0);
      this.stream.attr({
        fill: '#abf',
        'fill-opacity': 0.1,
        stroke: 'none'
      });
      return this.stream.hide();
    };

    _Class.prototype.draw_buttons = function() {
      var action, button, buttongroup, group, name, optiongroup, optiongroups, sep, x, y, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5;
      x = this.x;
      y = this.y;
      this.mode = "";
      group = '';
      optiongroups = {};
      sep = 0;
      this.buttons = {};
      _ref = this.actions;
      for (name in _ref) {
        action = _ref[name];
        if (__indexOf.call(this.spec.buttons, name) >= 0) {
          button = action.button;
          if (group !== '') {
            if (button.group === group) {
              x += this.BUTTON_WIDTH + this.BUTTON_SEP;
            } else {
              x += this.BUTTON_WIDTH + this.GROUP_SEP;
            }
          }
          group = button.group;
          switch (button.type) {
            case 'action':
              this.buttons.name = new CoffeeGrounds.ActionButton(this.paper, {
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                action: button.action
              });
              break;
            case 'switch':
              this.buttons.name = new CoffeeGrounds.SwitchButton(this.paper, {
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                switched_on: (_ref2 = button != null ? button.switched_on : void 0) != null ? _ref2 : false,
                on_switch_on: button.on_switch_on,
                on_switch_off: button.on_switch_off
              });
              break;
            case 'group':
              optiongroups[button.option_group] = (_ref3 = optiongroups[button.option_group]) != null ? _ref3 : [];
              optiongroups[button.option_group].push({
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                value: name,
                on_select: button.on_select,
                chosen: (_ref4 = button["default"]) != null ? _ref4 : false
              });
          }
        }
      }
      for (name in optiongroups) {
        optiongroup = optiongroups[name];
        buttongroup = new CoffeeGrounds.ButtonGroup(this.paper, optiongroup);
        this.simulation = buttongroup;
        _ref5 = buttongroup.buttons;
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          button = _ref5[_i];
          this.buttons[button.value] = button;
        }
      }
      if (this.spec.buttons.length === 0) {
        return this.BUTTONS_GROUP_WIDTH = 3 * (this.BUTTON_WIDTH + this.BUTTON_SEP) - this.BUTTON_SEP;
      } else if (__indexOf.call(this.spec.buttons, 'time') >= 0) {
        return this.BUTTONS_GROUP_WIDTH = x - this.GROUP_SEP - this.x;
      } else {
        return this.BUTTONS_GROUP_WIDTH = x - this.BUTTON_SEP - this.x;
      }
    };

    return _Class;

  })();

  /*
  
  (c) 2012, Huub de Beer, Huub@heerdebeer.org
  */

  Widget = (function() {

    function Widget(canvas, x, y, spec) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.spec = spec != null ? spec : {};
      this.widgets = this.canvas.set();
      this.dx = this.dy = 0;
    }

    Widget.prototype.place_at = function(x, y) {
      /*
          Place this widget at co-ordinates x an y
      */      this._compute_geometry();
      this.dx = x - this.geometry.left;
      this.dy = y - this.geometry.top;
      this.widgets.transform("...t" + this.dx + "," + this.dy);
      this.x = x;
      this.y = y;
      this._compute_geometry();
      return this;
    };

    Widget.prototype._draw = function() {
      /*
          Draw this widget. Virtual method to be overloaded by all subclasses of 
          Widget. All shapes drawn are added to the list of widgets
      */
    };

    Widget.prototype._compute_geometry = function() {
      /*
          Compute the left, top, bottom, right, width, height, and center of this 
          widget given its top-left corner (x, y). 
          
          This does not work with paths that do not start at (0,0)
      */
      var bbox;
      bbox = this.widgets.getBBox();
      this.geometry = {};
      this.geometry.width = bbox.width;
      this.geometry.height = bbox.height;
      this.geometry.top = bbox.y;
      this.geometry.left = bbox.x;
      this.geometry.right = bbox.x2;
      this.geometry.bottom = bbox.y2;
      return this.geometry.center = {
        x: (this.geometry.right - this.geometry.left) / 2 + this.geometry.left,
        y: (this.geometry.bottom - this.geometry.top) / 2 + this.geometry.top
      };
    };

    return Widget;

  })();

  window.Widget = Widget;

  /*
  (c) 2012, Huub de Beer, Huub@heerdebeer.org
  */

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

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.MeasureLineBox = (function() {

    _Class.prototype.to_json = function() {
      var export_object, ml, vol, _len, _ref;
      export_object = {
        measure_lines: []
      };
      _ref = this.glas.measure_lines;
      for (vol = 0, _len = _ref.length; vol < _len; vol++) {
        ml = _ref[vol];
        export_object.measure_lines[vol] = ml.to_json();
      }
      return JSON.stringify(export_object);
    };

    function _Class(paper, x, y, width, glass, foot, properties) {
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.glass = glass;
      this.foot = foot;
      if (properties == null) properties = {};
      this.spec = this.initialize_properties(properties);
      this.PADDING = 5;
      this.HEIGHT = 100;
      this.ML_SEP = 10;
      this.ML_WIDTH = 50;
      this.ML_HEIGHT = 15;
      this.WIDTH = 3 * this.ML_WIDTH;
      this.draw();
    }

    _Class.prototype.initialize_properties = function(p) {
      var q, _ref, _ref2, _ref3, _ref4;
      q = {};
      q.rows = (_ref = p != null ? p.rows : void 0) != null ? _ref : 2;
      q.bend = (_ref2 = p != null ? p.bend : void 0) != null ? _ref2 : false;
      q.lines = (_ref3 = p != null ? p.lines : void 0) != null ? _ref3 : this.generate_lines();
      q.editable = (_ref4 = p != null ? p.editable : void 0) != null ? _ref4 : true;
      return q;
    };

    _Class.prototype.generate_lines = function() {
      var NICE_ROUND_NUMBERS, fourth, h, higher, i, lines, lower, step;
      NICE_ROUND_NUMBERS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
      lines = [];
      fourth = this.glass.maximum_volume / 4;
      i = 0;
      while (i < NICE_ROUND_NUMBERS.length && NICE_ROUND_NUMBERS[i] <= fourth) {
        i++;
      }
      if (i < NICE_ROUND_NUMBERS.length) {
        lower = NICE_ROUND_NUMBERS[i - 1];
        higher = NICE_ROUND_NUMBERS[i];
        if (Math.abs(lower - fourth) <= Math.abs(higher - fourth)) {
          step = lower;
        } else {
          step = higher;
        }
      } else {
        step = NICE_ROUND_NUMBERS[NICE_ROUND_NUMBERS.length - 1];
      }
      h = step;
      while (h <= (this.glass.maximum_volume - step)) {
        lines.push(h);
        h += step;
      }
      return lines;
    };

    _Class.prototype.show = function() {
      return this.elements.show();
    };

    _Class.prototype.hide = function() {
      return this.elements.hide();
    };

    _Class.prototype.draw = function() {
      var ml, mml, model, rml, tbb, vol, x, y, _i, _len, _ref, _ref2, _results, _results2;
      this.elements = this.paper.set();
      this.box = this.paper.rect(this.x, this.y, this.WIDTH, this.HEIGHT);
      this.box.attr({
        stroke: 'black',
        'stroke-width': 2
      });
      this.title = this.paper.text(this.x + this.PADDING, this.y + this.PADDING, "maat-\nstreepjes");
      this.title.attr({
        'text-anchor': 'start',
        'font-family': 'sans-serif',
        'font-size': '16pt'
      });
      tbb = this.title.getBBox();
      this.HEIGHT = tbb.height + 2 * this.PADDING;
      this.WIDTH = tbb.width + 2 * this.PADDING + 4 * this.ML_WIDTH;
      this.titlebox = this.paper.rect(this.x, this.y, tbb.width + 2 * this.PADDING, this.HEIGHT);
      this.titlebox.attr({
        fill: 'gold',
        stroke: 'black',
        'stroke-width': 2
      });
      this.title.attr({
        y: this.y + this.PADDING + tbb.height / 2
      });
      this.title.toFront();
      this.box.attr({
        height: this.HEIGHT,
        width: this.WIDTH
      });
      if (!this.spec.editable) {
        this.box.hide();
        this.titlebox.hide();
        this.title.hide();
      } else {
        this.elements.push(this.box, this.titlebox, this.title);
      }
      this.MLSTART_X = this.x + tbb.width + 2 * this.PADDING + this.ML_SEP;
      this.MLSTART_Y = this.y + tbb.height / 2 - this.ML_SEP / 2;
      if (this.glass.nr_of_measure_lines === 0) {
        x = this.MLSTART_X + this.ML_WIDTH;
        y = this.MLSTART_Y;
        _ref = this.spec.lines;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ml = _ref[_i];
          mml = new MeasureLine(ml, -1, this.glass, {
            x: x,
            y: y
          }, 'right', true, this.spec.editable);
          rml = new WMeasureLine(this.paper, x, y, mml, this.foot, {
            bend: this.spec.bend
          });
          this.glass.add_measure_line(ml, -1, mml, rml);
          this.elements.push(rml.widgets);
          x += this.ML_SEP + this.ML_WIDTH;
          if (x > this.x + this.WIDTH - this.PADDING) {
            y += this.ML_SEP / 2 + this.ML_HEIGHT;
            _results.push(x = this.MLSTART_X + this.ML_WIDTH);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        _ref2 = this.glass.measure_lines;
        _results2 = [];
        for (vol in _ref2) {
          ml = _ref2[vol];
          model = ml.model;
          ml.movable = this.spec.editable;
          model.movable = this.spec.editable;
          rml = new WMeasureLine(this.paper, model.position.x, model.position.y, model, this.foot, {
            bend: this.spec.bend
          });
          _results2.push(this.elements.push(rml.widgets));
        }
        return _results2;
      }
    };

    _Class.prototype.reset = function() {
      var ml, x, y, _i, _len, _ref, _results;
      x = this.MLSTART_X + this.ML_WIDTH;
      y = this.MLSTART_Y;
      _ref = this.spec.lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ml = _ref[_i];
        x += this.ML_SEP + this.ML_WIDTH;
        if (x > this.x + this.WIDTH - this.PADDING) {
          y += this.ML_SEP / 2 + this.ML_HEIGHT;
          _results.push(x = this.MLSTART_X + this.ML_WIDTH);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return _Class;

  })();

  /*
  (c) 2012, Huub de Beer (Huub@heerdebeer.org)
  */

  WRuler = (function(_super) {

    __extends(WRuler, _super);

    function WRuler(canvas, x, y, width, height, height_in_mm, spec) {
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
      WRuler.__super__.constructor.call(this, this.canvas, this.x, this.y, this.spec);
    }

    return WRuler;

  })(Widget);

  window.WRuler = WRuler;

  /*
  (c) 2012, Huub de Beer (Huub@heerdebeer.org)
  */

  WVerticalRuler = (function(_super) {

    __extends(WVerticalRuler, _super);

    function WVerticalRuler(canvas, x, y, width, height, height_in_mm, spec) {
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
      WVerticalRuler.__super__.constructor.call(this, this.canvas, this.x, this.y, this.width, this.height, this.height_in_mm, this.spec);
      this._draw();
      this._compute_geometry();
      this.widgets.mouseover(function(e) {
        return _this.measure_line.show();
      });
      this.widgets.mouseout(function(e) {
        return _this.measure_line.hide();
      });
      this.widgets.mousemove(function(e, x, y) {
        var p;
        p = _this.fit_point(x, y);
        return _this._move_measure_line(p.y);
      });
      this.widgets.click(function(e, x, y) {
        var p;
        p = _this.fit_point(x, y);
        return _this._place_pointer(p.y);
      });
    }

    WVerticalRuler.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: x - this.canvas.canvas.parentNode.offsetLeft,
        y: y - this.canvas.canvas.parentNode.offsetTop
      };
      return point;
    };

    WVerticalRuler.prototype._place_pointer = function(y) {
      var T_HEIGHT, T_WIDTH, active, pointer, remove, triangle, unactive, _ref;
      T_WIDTH = 10;
      T_HEIGHT = 2;
      triangle = "l" + T_WIDTH + "," + T_HEIGHT + "v-" + (2 * T_HEIGHT) + "l-" + T_WIDTH + "," + T_HEIGHT + "m" + T_WIDTH + ",0";
      pointer = this.canvas.path(("M" + (this.x + this.width) + "," + y) + triangle + ("h" + (((_ref = this.spec['measure_line_width']) != null ? _ref : 500) - this.width - T_WIDTH - 2)));
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

    WVerticalRuler.prototype._move_measure_line = function(y) {
      var MEASURELINE_LENGTH, _ref;
      MEASURELINE_LENGTH = (_ref = this.spec['measure_line_width']) != null ? _ref : 500;
      return this.measure_line.attr({
        path: "M" + (this.x - this.dx) + "," + y + "h" + MEASURELINE_LENGTH,
        stroke: 'red',
        'stroke-opacity': 0.5,
        'stroke-width': 1
      });
    };

    WVerticalRuler.prototype._draw = function() {
      /*
          Draw a vertical ruler
      */
      var background, cmlabel, label, labels, ticks, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      this.unit = this.height / this.height_in_mm;
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
      cmlabel = this.canvas.text(this.x + 11, this.y + 11, "cm");
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

    WVerticalRuler.prototype._ticks_path = function() {
      /*
          Generate the ticks by moving from tick to tick and drawing a horizontal line
          for every tick.
      */
      var CM_WIDTH, HCM_WIDTH, MM_WIDTH, d, mm, x, y, _ref, _ref2, _ref3, _ref4, _ref5;
      MM_WIDTH = (_ref = this.spec.mm_width) != null ? _ref : 3;
      HCM_WIDTH = (_ref2 = this.spec.hcm_width) != null ? _ref2 : 7;
      CM_WIDTH = (_ref3 = this.spec.cm_width) != null ? _ref3 : 11;
      x = this.x + this.width;
      y = this.y + this.height - ((_ref4 = this.spec.border_width) != null ? _ref4 : 2);
      d = "";
      for (mm = 2, _ref5 = this.height_in_mm - 1; 2 <= _ref5 ? mm < _ref5 : mm > _ref5; 2 <= _ref5 ? mm++ : mm--) {
        y -= this.unit;
        d += "M" + x + "," + y;
        if (mm % 10 === 0) {
          d += "h-" + CM_WIDTH;
        } else if (mm % 5 === 0) {
          d += "h-" + HCM_WIDTH;
        } else {
          d += "h-" + MM_WIDTH;
        }
      }
      return d;
    };

    WVerticalRuler.prototype._ticks_labels = function() {
      /*
          Draw the labels of the cm ticks
      */
      var X_DISTANCE, Y_DISTANCE, cm, labels, mm, x, y, _ref, _ref2, _ref3, _ref4;
      X_DISTANCE = (_ref = this.spec.x_distance) != null ? _ref : 18;
      Y_DISTANCE = (_ref2 = this.spec.y_distance) != null ? _ref2 : 3;
      x = this.x + this.width - X_DISTANCE;
      y = this.y + this.height - ((_ref3 = this.spec.border_width) != null ? _ref3 : 2);
      cm = 0;
      labels = [];
      for (mm = 2, _ref4 = this.height_in_mm - 1; 2 <= _ref4 ? mm < _ref4 : mm > _ref4; 2 <= _ref4 ? mm++ : mm--) {
        y -= this.unit;
        if (mm % 10 === 0) {
          cm++;
          labels.push(this.canvas.text(x, y + Y_DISTANCE, "" + cm));
        }
      }
      return labels;
    };

    return WVerticalRuler;

  })(WRuler);

  window.WVerticalRuler = WVerticalRuler;

  /*
  */

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

  /*
  */

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

  /*
  
  (c) 2012, Huub de Beer, Huub@heerdebeer.org
  */

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

  window.Filler = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref10, _ref11, _ref12, _ref13, _ref14, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      p = {};
      p.components = (_ref = properties != null ? properties.components : void 0) != null ? _ref : ['tap', 'ruler', 'measure_lines', 'graph'];
      p.dimension = (_ref2 = properties != null ? properties.dimension : void 0) != null ? _ref2 : '2d';
      p.time = (_ref3 = properties != null ? properties.time : void 0) != null ? _ref3 : false;
      p.buttons = (_ref4 = properties != null ? properties.buttons : void 0) != null ? _ref4 : ['show_ml', 'show_graph'];
      if (p.dimension !== '2d' && __indexOf.call(p.buttons, 'manual_diff') >= 0) {
        delete p.buttons[p.buttons.indexOf('manual_diff')];
      }
      if (__indexOf.call(p.components, 'measure_lines') < 0 && __indexOf.call(p.buttons, 'show_ml') >= 0) {
        delete p.buttons[p.buttons.indexOf('show_ml')];
      }
      p.editable = (_ref5 = properties != null ? properties.editable : void 0) != null ? _ref5 : true;
      if (!p.editable) delete p.buttons[p.buttons.indexOf('show_ml')];
      p.icon_path = (_ref6 = properties != null ? properties.icon_path : void 0) != null ? _ref6 : 'lib/icons';
      p.fillable = (_ref7 = properties != null ? properties.fillable : void 0) != null ? _ref7 : true;
      p.speed = (_ref8 = properties != null ? properties.speed : void 0) != null ? _ref8 : 15;
      p.graph_buttons = (_ref9 = properties != null ? properties.graph_buttons : void 0) != null ? _ref9 : ['normal', 'point', 'straight', 'curve', 'remove', 'raster'];
      p.computer_graph = (_ref10 = properties != null ? properties.computer_graph : void 0) != null ? _ref10 : false;
      p.time_graph = (_ref11 = properties != null ? properties.time_graph : void 0) != null ? _ref11 : false;
      p.speed_graph = (_ref12 = properties != null ? properties.speed_graph : void 0) != null ? _ref12 : false;
      p.diff_graph = (_ref13 = properties != null ? properties.diff_graph : void 0) != null ? _ref13 : false;
      p.hide_all_except_graph = (_ref14 = properties != null ? properties.hide_all_except_graph : void 0) != null ? _ref14 : false;
      return p;
    };

    _Class.prototype.get_glass = function() {
      return this.glass;
    };

    _Class.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: x - this.paper.canvas.parentNode.offsetLeft,
        y: y - this.paper.canvas.parentNode.offsetTop
      };
      return point;
    };

    function _Class(paper, x, y, glass, width, height, properties) {
      var _this = this;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.glass = glass;
      this.width = width;
      this.height = height;
      this.differentiate_tool = __bind(this.differentiate_tool, this);
      this.spec = this.initialize_properties(properties);
      this.PADDING = 2;
      this.BUTTON_SEP = 5;
      this.BUTTON_WIDTH = 34;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      this.BUTTON_X = this.x + this.PADDING;
      this.BUTTON_Y = this.y + this.PADDING;
      CoffeeGrounds.Button.set_base_path(this.spec.icon_path);
      this.GROUP_SEP = 15;
      if (__indexOf.call(this.spec.components, 'tap') >= 0) {
        this.TAP_SEP = 10;
        this.TAP_HEIGHT = 150;
        this.spec.buttons_orientation = 'vertical';
      } else {
        this.TAP_SEP = this.BUTTON_SEP;
        this.TAP_HEIGHT = this.BUTTON_WIDTH;
        this.spec.buttons_orientation = 'horizontal';
      }
      if (__indexOf.call(this.spec.components, 'ruler') >= 0) {
        this.RULER_WIDTH = 50;
        this.RULER_SEP = 25;
        this.RULER_X = this.x + this.PADDING;
        this.RULER_Y = this.y + this.PADDING + this.TAP_HEIGHT + this.RULER_SEP;
      } else {
        this.RULER_WIDTH = 0;
        this.RULER_SEP = 0;
        this.RULER_X = 0;
        this.RULER_Y = 0;
      }
      this.GLASS_SEP = 50;
      this.GLASS_X = this.x + this.PADDING + this.RULER_SEP + this.RULER_WIDTH;
      this.GLASS_Y = this.y + this.PADDING + this.TAP_HEIGHT + this.GLASS_SEP;
      this.MLBOX_SEP = 30;
      this.MLBOX_X = this.x + this.PADDING;
      this.actions = {
        show_ml: {
          button: {
            type: 'switch',
            group: 'components',
            icon: 'transform-move',
            tooltip: 'Laat de maatstreepjes zien / verberg de maatstreepjes',
            switched_on: true,
            on_switch_on: function() {
              return _this.mlbox.show();
            },
            on_switch_off: function() {
              return _this.mlbox.hide();
            }
          }
        },
        manual_diff: {
          button: {
            type: 'switch',
            group: 'components',
            icon: 'draw-triangle',
            tooltip: 'Meet snelheid met een longdrink glas',
            switched_on: false,
            on_switch_on: function() {
              return _this.differentiate_tool();
            },
            on_switch_off: function() {
              return _this.differentiate_tool();
            }
          }
        }
      };
      this.diff_tool = true;
      this.draw();
    }

    _Class.prototype.differentiate_tool = function() {
      if (this.diff_tool) {
        this.glass_representation.stop_manual_diff();
        return this.diff_tool = false;
      } else {
        this.glass_representation.start_manual_diff();
        return this.diff_tool = true;
      }
    };

    _Class.prototype.draw = function() {
      var MID_MOVE, cover, pixels_per_cm, speed, speed_per_pixel, speedstep_candidate, speedstep_i, speedticks, speedtickspath, stream_extra, time, time_per_pixel, timestep_candidate, timestep_i, timeticks, timetickspath, vol, vol_per_pixel, volstep_candidate, volstep_i, volticks, voltickspath, _ref, _ref2;
      if (this.spec.dimension === '2d') {
        this.glass_representation = new WContourGlass(this.paper, this.GLASS_X, this.GLASS_Y, this.glass, {
          diff_graph: this.spec.diff_graph
        });
      } else {
        this.glass_representation = new W3DGlass(this.paper, this.GLASS_X, this.GLASS_Y, this.glass);
      }
      this.GLASS_HEIGHT = this.glass_representation.geometry.height;
      this.GLASS_WIDTH = this.glass_representation.geometry.width;
      this.RULER_EXTRA = (this.GLASS_SEP - this.RULER_SEP) * (this.glass.height_in_mm / this.GLASS_HEIGHT);
      if (__indexOf.call(this.spec.components, 'ruler') >= 0) {
        this.ruler = new WVerticalRuler(this.paper, this.RULER_X, this.RULER_Y, this.RULER_WIDTH, this.GLASS_HEIGHT + this.RULER_SEP, this.glass.height_in_mm + this.RULER_EXTRA, {
          'measure_line_width': this.GLASS_WIDTH + this.RULER_SEP * 2 + this.RULER_WIDTH
        });
      }
      if (__indexOf.call(this.spec.components, 'measure_lines') >= 0) {
        this.MLBOX_Y = this.GLASS_Y + this.GLASS_HEIGHT + this.MLBOX_SEP;
        this.MLBOX_WIDTH = this.RULER_WIDTH + this.RULER_SEP + this.GLASS_WIDTH;
        this.mlbox = new CoffeeGrounds.MeasureLineBox(this.paper, this.MLBOX_X, this.MLBOX_Y, this.MLBOX_WIDTH, this.glass, this.GLASS_Y + this.GLASS_HEIGHT, {
          editable: this.spec.editable,
          bend: this.spec.dimension === '2d' ? false : true
        });
      }
      if (__indexOf.call(this.spec.components, 'graph') >= 0) {
        this.GRAPH_SEP = 50;
        this.GRAPH_GRAPH_SEP = 15;
        this.GRAPH_PADDING = 2;
        this.GRAPH_AXIS_WIDTH = 40;
        this.GRAPH_BUTTON_WIDTH = 34;
        this.GRAPH_X = this.GLASS_X + this.GLASS_WIDTH + this.GRAPH_SEP;
        this.GRAPH_Y = this.RULER_Y - this.BUTTON_WIDTH - this.GRAPH_GRAPH_SEP - this.GRAPH_PADDING;
        this.GRAPH_HEIGHT = this.GLASS_HEIGHT + (this.GLASS_SEP - this.RULER_SEP) + this.GRAPH_PADDING * 2 + this.GRAPH_BUTTON_WIDTH + this.GRAPH_AXIS_WIDTH + this.GRAPH_GRAPH_SEP;
        if (this.spec.time_graph) {
          time = (this.glass.maximum_volume * 1.1) / this.spec.speed;
          this.GRAPHER_WIDTH = 450;
          this.GRAPH_WIDTH = this.GRAPHER_WIDTH - 2 * this.GRAPH_PADDING - this.GRAPH_AXIS_WIDTH;
          time_per_pixel = time / this.GRAPH_WIDTH;
          pixels_per_cm = this.glass.unit * Glass.TENTH_OF_MM;
          timestep_candidate = time / (this.GRAPH_WIDTH / pixels_per_cm);
          timeticks = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
          timestep_i = 0;
          while (timestep_i < timeticks.length && timeticks[timestep_i] <= timestep_candidate) {
            timestep_i++;
          }
          timetickspath = "" + timeticks[timestep_i - 1] + "tL";
          this.graph = new Graph(this.paper, this.GRAPH_X, this.GRAPH_Y, this.GRAPHER_WIDTH, this.GRAPH_HEIGHT, {
            x_axis: {
              label: "tijd (sec)",
              raster: true,
              unit: {
                per_pixel: time_per_pixel,
                symbol: "sec",
                quantity: "tijd"
              },
              max: time,
              tickspath: timetickspath,
              orientation: 'horizontal'
            },
            y_axis: {
              label: "hoogte (cm)",
              raster: true,
              unit: {
                per_pixel: 0.1 / this.glass.unit,
                symbol: "cm",
                quantity: "hoogte"
              },
              max: this.glass.height_in_mm + this.RULER_EXTRA,
              tickspath: "0.5tL",
              orientation: 'vertical'
            },
            buttons: this.spec.graph_buttons,
            computer_graph: this.spec.computer_graph,
            editable: this.spec.editable,
            icon_path: this.spec.icon_path
          });
          this.glass.create_graph(this.paper, this.graph.computer_graph, this.graph.computer_line, 'time', this.spec.speed);
        } else if (this.spec.speed_graph) {
          speed = this.glass.maximum_speed * 1.10;
          this.GRAPHER_HEIGHT = this.GRAPH_HEIGHT - 2 * this.GRAPH_PADDING - this.GRAPH_BUTTON_WIDTH - this.GRAPH_AXIS_WIDTH - this.GRAPH_GRAPH_SEP;
          speed_per_pixel = speed / this.GRAPHER_HEIGHT;
          speedstep_candidate = speed / 10;
          speedticks = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];
          speedstep_i = 0;
          while (speedstep_i < speedticks.length && speedticks[speedstep_i] <= speedstep_candidate) {
            speedstep_i++;
          }
          speedtickspath = "" + speedticks[speedstep_i - 1] + "tL";
          vol = this.glass.maximum_volume * 1.10;
          this.GRAPHER_WIDTH = 450;
          this.GRAPH_WIDTH = this.GRAPHER_WIDTH - 2 * this.GRAPH_PADDING - this.GRAPH_AXIS_WIDTH;
          vol_per_pixel = vol / this.GRAPH_WIDTH;
          pixels_per_cm = this.glass.unit * Glass.TENTH_OF_MM;
          volstep_candidate = vol / 15;
          volticks = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
          volstep_i = 0;
          while (volstep_i < volticks.length && volticks[volstep_i] <= volstep_candidate) {
            volstep_i++;
          }
          voltickspath = "" + volticks[volstep_i - 1] + "tL";
          this.graph = new Graph(this.paper, this.GRAPH_X, this.GRAPH_Y, this.GRAPHER_WIDTH, this.GRAPH_HEIGHT, {
            x_axis: {
              label: "volume (ml)",
              raster: true,
              unit: {
                per_pixel: vol_per_pixel,
                symbol: "ml",
                quantity: "volume"
              },
              max: vol,
              tickspath: voltickspath,
              orientation: 'horizontal'
            },
            y_axis: {
              label: "stijgsnelheid (cm/ml)",
              raster: true,
              unit: {
                per_pixel: speed_per_pixel,
                symbol: "cm/ml",
                quantity: "stijgsnelheid"
              },
              max: speed,
              tickspath: speedtickspath,
              orientation: 'vertical'
            },
            buttons: this.spec.graph_buttons,
            computer_graph: this.spec.computer_graph,
            editable: this.spec.editable,
            icon_path: this.spec.icon_path
          });
          this.glass.create_graph(this.paper, this.graph.computer_graph, this.graph.computer_line, 'vol', true);
        } else {
          vol = this.glass.maximum_volume * 1.10;
          this.GRAPHER_WIDTH = 450;
          this.GRAPH_WIDTH = this.GRAPHER_WIDTH - 2 * this.GRAPH_PADDING - this.GRAPH_AXIS_WIDTH;
          vol_per_pixel = vol / this.GRAPH_WIDTH;
          pixels_per_cm = this.glass.unit * Glass.TENTH_OF_MM;
          volstep_candidate = vol / (this.GRAPH_WIDTH / pixels_per_cm);
          volticks = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
          volstep_i = 0;
          while (volstep_i < volticks.length && volticks[volstep_i] <= volstep_candidate) {
            volstep_i++;
          }
          voltickspath = "" + volticks[volstep_i - 1] + "tL";
          this.graph = new Graph(this.paper, this.GRAPH_X, this.GRAPH_Y, this.GRAPHER_WIDTH, this.GRAPH_HEIGHT, {
            x_axis: {
              label: "volume (ml)",
              raster: true,
              unit: {
                per_pixel: vol_per_pixel,
                symbol: "ml",
                quantity: "volume"
              },
              max: vol,
              tickspath: voltickspath,
              orientation: 'horizontal'
            },
            y_axis: {
              label: "hoogte (cm)",
              raster: true,
              unit: {
                per_pixel: 0.1 / this.glass.unit,
                symbol: "cm",
                quantity: "hoogte"
              },
              max: this.glass.height_in_mm + this.RULER_EXTRA,
              tickspath: "0.5tL",
              orientation: 'vertical'
            },
            buttons: this.spec.graph_buttons,
            computer_graph: this.spec.computer_graph,
            editable: this.spec.editable,
            icon_path: this.spec.icon_path
          });
          this.glass.create_graph(this.paper, this.graph.computer_graph, this.graph.computer_line, 'vol');
        }
      }
      this.computer_graph = (_ref = (_ref2 = this.graph) != null ? _ref2.computer_graph : void 0) != null ? _ref : null;
      if (this.spec.diff_graph) this.glass_representation.set_graph(this.graph);
      if (__indexOf.call(this.spec.components, 'tap') >= 0) {
        stream_extra = this.GLASS_SEP - 5;
        MID_MOVE = 10;
        this.tap = new CoffeeGrounds.Tap(this.paper, this.GLASS_X + this.GLASS_WIDTH / 2 - MID_MOVE, this.y, this.glass, this.computer_graph, {
          glass_to_fill: this.glass_representation,
          time: this.spec.time,
          runnable: this.spec.fillable,
          speed: this.spec.speed,
          stream_extra: stream_extra,
          icon_path: this.spec.icon_path
        });
      }
      this.draw_buttons();
      if (this.spec.hide_all_except_graph) {
        cover = this.paper.rect(this.x - 5, this.y - 5, this.GRAPH_X - this.x, this.height);
        return cover.attr({
          fill: 'white',
          stroke: 'white'
        });
      }
    };

    _Class.prototype.draw_buttons = function() {
      var action, button, buttongroup, group, name, optiongroup, optiongroups, sep, x, y, _ref, _ref2, _ref3, _ref4, _results;
      x = this.BUTTON_X;
      y = this.BUTTON_Y;
      this.mode = "";
      group = '';
      optiongroups = {};
      sep = 0;
      this.buttons = {};
      _ref = this.actions;
      for (name in _ref) {
        action = _ref[name];
        if (__indexOf.call(this.spec.buttons, name) >= 0) {
          button = action.button;
          if (group !== '') {
            if (this.spec.buttons_orientation === 'horizontal') {
              if (button.group === group) {
                x += this.BUTTON_WIDTH + this.BUTTON_SEP;
              } else {
                x += this.BUTTON_WIDTH + this.GROUP_SEP;
              }
            } else {
              if (button.group === group) {
                y += this.BUTTON_WIDTH + this.BUTTON_SEP;
              } else {
                y += this.BUTTON_WIDTH + this.GROUP_SEP;
              }
            }
          }
          group = button.group;
          switch (button.type) {
            case 'action':
              this.buttons.name = new CoffeeGrounds.ActionButton(this.paper, {
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                action: button.action
              });
              break;
            case 'switch':
              this.buttons.name = new CoffeeGrounds.SwitchButton(this.paper, {
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                switched_on: (_ref2 = button != null ? button.switched_on : void 0) != null ? _ref2 : false,
                on_switch_on: button.on_switch_on,
                on_switch_off: button.on_switch_off
              });
              break;
            case 'group':
              optiongroups[button.option_group] = (_ref3 = optiongroups[button.option_group]) != null ? _ref3 : [];
              optiongroups[button.option_group].push({
                x: x,
                y: y,
                icon: button.icon,
                tooltip: button.tooltip,
                value: name,
                on_select: button.on_select,
                chosen: (_ref4 = button["default"]) != null ? _ref4 : false
              });
          }
        }
      }
      _results = [];
      for (name in optiongroups) {
        optiongroup = optiongroups[name];
        buttongroup = new CoffeeGrounds.ButtonGroup(this.paper, optiongroup);
        _results.push((function() {
          var _i, _len, _ref5, _results2;
          _ref5 = buttongroup.buttons;
          _results2 = [];
          for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
            button = _ref5[_i];
            _results2.push(this.buttons[button.value] = button);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    return _Class;

  })();

}).call(this);
