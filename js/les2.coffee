
# Les 1
#

longdrink_json = '{"path":"M 346 152 l 0 345 l 0 36 l 0 24","foot":{"x":255,"y":557},"stem":{"x":255,"y":533},"bowl":{"x":255,"y":497},"edge":{"x":255,"y":152},"height_in_mm":133,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'
longdrink_smal_json = '{"path":"M 324 179 l 0 332 l 0 22 l 0 24","foot":{"x":255,"y":557},"stem":{"x":255,"y":533},"bowl":{"x":255,"y":511},"edge":{"x":255,"y":179},"height_in_mm":124,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'
longdrink_breed_json = '{"path":"M 429 153 l 0 385 l 0 17 l 0 2","foot":{"x":255,"y":557},"stem":{"x":255,"y":555},"bowl":{"x":255,"y":538},"edge":{"x":255,"y":153},"height_in_mm":133,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'
longdrink_vreemd_json = '{"path":"M 318 254 l 0 150 l 88 2 l 0 122 l 0 15 l 0 14","foot":{"x":255,"y":557},"stem":{"x":255,"y":543},"bowl":{"x":255,"y":528},"edge":{"x":255,"y":254},"height_in_mm":99,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'

send_answer = (les, activiteit, taak, antwoord) ->
  $.ajax
    url: 'stuur_taak_in.php'
    type: 'POST'
    data:
      les: les
      activiteit: activiteit
      taak: taak
      antwoord: antwoord
    success: (input) ->
      #
    error: (xhr, status) ->
      #
    complete: (xhr, status) ->
      #


longdrink_glas = new Glass longdrink_json
longdrink_glas2 = new Glass longdrink_json
smal_longdrink_glas = new Glass longdrink_smal_json
breed_longdrink_glas = new Glass longdrink_breed_json
vreemd_longdrink_glas = new Glass longdrink_vreemd_json


activiteiten = [
  {
    naam: 'introductie'
    type: 'vergelijk'
    glazen:
      [
        {
          model: longdrink_glas
          speed: 35
          time: true
        }, {
          model: smal_longdrink_glas
          speed: 35
          time: true
        }
      ]
    taken: [
      {
        type: 'vergelijk'
        open: true
        width: 600
        height: 650
        antwoord: null
      }
    ]
  }, {
    naam: 'tijdsnelheid'
    type: 'bepaal_snelheid'
    glas: longdrink_glas
    taken: [
      {
        type: 'meten'
        open: true
        width: 650
        height: 700
        antwoord: null
      }, {
        type: 'grafiek'
        open: false
        width: 800
        height: 700
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 800
        height: 700
        antwoord: null
      }, {
        type: 'bereken'
        open: false
        antwoord: null
      }
    ]
  }, {
    naam: 'volsnelheid'
    type: 'vergelijk'
    glazen:
      [
        {
          model: longdrink_glas
          speed: 35
          time: true
        }, {
          model: longdrink_glas2
          speed: 15
          time: true
        }
      ]
    taken: [
      {
        type: 'vergelijk'
        open: true
        width: 650
        height: 650
        antwoord: null
      }
    ]
  }, {
    naam: 'snelheid_longdrink'
    type: 'snelheid'
    glas: longdrink_glas
    taken: [
      {
        type: 'bepalen'
        open: true
        width: 800
        height: 700
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 800
        height: 700
        antwoord: null
      }
    ]
  }, {
    naam: 'snelheid_breed'
    type: 'snelheid'
    glas: breed_longdrink_glas
    taken: [
      {
        type: 'bepalen'
        open: true
        width: 950
        height: 700
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 950
        height: 700
        antwoord: null
      }
    ]
  }, {
    naam: 'snelheid_vreemd'
    type: 'snelheid'
    glas: vreemd_longdrink_glas
    taken: [
      {
        type: 'bepalen'
        open: true
        width: 900
        height: 700
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 900
        height: 700
        snelheid:
          breed: 0.0125
          smal: 0.0725
        antwoord: null
      }
    ]
  }, {
    naam: 'ontwerp_glas'
    type: 'ontwerp'
    taken: [
      {
        type: 'ontwerp'
        open: true
        width: 450
        height: 400
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 1000
        height: 700
        antwoord: null
      }
    ]
  }
]

create_paper = (activiteit_naam, taak) ->
  paper_id = "#{activiteit_naam}_#{taak.type}_paper"
  paper = Raphael paper_id, taak.width, taak.height
  paper

