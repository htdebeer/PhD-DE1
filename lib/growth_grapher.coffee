#
# line.coffee (c) 2012 HT de Beer
#
# version 0
#
# A line models a line in a Cartesian graph. A line is a list of points. A
# point has the following properties:
#
#   ∙ x, the x coordinate
#   ∙ y, the y coordinate
#   ∙ segment, the line segment from this point to the next if any. A 
#              segment has the following properties:
#
#     ∙ type, type ∈ {none, straight, curve, freehand}. 
#
#     - If this segment is a curve, it has also two control points:
#
#     ∙ c1, controlling the curve around this point:
#       ∙ x, the x coordinate
#       ∙ y, the y coordinate
#     ∙ c2, controlling the curve around the next point:
#       ∙ x, the x coordinate
#       ∙ y, the y coordinate
#           
#     - If this segment has type freehand, it has also a path:
#
#     ∙ path, an SVG path starting in this point and ending in the next 
#             point.
#
# For a line and its points, the following hold:
#   
#   (∀i: 0 ≤ i < |points| - 1: points[i].x < points[i+1].x)
# ∧ 
#   min.x ≤ points[0].x ∧ points[|points|-1] ≤ max.x
# ∧
#   (∀i: 0 ≤ i < |points|: min.y ≤ points[i].y ≤ max.y)
# ∧ 
#   point[|points|-1].line = none
#
# A line is initialized given the area of the Cartesian graph this line is
# part of:
#
#   ∙ x, the left x coordinate of the Cartesian graph; min.x = x
#   ∙ y, the top y coordinate of the Cartesian graph; min.y = y
#   ∙ width, the width of the Cartesian graph; max.x = min.x + width
#   ∙ height, the height of the Cartesian graph; min.y = min.y + height
#
#   ∙ unit:
#     ∙ x, the horizontal axis:
#       ∙ amount_per_pixel, the amount of this quantity represented by one
#                           pixel
#       ∙ quantity, the quantity represented by this unit
#       ∙ symbol, the symbol used for this quantity
#     ∙ y, the vertical axis:
#       ∙ amount_per_pixel, the amount of this quantity represented by one
#                           pixel
#       ∙ quantity, the quantity represented by this unit
#       ∙ symbol, the symbol used for this quantity
#
#   ∙ record, record ∈ {true, false}. The construction and manipulation of a
#             line can be recorded.  If a line is recorded, all operations 
#             are pushed onto the history. The history is a stack of 
#             operations performed on this line.
#
# One point or one line can be selected.
#
#   ( 0 ≤ selected.point < |points| ∧ selected.line = -1 )
# ∨
#   ( selected.point = -1 ∧ 0 ≤ selected.line < |points| - 1 ∧
#     points[selected.line].segment ≠ none )
# ∨
#   selected.point = -1 ∧ selected.line = -1
#
#
window.CoffeeGrounds = CoffeeGrounds ? {}
CoffeeGrounds.Line = class

  constructor: (left, top, width, height, @x_unit, @y_unit, @record = false) ->
    # x_unit in units per pixel
    # y_unit in units per pixel
    @min =
      x: left
      y: top
    @max =
      x: @min.x + width
      y: @min.y + height
    if @record
      @history = []
      @start_time = Date.now()
    @points = []
    @selected =
      point: -1
      line: -1

    @move_buffer =
      x: 0
      y: 0


  to_json: ->
    eo =
      x_unit: @x_unit
      y_unit: @y_unit
      min:
        x: @min.x
        y: @min.y
      max:
        x: @max.x
        y: @max.y
      record: @record
      points: []
    if @record
      eo.start_time = @start_time
      eo.history = @history.join(' ')

    for point, index in @points
      eopoint =
        index: index
        x: point.x
        y: point.y
      switch point.segment
        when 'none'
          eopoint.segment = 'none'
        when 'straight'
          eopoint.segment = 'straight'
        when 'curve'
          eopoint.segment = 'curve'
          eopoint.c1 = point.segment.c1
          eopoint.c2 = point.segment.c2
        when 'freehand'
          eopoint.segment = 'freehand'
          eopoint.path = point.segment.path
      eo.points[index] = eopoint

    JSON.stringify eo
    


  # queries

  get_point: (p) ->
    # Get point p from the list with points
    #
    # pre   : 0 ≤ p < |points|
    # post  : true
    # return: points[p]
    @points[p]

  find_point_at: (x) ->
    # Find and return the index of the point with x coordinate equal to x, -1
    # otherwise
    #
    # pre   : min.x ≤ x ≤ max.x
    # post  : true
    # return: p,  -1 ≤ p < |points|
    #           ∧ (
    #               p = -1 -> true
    #             ∨
    #               p > -1 -> points[p].x = x
    #             )
    # replace linear search with a more efficient one later
    p = 0
    while p < @points.length and @points[p].x isnt x
      p++
    p = if p is @points.length then -1 else p
  
  point_in_circle: (p, x, y, r) ->
    q = @points[p]
    result = (q.x - r < x < q.x + r) and (q.y - r < y < q.y + r)
    result

  find_point_near: (x, y, r = 1) ->
    # Find a point, if any, in the circle with origin x, y and radius r

    found = -1
    ar = 0
    while found is -1 and ar < r
      found = Math.max(@find_point_at(x + ar), @find_point_at(x - ar))
      if found isnt -1 and y - ar <= @points[found].y  <= y + ar
        break
      else
        found = -1
      ar++
    found
      

  find_point_around: (x, y, r = 10) ->
    # Find and return the index of the point in the circle around x, y with
    # radius r, if any. Return -1 otherwise
    #
    # pre   : min.x ≤ x ≤ max.x ∧ min.y ≤ y ≤ max.y
    # post  : true
    # return: p, -1 ≤ p < |points| 
    #       ∧
    #         points.p.x - r < x < points.p.x + r
    #       ∧
    #         points.p.y -r < y < points.p.y + r
    ax = x
    ay = y
    while p < @points.length and not @point_in_circle(p, x, y, r)
      p++
    
    p = if p isnt @points.length then p else -1

  find_point_to_the_left_of: (x) ->
    # Find and return the index of the point left of and closest to x, -1
    # otherwise
    #
    # pre   : min.x ≤ x ≤ max.x
    # post  : true
    # return: p,  -1 ≤ p < |points| 
    #           ∧  
    #             (∀i: 0 ≤ i < p: point[i].x < x)
    #           ∧
    #             (∀i: p < i < |points|: x ≤ points[i].x)
    #
    # replace linear search with a efficient one later
    p = 0
    while p < @points.length and @points[p].x < x
      p++
    # points[p].x ≥ x, one point too far
    p -= 1
    p

  can_add_point: (x, y) ->
    # Can the point (x, y) be added to this line?
    #
    # pre   : true
    # post  : true
    # return: min.x ≤ x ≤ max.x ∧ min.y ≤ y ≤ max.y ∧
    #         ( 
    #           (∃i,j: 0 ≤ i < j < |points|: 
    #             points[i].x < x < points[j].x ∧ points[i].line = none)
    #           ∨
    #             x < points[0].x 
    #           ∨ 
    #             points[|points|-1].x < x
    #         )
    result = false
    if (@min.x <= x <= @max.x) and (@min.y <= y <= @max.y)
      p = @find_point_to_the_left_of x
      if p is -1
        result = true
      else
        # there is a point to the left of x
        if p is @points.length - 1
          result = true
        else
          # x between the first and last point
          if @points[p+1].x isnt x and @points[p].segment.type is 'none'
            result = true
          else
            # if points[p+1].x = x ∨ points[p].segment.type ≠ none the point (x,y)
            # cannot be added              
            result = false
    else
      # x or y outside the boundaries: it cannot be added
      result = false

    result

  can_remove_point: (p) ->
    # Points that are not part of any line segment can be removed.
    #
    # pre   : 0 ≤ p < |points|
    # post  : true
    # return: p = 0 => points[p].segment.type = none 
    #       ∧ 
    #         p ≠ 0 => (points[p].segment.type = none ∧ points[p-1].segment.type = none)
    result = false

    if p is 0
      result = @points[0].segment.type is 'none'
    else
      if @points.length > 1
        # p > 0
        result = @points[p-1].segment.type is 'none' and @points[p].segment.type is 'none'

    result
  
  can_add_line: (x) ->
    # Can a line be drawn from the point left of x to the point right of x?
    #
    # pre   : min.x ≤ x ≤ max.x
    # post  : true
    # return: points[find_point_to_the_left_of(x)].segment.type = none 
    #       ∧ 
    #         find_point_to_the_left_of(x) < |points| - 1
    p = @find_point_to_the_left_of x
    -1 < p < @points.length - 1 and @points[p].segment.type is 'none'

  can_add_line_to_point: (p) ->
    # Can a line be drawn from p to the next point?
    #
    # pre   : 0 ≤ p < |points|
    # post  : true
    # return: points[p].segment.type = none ∧ p ≠ |points| - 1
    @points[p].segment.type is 'none' and p isnt @points.length

  can_remove_line_from_point: (p) ->
    # Can the line starting from point points[p] be removed?
    #
    # pre   : 0 ≤ p < |points| - 1
    # post  : true
    # return: points[p].segment.line ∈ {line,curve,freehand}
    (@points[p].segment.type isnt 'none')

  can_move_point: (p, x, y) ->
    # Can point p be moved to (x, y)?
    #
    # pre   : 0 ≤ p < |points|
    # post  : true
    # return: min.x ≤ x ≤ max.x
    #       ∧
    #         min.y ≤ y ≤ max.y
    #       ∧
    #         (∀i: 0 ≤ i < p: points[p].x < x)
    #       ∧
    #         (∀i: p < i < |points|: x < points[p].x)
    #
    result = false
    if @min.x <= x <= @max.x and @min.y <= y <= @max.y
      if 0 < p < @points.length - 1
        # there is a previous and next point
        if @points[p-1].x < x < @points[p+1].x
          result = true
      else
        # either a previous or next point or both aren't there
        if @points.length is 1
          # there is only one point
          result = true
        else
          # there is more than one point
          if p is 0
            result = x < @points[p+1].x
          else
            # p = |points| - 1
            result = @points[p-1].x < x
    result
  
  can_move_control_point: (p, x, y) ->
    # VVVV is not correct
    # Can point p be moved to (x, y)?
    #
    # pre   : 0 ≤ p < |points|
    # post  : true
    # return: min.x ≤ x ≤ max.x
    #       ∧
    #         min.y ≤ y ≤ max.y
    #
    result = false
    if @min.x <= x <= @.max.x and @min.y <= y <= @max.y
      result = true

      
    result

  # actions

  start_time: ->
    # start the history now, for example just before the graph becomes
    # visible
    @start_time = Date.now()

  add_point: (x, y, rep) ->
    # Add point (x,y) to this line
    #
    # pre   : can_add_point(x, y) ∧ p = find_point_to_the_left_of(x)
    # post  : (∀i: 0 ≤ i < p: points[i].x < point[p].x)
    #       ∧
    #         (∀i: p < i < |points|: point[p].x < points[i].x)
    # return: -
    p = @find_point_to_the_left_of x
    head = []
    head = @points[0..p] unless p < 0

    tail = if p is @points.length - 1 then [] else @points[p+1..]
    point =
      x: x
      y: y
      segment:
        type: 'none'
      representation: rep

    @points = head.concat point, tail

    if @record
      time = Date.now() - @start_time
      @history.push "AP#{p+1}:#{x},#{y}@#{time}"

    point

  remove_point: (p) ->
    # remove point points[p] from this line
    #
    # pre   : can_remove_point(p)
    # post  : (∀i: 0 ≤ i < |points|: points[p].x ≠ points[i].x)
    # return: -
    head = @points[0...p]
    tail = if p is @points.length - 1 then [] else @points[p+1..]
    @points = head.concat tail
    if @record
      time = Date.now() - @start_time
      @history.push "RP#{p}@#{time}"

  add_straight_line: (p) ->
    # add a straight line from points[p] to the next point
    #
    # pre   : can_add_line_to_point(p)
    # post  : points[p].segment.type = straight
    # return: -
    @points[p].segment.type = 'straight'
    if @record
      time = Date.now() - @start_time
      @history.push "AS#{p}@#{time}"


  add_curved_line: (p, d, left, right, lleft, lright) ->
    # add a curved line from points[p] to the next point
    #
    # pre   : can_add_line_to_point(p) 
    # post  : points[p].segment.type = straight 
    #       ∧ 
    #         points[p].segment.c1 = points[p].(x+d,y)
    #       ∧
    #         points[p].segment.c2 = points[p+1].(x-d,y)
    # return: -
    @points[p].segment.type = 'curve'
    @points[p].segment.c1 =
      x: @points[p].x + d
      y: @points[p].y
      representation: left
      line: lleft
    @points[p].segment.c2 =
      x: @points[p+1].x - d
      y: @points[p+1].y
      representation: right
      line: lright
    if @record
      time = Date.now() - @start_time
      @history.push "AC#{p}@#{time}"

  add_freehand_line: (p, path) ->
    # add a freehand line from points[p] to the next point
    #
    # pre   : can_add_line_to_point(p) 
    # post  : points[p].segment.type = freehand
    #       ∧
    #         points[p].segment.path = path
    # return: -
    @points[p].segment.type = 'freehand'
    @points[p].segment.path = path
    if @record
      time = Date.now() - @start_time
      @history.push "AF#{p}@#{time}"

  remove_line: (p) ->
    # remove line between points[p] and the next point, if any
    #
    # pre   : can_remove_line_from_point(p)
    # post  : points[p].segment.type = none
    @points[p].segment.type = 'none'
    if @record
      time = Date.now() - @start_time
      @history.push "RL#{p}@#{time}"

  move_point: (p, x, y, do_record = false) ->
    # Move point p to position (x, y)
    #
    # pre   : can_move_point(p)
    # post  : points[p].x = x ∧ points[p].y = y
    # return: -
    if not do_record
      @points[p].x = x
      @points[p].y = y
    if @record
      if do_record
        time = Date.now() - @start_time
        @history.push "MP#{p}:#{@move_buffer.x},#{@move_buffer.y}@#{time}"
      else
        @move_buffer =
          x: x
          y: y
    
  move_control_point1: (p, x, y, do_record = false) ->
    # Move control point of the line starting at p
    #
    # pre   : 0 ≤ p < |points| 
    #       ∧ 
    #         points[p].segment.type = curve
    #       ∧
    #         min.x ≤ x ≤ max.x
    #       ∧
    #         min.y ≤ y ≤ max.y
    # post  : p.segment.c1 = (x,y)
    # return: -
    if @min.x <= x <= @max.x and @min.y <= y <= @max.y
      if not do_record
        @points[p].segment.c1.x = x
        @points[p].segment.c1.y = y
    if @record
      if do_record
        time = Date.now() - @start_time
        @history.push "M1C#{p}:#{@move_buffer.x},#{@move_buffer.y}@#{time}"
      else
        @move_buffer =
          x: x
          y: y

  move_control_point2: (p, x, y, do_record = false) ->
    # Move control point of the line ending at p + 1
    #
    # pre   : 0 ≤ p < |points| - 1 
    #       ∧ 
    #         points[p].segment.type = curve
    #       ∧
    #         min.x ≤ x ≤ max.x
    #       ∧
    #         min.y ≤ y ≤ max.y
    # post  : p.segment.c2 = (x,y)
    # return: -
    if @min.x <= x <= @max.x and @min.y <= y <= @max.y
      if not do_record
        @points[p].segment.c2.x = x
        @points[p].segment.c2.y = y
    if @record
      if do_record
        time = Date.now() - @start_time
        @history.push "M2C#{p}:#{@move_buffer.x},#{@move_buffer.y}@#{time}"
      else
        @move_buffer =
          x: x
          y: y

  select_line: (p) ->
    # Select the line starting at p, assuming there is a line
    #
    # pre   : 0 ≤ p < |points| ∧ points[p].segment.type ≠ none 
    # post  : selected.line = p ∧ selected.point = -1
    # return: -
    @selected.line = p
    @selected.point = -1

  select_point: (p) ->
    # Select the point at p
    #
    # pre   : 0 ≤ p < |points|
    # post  : selected.point = p ∧ selected.line = -1
    # return: -
    @selected.point = p
    @selected.line = -1

  deselect: ->
    # Deselect the selected line or point, if any
    #
    # pre   : true
    # post  : selected.point = -1 ∧ selected.line = -1
    # return: -
    @selected.point = -1
    @selected.line = -1

  # Whole line functionality; fill in later

  to_path: ->
    # 
    #
    path = ''
    i = 0
    while i < @points.length
      p = @points[i]
      q = @points[i+1]
      switch p.segment.type
        when 'none'
          path += "M#{p.x},#{p.y}"
        when 'straight'
          path += "M#{p.x},#{p.y}L#{q.x},#{q.y}"
        when 'curve'
          path += "M#{p.x},#{p.y}C#{p.segment.c1.x},#{p.segment.c1.y},#{p.segment.c2.x},#{p.segment.c2.y},#{q.x},#{q.y}"
        when 'freehand'
          path += p.segment.path
      i++

    path




