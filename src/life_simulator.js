(function() {
  var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.LifeSimulator = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      p = {};
      p.components = (_ref = properties != null ? properties.components : void 0) != null ? _ref : ['life', 'graph'];
      p.editable = (_ref2 = properties != null ? properties.editable : void 0) != null ? _ref2 : true;
      p.icon_path = (_ref3 = properties != null ? properties.icon_path : void 0) != null ? _ref3 : 'lib/icons';
      p.speed = (_ref4 = properties != null ? properties.speed : void 0) != null ? _ref4 : 25;
      p.graph_buttons = (_ref5 = properties != null ? properties.graph_buttons : void 0) != null ? _ref5 : ['normal', 'point', 'straight', 'curve', 'remove', 'raster', 'delta'];
      p.computer_graph = (_ref6 = properties != null ? properties.computer_graph : void 0) != null ? _ref6 : true;
      return p;
    };

    function _Class(paper, x, y, config, width, height, properties) {
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.config = config;
      this.width = width;
      this.height = height;
      this.spec = this.initialize_properties(properties);
      this.PADDING = 2;
      this.LIFE_SEP = 50;
      this.LIFE_X = this.x + this.PADDING;
      this.LIFE_Y = this.y + this.PADDING;
      this.draw();
    }

    _Class.prototype.draw = function() {
      var aantal_per_pixel, generation, generation_per_pixel, generationstep_candidate, generationstep_i, generationticks, generationtickspath, pixels_per_aantal, population, populationstep, populationstep_candidate, populationstep_i, populationticks, populationtickspath;
      this.life = new CoffeeGrounds.Life(this.paper, this.LIFE_X, this.LIFE_Y, this.config, {}, {
        icon_path: this.spec.icon_path
      });
      this.GRAPH_X = this.LIFE_X + this.life.width + this.LIFE_SEP;
      this.GRAPH_Y = this.y + this.PADDING;
      if (__indexOf.call(this.spec.components, 'graph') >= 0) {
        this.GRAPH_SEP = 50;
        this.GRAPH_GRAPH_SEP = 15;
        this.GRAPH_PADDING = 2;
        this.GRAPH_AXIS_WIDTH = 40;
        this.GRAPH_BUTTON_WIDTH = 34;
        this.GRAPHER_HEIGHT = this.height - this.PADDING;
        this.GRAPHER_WIDTH = this.width - this.life.width - this.LIFE_SEP - this.PADDING;
        generation = Math.floor(this.life.maximum_generation * 1.15);
        population = Math.floor(this.life.maximum_population * 0.7);
        this.GRAPH_WIDTH = this.GRAPHER_WIDTH - 2 * this.GRAPH_PADDING - this.GRAPH_AXIS_WIDTH;
        this.GRAPH_HEIGHT = this.GRAPHER_HEIGHT - this.GRAPH_BUTTON_WIDTH - this.GRAPH_AXIS_WIDTH - this.GRAPH_GRAPH_SEP - 2 * this.GRAPH_PADDING;
        generation_per_pixel = generation / this.GRAPH_WIDTH;
        pixels_per_aantal = this.GRAPH_HEIGHT / population;
        aantal_per_pixel = population / this.GRAPH_HEIGHT;
        populationstep_candidate = population / 15;
        populationticks = [1, 5, 10, 20, 50, 100, 200, 500, 1000];
        populationstep_i = 0;
        while (populationstep_i < populationticks.length && populationticks[populationstep_i] <= populationstep_candidate) {
          populationstep_i++;
        }
        populationstep = populationticks[populationstep_i - 1];
        populationtickspath = "" + populationstep + "tL";
        generationstep_candidate = generation / (this.GRAPH_WIDTH / (pixels_per_aantal * populationstep * 2));
        generationticks = [1, 5, 10, 20, 50, 100, 200, 500, 1000];
        generationstep_i = 0;
        while (generationstep_i < generationticks.length && generationticks[generationstep_i] <= generationstep_candidate) {
          generationstep_i++;
        }
        generationtickspath = "" + generationticks[generationstep_i - 1] + "tL";
        this.graph = new Graph(this.paper, this.GRAPH_X, this.GRAPH_Y, this.GRAPHER_WIDTH, this.GRAPH_HEIGHT, {
          x_axis: {
            label: "generaties (aantal)",
            raster: true,
            unit: {
              per_pixel: generation_per_pixel,
              symbol: "aantal",
              quantity: "generatie"
            },
            max: generation,
            tickspath: generationtickspath,
            orientation: 'horizontal'
          },
          y_axis: {
            label: "populatie (aantal bacteriën)",
            raster: true,
            unit: {
              per_pixel: 1 / pixels_per_aantal,
              symbol: "aantal",
              quantity: "populatie"
            },
            max: population,
            tickspath: populationtickspath,
            orientation: 'vertical'
          },
          buttons: this.spec.graph_buttons,
          computer_graph: this.spec.computer_graph,
          editable: this.spec.editable,
          icon_path: this.spec.icon_path
        });
        return this.life.set_graph(this.graph);
      }
    };

    return _Class;

  })();

}).call(this);
