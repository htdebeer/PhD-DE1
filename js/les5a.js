// Generated by CoffeeScript 1.4.0
(function() {
  var activiteit_toggle, activiteiten, create_paper, glas_en_grafiek, knmigrafiek, mei_temp, racebaan, rondbodemkolf, rondbodemkolf2, rondbodemkolf_json, send_answer, snelheids_bereken_tabel, stijgsnelheid_grafiek_activiteit, toggle_klassikaal;

  mei_temp = "370,20120531,   24,  125\n370,20120601,    1,  127\n370,20120601,    2,  123\n370,20120601,    3,  120\n370,20120601,    4,  109\n370,20120601,    5,  116\n370,20120601,    6,  127\n370,20120601,    7,  139\n370,20120601,    8,  153\n370,20120601,    9,  153\n370,20120601,   10,  158\n370,20120601,   11,  146\n370,20120601,   12,  139\n370,20120601,   13,  165\n370,20120601,   14,  170\n370,20120601,   15,  156\n370,20120601,   16,  163\n370,20120601,   17,  163\n370,20120601,   18,  153\n370,20120601,   19,  144\n370,20120601,   20,  128\n370,20120601,   21,  129\n370,20120601,   22,  124\n370,20120601,   23,  118\n370,20120601,   24,  115\n370,20120602,    1,   91\n370,20120602,    2,   71\n370,20120602,    3,   60\n370,20120602,    4,   58\n370,20120602,    5,   74\n370,20120602,    6,  113\n370,20120602,    7,  126\n370,20120602,    8,  132\n370,20120602,    9,  145\n370,20120602,   10,  148\n370,20120602,   11,  167\n370,20120602,   12,  166\n370,20120602,   13,  181\n370,20120602,   14,  175\n370,20120602,   15,  177\n370,20120602,   16,  175\n370,20120602,   17,  165\n370,20120602,   18,  155\n370,20120602,   19,  142\n370,20120602,   20,  126\n370,20120602,   21,  131\n370,20120602,   22,  127\n370,20120602,   23,  125\n370,20120602,   24,  119\n370,20120603,    1,  114\n370,20120603,    2,  105\n370,20120603,    3,   96\n370,20120603,    4,   90\n370,20120603,    5,   87\n370,20120603,    6,   86\n370,20120603,    7,   86\n370,20120603,    8,   87\n370,20120603,    9,   90\n370,20120603,   10,   93\n370,20120603,   11,   94\n370,20120603,   12,   98\n370,20120603,   13,   96\n370,20120603,   14,   93\n370,20120603,   15,   92\n370,20120603,   16,   91\n370,20120603,   17,   94\n370,20120603,   18,   89\n370,20120603,   19,   87\n370,20120603,   20,   87\n370,20120603,   21,   88\n370,20120603,   22,   87\n370,20120603,   23,   86\n370,20120603,   24,   87\n370,20120604,    1,   85\n370,20120604,    2,   86\n370,20120604,    3,   86\n370,20120604,    4,   86\n370,20120604,    5,   88\n370,20120604,    6,   91\n370,20120604,    7,   93\n370,20120604,    8,   97\n370,20120604,    9,  103\n370,20120604,   10,  108\n370,20120604,   11,  103\n370,20120604,   12,   97\n370,20120604,   13,   90\n370,20120604,   14,   85\n370,20120604,   15,   82\n370,20120604,   16,   94\n370,20120604,   17,  103\n370,20120604,   18,   96\n370,20120604,   19,   95\n370,20120604,   20,   91\n370,20120604,   21,   88\n370,20120604,   22,   77\n370,20120604,   23,   61\n370,20120604,   24,   52";

  rondbodemkolf_json = '{"path":"M 315 73 l 0 161 c 192 45.75 192 262.25 -4 319 l -13 2 l -10 2","foot":{"x":255,"y":557},"stem":{"x":255,"y":555},"bowl":{"x":255,"y":553},"edge":{"x":255,"y":73},"height_in_mm":159,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}';

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

  rondbodemkolf = new Glass(rondbodemkolf_json);

  rondbodemkolf2 = new Glass(rondbodemkolf_json);

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

  glas_en_grafiek = function(sectionid, width, height, glass, options) {
    var filler, paper;
    paper = Raphael("" + sectionid + "_paper", width, height);
    return filler = new Filler(paper, 0, 0, glass, width, height, options);
  };

  racebaan = function(sectionid, width, height, track, options) {
    var paper, trackracer;
    paper = Raphael("" + sectionid + "_paper", width, height);
    return trackracer = new TrackRacer(paper, 0, 0, track, width, height, options);
  };

  knmigrafiek = function(sectionid, width, height, x_axis, y_axis, knmi_data) {
    var graph, paper;
    paper = Raphael("" + sectionid + "_paper", width, height);
    return graph = new KNMIGrapher(paper, 0, 0, width, height, x_axis, y_axis, knmi_data);
  };

  toggle_klassikaal = function(activiteit_id) {
    var _this = this;
    $("#" + activiteit_id + " :first").click(function() {
      $("#" + activiteit_id + " section").toggle();
      return $("#" + activiteit_id + " section:first").scrollintoview();
    });
    return $("#" + activiteit_id + " section").hide();
  };

  activiteiten = [
    {
      naam: 'stijgsnelheid_grafiek',
      type: 'stijgsnelheid_grafiek',
      glas: rondbodemkolf,
      next: false,
      taken: [
        {
          type: 'meten',
          open: true,
          width: 1200,
          height: 750,
          antwoord: null
        }, {
          type: 'tekenen',
          open: false,
          width: 1200,
          height: 750,
          antwoord: null
        }, {
          type: 'controleren',
          open: false,
          width: 1200,
          height: 750,
          antwoord: null
        }
      ]
    }
  ];

  stijgsnelheid_grafiek_activiteit = function(les, activiteit, next) {
    var activiteit_naam, controleren_filler, controleren_paper, controleren_taak, meten_filler, meten_paper, meten_taak, tekenen_filler, tekenen_paper, tekenen_taak;
    activiteit_naam = activiteit.naam;
    meten_taak = activiteit.taken[0];
    tekenen_taak = activiteit.taken[1];
    controleren_taak = activiteit.taken[2];
    meten_paper = create_paper(activiteit_naam, meten_taak);
    tekenen_paper = create_paper(activiteit_naam, tekenen_taak);
    controleren_paper = create_paper(activiteit_naam, controleren_taak);
    snelheids_bereken_tabel("" + activiteit_naam + "_" + meten_taak.type + "_tabel");
    meten_filler = new Filler(meten_paper, 0, 0, activiteit.glas, meten_taak.width, meten_taak.height, {
      components: ['ruler', 'tap', 'graph'],
      buttons: ['manual_diff'],
      graph_buttons: ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'raster'],
      dimension: '2d',
      time: false,
      editable: true,
      fillable: true,
      computer_graph: true,
      speed: 50
    });
    tekenen_filler = controleren_filler = {};
    $("#" + activiteit_naam + "_" + meten_taak.type + "_next").click(function() {
      var $tabelstijgsnelheid, $tabelvolume, antwoord, json_antwoord, stijgsnelheid, volume;
      tekenen_taak.open = true;
      stijgsnelheid = [];
      $tabelstijgsnelheid = $("#" + activiteit_naam + "_" + meten_taak.type + "_meettabel :input[name=stijgsnelheid]").each(function(index, elt) {
        return stijgsnelheid.push($(elt).val());
      });
      volume = [];
      $tabelvolume = $("#" + activiteit_naam + "_" + meten_taak.type + "_meettabel :input[name=volume]").each(function(index, elt) {
        return volume.push($(elt).val());
      });
      antwoord = {
        tabel: {
          stijgsnelheid: stijgsnelheid,
          volume: volume
        }
      };
      meten_taak.antwoord = antwoord;
      json_antwoord = JSON.stringify(antwoord);
      $("#" + activiteit_naam + "_" + tekenen_taak.type).show().scrollintoview();
      tekenen_paper.clear();
      return tekenen_filler = new Filler(tekenen_paper, 0, 0, rondbodemkolf2, tekenen_taak.width, tekenen_taak.height, {
        components: ['ruler', 'tap', 'graph'],
        dimension: '2d',
        time: false,
        editable: true,
        fillable: true,
        computer_graph: false,
        speed: 50,
        speed_graph: true
      });
    });
    $("#" + activiteit_naam + "_" + tekenen_taak.type + "_next").click(function() {
      var antwoord, json_antwoord;
      controleren_taak.open = true;
      antwoord = tekenen_filler.graph.user_line;
      json_antwoord = antwoord.to_json();
      tekenen_taak.antwoord = antwoord;
      $("#" + activiteit_naam + "_" + controleren_taak.type).show().scrollintoview();
      controleren_paper.clear();
      activiteit.glas.make_empty();
      controleren_filler = new Filler(controleren_paper, 0, 0, rondbodemkolf2, controleren_taak.width, controleren_taak.height, {
        components: ['ruler', 'tap', 'graph'],
        editable: false,
        computer_graph: true,
        time: false,
        fillable: true,
        speed: 50,
        speed_graph: true,
        buttons: ['manual_diff']
      });
      return controleren_filler.graph.set_user_line(antwoord);
    });
    return $("#" + activiteit_naam + "_" + controleren_taak.type + "_next").click(function() {
      var antwoord, json_antwoord;
      antwoord = $("#" + activiteit_naam + "_" + controleren_taak.type + "_text").val();
      json_antwoord = JSON.stringify(antwoord);
      controleren_taak.antwoord = antwoord;
      if (next) {
        return $("#" + next.naam + "_" + next.taken[0].type).show().scrollintoview();
      } else {
        return $("#" + activiteit_naam + "_" + controleren_taak.type + "_bedankt").show();
      }
    });
  };

  $(document).ready(function() {
    var activiteit, les, next, nr, taak, _i, _j, _len, _len1, _ref;
    les = 5;
    snelheids_bereken_tabel("race_baan_meten");
    racebaan("race_baan_meten", 1200, 800, {
      path: "h-150a100,100,1,1,0,0,200h25a50,50,1,1,0,0,-100h-30a25,25,1,1,1,0,-50h100a15,15,0,0,1,15,15v100a25,25,1,0,0,25,25h50a25,25,1,0,0,25,-25v-115a50,50,1,0,0,-50,-50z",
      move_x: 270,
      meter_per_pixel: 0.01,
      ticks: "0.1tttttttttT",
      accelerationpath: '0.1|5,-0.2|7.5,1|14'
    }, {});
    toggle_klassikaal("race_baan");
    snelheids_bereken_tabel("temperatuur_grafiek_meten");
    knmigrafiek("temperatuur_grafiek_meten", 700, 700, {
      label: "uren tussen 1 en 4 juni (uur)",
      quantity: "uren",
      symbol: "uur",
      tickspath: "3tttTtttL"
    }, {
      label: "temperatuur (°C)",
      quantity: "graden Celsius",
      symbol: "°C"
    }, mei_temp);
    toggle_klassikaal("temperatuur_grafiek");
    snelheids_bereken_tabel("snelheidsgrafiek_controleren");
    glas_en_grafiek("snelheidsgrafiek_controleren", 1200, 750, rondbodemkolf2, {
      dimension: '2d',
      editable: true,
      fillable: true,
      components: ['ruler', 'tap', 'graph'],
      graph_buttons: ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'raster'],
      computer_graph: true,
      speed_graph: true,
      time: false,
      speed: 50
    });
    toggle_klassikaal("snelheidsgrafiek");
    for (nr = _i = 0, _len = activiteiten.length; _i < _len; nr = ++_i) {
      activiteit = activiteiten[nr];
      next = nr < (activiteiten.length - 1) ? activiteiten[nr + 1] : false;
      next = activiteit.next ? next : false;
      switch (activiteit.type) {
        case 'stijgsnelheid_grafiek':
          stijgsnelheid_grafiek_activiteit(les, activiteit, next);
      }
      _ref = activiteit.taken;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        taak = _ref[_j];
        $("#" + activiteit.naam + "_" + taak.type).hide();
      }
      activiteit_toggle(activiteit);
    }
    return $("#start").scrollintoview();
  });

}).call(this);