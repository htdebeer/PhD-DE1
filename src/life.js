(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Life = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2, _ref3;
      p = {};
      p.buttons = (_ref = properties != null ? properties.buttons : void 0) != null ? _ref : ['restart', 'pause', 'step'];
      p.runnable = (_ref2 = properties != null ? properties.runnable : void 0) != null ? _ref2 : true;
      if (!p.runnable) p.buttons = [];
      p.icon_path = (_ref3 = properties != null ? properties.icon_path : void 0) != null ? _ref3 : 'lib/icons';
      return p;
    };

    function _Class(paper, x, y, config, graph, properties) {
      var _this = this;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.config = config;
      this.graph = graph;
      this.step = __bind(this.step, this);
      this.start = __bind(this.start, this);
      this.pause = __bind(this.pause, this);
      this.restart = __bind(this.restart, this);
      this.PADDING = 5;
      this.LABEL_SEP = 10;
      this.SIM_SEP = 25;
      this.spec = this.initialize_properties(properties);
      this.ALIVE_COLOR = 'black';
      this.DEAD_COLOR = 'white';
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
            tooltip: 'Terug naar het begin',
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
            tooltip: 'Pauzeer de simulation',
            on_select: function() {
              _this.change_mode('pause');
              return _this.pause();
            },
            enabled: true
          }
        },
        step: {
          button: {
            type: 'group',
            value: 'step',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-playback-start',
            tooltip: 'Start de simulation / ga verder met de simulation',
            on_select: function() {
              _this.change_mode('step');
              return _this.start();
            },
            enabled: true
          }
        }
      };
      this.mode = 'start';
      this.population = this.config.initial_configuration.length;
      this.generation = 0;
      this.id = -1;
      this.time_step = 1000 / this.config.speed;
      this.simulating = false;
      this.maximum_generation = this.config.maximum_generation;
      this.maximum_population = this.config.width * this.config.height;
      this.current = this.generate_configuration(this.config.width, this.config.height, this.config.initial_configuration);
      this.next = this.generate_configuration(this.config.width, this.config.height);
      this.draw();
      this.update_labels();
      this.length = 0;
      this.graphpath = "";
    }

    _Class.prototype.generate_configuration = function(width, height, init) {
      var col, config, row, _ref;
      if (init == null) init = [];
      config = [];
      for (row = 0; 0 <= height ? row < height : row > height; 0 <= height ? row++ : row--) {
        config[row] = [];
        for (col = 0; 0 <= width ? col < width : col > width; 0 <= width ? col++ : col--) {
          config[row].push((_ref = "" + row + ";" + col, __indexOf.call(init, _ref) >= 0) ? 1 : 0);
        }
      }
      return config;
    };

    _Class.prototype.neighbor_count = function(row, col) {
      var colnext, colprev, count, rownext, rowprev;
      count = 0;
      rowprev = row === 0 ? this.config.height - 1 : row - 1;
      rownext = row === this.config.height - 1 ? 0 : row + 1;
      colprev = col === 0 ? this.config.width - 1 : col - 1;
      colnext = col === this.config.width - 1 ? 0 : col + 1;
      if (this.current[rownext][col] === 1) count++;
      if (this.current[rownext][colnext] === 1) count++;
      if (this.current[row][colnext] === 1) count++;
      if (this.current[row][colprev] === 1) count++;
      if (this.current[rownext][colprev] === 1) count++;
      if (this.current[rowprev][col] === 1) count++;
      if (this.current[rowprev][colprev] === 1) count++;
      if (this.current[rowprev][colnext] === 1) count++;
      return count;
    };

    _Class.prototype.next_configuration = function() {
      var alive, col, neighbors, population, row, _ref, _ref2;
      population = 0;
      for (row = 0, _ref = this.config.height; 0 <= _ref ? row < _ref : row > _ref; 0 <= _ref ? row++ : row--) {
        for (col = 0, _ref2 = this.config.width; 0 <= _ref2 ? col < _ref2 : col > _ref2; 0 <= _ref2 ? col++ : col--) {
          neighbors = this.neighbor_count(row, col);
          if (this.config.highlife) {
            alive = (this.current[row][col] === 1) && neighbors === 2 || neighbors === 3 || neighbors === 6;
          } else {
            alive = (this.current[row][col] === 1) && neighbors === 2 || neighbors === 3;
          }
          this.next[row][col] = alive ? 1 : 0;
          if (alive) population++;
        }
      }
      this.current = this.next;
      return population;
    };

    _Class.prototype.set_graph = function(graph) {
      return this.graph = graph;
    };

    _Class.prototype.get_graph = function() {
      return this.graph;
    };

    _Class.prototype.update_configuration = function() {
      var alive, col, row, _ref, _results;
      _results = [];
      for (row = 0, _ref = this.config.height; 0 <= _ref ? row < _ref : row > _ref; 0 <= _ref ? row++ : row--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (col = 0, _ref2 = this.config.width; 0 <= _ref2 ? col < _ref2 : col > _ref2; 0 <= _ref2 ? col++ : col--) {
            alive = this.current[row][col] === 1 ? this.ALIVE_COLOR : this.DEAD_COLOR;
            _results2.push(this.configuration_view[row][col].attr({
              fill: alive
            }));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    _Class.prototype.update_labels = function() {
      this.generation_label.attr({
        text: this.generation
      });
      return this.population_label.attr({
        text: this.population
      });
    };

    _Class.prototype.change_mode = function(mode) {
      return this.mode = mode;
    };

    _Class.prototype.restart = function() {
      this.time = 0;
      this.generation = 0;
      this.population = this.config.initial_configuration.length;
      this.simulating = false;
      this.length = 0;
      this.graphpath = "";
      this.current = this.generate_configuration(this.config.width, this.config.height, this.config.initial_configuration);
      this.next = this.generate_configuration(this.config.width, this.config.height);
      this.update_configuration();
      clearInterval(this.id);
      this.update_labels();
      return this.update_graph();
    };

    _Class.prototype.pause = function() {
      clearInterval(this.id);
      return this.simulating = false;
    };

    _Class.prototype.start = function() {
      clearInterval(this.id);
      this.simulating = true;
      return this.id = setInterval(this.step, this.time_step);
    };

    _Class.prototype.update_graph = function(dgen, dpop) {
      var line, p, x, y;
      dpop = -1 * dpop;
      line = this.graph.computer_line;
      x = line.min.x;
      y = line.max.y;
      if (this.graphpath === "") {
        this.graphpath = "M" + x + "," + y;
        this.graphpath += "m0," + ((-1 * this.population) / line.y_unit.per_pixel);
        this.graphpath += "l" + (dgen / line.x_unit.per_pixel) + "," + (dpop / line.y_unit.per_pixel);
      } else {
        this.graphpath += "l" + (dgen / line.x_unit.per_pixel) + "," + (dpop / line.y_unit.per_pixel);
      }
      this.graph.computer_graph.attr({
        path: this.graphpath
      });
      line.add_point(x, y, this.graph);
      p = line.find_point_at(x);
      return line.add_freehand_line(p, this.graphpath);
    };

    _Class.prototype.step = function() {
      var dpop, newpop;
      if (this.simulating && this.generation < this.maximum_generation) {
        this.generation++;
        newpop = this.next_configuration();
        dpop = newpop - this.population;
        this.population = newpop;
        this.update_configuration();
        this.update_graph(1, dpop);
        return this.update_labels();
      } else {
        this.simulating = false;
        clearInterval(this.id);
        return this.simulation.deselect('step');
      }
    };

    _Class.prototype.draw = function() {
      var cell, col, dllbb, generation_label_label, generation_label_x, generation_unit_label, label_format, label_label_format, population_label_label, population_label_y, population_unit_label, row, tlbb, tllbb, unit_x, x, y, _ref, _ref2;
      this.draw_buttons();
      y = this.y + this.PADDING + this.BUTTON_WIDTH + this.SIM_SEP;
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
      generation_label_label = this.paper.text(this.x + this.PADDING, y, "generatie :");
      generation_label_label.attr(label_label_format);
      tllbb = generation_label_label.getBBox();
      population_label_y = y + tllbb.height + this.LABEL_SEP;
      population_label_label = this.paper.text(this.x + this.PADDING, population_label_y, "populatie :");
      population_label_label.attr(label_label_format);
      dllbb = population_label_label.getBBox();
      this.generation_label = this.paper.text(this.x, y, "88888");
      this.generation_label.attr(label_format);
      tlbb = this.generation_label.getBBox();
      generation_label_x = this.x + this.PADDING + dllbb.width + this.LABEL_SEP + tlbb.width;
      this.generation_label.attr({
        x: generation_label_x
      });
      this.population_label = this.paper.text(generation_label_x, population_label_y, "330000");
      this.population_label.attr(label_format);
      unit_x = generation_label_x + this.LABEL_SEP;
      generation_unit_label = this.paper.text(unit_x, y, "");
      generation_unit_label.attr(label_label_format);
      population_unit_label = this.paper.text(unit_x, population_label_y, "bacteriën");
      population_unit_label.attr(label_label_format);
      this.configuration_view = this.generate_configuration(this.config.width, this.config.height);
      y = dllbb.y2 + this.SIM_SEP;
      x = this.PADDING;
      this.CELL_WIDTH = 10;
      this.CELL_SEP = 0.5;
      for (row = 0, _ref = this.config.height; 0 <= _ref ? row < _ref : row > _ref; 0 <= _ref ? row++ : row--) {
        x = this.PADDING;
        for (col = 0, _ref2 = this.config.width; 0 <= _ref2 ? col < _ref2 : col > _ref2; 0 <= _ref2 ? col++ : col--) {
          cell = this.paper.rect(x, y, this.CELL_WIDTH, this.CELL_WIDTH);
          cell.attr({
            fill: 'white',
            stroke: 'silver'
          });
          this.configuration_view[row][col] = cell;
          x += this.CELL_WIDTH + this.CELL_SEP;
        }
        y += this.CELL_WIDTH + this.CELL_SEP;
      }
      this.width = x - this.x + 2 * this.PADDING;
      return this.update_configuration();
    };

    _Class.prototype.draw_buttons = function() {
      var action, button, buttongroup, group, name, optiongroup, optiongroups, sep, x, y, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5;
      x = this.x + this.PADDING;
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
