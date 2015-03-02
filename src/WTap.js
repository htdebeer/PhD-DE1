(function() {
  var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.Tap = (function() {

    function _Class(x, y, properties) {
      var _this = this;
      this.x = x;
      this.y = y;
      this.spec = this.initialize_properties(properties);
      this.BUTTON_WIDTH = 26;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      this.BUTTON_SEP = 5;
      this.TIME_LABEL_SEP = 5;
      this.TAB_SEP = 5;
      this.GROUP_SEP = 15;
      CoffeeGrounds.Button.set_base_path(this.spec.icon_path);
      this.actions = {
        start: {
          button: {
            type: 'group',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-skip-backward',
            tooltip: 'Maak het glas leeg',
            on_select: function() {
              return _this.change_mode('start');
            },
            enabled: true,
            "default": true
          }
        },
        pause: {
          button: {
            type: 'group',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-playback-pause',
            tooltip: 'Pauzeer het vullen van het glas',
            on_select: function() {
              return _this.change_mode('pause');
            },
            enabled: true
          }
        },
        play: {
          button: {
            type: 'group',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-playback-start',
            tooltip: 'Vul het glas',
            on_select: function() {
              return _this.change_mode('play');
            },
            enabled: true
          }
        },
        play_fast: {
          button: {
            type: 'group',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-seek-forward',
            tooltip: 'Vul sneller',
            on_select: function() {
              return _this.change_mode('play_fast');
            },
            enabled: true
          }
        },
        end: {
          button: {
            type: 'group',
            option_group: 'simulation',
            group: 'simulation',
            icon: 'media-skip-forward',
            tooltip: 'Vul glas helemaal',
            on_select: function() {
              return _this.change_mode('end');
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
            on_switch_on: function() {},
            on_switch_off: function() {}
          }
        }
      };
      this.mode = 'start';
      this.time = false;
      this.draw();
    }

    _Class.prototype.switch_mode = function(mode) {
      return this.mode = mode;
    };

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2;
      p = {};
      p.buttons = (_ref = properties != null ? properties.buttons : void 0) != null ? _ref : ['start', 'pause', 'play', 'play_fast', 'end', 'time'];
      p.icon_path = (_ref2 = properties != null ? properties.icon_path : void 0) != null ? _ref2 : 'lib/icons';
      return p;
    };

    _Class.prototype.draw = function() {
      return this.draw_buttons;
    };

    _Class.prototype.draw_buttons = function() {
      var action, button, buttongroup, group, name, optiongroup, optiongroups, sep, x, y, _ref, _ref2, _ref3, _ref4, _results;
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
        if (__indexOf.call(this.prop.buttons, name) >= 0) {
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

    return _Class;

  })();

}).call(this);
