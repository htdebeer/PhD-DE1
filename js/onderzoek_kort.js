// Generated by CoffeeScript 1.4.0
(function() {
  var cocktail_glas, cocktail_json, glas_en_grafiek, longdrink_glas, longdrink_json, toggle, vergelijk;

  longdrink_json = '{"path":"M 346 152 l 0 345 l 0 36 l 0 24","foot":{"x":255,"y":557},"stem":{"x":255,"y":533},"bowl":{"x":255,"y":497},"edge":{"x":255,"y":152},"height_in_mm":133,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}';

  cocktail_json = '{"path":"M 419 102 l -152 245 l 0 185 c 0 23.25 101 11.75 106 25","foot":{"x":255,"y":557},"stem":{"x":255,"y":532},"bowl":{"x":255,"y":347},"edge":{"x":255,"y":102},"height_in_mm":150,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}';

  longdrink_glas = new Glass(longdrink_json);

  cocktail_glas = new Glass(cocktail_json);

  vergelijk = function(id, width, height) {
    var paper, paper_id, vergelijker;
    paper_id = "" + id + "_paper";
    paper = Raphael(paper_id, width, height);
    vergelijker = new CompareFiller(paper, 0, 0, [
      {
        model: longdrink_glas,
        speed: 35,
        time: false
      }, {
        model: cocktail_glas,
        speed: 35,
        time: false
      }
    ], width, height, {
      dimension: '2d',
      time: false,
      buttons: ['manual_diff'],
      editable: true
    });
    $("#" + id + "_leegmaken").click(function() {
      return vergelijker.empty();
    });
    $("#" + id + "_pauze").click(function() {
      return vergelijker.pause();
    });
    $("#" + id + "_vullen").click(function() {
      return vergelijker.start();
    });
    return $("#" + id + "_volmaken").click(function() {
      return vergelijker.full();
    });
  };

  glas_en_grafiek = function(sectionid, width, height, glass, options) {
    var filler, paper;
    paper = Raphael("" + sectionid + "_paper", width, height);
    return filler = new Filler(paper, 0, 0, glass, width, height, options);
  };

  toggle = function(activiteit_id) {
    var _this = this;
    $("#" + activiteit_id + " :first").click(function() {
      $("#" + activiteit_id + " section").toggle();
      return $("#" + activiteit_id + " section:first").scrollintoview();
    });
    return $("#" + activiteit_id + " section").hide();
  };

  $(document).ready(function() {
    vergelijk("vergelijk", 750, 750);
    toggle("vergelijk_article");
    glas_en_grafiek('cocktail', 1000, 700, cocktail_glas, {
      dimension: '2d',
      time: false,
      editable: true,
      buttons: ['manual_diff', 'show_ml'],
      components: ['ruler', 'tap', 'graph'],
      computer_graph: false,
      graph_buttons: ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'raster', 'computer']
    });
    toggle("cocktail_article");
    return $("#start").scrollintoview();
  });

}).call(this);