# 
# button.coffee (c) 2012 HT de Beer
#
# Make different kind of buttons:
#
# ∙ action button: perform an action when clicked
# ∙ switch button: switch a setting on or off
# ∙ group option buttons: select one option of the group
#
# I got icons from http://www.famfamfam.com/lab/icons/silk/. Refer back to
# that site to attribute their work


window.CoffeeGrounds = CoffeeGrounds ? {}
CoffeeGrounds.Button = class

  @WIDTH = 34
  @set_width: (width) ->
    @WIDTH = width
  
  @BASEPATH = '.'
  @set_base_path: (basepath = '.') ->
    @BASEPATH = basepath

  constructor: (@paper, button) ->
    @prop = @initialize_properties()
    @x = button?.x ? 0
    @y = button?.y ? 0
    @icon = button?.icon ? "none.png"
    @tooltip = button?.tooltip ? ""
    @draw()
  

  initialize_properties: ->
    {
      corners: 2
      normal:
        fill: 'white'
        stroke: 'silver'
        'fill-opacity': 1
        'stroke-opacity': 0.5
        'stroke-width': 0.5
      disabled:
        fill: 'gray'
        stroke: 'silver'
        'fill-opacity': 0.5
        'stroke-opacity': 0.8
      activated:
        'stroke-width': 2
        fill: 'yellow'
        stroke: 'gray'
        'fill-opacity': 0.25
        'stroke-opacity': 1
      switched_on:
        fill: 'purple'
        'stroke-width': 2
        stroke: 'gray'
        'fill-opacity': 0.25
        'stroke-opacity': 1
      highlight:
        fill: 'orange'
        stroke: 'gray'
        'fill-opacity': 0.5
        'stroke-opacity': 1
    }


  draw: ->
    width = CoffeeGrounds.Button.WIDTH
    @back = @paper.rect @x, @y, width, width
    @back.attr @prop.normal
    basepath = CoffeeGrounds.Button.BASEPATH
    @image = @paper.image "#{basepath}/#{@icon}.png", @x+1, @y+1, width - 2, width - 2
    @image.attr
      'font-family': 'sans-serif'
      'font-size': "#{width-2}px"
      title: @tooltip

    @elements = @paper.set @back, @image


