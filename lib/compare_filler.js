
/*
glass.coffee version 0.1

Modeling different glasses

(c) 2012 Huub de Beer Huub@heerdebeer.org

Long description
*/

(function() {
  var Glass, MeasureLine, WContourGlass, WGlass, WMeasureLine, WRuler, WVerticalRuler, Widget,
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
      return this.lrp.hide();
    };

    WContourGlass.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: x - this.canvas.canvas.parentNode.offsetLeft,
        y: y - this.canvas.canvas.parentNode.offsetTop
      };
      return point;
    };

    WContourGlass.prototype.move_longdrink = function(glassrep) {
      var _this = this;
      return function(e, x, y) {
        var BELOW, compute_vol, h, hi, left, length, p, path, ph, py, r, right, rmm, vol;
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
        _this.lf.attr({
          x: left + _this.dx,
          y: right.y + _this.dy,
          width: right.x - left,
          height: BELOW
        });
        path = "M" + right.x + "," + (right.y - hi + BELOW) + "H" + (-_this.dx + 10);
        _this.lml.attr({
          path: path,
          transform: "t" + _this.dx + "," + _this.dy
        });
        path = "M" + right.x + "," + (right.y + BELOW) + "H" + (-_this.dx + 10);
        _this.lbl.attr({
          path: path,
          transform: "t" + _this.dx + "," + _this.dy
        });
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

  window.CompareFiller = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2, _ref3, _ref4;
      p = {};
      p.dimension = (_ref = properties != null ? properties.dimension : void 0) != null ? _ref : '2d';
      p.time = (_ref2 = properties != null ? properties.time : void 0) != null ? _ref2 : false;
      p.icon_path = (_ref3 = properties != null ? properties.icon_path : void 0) != null ? _ref3 : 'lib/icons';
      p.fillable = (_ref4 = properties != null ? properties.fillable : void 0) != null ? _ref4 : true;
      return p;
    };

    _Class.prototype.get_glass = function() {
      return this.glass;
    };

    _Class.prototype.start = function() {
      var glass, _i, _len, _ref, _results;
      _ref = this.glasses;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        glass = _ref[_i];
        glass.tap.start();
        _results.push(glass.tap.simulation.select('play'));
      }
      return _results;
    };

    _Class.prototype.empty = function() {
      var glass, _i, _len, _ref, _results;
      _ref = this.glasses;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        glass = _ref[_i];
        glass.tap.empty();
        _results.push(glass.tap.simulation.select('start'));
      }
      return _results;
    };

    _Class.prototype.pause = function() {
      var glass, _i, _len, _ref, _results;
      _ref = this.glasses;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        glass = _ref[_i];
        glass.tap.pause();
        _results.push(glass.tap.simulation.select('pause'));
      }
      return _results;
    };

    _Class.prototype.full = function() {
      var glass, _i, _len, _ref, _results;
      _ref = this.glasses;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        glass = _ref[_i];
        glass.tap.full();
        _results.push(glass.tap.simulation.select('end'));
      }
      return _results;
    };

    _Class.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: x - this.paper.canvas.parentNode.offsetLeft,
        y: y - this.paper.canvas.parentNode.offsetTop
      };
      return point;
    };

    function _Class(paper, x, y, glasses, width, height, properties) {
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.glasses = glasses;
      this.width = width;
      this.height = height;
      this.spec = this.initialize_properties(properties);
      this.PADDING = 2;
      this.TAP_SEP = 10;
      this.TAP_HEIGHT = 150;
      this.RULER_WIDTH = 50;
      this.RULER_SEP = 25;
      this.RULER_X = this.x + this.PADDING;
      this.RULER_Y = this.y + this.PADDING + this.TAP_HEIGHT + this.RULER_SEP;
      this.GLASS_SEP = 50;
      this.GLASS_X = this.x + this.PADDING + this.RULER_SEP + this.RULER_WIDTH;
      this.GLASS_Y = this.y + this.PADDING + this.TAP_HEIGHT + this.GLASS_SEP;
      this.COMPARE_SEP = 75;
      this.draw();
    }

    _Class.prototype.draw = function() {
      var MID_MOVE, glass, glass_height, glass_representation, glass_width, glass_x, glass_y, max_glass_height, max_height, ruler, ruler_extra, stream_extra, tap, total_width, x, y, _i, _j, _len, _len2, _ref, _ref2;
      x = this.x + this.PADDING;
      y = this.y + this.PADDING + this.TAP_HEIGHT + this.GLASS_SEP;
      max_height = 0;
      max_glass_height = 0;
      _ref = this.glasses;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        glass = _ref[_i];
        max_height = Math.max(max_height, glass.model.height_in_mm);
        glass.glass_height = glass.model.foot.y - glass.model.edge.y;
        max_glass_height = Math.max(max_glass_height, glass.glass_height);
      }
      total_width = 0;
      _ref2 = this.glasses;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        glass = _ref2[_j];
        glass_x = x + this.RULER_WIDTH + this.RULER_SEP;
        glass_y = y + (max_glass_height - glass.glass_height);
        glass_representation = new WContourGlass(this.paper, glass_x, glass_y, glass.model);
        glass_height = glass_representation.geometry.height;
        glass_width = glass_representation.geometry.width;
        MID_MOVE = 10;
        stream_extra = Math.abs(glass.glass_height - max_glass_height) + this.GLASS_SEP - 7;
        tap = new CoffeeGrounds.Tap(this.paper, glass_x + glass_width / 2 - MID_MOVE, this.y + this.PADDING, glass.model, null, {
          speed: glass.speed,
          glass_to_fill: glass_representation,
          time: glass.time,
          runnable: glass.runnable,
          icon_path: this.spec.icon_path,
          stream_extra: stream_extra
        });
        x += glass_width + this.COMPARE_SEP;
        total_width += glass_width + this.COMPARE_SEP;
        glass.tap = tap;
      }
      ruler_extra = (this.GLASS_SEP - this.RULER_SEP) * (max_height / max_glass_height);
      return ruler = new WVerticalRuler(this.paper, this.RULER_X, this.RULER_Y, this.RULER_WIDTH, max_glass_height + this.RULER_SEP, max_height + ruler_extra, {
        'measure_line_width': total_width + this.RULER_SEP * 2 + this.RULER_WIDTH
      });
    };

    return _Class;

  })();

}).call(this);
