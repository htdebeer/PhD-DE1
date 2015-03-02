(function() {

  window.KNMIGrapher = (function() {

    function _Class(paper, x, y, width, height, x_axis, y_axis, KNMI_data, properties) {
      var GRAPHER_HEIGHT, GRAPHER_WIDTH, GRAPH_AXIS_WIDTH, GRAPH_BUTTON_WIDTH, GRAPH_PADDING, GRAPH_SEP, data, dy, graphpath, i, line, p, stepticks, total_x, total_y, x_candidate, x_max, x_pixel, x_step, x_tickspath, xi, y_candidate, y_max, y_oud, y_pixel, y_step, y_tickspath, yi, _ref, _ref2, _ref3, _ref4, _ref5;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      data = this.parse_KNMI_data(KNMI_data);
      GRAPH_PADDING = 2;
      GRAPH_BUTTON_WIDTH = 34;
      GRAPH_SEP = 15;
      GRAPH_AXIS_WIDTH = 40;
      GRAPHER_WIDTH = this.width - GRAPH_PADDING * 2 - GRAPH_AXIS_WIDTH;
      GRAPHER_HEIGHT = this.height - GRAPH_PADDING * 2 - GRAPH_BUTTON_WIDTH - GRAPH_SEP - GRAPH_AXIS_WIDTH;
      x_max = data.max_x;
      total_x = x_max * 1.1;
      x_pixel = total_x / GRAPHER_WIDTH;
      x_tickspath = (_ref = x_axis != null ? x_axis.tickspath : void 0) != null ? _ref : false;
      if (!x_tickspath) {
        x_candidate = total_x / 15;
        stepticks = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
        xi = 0;
        while (xi < stepticks.length && stepticks[xi] <= x_candidate) {
          xi++;
        }
        x_step = stepticks[xi - 1];
        x_tickspath = "" + x_step + "tL";
      }
      y_max = data.max_y;
      total_y = y_max * 1.1;
      y_pixel = total_y / GRAPHER_HEIGHT;
      y_tickspath = (_ref2 = y_axis != null ? y_axis.tickspath : void 0) != null ? _ref2 : false;
      if (!y_tickspath) {
        y_candidate = total_y / 15;
        stepticks = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
        yi = 0;
        while (yi < stepticks.length && stepticks[yi] <= y_candidate) {
          yi++;
        }
        y_step = stepticks[yi - 1];
        y_tickspath = "" + y_step + "tL";
      }
      this.graph_spec = {
        x_axis: {
          label: x_axis.label,
          raster: true,
          unit: {
            per_pixel: x_pixel,
            symbol: x_axis.symbol,
            quantity: x_axis.quantity
          },
          max: x_max,
          tickspath: x_tickspath,
          orientation: 'horizontal'
        },
        y_axis: {
          label: y_axis.label,
          raster: true,
          unit: {
            per_pixel: y_pixel,
            symbol: y_axis.symbol,
            quantity: y_axis.quantity
          },
          max: y_max,
          tickspath: y_tickspath,
          orientation: 'vertical'
        },
        computer_graph: (_ref3 = properties != null ? properties.computer_graph : void 0) != null ? _ref3 : true,
        editable: (_ref4 = properties != null ? properties.editable : void 0) != null ? _ref4 : true,
        icon_path: (_ref5 = properties != null ? properties.icon_path : void 0) != null ? _ref5 : 'lib/icons'
      };
      this.graph = new Graph(this.paper, this.x, this.y, this.width, this.height, this.graph_spec);
      line = this.graph.computer_line;
      x = line.min.x;
      y = line.max.y - (data.values[0] / line.y_unit.per_pixel);
      graphpath = "M" + x + "," + y;
      i = 1;
      y_oud = data.values[0];
      dy = 0;
      while (i < x_max) {
        dy = (data.values[i] - y_oud) * -1;
        y_oud = data.values[i];
        graphpath += "l" + (1 / line.x_unit.per_pixel) + "," + (dy / line.y_unit.per_pixel);
        i++;
      }
      this.graph.computer_graph.attr({
        path: graphpath
      });
      line.add_point(x, y, this.graph);
      p = line.find_point_at(x);
      line.add_freehand_line(p, graphpath);
    }

    _Class.prototype.parse_KNMI_data = function(data) {
      var data_lines, data_points, line, match, max_y, pattern, x, y;
      data_lines = (function() {
        var _i, _len, _ref, _results;
        _ref = data.split(/\n/);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          line = _ref[_i];
          if (!/^#.*/.test(line)) _results.push(line);
        }
        return _results;
      })();
      x = 0;
      max_y = y = -Infinity;
      data_points = [];
      pattern = /.*,\s*(\d+)$/;
      while (x < data_lines.length) {
        match = pattern.exec(data_lines[x]);
        y = parseFloat(match[1]) / 10;
        max_y = Math.max(max_y, y);
        data_points.push(y);
        x++;
      }
      return {
        values: data_points,
        max_y: max_y,
        max_x: x - 1
      };
    };

    return _Class;

  })();

}).call(this);
