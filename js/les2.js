// Generated by CoffeeScript 1.4.0
(function() {
  var activiteit_ontwerp, activiteit_snelheid, activiteit_tijdsnelheid, activiteit_toggle, activiteit_vergelijk, activiteiten, breed_longdrink_glas, create_paper, longdrink_breed_json, longdrink_glas, longdrink_glas2, longdrink_json, longdrink_smal_json, longdrink_vreemd_json, send_answer, smal_longdrink_glas, vreemd_longdrink_glas;

  longdrink_json = '{"path":"M 346 152 l 0 345 l 0 36 l 0 24","foot":{"x":255,"y":557},"stem":{"x":255,"y":533},"bowl":{"x":255,"y":497},"edge":{"x":255,"y":152},"height_in_mm":133,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}';

  longdrink_smal_json = '{"path":"M 324 179 l 0 332 l 0 22 l 0 24","foot":{"x":255,"y":557},"stem":{"x":255,"y":533},"bowl":{"x":255,"y":511},"edge":{"x":255,"y":179},"height_in_mm":124,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}';

  longdrink_breed_json = '{"path":"M 429 153 l 0 385 l 0 17 l 0 2","foot":{"x":255,"y":557},"stem":{"x":255,"y":555},"bowl":{"x":255,"y":538},"edge":{"x":255,"y":153},"height_in_mm":133,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}';

  longdrink_vreemd_json = '{"path":"M 318 254 l 0 150 l 88 2 l 0 122 l 0 15 l 0 14","foot":{"x":255,"y":557},"stem":{"x":255,"y":543},"bowl":{"x":255,"y":528},"edge":{"x":255,"y":254},"height_in_mm":99,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}';

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

  longdrink_glas = new Glass(longdrink_json);

  longdrink_glas2 = new Glass(longdrink_json);

  smal_longdrink_glas = new Glass(longdrink_smal_json);

  breed_longdrink_glas = new Glass(longdrink_breed_json);

  vreemd_longdrink_glas = new Glass(longdrink_vreemd_json);

  activiteiten = [
    {
      naam: 'introductie',
      type: 'vergelijk',
      glazen: [
        {
          model: longdrink_glas,
          speed: 35,
          time: true
        }, {
          model: smal_longdrink_glas,
          speed: 35,
          time: true
        }
      ],
      taken: [
        {
          type: 'vergelijk',
          open: true,
          width: 600,
          height: 650,
          antwoord: null
        }
      ]
    }, {
      naam: 'tijdsnelheid',
      type: 'bepaal_snelheid',
      glas: longdrink_glas,
      taken: [
        {
          type: 'meten',
          open: true,
          width: 650,
          height: 700,
          antwoord: null
        }, {
          type: 'grafiek',
          open: false,
          width: 800,
          height: 700,
          antwoord: null
        }, {
          type: 'controleren',
          open: false,
          width: 800,
          height: 700,
          antwoord: null
        }, {
          type: 'bereken',
          open: false,
          antwoord: null
        }
      ]
    }, {
      naam: 'volsnelheid',
      type: 'vergelijk',
      glazen: [
        {
          model: longdrink_glas,
          speed: 35,
          time: true
        }, {
          model: longdrink_glas2,
          speed: 15,
          time: true
        }
      ],
      taken: [
        {
          type: 'vergelijk',
          open: true,
          width: 650,
          height: 650,
          antwoord: null
        }
      ]
    }, {
      naam: 'snelheid_longdrink',
      type: 'snelheid',
      glas: longdrink_glas,
      taken: [
        {
          type: 'bepalen',
          open: true,
          width: 800,
          height: 700,
          antwoord: null
        }, {
          type: 'controleren',
          open: false,
          width: 800,
          height: 700,
          antwoord: null
        }
      ]
    }, {
      naam: 'snelheid_breed',
      type: 'snelheid',
      glas: breed_longdrink_glas,
      taken: [
        {
          type: 'bepalen',
          open: true,
          width: 950,
          height: 700,
          antwoord: null
        }, {
          type: 'controleren',
          open: false,
          width: 950,
          height: 700,
          antwoord: null
        }
      ]
    }, {
      naam: 'snelheid_vreemd',
      type: 'snelheid',
      glas: vreemd_longdrink_glas,
      taken: [
        {
          type: 'bepalen',
          open: true,
          width: 900,
          height: 700,
          antwoord: null
        }, {
          type: 'controleren',
          open: false,
          width: 900,
          height: 700,
          snelheid: {
            breed: 0.0125,
            smal: 0.0725
          },
          antwoord: null
        }
      ]
    }, {
      naam: 'ontwerp_glas',
      type: 'ontwerp',
      taken: [
        {
          type: 'ontwerp',
          open: true,
          width: 450,
          height: 400,
          antwoord: null
        }, {
          type: 'controleren',
          open: false,
          width: 1000,
          height: 700,
          antwoord: null
        }
      ]
    }
  ];

  create_paper = function(activiteit_naam, taak) {
    var paper, paper_id;
    paper_id = "" + activiteit_naam + "_" + taak.type + "_paper";
    paper = Raphael(paper_id, taak.width, taak.height);
    return paper;
  };

  activiteit_tijdsnelheid = function(les, activiteit_nr, activiteit, next) {
    var activiteit_naam, bereken_taak, controleer_filler, controleer_paper, controleer_taak, grafiek_filler, grafiek_paper, grafiek_taak, meet_filler, meet_paper, meet_taak,
      _this = this;
    if (next == null) {
      next = false;
    }
    activiteit_naam = activiteit.naam;
    meet_taak = activiteit.taken[0];
    grafiek_taak = activiteit.taken[1];
    controleer_taak = activiteit.taken[2];
    bereken_taak = activiteit.taken[3];
    meet_paper = create_paper(activiteit_naam, meet_taak);
    grafiek_paper = create_paper(activiteit_naam, grafiek_taak);
    controleer_paper = create_paper(activiteit_naam, controleer_taak);
    meet_filler = new Filler(meet_paper, 0, 0, longdrink_glas, meet_taak.width, meet_taak.height, {
      components: ['ruler', 'measure_lines', 'tap'],
      buttons: [],
      dimension: '2d',
      time: true,
      editable: true,
      fillable: true,
      speed: 35
    });
    grafiek_filler = controleer_filler = {};
    $("#" + activiteit_naam + "_" + meet_taak.type + "_next").click(function() {
      var $tabelhoogte, $tabelvolume, antwoord, hoogte, maatbeker, volume;
      maatbeker = meet_filler.glass.to_json();
      hoogte = [];
      $tabelhoogte = $("#" + activiteit_naam + "_" + meet_taak.type + "_tabel :input[name=hoogte]").each(function(index, elt) {
        return hoogte.push($(elt).val());
      });
      volume = [];
      $tabelvolume = $("#" + activiteit_naam + "_" + meet_taak.type + "_tabel :input[name=volume]").each(function(index, elt) {
        return volume.push($(elt).val());
      });
      antwoord = {
        glas: maatbeker,
        tabel: {
          hoogte: hoogte,
          volume: volume
        }
      };
      meet_taak.antwoord = JSON.stringify(antwoord);
      $("#" + activiteit.naam + "_" + grafiek_taak.type).show().scrollintoview();
      grafiek_taak.open = true;
      grafiek_paper.clear();
      return grafiek_filler = new Filler(grafiek_paper, 0, 0, longdrink_glas, grafiek_taak.width, grafiek_taak.height, {
        components: ['ruler', 'measure_lines', 'tap', 'graph'],
        buttons: [],
        dimension: '2d',
        time: true,
        editable: true,
        fillable: true,
        time_graph: true,
        computer_graph: false,
        speed: 35
      });
    });
    $("#" + activiteit_naam + "_" + grafiek_taak.type + "_next").click(function() {
      var antwoord, grafiek;
      grafiek = grafiek_filler.graph.user_line.to_json();
      antwoord = {
        grafiek: grafiek
      };
      grafiek_taak.antwoord = JSON.stringify(antwoord);
      $("#" + activiteit.naam + "_" + controleer_taak.type).show().scrollintoview();
      controleer_taak.open = true;
      controleer_paper.clear();
      controleer_filler = new Filler(controleer_paper, 0, 0, longdrink_glas, controleer_taak.width, controleer_taak.height, {
        components: ['ruler', 'measure_lines', 'tap', 'graph'],
        buttons: [],
        dimension: '2d',
        time: true,
        editable: false,
        fillable: true,
        time_graph: true,
        computer_graph: true,
        speed: 35
      });
      return controleer_filler.graph.set_user_line(grafiek_filler.graph.get_user_line());
    });
    $("#" + activiteit_naam + "_" + controleer_taak.type + "_next").click(function() {
      $("#" + activiteit.naam + "_" + bereken_taak.type).show().scrollintoview();
      return bereken_taak.open = true;
    });
    return $("#" + activiteit_naam + "_" + bereken_taak.type + "_next").click(function() {
      var antwoord;
      antwoord = $("#" + activiteit.naam + "_" + bereken_taak.type + "_text").val();
      bereken_taak.antwoord = antwoord;
      if (next) {
        return $("#" + next.naam + "_" + next.taken[0].type).show().scrollintoview();
      }
    });
  };

  activiteit_ontwerp = function(les, activiteit_nr, activiteit, next) {
    var activiteit_naam, controleer_paper, controleer_taak, grafter, ontwerp_paper, ontwerp_taak,
      _this = this;
    if (next == null) {
      next = false;
    }
    activiteit_naam = activiteit.naam;
    ontwerp_taak = activiteit.taken[0];
    controleer_taak = activiteit.taken[1];
    ontwerp_paper = create_paper(activiteit_naam, ontwerp_taak);
    controleer_paper = create_paper(activiteit_naam, controleer_taak);
    grafter = new GlassGrafter(ontwerp_paper, 0, 0, ontwerp_taak.width - 50, ontwerp_taak.height, 0.33);
    $("#" + activiteit_naam + "_" + ontwerp_taak.type + "_next").click(function() {
      var controleer_filler, glas, snelheid;
      glas = grafter.get_contour().to_glass();
      ontwerp_taak.antwoord = glas.to_json();
      $("#" + activiteit.naam + "_" + controleer_taak.type).show().scrollintoview();
      controleer_taak.open = true;
      controleer_paper.clear();
      controleer_filler = new Filler(controleer_paper, 0, 0, glas, controleer_taak.width, controleer_taak.height, {
        components: ['ruler', 'measure_lines', 'tap', 'graph'],
        buttons: [],
        dimension: '2d',
        time: false,
        editable: true,
        fillable: true,
        computer_graph: true,
        speed: 35
      });
      snelheid = (((glas.maximum_height - glas.bowl_start) / 10) / glas.maximum_volume).toFixed(4);
      return $("#" + activiteit_naam + "_" + controleer_taak.type + "_antwoord").html(snelheid);
    });
    return $("#" + activiteit.naam + "_" + controleer_taak.type + "_next").click(function() {
      var antwoord;
      antwoord = $("#" + activiteit.naam + "_" + controleer_taak.type + "_text").val();
      controleer_taak.antwoord = antwoord;
      return $("#bedankt").show().scrollintoview();
    });
  };

  activiteit_snelheid = function(les, activiteit_nr, activiteit, next, snelheid) {
    var activiteit_naam, bepaal_filler, bepaal_paper, bepaal_taak, controleer_paper, controleer_taak,
      _this = this;
    if (next == null) {
      next = false;
    }
    if (snelheid == null) {
      snelheid = true;
    }
    activiteit_naam = activiteit.naam;
    bepaal_taak = activiteit.taken[0];
    controleer_taak = activiteit.taken[1];
    bepaal_paper = create_paper(activiteit_naam, bepaal_taak);
    controleer_paper = create_paper(activiteit_naam, controleer_taak);
    bepaal_filler = new Filler(bepaal_paper, 0, 0, activiteit.glas, bepaal_taak.width, bepaal_taak.height, {
      components: ['ruler', 'measure_lines', 'tap', 'graph'],
      buttons: ['show_ml'],
      dimension: '2d',
      time: false,
      editable: true,
      fillable: true,
      speed: 35
    });
    $("#" + activiteit_naam + "_" + bepaal_taak.type + "_next").click(function() {
      var $tabelhoogte, $tabelvolume, antwoord, controleer_filler, grafiek, hoogte, input, maatbeker, volume;
      maatbeker = bepaal_filler.glass.to_json();
      grafiek = bepaal_filler.graph.user_line.to_json();
      hoogte = [];
      $tabelhoogte = $("#" + activiteit_naam + "_" + bepaal_taak.type + "_tabel :input[name=hoogte]").each(function(index, elt) {
        return hoogte.push($(elt).val());
      });
      volume = [];
      $tabelvolume = $("#" + activiteit_naam + "_" + bepaal_taak.type + "_tabel :input[name=volume]").each(function(index, elt) {
        return volume.push($(elt).val());
      });
      input = $("#" + activiteit_naam + "_" + bepaal_taak.type + "_input").val();
      antwoord = {
        glas: maatbeker,
        grafiek: grafiek,
        tabel: {
          hoogte: hoogte,
          volume: volume
        },
        snelheid: input
      };
      bepaal_taak.antwoord = JSON.stringify(antwoord);
      $("#" + activiteit.naam + "_" + controleer_taak.type).show().scrollintoview();
      controleer_taak.open = true;
      controleer_paper.clear();
      controleer_filler = new Filler(controleer_paper, 0, 0, activiteit.glas, controleer_taak.width, controleer_taak.height, {
        components: ['ruler', 'measure_lines', 'tap', 'graph'],
        buttons: [],
        dimension: '2d',
        time: false,
        editable: false,
        fillable: true,
        computer_graph: true,
        speed: 35
      });
      controleer_filler.graph.set_user_line(bepaal_filler.graph.get_user_line());
      if (snelheid) {
        snelheid = (((activiteit.glas.maximum_height - activiteit.glas.bowl_start) / 10) / activiteit.glas.maximum_volume).toFixed(4);
        return $("#" + activiteit_naam + "_" + controleer_taak.type + "_antwoord").html(snelheid);
      }
    });
    return $("#" + activiteit.naam + "_" + controleer_taak.type + "_next").click(function() {
      var antwoord;
      antwoord = $("#" + activiteit.naam + "_" + controleer_taak.type + "_text").val();
      controleer_taak.antwoord = antwoord;
      if (next) {
        return $("#" + next.naam + "_" + next.taken[0].type).show().scrollintoview();
      }
    });
  };

  activiteit_vergelijk = function(les, activiteit_nr, activiteit, next) {
    var activiteit_naam, taak, vergelijk_paper, vergelijker;
    if (next == null) {
      next = false;
    }
    activiteit_naam = activiteit.naam;
    taak = activiteit.taken[0];
    vergelijk_paper = create_paper(activiteit_naam, taak);
    vergelijker = new CompareFiller(vergelijk_paper, 0, 0, activiteit.glazen, 500, 500, {
      dimension: '2d',
      time: true,
      editable: false
    });
    $("#" + activiteit_naam + "_" + taak.type + "_leegmaken").click(function() {
      return vergelijker.empty();
    });
    $("#" + activiteit_naam + "_" + taak.type + "_pauze").click(function() {
      return vergelijker.pause();
    });
    $("#" + activiteit_naam + "_" + taak.type + "_vullen").click(function() {
      return vergelijker.start();
    });
    $("#" + activiteit_naam + "_" + taak.type + "_volmaken").click(function() {
      return vergelijker.full();
    });
    return $("#" + activiteit_naam + "_" + taak.type + "_next").click(function() {
      var antwoord, json_antwoord;
      antwoord = $("#" + activiteit_naam + "_" + taak.type + "_text").val();
      json_antwoord = JSON.stringify(antwoord);
      if (next) {
        return $("#" + next.naam + "_" + next.taken[0].type).show().scrollintoview();
      }
    });
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

  $(document).ready(function() {
    var activiteit, les, next, nr, taak, _i, _j, _len, _len1, _ref;
    les = 2;
    for (nr = _i = 0, _len = activiteiten.length; _i < _len; nr = ++_i) {
      activiteit = activiteiten[nr];
      next = nr < (activiteiten.length - 1) ? activiteiten[nr + 1] : false;
      switch (activiteit.type) {
        case 'vergelijk':
          activiteit_vergelijk(les, nr, activiteit, next);
          break;
        case 'snelheid':
          if (activiteit.naam === 'snelheid_vreemd') {
            activiteit_snelheid(les, nr, activiteit, next, false);
          } else {
            activiteit_snelheid(les, nr, activiteit, next, true);
          }
          break;
        case 'ontwerp':
          activiteit_ontwerp(les, nr, activiteit, next);
          break;
        case 'bepaal_snelheid':
          activiteit_tijdsnelheid(les, nr, activiteit, next);
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
