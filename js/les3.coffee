
# Les 3 
#

longdrink_json = '{"path":"M 346 152 l 0 345 l 0 36 l 0 24","foot":{"x":255,"y":557},"stem":{"x":255,"y":533},"bowl":{"x":255,"y":497},"edge":{"x":255,"y":152},"height_in_mm":133,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'
longdrink_smal_json = '{"path":"M 324 179 l 0 332 l 0 22 l 0 24","foot":{"x":255,"y":557},"stem":{"x":255,"y":533},"bowl":{"x":255,"y":511},"edge":{"x":255,"y":179},"height_in_mm":124,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'
longdrink_breed_json = '{"path":"M 429 153 l 0 385 l 0 17 l 0 2","foot":{"x":255,"y":557},"stem":{"x":255,"y":555},"bowl":{"x":255,"y":538},"edge":{"x":255,"y":153},"height_in_mm":133,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'
longdrink_vreemd_json = '{"path":"M 318 254 l 0 150 l 88 2 l 0 122 l 0 15 l 0 14","foot":{"x":255,"y":557},"stem":{"x":255,"y":543},"bowl":{"x":255,"y":528},"edge":{"x":255,"y":254},"height_in_mm":99,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'
cocktail_json = '{"path":"M 419 102 l -152 245 l 0 185 c 0 23.25 101 11.75 106 25","foot":{"x":255,"y":557},"stem":{"x":255,"y":532},"bowl":{"x":255,"y":347},"edge":{"x":255,"y":102},"height_in_mm":150,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'
wijn_json = '{"path":"M 361 123 c 21 92.75 1 176.25 -90 255 l 0 164 l 89 15","foot":{"x":255,"y":557},"stem":{"x":255,"y":542},"bowl":{"x":255,"y":378},"edge":{"x":255,"y":123},"height_in_mm":143,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'
erlenmeyer_json = '{"path":"M 307 103 l 0 123 l 100 299 c 10 25 9.5 26 -63 28 l -1 2 l 2 2","foot":{"x":255,"y":557},"stem":{"x":255,"y":555},"bowl":{"x":255,"y":553},"edge":{"x":255,"y":103},"height_in_mm":149,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'
vreemde_vaas_json = '{"path":"M 319 265 c -32 10.25 -35 30.75 -6 41 l 88 2 l 0 52 l 70 2 l 0 32 l -105 2 l 0 66 l 38 2 l 0 28 l -134 2 c -7.5 10.75 -10.5 32.25 -6 43 c -4.5 5 182.5 10 166 20","foot":{"x":255,"y":557},"stem":{"x":255,"y":537},"bowl":{"x":255,"y":494},"edge":{"x":255,"y":265},"height_in_mm":96,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'


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
smal_longdrink_glas = new Glass longdrink_smal_json
breed_longdrink_glas = new Glass longdrink_breed_json
vreemd_longdrink_glas = new Glass longdrink_vreemd_json
cocktail_glas = new Glass cocktail_json
wijn_glas = new Glass wijn_json
erlenmeyer_glas = new Glass erlenmeyer_json
vreemde_vaas = new Glass vreemde_vaas_json

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


snelheids_bereken_tabel = (tabel_id) ->
  $height = $("##{tabel_id} input[name='height']")
  $volume = $("##{tabel_id} input[name='volume']")
  $uitkomst = $("##{tabel_id} input[name='uitkomst']")

  $("##{tabel_id} button").click ->

    # validate input
    floatregexp = /^(([1-9]\d*([.,]\d+)?)|(0.\d+))$/

    valid_height = false
    valid_vol = false
    if floatregexp.test $height.val()
      $height.addClass "valid"
      $height.removeClass "invalid"
      valid_height = true
    else
      $height.addClass "invalid"
      $height.removeClass "valid"
      $uitkomst.val '???'


    if floatregexp.test $volume.val()
      $volume.addClass "valid"
      $volume.removeClass "invalid"
      valid_vol = true
    else
      $volume.addClass "invalid"
      $volume.removeClass "valid"
      $uitkomst.val '???'

    if valid_height and valid_vol
      # if input is okay
      # compute answer
      height = parseFloat $height.val().replace(',','.')
      volume = parseFloat $volume.val().replace(',', '.')
      speed = height / volume

      if isNaN(speed) or (speed is Infinity)
        $uitkomst.val '???'
      else if speed isnt Math.round(speed)
        $uitkomst.val speed.toPrecision(4).replace('.', ',')
      else
        $uitkomst.val speed.toPrecision(1)

glas_en_grafiek = (sectionid, width, height, glass, options) ->
  paper = Raphael "#{sectionid}_paper", width, height
  filler = new Filler paper,
    0,
    0,
    glass,
    width,
    height,
    options

glas_vergelijking = (sectionid, width, height, glazen, options) ->
  paper = Raphael "#{sectionid}_paper", width, height
  filler = new CompareFiller paper,
    0,
    0,
    glazen,
    width,
    height,
    options

