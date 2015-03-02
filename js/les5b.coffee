
# Les 5b
#



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

toggle_klassikaal = (activiteit_id) ->
  $("##{activiteit_id} :first").click =>
    $("##{activiteit_id} section").toggle()
    $("##{activiteit_id} section:first").scrollintoview()
  $("##{activiteit_id} section").hide()


weergeven = (inzending, grafiek_paper, oor_paper) ->
  $("#inzending_#{inzending.index}").click ->
    $("#uitwerking_namen").html inzending.leerlingen
    $("#uitwerking_datum").html inzending.datumtijd
    glas_id = 1
    if inzending.groep % 4 is 0
      glas_id = 5
    else if inzending.groep % 3 is 0
      glas_id = 4
    else if inzending.groep % 2 is 0
      glas_id = 3
    else if inzending.groep % 1 is 0
      glas_id = 2
    else
      glas_id = 1

    oorspronkelijk_glas = new Glass window.glazen[glas_id]
    $("#uitwerking_opdracht_paper").html "<img src='glass_shapes/#{glas_id}_graph.png' />"

    antwoord = inzending.antwoord
    ontworpen_glas = new Glass antwoord.glas
    $("#uitwerking").show().scrollintoview()
    grafiek_paper.clear()
    grafiekfiller = new Filler grafiek_paper,
      0,
      0,
      ontworpen_glas,
      1200,
      750,
        dimension: '2d'
        editable: false
        fillable: true
        components: ['ruler', 'tap', 'graph']
        computer_graph: true
        speed_graph: true
        time: false
        speed: 50
        hide_all_except_graph: false

    oor_paper.clear()
    oorspronkelijkfiller = new Filler oor_paper,
      0,
      0,
      oorspronkelijk_glas,
      1200,
      750,
        dimension: '2d'
        editable: false
        fillable: true
        components: ['ruler', 'tap', 'graph']
        computer_graph: true
        speed_graph: true
        time: false
        speed: 50
        hide_all_except_graph: false






$(document).ready ->

  if window?.docent  and window.docent
    # docent is ingelogd
    # make all inzendingen clickable
    grafiek_paper = Raphael "uitwerking_ontworpen_glas_paper",
      1200,
      700
    oor_paper = Raphael "uitwerking_oorspronkelijk_glas_paper",
      1200,
      700

    for inzending in inzendingen
      weergeven inzending, grafiek_paper, oor_paper
    

    $("#uitwerking").hide()


  else
    les = 5

    voorbeeldglas = new Glass glas.json

    snelheids_bereken_tabel "ontwerp_glas_grafiek"
    grafiek_paper = Raphael "ontwerp_glas_grafiek_paper",
      1200,
      700
    grafiekfiller = new Filler grafiek_paper,
      0,
      0,
      voorbeeldglas,
      1200,
      750,
        dimension: '2d'
        editable: true
        fillable: false
        components: ['ruler', 'tap', 'graph']
        graph_buttons: ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'raster']
        computer_graph: false
        speed_graph: false
        time: false
        speed: 50
        hide_all_except_graph: true


    ontwerp_paper = Raphael "ontwerp_glas_ontwerp_paper",
      650,
      600
    ontwerp_grafter = new GlassGrafter ontwerp_paper,
      0,
      0,
      600,
      600,
      0.33



    $('#ontwerp_glas_uitleg_next').click ->
      grafiek = grafiekfiller.graph.user_line
      ontworpen_glas = ontwerp_grafter.get_contour().to_glass()
      uitleg = $("#ontwerp_glas_uitleg_text").val()
      antwoord =
        grafiek: grafiek.to_json()
        glas: ontworpen_glas.to_json()
        uitleg: uitleg
      json_antwoord = JSON.stringify antwoord
      $("#ontwerp_glas_uitleg_bedankt").show()
      