activiteit_tijdsnelheid = (les, activiteit_nr, activiteit, next = false) ->
  activiteit_naam = activiteit.naam
  meet_taak = activiteit.taken[0]
  grafiek_taak = activiteit.taken[1]
  controleer_taak = activiteit.taken[2]
  bereken_taak = activiteit.taken[3]

  meet_paper = create_paper activiteit_naam, meet_taak
  grafiek_paper = create_paper activiteit_naam, grafiek_taak
  controleer_paper = create_paper activiteit_naam, controleer_taak

  meet_filler = new Filler meet_paper,
    0,
    0,
    longdrink_glas,
    meet_taak.width,
    meet_taak.height,
      components: ['ruler', 'measure_lines', 'tap']
      buttons: []
      dimension: '2d'
      time: true
      editable: true
      fillable: true
      speed: 35

  grafiek_filler = controleer_filler = {}
  
  $("##{activiteit_naam}_#{meet_taak.type}_next").click =>
    maatbeker = meet_filler.glass.to_json()
    hoogte = []
    $tabelhoogte = $("##{activiteit_naam}_#{meet_taak.type}_tabel :input[name=hoogte]").each (index, elt) ->
      hoogte.push $(elt).val()
    volume = []
    $tabelvolume = $("##{activiteit_naam}_#{meet_taak.type}_tabel :input[name=volume]").each (index, elt) ->
      volume.push $(elt).val()

    antwoord =
      glas: maatbeker
      tabel:
        hoogte: hoogte
        volume: volume
    meet_taak.antwoord = JSON.stringify antwoord
    

    $("##{activiteit.naam}_#{grafiek_taak.type}").show().scrollintoview()
    grafiek_taak.open = true
    grafiek_paper.clear()
    grafiek_filler = new Filler grafiek_paper,
      0,
      0,
      longdrink_glas,
      grafiek_taak.width,
      grafiek_taak.height,
        components: ['ruler', 'measure_lines', 'tap', 'graph']
        buttons: []
        dimension: '2d'
        time: true
        editable: true
        fillable: true
        time_graph: true
        computer_graph: false
        speed: 35

  $("##{activiteit_naam}_#{grafiek_taak.type}_next").click =>
    grafiek = grafiek_filler.graph.user_line.to_json()

    antwoord =
      grafiek: grafiek
    grafiek_taak.antwoord = JSON.stringify antwoord
    
    
    $("##{activiteit.naam}_#{controleer_taak.type}").show().scrollintoview()
    controleer_taak.open = true
    controleer_paper.clear()
    controleer_filler = new Filler controleer_paper,
      0,
      0,
      longdrink_glas,
      controleer_taak.width,
      controleer_taak.height,
        components: ['ruler', 'measure_lines', 'tap', 'graph']
        buttons: []
        dimension: '2d'
        time: true
        editable: false
        fillable: true
        time_graph: true
        computer_graph: true
        speed: 35

    controleer_filler.graph.set_user_line grafiek_filler.graph.get_user_line()


  $("##{activiteit_naam}_#{controleer_taak.type}_next").click =>
    $("##{activiteit.naam}_#{bereken_taak.type}").show().scrollintoview()
    bereken_taak.open = true

  $("##{activiteit_naam}_#{bereken_taak.type}_next").click =>
    antwoord = $("##{activiteit.naam}_#{bereken_taak.type}_text").val()
    bereken_taak.antwoord = antwoord
    
    if next
      $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()



activiteit_ontwerp = (les, activiteit_nr, activiteit, next = false) ->
  activiteit_naam = activiteit.naam
  ontwerp_taak = activiteit.taken[0]
  controleer_taak = activiteit.taken[1]

  ontwerp_paper = create_paper activiteit_naam,  ontwerp_taak
  controleer_paper = create_paper activiteit_naam, controleer_taak

  grafter = new GlassGrafter ontwerp_paper,
    0,
    0,
    ontwerp_taak.width - 50,
    ontwerp_taak.height,
    0.33
  
  $("##{activiteit_naam}_#{ontwerp_taak.type}_next").click =>
    glas = grafter.get_contour().to_glass()
    ontwerp_taak.antwoord = glas.to_json()
    

    $("##{activiteit.naam}_#{controleer_taak.type}").show().scrollintoview()
    controleer_taak.open = true
    controleer_paper.clear()
    controleer_filler = new Filler controleer_paper,
      0,
      0,
      glas,
      controleer_taak.width,
      controleer_taak.height,
        components: ['ruler', 'measure_lines', 'tap', 'graph']
        buttons: []
        dimension: '2d'
        time: false
        editable: true
        fillable: true
        computer_graph: true
        speed: 35
    snelheid = (((glas.maximum_height-glas.bowl_start)/10) / glas.maximum_volume).toFixed(4)
    $("##{activiteit_naam}_#{controleer_taak.type}_antwoord").html snelheid

  $("##{activiteit.naam}_#{controleer_taak.type}_next").click =>
    
    antwoord = $("##{activiteit.naam}_#{controleer_taak.type}_text").val()
    controleer_taak.antwoord = antwoord
    
    
    $("#bedankt").show().scrollintoview()



    



  