glas = (sectionid, width, height, glass, options) ->
  paper = Raphael "#{sectionid}_paper", width, height
  filler = new Filler paper,
    0,
    0,
    glass,
    width,
    height,
    options

toggle_klassikaal = (activiteit_id) ->
  $("##{activiteit_id} :first").click =>
    $("##{activiteit_id} section").toggle()
    $("##{activiteit_id} section:first").scrollintoview()
  $("##{activiteit_id} section").hide()


activiteiten = [
  {
    naam: 'stijgsnelheid_brede_bak'
    type: 'bereken_stijgsnelheid'
    glas: breed_longdrink_glas
    next: true
    taken: [
      {
        type: 'berekenen'
        open: true
        width: 700
        height: 640
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        antwoord: null
      }
    ]
  }, {
    naam: 'stijgsnelheid_vreemd_glas'
    type: 'grafiek_bereken_snelheid'
    glas: vreemd_longdrink_glas
    next: true
    taken: [
      {
        type: 'berekenen'
        open: true
        width: 1000
        height: 600
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 1000
        height: 600
        antwoord: null
      }
    ]
  }, {
    naam: 'stijgsnelheid_vreemde_vaas'
    type: 'grafiek_bereken_snelheid'
    glas: vreemde_vaas
    next: false
    taken: [
      {
        type: 'berekenen'
        open: true
        width: 1100
        height: 600
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 1100
        height: 600
        antwoord: null
      }
    ]
  }, {
    naam: 'stijgsnelheid_cocktail_glas'
    type: 'grafiek_bereken_snelheid'
    glas: cocktail_glas
    next: false
    taken: [
      {
        type: 'berekenen'
        open: true
        width: 1000
        height: 700
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 1000
        height: 700
        antwoord: null
      }
    ]
  }, {
    naam: 'wijnglas'
    type: 'stijgsnelheid_meten'
    glas: wijn_glas
    next: true
    taken: [
      {
        type: 'meten'
        open: true
        width: 500
        height: 700
        antwoord: null
      }
    ]
  }, {
    naam: 'erlenmeyer'
    type: 'stijgsnelheid_meten'
    glas: erlenmeyer_glas
    next: false
    taken: [
      {
        type: 'meten'
        open: true
        width: 500
        height: 700
        antwoord: null
      }
    ]
  }
]

stijgsnelheid_meten_activiteit = (les, activiteit, next = false, options = {}) ->
  activiteit_naam = activiteit.naam
  meet_taak = activiteit.taken[0]

  meet_paper = create_paper activiteit_naam, meet_taak

  snelheids_bereken_tabel "#{activiteit_naam}_#{meet_taak.type}_tabel"

  meet_glas = new Filler meet_paper,
    0,
    0,
    activiteit.glas,
    meet_taak.width,
    meet_taak.height,
      components: ['ruler', 'tap']
      editable: false
      time: false
      fillable: true
      buttons: ['manual_diff']

    $("##{activiteit_naam}_#{meet_taak.type}_next").click ->
      antwoord = $("##{activiteit_naam}_#{meet_taak.type}_text").val()
      json_antwoord = JSON.stringify antwoord
      meet_taak.antwoord = antwoord
      

      if next
        $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()
      else
        $("#bedankt").show().scrollintoview()


grafiek_bereken_snelheid_activiteit = (les, activiteit, next = false, options = {}) ->
  activiteit_naam = activiteit.naam
  berekenen_taak = activiteit.taken[0]
  controleren_taak = activiteit.taken[1]

  berekenen_paper = create_paper activiteit_naam, berekenen_taak
  controleren_paper = create_paper activiteit_naam, controleren_taak
  
  # snelheidsberekeningstabel aanzetten
  snelheids_bereken_tabel "#{activiteit_naam}_#{berekenen_taak.type}_tabel"

  berekenen_glas = new Filler berekenen_paper,
    0,
    0,
    activiteit.glas,
    berekenen_taak.width,
    berekenen_taak.height,
      components: ['ruler', 'tap', 'graph']
      editable: true
      time: false
      fillable: true
      speed: options?.speed ? 35

  $("##{activiteit_naam}_#{berekenen_taak.type}_next").click ->
    # send answer
    tekst = $("##{activiteit_naam}_#{berekenen_taak.type}_text").val()
    grafiek = berekenen_glas.graph.get_user_line()
    antwoord =
      tekst: tekst
      grafiek: grafiek.to_json()
    json_antwoord = JSON.stringify antwoord
    berekenen_taak.antwoord = antwoord
    

    # Display answer-section
    $("##{activiteit_naam}_#{controleren_taak.type}").show().scrollintoview()
    controleren_paper.clear()
    activiteit.glas.make_empty()
    controleren_glas = new Filler controleren_paper,
      0,
      0,
      activiteit.glas,
      controleren_taak.width,
      controleren_taak.height,
        components: ['ruler', 'tap', 'graph']
        editable: false
        time: false
        fillable: true
        computer_graph: true
        speed: options?.speed ? 35
    # set the line from before
    controleren_glas.graph.set_user_line grafiek


  $("##{activiteit_naam}_#{controleren_taak.type}_next").click ->
    # send answer
    antwoord = $("##{activiteit_naam}_#{controleren_taak.type}_text").val()
    json_antwoord = JSON.stringify antwoord
    controleren_taak.antwoord = antwoord
    

    if next
      $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()
    else
      $("##{activiteit_naam}_#{controleren_taak.type}_bedankt").show()


