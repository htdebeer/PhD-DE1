
voorbeeld_json = '{"path":"M 339 301 l 0 216 l 0 20 l 0 20","foot":{"x":255,"y":557},"stem":{"x":255,"y":537},"bowl":{"x":255,"y":517},"edge":{"x":255,"y":301},"height_in_mm":84,"spec":{"round_max":"cl","mm_from_top":0},"measure_lines":{},"nr_of_measure_lines":0}'

$(document).ready ->
  voorbeeld_glas = new Glass voorbeeld_json
  voorbeeld_paper = Raphael "voorbeeld", 300, 500
  voorbeeld_filler = new Filler voorbeeld_paper,
      0,
      0,
      voorbeeld_glas,
      300,
      400,
        components: ['ruler', 'tap']
        buttons: []
        dimension: '3d'
        time: false
        editable: false
        fillable: true
        speed: 25

