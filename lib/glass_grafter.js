(function() {
  var Glass,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.ContourLine = (function() {

    function _Class(left, top, width, height, mm_per_pixel, record) {
      var FOOTHEIGHT, STEMHEIGHT, STEMWIDTH;
      this.mm_per_pixel = mm_per_pixel;
      this.record = record != null ? record : false;
      this.mid = {
        x: left,
        y: Math.floor(top + height / 2)
      };
      this.min = {
        x: left - width,
        y: top,
        width: 25
      };
      this.max = {
        x: left + width,
        y: top + height
      };
      FOOTHEIGHT = 20;
      STEMWIDTH = 10;
      STEMHEIGHT = 20;
      this.foot = {
        x: Math.floor(this.mid.x + width / 3),
        y: this.max.y,
        border: 'foot',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0
          },
          c2: {
            x: 0,
            y: 0
          }
        }
      };
      this.stem = {
        x: Math.floor(this.mid.x + width / 3),
        y: Math.floor(this.max.y - FOOTHEIGHT),
        border: 'stem',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0
          },
          c2: {
            x: 0,
            y: 0
          }
        }
      };
      this.bowl = {
        x: Math.floor(this.mid.x + width / 3),
        y: Math.floor(this.max.y - (FOOTHEIGHT + STEMHEIGHT)),
        border: 'bowl',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0
          },
          c2: {
            x: 0,
            y: 0
          }
        }
      };
      this.edge = {
        x: Math.floor(this.mid.x + width / 3),
        y: Math.floor(this.max.y - (height / 2)),
        border: 'edge',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          },
          c2: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          }
        }
      };
      this.points = [this.edge, this.bowl, this.stem, this.foot];
    }

    _Class.prototype.get_point = function(p) {
      return this.points[p];
    };

    _Class.prototype.get_point_above_height = function(h) {
      var p;
      p = 0;
      while (p < this.points.length && this.points[p].y < h) {
        p++;
      }
      return p - 1;
    };

    _Class.prototype.can_add_point = function(x, y) {
      var p, point, result;
      result = false;
      p = this.get_point_above_height(y);
      if (p !== -1) {
        point = this.points[p];
        if (point.y === y) {
          result = false;
        } else {
          result = true;
        }
      }
      return result;
    };

    _Class.prototype.can_remove_point = function(p) {
      return this.points[p].border === 'none';
    };

    _Class.prototype.can_move_point = function(p, x, y, r) {
      var result;
      if (r == null) r = 1;
      result = false;
      if ((this.mid.x + r <= x && x <= this.max.x) && (this.min.y <= y && y <= this.max.y)) {
        if ((0 < p && p < this.points.length - 1)) {
          if ((this.points[p - 1].y + r < y && y < this.points[p + 1].y - r)) {
            result = true;
          }
        } else {
          if (p === 0) {
            result = y < this.points[p + 1].y && x >= (this.mid.x + this.min.width);
          } else {
            result = this.points[p - 1].y < y;
          }
        }
      }
      return result;
    };

    _Class.prototype.can_move_control_point = function(p, x, y) {
      var above, below;
      if (p < this.points.length - 1) {
        above = this.points[p];
        below = this.points[p + 1];
        return (this.mid.x <= x && x <= this.max.x) && (above.y <= y && y <= below.y);
      } else {
        return false;
      }
    };

    _Class.prototype.can_move_border = function(border, x, y) {};

    _Class.prototype.find_point_at = function(y, r) {
      var p, _ref;
      if (r == null) r = 1;
      p = 0;
      while (p < this.points.length && !(((y - r) <= (_ref = this.points[p].y) && _ref <= (y + r)))) {
        p++;
      }
      return p = p === this.points.length ? -1 : p;
    };

    _Class.prototype.find_point_near = function(x, y, r) {
      var ar, found, _ref;
      if (r == null) r = 1;
      found = -1;
      ar = 0;
      while (found === -1 && ar < r) {
        found = Math.max(this.find_point_at(y + ar), this.find_point_at(y - ar));
        if (found !== -1 && (x - ar <= (_ref = this.points[found].x) && _ref <= x + ar)) {
          break;
        } else {
          found = -1;
        }
        ar++;
      }
      return found;
    };

    _Class.prototype.add_point = function(x, y, representation) {
      var above, below, head, p, point, tail;
      p = this.get_point_above_height(y);
      head = [];
      if (!(p < 0)) head = this.points.slice(0, p + 1 || 9e9);
      tail = this.points.slice(p + 1);
      above = this.points[p];
      below = this.points[p + 1];
      point = {
        x: x,
        y: y,
        border: 'none',
        segment: {
          type: 'straight',
          c1: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          },
          c2: {
            x: 0,
            y: 0,
            line: null,
            representation: null
          }
        },
        representation: representation
      };
      above.segment.c2.y = y - Math.abs(above.segment.c2.y - below.y);
      this.points = head.concat(point, tail);
      return point;
    };

    _Class.prototype.remove_point = function(p) {
      var head, tail;
      head = this.points.slice(0, p);
      tail = p === this.points.length - 1 ? [] : this.points.slice(p + 1);
      return this.points = head.concat(tail);
    };

    _Class.prototype.move_point = function(p, x, y) {
      this.points[p].x = x;
      this.points[p].y = y;
      if (this.points[p].segment.type === 'curve') this.set_control_points(p);
      if (p !== 0 && this.points[p - 1].segment.type === 'curve') {
        return this.set_control_points(p - 1);
      }
    };

    _Class.prototype.set_control_points = function(p) {
      var above, below, dxc1, dxc2, dy;
      if (p !== this.points.length - 1) {
        above = this.points[p];
        below = this.points[p + 1];
        dxc1 = Math.abs(this.mid.x - above.x) / 2;
        dxc2 = Math.abs(this.mid.x - below.x) / 2;
        dy = Math.abs(above.y - below.y) / 4;
        above.segment.c1.x = above.x - dxc1;
        above.segment.c1.y = above.y + dy;
        above.segment.c2.x = below.x - dxc2;
        return above.segment.c2.y = below.y - dy;
      }
    };

    _Class.prototype.make_curve = function(p) {
      var point_segment;
      point_segment = this.points[p].segment;
      point_segment.type = 'curve';
      return this.set_control_points(p);
    };

    _Class.prototype.make_straight = function(p) {
      this.points[p].segment.type = 'straight';
      this.points[p].segment.c1.representation.remove();
      this.points[p].segment.c1.line.remove();
      this.points[p].segment.c2.line.remove();
      this.points[p].segment.c2.representation.remove();
      this.points[p].segment.c1.representation = null;
      this.points[p].segment.c1.line = null;
      this.points[p].segment.c2.line = null;
      return this.points[p].segment.c2.representation = null;
    };

    _Class.prototype.move_control_point = function(p, cp, x, y) {
      var point;
      if (cp === 1) {
        point = this.points[p].segment.c1;
      } else {
        point = this.points[p].segment.c2;
      }
      point.x = x;
      return point.y = y;
    };

    _Class.prototype.move_border = function(border, x, y) {};

    _Class.prototype.to_path = function() {
      var i, p, path, q;
      p = this.points[0];
      path = "M" + p.x + "," + p.y;
      i = 0;
      while (i < this.points.length - 1) {
        p = this.points[i];
        q = this.points[i + 1];
        switch (p.segment.type) {
          case 'straight':
            path += "L" + q.x + "," + q.y;
            break;
          case 'curve':
            path += "C" + p.segment.c1.x + "," + p.segment.c1.y + "," + p.segment.c2.x + "," + p.segment.c2.y + "," + q.x + "," + q.y;
        }
        i++;
      }
      return path;
    };

    _Class.prototype.to_glass_path = function(part) {
      var i, mid, mirror, p, path, q;
      if (part == null) part = 'full';
      i = 0;
      switch (part) {
        case 'full':
          i = 0;
          break;
        case 'base':
          while (this.points[i].border !== 'bowl') {
            i++;
          }
      }
      p = this.points[i];
      path = "M" + p.x + "," + p.y;
      while (i < this.points.length - 1) {
        p = this.points[i];
        q = this.points[i + 1];
        switch (p.segment.type) {
          case 'straight':
            path += "L" + q.x + "," + q.y;
            break;
          case 'curve':
            path += "C" + p.segment.c1.x + "," + p.segment.c1.y + "," + p.segment.c2.x + "," + p.segment.c2.y + "," + q.x + "," + q.y;
        }
        i++;
      }
      mid = this.mid;
      mirror = function(x) {
        return x - 2 * (x - mid.x);
      };
      p = this.points[i];
      path += "H" + (mirror(p.x));
      while (i > 0) {
        p = this.points[i];
        q = this.points[i - 1];
        if (part === 'base' && p.border === 'bowl') {
          path += "H" + p.x + "H" + (mirror(p.x));
          break;
        }
        switch (q.segment.type) {
          case 'straight':
            path += "L" + (mirror(q.x)) + "," + q.y;
            break;
          case 'curve':
            path += "C" + (mirror(q.segment.c2.x)) + "," + q.segment.c2.y + "," + (mirror(q.segment.c1.x)) + "," + q.segment.c1.y + "," + (mirror(q.x)) + "," + q.y;
        }
        i--;
      }
      return path;
    };

    _Class.prototype.to_glass = function(spec) {
      var glass, height_in_mm, midbowl, midedge, midfoot, midstem, path;
      height_in_mm = Math.floor((this.foot.y - this.edge.y) * this.mm_per_pixel);
      path = this.to_relative_path();
      midfoot = {
        x: this.mid.x,
        y: this.foot.y
      };
      midstem = {
        x: this.mid.x,
        y: this.stem.y
      };
      midbowl = {
        x: this.mid.x,
        y: this.bowl.y
      };
      midedge = {
        x: this.mid.x,
        y: this.edge.y
      };
      glass = new Glass(path, midfoot, midstem, midbowl, midedge, height_in_mm, spec);
      return glass;
    };

    _Class.prototype.from_glass = function(glass) {
      var factor, mm_per_pixel;
      mm_per_pixel = glass.height_in_mm / (glass.foot.y - glass.edge.y);
      return factor = this.mm_per_pixel / mm_per_pixel;
    };

    _Class.prototype.to_relative_path = function() {
      var elt, path, relpath, relsegs, seg, _i, _j, _len, _len2;
      path = this.to_path();
      relsegs = Raphael.pathToRelative(path);
      relpath = "";
      for (_i = 0, _len = relsegs.length; _i < _len; _i++) {
        seg = relsegs[_i];
        for (_j = 0, _len2 = seg.length; _j < _len2; _j++) {
          elt = seg[_j];
          relpath += "" + elt + " ";
        }
      }
      return relpath.replace(/\s$/, '');
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

  /*
  glass.coffee version 0.1
  
  Modeling different glasses
  
  (c) 2012 Huub de Beer Huub@heerdebeer.org
  
  Long description
  */

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

  window.GlassGrafter = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2;
      p = {};
      p.buttons = (_ref = properties != null ? properties.buttons : void 0) != null ? _ref : ['normal', 'add_point', 'remove_point', 'straight', 'curve'];
      p.icon_path = (_ref2 = properties != null ? properties.icon_path : void 0) != null ? _ref2 : 'lib/icons';
      return p;
    };

    function _Class(paper, x, y, width, height, mm_per_pixel, properties) {
      var _this = this;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.control_point_start = __bind(this.control_point_start, this);
      this.remove_point = __bind(this.remove_point, this);
      this.add_point = __bind(this.add_point, this);
      this.mousemove = __bind(this.mousemove, this);
      this.mouseout = __bind(this.mouseout, this);
      this.mouseover = __bind(this.mouseover, this);
      this.spec = this.initialize_properties(properties);
      this.PADDING = 3;
      this.POINT_WIDTH = 3;
      this.BUTTON_WIDTH = 32;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      CoffeeGrounds.Button.set_base_path(this.spec.icon_path);
      this.AXIS_WIDTH = 40;
      this.BUTTON_SEP = 5;
      this.GROUP_SEP = 15;
      this.CANVAS_SEP = 10;
      this.CANVAS_TOP = this.y + this.PADDING + this.BUTTON_WIDTH + this.CANVAS_SEP;
      this.CANVAS_LEFT = this.x + this.PADDING;
      this.CANVAS_HEIGHT = this.height - this.PADDING * 2 - this.BUTTON_WIDTH - this.CANVAS_SEP - this.AXIS_WIDTH;
      this.CANVAS_WIDTH = this.width - this.PADDING * 2 - this.AXIS_WIDTH;
      this.CANVAS_BOTTOM = this.CANVAS_TOP + this.CANVAS_HEIGHT;
      this.CANVAS_RIGHT = this.CANVAS_LEFT + this.CANVAS_WIDTH;
      this.CANVAS_MID = this.CANVAS_LEFT + this.CANVAS_WIDTH / 2;
      this.BORDER_WIDTH = this.CANVAS_WIDTH / 2;
      if (mm_per_pixel !== 0) this.PIXELS_PER_MM = 1 / mm_per_pixel;
      this.contour = new CoffeeGrounds.ContourLine(this.CANVAS_MID, this.CANVAS_TOP, this.BORDER_WIDTH, this.CANVAS_HEIGHT, mm_per_pixel);
      this.actions = {
        normal: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'select',
            icon: 'edit-select',
            tooltip: 'Versleep witte en blauwe punten',
            on_select: function() {
              return _this.change_mode('normal');
            },
            enabled: true,
            "default": true
          },
          cursor: 'default'
        },
        add_point: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit-point',
            icon: 'format-add-node',
            tooltip: 'Voeg een extra punt toe aan de lijn',
            on_select: function() {
              return _this.change_mode('add_point');
            },
            enabled: true
          },
          cursor: 'crosshair'
        },
        remove_point: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit-point',
            icon: 'format-remove-node',
            tooltip: 'Verwijder het rood oplichtende extra punt',
            on_select: function() {
              return _this.change_mode('remove_point');
            },
            enabled: true
          },
          cursor: 'default'
        },
        straight: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit-line',
            icon: 'straight-line',
            tooltip: 'Maak van de kromme lijn onder de cursor een rechte lijn',
            on_select: function() {
              return _this.change_mode('straight');
            }
          },
          cursor: 'default'
        },
        curve: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit-line',
            icon: 'draw-bezier-curves',
            tooltip: 'Maak van de rechte lijn onder de cursor een kromme lijn',
            on_select: function() {
              return _this.change_mode('curve');
            }
          },
          cursor: 'default'
        },
        realistic: {
          button: {
            type: 'action',
            icon: 'games-hint',
            group: 'view',
            tooltip: 'Bekijk het glas er in 3D uitziet',
            action: function() {}
          }
        },
        export_png: {
          button: {
            type: 'action',
            icon: 'image-x-generic',
            group: 'export',
            tooltip: 'Download het glas als een PNG afbeelding',
            action: function() {}
          }
        },
        export_svg: {
          button: {
            type: 'action',
            icon: 'image-svg+xml',
            group: 'export',
            tooltip: 'Download het glas als een SVG afbeelding',
            action: function() {}
          }
        }
      };
      this.draw();
      this.init();
    }

    _Class.prototype.init = function() {
      this.mode = 'normal';
      this.click = '';
      this.points_draggable = false;
      this.cp_points_draggable = false;
      this.make_draggable();
      this.canvas.mouseover(this.mouseover);
      return this.canvas.mouseout(this.mouseout);
    };

    _Class.prototype.set_contour = function(contour) {
      this.contour.from_glass(contour.to_glass());
      this.draw();
      return this.init();
    };

    _Class.prototype.get_contour = function() {
      return this.contour;
    };

    _Class.prototype.mouseover = function(e, x, y) {
      return this.canvas.mousemove(this.mousemove);
    };

    _Class.prototype.mouseout = function(e, x, y) {
      return this.canvas.unmousemove(this.mousemove);
    };

    _Class.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: Math.floor(x - this.paper.canvas.parentNode.offsetLeft),
        y: Math.floor(y - this.paper.canvas.parentNode.offsetTop)
      };
      return point;
    };

    _Class.prototype.reset_mouse = function() {
      this.click = '';
      this.canvas.unclick(this.add_point);
      this.canvas.unclick(this.remove_point);
      this.canvas.unclick(this.line_changer);
      this.potential_point.hide();
      this.potential_above.hide();
      this.potential_below.hide();
      this.remove_point_point.hide();
      this.remove_point_line.hide();
      return this.change_line_area.hide();
    };

    _Class.prototype.mousemove = function(e, x, y) {
      var above, below, p, point, q;
      p = this.fit_point(x, y);
      this.canvas.attr({
        cursor: this.actions[this.mode].cursor
      });
      switch (this.mode) {
        case 'normal':
          return 1 === 1;
        case 'add_point':
          if (this.contour.can_add_point(p.x, p.y)) {
            above = this.contour.get_point_above_height(p.y);
            below = above + 1;
            above = this.contour.get_point(above);
            below = this.contour.get_point(below);
            if (this.click !== this.mode) {
              this.canvas.click(this.add_point);
              this.click = this.mode;
            }
            this.potential_above.attr({
              path: "M" + above.x + "," + above.y + "L" + p.x + "," + (p.y - 2)
            });
            this.potential_above.show();
            this.potential_below.attr({
              path: "M" + below.x + "," + below.y + "L" + p.x + "," + (p.y + 2)
            });
            return this.potential_below.show();
          } else {
            this.potential_point.hide();
            this.potential_above.hide();
            this.potential_below.hide();
            return this.canvas.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'remove_point':
          q = this.contour.find_point_near(p.x, p.y, this.POINT_WIDTH * 5);
          if (q !== -1 && this.contour.can_remove_point(q)) {
            if (this.click !== this.mode) {
              this.canvas.click(this.remove_point);
              this.click = this.mode;
            }
            point = this.contour.get_point(q);
            above = q - 1;
            below = q + 1;
            above = this.contour.get_point(above);
            below = this.contour.get_point(below);
            this.remove_point_point.attr({
              cx: point.x,
              cy: point.y
            });
            this.remove_point_point.show();
            this.remove_point_line.attr({
              path: "M" + above.x + "," + above.y + "L" + below.x + "," + below.y
            });
            return this.remove_point_line.show();
          } else {
            this.reset_mouse();
            return this.canvas.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'straight':
          q = this.contour.get_point_above_height(p.y);
          if (q !== -1) {
            point = this.contour.get_point(q);
            below = this.contour.get_point(q + 1);
            if (point.segment.type !== 'straight') {
              if (this.click !== this.mode) {
                this.canvas.click(this.change_line(this, 'straight'));
                this.click = this.mode;
              }
              this.change_line_area.attr({
                y: point.y,
                height: below.y - point.y
              });
              return this.change_line_area.show();
            } else {
              this.change_line_area.hide();
              return this.canvas.attr({
                cursor: 'not-allowed'
              });
            }
          } else {
            this.change_line_area.hide();
            return this.canvas.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'curve':
          q = this.contour.get_point_above_height(p.y);
          if (q !== -1) {
            point = this.contour.get_point(q);
            below = this.contour.get_point(q + 1);
            if (point.segment.type !== 'curve') {
              if (this.click !== this.mode) {
                this.canvas.click(this.change_line(this, 'curve'));
                this.click = this.mode;
              }
              this.change_line_area.attr({
                y: point.y,
                height: below.y - point.y
              });
              return this.change_line_area.show();
            } else {
              this.change_line_area.hide();
              return this.canvas.attr({
                cursor: 'not-allowed'
              });
            }
          } else {
            this.change_line_area.hide();
            return this.canvas.attr({
              cursor: 'not-allowed'
            });
          }
      }
    };

    _Class.prototype.add_point = function(e, x, y) {
      var p, point, q;
      p = this.fit_point(x, y);
      point = this.paper.circle(p.x, p.y, this.POINT_WIDTH);
      point.attr({
        fill: 'black'
      });
      q = this.contour.add_point(p.x, p.y, point);
      point.drag(this.move_point(this, q), this.move_point_start, this.move_point_end(this, q));
      return this.draw_glass();
    };

    _Class.prototype.make_draggable = function() {
      var point, _i, _len, _ref, _ref2;
      this.points_draggable = (_ref = this.points_draggable) != null ? _ref : false;
      if (!this.points_draggable) {
        _ref2 = this.contour.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          point.representation.drag(this.move_point(this, point), this.move_point_start(point), this.move_point_end(this, point));
          if (point.border === 'none') {
            point.representation.attr({
              fill: 'blue',
              stroke: 'blue',
              r: this.POINT_WIDTH * 2,
              'fill-opacity': 0.3
            });
          }
        }
        return this.points_draggable = true;
      }
    };

    _Class.prototype.move_point = function(grafter, point) {
      var _this = this;
      return function(dx, dy, x, y, e) {
        var newp, p, tx, ty;
        tx = Math.floor(dx - grafter.dpo.x);
        ty = Math.floor(dy - grafter.dpo.y);
        p = grafter.contour.find_point_at(point.y);
        if (point.border === 'foot') {
          newp = {
            x: point.x + tx,
            y: point.y
          };
        } else {
          newp = {
            x: point.x + tx,
            y: point.y + ty
          };
        }
        if (p !== -1 && grafter.contour.can_move_point(p, newp.x, newp.y)) {
          grafter.contour.move_point(p, newp.x, newp.y);
          grafter.dpo = {
            x: dx,
            y: dy
          };
          point.representation.attr({
            cx: point.x,
            cy: point.y
          });
          switch (point.border) {
            case 'edge':
              _this.edge.attr({
                path: "M" + _this.CANVAS_MID + "," + point.y + "h" + (_this.CANVAS_WIDTH / 2)
              });
              break;
            case 'bowl':
              _this.bowl.attr({
                path: "M" + _this.CANVAS_MID + "," + point.y + "h" + (_this.CANVAS_WIDTH / 2)
              });
              break;
            case 'stem':
              _this.stem.attr({
                path: "M" + _this.CANVAS_MID + "," + point.y + "h" + (_this.CANVAS_WIDTH / 2)
              });
          }
          return _this.draw_glass();
        } else {

        }
      };
    };

    _Class.prototype.move_point_start = function(point) {
      var _this = this;
      return function(x, y, e) {
        var _ref;
        if (point.border !== 'none') {
          point.representation.attr({
            fill: 'blue'
          });
        }
        _this.dpo = (_ref = _this.dpo) != null ? _ref : {};
        return _this.dpo = {
          x: 0,
          y: 0
        };
      };
    };

    _Class.prototype.move_point_end = function(grafter, point) {
      var _this = this;
      return function(x, y, e) {
        if (point.border !== 'none') {
          point.representation.attr({
            fill: 'white',
            'fill-opacity': 1
          });
        }
        grafter.draw_glass();
        return point.representation.toFront();
      };
    };

    _Class.prototype.make_undraggable = function() {
      var point, _i, _len, _ref, _ref2;
      this.points_draggable = (_ref = this.points_draggable) != null ? _ref : false;
      if (this.points_draggable) {
        _ref2 = this.contour.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          point.representation.undrag();
          if (point.border === 'none') {
            point.representation.attr({
              fill: 'black',
              stroke: 'black',
              r: this.POINT_WIDTH,
              'fill-opacity': 1
            });
          }
        }
        return this.points_draggable = false;
      }
    };

    _Class.prototype.remove_point = function(e, x, y) {
      var p, q, r;
      p = this.fit_point(x, y);
      q = this.contour.find_point_near(p.x, p.y, this.POINT_WIDTH * 5);
      if (q !== -1 && this.contour.can_remove_point(q)) {
        r = this.contour.get_point(q);
        r.representation.remove();
        this.contour.remove_point(q);
        this.draw_glass();
        this.remove_point_point.hide();
        return this.remove_point_line.hide();
      }
    };

    _Class.prototype.change_line = function(grafter, kind) {
      var _this = this;
      grafter.canvas.unclick(grafter.line_changer);
      grafter.line_changer = null;
      grafter.line_changer = function(e, x, y) {
        var below, c1, c2, cbottom, clbottom, cltop, ctop, p, point, q;
        p = _this.fit_point(x, y);
        q = _this.contour.get_point_above_height(p.y);
        if (kind === 'curve') {
          if (q !== -1 && q !== (_this.contour.points.length - 1)) {
            grafter.contour.make_curve(q);
            point = grafter.contour.get_point(q);
            below = grafter.contour.get_point(q + 1);
            c1 = point.segment.c1;
            c2 = point.segment.c2;
            if (!((c1 != null ? c1.representation : void 0) != null)) {
              c1.representation = _this.paper.circle(c1.x, c1.y, _this.POINT_WIDTH * 2);
              c1.line = _this.paper.path("M" + point.x + "," + point.y + "L" + c1.x + "," + c1.y);
            }
            ctop = c1.representation;
            ctop.attr({
              cx: c1.x,
              cy: c1.y,
              fill: 'orange',
              stroke: 'orange',
              'fill-opacity': 0.3
            });
            cltop = c1.line;
            cltop.attr({
              path: "M" + point.x + "," + point.y + "L" + c1.x + "," + c1.y,
              stroke: 'orange',
              'stroke-dasharray': '.'
            });
            ctop.drag(_this.move_control_point(_this, point, ctop, cltop, 1), _this.control_point_start, _this.control_point_end(_this, point, ctop));
            if (!((c2 != null ? c2.representation : void 0) != null)) {
              c2.representation = _this.paper.circle(c2.x, c2.y, _this.POINT_WIDTH * 2);
              c2.line = _this.paper.path("M" + below.x + "," + below.y + "L" + c2.x + "," + c2.y);
            }
            cbottom = c2.representation;
            cbottom.attr({
              cx: c2.x,
              cy: c2.y,
              fill: 'orange',
              stroke: 'orange',
              'fill-opacity': 0.3
            });
            clbottom = c2.line;
            clbottom.attr({
              path: "M" + below.x + "," + below.y + "L" + c2.x + "," + c2.y,
              stroke: 'orange',
              'stroke-dasharray': '.'
            });
            cbottom.drag(_this.move_control_point(_this, point, cbottom, clbottom, 2), _this.control_point_start, _this.control_point_end(_this, c1, cbottom));
            return grafter.draw_glass();
          }
        } else {
          if (q !== -1) {
            grafter.contour.make_straight(q);
            return grafter.draw_glass();
          }
        }
      };
      return grafter.line_changer;
    };

    _Class.prototype.move_control_point = function(grafter, point, representation, line, cp) {
      var _this = this;
      return function(dx, dy, x, y, e) {
        var below, newp, p, start, tx, ty;
        tx = dx - grafter.dpo.x;
        ty = dy - grafter.dpo.y;
        p = grafter.contour.find_point_at(point.y);
        below = grafter.contour.get_point(p + 1);
        newp = {
          x: representation.attr('cx') + tx,
          y: representation.attr('cy') + ty
        };
        if (grafter.contour.can_move_control_point(p, newp.x, newp.y)) {
          grafter.contour.move_control_point(p, cp, newp.x, newp.y);
          representation.attr({
            cx: newp.x,
            cy: newp.y
          });
          start = cp === 1 ? point : below;
          line.attr({
            path: "M" + start.x + "," + start.y + "L" + newp.x + "," + newp.y
          });
          grafter.dpo = {
            x: dx,
            y: dy
          };
          return grafter.draw_glass();
        }
      };
    };

    _Class.prototype.control_point_start = function() {
      var _ref;
      this.dpo = (_ref = this.dpo) != null ? _ref : {};
      return this.dpo = {
        x: 0,
        y: 0
      };
    };

    _Class.prototype.control_point_end = function(grafter, above, representation) {
      var _this = this;
      return function(x, y, e) {
        return grafter.draw_glass();
      };
    };

    _Class.prototype.draw_glass = function() {
      var place_label;
      this.glass_base.attr({
        path: this.contour.to_glass_path('base')
      });
      this.glass_bowl.attr({
        path: this.contour.to_glass_path()
      });
      this.glass_contour.attr({
        path: this.contour.to_path()
      });
      place_label = function(label, above, below) {
        var bb, bowlheight, rest;
        bb = label.getBBox();
        bowlheight = below.y - above.y;
        if (bowlheight > bb.height) {
          rest = bowlheight - bb.height;
          label.attr({
            y: above.y + rest / 2 + bb.height / 2
          });
          return label.show();
        } else {
          return label.hide();
        }
      };
      place_label(this.bowl_label, this.contour.edge, this.contour.bowl);
      place_label(this.stem_label, this.contour.bowl, this.contour.stem);
      return place_label(this.foot_label, this.contour.stem, this.contour.foot);
    };

    _Class.prototype.change_mode = function(mode) {
      var _ref;
      this.reset_mouse();
      this.make_undraggable();
      this.mode = (_ref = this.mode) != null ? _ref : {};
      this.mode = mode;
      if (this.mode === 'normal') {
        this.make_draggable();
      } else {
        this.make_undraggable();
      }
      if (this.mode === 'curve') {
        return this.make_cp_draggable();
      } else {
        return this.make_cp_undraggable();
      }
    };

    _Class.prototype.make_cp_draggable = function() {
      var next_point, point, s, _i, _len, _ref, _ref2;
      this.cp_points_draggable = (_ref = this.cp_points_draggable) != null ? _ref : false;
      if (!this.cp_points_draggable) {
        _ref2 = this.contour.points;
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
            next_point = this.contour.get_point(this.contour.find_point_at(point.y) + 1);
            point.segment.c2.line.attr({
              path: "M" + next_point.x + "," + next_point.y + "L" + point.segment.c2.x + "," + point.segment.c2.y
            });
            point.segment.c2.line.show();
          }
        }
        return this.cp_points_draggable = true;
      }
    };

    _Class.prototype.make_cp_undraggable = function() {
      var point, s, _i, _len, _ref, _ref2;
      this.cp_points_draggable = (_ref = this.cp_points_draggable) != null ? _ref : false;
      if (this.cp_points_draggable) {
        _ref2 = this.contour.points;
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

    _Class.prototype.draw = function() {
      var mid_line;
      this.elements = this.paper.set();
      this.foot_label = this.paper.text(this.CANVAS_MID + this.CANVAS_WIDTH / 4, 0, "voet");
      this.foot_label.attr({
        'font-family': 'sans-serif',
        'font-size': '14pt',
        'fill': 'silver'
      });
      this.stem_label = this.paper.text(this.CANVAS_MID + this.CANVAS_WIDTH / 4, 0, "steel");
      this.stem_label.attr({
        'font-family': 'sans-serif',
        'font-size': '14pt',
        'fill': 'silver'
      });
      this.bowl_label = this.paper.text(this.CANVAS_MID + this.CANVAS_WIDTH / 4, 0, "kelk");
      this.bowl_label.attr({
        'font-family': 'sans-serif',
        'font-size': '14pt',
        'fill': 'silver'
      });
      this.glass_base = this.paper.path(this.contour.to_glass_path('base'));
      this.glass_base.attr({
        fill: 'black',
        'fill-opacity': 0.3,
        stroke: 'gray',
        'stroke-width': 2,
        'stroke-dasharray': ''
      });
      this.glass_bowl = this.paper.path(this.contour.to_glass_path());
      this.glass_bowl.attr({
        stroke: 'black',
        'stroke-width': 2,
        'stroke-dasharray': ''
      });
      this.draw_axis('radius');
      this.draw_axis('height');
      this.potential_point = this.paper.circle(0, 0, this.POINT_WIDTH * 2);
      this.potential_point.attr({
        fill: 'green',
        opacity: 0.5
      });
      this.potential_point.hide();
      this.potential_above = this.paper.path("M0,0");
      this.potential_above.attr({
        stroke: 'green',
        opacity: 0.5,
        'stroke-dasharray': '-'
      });
      this.potential_above.hide();
      this.potential_below = this.paper.path("M0,0");
      this.potential_below.attr({
        stroke: 'green',
        opacity: 0.5,
        'stroke-dasharray': '-'
      });
      this.potential_below.hide();
      this.remove_point_point = this.paper.circle(0, 0, this.POINT_WIDTH * 4);
      this.remove_point_point.attr({
        fill: 'red',
        stroke: 'red',
        opacity: 0.5
      });
      this.remove_point_point.hide();
      this.remove_point_line = this.paper.path("M0,0");
      this.remove_point_line.attr({
        stroke: 'red',
        opacity: 0.5,
        'stroke-dasharray': '-'
      });
      this.remove_point_line.hide();
      this.change_line_area = this.paper.rect(this.CANVAS_MID, this.CANVAS_BOTTOM, this.CANVAS_WIDTH / 2, 0);
      this.change_line_area.attr({
        fill: 'orange',
        opacity: 0.5
      });
      this.change_line_area.hide();
      this.glass_contour = this.paper.path(this.contour.to_path());
      this.glass_contour.attr({
        stroke: 'DarkGreen',
        'stroke-width': 3
      });
      this.canvas = this.paper.rect(this.CANVAS_MID, this.CANVAS_TOP, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT);
      this.canvas.attr({
        fill: 'white',
        'fill-opacity': 0,
        stroke: 'white',
        'stroke-width': 0
      });
      mid_line = this.paper.path("M" + this.CANVAS_MID + "," + this.CANVAS_TOP + "v" + this.CANVAS_HEIGHT);
      mid_line.attr({
        stroke: 'Indigo',
        'stroke-width': 2,
        'stroke-dasharray': '-.'
      });
      this.glass_contour.hide();
      this.draw_buttons();
      this.foot = this.draw_border(this.contour.foot, '');
      this.foot.attr({
        stroke: 'black'
      });
      this.stem = this.draw_border(this.contour.stem);
      this.bowl = this.draw_border(this.contour.bowl);
      this.edge = this.draw_border(this.contour.edge);
      this.foot_point = this.draw_point(this.contour.foot);
      this.contour.foot.representation = this.foot_point;
      this.stem_point = this.draw_point(this.contour.stem);
      this.contour.stem.representation = this.stem_point;
      this.bowl_point = this.draw_point(this.contour.bowl);
      this.contour.bowl.representation = this.bowl_point;
      this.edge_point = this.draw_point(this.contour.edge);
      this.contour.edge.representation = this.edge_point;
      return this.draw_glass();
    };

    _Class.prototype.draw_point = function(p) {
      var point;
      if (p.border !== 'none') {
        point = this.paper.circle(p.x, p.y, this.POINT_WIDTH * 2);
        point.attr({
          fill: 'white',
          stroke: 'black',
          'stroke-width': 2
        });
      } else {
        point = this.paper.circle(p.x, p.y, this.POINT_WIDTH);
        point.attr({
          fill: 'black',
          stroke: 'black',
          'stroke-width': this.POINT_WIDTH,
          'stroke-opacity': 0
        });
      }
      p.representation = point;
      return point;
    };

    _Class.prototype.draw_border = function(border, dashing) {
      var border_line;
      if (dashing == null) dashing = '. ';
      border_line = this.paper.path("M" + this.CANVAS_MID + "," + border.y + "h" + this.BORDER_WIDTH);
      border_line.attr({
        stroke: 'Indigo',
        'stroke-dasharray': dashing,
        'stroke-width': 0.5
      });
      return border_line;
    };

    _Class.prototype.draw_buttons = function() {
      var action, button, buttongroup, group, name, optiongroup, optiongroups, sep, x, y, _ref, _ref2, _ref3, _ref4, _results;
      x = this.CANVAS_MID;
      y = this.CANVAS_TOP - this.CANVAS_SEP - this.BUTTON_WIDTH;
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

    _Class.prototype.draw_axis = function(axis) {
      var AXISLABELSEP, HALFTICKSLENGTH, LABELSEP, TICKSLENGTH, albb, axis_label, axis_line, end, i, label, label_text, ltbb, movement, path, step, x, y;
      TICKSLENGTH = 10;
      HALFTICKSLENGTH = TICKSLENGTH / 2;
      LABELSEP = 5;
      AXISLABELSEP = 30;
      path = '';
      step = 5 * this.PIXELS_PER_MM;
      label = 0;
      i = 0;
      if (axis === 'radius') {
        movement = 'v';
        x = this.CANVAS_MID;
        end = this.CANVAS_MID + this.BORDER_WIDTH;
        while (x <= end) {
          path += "M" + x + "," + this.CANVAS_BOTTOM;
          if ((i % 10) === 0) {
            path += "" + movement + TICKSLENGTH;
            label_text = this.paper.text(x, 0, label);
            label_text.attr({
              'font-family': 'sans-serif',
              'font-size': '12pt'
            });
            ltbb = label_text.getBBox();
            label_text.attr({
              y: this.CANVAS_BOTTOM + LABELSEP + ltbb.height
            });
            label += 1;
          } else {
            path += "" + movement + HALFTICKSLENGTH;
          }
          x += step;
          i += 5;
        }
        axis_label = this.paper.text(0, 0, 'straal (cm)');
        axis_label.attr({
          'font-family': 'sans-serif',
          'font-size': '14pt',
          'text-anchor': 'start'
        });
        albb = axis_label.getBBox();
        axis_label.attr({
          x: this.CANVAS_RIGHT - albb.width,
          y: this.CANVAS_BOTTOM + LABELSEP + albb.height + TICKSLENGTH + LABELSEP
        });
        axis_line = this.paper.path("M" + this.CANVAS_MID + "," + this.CANVAS_BOTTOM + "h" + (this.CANVAS_WIDTH / 2));
        axis_line.attr({
          stroke: 'black',
          'stroke-width': 2
        });
      } else {
        movement = 'h';
        y = this.CANVAS_BOTTOM;
        end = this.CANVAS_TOP;
        while (y >= end) {
          path += "M" + this.CANVAS_RIGHT + "," + y;
          if ((i % 10) === 0) {
            path += "" + movement + TICKSLENGTH;
            label_text = this.paper.text(0, y, 99);
            label_text.attr({
              'font-family': 'sans-serif',
              'font-size': '12pt'
            });
            ltbb = label_text.getBBox();
            label_text.attr({
              x: this.CANVAS_RIGHT + LABELSEP + TICKSLENGTH + ltbb.width,
              'text-anchor': 'end',
              text: label
            });
            label += 1;
          } else {
            path += "" + movement + HALFTICKSLENGTH;
          }
          y -= step;
          i += 5;
        }
        axis_label = this.paper.text(0, 0, 'hoogte (cm)');
        axis_label.attr({
          'font-family': 'sans-serif',
          'font-size': '14pt',
          'text-anchor': 'start'
        });
        albb = axis_label.getBBox();
        axis_label.attr({
          x: this.CANVAS_RIGHT - albb.width,
          y: this.CANVAS_BOTTOM + LABELSEP + albb.height + TICKSLENGTH + LABELSEP
        });
        axis_label.transform("r-90," + this.CANVAS_RIGHT + "," + this.CANVAS_BOTTOM + "t" + this.CANVAS_HEIGHT + "," + LABELSEP);
        axis_line = this.paper.path("M" + this.CANVAS_RIGHT + "," + this.CANVAS_BOTTOM + "v-" + this.CANVAS_HEIGHT);
        axis_line.attr({
          stroke: 'black',
          'stroke-width': 2
        });
      }
      axis = this.paper.path(path);
      axis.attr({
        stroke: 'black',
        'stroke-width': 2
      });
      return axis;
    };

    return _Class;

  })();

}).call(this);
