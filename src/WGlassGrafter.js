
/*

(c) 2012, Huub de Beer, H.T.de.Beer@gmail.com
*/

(function() {
  var WGlassGrafter,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WGlassGrafter = (function(_super) {

    __extends(WGlassGrafter, _super);

    function WGlassGrafter(canvas, x, y, spec) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.spec = spec;
      WGlassGrafter.__super__.constructor.call(this, this.canvas, this.x, this.y, this.spec);
    }

    WGlassGrafter.prototype._draw = function() {};

    return WGlassGrafter;

  })(Widget);

  window.WGlassGrafter = WGlassGrafter;

}).call(this);
