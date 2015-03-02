(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
