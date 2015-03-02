
# Les 1
#



$(document).ready ->

  # Opgave 1
  #

  snelheids_paper = Raphael "stijgsnelheidsgrafiek", 1000, 700
  snelheidsgrafiek = new Graph snelheids_paper, 0, 0, 600, 500,
    x_axis:
      label: "volume (ml)"
      raster: true
      unit:
        per_pixel: 0.6
        symbol: "ml"
        quantity: "volume"
      max: 260
      tickspath: "20tL"
      orientation: 'horizontal'
    y_axis:
      label: "stijgsnelheid (mm/cl)"
      raster: true
      unit:
        per_pixel: 0.4
        symbol: "mm/cl"
        quantity: "stijgsnelheid"
      max: 160
      tickspath: "10tL"
      orientation: 'vertical'
    buttons: ['raster']
    computer_graph: false
    editable: true
  
  grafiek_paper = Raphael "grafiek", 1000, 700
  grafiek = new Graph grafiek_paper, 0, 0, 600, 500,
    x_axis:
      label: "volume (ml)"
      raster: true
      unit:
        per_pixel: 0.7
        symbol: "ml"
        quantity: "volume"
      max: 300
      tickspath: "25tL"
      orientation: 'horizontal'
    y_axis:
      label: "hoogte (cm)"
      raster: true
      unit:
        per_pixel: 0.04
        symbol: "cm"
        quantity: "hoogte"
      max: 16
      tickspath: "0.5tL"
      orientation: 'vertical'
    buttons: ['normal', 'point', 'straight', 'curve', 'remove', 'raster', 'delta']
    computer_graph: false
    editable: true

  grafter_paper = Raphael "grafter", 700, 600
  grafter = new GlassGrafter grafter_paper, 0, 0, 600, 600, 0.33
