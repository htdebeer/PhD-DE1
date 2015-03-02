(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

}).call(this);
