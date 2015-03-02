
/*

(c) 2012, Huub de Beer, H.T.de.Beer@gmail.com
*/

(function() {
  var Widget;

  Widget = (function() {

    function Widget(canvas, x, y, spec) {
      this.canvas = canvas;
      this.x = x;
      this.y = y;
      this.spec = spec != null ? spec : {};
      this.widgets = this.canvas.set();
      this.dx = this.dy = 0;
    }

    Widget.prototype.place_at = function(x, y) {
      /*
          Place this widget at co-ordinates x an y
      */      this._compute_geometry();
      this.dx = x - this.geometry.left;
      this.dy = y - this.geometry.top;
      this.widgets.transform("...t" + this.dx + "," + this.dy);
      this.x = x;
      this.y = y;
      this._compute_geometry();
      return this;
    };

    Widget.prototype._draw = function() {
      /*
          Draw this widget. Virtual method to be overloaded by all subclasses of 
          Widget. All shapes drawn are added to the list of widgets
      */
    };

    Widget.prototype._compute_geometry = function() {
      /*
          Compute the left, top, bottom, right, width, height, and center of this 
          widget given its top-left corner (x, y). 
          
          This does not work with paths that do not start at (0,0)
      */
      var bbox;
      bbox = this.widgets.getBBox();
      this.geometry = {};
      this.geometry.width = bbox.width;
      this.geometry.height = bbox.height;
      this.geometry.top = bbox.y;
      this.geometry.left = bbox.x;
      this.geometry.right = bbox.x2;
      this.geometry.bottom = bbox.y2;
      return this.geometry.center = {
        x: (this.geometry.right - this.geometry.left) / 2 + this.geometry.left,
        y: (this.geometry.bottom - this.geometry.top) / 2 + this.geometry.top
      };
    };

    return Widget;

  })();

  window.Widget = Widget;

}).call(this);
