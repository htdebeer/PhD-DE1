(function() {

  window.CoffeeGrounds = (function() {
    var canvas;

    canvas = {};

    function _Class(id, width, height) {
      this.id = id;
      canvas = Raphael(this.id, width, height);
    }

    return _Class;

  })();

}).call(this);
