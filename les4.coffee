
# Les 3 
#

mei_temp = """
# DEZE GEGEVENS MOGEN VRIJ WORDEN GEBRUIKT MITS DE VOLGENDE BRONVERMELDING WORDT GEGEVEN:
# KONINKLIJK NEDERLANDS METEOROLOGISCH INSTITUUT (KNMI)
# 
# 
# STN         LON        LAT          ALT NAME
# 370: 	      5.41	 51.45	     203  EINDHOVEN
# 
# YYYYMMDD = datum (YYYY=jaar,MM=maand,DD=dag); 
# HH       = tijd (HH=uur, UT.12 UT=13 MET, 14 MEZT. Uurvak 05 loopt van 04.00 UT tot 5.00 UT; 
# T        = Temperatuur (in 0.1 graden Celsius) op 1.50 m hoogte tijdens de waarneming; 
# 
# STN,YYYYMMDD,   HH,    T
# 
  370,20120525,   24,  164
  370,20120526,    1,  134
  370,20120526,    2,  133
  370,20120526,    3,  144
  370,20120526,    4,  149
  370,20120526,    5,  160
  370,20120526,    6,  172
  370,20120526,    7,  193
  370,20120526,    8,  210
  370,20120526,    9,  223
  370,20120526,   10,  230
  370,20120526,   11,  235
  370,20120526,   12,  246
  370,20120526,   13,  247
  370,20120526,   14,  251
  370,20120526,   15,  250
  370,20120526,   16,  252
  370,20120526,   17,  249
  370,20120526,   18,  242
  370,20120526,   19,  232
  370,20120526,   20,  217
  370,20120526,   21,  206
  370,20120526,   22,  199
  370,20120526,   23,  188
  370,20120526,   24,  178
  370,20120527,    1,  166
  370,20120527,    2,  154
  370,20120527,    3,  130
  370,20120527,    4,  122
  370,20120527,    5,  150
  370,20120527,    6,  175
  370,20120527,    7,  204
  370,20120527,    8,  221
  370,20120527,    9,  234
  370,20120527,   10,  243
  370,20120527,   11,  251
  370,20120527,   12,  256
  370,20120527,   13,  255
  370,20120527,   14,  261
  370,20120527,   15,  260
  370,20120527,   16,  260
  370,20120527,   17,  255
  370,20120527,   18,  240
  370,20120527,   19,  233
  370,20120527,   20,  208
  370,20120527,   21,  200
  370,20120527,   22,  186
  370,20120527,   23,  171
  370,20120527,   24,  159
  370,20120528,    1,  151
  370,20120528,    2,  138
  370,20120528,    3,  133
  370,20120528,    4,  130
  370,20120528,    5,  145
  370,20120528,    6,  157
  370,20120528,    7,  175
  370,20120528,    8,  202
  370,20120528,    9,  225
  370,20120528,   10,  236
  370,20120528,   11,  239
  370,20120528,   12,  246
  370,20120528,   13,  259
  370,20120528,   14,  254
  370,20120528,   15,  252
  370,20120528,   16,  246
  370,20120528,   17,  238
  370,20120528,   18,  224
  370,20120528,   19,  205
  370,20120528,   20,  178
  370,20120528,   21,  161
  370,20120528,   22,  150
  370,20120528,   23,  136
  370,20120528,   24,  129
"""
cocktail_json = '{"path":"M 419 102 l -152 245 l 0 185 c 0 23.25 101 11.75 106 25","foot":{"x":255,"y":557},"stem":{"x":255,"y":532},"bowl":{"x":255,"y":347},"edge":{"x":255,"y":102},"height_in_mm":150,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'
wijn_json = '{"path":"M 361 123 c 21 92.75 1 176.25 -90 255 l 0 164 l 89 15","foot":{"x":255,"y":557},"stem":{"x":255,"y":542},"bowl":{"x":255,"y":378},"edge":{"x":255,"y":123},"height_in_mm":143,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'
rondbodemkolf_json = '{"path":"M 315 73 l 0 161 c 192 45.75 192 262.25 -4 319 l -13 2 l -10 2","foot":{"x":255,"y":557},"stem":{"x":255,"y":555},"bowl":{"x":255,"y":553},"edge":{"x":255,"y":73},"height_in_mm":159,"spec":{"round_max":"cl","mm_from_top":5},"measure_lines":{},"nr_of_measure_lines":0}'



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


cocktail_glas = new Glass cocktail_json
wijn_glas = new Glass wijn_json
rondbodemkolf = new Glass rondbodemkolf_json

create_paper = (activiteit_naam, taak) ->
  paper_id = "#{activiteit_naam}_#{taak.type}_paper"
  paper = Raphael paper_id, taak.width, taak.height
  paper

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

