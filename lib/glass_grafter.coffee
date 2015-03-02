#
# contour_line.coffee (c) 2012 HT de Beer
#
# A contour line models the right-hand side of a glass. A contour line is a
# list of points. A point has the following properties:
#
#   ∙ x, the x coordinate
#   ∙ y, the y coordinate
#   ∙ border, border ∈ {none, foot, stem, bowl, edge}
#   ∙ segment, the line segment starting from this point to the next, if
#              there is a next point. A segment has the following
#              properties:
#     ∙ type, type ∈ {straight, curve}
#     ∙ c1, control point for this point, only when type = curve
#       ∙ x, the x coordinate of the control point
#       ∙ y, the y coordinate of the control point
#     ∙ c2, control point for the next point, only when type = curve
#       ∙ x, the x coordinate of the control point
#       ∙ y, the y coordinate of the control point
#
# For a contour line the followin holds:
#
#   min.y ≤ edge.y ≤ bowl.y ≤ stem.y ≤ foot.y = max.y
# ∧
#   (∀p: 0 ≤ p < |points| - 1: points[p].y < points[p+1].y)
# ∧
#   (∀p: 0 ≤ p < |points|: mid.x ≤ points[p].x ≤ max.x)
#   
window.CoffeeGrounds = CoffeeGrounds ? {}
CoffeeGrounds.ContourLine = class

  constructor: (left, top, width, height, @mm_per_pixel, @record = false) ->
    @mid =
      x: left
      y: Math.floor(top + height/2)
    @min =
      x: left - width
      y: top
      width: 25
    @max =
      x: left + width
      y: top + height

    # initial borders
    FOOTHEIGHT = 20
    STEMWIDTH = 10
    STEMHEIGHT = 20
    @foot =
      x: Math.floor(@mid.x + width/3)
      y: @max.y
      border: 'foot'
      segment:
        type: 'straight'
        c1:
          x: 0
          y: 0
        c2:
          x: 0
          y: 0
    @stem =
      x: Math.floor(@mid.x + width/3)
      y: Math.floor(@max.y - FOOTHEIGHT)
      border: 'stem'
      segment:
        type: 'straight'
        c1:
          x: 0
          y: 0
        c2:
          x: 0
          y: 0
    @bowl =
      x: Math.floor(@mid.x + width/3)
      y: Math.floor(@max.y - (FOOTHEIGHT + STEMHEIGHT))
      border: 'bowl'
      segment:
        type: 'straight'
        c1:
          x: 0
          y: 0
        c2:
          x: 0
          y: 0
    @edge =
      x: Math.floor(@mid.x + width/3)
      y: Math.floor(@max.y - (height/2))
      border: 'edge'
      segment:
        type: 'straight'
        c1:
          x: 0
          y: 0
          line: null
          representation: null
        c2:
          x: 0
          y: 0
          line: null
          representation: null
    @points = [@edge, @bowl, @stem, @foot]




  # queries
  get_point: (p) ->
    @points[p]

  get_point_above_height: (h) ->
    p = 0
    while p < @points.length and @points[p].y < h
      p++
    p - 1


  can_add_point: (x, y) ->
    # if x, y on the line: true
    #
    result = false
    p = @get_point_above_height y
    if p isnt -1
      point = @points[p]
      if point.y is y
        # point already exists
        result = false
      else
        # Not already a point
        result = true
    result
    


  can_remove_point: (p) ->
    @points[p].border is 'none'

  can_move_point: (p, x, y, r = 1) ->
    result = false
    if @mid.x + r <= x <= @max.x and @min.y <= y <= @max.y
      if 0 < p < @points.length - 1
        # there is a previous and next point
        if @points[p-1].y + r < y < @points[p+1].y - r
          result = true
      else
        if p is 0
          result = y < @points[p+1].y and x >= (@mid.x + @min.width)
        else
          # p = |points| - 1
          result = @points[p-1].y < y
    result
    
  can_move_control_point: (p, x, y) ->
    if p < @points.length - 1
      above = @points[p]
      below = @points[p+1]
      return @mid.x <= x <= @max.x and above.y <= y <= below.y
    else
      return false


  can_move_border: (border, x, y) ->

  find_point_at: (y, r = 1) ->
    p = 0
    while p < @points.length and not((y - r) <= @points[p].y <= (y + r))
      p++
    p = if p is @points.length then -1 else p

  find_point_near: (x, y, r = 1) ->
    # Find a point, if any, in the circle with origin x, y and radius r

    found = -1
    ar = 0
    while found is -1 and ar < r
      found = Math.max(@find_point_at(y + ar), @find_point_at(y - ar))
      if found isnt -1 and x - ar <= @points[found].x  <= x + ar
        break
      else
        found = -1
      ar++
    found
      
  # actions
  add_point: (x, y, representation) ->
    p = @get_point_above_height y
    # it never is the first or last point
    head = []
    head = @points[0..p] unless p < 0

    tail = @points[p+1..]
    above = @points[p]
    below = @points[p+1]
    point =
      x: x
      y: y
      border: 'none'
      segment:
        type: 'straight'
        c1:
          x: 0
          y: 0
          line: null
          representation: null
        c2:
          x: 0
          y: 0
          line: null
          representation: null
      representation: representation
    above.segment.c2.y = y - Math.abs(above.segment.c2.y - below.y)

    @points = head.concat point, tail
    point


  remove_point: (p) ->
    head = @points[0...p]
    tail = if p is @points.length - 1 then [] else @points[p+1..]
    @points = head.concat tail

  move_point: (p, x, y) ->
    @points[p].x = x
    @points[p].y = y
    if @points[p].segment.type is 'curve'
      @set_control_points p
    if p isnt 0 and @points[p-1].segment.type is 'curve'
      @set_control_points (p-1)

  set_control_points: (p) ->
    if p isnt @points.length - 1
      above = @points[p]
      below = @points[p+1]
      dxc1 = Math.abs(@mid.x - above.x)/2
      dxc2 = Math.abs(@mid.x - below.x)/2
      dy = Math.abs(above.y - below.y)/4
      above.segment.c1.x = above.x - dxc1
      above.segment.c1.y = above.y + dy
      above.segment.c2.x = below.x - dxc2
      above.segment.c2.y = below.y - dy


  make_curve: (p) ->
    point_segment = @points[p].segment
    point_segment.type = 'curve'
    @set_control_points p


  make_straight: (p) ->
    @points[p].segment.type = 'straight'
    @points[p].segment.c1.representation.remove()
    @points[p].segment.c1.line.remove()
    @points[p].segment.c2.line.remove()
    @points[p].segment.c2.representation.remove()
    @points[p].segment.c1.representation = null
    @points[p].segment.c1.line = null
    @points[p].segment.c2.line = null
    @points[p].segment.c2.representation = null


  move_control_point: (p, cp, x, y) ->
    
    if cp is 1
      point = @points[p].segment.c1
    else
      point = @points[p].segment.c2

    point.x = x
    point.y = y


  move_border: (border, x, y) ->

  # line actions
  to_path: ->
    # There are at least four points
    p = @points[0]
    path = "M#{p.x},#{p.y}"
    i = 0
    while i < @points.length - 1
      p = @points[i]
      q = @points[i+1]
      switch p.segment.type
        when 'straight'
          path += "L#{q.x},#{q.y}"
        when 'curve'
          path += "C#{p.segment.c1.x},#{p.segment.c1.y},#{p.segment.c2.x},#{p.segment.c2.y},#{q.x},#{q.y}"
      i++

    path
    

  to_glass_path: (part = 'full') ->
    
    i = 0
    switch part
      when 'full'
        i = 0
      when 'base'
        while @points[i].border isnt 'bowl'
          i++

    p = @points[i]
    path = "M#{p.x},#{p.y}"
    while i < @points.length - 1
      p = @points[i]
      q = @points[i+1]
      switch p.segment.type
        when 'straight'
          path += "L#{q.x},#{q.y}"
        when 'curve'
          path += "C#{p.segment.c1.x},#{p.segment.c1.y},#{p.segment.c2.x},#{p.segment.c2.y},#{q.x},#{q.y}"
      i++

    # mirror
    mid = @mid
    mirror = (x) ->
      x - 2*(x-mid.x)
    p = @points[i]
    path += "H#{mirror(p.x)}"
    while i > 0
      p = @points[i]
      q = @points[i-1]
      if part is 'base' and p.border is 'bowl'
        path += "H#{p.x}H#{mirror(p.x)}"
        break

      switch q.segment.type
        when 'straight'
          path += "L#{mirror(q.x)},#{q.y}"
        when 'curve'
          path += "C#{mirror(q.segment.c2.x)},#{q.segment.c2.y},#{mirror(q.segment.c1.x)},#{q.segment.c1.y},#{mirror(q.x)},#{q.y}"
      i--

    path
    
  to_glass: (spec) ->
    height_in_mm = Math.floor((@foot.y - @edge.y) * @mm_per_pixel)
    path = @to_relative_path()
    midfoot =
      x: @mid.x
      y: @foot.y
    midstem =
      x: @mid.x
      y: @stem.y
    midbowl =
      x: @mid.x
      y: @bowl.y
    midedge =
      x: @mid.x
      y: @edge.y
    glass = new Glass path, midfoot, midstem, midbowl, midedge, height_in_mm, spec
    glass

  from_glass: (glass)->
    # put glass as relative path in path
    # Computer glass's mm_per_pixel
    mm_per_pixel = glass.height_in_mm / (glass.foot.y - glass.edge.y)
    factor = @mm_per_pixel / mm_per_pixel
    # now compute 


    
  to_relative_path: ->
    path = @to_path()
    relsegs = Raphael.pathToRelative path
    relpath = ""
    for seg in relsegs
      for elt in seg
        relpath += "#{elt} "

    relpath.replace /\s$/, ''



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