CoffeeGrounds.ActionButton = class extends CoffeeGrounds.Button

  constructor: (@paper, button) ->
    super @paper, button
    @action = button?.action ? ->
      # nothing
    @elements.click @activate

  activate: =>
    @action()

  disable: ->
    @back.attr @prop.disabled
    @elements.unclick @activate

  enable: ->
    @back.attr @prop.normal
    @elements.click @activate
    
CoffeeGrounds.SwitchButton = class extends CoffeeGrounds.Button



  constructor: (@paper, button) ->
    super @paper, button
    @switched_on = button?.switched_on ? false
    @on_switch_on = button?.on_switch_on ? ->
      # nothing
    @on_switch_off = button?.on_switch_off ? ->
      # nothing

    if @switched_on
      @back.attr @prop.switched_on
      @on_switch_on()
    else
      @on_switch_off()
    @elements.click @switch

  switch: =>
    if @switched_on
      @switched_on = false
      @back.attr @prop.normal
      @on_switch_off()
    else
      @switched_on = true
      @back.attr @prop.switched_on
      @on_switch_on()
  
  disable: ->
    @back.attr @prop.disabled
    @elements.unclick @switch

  enable: ->
    @back.attr @prop.normal
    @elements.click @switch

CoffeeGrounds.OptionButton = class extends CoffeeGrounds.Button

  constructor: (@paper, button, @group) ->
    super @paper, button
    @value = button.value ? "no value given"
    @on_select = button?.on_select ? ->
      ""
    if button.chosen
      @back.attr @prop.activated
      @group.value = @value

    @elements.click @select

  select: =>
    for button in @group.buttons
      button.deselect()
    @back.attr @prop.activated
    @group.value = @value
    @on_select()

  deselect: ->
    @back.attr @prop.normal

  disable: ->
    @back.attr @prop.disabled
    @elements.unclick @select

  enable: ->
    @back.attr @prop.normal
    @elements.click @select

