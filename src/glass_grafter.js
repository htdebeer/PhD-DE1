(function() {
  var GlassGrafter,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.GlassGrafter = typeof GlassGrafter !== "undefined" && GlassGrafter !== null ? GlassGrafter : {};

  GlassGrafter = (function() {

    _Class.prototype.initialize_properties = function(properties) {
      var p, _ref;
      p = {};
      p.buttons = (_ref = properties != null ? properties.buttons : void 0) != null ? _ref : ['normal', 'add_point', 'remove_point', 'straight', 'curve'];
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
      this.move_point_start = __bind(this.move_point_start, this);
      this.add_point = __bind(this.add_point, this);
      this.mousemove = __bind(this.mousemove, this);
      this.mouseout = __bind(this.mouseout, this);
      this.mouseover = __bind(this.mouseover, this);
      this.prop = this.initialize_properties(properties);
      this.PADDING = 3;
      this.POINT_WIDTH = 3;
      this.BUTTON_WIDTH = 32;
      CoffeeGrounds.Button.set_width(this.BUTTON_WIDTH);
      CoffeeGrounds.Button.set_base_path("../lib/icons");
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
            tooltip: 'Normaal',
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
            tooltip: 'zet een punt',
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
            tooltip: 'verwijder een punt',
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
            tooltip: 'Maak er een rechte lijn van',
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
            tooltip: 'Maak er een kromme lijn van',
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
            tooltip: 'Bekijk het glas 3-dimensionaal',
            action: function() {}
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
            icon: 'image-svg+xml',
            group: 'export',
            tooltip: 'Download als een SVG afbeelding',
            action: function() {}
          }
        }
      };
      this.draw();
      this.mode = 'normal';
      this.click = '';
      this.points_draggable = false;
      this.cp_points_draggable = false;
      this.make_draggable();
      this.canvas.mouseover(this.mouseover);
      this.canvas.mouseout(this.mouseout);
    }

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
      this.canvas.unclick(this.change_line(''));
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
          point.representation.drag(this.move_point(this, point), this.move_point_start, this.move_point_end(this, point));
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

    _Class.prototype.move_point_start = function(x, y, e) {
      var _ref;
      this.dpo = (_ref = this.dpo) != null ? _ref : {};
      return this.dpo = {
        x: 0,
        y: 0
      };
    };

    _Class.prototype.move_point_end = function(grafter, point) {
      var _this = this;
      return function(x, y, e) {
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
      return function(e, x, y) {
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
      this.glass_base.attr({
        path: this.contour.to_glass_path('base')
      });
      this.glass_bowl.attr({
        path: this.contour.to_glass_path()
      });
      return this.glass_contour.attr({
        path: this.contour.to_path()
      });
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
        stroke: 'black',
        'stroke-width': 2
      });
      mid_line = this.paper.path("M" + this.CANVAS_MID + "," + this.CANVAS_TOP + "v" + this.CANVAS_HEIGHT);
      mid_line.attr({
        stroke: 'white',
        'stroke-width': 2,
        'stroke-dasharray': '.'
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
      return this.contour.edge.representation = this.edge_point;
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
      if (dashing == null) dashing = '-';
      border_line = this.paper.path("M" + this.CANVAS_MID + "," + border.y + "h" + this.BORDER_WIDTH);
      border_line.attr({
        stroke: 'navy',
        'stroke-dasharray': dashing
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

    _Class.prototype.draw_axis = function(axis) {
      var AXISLABELSEP, HALFTICKSLENGTH, LABELSEP, TICKSLENGTH, albb, axis_label, end, i, label, label_text, ltbb, movement, path, step, x, y;
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
