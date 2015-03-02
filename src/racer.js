(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Racer = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2, _ref3, _ref4;
      p = {};
      p.speed = (_ref = properties != null ? properties.speed : void 0) != null ? _ref : 5;
      p.buttons = (_ref2 = properties != null ? properties.buttons : void 0) != null ? _ref2 : ['restart', 'pause', 'race', 'finish'];
      p.runnable = (_ref3 = properties != null ? properties.runnable : void 0) != null ? _ref3 : true;
      if (!p.runnable) p.buttons = [];
      p.icon_path = (_ref4 = properties != null ? properties.icon_path : void 0) != null ? _ref4 : 'lib/icons';
      return p;
    };

    function _Class(paper, x, y, track, graph, properties) {
      var _ref, _ref2,
        _this = this;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.track = track;
      this.graph = graph;
      this.race = __bind(this.race, this);
      this.start = __bind(this.start, this);
      this.pause = __bind(this.pause, this);
      this.restart = __bind(this.restart, this);
      this.PADDING = 5;
      this.LABEL_SEP = 10;
      this.TRACK_SEP = 25;
      this.spec = this.initialize_properties(properties);
      this.BUTTON_WIDTH = 34;
      this.BUTTON_SEP = 5;
      this.GROUP_SEP = 15;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      CoffeeGrounds.Button.set_base_path(this.spec.icon_path);
      this.actions = {
        restart: {
          button: {
            type: 'group',
            value: 'restart',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-skip-backward',
            tooltip: 'Terug naar de start',
            on_select: function() {
              _this.change_mode('restart');
              return _this.restart();
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
            tooltip: 'Pauzeer de race',
            on_select: function() {
              _this.change_mode('pause');
              return _this.pause();
            },
            enabled: true
          }
        },
        race: {
          button: {
            type: 'group',
            value: 'race',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-playback-start',
            tooltip: 'Start de race / ga verder met racen',
            on_select: function() {
              _this.change_mode('race');
              return _this.start();
            },
            enabled: true
          }
        }
      };
      this.acceleration = this.parse_accelerationpath((_ref = (_ref2 = this.track) != null ? _ref2.accelerationpath : void 0) != null ? _ref : '0.1|10');
      this.mode = 'start';
      this.time = 0;
      this.distance = 0;
      this.id = -1;
      this.time_step = 50;
      this.speed = 0;
      this.current_acceleration_spectification = 0;
      this.draw();
      this.update_labels();
      this.compute_maximum();
      this.length = 0;
      this.racing = false;
      this.graphpath = "";
      this.max_length = Raphael.getTotalLength(this.trackpath);
    }

    _Class.prototype.set_graph = function(graph) {
      return this.graph = graph;
    };

    _Class.prototype.get_graph = function() {
      return this.graph;
    };

    _Class.prototype.update_labels = function() {
      this.time_label.attr({
        text: this.time.toFixed(2)
      });
      return this.distance_label.attr({
        text: this.distance.toFixed(2)
      });
    };

    _Class.prototype.change_mode = function(mode) {
      return this.mode = mode;
    };

    _Class.prototype.restart = function() {
      var point;
      this.time = 0;
      this.distance = 0;
      this.racing = false;
      this.length = 0;
      this.graphpath = "";
      this.speed = 0;
      this.current_acceleration_spectification = 0;
      clearInterval(this.id);
      point = Raphael.getPointAtLength(this.trackpath, this.length);
      this.place_car(point.x, point.y, point.alpha);
      return this.update_labels();
    };

    _Class.prototype.pause = function() {
      clearInterval(this.id);
      return this.racing = false;
    };

    _Class.prototype.start = function() {
      clearInterval(this.id);
      this.racing = true;
      return this.id = setInterval(this.race, this.time_step);
    };

    _Class.prototype.update_graph = function(dtime, ddistance) {
      var line, p, x, y;
      line = this.graph.computer_line;
      x = line.min.x;
      y = line.max.y;
      if (this.graphpath === "") {
        this.graphpath = "M" + x + "," + y;
        this.graphpath += "l" + (dtime / line.x_unit.per_pixel) + ",-" + (ddistance / line.y_unit.per_pixel);
      } else {
        this.graphpath += "l" + (dtime / line.x_unit.per_pixel) + ",-" + (ddistance / line.y_unit.per_pixel);
      }
      this.graph.computer_graph.attr({
        path: this.graphpath
      });
      line.add_point(x, y, this.graph);
      p = line.find_point_at(x);
      return line.add_freehand_line(p, this.graphpath);
    };

    _Class.prototype.race = function() {
      var acceleration, ddistance, point;
      if (this.racing && this.length < this.max_length - 10) {
        if (this.distance < this.acceleration[this.current_acceleration_spectification].distance) {
          acceleration = this.acceleration[this.current_acceleration_spectification].acceleration;
        } else {
          if (this.current_acceleration_spectification < this.acceleration.length - 1) {
            this.current_acceleration_spectification = this.current_acceleration_spectification + 1;
          }
          acceleration = this.acceleration[this.current_acceleration_spectification].acceleration;
        }
        this.speed += acceleration;
        this.time += this.time_step / 1000;
        ddistance = this.time_step * (this.speed / 1000);
        this.distance += ddistance;
        this.length += ddistance / this.track.meter_per_pixel;
        point = Raphael.getPointAtLength(this.trackpath, this.length);
        this.place_car(point.x, point.y, point.alpha);
        this.update_labels();
        return this.update_graph(this.time_step / 1000, ddistance);
      } else {
        this.racing = false;
        clearInterval(this.id);
        this.simulation.deselect('race');
        point = Raphael.getPointAtLength(this.trackpath, this.max_length);
        return this.place_car(point.x, point.y, 135);
      }
    };

    _Class.prototype.compute_maximum = function() {
      var acc, curr_accl, ddistance, distance, speed, time;
      this.maximum_distance = Raphael.getTotalLength(this.trackpath) * this.track.meter_per_pixel;
      time = 0;
      distance = 0;
      curr_accl = 0;
      speed = 0;
      acc = 0;
      while (distance < this.maximum_distance) {
        if (distance < this.acceleration[curr_accl].distance) {
          acc = this.acceleration[curr_accl].acceleration;
        } else {
          if (curr_accl < this.acceleration.length - 1) curr_accl = curr_accl + 1;
          acc = this.acceleration[curr_accl].acceleration;
        }
        speed += acc;
        time += this.time_step / 1000;
        ddistance = this.time_step * (speed / 1000);
        distance += ddistance;
      }
      return this.maximum_time = time;
    };

    _Class.prototype.draw = function() {
      var LARGE_TICK, SMALL_TICK, START_TICK, distance_label_label, distance_label_y, distance_unit_label, dllbb, i, label_format, label_label_format, legend_label, legend_size, legend_x, legend_y, legendmarking, legendpath, legendtrack, length, ltbb, max_length, midmarking, point, racetrack, rtbb, seperator, seperator_y, step, tick, ticks, time_label_label, time_label_x, time_unit_label, tlbb, tllbb, track_x, track_y, unit_x, y;
      this.draw_buttons();
      y = this.y + this.PADDING + this.BUTTON_WIDTH + this.TRACK_SEP;
      label_format = {
        'font-family': 'sans-serif',
        'font-size': '16pt',
        'text-anchor': 'end'
      };
      label_label_format = {
        'font-family': 'sans-serif',
        'font-size': '16pt',
        'text-anchor': 'start'
      };
      time_label_label = this.paper.text(this.x + this.PADDING, y, "tijd :");
      time_label_label.attr(label_label_format);
      tllbb = time_label_label.getBBox();
      distance_label_y = y + tllbb.height + this.LABEL_SEP;
      distance_label_label = this.paper.text(this.x + this.PADDING, distance_label_y, "afstand :");
      distance_label_label.attr(label_label_format);
      dllbb = distance_label_label.getBBox();
      this.time_label = this.paper.text(this.x, y, "8888,88");
      this.time_label.attr(label_format);
      tlbb = this.time_label.getBBox();
      time_label_x = this.x + this.PADDING + dllbb.width + this.LABEL_SEP + tlbb.width;
      this.time_label.attr({
        x: time_label_x
      });
      this.distance_label = this.paper.text(time_label_x, distance_label_y, "3300");
      this.distance_label.attr(label_format);
      unit_x = time_label_x + this.LABEL_SEP;
      time_unit_label = this.paper.text(unit_x, y, "sec");
      time_unit_label.attr(label_label_format);
      distance_unit_label = this.paper.text(unit_x, distance_label_y, "m");
      distance_unit_label.attr(label_label_format);
      seperator_y = distance_label_y + dllbb.height + this.LABEL_SEP;
      track_y = seperator_y + this.TRACK_SEP;
      track_x = this.x + this.PADDING;
      this.trackpath = ("M" + (track_x + this.track.move_x) + "," + track_y) + this.track.path;
      SMALL_TICK = 10;
      LARGE_TICK = 14;
      START_TICK = 20;
      ticks = this.parse_tickspath(this.track.ticks);
      length = 0;
      max_length = Raphael.getTotalLength(this.trackpath);
      step = ticks.distance / this.track.meter_per_pixel;
      i = 0;
      while (length < max_length + step) {
        point = Raphael.getPointAtLength(this.trackpath, length);
        if (ticks[i].size === 'large') {
          tick = this.paper.path("M" + point.x + "," + point.y + "v" + LARGE_TICK + "v-" + (2 * LARGE_TICK));
          tick.attr({
            'stroke-width': 2,
            stroke: 'orange'
          });
        } else {
          tick = this.paper.path("M" + point.x + "," + point.y + "v" + SMALL_TICK + "v-" + (2 * SMALL_TICK));
        }
        tick.attr({
          transform: "r" + point.alpha
        });
        length += step;
        i = (i + 1) % ticks.length;
      }
      point = Raphael.getPointAtLength(this.trackpath, length);
      tick = this.paper.path("M" + point.x + "," + point.y + "v" + START_TICK + "v-" + (2 * START_TICK));
      tick.attr({
        'stroke-width': 4,
        stroke: 'red'
      });
      racetrack = this.paper.path(this.trackpath);
      racetrack.attr({
        stroke: '#222',
        'stroke-width': 16
      });
      midmarking = this.paper.path(this.trackpath);
      midmarking.attr({
        stroke: '#eee',
        'stroke-width': 3
      });
      rtbb = racetrack.getBBox();
      seperator = this.paper.path("M" + this.x + "," + seperator_y + "h" + (rtbb.width + this.PADDING + 32));
      seperator.attr({
        'stroke-width': 2
      });
      legend_size = (ticks.length * ticks.distance) / this.track.meter_per_pixel;
      legend_x = rtbb.x2 - legend_size + 2 * this.PADDING;
      legend_y = rtbb.y2 + 2 * this.TRACK_SEP;
      legendpath = "M" + legend_x + "," + legend_y + "h" + legend_size;
      legendtrack = this.paper.path(legendpath);
      legendtrack.attr({
        stroke: '#222',
        'stroke-width': 16
      });
      legendmarking = this.paper.path(legendpath);
      legendmarking.attr({
        stroke: '#eee',
        'stroke-width': 3
      });
      i = 0;
      length = 0;
      point = Raphael.getPointAtLength(legendpath, length);
      tick = this.paper.path("M" + point.x + "," + point.y + "v" + LARGE_TICK + "v-" + (2 * LARGE_TICK));
      tick.attr({
        'stroke-width': 2,
        stroke: 'orange'
      });
      length += step;
      while (length < legend_size) {
        point = Raphael.getPointAtLength(legendpath, length);
        if (ticks[i].size === 'large') {
          tick = this.paper.path("M" + point.x + "," + point.y + "v" + LARGE_TICK + "v-" + (2 * LARGE_TICK));
          tick.attr({
            'stroke-width': 2,
            stroke: 'orange'
          });
        } else {
          tick = this.paper.path("M" + point.x + "," + point.y + "v" + SMALL_TICK + "v-" + (2 * SMALL_TICK));
        }
        tick.attr({
          transform: "r" + point.alpha
        });
        length += step;
        i++;
      }
      point = Raphael.getPointAtLength(legendpath, length);
      tick = this.paper.path("M" + point.x + "," + point.y + "v" + LARGE_TICK + "v-" + (2 * LARGE_TICK));
      tick.attr({
        'stroke-width': 2,
        stroke: 'orange'
      });
      ltbb = legendtrack.getBBox();
      legend_y += ltbb.height + 3 * this.LABEL_SEP;
      legend_label = this.paper.text(legend_x, legend_y, "= " + (ticks.length * ticks.distance) + " meter");
      legend_label.attr(label_label_format);
      point = Raphael.getPointAtLength(this.trackpath, 0);
      this.CAR_WIDTH = 26;
      this.CAR_HEIGHT = 13;
      this.car = this.paper.image('../raceauto_geel.png', 0, 0, this.CAR_WIDTH, this.CAR_HEIGHT);
      this.car.attr({
        fill: 'yellow',
        stroke: 'black'
      });
      this.place_car(point.x, point.y, 180);
      return this.width = this.PADDING * 2 + rtbb.width;
    };

    _Class.prototype.place_car = function(x, y, angle) {
      if (angle == null) angle = 0;
      return this.car.attr({
        x: x - this.CAR_WIDTH / 2,
        y: y - this.CAR_HEIGHT / 2,
        transform: "R" + angle
      });
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

    _Class.prototype.parse_accelerationpath = function(s) {
      var accel_arr, accel_parts, acceleration_spec, match, part, pattern, _i, _len;
      pattern = /((?:-)?\d+(?:\.\d+)?)\|(\d+(?:\.\d+)?)/;
      accel_parts = s.split(',');
      accel_arr = [];
      for (_i = 0, _len = accel_parts.length; _i < _len; _i++) {
        part = accel_parts[_i];
        match = pattern.exec(part);
        acceleration_spec = {
          acceleration: parseFloat(match[1]),
          distance: parseFloat(match[2])
        };
        accel_arr.push(acceleration_spec);
      }
      return accel_arr;
    };

    return _Class;

  })();

}).call(this);
