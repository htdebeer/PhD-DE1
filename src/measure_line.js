
/*
 (c) 2012, Huub de Beer, H.T.de.Beer@gmail.com
*/

(function() {
  var MeasureLine;

  MeasureLine = (function() {

    MeasureLine.EPSILON = 0.01;

    MeasureLine.prototype.to_json = function() {
      var export_object;
      export_object = {
        volume: this.volume,
        height: this.height,
        initial_position: this.initial_position,
        position: {
          x: this.position.x,
          y: this.position.y
        },
        side: this.side,
        movable: this.movable,
        visible: this.visible
      };
      return JSON.stringify(export_object);
    };

    MeasureLine.prototype.from_json = function(mljson) {
      this.volume = mljson.volume;
      this.height = mljson.height;
      this.initial_position = mljson.initial_position;
      this.position = mljson.position;
      this.side = mljson.side;
      this.movable = mljson.movable;
      return this.visible = mljson.visible;
    };

    function MeasureLine(volume, height, glass, initial_position, side, visible, movable) {
      this.volume = volume;
      this.height = height;
      this.glass = glass;
      this.initial_position = initial_position != null ? initial_position : {
        x: -1,
        y: -1
      };
      this.side = side != null ? side : 'right';
      this.visible = visible != null ? visible : false;
      this.movable = movable != null ? movable : true;
      this.set_position(this.initial_position);
    }

    MeasureLine.prototype.reset = function() {
      /*
      */      return this.set_position(this.initial_position);
    };

    MeasureLine.prototype.hide = function() {
      return this.visible = false;
    };

    MeasureLine.prototype.show = function() {
      return this.visible = true;
    };

    MeasureLine.prototype.set_position = function(position) {
      /*
          Set the position of this measure line. Position is a point (x, y). Subsequently the height in mm can be computed.
      */      this.position = position;
      return this.height = (this.glass.foot.y - this.position.y) / this.glass.unit;
    };

    MeasureLine.prototype.is_correct = function() {
      /*
          Is this measure line on the correct height on the glass? That is: is the error smaller than epsilon?
      */      return Math.abs(this.error) <= MeasureLine.EPSILON;
    };

    MeasureLine.prototype.error = function() {
      /*
          The distance of this measure line to the correct position in mm. A negative error means it is too hight, a positive distance that it is too low
      */      return (this.glass.height_at_volume(this.volume)) - this.height;
    };

    return MeasureLine;

  })();

  window.MeasureLine = MeasureLine;

}).call(this);
