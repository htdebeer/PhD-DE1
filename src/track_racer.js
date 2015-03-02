(function() {
  var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.TrackRacer = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      p = {};
      p.components = (_ref = properties != null ? properties.components : void 0) != null ? _ref : ['racer', 'graph'];
      p.editable = (_ref2 = properties != null ? properties.editable : void 0) != null ? _ref2 : true;
      p.icon_path = (_ref3 = properties != null ? properties.icon_path : void 0) != null ? _ref3 : 'lib/icons';
      p.speed = (_ref4 = properties != null ? properties.speed : void 0) != null ? _ref4 : 15;
      p.graph_buttons = (_ref5 = properties != null ? properties.graph_buttons : void 0) != null ? _ref5 : ['normal', 'point', 'straight', 'curve', 'remove', 'raster', 'delta'];
      p.computer_graph = (_ref6 = properties != null ? properties.computer_graph : void 0) != null ? _ref6 : true;
      return p;
    };

    function _Class(paper, x, y, track, width, height, properties) {
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.track = track;
      this.width = width;
      this.height = height;
      this.spec = this.initialize_properties(properties);
      this.PADDING = 2;
      this.RACER_SEP = 50;
      this.RACER_X = this.x + this.PADDING;
      this.RACER_Y = this.y + this.PADDING;
      this.draw();
    }

    _Class.prototype.draw = function() {
      var distance, distancestep, distancestep_candidate, distancestep_i, distanceticks, distancetickspath, meter_per_pixel, pixels_per_meter, time, time_per_pixel, timestep_candidate, timestep_i, timeticks, timetickspath;
      this.racer = new CoffeeGrounds.Racer(this.paper, this.RACER_X, this.RACER_Y, this.track, {}, {
        icon_path: this.spec.icon_path
      });
      this.GRAPH_X = this.RACER_X + this.racer.width + this.RACER_SEP;
      this.GRAPH_Y = this.y + this.PADDING;
      if (__indexOf.call(this.spec.components, 'graph') >= 0) {
        this.GRAPH_SEP = 50;
        this.GRAPH_GRAPH_SEP = 15;
        this.GRAPH_PADDING = 2;
        this.GRAPH_AXIS_WIDTH = 40;
        this.GRAPH_BUTTON_WIDTH = 34;
        this.GRAPHER_HEIGHT = this.height - this.PADDING;
        this.GRAPHER_WIDTH = this.width - this.racer.width - this.RACER_SEP - this.PADDING;
        time = this.racer.maximum_time * 1.1;
        distance = this.racer.maximum_distance * 1.4;
        this.GRAPH_WIDTH = this.GRAPHER_WIDTH - 2 * this.GRAPH_PADDING - this.GRAPH_AXIS_WIDTH;
        this.GRAPH_HEIGHT = this.GRAPHER_HEIGHT - this.GRAPH_BUTTON_WIDTH - this.GRAPH_AXIS_WIDTH - this.GRAPH_GRAPH_SEP - 2 * this.GRAPH_PADDING;
        time_per_pixel = time / this.GRAPH_WIDTH;
        pixels_per_meter = this.GRAPH_HEIGHT / distance;
        meter_per_pixel = distance / this.GRAPH_HEIGHT;
        distancestep_candidate = distance / 15;
        distanceticks = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
        distancestep_i = 0;
        while (distancestep_i < distanceticks.length && distanceticks[distancestep_i] <= distancestep_candidate) {
          distancestep_i++;
        }
        distancestep = distanceticks[distancestep_i - 1];
        distancetickspath = "" + distancestep + "tL";
        timestep_candidate = time / (this.GRAPH_WIDTH / (pixels_per_meter * distancestep));
        timeticks = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
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
            label: "afstand (m)",
            raster: true,
            unit: {
              per_pixel: 1 / pixels_per_meter,
              symbol: "m",
              quantity: "afstand"
            },
            max: distance,
            tickspath: distancetickspath,
            orientation: 'vertical'
          },
          buttons: this.spec.graph_buttons,
          computer_graph: this.spec.computer_graph,
          editable: this.spec.editable,
          icon_path: this.spec.icon_path
        });
        return this.racer.set_graph(this.graph);
      }
    };

    return _Class;

  })();

}).call(this);
