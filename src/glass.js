
/*
glass.coffee version 0.1

Modeling different glasses

(c) 2012 Huub de Beer H.T.de.Beer@gmail.com

Long description
*/

(function() {
  var Glass;

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

}).call(this);
