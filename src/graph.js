(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.Graph = (function() {

    function _Class(paper, x, y, width, height, properties) {
      var MARGIN, ticks,
        _this = this;
      this.paper = paper;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.move_control_point_start = __bind(this.move_control_point_start, this);
      this.add_curve = __bind(this.add_curve, this);
      this.add_line = __bind(this.add_line, this);
      this.remove = __bind(this.remove, this);
      this.move_point_start = __bind(this.move_point_start, this);
      this.add_point = __bind(this.add_point, this);
      this.mousemove = __bind(this.mousemove, this);
      this.mouseover = __bind(this.mouseover, this);
      this.mouseout = __bind(this.mouseout, this);
      this.delta_out = __bind(this.delta_out, this);
      this.delta_move = __bind(this.delta_move, this);
      this.delta_over = __bind(this.delta_over, this);
      this.spec = this.initialize_properties(properties);
      this.PADDING = 2;
      this.BUTTON_WIDTH = 34;
      this.POINT_WIDTH = 3;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      this.BUTTON_SEP = 5;
      this.GROUP_SEP = this.BUTTON_WIDTH * 0.6;
      this.GRAPH_SEP = 15;
      this.AXIS_WIDTH = 50;
      this.GRAPH_HEIGHT = this.height - this.PADDING - this.BUTTON_WIDTH - this.GRAPH_SEP - this.AXIS_WIDTH - this.PADDING;
      this.GRAPH_WIDTH = this.width - this.PADDING - this.AXIS_WIDTH - this.PADDING;
      this.ORIGIN = {
        x: this.x + this.PADDING + this.AXIS_WIDTH,
        y: this.y + this.PADDING + this.BUTTON_WIDTH + this.GRAPH_SEP + this.GRAPH_HEIGHT
      };
      this.raster = this.paper.path("M0,0");
      CoffeeGrounds.Button.set_base_path(this.spec.icon_path);
      this.actions = {
        normal: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'select',
            icon: 'edit-select',
            tooltip: 'Selecteer en beweeg punten',
            on_select: function() {
              return _this.change_mode('normal');
            },
            enabled: true,
            "default": true
          },
          cursor: 'default'
        },
        point: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'edit-node',
            tooltip: 'Zet een punt',
            on_select: function() {
              return _this.change_mode('point');
            },
            enabled: true
          },
          cursor: 'crosshair'
        },
        straight: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'straight-line',
            tooltip: 'Trek een rechte lijn',
            on_select: function() {
              return _this.change_mode('straight');
            },
            enabled: true
          },
          cursor: 'default'
        },
        curve: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'draw-bezier-curves',
            tooltip: 'Trek een kromme lijn',
            on_select: function() {
              return _this.change_mode('curve');
            },
            enabled: true
          },
          cursor: 'default'
        },
        remove: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'edit',
            icon: 'dialog-close',
            tooltip: 'Verwijder punt of lijn',
            on_select: function() {
              return _this.change_mode('remove');
            },
            enabled: true
          },
          cursor: 'default'
        },
        delta: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'inspect',
            icon: 'draw-triangle',
            tooltip: 'Bepaal de snelheid',
            on_select: function() {
              return _this.change_mode('delta');
            },
            enabled: true
          },
          cursor: 'crosshair'
        },
        sigma: {
          button: {
            type: 'group',
            option_group: 'mode',
            group: 'inspect',
            icon: 'office-chart-area',
            tooltip: 'Bepaal de verandering',
            on_select: function() {
              return _this.change_mode('sigma');
            },
            enabled: true
          },
          cursor: 'default'
        },
        computer: {
          button: {
            type: 'switch',
            group: 'switch',
            icon: 'office-chart-line',
            tooltip: 'Laat computergrafiek zien / verberg',
            switched_on: false,
            on_switch_on: function() {
              var deltapath;
              _this.computer_graph.show();
              _this.computer_graph_shown = true;
              deltapath = _this.computer_graph.attr('path');
              return _this.deltaline.attr({
                path: deltapath
              });
            },
            on_switch_off: function() {
              var deltapath;
              _this.computer_graph.hide();
              _this.computer_graph_shown = false;
              deltapath = _this.user_line.to_path();
              return _this.deltaline.attr({
                path: deltapath
              });
            }
          }
        },
        raster: {
          button: {
            type: 'switch',
            icon: 'view-grid',
            group: 'switch',
            tooltip: 'Laat raster zien / verberg',
            switched_on: true,
            on_switch_on: function() {
              return _this.raster.show();
            },
            on_switch_off: function() {
              return _this.raster.hide();
            }
          }
        },
        export_png: {
          button: {
            type: 'action',
            icon: 'image-x-generic',
            group: 'export',
            tooltip: 'Download als een PNG afbeelding',
            action: function() {}
          }
        },
        export_svg: {
          button: {
            type: 'action',
            icon: 'image-svg',
            group: 'export',
            tooltip: 'Download als een SVG afbeelding',
            action: function() {
              return _this.export_svg();
            }
          }
        }
      };
      MARGIN = 20;
      this.x_axis = this.spec.x_axis;
      this.x_axis.origin = {
        x: this.ORIGIN.x,
        y: this.ORIGIN.y
      };
      this.x_axis.width = this.GRAPH_WIDTH;
      this.y_axis = this.spec.y_axis;
      this.y_axis.origin = {
        x: this.ORIGIN.x,
        y: this.ORIGIN.y
      };
      this.y_axis.width = this.GRAPH_HEIGHT;
      this.user_line = new CoffeeGrounds.Line(this.ORIGIN.x, this.ORIGIN.y - this.GRAPH_HEIGHT, this.GRAPH_WIDTH, this.GRAPH_HEIGHT, this.x_axis.unit, this.y_axis.unit, true);
      this.computer_line = new CoffeeGrounds.Line(this.ORIGIN.x, this.ORIGIN.y - this.GRAPH_HEIGHT, this.GRAPH_WIDTH, this.GRAPH_HEIGHT, this.x_axis.unit, this.y_axis.unit, true);
      this.delta_y = 50;
      ticks = this.parse_tickspath(this.y_axis.tickspath);
      this.delta_y = ticks.length * (ticks.distance / this.y_axis.unit.per_pixel);
      this.draw();
      this.mode = 'normal';
      this.click = '';
      if (this.spec.computer_graph) {
        this.computer_graph_shown = true;
        this.computer_graph.show();
      } else {
        this.computer_graph_shown = false;
        this.computer_graph.hide();
      }
      this.points_draggable = false;
      this.cp_points_draggable = false;
      this.elements.mouseover(this.mouseover);
      this.elements.mouseout(this.mouseout);
      this.deltaline.mouseover(this.delta_over);
      this.deltaline.mousemove(this.delta_move);
      this.deltaline.mouseout(this.delta_out);
    }

    _Class.prototype.get_user_line = function() {
      return this.user_line;
    };

    _Class.prototype.set_user_line = function(line) {
      this.user_line = line;
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.delta_over = function(e, x, y) {
      this.deltaline.attr({
        cursor: 'none'
      });
      return this.delta_move(e, x, y);
    };

    _Class.prototype.delta_move = function(e, x, y) {
      var EPSILON, SMALL_EPSILON, bigstep, dx, dy, factor, length, mx_length, p, path, patharr, point, pointn, seg;
      p = this.fit_point(x, y);
      if (p.x > this.user_line.min.x + 1) {
        EPSILON = 0.5;
        SMALL_EPSILON = 0.001;
        patharr = this.deltaline.attr('path');
        path = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = patharr.length; _i < _len; _i++) {
            seg = patharr[_i];
            _results.push("" + seg[0] + (seg.slice(1).join(',')));
          }
          return _results;
        })()).join("");
        length = 0;
        bigstep = 50;
        mx_length = this.deltaline.getTotalLength();
        while (length < (mx_length - bigstep) && this.deltaline.getPointAtLength(length).x < p.x) {
          length += bigstep;
        }
        length -= bigstep;
        while (length < mx_length && Math.abs(this.deltaline.getPointAtLength(length).y - p.y) > EPSILON && this.deltaline.getPointAtLength(length).x < p.x) {
          length++;
        }
        point = this.deltaline.getPointAtLength(length);
        pointn = this.deltaline.getPointAtLength(length + 1);
        if (point.x && pointn.x && point.y && pointn.y) {
          dy = pointn.y - point.y;
          dx = pointn.x - point.x;
          if (dx && dy) {
            this.deltapoint.attr({
              cx: point.x,
              cy: point.y
            });
            this.deltapoint.show();
            factor = 0;
            if (!(((-1 * SMALL_EPSILON) < dy && dy < SMALL_EPSILON))) {
              factor = this.delta_y / dy / 2;
            }
            this.delta_ll.attr({
              path: "M" + (point.x - dx * factor) + "," + (point.y - dy * factor) + "L" + (point.x + dx * factor) + "," + (point.y + dy * factor)
            });
            this.delta_ll.show();
            this.dyh.attr({
              path: "M" + this.user_line.min.x + "," + (point.y + dy * factor) + "L" + (point.x + dx * factor) + "," + (point.y + dy * factor)
            });
            this.dyl.attr({
              path: "M" + this.user_line.min.x + "," + (point.y - dy * factor) + "L" + (point.x - dx * factor) + "," + (point.y - dy * factor)
            });
            this.dxl.attr({
              path: "M" + (point.x - dx * factor) + "," + this.user_line.max.y + "L" + (point.x - dx * factor) + "," + (point.y - dy * factor)
            });
            this.dxh.attr({
              path: "M" + (point.x + dx * factor) + "," + this.user_line.max.y + "L" + (point.x + dx * factor) + "," + (point.y + dy * factor)
            });
            this.dyh.show();
            this.dyl.show();
            this.dxh.show();
            return this.dxl.show();
          }
        }
      }
    };

    _Class.prototype.delta_out = function(e, x, y) {
      this.deltapoint.hide();
      this.delta_ll.hide();
      this.dyh.hide();
      this.dyl.hide();
      this.dxh.hide();
      this.dxl.hide();
      return this.deltaline.attr({
        cursor: this.actions[this.mode].cursor
      });
    };

    _Class.prototype.initialize_properties = function(properties) {
      var button, index, p, _len, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      p = {};
      p.x_axis = properties.x_axis;
      p.y_axis = properties.y_axis;
      p.raster = true;
      p.buttons = (_ref = properties != null ? properties.buttons : void 0) != null ? _ref : ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'computer', 'raster'];
      p.point = {};
      p.point.size = (_ref2 = properties != null ? (_ref3 = properties.point) != null ? _ref3.size : void 0 : void 0) != null ? _ref2 : 2;
      p.icon_path = (_ref4 = properties != null ? properties.icon_path : void 0) != null ? _ref4 : 'lib/icons';
      p.computer_graph = (_ref5 = properties != null ? properties.computer_graph : void 0) != null ? _ref5 : false;
      p.editable = (_ref6 = properties != null ? properties.editable : void 0) != null ? _ref6 : true;
      if (!p.editable) {
        _ref7 = p.buttons;
        for (index = 0, _len = _ref7.length; index < _len; index++) {
          button = _ref7[index];
          if (button === 'point' || button === 'straight' || button === 'curve' || button === 'remove' || button === 'normal') {
            delete p.buttons[index];
          }
        }
      }
      return p;
    };

    _Class.prototype.fit_point = function(x, y) {
      var point;
      point = {
        x: x - this.paper.canvas.parentNode.offsetLeft,
        y: y - this.paper.canvas.parentNode.offsetTop
      };
      return point;
    };

    _Class.prototype.mouseout = function(e, x, y) {
      this.elements.unmousemove(this.mousemove);
      return this.reset_mouse();
    };

    _Class.prototype.mouseover = function(e, x, y) {
      return this.elements.mousemove(this.mousemove);
    };

    _Class.prototype.mousemove = function(e, x, y) {
      var a, d, left, p, q, r, right, s;
      p = this.fit_point(x, y);
      this.elements.attr({
        cursor: this.actions[this.mode].cursor
      });
      switch (this.mode) {
        case 'normal':
          this.reset_mouse();
          break;
        case 'point':
          if (this.user_line.can_add_point(p.x, p.y)) {
            if (this.click !== this.mode) {
              this.elements.click(this.add_point);
              this.click = this.mode;
            }
          } else {
            this.elements.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'straight':
          if (this.user_line.can_add_line(p.x)) {
            if (this.click !== this.mode) {
              this.elements.click(this.add_line);
              this.click = this.mode;
            }
            q = this.user_line.find_point_to_the_left_of(p.x);
            left = this.user_line.get_point(q);
            right = this.user_line.get_point(q + 1);
            this.potential_line.attr({
              path: "M" + left.x + "," + left.y + "L" + right.x + "," + right.y,
              stroke: 'green'
            });
            this.potential_line.show();
          } else {
            this.reset_mouse();
            this.elements.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'curve':
          if (this.user_line.can_add_line(p.x)) {
            if (this.click !== this.mode) {
              this.elements.click(this.add_curve);
              this.click = this.mode;
            }
            q = this.user_line.find_point_to_the_left_of(p.x);
            left = this.user_line.get_point(q);
            right = this.user_line.get_point(q + 1);
            d = (right.x - left.x) / 4;
            this.potential_line.attr({
              path: "M" + left.x + "," + left.y + "C" + (left.x + d) + "," + left.y + "," + (right.x - d) + "," + right.y + "," + right.x + "," + right.y,
              stroke: 'gold'
            });
            this.potential_line.show();
          } else {
            q = this.user_line.find_point_to_the_left_of(p.x);
            if (q !== -1) r = this.user_line.get_point(q);
            if (q !== -1 && r.segment.type === 'curve') {
              this.potential_line.hide();
            } else {
              this.reset_mouse();
              this.elements.attr({
                cursor: 'not-allowed'
              });
            }
          }
          break;
        case 'remove':
          q = this.user_line.find_point_to_the_left_of(p.x);
          r = this.user_line.find_point_near(p.x, p.y, this.POINT_WIDTH * 5);
          this.remove_line.hide();
          this.remove_point.hide();
          if (r !== -1) {
            if (this.user_line.can_remove_point(r)) {
              if (this.click !== this.mode) {
                this.elements.click(this.remove);
                this.click = this.mode;
              }
              s = this.user_line.get_point(r);
              this.remove_point.attr({
                cx: s.x,
                cy: s.y
              });
              this.remove_point.show();
            }
          } else if (q !== -1) {
            if (this.user_line.can_remove_line_from_point(q)) {
              if (this.click !== this.mode) {
                this.elements.click(this.remove);
                this.click = this.mode;
              }
              r = this.user_line.get_point(q);
              s = this.user_line.get_point(q + 1);
              this.remove_line.attr({
                x: r.x,
                width: s.x - r.x
              });
              this.remove_line.show();
            }
          } else {
            this.reset_mouse();
            this.elements.attr({
              cursor: 'not-allowed'
            });
          }
          break;
        case 'sigma':
          a = 1;
      }
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.add_point = function(e, x, y) {
      var p, point, q;
      p = this.fit_point(x, y);
      point = this.paper.circle(p.x, p.y, this.POINT_WIDTH * 2);
      point.attr({
        fill: 'blue',
        stroke: 'blue',
        'fill-opacity': 0.3
      });
      q = this.user_line.add_point(p.x, p.y, point);
      return point.drag(this.move_point(this, q), this.move_point_start, this.move_point_end(this, q));
    };

    _Class.prototype.make_draggable = function() {
      var point, _i, _len, _ref, _ref2;
      this.points_draggable = (_ref = this.points_draggable) != null ? _ref : false;
      if (!this.points_draggable) {
        _ref2 = this.user_line.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          point.representation.drag(this.move_point(this, point), this.move_point_start, this.move_point_end(this, point));
          point.representation.attr({
            fill: 'blue',
            stroke: 'blue',
            r: this.POINT_WIDTH * 2,
            'fill-opacity': 0.3
          });
        }
        return this.points_draggable = true;
      }
    };

    _Class.prototype.move_point = function(graph, point) {
      var _this = this;
      return function(dx, dy, x, y, e) {
        var newp, p, tx, ty;
        tx = dx - graph.dpo.x;
        ty = dy - graph.dpo.y;
        p = graph.user_line.find_point_at(point.x);
        newp = {
          x: point.x + tx,
          y: point.y + ty
        };
        if (graph.user_line.can_move_point(p, newp.x, newp.y)) {
          graph.user_line.move_point(p, newp.x, newp.y);
          graph.dpo = {
            x: dx,
            y: dy
          };
          point.representation.attr({
            cx: point.x,
            cy: point.y
          });
          return graph.user_graph.attr({
            path: graph.user_line.to_path()
          });
        } else {

        }
      };
    };

    _Class.prototype.move_point_start = function(x, y, e) {
      var _ref;
      this.dpo = (_ref = this.dpo) != null ? _ref : {};
      return this.dpo = {
        x: 0,
        y: 0
      };
    };

    _Class.prototype.move_point_end = function(graph, point) {
      var _this = this;
      return function(e) {
        var p;
        graph.user_graph.attr({
          path: graph.user_line.to_path()
        });
        p = graph.user_line.find_point_at(point.x);
        return graph.user_line.move_point(p, 0, 0, true);
      };
    };

    _Class.prototype.make_undraggable = function() {
      var point, _i, _len, _ref, _ref2;
      this.points_draggable = (_ref = this.points_draggable) != null ? _ref : false;
      if (this.points_draggable) {
        _ref2 = this.user_line.points;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          point = _ref2[_i];
          point.representation.undrag();
          point.representation.attr({
            fill: 'black',
            stroke: 'black',
            r: this.POINT_WIDTH,
            'fill-opacity': 1
          });
        }
        return this.points_draggable = false;
      }
    };

    _Class.prototype.reset_mouse = function() {
      this.click = '';
      this.elements.unclick(this.remove);
      this.elements.unclick(this.add_point);
      this.elements.unclick(this.add_line);
      this.elements.unclick(this.add_curve);
      this.potential_line.hide();
      this.remove_point.hide();
      return this.remove_line.hide();
    };

    _Class.prototype.remove = function(e, x, y) {
      var p, q, r;
      p = this.fit_point(x, y);
      q = this.user_line.find_point_near(p.x, p.y, this.POINT_WIDTH * 5);
      if (q >= 0) {
        if (this.user_line.can_remove_point(q)) {
          r = this.user_line.get_point(q);
          r.representation.remove();
          this.user_line.remove_point(q);
          this.user_graph.attr({
            path: this.user_line.to_path()
          });
          this.remove_line.hide();
          return this.remove_point.hide();
        }
      } else {
        q = this.user_line.find_point_to_the_left_of(p.x);
        if (q >= 0 && this.user_line.can_remove_line_from_point(q)) {
          r = this.user_line.get_point(q);
          if (r.segment.type === 'curve') {
            r.segment.c1.representation.remove();
            r.segment.c2.representation.remove();
            r.segment.c1.line.remove();
            r.segment.c2.line.remove();
          }
          this.user_line.remove_line(q);
          this.user_graph.attr({
            path: this.user_line.to_path()
          });
          this.remove_line.hide();
          return this.remove_point.hide();
        }
      }
    };

    _Class.prototype.add_line = function(e, x, y) {
      var p, q;
      p = this.fit_point(x, y);
      q = this.user_line.find_point_to_the_left_of(p.x);
      this.user_line.add_straight_line(q);
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.add_curve = function(e, x, y) {
      var cleft, clleft, clright, cright, d, left, p, q, right;
      p = this.fit_point(x, y);
      q = this.user_line.find_point_to_the_left_of(p.x);
      left = this.user_line.get_point(q);
      right = this.user_line.get_point(q + 1);
      d = (right.x - left.x) / 4;
      cleft = this.paper.circle(left.x + d, left.y, this.POINT_WIDTH * 2);
      cleft.attr({
        fill: 'gold',
        stroke: 'gold',
        'fill-opacity': 0.3
      });
      cleft.drag(this.move_control_point(this, left, right, cleft, 1), this.move_control_point_start, this.move_control_point_end(this, left, cleft, 1));
      clleft = this.paper.path("M" + left.x + "," + left.y + "L" + (left.x + d) + "," + left.y);
      clleft.attr({
        stroke: 'gold',
        'stroke-dasharray': '.'
      });
      cright = this.paper.circle(right.x - d, right.y, this.POINT_WIDTH * 2);
      cright.attr({
        fill: 'gold',
        stroke: 'gold',
        'fill-opacity': 0.3
      });
      cright.drag(this.move_control_point(this, left, right, cright, 2), this.move_control_point_start, this.move_control_point_end(this, left, cright, 2));
      clright = this.paper.path("M" + right.x + "," + right.y + "L" + (right.x - d) + "," + right.y);
      clright.attr({
        stroke: 'gold',
        'stroke-dasharray': '.'
      });
      this.user_line.add_curved_line(q, d, cleft, cright, clleft, clright);
      return this.user_graph.attr({
        path: this.user_line.to_path()
      });
    };

    _Class.prototype.change_mode = function(mode) {
      var deltapath;
      this.mode = mode;
      this.elements.attr({
        cursor: this.actions[this.mode].cursor
      });
      this.reset_mouse();
      if (this.mode === 'point') {
        this.make_draggable();
      } else {
        this.make_undraggable();
      }
      if (this.mode === 'curve') {
        this.make_cp_draggable();
      } else {
        this.make_cp_undraggable();
      }
      if (this.mode === 'delta') {
        this.elements.unmouseover(this.mouseover);
        this.elements.unmouseout(this.mouseout);
        this.elements.unmousemove(this.mousemove);
        if (this.computer_graph_shown) {
          deltapath = this.computer_graph.attr('path');
        } else {
          deltapath = this.user_line.to_path();
        }
        this.deltaline.attr({
          path: deltapath
        });
        return this.deltaline.toFront().show();
      } else {
        this.elements.mouseover(this.mouseover);
        this.elements.mouseout(this.mouseout);
        return this.deltaline.hide();
      }
    };

    _Class.prototype.make_cp_undraggable = function() {
      var point, s, _i, _len, _ref, _ref2;
      this.cp_points_draggable = (_ref = this.cp_points_draggable) != null ? _ref : false;
      if (this.cp_points_draggable) {
        _ref2 = this.user_line.points;
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

    _Class.prototype.make_cp_draggable = function() {
      var next_point, point, s, _i, _len, _ref, _ref2;
      this.cp_points_draggable = (_ref = this.cp_points_draggable) != null ? _ref : false;
      if (!this.cp_points_draggable) {
        _ref2 = this.user_line.points;
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
            next_point = this.user_line.get_point(this.user_line.find_point_at(point.x) + 1);
            point.segment.c2.line.attr({
              path: "M" + next_point.x + "," + next_point.y + "L" + point.segment.c2.x + "," + point.segment.c2.y
            });
            point.segment.c2.line.show();
          }
        }
        return this.cp_points_draggable = true;
      }
    };

    _Class.prototype.export_svg = function() {
      var a, bb, blob, svgString, _ref, _ref2;
      svgString = this.paper.toSVG();
      a = document.createElement('a');
      a.download = 'mySvg.svg';
      a.type = 'image/svg+xml';
      bb = new ((_ref = window.BlobBuilder) != null ? _ref : WebKitBlobBuilder);
      bb.append(svgString);
      blob = bb.getBlob('image/svg+xml');
      a.href = ((_ref2 = window.URL) != null ? _ref2 : webkitURL).createObjectURL(blob);
      return a.click();
    };

    _Class.prototype.hide = function() {
      return this.elements.hide();
    };

    _Class.prototype.show = function() {
      return this.elements.show();
    };

    _Class.prototype.draw = function() {
      var _ref;
      this.elements = this.paper.set();
      this.elements.push(this.draw_pane(false));
      this.elements.push(this.draw_axis(this.x_axis));
      this.elements.push(this.draw_axis(this.y_axis));
      if ((_ref = this.spec) != null ? _ref.raster : void 0) {
        this.elements.push(this.draw_raster(this.x_axis, this.y_axis));
      }
      this.computer_graph = this.paper.path("M0,0");
      this.computer_graph.attr({
        stroke: 'dodgerblue',
        'stroke-width': 2
      });
      this.elements.push(this.computer_graph);
      this.computer_graph.hide();
      this.user_graph = this.paper.path("M0,0");
      this.user_graph.attr({
        stroke: 'black',
        'stroke-width': 2
      });
      this.potential_line = this.paper.path("M0,0");
      this.potential_line.attr({
        stroke: 'blue',
        'stroke-opacity': 0.5,
        'stroke-width': 2,
        'stroke-dasharray': '.'
      });
      this.potential_line.hide();
      this.remove_point = this.paper.circle(0, 0, 12);
      this.remove_point.attr({
        stroke: 'red',
        fill: 'red',
        'fill-opacity': 0.25
      });
      this.remove_point.hide();
      this.remove_line = this.paper.rect(0, this.ORIGIN.y - this.GRAPH_HEIGHT, 0, this.GRAPH_HEIGHT);
      this.remove_line.attr({
        stroke: 'red',
        fill: 'red',
        'fill-opacity': 0.25
      });
      this.remove_line.hide();
      this.deltaline = this.paper.path("M0,0");
      this.deltaline.attr({
        'stroke-width': 15,
        stroke: 'green',
        'stroke-opacity': 0
      });
      this.deltaline.hide();
      this.delta_ll = this.paper.path("M0,0");
      this.delta_ll.attr({
        stroke: 'orange',
        'stroke-width': 3
      });
      this.delta_ll.hide();
      this.deltapoint = this.paper.circle(0, 0, 3);
      this.deltapoint.attr({
        fill: 'gray'
      });
      this.deltapoint.hide();
      this.dyh = this.paper.path("M0,0");
      this.dyh.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dyh.hide();
      this.dyl = this.paper.path("M0,0");
      this.dyl.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dyl.hide();
      this.dxh = this.paper.path("M0,0");
      this.dxh.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dxh.hide();
      this.dxl = this.paper.path("M0,0");
      this.dxl.attr({
        stroke: 'orange',
        'stroke-dasharray': '-'
      });
      this.dxl.hide();
      this.elements.push(this.deltapoint, this.delta_ll, this.dyh, this.dyl, this.dxh, this.dxl);
      this.draw_buttons();
      this.elements.push(this.user_graph, this.potential_line, this.remove_point, this.remove_line);
      this.elements.push(this.draw_pane(true));
      return this.elements.push(this.deltaline);
    };

    _Class.prototype.move_control_point = function(graph, point, point2, cp, kind) {
      var _this = this;
      return function(dx, dy, x, y, e) {
        var newp, p, tx, ty;
        tx = dx - graph.dpo.x;
        ty = dy - graph.dpo.y;
        p = graph.user_line.find_point_at(point.x);
        newp = {
          x: cp.attr('cx') + tx,
          y: cp.attr('cy') + ty
        };
        if (graph.user_line.can_move_control_point(p, newp.x, newp.y)) {
          if (kind === 1) {
            graph.user_line.move_control_point1(p, newp.x, newp.y);
            point.segment.c1.line.attr({
              path: "M" + point.x + "," + point.y + "L" + newp.x + "," + newp.y
            });
          } else if (kind === 2) {
            graph.user_line.move_control_point2(p, newp.x, newp.y);
            point.segment.c2.line.attr({
              path: "M" + point2.x + "," + point2.y + "L" + newp.x + "," + newp.y
            });
          }
          graph.dpo = {
            x: dx,
            y: dy
          };
          cp.attr({
            cx: newp.x,
            cy: newp.y
          });
          return graph.user_graph.attr({
            path: graph.user_line.to_path()
          });
        } else {

        }
      };
    };

    _Class.prototype.move_control_point_start = function(x, y, e) {
      var _ref;
      this.dpo = (_ref = this.dpo) != null ? _ref : {};
      return this.dpo = {
        x: 0,
        y: 0
      };
    };

    _Class.prototype.move_control_point_end = function(graph, point, cp, kind) {
      var _this = this;
      return function(x, y, e) {
        var p;
        graph.user_graph.attr({
          path: graph.user_line.to_path()
        });
        p = graph.user_line.find_point_at(point.x);
        switch (kind) {
          case 1:
            return graph.user_line.move_control_point1(p, 0, 0, true);
          case 2:
            return graph.user_line.move_control_point2(p, 0, 0, true);
        }
      };
    };

    _Class.prototype.switch_mode = function(mode) {
      return this.mode = mode;
    };

    _Class.prototype.draw_buttons = function() {
      var action, button, buttongroup, group, name, optiongroup, optiongroups, sep, x, y, _ref, _ref2, _ref3, _ref4, _results;
      x = this.ORIGIN.x;
      y = this.ORIGIN.y - this.GRAPH_HEIGHT - this.GRAPH_SEP - this.BUTTON_WIDTH;
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

    _Class.prototype.draw_pane = function(glass) {
      var pane;
      if (glass == null) glass = false;
      pane = this.paper.rect(this.ORIGIN.x, this.ORIGIN.y - this.GRAPH_HEIGHT, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
      if (glass) {
        pane.attr({
          fill: 'white',
          opacity: 0,
          stroke: 'white',
          cursor: 'default'
        });
      } else {
        pane.attr({
          fill: 'white',
          stroke: 'white',
          cursor: 'default'
        });
      }
      return pane;
    };

    _Class.prototype.draw_raster = function(x_axis, y_axis) {
      var d, distance, i, origin, path, x_ticks, y_ticks;
      origin = x_axis.origin;
      path = "M" + origin.x + "," + origin.y;
      x_ticks = this.parse_tickspath(x_axis.tickspath);
      distance = x_ticks.distance / x_axis.unit.per_pixel;
      d = i = 0;
      while (d < x_axis.width - distance) {
        d += distance;
        path += "M" + (origin.x + d) + "," + origin.y + "v-" + y_axis.width;
        i = (i + 1) % x_ticks.length;
      }
      y_ticks = this.parse_tickspath(y_axis.tickspath);
      distance = y_ticks.distance / y_axis.unit.per_pixel;
      d = i = 0;
      while (d < y_axis.width - distance) {
        d += distance;
        path += "M" + origin.x + "," + (origin.y - d) + "h" + x_axis.width;
        i = (i + 1) % y_ticks.length;
      }
      this.raster = this.paper.path(path);
      this.raster.attr({
        stroke: 'silver',
        'stroke-opacity': 0.5,
        'stroke-width': 0.5
      });
      return this.raster;
    };

    _Class.prototype.draw_axis = function(axis) {
      var AXISLABELSEP, LABELSEP, TICKSLENGTH, albb, axis_label, d, distance, flabel, i, label, labels, origin, path, ticks, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      TICKSLENGTH = (_ref = (_ref2 = this.spec) != null ? _ref2.tickslength : void 0) != null ? _ref : 10;
      LABELSEP = (_ref3 = (_ref4 = this.spec) != null ? _ref4.labelsep : void 0) != null ? _ref3 : 5;
      AXISLABELSEP = (_ref5 = (_ref6 = this.spec) != null ? _ref6.axislabelsep : void 0) != null ? _ref5 : 30;
      labels = this.paper.set();
      origin = axis.origin;
      path = "M" + origin.x + "," + origin.y;
      if (axis.orientation === 'vertical') {
        path += "v-" + axis.width;
      } else {
        path += "h" + axis.width;
      }
      ticks = this.parse_tickspath(axis.tickspath);
      distance = ticks.distance / axis.unit.per_pixel;
      d = i = label = 0;
      while (d < axis.width - distance) {
        d += distance;
        label += ticks.distance;
        if (axis.orientation === 'vertical') {
          path += "M" + origin.x + "," + (origin.y - d) + "h-";
          if (ticks[i].label) {
            if (this.y_axis.unit.symbol === 'cm/ml') {
              labels.push(this.paper.text(origin.x - TICKSLENGTH - LABELSEP * 3, origin.y - d, "" + (label.toFixed(2))));
            } else {
              labels.push(this.paper.text(origin.x - TICKSLENGTH - LABELSEP * 2, origin.y - d, "" + label));
            }
          }
        } else {
          path += "M" + (origin.x + d) + "," + origin.y + "v";
          if (ticks[i].label) {
            flabel = (label * 10) % 10 === 0 ? label : label.toFixed(1);
            labels.push(this.paper.text(origin.x + d, origin.y + TICKSLENGTH + LABELSEP, "" + flabel));
          }
        }
        if (ticks[i].size === 'small') {
          path += "" + (TICKSLENGTH / 2);
        } else {
          path += "" + TICKSLENGTH;
        }
        i = (i + 1) % ticks.length;
      }
      labels.push(this.paper.text(origin.x - LABELSEP, origin.y + LABELSEP, "0"));
      axis_label = this.paper.text(0, 0, axis.label);
      axis_label.attr({
        'font-size': 14,
        'text-anchor': 'start'
      });
      albb = axis_label.getBBox();
      axis_label.attr({
        x: origin.x + axis.width - albb.width,
        y: origin.y + AXISLABELSEP
      });
      if (axis.orientation === 'vertical') {
        if (this.y_axis.unit.symbol === 'cm/ml') {
          axis_label.transform("r-90," + origin.x + "," + origin.y + "t0,-" + (2.55 * AXISLABELSEP));
        } else {
          axis_label.transform("r-90," + origin.x + "," + origin.y + "t0,-" + (2.25 * AXISLABELSEP));
        }
      }
      labels.forEach(function(l) {
        return l.attr({
          'font-size': 12
        });
      });
      return this.paper.set(this.paper.path(path), labels);
    };

    _Class.prototype.parse_tickspath = function(s) {
      var c, match, pattern, tick, ticklength, tickpattern, ticks, _i, _len;
      pattern = /(\d+(?:\.\d+)?)((?:t|T|l|L)+)/;
      match = pattern.exec(s);
      ticklength = parseFloat(match[1]);
      tickpattern = match[2];
      ticks = [];
      ticks.distance = ticklength;
      for (_i = 0, _len = tickpattern.length; _i < _len; _i++) {
        c = tickpattern[_i];
        tick = {};
        switch (c) {
          case 't':
            tick.label = false;
            tick.size = 'small';
            break;
          case 'T':
            tick.label = false;
            tick.size = 'large';
            break;
          case 'l':
            tick.label = true;
            tick.size = 'small';
            break;
          case 'L':
            tick.label = true;
            tick.size = 'large';
        }
        ticks.push(tick);
      }
      return ticks;
    };

    return _Class;

  })();

}).call(this);
