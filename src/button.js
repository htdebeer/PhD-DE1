(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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

}).call(this);