CoffeeGrounds.ButtonGroup = class

  constructor: (@paper, buttonlist) ->
    @buttons = []
    @value = ""
    for button in buttonlist
      @buttons.push new CoffeeGrounds.OptionButton @paper, button, @
    

  disable: ->
    for button in @buttons
      button.disable()

  enable: ->
    for button in @buttons
      button.enable()

  select: (button) ->
    for i in @buttons
      if i.value is button
        i.select()

  deselect: (button) ->
    for i in @buttons
      if i.value is button
        i.deselect()




#
# graph.coffee (c) 2012 HT de Beer
#
# version 0
#
# A graph is a Cartesian graphing tool for instructional activities for
# teaching primary calculus.
#
window.Graph = class

  constructor: (@paper, @x, @y, @width, @height, properties) ->
    @spec = @initialize_properties(properties)
    # There is less space for the lines
    @PADDING = 2
    @BUTTON_WIDTH = 34
    @POINT_WIDTH = 3
    CoffeeGrounds.Button.set_width @BUTTON_WIDTH
    @BUTTON_SEP = 5
    @GROUP_SEP = @BUTTON_WIDTH * 0.6
    @GRAPH_SEP = 15
    @AXIS_WIDTH = 40
    @GRAPH_HEIGHT = @height - @PADDING - @BUTTON_WIDTH - @GRAPH_SEP - @AXIS_WIDTH - @PADDING
    @GRAPH_WIDTH = @width - @PADDING - @AXIS_WIDTH - @PADDING
    @ORIGIN =
      x: @x + @PADDING + @AXIS_WIDTH
      y: @y + @PADDING + @BUTTON_WIDTH + @GRAPH_SEP + @GRAPH_HEIGHT

    @raster = @paper.path "M0,0"
    CoffeeGrounds.Button.set_base_path @spec.icon_path
    @actions = {
      normal:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'select'
          icon: 'edit-select'
          tooltip: 'Selecteer en beweeg punten'
          on_select: =>
            @change_mode 'normal'
          enabled: true
          default: true
        cursor: 'default'
      point:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit'
          icon: 'edit-node'
          tooltip: 'Zet een punt'
          on_select: =>
            @change_mode 'point'
          enabled: true
        cursor: 'crosshair'
      straight:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit'
          icon: 'straight-line'
          tooltip: 'Trek een rechte lijn'
          on_select: =>
            @change_mode 'straight'
          enabled: true
        cursor: 'default'
      curve:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit'
          icon: 'draw-bezier-curves'
          tooltip: 'Trek een kromme lijn'
          on_select: =>
            @change_mode 'curve'
          enabled: true
        cursor: 'default'
      remove:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit'
          icon: 'dialog-close'
          tooltip: 'Verwijder punt of lijn'
          on_select: =>
            @change_mode 'remove'
          enabled: true
        cursor: 'default'
      delta:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'inspect'
          icon: 'draw-triangle'
          tooltip: 'Bepaal de snelheid'
          on_select: =>
            @change_mode 'delta'
          enabled: true
        cursor: 'crosshair'
      sigma:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'inspect'
          icon: 'office-chart-area'
          tooltip: 'Bepaal de verandering'
          on_select: =>
            @change_mode 'sigma'
          enabled: true
        cursor: 'default'
      computer:
        button:
          type: 'switch'
          group: 'switch'
          icon: 'office-chart-line'
          tooltip: 'Laat computergrafiek zien / verberg'
          switched_on: false
          on_switch_on: =>
            @computer_graph.show()
            @computer_graph_shown = true
            deltapath = @computer_graph.attr('path')
            @deltaline.attr
              path: deltapath
          on_switch_off: =>
            @computer_graph.hide()
            @computer_graph_shown = false
            deltapath = @user_line.to_path()
            @deltaline.attr
              path: deltapath
      raster:
        button:
          type: 'switch'
          icon: 'view-grid'
          group: 'switch'
          tooltip: 'Laat raster zien / verberg'
          switched_on: true
          on_switch_on: =>
            @raster.show()
          on_switch_off: =>
            @raster.hide()
      export_png:
        button:
          type: 'action'
          icon: 'image-x-generic'
          group: 'export'
          tooltip: 'Download als een PNG afbeelding'
          action: =>
            #console.log "save as png"
      export_svg:
        button:
          type: 'action'
          icon: 'image-svg'
          group: 'export'
          tooltip: 'Download als een SVG afbeelding'
          action: =>
            @export_svg()
    }

    MARGIN = 20
    @x_axis = @spec.x_axis
    @x_axis.origin =
      x: @ORIGIN.x
      y: @ORIGIN.y
    @x_axis.width = @GRAPH_WIDTH
    @y_axis = @spec.y_axis
    @y_axis.origin =
      x: @ORIGIN.x
      y: @ORIGIN.y
    @y_axis.width = @GRAPH_HEIGHT


    @user_line = new CoffeeGrounds.Line @ORIGIN.x, @ORIGIN.y - @GRAPH_HEIGHT, @GRAPH_WIDTH, @GRAPH_HEIGHT, @x_axis.unit, @y_axis.unit, true
    @computer_line = new CoffeeGrounds.Line @ORIGIN.x, @ORIGIN.y - @GRAPH_HEIGHT, @GRAPH_WIDTH, @GRAPH_HEIGHT, @x_axis.unit, @y_axis.unit, false

    @delta_y = 50
    ticks = @parse_tickspath @y_axis.tickspath
    @delta_y = ticks.length * (ticks.distance / @y_axis.unit.per_pixel)

    @draw()

    @mode = 'normal'
    @click = ''
    if @spec.computer_graph
      @computer_graph_shown = true
      @computer_graph.show()
    else
      @computer_graph_shown = false
      @computer_graph.hide()
    @points_draggable = false
    @cp_points_draggable = false
    @elements.mouseover @mouseover
    @elements.mouseout @mouseout
      
    @deltaline.mouseover @delta_over
    @deltaline.mousemove @delta_move
    @deltaline.mouseout @delta_out


  get_user_line: ->
    @user_line

  set_user_line: (line) ->
    @user_line = line
    @user_graph.attr
      path: @user_line.to_path()


  delta_over: (e, x, y) =>
    @deltaline.attr
      cursor: 'none'
    @delta_move e, x, y
    

  delta_move: (e, x, y) =>
    p = @fit_point x, y

    if p.x > @user_line.min.x + 1
      # ensure that there is a path to measure

      EPSILON = 0.5
      patharr = @deltaline.attr 'path'
      path = ("#{seg[0]}#{seg[1..].join(',')}" for seg in patharr).join ""

      length = 0
      bigstep = 50
      mx_length = @deltaline.getTotalLength()
      while length < (mx_length - bigstep) and @deltaline.getPointAtLength(length).x < p.x
        length += bigstep

      # found lengt-interval: start from length - bigstep

      length -= bigstep
      while length < mx_length and Math.abs(@deltaline.getPointAtLength(length).y - p.y) > EPSILON and @deltaline.getPointAtLength(length).x < p.x
        length++

      
      point = @deltaline.getPointAtLength length
      pointn = @deltaline.getPointAtLength length+1

      if point.x and pointn.x and point.y and pointn.y
        dy = pointn.y - point.y
        dx = pointn.x - point.x
        if dx and dy
          @deltapoint.attr
            cx: point.x
            cy: point.y
          @deltapoint.show()

          # factor determines the height of the 'longdrink-line'  on the
          # y-axis. Try to get 2 units on the y-axis
          factor = @delta_y / dy / 2

          @delta_ll.attr
            path: "M#{point.x - dx*factor},#{point.y - dy*factor}L#{point.x + dx*factor},#{point.y + dy*factor}"
          @delta_ll.show()

          @dyh.attr
            path: "M#{@user_line.min.x},#{point.y + dy*factor}L#{point.x + dx*factor},#{point.y + dy*factor}"
          @dyl.attr
            path: "M#{@user_line.min.x},#{point.y - dy*factor}L#{point.x - dx*factor},#{point.y - dy*factor}"
          @dxl.attr
            path: "M#{point.x - dx*factor},#{@user_line.max.y}L#{point.x - dx*factor},#{point.y - dy*factor}"
          @dxh.attr
            path: "M#{point.x + dx*factor},#{@user_line.max.y}L#{point.x + dx*factor},#{point.y + dy*factor}"
          @dyh.show()
          @dyl.show()
          @dxh.show()
          @dxl.show()





  delta_out: (e, x, y) =>
    @deltapoint.hide()
    @delta_ll.hide()
    @dyh.hide()
    @dyl.hide()
    @dxh.hide()
    @dxl.hide()
    @deltaline.attr
      cursor: @actions[@mode].cursor


  initialize_properties: (properties) ->
    # Initialize properties with properties or default values
    p = {}
    p.x_axis = properties.x_axis
    p.y_axis = properties.y_axis
    p.raster = true
    p.buttons = properties?.buttons ? ['normal', 'point', 'straight', 'curve', 'remove', 'delta', 'computer', 'raster']
    p.point = {}
    p.point.size = properties?.point?.size ? 2
    p.icon_path = properties?.icon_path ? 'lib/icons'
    p.computer_graph = properties?.computer_graph ? false
    p.editable = properties?.editable ? true

    if not p.editable
      for button, index in p.buttons
        if button in ['point', 'straight', 'curve', 'remove', 'normal']
          delete p.buttons[index]
    p


  fit_point: (x, y) ->
    point =
      x: x - @paper.canvas.parentNode.offsetLeft
      y: y - @paper.canvas.parentNode.offsetTop
    point

  mouseout: (e, x, y) =>
    @elements.unmousemove @mousemove
    @reset_mouse()

  mouseover: (e, x, y) =>
    @elements.mousemove @mousemove

  mousemove: (e, x, y) =>
    p = @fit_point x, y
    @elements.attr
      cursor: @actions[@mode].cursor
    switch @mode
      when 'normal'
        @reset_mouse()

      when 'point'
        if @user_line.can_add_point p.x, p.y
          # Add click handler to add points
          if @click isnt @mode
            @elements.click @add_point
            @click = @mode
        else
          @elements.attr
            cursor: 'not-allowed'
          
      when 'straight'
        if @user_line.can_add_line p.x
          if @click isnt @mode
            @elements.click @add_line
            @click = @mode
          q = @user_line.find_point_to_the_left_of p.x
          left = @user_line.get_point q
          right = @user_line.get_point q+1
          @potential_line.attr
            path: "M#{left.x},#{left.y}L#{right.x},#{right.y}"
            stroke: 'green'
          @potential_line.show()
        else
          @reset_mouse()
          @elements.attr
            cursor: 'not-allowed'

      when 'curve'
        if @user_line.can_add_line p.x
          if @click isnt @mode
            @elements.click @add_curve
            @click = @mode
          q = @user_line.find_point_to_the_left_of p.x
          left = @user_line.get_point q
          right = @user_line.get_point q+1
          d = (right.x - left.x)/4
          @potential_line.attr
            path: "M#{left.x},#{left.y}C#{left.x+d},#{left.y},#{right.x-d},#{right.y},#{right.x},#{right.y}"
            stroke: 'gold'
          @potential_line.show()
        else
          q = @user_line.find_point_to_the_left_of p.x
          r = @user_line.get_point q unless q is -1
          if q isnt -1 and r.segment.type is 'curve'
            @potential_line.hide()
            # show control points
            #
          else
            @reset_mouse()
            @elements.attr
              cursor: 'not-allowed'

      when 'remove'
        q = @user_line.find_point_to_the_left_of p.x
        r = @user_line.find_point_near p.x, p.y, @POINT_WIDTH * 5
        @remove_line.hide()
        @remove_point.hide()
        if r isnt -1
          if @user_line.can_remove_point r
            if @click isnt @mode
              @elements.click @remove
              @click = @mode
            s = @user_line.get_point r
            @remove_point.attr
              cx: s.x
              cy: s.y
            @remove_point.show()
        else if q isnt -1
          if @user_line.can_remove_line_from_point q
            if @click isnt @mode
              @elements.click @remove
              @click = @mode
            r = @user_line.get_point q
            s = @user_line.get_point q + 1
            @remove_line.attr
              x: r.x
              width: s.x - r.x
            @remove_line.show()
        else
          @reset_mouse()
          @elements.attr
            cursor: 'not-allowed'
      when 'sigma'
        a = 1
    @user_graph.attr
      path: @user_line.to_path()
  
  add_point: (e, x, y) =>
    p = @fit_point x, y
    #    point = new CoffeeGrounds.Point @paper, p.x, p.y
    point = @paper.circle p.x, p.y, @POINT_WIDTH * 2
    point.attr
      fill: 'blue'
      stroke: 'blue'
      'fill-opacity': 0.3
    q = @user_line.add_point p.x, p.y, point
    point.drag @move_point(@, q), @move_point_start, @move_point_end(@, q)

  make_draggable: ->
    @points_draggable = @points_draggable ? false
    if not @points_draggable
      for point in @user_line.points
        point.representation.drag @move_point(@, point), @move_point_start, @move_point_end(@, point)
        point.representation.attr
          fill: 'blue'
          stroke: 'blue'
          r: @POINT_WIDTH * 2
          'fill-opacity': 0.3
      @points_draggable = true

  move_point: (graph, point) ->
    return (dx, dy, x, y, e) =>
      tx = dx - graph.dpo.x
      ty = dy - graph.dpo.y
      p = graph.user_line.find_point_at point.x
      newp =
        x: point.x + tx
        y: point.y + ty
      if graph.user_line.can_move_point p, newp.x, newp.y
        graph.user_line.move_point p, newp.x, newp.y
        graph.dpo =
          x: dx
          y: dy
        point.representation.attr
          cx: point.x
          cy: point.y
        graph.user_graph.attr
          path: graph.user_line.to_path()
      else
        # cannot move point: stay

  move_point_start: (x, y, e) =>
    @dpo = @dpo ? {}
    @dpo =
      x: 0
      y: 0

  move_point_end: (graph, point) ->
    return (e) =>
      graph.user_graph.attr
        path: graph.user_line.to_path()
      p = graph.user_line.find_point_at point.x
      graph.user_line.move_point p, 0, 0, true

  make_undraggable: ->
    @points_draggable = @points_draggable ? false
    if @points_draggable
      for point in @user_line.points
        point.representation.undrag()
        point.representation.attr
          fill: 'black'
          stroke: 'black'
          r: @POINT_WIDTH
          'fill-opacity': 1
      @points_draggable = false



  reset_mouse: ->
    # click handlers removed
    @click = ''
    @elements.unclick @remove
    @elements.unclick @add_point
    @elements.unclick @add_line
    @elements.unclick @add_curve

    
    # hide all helping lines, points, and the like
    @potential_line.hide()
    @remove_point.hide()
    @remove_line.hide()


  remove: (e, x, y) =>

    p = @fit_point x, y
    q = @user_line.find_point_near p.x, p.y, @POINT_WIDTH * 5
    if q >= 0
      if @user_line.can_remove_point(q)
        r = @user_line.get_point q

        r.representation.remove()
        @user_line.remove_point q
        @user_graph.attr
          path: @user_line.to_path()
        @remove_line.hide()
        @remove_point.hide()
    else
      q = @user_line.find_point_to_the_left_of p.x
      if q >= 0 and @user_line.can_remove_line_from_point q
        r = @user_line.get_point q

        if r.segment.type is 'curve'
          r.segment.c1.representation.remove()
          r.segment.c2.representation.remove()
          r.segment.c1.line.remove()
          r.segment.c2.line.remove()
        @user_line.remove_line q
        @user_graph.attr
          path: @user_line.to_path()

        @remove_line.hide()
        @remove_point.hide()


  add_line: (e, x, y) =>
    p = @fit_point x, y
    q = @user_line.find_point_to_the_left_of p.x
    @user_line.add_straight_line q
    @user_graph.attr
      path: @user_line.to_path()
  
  add_curve: (e, x, y) =>
    p = @fit_point x, y
    q = @user_line.find_point_to_the_left_of p.x
    left = @user_line.get_point q
    right = @user_line.get_point q+1
    d = (right.x - left.x)/4
    cleft = @paper.circle left.x + d, left.y, @POINT_WIDTH * 2
    cleft.attr
      fill: 'gold'
      stroke: 'gold'
      'fill-opacity': 0.3
    cleft.drag @move_control_point(@, left, right, cleft, 1), @move_control_point_start, @move_control_point_end(@, left, cleft, 1)
    clleft = @paper.path "M#{left.x},#{left.y}L#{left.x + d},#{left.y}"
    clleft.attr
      stroke: 'gold'
      'stroke-dasharray': '.'
    cright = @paper.circle right.x - d, right.y, @POINT_WIDTH * 2
    cright.attr
      fill: 'gold'
      stroke: 'gold'
      'fill-opacity': 0.3
    cright.drag @move_control_point(@, left, right, cright, 2), @move_control_point_start, @move_control_point_end(@, left, cright, 2)
    clright = @paper.path "M#{right.x},#{right.y}L#{right.x - d},#{right.y}"
    clright.attr
      stroke: 'gold'
      'stroke-dasharray': '.'
    @user_line.add_curved_line q, d, cleft, cright, clleft, clright
    @user_graph.attr
      path: @user_line.to_path()



  change_mode: (mode) ->
    @mode = mode
    @elements.attr
      cursor: @actions[@mode].cursor
    @reset_mouse()
    if @mode is 'point'
      @make_draggable()
    else
      @make_undraggable()
    if @mode is 'curve'
      @make_cp_draggable()
    else
      @make_cp_undraggable()
    if @mode is 'delta'
      # remove element from target list
      @elements.unmouseover @mouseover
      @elements.unmouseout @mouseout
      @elements.unmousemove @mousemove

      if @computer_graph_shown
        deltapath = @computer_graph.attr('path')
      else
        deltapath = @user_line.to_path()
      @deltaline.attr
        path: deltapath
      @deltaline.toFront().show()

    else
      # Make elements a target again
      @elements.mouseover @mouseover
      @elements.mouseout @mouseout
      @deltaline.hide()
      

  make_cp_undraggable: ->
    @cp_points_draggable = @cp_points_draggable ? false
    if @cp_points_draggable
      for point in @user_line.points
        s = point.segment
        if s.type is 'curve'
          point.segment.c1.representation.hide()
          point.segment.c2.representation.hide()
          point.segment.c1.line.hide()
          point.segment.c2.line.hide()
      @cp_points_draggable = false
  
  make_cp_draggable: ->
    @cp_points_draggable = @cp_points_draggable ? false
    if not @cp_points_draggable
      for point in @user_line.points
        s = point.segment
        if s.type is 'curve'
          point.segment.c1.representation.attr
            cx: point.segment.c1.x
            cy: point.segment.c1.y
          point.segment.c1.representation.show()
          point.segment.c2.representation.attr
            cx: point.segment.c2.x
            cy: point.segment.c2.y
          point.segment.c2.representation.show()
          point.segment.c1.line.attr
            path: "M#{point.x},#{point.y}L#{point.segment.c1.x},#{point.segment.c1.y}"
          point.segment.c1.line.show()
          next_point = @user_line.get_point(@user_line.find_point_at(point.x) + 1)
          point.segment.c2.line.attr
            path: "M#{next_point.x},#{next_point.y}L#{point.segment.c2.x},#{point.segment.c2.y}"
          point.segment.c2.line.show()
      @cp_points_draggable = true


  export_svg: ->
    # save this graph to an svg file; taken from:
    # http://stackoverflow.com/questions/10120975/how-to-save-an-svg-generated-by-raphael
    # Find out later how this works
    svgString = @paper.toSVG() 
    a = document.createElement('a')
    a.download = 'mySvg.svg'
    a.type = 'image/svg+xml'
    bb = new (window.BlobBuilder ? WebKitBlobBuilder)
    bb.append svgString
    blob = bb.getBlob 'image/svg+xml'
    a.href = (window.URL ? webkitURL).createObjectURL blob
    a.click()



  hide: ->
    @elements.hide()

  show: ->
    @elements.show()


  draw: ->
    @elements = @paper.set()
    @elements.push @draw_pane false
    @elements.push @draw_axis @x_axis
    @elements.push @draw_axis @y_axis
    @elements.push @draw_raster @x_axis, @y_axis if @spec?.raster
    @computer_graph = @paper.path "M0,0"
    @computer_graph.attr
      stroke: 'dodgerblue'
      'stroke-width': 2
    @elements.push @computer_graph
    @computer_graph.hide()
    @user_graph = @paper.path "M0,0"
    @user_graph.attr
      stroke: 'black'
      'stroke-width': 2
    @potential_line = @paper.path "M0,0"
    @potential_line.attr
      stroke: 'blue'
      'stroke-opacity': 0.5
      'stroke-width': 2
      'stroke-dasharray': '.'
    @potential_line.hide()
    @remove_point = @paper.circle 0, 0, 12
    @remove_point.attr
      stroke: 'red'
      fill: 'red'
      'fill-opacity': 0.25
    @remove_point.hide()
    @remove_line = @paper.rect 0, @ORIGIN.y - @GRAPH_HEIGHT, 0, @GRAPH_HEIGHT
    @remove_line.attr
      stroke: 'red'
      fill: 'red'
      'fill-opacity': 0.25
    @remove_line.hide()
    @deltaline = @paper.path "M0,0"
    @deltaline.attr
      'stroke-width': 15
      stroke: 'green'
      'stroke-opacity': 0
    @deltaline.hide()
    @delta_ll = @paper.path "M0,0"
    @delta_ll.attr
      stroke: 'orange'
      'stroke-width': 3
    @delta_ll.hide()
    @deltapoint = @paper.circle 0, 0, 3
    @deltapoint.attr
      fill: 'gray'
    @deltapoint.hide()
    @dyh = @paper.path "M0,0"
    @dyh.attr
      stroke: 'orange'
      'stroke-dasharray': '-'
    @dyh.hide()
    @dyl = @paper.path "M0,0"
    @dyl.attr
      stroke: 'orange'
      'stroke-dasharray': '-'
    @dyl.hide()
    @dxh = @paper.path "M0,0"
    @dxh.attr
      stroke: 'orange'
      'stroke-dasharray': '-'
    @dxh.hide()
    @dxl = @paper.path "M0,0"
    @dxl.attr
      stroke: 'orange'
      'stroke-dasharray': '-'
    @dxl.hide()
    @elements.push @deltapoint, @delta_ll, @dyh, @dyl, @dxh, @dxl

    @draw_buttons()
    @elements.push @user_graph, @potential_line, @remove_point, @remove_line
    @elements.push @draw_pane true
    @elements.push @deltaline
     
  move_control_point: (graph, point, point2, cp, kind) ->
    return (dx, dy, x, y, e) =>
      tx = dx - graph.dpo.x
      ty = dy - graph.dpo.y
      p = graph.user_line.find_point_at point.x
      newp =
        x: cp.attr('cx') + tx
        y: cp.attr('cy') + ty
      if graph.user_line.can_move_control_point p, newp.x, newp.y
        if kind is 1
          graph.user_line.move_control_point1 p, newp.x, newp.y
          point.segment.c1.line.attr
            path: "M#{point.x},#{point.y}L#{newp.x},#{newp.y}"
        else if kind is 2
          graph.user_line.move_control_point2 p, newp.x, newp.y
          point.segment.c2.line.attr
            path: "M#{point2.x},#{point2.y}L#{newp.x},#{newp.y}"
        graph.dpo =
          x: dx
          y: dy
        cp.attr
          cx: newp.x
          cy: newp.y

        graph.user_graph.attr
          path: graph.user_line.to_path()
      else
        # cannot move point: stay

  move_control_point_start: (x, y, e) =>
    @dpo = @dpo ? {}
    @dpo =
      x: 0
      y: 0

  move_control_point_end: (graph, point, cp, kind) ->
    return (x, y, e) =>
      graph.user_graph.attr
        path: graph.user_line.to_path()
      p = graph.user_line.find_point_at point.x
      switch kind
        when 1
          graph.user_line.move_control_point1 p, 0, 0, true
        when 2
          graph.user_line.move_control_point2 p, 0, 0, true


  switch_mode: (mode) ->
    @mode = mode
  draw_buttons:  ->
    x = @ORIGIN.x
    y = @ORIGIN.y - @GRAPH_HEIGHT - @GRAPH_SEP - @BUTTON_WIDTH
    @mode = ""

    
    group = ''
    optiongroups = {}
    sep = 0
    @buttons = {}
    for name, action of @actions
      if name in @spec.buttons
        # only those buttons set are put on the graph
        button = action.button

        if group isnt ''
          if button.group is group
            x += @BUTTON_WIDTH + @BUTTON_SEP
          else
            x += @BUTTON_WIDTH + @GROUP_SEP
        group = button.group



        switch button.type
          when 'action'
            @buttons.name = new CoffeeGrounds.ActionButton @paper,
              x: x
              y: y
              icon: button.icon
              tooltip: button.tooltip
              action: button.action
          when 'switch'
            @buttons.name = new CoffeeGrounds.SwitchButton @paper,
              x: x
              y: y
              icon: button.icon
              tooltip: button.tooltip
              switched_on: button?.switched_on ? false
              on_switch_on: button.on_switch_on
              on_switch_off: button.on_switch_off
          when 'group'
            optiongroups[button.option_group] = optiongroups[button.option_group] ? []
            optiongroups[button.option_group].push {
              x: x
              y: y
              icon: button.icon
              tooltip: button.tooltip
              value: name
              on_select: button.on_select
              chosen: button.default ? false
            }


    # Add and create buttongroups
    for name, optiongroup of optiongroups
      buttongroup = new CoffeeGrounds.ButtonGroup @paper, optiongroup
      for button in buttongroup.buttons
        @buttons[button.value] = button

    


    

  draw_pane: (glass = false) ->
    pane = @paper.rect @ORIGIN.x, @ORIGIN.y - @GRAPH_HEIGHT, @GRAPH_WIDTH, @GRAPH_HEIGHT
    if glass
      pane.attr
        fill: 'white'
        opacity: 0
        stroke: 'white'
        cursor: 'default'
    else
      pane.attr
        fill: 'white'
        stroke: 'white'
        cursor: 'default'
    pane
    
  draw_raster: (x_axis, y_axis) ->
    # Draw the raster
    origin = x_axis.origin
    path = "M#{origin.x},#{origin.y}"

    x_ticks = @parse_tickspath x_axis.tickspath
    distance = x_ticks.distance / x_axis.unit.per_pixel
    d = i = 0
    while d < x_axis.width - distance
      d += distance
      path += "M#{origin.x + d},#{origin.y}v-#{y_axis.width}"
      i = (i + 1) % x_ticks.length
    
    y_ticks = @parse_tickspath y_axis.tickspath
    distance = y_ticks.distance / y_axis.unit.per_pixel
    d = i = 0
    while d < y_axis.width - distance
      d += distance
      path += "M#{origin.x},#{origin.y - d}h#{x_axis.width}"
      i = (i + 1) % y_ticks.length

    @raster = @paper.path path
    @raster.attr
      stroke: 'silver'
      'stroke-opacity': 0.5
      'stroke-width': 0.5
    @raster


  draw_axis: (axis) ->
    # Draw axis: line, ticks, and labels
    
    TICKSLENGTH = @spec?.tickslength ? 10
    LABELSEP = @spec?.labelsep ? 5
    AXISLABELSEP = @spec?.axislabelsep ? 30

    labels = @paper.set()

    origin = axis.origin

    # The axis starts at the origin
    path = "M#{origin.x},#{origin.y}"
    if axis.orientation is 'vertical'
      path += "v-#{axis.width}"
    else
      # axis.orientation is horizontal
      path += "h#{axis.width}"


    ticks = @parse_tickspath axis.tickspath
    # distance between ticks in pixels
    distance = ticks.distance / axis.unit.per_pixel

    d = i = label = 0
    while d < axis.width - distance
      # for each subsequent tick until the end of the axis
      d += distance
      label += ticks.distance
      if axis.orientation is 'vertical'
        path += "M#{origin.x},#{origin.y - d}h-"
        if ticks[i].label
          if @y_axis.unit.symbol is 'cm/ml'
            labels.push @paper.text origin.x - TICKSLENGTH - LABELSEP*2, origin.y - d, "#{label.toFixed(1)}"
          else
            labels.push @paper.text origin.x - TICKSLENGTH - LABELSEP*2, origin.y - d, "#{label}"
      else
        # axis.orientation is horizontal
        path += "M#{origin.x + d},#{origin.y}v"
        if ticks[i].label
          flabel = if (label * 10)%10 is 0 then label else label.toFixed(1)
          labels.push @paper.text origin.x + d, origin.y + TICKSLENGTH + LABELSEP, "#{flabel}"
      if ticks[i].size is 'small'
        path += "#{TICKSLENGTH / 2}"
      else
        # size is large
        path += "#{TICKSLENGTH}"
        
      i = (i + 1) % ticks.length

    # label the origin
    labels.push @paper.text origin.x - LABELSEP, origin.y + LABELSEP, "0"

    # label the axis
    axis_label = @paper.text 0, 0, axis.label
    axis_label.attr
      'font-size': 14
      'text-anchor': 'start'
    albb = axis_label.getBBox()
    axis_label.attr
      x: origin.x + axis.width - albb.width
      y: origin.y + AXISLABELSEP
    if axis.orientation is 'vertical'
      axis_label.transform "r-90,#{origin.x},#{origin.y}t0,-#{2.25*AXISLABELSEP}"

    
    labels.forEach (l) ->
      l.attr
        'font-size': 12
    @paper.set @paper.path(path), labels



  parse_tickspath: (s) ->
    # tickspath ::= <number> ( t|T|l|L )+
    # with:
    #   ∙ number: the distance in units between ticks. Ticks are all
    #             equally spaced
    #   ∙ subseqent ticks specified by:
    #     ∙ t: small tick, no label
    #     ∙ T: large tick, no label
    #     ∙ l: small tick, with label
    #     ∙ L: large tick, with label
    #
    # the pattern will be repeated until the end of the axis
    #
    # return: array of subsequent ticks (without repetition)
    #
    pattern = /(\d+(?:\.\d+)?)((?:t|T|l|L)+)/
    match = pattern.exec s
    ticklength = parseFloat match[1]
    tickpattern = match[2]
    ticks = []
    ticks.distance = ticklength
    for c in tickpattern
      tick = {}
      switch c
        when 't'
          tick.label = false
          tick.size = 'small'
        when 'T'
          tick.label = false
          tick.size = 'large'
        when 'l'
          tick.label = true
          tick.size = 'small'
        when 'L'
          tick.label = true
          tick.size = 'large'
      ticks.push tick

    ticks