###
glass.coffee version 0.1

Modeling different glasses

(c) 2012 Huub de Beer Huub@heerdebeer.org

Long description
###

class Glass

    @TENTH_OF_MM = 10

    to_json: ->
      # export to json: path, foot, stem, bowl, edge, height_in_mm, sepc
      export_object =
        path: @path
        foot:
          x: @foot.x
          y: @foot.y
        stem:
          x: @stem.x
          y: @stem.y
        bowl:
          x: @bowl.x
          y: @bowl.y
        edge:
          x: @edge.x
          y: @edge.y
        height_in_mm: @height_in_mm
        spec: @spec
        measure_lines: {}
        nr_of_measure_lines: @nr_of_measure_lines
      for vol, ml of @measure_lines
        export_object.measure_lines[vol] =
          volume: ml.model.volume
          height: ml.model.height
          initial_position: ml.model.initial_position
          position:
            x: ml.model.position.x
            y: ml.model.position.y
          side: ml.model.side
          movable: ml.model.movable
          visible: ml.model.visible
      JSON.stringify export_object



    constructor: (path, foot, stem, bowl, edge, height_in_mm, spec = {
        round_max: "cl",
        mm_from_top: 5
    }) ->
        ###
        pre:
            path is the right hand side of the countour of the glass
          ∧ 0 ≤ foot.y 
          ∧ foot.y ≤ stem.y 
          ∧ stem.y ≤ bowl.y
          ∧ bowl.y < edge.y
          ∧ 0 < height_in_mm

        post:
            is_empty
        ###
        # Also a json-version: one argument
        if arguments.length is 1
          # assume glass created from JSON
          import_object = JSON.parse path
          @path = import_object.path
          @foot = import_object.foot
          @stem = import_object.stem
          @bowl = import_object.bowl
          @edge = import_object.edge
          @height_in_mm = import_object.height_in_mm
          @spec = import_object?.spec ? {
            round_max: "cl",
            mm_from_top: 5
          }
          @measure_lines = {}
          for ml of import_object.measure_lines
            @measure_lines[ml.volume] =
              height: ml.height
              volume: ml.volume
              model: new MeasureLine ml.volume, ml.height, @, ml.initial_position, ml.side, ml.visible, ml.movable
              representation: null
            @measure_lines[ml.volume].position = ml.position
          @nr_of_measure_lines = import_object.nr_of_measure_lines
        else
          @path = path
          @foot = foot
          @stem = stem
          @bowl = bowl
          @edge = edge
          @height_in_mm = height_in_mm
          @measure_lines = {}
          @spec = spec
          @nr_of_measure_lines = 0
        # Initialization
        # Conversion unit between pixels and mm in pixels per mm
        @unit = Math.abs(@edge.y - @foot.y ) / @height_in_mm
        # Compute the start of the bowl; 0 ≤ bowl_start ≤ maximum_height
        @bowl_start = @height_in_mm - (Math.abs(@bowl.y - @edge.y) / @unit)

        # Determine the function r(h), 0 ≤ h ≤ height_in_mm with increments
        # of one tenth of a mm. to compute the radius of the glass at every height. 
        @r = []
        @r = @_compute_r @path, @foot, @height_in_mm, @unit

        # The function vol(h), 0 ≤ h ≤ maximum_height with increments of one
        # tenth of a mm. This function is only computed when needed. That is
        # when filling up the glass or converting between volume and
        # corresponding height and vice versa.
        @vol = []

        # compute speed as well
        @speed = []

        # Compute the maximum volume and corresponding height supported by
        # this glass
        @maximum_volume = 0
        @maximum_height = 0
        @maximum_speed = 0
        @_determine_maximum( @height_in_mm - @spec.mm_from_top, @spec.round_max )

        # This glass is empty when freshly created, of course.
        @make_empty()
    #=end constructor
    
    compute_speed: ->
      h = 0
      h_max = @vol.length - 1
      while @vol[h] is 0
        h++

      @speed[0] = 0

      v_prev = 0
      @maximum_speed = 0
      while h <= h_max
        vol = @vol[h]
        dh = 0
        while h <= h_max and v_prev is vol
          h++
          dh += 0.01
          vol = @vol[h]

        dvol = vol - v_prev
        @speed[vol] = dh/dvol
        @maximum_speed = Math.max @maximum_speed, @speed[vol]
        v_prev = vol
        h++
    
    add_measure_line: (vol, height, model, representation, on_the_glass = true) ->
      ###
      Add a measure line to the list with measure lines. A measure line is a pair (vol, height). Vol in ml and height in mm
      ###
      if on_the_glass
        @measure_lines[vol] =
          height: height
          volume: vol
          model: model
          representation: representation
      else
        @measure_lines[vol] =
          height: -1
          volume: vol
          model: model
          representation: representation
      @nr_of_measure_lines++

    get_measure_line: (vol) ->
      if @measure_lines[vol]?
        @measure_lines[vol]
      else
        -1

    measure_line_is_correct: (vol) ->
      if @measure_lines[vol]?
        height = @measure_lines[vol].height
        if @vol[height]?
          return @vol[height] is vol
        else
          return false
      else
        return false

    change_measure_line: (vol, height,  on_the_glass = true) ->
      @measure_lines[vol].height = if on_the_glass then height else -1

    del_measure_line: (vol) ->
      # delete measure line if it exists and isnt the maximum one
      if @measure_lines[vol]? and vol isnt @maximum_volume
        delete @measure_lines[vol]
        @nr_of_measure_lines--
    
    make_empty: (initial_value = 0)->
        ###
        Empty this glass 

        pre:
            True

        post:
            current_height = 0
          ∧ current_volume = 0
        ###
        @current_volume = 0
        @current_height = 0
        @current_height = @fill_to_volume initial_value
        @current_height++
        @current_graph = "M0,0"
        #=end make_empty
    
    is_empty: ->
        ###
        Is this glass empty?

        pre:
            True

        post:
            True

        return:
            current_volume = 0
        ###
        @current_volume is 0
        #=end is_empty

    is_full: ->
        ###
        Is this glass full?

        pre:
            True

        post:
            True

        return:
            current_volume = maximum_volume
        ###
        @current_volume is @maximum_volume
        #=end is_full

    fill_to_height: (height) ->
        ###
        Fill this glass up to height and return corresponding volume

        pre: 
            height, 0 ≤ height ≤ maximum_height

        post:
            current_height = height
          ∧ current_volume = volume_at_height(height)

        return:
            volume_at_height(height)
        ###
        if height <= @maximum_height
            @current_height = height
        else
            @current_height = @maximum_height

        @current_volume = @volume_at_height @current_height
        @current_volume
    #=end fill_to_height
    
    fill_to_volume: (volume) ->
        ###
        Fill this glass up to volume and return the corresponding water level height.

        pre:
            volume, 0 ≤ volume ≤ maximum_volume

        post:
            current_volume = volume
          ∧ current_height = height_at_volume(volume)

        return:
            height_at_volume(volume)
        ###
        if volume <= @maximum_volume
            @current_volume = volume
        else
            @current_volume = @maximum_volume

        @current_height = @height_at_volume @current_volume
        @current_height
    #=end fill_to_volume
    
    speed_at_height: (height) ->
      @speed[height*Glass.TENTH_OF_MM]

    speed_at_volume: (vol) ->
      h = height_at_volume vol
      @speed[h*Glass.TENTH_OF_MM]


    volume_at_height: (height) ->
        ###
        Compute the volume of the water in this glass when it is filled up to
        height. Take in account the shape of the glass: only the bowl of the
        glass can be filled.

        pre:
            height: water level height in mm

        post:
            volume = (∫h: 0 ≤ h ≤ height: πr(h)^2)

        return:
            volume in ml
        ###

        # convert height in mm to discrete height in mm/10
        # Numerical approximation of integral by taking steps of small height
        HSTEP = 0.01
        h = Math.ceil(height * Glass.TENTH_OF_MM )
        if not @vol[h]?
            # volume is not yet computed.
            if h == 0
                # When there is no water, the water level height will be 0
                @vol[0] = 0
                @speed[0] = 0
            else
                # The volume at this height is the volume just below plus the
                # area at this height 
                if 0 <= height < @bowl_start
                    # No water in the foot and stem of the glass
                    @vol[h] = 0 + 
                        @volume_at_height((h - 1) / Glass.TENTH_OF_MM)
                    @speed[h] = 0
                else
                    # There is only water in the bowl
                    dvol = Math.PI*Math.pow(@r[h] / Glass.TENTH_OF_MM, 2) * HSTEP
                    @vol[h] = dvol + @volume_at_height((h - 1) / Glass.TENTH_OF_MM)
                    @speed[h] = if dvol isnt 0 then HSTEP / dvol else 0  # in cm/ml
                    @maximum_speed = Math.max( @maximum_speed, @speed[h] )

        @vol[h]
        #=end volume_at_height
 
    height_at_volume: (volume) ->
        ###
        Compute the height of the water level in this glass when there is volume water in it.

        pre:
            0 ≤ volume 

        post:
            height = (h: 0 ≤ h ≤ total_height: vol[h + 1] > volume ∧ vol[h-1] < volume)
        
        return:
            height in mm
        ###

        # Simply a linear search.
        height = @current_height * Glass.TENTH_OF_MM
        maxheight = @height_in_mm * Glass.TENTH_OF_MM
        height++ until @vol[height] > volume or height >= maxheight
        Math.floor(height / Glass.TENTH_OF_MM)
        #=end height_at_volume
      
    get_current_graph: ->
      @current_graph = @graph[Math.ceil(@current_height * Glass.TENTH_OF_MM )]

    create_graph: (paper, graph, line, x_axis, speed = false) ->
      EPSILON = 0.01
      switch x_axis
        when 'vol'
          if speed
            # speed graph
            # compute the number of pixels per tenth of mm
            ptmm = 1/100 / line.y_unit.per_pixel
            dvol = 0
            @graph = []
            path = "M0,0"
            h = 0
            while @vol[h] is 0
              @graph.push path
              h++
           
            x = line.min.x
            y = line.max.y - (@speed[h] / line.y_unit.per_pixel)
            path = "M#{x},#{y}"
            vollast = 0
            @graph.push path
            speed_before = @speed[h]

            while h < @vol.length and @vol[h] < @maximum_volume
              # next volume
              dvol = @vol[h] - vollast
              vollast = @vol[h]
              dspeed = if speed_before isnt 0 then (@speed[h] - speed_before) else 0
              speed_before = @speed[h]
              speed_step = dspeed/line.y_unit.per_pixel*(-1)


              #speed_step = if speed_step > EPSILON then speed_step else EPSILON
              path += "l#{dvol/line.x_unit.per_pixel},#{speed_step}"
              @graph.push path
              h++

            graph.attr
              path: path
            line.add_point x, y, graph
            p = line.find_point_at x
            line.add_freehand_line p, path
            
          else
            # Normal graph, no speed
            # compute the number of pixels per tenth of mm
            ptmm = 1/100 / line.y_unit.per_pixel
            dvol = 0
            @graph = []
            path = "M0,0"
            h = 0
            while @vol[h] is 0
              @graph.push path
              h++
           
            x = line.min.x
            y = line.max.y - (h/100 / line.y_unit.per_pixel)
            path = "M#{x},#{y}"
            vollast = 0
            @graph.push path

            while h < @vol.length and @vol[h] < @maximum_volume
              # next volume
              dvol = @vol[h] - vollast
              vollast = @vol[h]
              path += "l#{dvol/line.x_unit.per_pixel},-#{ptmm}"
              @graph.push path
              h++

            graph.attr
              path: path
            line.add_point x, y, graph
            p = line.find_point_at x
            line.add_freehand_line p, path
        when 'time'
          # compute the number of pixels per tenth of mm
          ptmm = 1/100 / line.y_unit.per_pixel
          dtime = 0
          @graph = []
          path = "M0,0"
          h = 0
          while @vol[h] is 0
            @graph.push path
            h++
         
          x = line.min.x
          y = line.max.y - (h/100 / line.y_unit.per_pixel)
          path = "M#{x},#{y}"
          vollast = 0
          add_time = 0
          @graph.push path

          while h < @vol.length and @vol[h] < @maximum_volume
            # next volume
            dvol = @vol[h] - vollast
            vollast = @vol[h]
            add_time = (dvol / speed)
            path += "l#{add_time/line.x_unit.per_pixel},-#{ptmm}"
            @graph.push path
            h++
            
          graph.attr
            path: path
          line.add_point x, y, graph
          p = line.find_point_at x
          line.add_freehand_line p, path

    #=private

    _compute_r: (path, foot, total_height, unit ) ->
        ###
        Given a path and the coordinate of the foot on the mid-line of the
        glass, compute the radius of the glass at every height.
        
        pre:
            path: SVG path of contour of the right side of the glass
          ∧ foot: point of the foot or bottom of the glass on the mid line
        
        post:
            (∀ h: 0 ≤ h ≤ total_height: r[h] = radius of glass at height h in mm/10 in mm) 

        return:
            r
        ###
        r = []
        length_on_path = 0

        for height in [(total_height * Glass.TENTH_OF_MM)..0]
            # compute radius at height
            
            point_on_length = Raphael.getPointAtLength path, length_on_path
            while Math.abs(foot.y - point_on_length.y) > height * unit / Glass.TENTH_OF_MM
                # While the vertical distance traveled on this path in pixels
                # is smaller than this height in pixels continue on this path 
                # until we reach a point at this height.
                #
                # Assuming the path is traversed from bottom to top, i.e. in
                # reverse
                length_on_path++
                point_on_length = Raphael.getPointAtLength path, length_on_path

            # found point on the path at this height, the horizontal distance to 
            # the mid line is radius at this height in pixels. Convert to mm
            r[height] = Math.abs(point_on_length.x - foot.x) / unit

        r
        #=end _compute_r
    
    _determine_maximum: (total_height, round_to = "cl") ->
        ###
        Determine the maximum volume and corresponding maximum height of this 
        glass. Round to the first ml, cl, dl, or l below total_height.

        pre:
            0 ≤ total_height
          ∧ round_to ∈ {ml, cl, dl, l}

        post:
            0 ≤ maximum_height < total_height
          ∧ maximum_volume = volume_at_height(maximum_height)
          ∧ height_at_volume(maximum_volume + 1 round_to) >= total_height
        ###
        total_volume = @volume_at_height(total_height)
        factor = 10
        switch round_to
            when "ml"
                factor = 1
            when "cl"
                factor = 10
            when "dl"
                factor = 100
            when "l"
                factor = 1000
        @maximum_volume = Math.floor(total_volume / factor) * factor
        @current_height = 0
        @maximum_height = @height_at_volume( @maximum_volume )
        #=end _determine_maximum



