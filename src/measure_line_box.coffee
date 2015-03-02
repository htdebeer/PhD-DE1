#
# measure_line_box.coffee (c) 2012 HT de Beer
#
# box with measure lines
#

window.CoffeeGrounds = CoffeeGrounds ? {}
CoffeeGrounds.MeasureLineBox = class


  to_json: ->
    export_object =
      measure_lines: []
    for ml, vol in @glas.measure_lines
      export_object.measure_lines[vol] = ml.to_json()
    JSON.stringify export_object

  constructor: (@paper, @x, @y, width, @glass, @foot, properties = {}) ->
    @spec = @initialize_properties properties
    @PADDING = 5
    @HEIGHT = 100
    @ML_SEP = 10
    @ML_WIDTH = 50
    @ML_HEIGHT = 15
    @WIDTH = 3*@ML_WIDTH
    @draw()

  initialize_properties: (p) ->
    q = {}
    q.rows = p?.rows ? 2
    q.bend = p?.bend ? false
    q.lines = p?.lines ? @generate_lines()
    q.editable = p?.editable ? true
    q

  generate_lines: ->
    # generate 4 or 5 lines of nice round number, like 10, 25, 50, 100, 200,
    # 250, 500, 1000
    NICE_ROUND_NUMBERS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]
    lines = []
    # 
    fourth = @glass.maximum_volume / 4
    
    i = 0
    while i < NICE_ROUND_NUMBERS.length and NICE_ROUND_NUMBERS[i] <= fourth
      i++

    # NICE_ROUND_NUMBERS[i] >= fourth
    # check if fourth is closer to i or i - 1
    if i < NICE_ROUND_NUMBERS.length
      lower = NICE_ROUND_NUMBERS[i-1]
      higher = NICE_ROUND_NUMBERS[i]
      if Math.abs(lower-fourth) <= Math.abs(higher-fourth)
        step = lower
      else
        step = higher
    else
      step = NICE_ROUND_NUMBERS[NICE_ROUND_NUMBERS.length - 1]

    # generate mls
    h = step
    while h <= (@glass.maximum_volume - step)
      lines.push h
      h += step

    lines


  show: ->
    @elements.show()

  hide: ->
    @elements.hide()

  draw: ->
    @elements = @paper.set()

    @box = @paper.rect @x, @y, @WIDTH, @HEIGHT
    @box.attr
      stroke: 'black'
      'stroke-width': 2

    @title = @paper.text @x + @PADDING, @y + @PADDING, "maat-\nstreepjes"
    @title.attr
      'text-anchor': 'start'
      'font-family': 'sans-serif'
      'font-size': '16pt'
    tbb = @title.getBBox()

    @HEIGHT = tbb.height + 2*@PADDING
    @WIDTH = tbb.width + 2*@PADDING + 4*@ML_WIDTH

    @titlebox = @paper.rect @x, @y, tbb.width + 2*@PADDING, @HEIGHT
    @titlebox.attr
      fill: 'gold'
      stroke: 'black'
      'stroke-width': 2
    
    @title.attr
      y: @y + @PADDING + tbb.height/2
    @title.toFront()
    @box.attr
      height: @HEIGHT
      width: @WIDTH

    if not @spec.editable
      @box.hide()
      @titlebox.hide()
      @title.hide()
    else
      @elements.push @box, @titlebox, @title
  

    @MLSTART_X = @x + tbb.width + 2*@PADDING + @ML_SEP
    @MLSTART_Y = @y + tbb.height/2 - @ML_SEP/2

    if @glass.nr_of_measure_lines is 0
      # generate the mls
      x = @MLSTART_X + @ML_WIDTH
      y = @MLSTART_Y
      for ml in @spec.lines
        mml = new MeasureLine ml, -1, @glass, {x:x, y:y}, 'right', true, @spec.editable
        rml = new WMeasureLine @paper, x, y, mml, @foot, {
          bend: @spec.bend
        }
        @glass.add_measure_line ml, -1, mml, rml
        @elements.push rml.widgets
        x += @ML_SEP + @ML_WIDTH
        if x > @x + @WIDTH - @PADDING
          y += @ML_SEP/2 + @ML_HEIGHT
          x = @MLSTART_X + @ML_WIDTH

    else
      # There are already measure lines: add those to the right places
      for vol, ml of @glass.measure_lines
        model = ml.model
        ml.movable = @spec.editable
        model.movable = @spec.editable
        rml = new WMeasureLine @paper, model.position.x, model.position.y, model, @foot, {
          bend: @spec.bend
        }
        @elements.push rml.widgets

  reset: ->
    x = @MLSTART_X + @ML_WIDTH
    y = @MLSTART_Y
    for ml in @spec.lines
      # put mls back in their place in the box
      x += @ML_SEP + @ML_WIDTH
      if x > @x + @WIDTH - @PADDING
        y += @ML_SEP/2 + @ML_HEIGHT
        x = @MLSTART_X + @ML_WIDTH

