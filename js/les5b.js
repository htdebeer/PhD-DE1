// Generated by CoffeeScript 1.4.0
(function() {
  var activiteit_toggle, create_paper, send_answer, snelheids_bereken_tabel, toggle_klassikaal, weergeven;

  send_answer = function(les, activiteit, taak, antwoord) {
    return $.ajax({
      url: 'stuur_taak_in.php',
      type: 'POST',
      data: {
        les: les,
        activiteit: activiteit,
        taak: taak,
        antwoord: antwoord
      },
      success: function(input) {},
      error: function(xhr, status) {},
      complete: function(xhr, status) {}
    });
  };

  create_paper = function(activiteit_naam, taak) {
    var paper, paper_id;
    paper_id = "" + activiteit_naam + "_" + taak.type + "_paper";
    paper = Raphael(paper_id, taak.width, taak.height);
    return paper;
  };

  activiteit_toggle = function(activiteit) {
    var naam, taken,
      _this = this;
    taken = activiteit.taken;
    naam = activiteit.naam;
    return $("#" + naam + " :first").click(function() {
      var taak, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = taken.length; _i < _len; _i++) {
        taak = taken[_i];
        if (taak.open) {
          _results.push($("#" + naam + "_" + taak.type).toggle().scrollintoview());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
  };

  snelheids_bereken_tabel = function(tabel_id) {
    var $height, $uitkomst, $volume;
    $height = $("#" + tabel_id + " input[name='height']");
    $volume = $("#" + tabel_id + " input[name='volume']");
    $uitkomst = $("#" + tabel_id + " input[name='uitkomst']");
    return $("#" + tabel_id + " button").click(function() {
      var floatregexp, height, speed, valid_height, valid_vol, volume;
      floatregexp = /^(([1-9]\d*([.,]\d+)?)|(0.\d+))$/;
      valid_height = false;
      valid_vol = false;
      if (floatregexp.test($height.val())) {
        $height.addClass("valid");
        $height.removeClass("invalid");
        valid_height = true;
      } else {
        $height.addClass("invalid");
        $height.removeClass("valid");
        $uitkomst.val('???');
      }
      if (floatregexp.test($volume.val())) {
        $volume.addClass("valid");
        $volume.removeClass("invalid");
        valid_vol = true;
      } else {
        $volume.addClass("invalid");
        $volume.removeClass("valid");
        $uitkomst.val('???');
      }
      if (valid_height && valid_vol) {
        height = parseFloat($height.val().replace(',', '.'));
        volume = parseFloat($volume.val().replace(',', '.'));
        speed = height / volume;
        if (isNaN(speed) || (speed === Infinity)) {
          return $uitkomst.val('???');
        } else if (speed !== Math.round(speed)) {
          return $uitkomst.val(speed.toPrecision(4).replace('.', ','));
        } else {
          return $uitkomst.val(speed.toPrecision(1));
        }
      }
    });
  };

  toggle_klassikaal = function(activiteit_id) {
    var _this = this;
    $("#" + activiteit_id + " :first").click(function() {
      $("#" + activiteit_id + " section").toggle();
      return $("#" + activiteit_id + " section:first").scrollintoview();
    });
    return $("#" + activiteit_id + " section").hide();
  };

  weergeven = function(inzending, grafiek_paper, oor_paper) {
    return $("#inzending_" + inzending.index).click(function() {
      var antwoord, glas_id, grafiekfiller, ontworpen_glas, oorspronkelijk_glas, oorspronkelijkfiller;
      $("#uitwerking_namen").html(inzending.leerlingen);
      $("#uitwerking_datum").html(inzending.datumtijd);
      glas_id = 1;
      if (inzending.groep % 4 === 0) {
        glas_id = 5;
      } else if (inzending.groep % 3 === 0) {
        glas_id = 4;
      } else if (inzending.groep % 2 === 0) {
        glas_id = 3;
      } else if (inzending.groep % 1 === 0) {
        glas_id = 2;
      } else {
        glas_id = 1;
      }
      oorspronkelijk_glas = new Glass(window.glazen[glas_id]);
      $("#uitwerking_opdracht_paper").html("<img src='glass_shapes/" + glas_id + "_graph.png' />");
      antwoord = inzending.antwoord;
      ontworpen_glas = new Glass(antwoord.glas);
      $("#uitwerking").show().scrollintoview();
      grafiek_paper.clear();
      grafiekfiller = new Filler(grafiek_paper, 0, 0, ontworpen_glas, 1200, 750, {
        dimension: '2d',
        editable: false,
        fillable: true,
        components: ['ruler', 'tap', 'graph'],
        computer_graph: true,
        speed_graph: true,
        time: false,
        speed: 50,
        hide_all_except_graph: false
      });
      oor_paper.clear();
      return oorspronkelijkfiller = new Filler(oor_paper, 0, 0, oorspronkelijk_glas, 1200, 750, {
        dimension: '2d',
        editable: false,
        fillable: true,
        components: ['ruler', 'tap', 'graph'],
        computer_graph: true,
        speed_graph: true,
        time: false,
        speed: 50,
        hide_all_except_graph: false
      });
    });
  };

  $(document).ready(function() {
    var grafiek_paper, grafiekfiller, inzending, les, ontwerp_grafter, ontwerp_paper, oor_paper, voorbeeldglas, _i, _len;
    if ((typeof window !== "undefined" && window !== null ? window.docent : void 0) && window.docent) {
      grafiek_paper = Raphael("uitwerking_ontworpen_glas_paper", 1200, 700);
      oor_paper = Raphael("uitwerking_oorspronkelijk_glas_paper", 1200, 700);
      for (_i = 0, _len = inzendingen.length; _i < _len; _i++) {
        inzending = inzendingen[_i];
        weergeven(inzending, grafiek_paper, oor_paper);
      }
      return $("#uitwerking").hide();
    } else {
      les = 5;
      voorbeeldglas = new Glass(glas.json);
      snelheids_bereken_tabel("ontwerp_glas_grafiek");
      grafiek_paper = Raphael("ontwerp_glas_grafiek_paper", 1200, 700);
      grafiekfiller = new Filler(grafiek_paper, 0, 0, voorbeeldglas, 1200, 750, {
        dimension: '2d',
        editable: true,
        fillable: false,
        components: ['ruler', 'tap', 'graph'],
        graph_buttons: ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'raster'],
        computer_graph: false,
        speed_graph: false,
        time: false,
        speed: 50,
        hide_all_except_graph: true
      });
      ontwerp_paper = Raphael("ontwerp_glas_ontwerp_paper", 650, 600);
      ontwerp_grafter = new GlassGrafter(ontwerp_paper, 0, 0, 600, 600, 0.33);
      return $('#ontwerp_glas_uitleg_next').click(function() {
        var antwoord, grafiek, json_antwoord, ontworpen_glas, uitleg;
        grafiek = grafiekfiller.graph.user_line;
        ontworpen_glas = ontwerp_grafter.get_contour().to_glass();
        uitleg = $("#ontwerp_glas_uitleg_text").val();
        antwoord = {
          grafiek: grafiek.to_json(),
          glas: ontworpen_glas.to_json(),
          uitleg: uitleg
        };
        json_antwoord = JSON.stringify(antwoord);
        return $("#ontwerp_glas_uitleg_bedankt").show();
      });
    }
  });

}).call(this);