racebaan = (sectionid, width, height, track, options) ->
  paper = Raphael "#{sectionid}_paper", width, height
  trackracer = new TrackRacer paper,
    0,
    0,
    track,
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
    naam: 'stijgsnelheid_wijnglas'
    type: 'stijgsnelheid'
    glas: wijn_glas
    next: true
    taken: [
      {
        type: 'meten'
        open: true
        width: 700
        height: 650
        antwoord: null
      }
    ]
  }, {
    naam: 'stijgsnelheid_rondbodemkolf'
    type: 'stijgsnelheid_grafiek'
    glas: rondbodemkolf
    next: false
    taken: [
      {
        type: 'meten'
        open: true
        width: 900
        height: 700
        antwoord: null
      }, {
        type: 'grafiek'
        open: false
        width: 1100
        height: 750
        antwoord: null
      }, {
        type: 'controleren'
        open: false
        width: 1100
        height: 750
        antwoord: null
      }
    ]
  }, {
    naam: 'snelheid_race_baan_klaver'
    type: 'snelheid_race_baan'
    track:
      path: "h-150a100,100,1,1,0,0,200a100,100,0,0,0,200,0a100,100,1,0,0,0,-200z"
      meter_per_pixel: 0.01
      move_x: 270
      ticks: "0.1tttttttttT"
      accelerationpath: '0.25|0.2,0.125|4,-0.2|6,-0.05|7,0.25|10,-0.375|12'
    next: true
    taken: [
      {
        type: 'meten'
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
    naam: 'snelheid_race_baan_cn'
    type: 'snelheid_race_baan'
    track:
      path: "h-150a100,100,1,1,0,0,200h25a50,50,1,1,0,0,-100h-30a25,25,1,1,1,0,-50h100a15,15,0,0,1,15,15v100a25,25,1,0,0,25,25h50a25,25,1,0,0,25,-25v-115a50,50,1,0,0,-50,-50z"
      move_x: 270
      meter_per_pixel: 0.01
      ticks: "0.1tttttttttT"
      accelerationpath: '0.1|5,-0.2|7.5,1|14'
    next: false
    taken: [
      {
        type: 'meten'
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
  }
]

snelheid_race_baan_activiteit = (les, activiteit, next = false, options = {}) ->
  activiteit_naam = activiteit.naam
  meet_taak  = activiteit.taken[0]
  controleren_taak = activiteit.taken[1]

  meet_paper = create_paper activiteit_naam, meet_taak

  snelheids_bereken_tabel "#{activiteit_naam}_#{meet_taak.type}_tabel"

  racer = new TrackRacer meet_paper,
    0,
    0,
    activiteit.track,
    meet_taak.width,
    meet_taak.height
    
  $("##{activiteit_naam}_#{meet_taak.type}_next").click ->
    antwoord = $("##{activiteit_naam}_#{meet_taak.type}_text").val()
    json_antwoord = JSON.stringify antwoord
    meet_taak.antwoord = antwoord
    send_answer les, activiteit_naam, meet_taak.type, json_antwoord

    $("##{activiteit_naam}_#{controleren_taak.type}").show().scrollintoview()


  $("##{activiteit_naam}_#{controleren_taak.type}_next").click ->
    antwoord = $("##{activiteit_naam}_#{controleren_taak.type}_text").val()
    json_antwoord = JSON.stringify antwoord
    controleren_taak.antwoord = antwoord
    send_answer les, activiteit_naam, controleren_taak.type, json_antwoord
    if next
      $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()
    else
      $("##{activiteit_naam}_#{controleren_taak.type}_bedankt").show()


stijgsnelheid_activiteit = (les, activiteit, next = false, options = {}) ->
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
      send_answer les, activiteit_naam, meet_taak.type, json_antwoord

      if next
        $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()
      else
        $("##{activiteit_naam}_#{meet_taak.type}_bedankt").show()

stijgsnelheid_grafiek_activiteit = (les, activiteit, next = false, options = {}) ->
  activiteit_naam = activiteit.naam
  meet_taak = activiteit.taken[0]
  grafiek_taak = activiteit.taken[1]
  controleren_taak = activiteit.taken[2]

  meet_paper = create_paper activiteit_naam, meet_taak
  grafiek_paper = create_paper activiteit_naam, grafiek_taak
  controleren_paper = create_paper activiteit_naam, controleren_taak

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
      speed: options.speed
  grafiek_glas = new Filler grafiek_paper,
    0,
    0,
    activiteit.glas,
    grafiek_taak.width,
    grafiek_taak.height,
      components: ['ruler', 'tap', 'graph']
      editable: true
      time: false
      computer_graph: false
      fillable: false
      buttons: ['manual_diff']
      speed: options.speed

  $("##{activiteit_naam}_#{meet_taak.type}_next").click ->
    antwoord = $("##{activiteit_naam}_#{meet_taak.type}_text").val()
    json_antwoord = JSON.stringify antwoord
    meet_taak.antwoord = antwoord
    send_answer les, activiteit_naam, meet_taak.type, json_antwoord

    $("##{activiteit_naam}_#{grafiek_taak.type}").show().scrollintoview()
    grafiek_paper.clear()
    activiteit.glas.make_empty()
    grafiek_glas = new Filler grafiek_paper,
      0,
      0,
      activiteit.glas,
      grafiek_taak.width,
      grafiek_taak.height,
        components: ['ruler', 'tap', 'graph']
        editable: true
        time: false
        computer_graph: false
        fillable: false
        speed: options.speed
        buttons: ['manual_diff']

  $("##{activiteit_naam}_#{grafiek_taak.type}_next").click ->
    antwoord = grafiek_glas.graph.user_line
    json_antwoord = antwoord.to_json()
    grafiek_taak.antwoord = antwoord
    send_answer les, activiteit_naam, grafiek_taak.type, json_antwoord

    $("##{activiteit_naam}_#{controleren_taak.type}").show().scrollintoview()
    controleren_paper.clear()
    activiteit.glas.make_empty()
    controleren_glas = new Filler controleren_paper,
      0,
      0,
      activiteit.glas,
      meet_taak.width,
      meet_taak.height,
        components: ['ruler', 'tap', 'graph']
        editable: false
        computer_graph: true
        time: false
        fillable: true
        speed: options.speed
        buttons: ['manual_diff']
    controleren_glas.graph.set_user_line antwoord


  $("##{activiteit_naam}_#{controleren_taak.type}_next").click ->
    antwoord = $("##{activiteit_naam}_#{controleren_taak.type}_text").val()
    json_antwoord = JSON.stringify antwoord
    meet_taak.antwoord = antwoord
    send_answer les, activiteit_naam, controleren_taak.type, json_antwoord
    if next
      $("##{next.naam}_#{next.taken[0].type}").show().scrollintoview()
    else
      $("##{activiteit_naam}_#{controleren_taak.type}_bedankt").show()

knmigrafiek = (sectionid, width, height, x_axis, y_axis, knmi_data) ->
  paper = Raphael "#{sectionid}_paper", width, height
  graph = new KNMIGrapher paper, 0, 0, width, height, x_axis, y_axis, knmi_data


$(document).ready ->

  les = 4

  snelheids_bereken_tabel "stijgsnelheid_meten_tabel"
  glas_en_grafiek 'stijgsnelheid_meten', 1000, 700, cocktail_glas,
    dimension: '2d'
    time: false
    editable: false
    diff_graph: true
    buttons: ['manual_diff']
    components: ['ruler', 'tap', 'graph']
    computer_graph: true

  toggle_klassikaal "stijgsnelheid"

  snelheids_bereken_tabel "stijgsnelheid_grafiek_bepalen"
  glas_en_grafiek 'stijgsnelheid_grafiek_bepalen', 1100, 800, rondbodemkolf,
    dimension: '2d'
    time: false
    editable: true
    diff_graph: true
    buttons: ['manual_diff']
    components: ['ruler', 'tap', 'graph']
    computer_graph: true
  snelheids_bereken_tabel "stijgsnelheid_grafiek_meten"
  glas_en_grafiek 'stijgsnelheid_grafiek_meten', 1100, 800, rondbodemkolf,
    dimension: '2d'
    time: false
    graph_buttons: ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'raster']
    editable: true
    components: ['ruler', 'tap', 'graph']
    computer_graph: true

  toggle_klassikaal "stijgsnelheid_grafiek"

  snelheids_bereken_tabel "snelheid_race_baan_meten"
  racebaan "snelheid_race_baan_meten", 1200, 800, {
    path: "h-150a100,100,1,1,0,0,200h200a100,100,0,0,0,0,-200z"
    meter_per_pixel: 0.01
    move_x: 270
    ticks: "0.1tttttttttT"
    accelerationpath: '0.05|6,-0.06|11'
    }, {
    }
  toggle_klassikaal "snelheid_race_baan"

  snelheids_bereken_tabel "temperatuur_grafiek_meten"
  knmigrafiek "temperatuur_grafiek_meten", 500, 500, {
    label: "uren tussen 26 en 28 mei (uur)"
    quantity: "uren"
    symbol: "uur"
    tickspath: "3tL"
  }, {
    label: "temperatuur (°C)"
    quantity: "graden Celsius"
    symbol: "°C"
  }, mei_temp
  toggle_klassikaal "temperatuur_grafiek"
  

  for activiteit, nr in activiteiten
    next = if nr < (activiteiten.length - 1) then activiteiten[(nr + 1)] else false
    next = if activiteit.next then next else false

    switch activiteit.type

      when 'stijgsnelheid'
        stijgsnelheid_activiteit les, activiteit, next

      when 'stijgsnelheid_grafiek'
        if activiteit.glas.maximum_volume > 500
          speed = 100
        else
          speed = 35
        stijgsnelheid_grafiek_activiteit les, activiteit, next,
          speed: speed

      when 'snelheid_race_baan'
        snelheid_race_baan_activiteit les, activiteit, next

    for taak in activiteit.taken

      $("##{activiteit.naam}_#{taak.type}").hide()

    activiteit_toggle activiteit

  $("#start").scrollintoview()