activiteit_snelheid = (les, activiteit_nr, activiteit, next = false, snelheid = true) ->
  activiteit_naam = activiteit.naam
  bepaal_taak = activiteit.taken[0]
  controleer_taak = activiteit.taken[1]

  bepaal_paper = create_paper activiteit_naam, bepaal_taak
  controleer_paper = create_paper activiteit_naam, controleer_taak

  bepaal_filler = new Filler bepaal_paper,
      0,
      0,
      activiteit.glas,
      bepaal_taak.width,
      bepaal_taak.height,
        components: ['ruler', 'measure_lines', 'tap', 'graph']
        buttons: ['show_ml']
        dimension: '2d'
        time: false
        editable: true
        fillable: true
        speed: 35

  $("##{activiteit_naam}_#{bepaal_taak.type}_next").click =>
    maatbeker = bepaal_filler.glass.to_json()
    grafiek = bepaal_filler.graph.user_line.to_json()
    hoogte = []
    $tabelhoogte = $("##{activiteit_naam}_#{bepaal_taak.type}_tabel :input[name=hoogte]").each (index, elt) ->
      hoogte.push $(elt).val()
    volume = []
    $tabelvolume = $("##{activiteit_naam}_#{bepaal_taak.type}_tabel :input[name=volume]").each (index, elt) ->
      volume.push $(elt).val()
    input = $("##{activiteit_naam}_#{bepaal_taak.type}_input").val()

    antwoord =
      glas: maatbeker
      grafiek: grafiek
      tabel:
        hoogte: hoogte
        volume: volume
      snelheid: input
    bepaal_taak.antwoord = JSON.stringify antwoord
    

    $("##{activiteit.naam}_#{controleer_taak.type}").show().scrollintoview()
    controleer_taak.open = true
    controleer_paper.clear()
    controleer_filler = new Filler controleer_paper,
      0,
      0,
      activiteit.glas,
      controleer_taak.width,
      controleer_taak.height,
        components: ['ruler', 'measure_lines', 'tap', 'graph']
        buttons: []
        dimension: '2d'
        time: false
        editable: false
        fillable: true
        computer_graph: true
        speed: 35
    controleer_filler.graph.set_user_line bepaal_filler.graph.get_user_line()
    if snelheid
      snelheid = (((activiteit.glas.maximum_height-activiteit.glas.bowl_start)/10) / activiteit.glas.maximum_volume).toFixed(4)
      $("##{activiteit_naam}_#{controleer_taak.type}_antwoord").html snelheid

  $("##{activiteit.naam}_#{controleer_taak.type}_next").click =>
    
    antwoord = $("##{activiteit.naam}_#{controleer_taak.type}_text").val()
    controleer_taak.antwoord = antwoord
    
    if next
      $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()


activiteit_vergelijk = (les, activiteit_nr, activiteit, next = false) ->
  #vergelijkings activiteit
  #
  activiteit_naam = activiteit.naam
  taak = activiteit.taken[0]
  vergelijk_paper = create_paper activiteit_naam, taak
  vergelijker = new CompareFiller vergelijk_paper,
    0,
    0,
    activiteit.glazen,
    500,
    500,
      dimension: '2d'
      time: true
      editable: false

  # connect the all-buttons
  $("##{activiteit_naam}_#{taak.type}_leegmaken").click ->
    vergelijker.empty()
  $("##{activiteit_naam}_#{taak.type}_pauze").click ->
    vergelijker.pause()
  $("##{activiteit_naam}_#{taak.type}_vullen").click ->
    vergelijker.start()
  $("##{activiteit_naam}_#{taak.type}_volmaken").click ->
    vergelijker.full()

  $("##{activiteit_naam}_#{taak.type}_next").click ->
    antwoord = $("##{activiteit_naam}_#{taak.type}_text").val()
    json_antwoord = JSON.stringify antwoord
    

    if next
      $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()

     

activiteit_toggle = (activiteit) ->
  taken = activiteit.taken
  naam = activiteit.naam
  $("##{naam} :first").click =>
    for taak in taken
      if taak.open
        $("##{naam}_#{taak.type}").toggle().scrollintoview()


$(document).ready ->

  les = 2
  for activiteit, nr in activiteiten
    next = if nr < (activiteiten.length - 1) then activiteiten[(nr + 1)] else false
    switch activiteit.type
      when 'vergelijk'
        activiteit_vergelijk les, nr, activiteit, next

      when 'snelheid'
        if activiteit.naam is 'snelheid_vreemd'
          activiteit_snelheid les, nr, activiteit, next, false
        else
          activiteit_snelheid les, nr, activiteit, next, true

      when 'ontwerp'
        activiteit_ontwerp les, nr, activiteit, next

      when 'bepaal_snelheid'
        activiteit_tijdsnelheid les, nr, activiteit, next

    for taak in activiteit.taken
      $("##{activiteit.naam}_#{taak.type}").hide()

    activiteit_toggle activiteit

  $("#start").scrollintoview()