# Export the Glass class
window.Glass = Glass
    



# 
# glass_grafter.coffee (c) 2012 HT de Beer
#
# version 0
#
# Tool to construct glasses (see glass.coffee) by drawing the right-hand
# contour of the glass. From that the whole glass, including the
# volume/height functions will be generated.
#
window.GlassGrafter = class
  
  initialize_properties: (properties) ->
    # Initialize properties with properties or default values
    p = {}
    p.buttons = properties?.buttons ? ['normal', 'add_point', 'remove_point', 'straight', 'curve']
    p.icon_path = properties?.icon_path ? 'lib/icons'
    p



  constructor: (@paper, @x, @y, @width, @height, mm_per_pixel, properties) ->
    @spec = @initialize_properties(properties)
    @PADDING = 3
    
    @POINT_WIDTH = 3
    
    @BUTTON_WIDTH = 32
    CoffeeGrounds.Button.set_width @BUTTON_WIDTH
    CoffeeGrounds.Button.set_base_path @spec.icon_path

    @AXIS_WIDTH = 40
    @BUTTON_SEP = 5
    @GROUP_SEP = 15
    @CANVAS_SEP = 10

    @CANVAS_TOP = @y + @PADDING + @BUTTON_WIDTH + @CANVAS_SEP
    @CANVAS_LEFT = @x + @PADDING
    @CANVAS_HEIGHT = @height - @PADDING*2 - @BUTTON_WIDTH - @CANVAS_SEP - @AXIS_WIDTH
    @CANVAS_WIDTH = @width - @PADDING*2 - @AXIS_WIDTH
    @CANVAS_BOTTOM = @CANVAS_TOP + @CANVAS_HEIGHT
    @CANVAS_RIGHT = @CANVAS_LEFT + @CANVAS_WIDTH
    @CANVAS_MID = @CANVAS_LEFT + @CANVAS_WIDTH/2

    @BORDER_WIDTH = @CANVAS_WIDTH/2

    @PIXELS_PER_MM = 1/mm_per_pixel unless mm_per_pixel is 0

    @contour = new CoffeeGrounds.ContourLine @CANVAS_MID, @CANVAS_TOP, @BORDER_WIDTH, @CANVAS_HEIGHT, mm_per_pixel

    @actions = {
      normal:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'select'
          icon: 'edit-select'
          tooltip: 'Versleep witte en blauwe punten'
          on_select: =>
            @change_mode 'normal'
          enabled: true
          default: true
        cursor: 'default'
      add_point:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit-point'
          icon: 'format-add-node'
          tooltip: 'Voeg een extra punt toe aan de lijn'
          on_select: =>
            @change_mode 'add_point'
          enabled: true
        cursor: 'crosshair'
      remove_point:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit-point'
          icon: 'format-remove-node'
          tooltip: 'Verwijder het rood oplichtende extra punt'
          on_select: =>
            @change_mode 'remove_point'
          enabled: true
        cursor: 'default'
      straight:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit-line'
          icon: 'straight-line'
          tooltip: 'Maak van de kromme lijn onder de cursor een rechte lijn'
          on_select: =>
            @change_mode 'straight'
        cursor: 'default'
      curve:
        button:
          type: 'group'
          option_group: 'mode'
          group: 'edit-line'
          icon: 'draw-bezier-curves'
          tooltip: 'Maak van de rechte lijn onder de cursor een kromme lijn'
          on_select: =>
            @change_mode 'curve'
        cursor: 'default'
      realistic:
        button:
          type: 'action'
          icon: 'games-hint'
          group: 'view'
          tooltip: 'Bekijk het glas er in 3D uitziet'
          action: =>
            #console.log "make 3d glass"
      export_png:
        button:
          type: 'action'
          icon: 'image-x-generic'
          group: 'export'
          tooltip: 'Download het glas als een PNG afbeelding'
          action: =>
            #console.log "save as png"
      export_svg:
        button:
          type: 'action'
          icon: 'image-svg+xml'
          group: 'export'
          tooltip: 'Download het glas als een SVG afbeelding'
          action: =>
            #console.log "save as svg"
    }
    @draw()
    @init()
    
  init: ->
    @mode = 'normal'
    @click = ''
    @points_draggable = false
    @cp_points_draggable = false
    @make_draggable()
    @canvas.mouseover @mouseover
    @canvas.mouseout @mouseout
   
  set_contour: (contour) ->
    @contour.from_glass contour.to_glass()
    @draw()
    @init()

  get_contour: ->
    @contour

  mouseover: (e, x, y) =>
    @canvas.mousemove @mousemove

  mouseout: (e, x, y) =>
    @canvas.unmousemove @mousemove

  fit_point: (x, y) ->
    point =
      x: Math.floor(x - @paper.canvas.parentNode.offsetLeft)
      y: Math.floor(y - @paper.canvas.parentNode.offsetTop)
    point

  reset_mouse: ->
    @click = ''
    @canvas.unclick @add_point
    @canvas.unclick @remove_point
    @canvas.unclick @line_changer
    @potential_point.hide()
    @potential_above.hide()
    @potential_below.hide()
    @remove_point_point.hide()
    @remove_point_line.hide()
    @change_line_area.hide()

  mousemove: (e, x, y) =>
    p = @fit_point x, y
    @canvas.attr
      cursor: @actions[@mode].cursor
    switch @mode
      when 'normal'
        1 is 1
      when 'add_point'
        if @contour.can_add_point p.x, p.y
          above = @contour.get_point_above_height p.y
          below = above + 1
          above = @contour.get_point above
          below = @contour.get_point below

          if @click isnt @mode
            @canvas.click @add_point
            @click = @mode
          @potential_above.attr
            path: "M#{above.x},#{above.y}L#{p.x},#{p.y-2}"
          @potential_above.show()
          @potential_below.attr
            path: "M#{below.x},#{below.y}L#{p.x},#{p.y+2}"
          @potential_below.show()

        else
          @potential_point.hide()
          @potential_above.hide()
          @potential_below.hide()
          @canvas.attr
            cursor: 'not-allowed'
      when 'remove_point'
        q = @contour.find_point_near p.x, p.y, @POINT_WIDTH*5
        if q isnt -1 and @contour.can_remove_point q
          if @click isnt @mode
            @canvas.click @remove_point
            @click = @mode
          point = @contour.get_point q
          above = q - 1
          below = q + 1
          above = @contour.get_point above
          below = @contour.get_point below
          @remove_point_point.attr
            cx: point.x
            cy: point.y
          @remove_point_point.show()
          @remove_point_line.attr
            path: "M#{above.x},#{above.y}L#{below.x},#{below.y}"
          @remove_point_line.show()
        else
          @reset_mouse()
          @canvas.attr
            cursor: 'not-allowed'

      when 'straight'
        q = @contour.get_point_above_height p.y
        if q isnt -1
          point = @contour.get_point q
          below = @contour.get_point q + 1
          
          if point.segment.type isnt 'straight'
            if @click isnt @mode
              @canvas.click @change_line(@, 'straight')
              @click = @mode
            @change_line_area.attr
              y: point.y
              height: below.y - point.y
            @change_line_area.show()
          else
            @change_line_area.hide()
            @canvas.attr
              cursor: 'not-allowed'
        else
          @change_line_area.hide()
          @canvas.attr
            cursor: 'not-allowed'

      when 'curve'
        q = @contour.get_point_above_height p.y
        if q isnt -1
          point = @contour.get_point q
          below = @contour.get_point q + 1
          
          if point.segment.type isnt 'curve'
            if @click isnt @mode
              @canvas.click @change_line(@, 'curve')
              @click = @mode
            @change_line_area.attr
              y: point.y
              height: below.y - point.y
            @change_line_area.show()
          else
            @change_line_area.hide()
            @canvas.attr
              cursor: 'not-allowed'
        else
          @change_line_area.hide()
          @canvas.attr
            cursor: 'not-allowed'

  add_point: (e, x, y) =>
    p = @fit_point x, y
    point = @paper.circle p.x, p.y, @POINT_WIDTH
    point.attr
      fill: 'black'
    q = @contour.add_point p.x, p.y, point
    point.drag @move_point(@, q), @move_point_start, @move_point_end(@, q)
    @draw_glass()

  make_draggable: ->
    @points_draggable = @points_draggable ? false
    if not @points_draggable
      for point in @contour.points
        point.representation.drag @move_point(@, point), @move_point_start(point), @move_point_end(@, point)
        if point.border is 'none'
          point.representation.attr
            fill: 'blue'
            stroke: 'blue'
            r: @POINT_WIDTH * 2
            'fill-opacity': 0.3
      @points_draggable = true

  move_point: (grafter, point) ->
    return (dx, dy, x, y, e) =>
      tx = Math.floor(dx - grafter.dpo.x)
      ty = Math.floor(dy - grafter.dpo.y)
      p = grafter.contour.find_point_at point.y
      if point.border is 'foot'
        # the foot can only move on x
        newp =
          x: point.x + tx
          y: point.y
      else
        # others can be moved everywhere within limits
        newp =
          x: point.x + tx
          y: point.y + ty
      if p isnt -1 and grafter.contour.can_move_point p, newp.x, newp.y
        grafter.contour.move_point p, newp.x, newp.y
        grafter.dpo =
          x: dx
          y: dy
        point.representation.attr
          cx: point.x
          cy: point.y
        switch point.border
          when 'edge'
            @edge.attr
              path: "M#{@CANVAS_MID},#{point.y}h#{@CANVAS_WIDTH/2}"
          when 'bowl'
            @bowl.attr
              path: "M#{@CANVAS_MID},#{point.y}h#{@CANVAS_WIDTH/2}"
          when 'stem'
            @stem.attr
              path: "M#{@CANVAS_MID},#{point.y}h#{@CANVAS_WIDTH/2}"
        @draw_glass()
      else
        # cannot move point: stay

  move_point_start: (point) ->
    return (x, y, e) =>
      if point.border isnt 'none'
        point.representation.attr
          fill: 'blue'
      @dpo = @dpo ? {}
      @dpo =
        x: 0
        y: 0


  move_point_end: (grafter, point) ->
    return (x, y, e) =>
      if point.border isnt 'none'
        point.representation.attr
          fill: 'white'
          'fill-opacity': 1
      grafter.draw_glass()
      point.representation.toFront()

  make_undraggable: ->
    @points_draggable = @points_draggable ? false
    if @points_draggable
      for point in @contour.points
        point.representation.undrag()
        if point.border is 'none'
          point.representation.attr
            fill: 'black'
            stroke: 'black'
            r: @POINT_WIDTH
            'fill-opacity': 1
      @points_draggable = false


  remove_point: (e, x, y) =>
    p = @fit_point x, y
    q = @contour.find_point_near p.x, p.y, @POINT_WIDTH*5
    if q isnt -1 and @contour.can_remove_point(q)
      r = @contour.get_point q
      r.representation.remove()
      @contour.remove_point q
      @draw_glass()
      @remove_point_point.hide()
      @remove_point_line.hide()
    
  change_line: (grafter, kind) ->

    grafter.canvas.unclick grafter.line_changer
    grafter.line_changer = null
    grafter.line_changer = (e, x, y) =>
      p = @fit_point x, y
      q = @contour.get_point_above_height p.y
      if kind is 'curve'
        if q isnt -1 and q isnt (@contour.points.length - 1)
          grafter.contour.make_curve q
          point = grafter.contour.get_point q
          below = grafter.contour.get_point(q+1)
          c1 = point.segment.c1
          c2 = point.segment.c2

          if not c1?.representation?
            c1.representation = @paper.circle c1.x, c1.y, @POINT_WIDTH * 2
            c1.line = @paper.path "M#{point.x},#{point.y}L#{c1.x},#{c1.y}"
          ctop = c1.representation
          ctop.attr
            cx: c1.x
            cy: c1.y
            fill: 'orange'
            stroke: 'orange'
            'fill-opacity': 0.3
          cltop = c1.line
          cltop.attr
            path: "M#{point.x},#{point.y}L#{c1.x},#{c1.y}"
            stroke: 'orange'
            'stroke-dasharray': '.'

          ctop.drag @move_control_point(@, point, ctop, cltop, 1), @control_point_start, @control_point_end(@, point, ctop)

          if not c2?.representation?
            c2.representation = @paper.circle c2.x, c2.y, @POINT_WIDTH * 2
            c2.line = @paper.path "M#{below.x},#{below.y}L#{c2.x},#{c2.y}"

          cbottom = c2.representation
          cbottom.attr
            cx: c2.x
            cy: c2.y
            fill: 'orange'
            stroke: 'orange'
            'fill-opacity': 0.3
          clbottom = c2.line
          clbottom.attr
            path: "M#{below.x},#{below.y}L#{c2.x},#{c2.y}"
            stroke: 'orange'
            'stroke-dasharray': '.'

          cbottom.drag @move_control_point(@, point, cbottom, clbottom, 2), @control_point_start, @control_point_end(@, c1, cbottom)
          
          grafter.draw_glass()
      else
        # is straight
        if q isnt -1
          grafter.contour.make_straight q
          grafter.draw_glass()
    grafter.line_changer




  move_control_point: (grafter, point, representation, line, cp) ->
    return (dx, dy, x, y, e) =>
      tx = dx - grafter.dpo.x
      ty = dy - grafter.dpo.y
      p = grafter.contour.find_point_at point.y
      below = grafter.contour.get_point (p+1)
      newp =
        x: representation.attr('cx') + tx
        y: representation.attr('cy') + ty
      if grafter.contour.can_move_control_point p, newp.x, newp.y
        grafter.contour.move_control_point p, cp, newp.x, newp.y
        representation.attr
          cx: newp.x
          cy: newp.y
        start = if cp is 1 then point else below
        line.attr
          path: "M#{start.x},#{start.y}L#{newp.x},#{newp.y}"
        grafter.dpo =
          x: dx
          y: dy

        grafter.draw_glass()
      

  control_point_start: =>
    @dpo = @dpo ? {}
    @dpo =
      x: 0
      y: 0

  control_point_end: (grafter, above, representation) ->
    return (x, y, e) =>
      grafter.draw_glass()

  draw_glass: ->
    @glass_base.attr
      path: @contour.to_glass_path 'base'
    @glass_bowl.attr
      path: @contour.to_glass_path()
    @glass_contour.attr
      path: @contour.to_path()

    place_label = (label, above, below) ->
      # place glass part labels if possible
      #console.log label, above, below
      bb = label.getBBox()
      bowlheight = below.y - above.y
      if bowlheight > bb.height
        # possible to put label
        rest = bowlheight - bb.height
        label.attr
          y: above.y + rest/2 + bb.height/2
        label.show()
      else
        label.hide()

    place_label @bowl_label, @contour.edge, @contour.bowl
    place_label @stem_label, @contour.bowl, @contour.stem
    place_label @foot_label, @contour.stem, @contour.foot

  change_mode: (mode) ->
    @reset_mouse()
    @make_undraggable()
    @mode = @mode ? {}
    @mode = mode
    if @mode is 'normal'
      @make_draggable()
    else
      @make_undraggable()
    if @mode is 'curve'
      @make_cp_draggable()
    else
      @make_cp_undraggable()

  make_cp_draggable: ->
    @cp_points_draggable = @cp_points_draggable ? false
    if not @cp_points_draggable
      for point in @contour.points
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
          next_point = @contour.get_point(@contour.find_point_at(point.y) + 1)
          point.segment.c2.line.attr
            path: "M#{next_point.x},#{next_point.y}L#{point.segment.c2.x},#{point.segment.c2.y}"
          point.segment.c2.line.show()
      @cp_points_draggable = true

  make_cp_undraggable: ->
    @cp_points_draggable = @cp_points_draggable ? false
    if @cp_points_draggable
      for point in @contour.points
        s = point.segment
        if s.type is 'curve'
          point.segment.c1.representation.hide()
          point.segment.c2.representation.hide()
          point.segment.c1.line.hide()
          point.segment.c2.line.hide()
      @cp_points_draggable = false

  draw: ->
    @elements = @paper.set()

    @foot_label = @paper.text (@CANVAS_MID + @CANVAS_WIDTH/4), 0, "voet"
    @foot_label.attr
      'font-family': 'sans-serif'
      'font-size': '14pt'
      'fill': 'silver'
    @stem_label = @paper.text (@CANVAS_MID + @CANVAS_WIDTH/4), 0, "steel"
    @stem_label.attr
      'font-family': 'sans-serif'
      'font-size': '14pt'
      'fill': 'silver'
    @bowl_label = @paper.text (@CANVAS_MID + @CANVAS_WIDTH/4), 0, "kelk"
    @bowl_label.attr
      'font-family': 'sans-serif'
      'font-size': '14pt'
      'fill': 'silver'

    @glass_base = @paper.path @contour.to_glass_path 'base'
    @glass_base.attr
      fill: 'black'
      'fill-opacity': 0.3
      stroke: 'gray'
      'stroke-width': 2
      'stroke-dasharray': ''
    @glass_bowl = @paper.path @contour.to_glass_path()
    @glass_bowl.attr
      stroke: 'black'
      'stroke-width': 2
      'stroke-dasharray': ''


    @draw_axis 'radius'
    @draw_axis 'height'

    @potential_point = @paper.circle 0, 0, @POINT_WIDTH*2
    @potential_point.attr
      fill: 'green'
      opacity: 0.5
    @potential_point.hide()
    @potential_above = @paper.path "M0,0"
    @potential_above.attr
      stroke: 'green'
      opacity: 0.5
      'stroke-dasharray': '-'
    @potential_above.hide()
    @potential_below = @paper.path "M0,0"
    @potential_below.attr
      stroke: 'green'
      opacity: 0.5
      'stroke-dasharray': '-'
    @potential_below.hide()

    @remove_point_point = @paper.circle 0, 0, @POINT_WIDTH*4
    @remove_point_point.attr
      fill: 'red'
      stroke: 'red'
      opacity: 0.5
    @remove_point_point.hide()
    @remove_point_line = @paper.path "M0,0"
    @remove_point_line.attr
      stroke: 'red'
      opacity: 0.5
      'stroke-dasharray': '-'
    @remove_point_line.hide()
    @change_line_area = @paper.rect @CANVAS_MID, @CANVAS_BOTTOM, @CANVAS_WIDTH/2, 0
    @change_line_area.attr
      fill: 'orange'
      opacity: 0.5
    @change_line_area.hide()
    
    @glass_contour = @paper.path @contour.to_path()
    @glass_contour.attr
      stroke: 'DarkGreen'
      'stroke-width': 3

    @canvas = @paper.rect @CANVAS_MID, @CANVAS_TOP, @CANVAS_WIDTH/2, @CANVAS_HEIGHT
    @canvas.attr
      fill: 'white'
      'fill-opacity': 0
      stroke: 'white'
      'stroke-width': 0

    mid_line = @paper.path "M#{@CANVAS_MID},#{@CANVAS_TOP}v#{@CANVAS_HEIGHT}"
    mid_line.attr
      stroke: 'Indigo'
      'stroke-width': 2
      'stroke-dasharray': '-.'
   
    @glass_contour.hide()

    
    @draw_buttons()



    @foot = @draw_border @contour.foot, ''
    @foot.attr
      stroke: 'black'
    @stem = @draw_border @contour.stem
    @bowl = @draw_border @contour.bowl
    @edge = @draw_border @contour.edge

    @foot_point = @draw_point @contour.foot
    @contour.foot.representation = @foot_point
    @stem_point = @draw_point @contour.stem
    @contour.stem.representation = @stem_point
    @bowl_point = @draw_point @contour.bowl
    @contour.bowl.representation = @bowl_point
    @edge_point = @draw_point @contour.edge
    @contour.edge.representation = @edge_point

    @draw_glass()
  
  draw_point: (p) ->
    if p.border isnt 'none'
      point = @paper.circle p.x, p.y, @POINT_WIDTH * 2
      point.attr
        fill: 'white'
        stroke: 'black'
        'stroke-width': 2
    else
      point = @paper.circle p.x, p.y, @POINT_WIDTH
      point.attr
        fill: 'black'
        stroke: 'black'
        'stroke-width': @POINT_WIDTH
        'stroke-opacity': 0
    p.representation = point
    
    point


  draw_border: (border, dashing = '. ') ->
    border_line = @paper.path "M#{@CANVAS_MID},#{border.y}h#{@BORDER_WIDTH}"
    border_line.attr
      stroke: 'Indigo'
      'stroke-dasharray': dashing
      'stroke-width': 0.5
    border_line
  
  draw_buttons:  ->
    x = @CANVAS_MID
    y = @CANVAS_TOP - @CANVAS_SEP - @BUTTON_WIDTH
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



  draw_axis: (axis) ->
    TICKSLENGTH = 10
    HALFTICKSLENGTH = TICKSLENGTH/2
    LABELSEP = 5
    AXISLABELSEP = 30

    path = ''
    step = 5 * @PIXELS_PER_MM
    label = 0
    i = 0
    if axis is 'radius'
      movement = 'v'
      x = @CANVAS_MID
      end = @CANVAS_MID + @BORDER_WIDTH

      while x <= end
        path += "M#{x},#{@CANVAS_BOTTOM}"
        if (i % 10) is 0
          # one cm tick
          path += "#{movement}#{TICKSLENGTH}"
          label_text = @paper.text x, 0, label
          label_text.attr
            'font-family': 'sans-serif'
            'font-size': '12pt'
          ltbb = label_text.getBBox()
          label_text.attr
            y: @CANVAS_BOTTOM + LABELSEP + ltbb.height
          label += 1
        else
          path += "#{movement}#{HALFTICKSLENGTH}"
          # half cm tick

        # go to the next half cm tick
        x += step
        i +=5

      axis_label = @paper.text 0, 0, 'straal (cm)'
      axis_label.attr
        'font-family': 'sans-serif'
        'font-size': '14pt'
        'text-anchor': 'start'
      albb = axis_label.getBBox()
      axis_label.attr
        x: @CANVAS_RIGHT - albb.width
        y: @CANVAS_BOTTOM + LABELSEP + albb.height + TICKSLENGTH + LABELSEP

      axis_line = @paper.path "M#{@CANVAS_MID},#{@CANVAS_BOTTOM}h#{@CANVAS_WIDTH/2}"
      axis_line.attr
        stroke: 'black'
        'stroke-width': 2


    else
      movement = 'h'
      y = @CANVAS_BOTTOM
      end = @CANVAS_TOP

      while y >= end
        path += "M#{@CANVAS_RIGHT},#{y}"
        if (i % 10) is 0
          # one cm tick
          path += "#{movement}#{TICKSLENGTH}"
          label_text = @paper.text 0, y, 99
          label_text.attr
            'font-family': 'sans-serif'
            'font-size': '12pt'
          ltbb = label_text.getBBox()
          label_text.attr
            x: @CANVAS_RIGHT + LABELSEP + TICKSLENGTH + ltbb.width
            'text-anchor': 'end'
            text: label
          label += 1
        else
          path += "#{movement}#{HALFTICKSLENGTH}"
          # half cm tick

        # go to the next half cm tick
        y -= step
        i +=5
      
      axis_label = @paper.text 0, 0, 'hoogte (cm)'
      axis_label.attr
        'font-family': 'sans-serif'
        'font-size': '14pt'
        'text-anchor': 'start'
      albb = axis_label.getBBox()
      axis_label.attr
        x: @CANVAS_RIGHT - albb.width
        y: @CANVAS_BOTTOM + LABELSEP + albb.height + TICKSLENGTH + LABELSEP
      axis_label.transform "r-90,#{@CANVAS_RIGHT},#{@CANVAS_BOTTOM}t#{@CANVAS_HEIGHT},#{LABELSEP}"
      
      axis_line = @paper.path "M#{@CANVAS_RIGHT},#{@CANVAS_BOTTOM}v-#{@CANVAS_HEIGHT}"
      axis_line.attr
        stroke: 'black'
        'stroke-width': 2


    axis = @paper.path path
    axis.attr
      stroke: 'black'
      'stroke-width': 2

    axis