bereken_snelheid_activiteit = (les, activiteit, next = false, options = {}) ->
  #vergelijkings activiteit
  #
  activiteit_naam = activiteit.naam
  berekenen_taak = activiteit.taken[0]
  controleren_taak = activiteit.taken[1]

  berekenen_paper = create_paper activiteit_naam, berekenen_taak
  
  # snelheidsberekeningstabel aanzetten
  snelheids_bereken_tabel "#{activiteit_naam}_#{berekenen_taak.type}_tabel"

  berekenen_glas = new Filler berekenen_paper,
    0,
    0,
    activiteit.glas,
    berekenen_taak.width,
    berekenen_taak.height,
      components: ['ruler', 'tap']
      time: false
      fillable: true
      speed: options?.speed ? 35

  $("##{activiteit_naam}_#{berekenen_taak.type}_next").click ->
    # send answer
    antwoord = $("##{activiteit_naam}_#{berekenen_taak.type}_tabel input[name='uitkomst']").val()
    berekenen_taak.antwoord = antwoord
    json_antwoord = JSON.stringify antwoord
    

    # Display answer-section
    $("##{activiteit_naam}_#{controleren_taak.type}").show().scrollintoview()

  $("##{activiteit_naam}_#{controleren_taak.type}_next").click ->
    # send answer
    antwoord = $("##{activiteit_naam}_#{controleren_taak.type}_text").val()
    controleren_taak.antwoord = antwoord
    json_antwoord = JSON.stringify antwoord
    

    if next
      $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()



$(document).ready ->

  les = 3

  # snelheidsberekeningstabel: automatisch berekenen
  snelheids_bereken_tabel "stijgsnelheid_longdrink_glas_berekenen_tabel"
  glas_en_grafiek 'stijgsnelheid_longdrink_glas_berekenen', 900, 650, longdrink_glas,
    dimension: '2d'
    time: false
    editable: false
    components: ['ruler', 'tap', 'graph']
    computer_graph: true
  toggle_klassikaal "stijgsnelheid_longdrink_glas"

  toggle_klassikaal "drieeenheid"
  
  snelheids_bereken_tabel "stijgsnelheid_kromme_grafiek_tabel"
  glas_en_grafiek 'stijgsnelheid_kromme_grafiek', 1000, 700, cocktail_glas,
    dimension: '2d'
    time: false
    editable: false
    components: ['ruler', 'tap', 'graph']
    computer_graph: true

  snelheids_bereken_tabel "stijgsnelheid_vergelijking_tabel"
  glas_vergelijking 'stijgsnelheid_vergelijking', 1500, 700, [
      {
        model:  cocktail_glas
        speed: 35
        time: false
      },{
        model: smal_longdrink_glas
        speed:  35
        time: false
      },{
        model: longdrink_glas
        speed:  35
        time: false
      },{
        model: breed_longdrink_glas
        speed:  35
        time: false
      }],
    dimension: '2d'
    time: false
    editable: false
    components: ['ruler', 'tap', 'graph']
    computer_graph: true

  snelheids_bereken_tabel "stijgsnelheid_meten_tabel"
  glas_en_grafiek 'stijgsnelheid_meten', 1000, 700, cocktail_glas,
    dimension: '2d'
    time: false
    editable: false
    buttons: ['manual_diff']
    components: ['ruler', 'tap', 'graph']
    computer_graph: true

  toggle_klassikaal "stijgsnelheid"

  for activiteit, nr in activiteiten
    next = if nr < (activiteiten.length - 1) then activiteiten[(nr + 1)] else false
    next = if activiteit.next then next else false

    switch activiteit.type
      when 'bereken_stijgsnelheid'
        if activiteit.glas.maximum_volume > 350
          speed = 50
        else
          speed = 35
        bereken_snelheid_activiteit les, activiteit, next,
          speed: speed

      when 'grafiek_bereken_snelheid'
        grafiek_bereken_snelheid_activiteit les, activiteit, next

      when 'stijgsnelheid_meten'
        stijgsnelheid_meten_activiteit les, activiteit, next

    for taak in activiteit.taken

      $("##{activiteit.naam}_#{taak.type}").hide()

    activiteit_toggle activiteit

  $("#start").scrollintoview()

