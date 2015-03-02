
/*
(c) 2012, Huub de Beer (H.T.de.Beer@gmail.com)
*/

(function() {
  var WRuler,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WRuler = (function(_super) {

    __extends(WRuler, _super);

    function WRuler(canvas, x, y, width, height, height_in_mm, spec) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.height_in_mm = height_in_mm;
      this.spec = spec != null ? spec : {
        orientation: "vertical",
        rounded_corners: 5
      };
      WRuler.__super__.constructor.call(this, this.canvas, this.x, this.y, this.spec);
    }

    return WRuler;

  })(Widget);

  window.WRuler = WRuler;

}).call(this);
