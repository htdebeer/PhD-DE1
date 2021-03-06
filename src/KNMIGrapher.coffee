# KNMIGrapher.coffee
#
# (c) 2012 HT de Beer
#
# Load a KNMI datafile and put it in a graph. Get data from
# http://www.knmi.nl/klimatologie/uurgegevens/select_uur.cgi?language=nl
#
# Put source as KONINKLIJK NEDERLANDS METEOROLOGISCH INSTITUUT (KNMI)
#
window.KNMIGrapher = class

  constructor: (@paper, @x, @y, @width, @height, x_axis, y_axis, KNMI_data, properties) ->

    data = @parse_KNMI_data KNMI_data

    GRAPH_PADDING = 2
    GRAPH_BUTTON_WIDTH = 34
    GRAPH_SEP = 15
    GRAPH_AXIS_WIDTH = 40

    GRAPHER_WIDTH = @width - GRAPH_PADDING*2 - GRAPH_AXIS_WIDTH
    GRAPHER_HEIGHT = @height - GRAPH_PADDING*2 - GRAPH_BUTTON_WIDTH - GRAPH_SEP - GRAPH_AXIS_WIDTH

    x_max = data.max_x
    total_x = x_max * 1.1
    x_pixel = total_x / GRAPHER_WIDTH
    x_tickspath = x_axis?.tickspath ? false
    if not x_tickspath
      x_candidate = total_x / 15
      stepticks = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]
      xi = 0
      while xi < stepticks.length and stepticks[xi] <= x_candidate
        xi++
      x_step = stepticks[xi - 1]
      x_tickspath = "#{x_step}tL"

    
    y_max = data.max_y
    total_y = y_max * 1.1
    y_pixel = total_y / GRAPHER_HEIGHT
    y_tickspath = y_axis?.tickspath ? false
    if not y_tickspath
      y_candidate = total_y / 15
      stepticks = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]
      yi = 0
      while yi < stepticks.length and stepticks[yi] <= y_candidate
        yi++
      y_step = stepticks[yi - 1]
      y_tickspath = "#{y_step}tL"

    @graph_spec =
      x_axis:
        label: x_axis.label
        raster: true
        unit:
          per_pixel: x_pixel
          symbol: x_axis.symbol
          quantity: x_axis.quantity
        max: x_max
        tickspath: x_tickspath
        orientation: 'horizontal'
      y_axis:
        label: y_axis.label
        raster: true
        unit:
          per_pixel: y_pixel
          symbol: y_axis.symbol
          quantity: y_axis.quantity
        max: y_max
        tickspath: y_tickspath
        orientation: 'vertical'
      computer_graph: properties?.computer_graph ? true
      editable: properties?.editable ? true
      icon_path: properties?.icon_path ? 'lib/icons'
      
    @graph = new Graph @paper, @x, @y, @width, @height, @graph_spec

    # draw graph itself
    line = @graph.computer_line
    x = line.min.x
    y = line.max.y - (data.values[0] / line.y_unit.per_pixel)
    graphpath = "M#{x},#{y}"
    i = 1
    y_oud = data.values[0]
    dy = 0
    while i < x_max
      # as the y is reversed in SVG, multiply all values of dy with -1 to get
      # the graph increasing and decreasing correctly
      dy = (data.values[i] - y_oud )*-1
      y_oud = data.values[i]
      graphpath += "l#{1/line.x_unit.per_pixel},#{dy/line.y_unit.per_pixel}"
      i++

    @graph.computer_graph.attr
      path: graphpath
    line.add_point x, y, @graph
    p = line.find_point_at x
    line.add_freehand_line p, graphpath


  parse_KNMI_data: (data) ->
    data_lines = (line for line in data.split(/\n/) when not /^#.*/.test(line))
    x = 0
    max_y = y = - Infinity
    data_points = []
    pattern = /.*,\s*(\d+)$/

    while x < data_lines.length
      match = pattern.exec data_lines[x]
      y = parseFloat(match[1])/10
      max_y = Math.max( max_y, y)
      data_points.push y
      x++

    return {
      values: data_points
      max_y: max_y
      max_x: x - 1
    }



    
    
