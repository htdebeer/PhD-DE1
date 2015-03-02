(function() {

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
