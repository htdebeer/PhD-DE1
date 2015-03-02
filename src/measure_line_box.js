(function() {

  window.CoffeeGrounds = typeof CoffeeGrounds !== "undefined" && CoffeeGrounds !== null ? CoffeeGrounds : {};

  CoffeeGrounds.MeasureLineBox = (function() {

    _Class.prototype.to_json = function() {
      var export_object, ml, vol, _len, _ref;
      export_object = {
        measure_lines: []
      };
      _ref = this.glas.measure_lines;
      for (vol = 0, _len = _ref.length; vol < _len; vol++) {
        ml = _ref[vol];
        export_object.measure_lines[vol] = ml.to_json();
      }
      return JSON.stringify(export_object);
    };

    function _Class(paper, x, y, width, glass, foot, properties) {
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.glass = glass;
      this.foot = foot;
      if (properties == null) properties = {};
      this.spec = this.initialize_properties(properties);
      this.PADDING = 5;
      this.HEIGHT = 100;
      this.ML_SEP = 10;
      this.ML_WIDTH = 50;
      this.ML_HEIGHT = 15;
      this.WIDTH = 3 * this.ML_WIDTH;
      this.draw();
    }

    _Class.prototype.initialize_properties = function(p) {
      var q, _ref, _ref2, _ref3, _ref4;
      q = {};
      q.rows = (_ref = p != null ? p.rows : void 0) != null ? _ref : 2;
      q.bend = (_ref2 = p != null ? p.bend : void 0) != null ? _ref2 : false;
      q.lines = (_ref3 = p != null ? p.lines : void 0) != null ? _ref3 : this.generate_lines();
      q.editable = (_ref4 = p != null ? p.editable : void 0) != null ? _ref4 : true;
      return q;
    };

    _Class.prototype.generate_lines = function() {
      var NICE_ROUND_NUMBERS, fourth, h, higher, i, lines, lower, step;
      NICE_ROUND_NUMBERS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
      lines = [];
      fourth = this.glass.maximum_volume / 4;
      i = 0;
      while (i < NICE_ROUND_NUMBERS.length && NICE_ROUND_NUMBERS[i] <= fourth) {
        i++;
      }
      if (i < NICE_ROUND_NUMBERS.length) {
        lower = NICE_ROUND_NUMBERS[i - 1];
        higher = NICE_ROUND_NUMBERS[i];
        if (Math.abs(lower - fourth) <= Math.abs(higher - fourth)) {
          step = lower;
        } else {
          step = higher;
        }
      } else {
        step = NICE_ROUND_NUMBERS[NICE_ROUND_NUMBERS.length - 1];
      }
      h = step;
      while (h <= (this.glass.maximum_volume - step)) {
        lines.push(h);
        h += step;
      }
      return lines;
    };

    _Class.prototype.show = function() {
      return this.elements.show();
    };

    _Class.prototype.hide = function() {
      return this.elements.hide();
    };

    _Class.prototype.draw = function() {
      var ml, mml, model, rml, tbb, vol, x, y, _i, _len, _ref, _ref2, _results, _results2;
      this.elements = this.paper.set();
      this.box = this.paper.rect(this.x, this.y, this.WIDTH, this.HEIGHT);
      this.box.attr({
        stroke: 'black',
        'stroke-width': 2
      });
      this.title = this.paper.text(this.x + this.PADDING, this.y + this.PADDING, "maat-\nstreepjes");
      this.title.attr({
        'text-anchor': 'start',
        'font-family': 'sans-serif',
        'font-size': '16pt'
      });
      tbb = this.title.getBBox();
      this.HEIGHT = tbb.height + 2 * this.PADDING;
      this.WIDTH = tbb.width + 2 * this.PADDING + 4 * this.ML_WIDTH;
      this.titlebox = this.paper.rect(this.x, this.y, tbb.width + 2 * this.PADDING, this.HEIGHT);
      this.titlebox.attr({
        fill: 'gold',
        stroke: 'black',
        'stroke-width': 2
      });
      this.title.attr({
        y: this.y + this.PADDING + tbb.height / 2
      });
      this.title.toFront();
      this.box.attr({
        height: this.HEIGHT,
        width: this.WIDTH
      });
      if (!this.spec.editable) {
        this.box.hide();
        this.titlebox.hide();
        this.title.hide();
      } else {
        this.elements.push(this.box, this.titlebox, this.title);
      }
      this.MLSTART_X = this.x + tbb.width + 2 * this.PADDING + this.ML_SEP;
      this.MLSTART_Y = this.y + tbb.height / 2 - this.ML_SEP / 2;
      if (this.glass.nr_of_measure_lines === 0) {
        x = this.MLSTART_X + this.ML_WIDTH;
        y = this.MLSTART_Y;
        _ref = this.spec.lines;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ml = _ref[_i];
          mml = new MeasureLine(ml, -1, this.glass, {
            x: x,
            y: y
          }, 'right', true, this.spec.editable);
          rml = new WMeasureLine(this.paper, x, y, mml, this.foot, {
            bend: this.spec.bend
          });
          this.glass.add_measure_line(ml, -1, mml, rml);
          this.elements.push(rml.widgets);
          x += this.ML_SEP + this.ML_WIDTH;
          if (x > this.x + this.WIDTH - this.PADDING) {
            y += this.ML_SEP / 2 + this.ML_HEIGHT;
            _results.push(x = this.MLSTART_X + this.ML_WIDTH);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        _ref2 = this.glass.measure_lines;
        _results2 = [];
        for (vol in _ref2) {
          ml = _ref2[vol];
          model = ml.model;
          ml.movable = this.spec.editable;
          model.movable = this.spec.editable;
          rml = new WMeasureLine(this.paper, model.position.x, model.position.y, model, this.foot, {
            bend: this.spec.bend
          });
          _results2.push(this.elements.push(rml.widgets));
        }
        return _results2;
      }
    };

    _Class.prototype.reset = function() {
      var ml, x, y, _i, _len, _ref, _results;
      x = this.MLSTART_X + this.ML_WIDTH;
      y = this.MLSTART_Y;
      _ref = this.spec.lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ml = _ref[_i];
        x += this.ML_SEP + this.ML_WIDTH;
        if (x > this.x + this.WIDTH - this.PADDING) {
          y += this.ML_SEP / 2 + this.ML_HEIGHT;
          _results.push(x = this.MLSTART_X + this.ML_WIDTH);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return _Class;

  })();

}).call(this);
