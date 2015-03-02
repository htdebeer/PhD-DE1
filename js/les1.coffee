
# Les 1
#

longdrink_json = '{"path":"M 339 92 l 0 326 l 0 3 l 0 6","foot":{"x":255,"y":427},"stem":{"x":255,"y":421},"bowl":{"x":255,"y":418},"edge":{"x":255,"y":92},"height_in_mm":110,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'
cocktail_json = '{"path":"M 419 102 l -152 245 l 0 185 c 0 23.25 101 11.75 106 25","foot":{"x":255,"y":557},"stem":{"x":255,"y":532},"bowl":{"x":255,"y":347},"edge":{"x":255,"y":102},"height_in_mm":150,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'
erlenmeyer_json = '{"path":"M 307 103 l 0 123 l 100 299 c 10 25 9.5 26 -63 28 l -1 2 l 2 2","foot":{"x":255,"y":557},"stem":{"x":255,"y":555},"bowl":{"x":255,"y":553},"edge":{"x":255,"y":103},"height_in_mm":149,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'


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


# activity id : name activity
# task id: name activity - name task
# paper id: name task - paper
# texgtarea id: name task - text
# next id : name task - next
# replace all _ by -
longdrink_glas = new Glass longdrink_json
cocktail_glas = new Glass cocktail_json
erlenmeyer_glas = new Glass erlenmeyer_json

activiteiten = [
  {
    naam: 'longdrink'
    glas: longdrink_glas
    type: 'maak_maatbeker'
    taken: [
      {
        type: 'maak_maatbeker'
        open: true
        width: 310
        height: 630
        antwoord: null
      }, {
        type: 'check_maatbeker'
        open: false
        width: 310
        height: 630
        antwoord: null
      }
      ]
  }, {
    naam: 'cocktail'
    glas: cocktail_glas
    type: 'maak_maatbeker'
    taken: [
      {
        type: 'maak_maatbeker'
        open: true
        width: 425
        height: 800
        antwoord: null
      }, {
        type: 'check_maatbeker'
        open: false
        width: 425
        height: 800
        antwoord: null
      }
      ]
  }, {
    naam: 'erlenmeyer'
    glas: erlenmeyer_glas
    type: 'maak_maatbeker'
    taken: [
      {
        type: 'maak_maatbeker'
        open: true
        width: 425
        height: 800
        antwoord: null
      }, {
        type: 'check_maatbeker'
        open: false
        width: 425
        height: 800
        antwoord: null
      }
      ]
  }, {
    naam: 'vergelijk'
    type: 'vergelijk'
    taken: [
      {
        type: 'vergelijk'
        open: true
        antwoord: null
      }
      ]
  }
  ]

create_paper = (activiteit_naam, taak) ->
  paper_id = "#{activiteit_naam}_#{taak.type}_paper"
  paper = Raphael paper_id, taak.width, taak.height
  paper

activiteit_maak_maatbeker = (les, activiteit_nr, activiteit, next = false) ->
  maak_taak = activiteit.taken[0]
  check_taak = activiteit.taken[1]

  maak_paper = create_paper activiteit.naam, maak_taak
  check_paper = create_paper activiteit.naam, check_taak

  maak_filler = new Filler maak_paper,
      0,
      0,
      activiteit.glas,
      maak_taak.width,
      maak_taak.height,
        components: ['ruler', 'measure_lines', 'tap']
        buttons: []
        dimension: '2d'
        time: false
        editable: true
        fillable: false
        speed: 25

  $("##{activiteit.naam}_#{maak_taak.type}_next").click =>
    antwoord = maak_filler.glass.to_json()
    maak_taak.antwoord = antwoord
    

    $("##{activiteit.naam}_#{check_taak.type}").show().scrollintoview()
    check_taak.open = true
    check_paper.clear()
    check_filler = new Filler check_paper,
      0,
      0,
      activiteit.glas,
      check_taak.width,
      check_taak.height,
        components: ['ruler', 'measure_lines', 'tap']
        buttons: []
        dimension: '2d'
        time: false
        editable: false
        fillable: true
        speed: 25

  $("##{activiteit.naam}_#{check_taak.type}_next").click =>
    erlenmeyer_glas.make_empty()
    cocktail_glas.make_empty()
    longdrink_glas.make_empty()
    antwoord = $("##{activiteit.naam}_#{check_taak.type}_text").val()
    check_taak.antwoord = antwoord
    
    if next
      $("##{next}").show().scrollintoview()



activiteit_vergelijk = (les, activiteit_nr, activiteit, next = false) ->
  #vergelijkings activiteit
  #
  erlenmeyer_vergelijk_paper = new ScaleRaphael "vergelijk_erlenmeyer", 425, 800
  cocktail_vergelijk_paper = new ScaleRaphael "vergelijk_cocktail", 425, 800
  longdrink_vergelijk_paper = new ScaleRaphael "vergelijk_longdrink", 425, 800
  
  erlenmeyer_vergelijk = new Filler erlenmeyer_vergelijk_paper,
    0,
    0,
    erlenmeyer_glas,
    425,
    800,
      components: ['ruler', 'tap']
      buttons: []
      dimension: '2d'
      time: false
      editable: false
      speed: 100
     
  cocktail_vergelijk = new Filler cocktail_vergelijk_paper,
    0,
    0,
    cocktail_glas,
    425,
    800,
      components: ['ruler', 'tap']
      buttons: []
      dimension: '2d'
      time: false
      editable: false
      speed: 100
   
  longdrink_vergelijk = new Filler longdrink_vergelijk_paper,
    0,
    0,
    longdrink_glas,
    425,
    800,
      components: ['ruler', 'tap']
      buttons: []
      dimension: '2d'
      time: false
      editable: false
      speed: 100
   
  longdrink_vergelijk_paper.scaleAll 0.75
  cocktail_vergelijk_paper.scaleAll 0.75
  erlenmeyer_vergelijk_paper.scaleAll 0.75

  $("#vergelijk_opsturen").click ->
    keuze = $("#vergelijk_vergelijk input[name='vergelijk_keuze']:checked").val() ? "none"
    uitleg = $("#vergelijk_text").val()
    antwoord =
      keuze: keuze
      text: uitleg
    json_antwoord = JSON.stringify antwoord
    

    $("#bedankt").show().scrollintoview()

     

activiteit_toggle = (activiteit) ->
  taken = activiteit.taken
  naam = activiteit.naam
  $("##{naam} :first").click =>
    for taak in taken
      if taak.open
        $("##{naam}_#{taak.type}").toggle().scrollintoview()


$(document).ready ->

  les = 1
  for activiteit, nr in activiteiten
    if activiteit.type is 'maak_maatbeker'
      if nr < activiteiten.length - 1
        next_activiteit = activiteiten[nr+1]
        next_taak = next_activiteit.taken[0]
        next = "#{next_activiteit.naam}_#{next_taak.type}"
        activiteit_maak_maatbeker les, nr, activiteit, next
      else
        activiteit_maak_maatbeker les, nr, activiteit, false
    else if activiteit.type is 'vergelijk'
      activiteit_vergelijk les, nr, activiteit, false


    for taak in activiteit.taken
      $("##{activiteit.naam}_#{taak.type}").hide()

    activiteit_toggle activiteit

  $("#start").scrollintoview()

