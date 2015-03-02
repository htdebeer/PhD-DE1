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
      switch point.segment.type
        when 'none'
          eopoint.segment = 'none'
        when 'straight'
          eopoint.segment = 'straight'
        when 'curve'
          eopoint.segment = 'curve'
          eopoint.c1 =
            x: point.segment.c1.x
            y: point.segment.c1.y
          eopoint.c2 =
            x: point.segment.c2.x
            y: point.segment.c2.y
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
      @history.push "AF#{p}:#{path}@#{time}"

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
    @AXIS_WIDTH = 50
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
    @computer_line = new CoffeeGrounds.Line @ORIGIN.x, @ORIGIN.y - @GRAPH_HEIGHT, @GRAPH_WIDTH, @GRAPH_HEIGHT, @x_axis.unit, @y_axis.unit, true

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
      SMALL_EPSILON = 0.001
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
          factor = 0
          factor = @delta_y / dy / 2 unless (-1 * SMALL_EPSILON) < dy < SMALL_EPSILON


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
            labels.push @paper.text origin.x - TICKSLENGTH - LABELSEP*3, origin.y - d, "#{label.toFixed(2)}"
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
      if @y_axis.unit.symbol is 'cm/ml'
        axis_label.transform "r-90,#{origin.x},#{origin.y}t0,-#{2.55*AXISLABELSEP}"
      else
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



###
 (c) 2012, Huub de Beer, Huub@heerdebeer.org
###
class MeasureLine

  # error range
  @EPSILON = 0.01

  to_json: ->
    export_object =
      volume: @volume
      height: @height
      initial_position: @initial_position
      position:
        x: @position.x
        y: @position.y
      side: @side
      movable: @movable
      visible: @visible
    JSON.stringify export_object

  from_json: (mljson) ->
    @volume = mljson.volume
    @height = mljson.height
    @initial_position = mljson.initial_position
    @position = mljson.position
    @side = mljson.side
    @movable = mljson.movable
    @visible = mljson.visible


  constructor: (@volume, @height, @glass, @initial_position = {x: -1, y: -1}, @side = 'right', @visible = false, @movable = true) ->
    @set_position @initial_position

  reset: () ->
    ###
    ###
    @set_position @initial_position

  hide: ->
    @visible = false

  show: ->
    @visible = true

  set_position: (position) ->
    ###
    Set the position of this measure line. Position is a point (x, y). Subsequently the height in mm can be computed.
    ###
    @position = position
    @height = (@glass.foot.y - @position.y) / @glass.unit

  is_correct: ->
    ###
    Is this measure line on the correct height on the glass? That is: is the error smaller than epsilon?
    ###
    Math.abs(@error) <= MeasureLine.EPSILON

  error: ->
    ###
    The distance of this measure line to the correct position in mm. A negative error means it is too hight, a positive distance that it is too low
    ###
    (@glass.height_at_volume @volume) - @height

# export MeasureLine    
window.MeasureLine = MeasureLine



# wtap.coffee (c) 2012 HT de Beer
#
# tab and filling simulator
#
window.CoffeeGrounds = CoffeeGrounds ? {}
CoffeeGrounds.Tap = class

  constructor: (@paper, @x, @y, @glass, @graph, properties) ->
   
    @PADDING = 5
    @spec = @initialize_properties properties
    @BUTTON_WIDTH = 34
    CoffeeGrounds.Button.set_width @BUTTON_WIDTH
    @BUTTON_SEP = 5
    @TIME_LABEL_SEP = 10
    @TAB_SEP = 5
    @GROUP_SEP = 15

    CoffeeGrounds.Button.set_base_path @spec.icon_path
    @actions = {
      start:
        button:
          type: 'group'
          value: 'start'
          option_group: 'simulation'
          group: 'simulation'
          icon: 'media-skip-backward'
          tooltip: 'Maak het glas leeg'
          on_select: =>
            @change_mode 'start'
            @empty()
          enabled: true
          default: true
      pause:
        button:
          type: 'group'
          value: 'pause'
          option_group: 'simulation'
          group: 'simulation'
          icon: 'media-playback-pause'
          tooltip: 'Pauzeer het vullen van het glas'
          on_select: =>
            @change_mode 'pause'
            @pause()
          enabled: true
      play:
        button:
          type: 'group'
          value: 'play'
          option_group: 'simulation'
          group: 'simulation'
          icon: 'media-playback-start'
          tooltip: 'Vul het glas'
          on_select: =>
            @change_mode 'play'
            @start()
          enabled: true
      end:
        button:
          type: 'group'
          value: 'end'
          option_group: 'simulation'
          group: 'simulation'
          icon: 'media-skip-forward'
          tooltip: 'Vul glas tot het volgende maatstreepje op het glas'
          on_select: =>
            @change_mode 'end'
            #@full()
            @fill_to_next_ml()
          enabled: true
      time:
        button:
          type: 'switch'
          group: 'option'
          icon: 'chronometer'
          tooltip: 'Laat de tijd zien'
          on_switch_on: =>
            @time_label.show()
            @timer = true
          on_switch_off: =>
            @time_label.hide()
            @timer = false
    }

    @mode = 'start'
    @timer = false
    @volume = 0
    @time = 0
    @speed = @spec.speed  #ml/sec

    @time_step = 50
    @ml_per_time_step = (@speed/1000) * @time_step

    @speed_per_msec = @speed / 1000
    @msec_per_tenth_ml = 1 / (@speed_per_msec * 10)
    @sec_per_tenth_ml = 1 / (@speed*10)


    @filling = false
    @id = 0

    @draw()
    @graph?.attr
      path: @glass.get_current_graph()

  empty: =>
    @time = 0
    @volume = 0
    @update_labels()
    @filling = false
    @glass.make_empty(@sec_per_tenth_ml)
    @spec.glass_to_fill.fill_to_height @glass.current_height
    @graph?.attr
      path: @glass.get_current_graph()
    @stream.hide()

  pause: =>
    @stream.hide()
    clearInterval @id
    @filling = false

  start: =>
    clearInterval @id
    @filling = true
    @id = setInterval @fill, @time_step
    @stream.show()

  fill: =>
    if @filling and not @glass.is_full()
      @time += @time_step / 1000
      @volume += @ml_per_time_step
      @update_labels()
      @glass.fill_to_volume @volume
      @spec.glass_to_fill.fill_to_height @glass.current_height
      water_level_height = (@spec.glass_to_fill.points.water_level.left.y-@spec.glass_to_fill.points.edge.left.y) + @spec.stream_extra
      @graph?.attr
        path: @glass.get_current_graph()
      @stream.attr
        height: water_level_height

    else if @glass.is_full()
      @simulation.select 'end'
      

  fill_to_next_ml: =>
    @stream.hide()
    height = @glass.current_height
    next_height = @glass.maximum_height
    for vol, ml of @glass.measure_lines
      if ml.height > height
        next_height = Math.min next_height, ml.height

    @glass.fill_to_height Math.ceil(next_height)
    @volume = @glass.current_volume
    if next_height is @glass.maximum_height
      @volume = @glass.maximum_volume
    @time = @volume / @speed
    @filling = false
    @update_labels()
    clearInterval @id
    @spec.glass_to_fill.fill_to_height @glass.current_height
    @graph?.attr
      path: @glass.get_current_graph()
    

  full: =>
    @stream.hide()
    @volume = @glass.maximum_volume
    @time = @sec_per_tenth_ml * @volume * 10
    @filling = false
    @glass.fill_to_volume @volume
    @update_labels()
    clearInterval @id
    @spec.glass_to_fill.fill_to_height @glass.current_height
    @graph?.attr
      path: @glass.get_current_graph()

  update_labels: ->
    @label.attr
      text: "#{@volume.toFixed(1)} ml"
    @time_label.attr
      text: "#{@time.toFixed(1)} seconden"
  
  change_mode: (mode) ->
    @mode = mode

  
  initialize_properties: (properties) ->
    # Initialize properties with properties or default values
    p = {}
    p.speed = properties?.speed ? 5
    p.time = properties?.time ? false
    p.buttons = properties?.buttons ? ['start', 'pause', 'play', 'end', 'time']
    if not p.time and 'time' in p.buttons
      delete p.buttons[p.buttons.indexOf('time')]
    p.glass_to_fill = properties?.glass_to_fill ? {
        fill_to_height: (h) ->
          true
      }
    p.runnable = properties?.runnable ? true
    if not p.runnable
      p.buttons = []

    p.icon_path = properties?.icon_path ? 'lib/icons'
    p.stream_extra = properties?.stream_extra ? 0
    p
          

  draw: ->
    @time_label = @paper.text @x, @y + @PADDING + @BUTTON_WIDTH + @TIME_LABEL_SEP, "30,9 seconden"
    @time_label.attr
      'font-family': 'sans-serif'
      'font-size': '18pt'
      'text-anchor': 'end'
    tlbb = @time_label.getBBox()
    @time_label.hide()
    @draw_buttons()

    tappath = "M 0 27.5 V 20 A 10 10 90 0 1 10 10 L 20 10 V 5
                    H 12.5 A 1.25 1.25 90 0 1 12.5 2.25 H 21.25 
                    A 1.25 1.25 180 0 1 23.75 2.25 H 32.5 
                    A 1.25 1.25 90 0 1 32.5 5 H 25 V 10
                    H 40 V 5 A 2.5 2.5 90 0 1 42.5 2.5 V 27.5
                    A 2.5 2.5 90 0 1 40 25 V 20 H 12.5
                    A 2.5 2.5 90 0 0 10 22.5 V 27.5 Z"
    @tap = @paper.path tappath
    @tap.attr
        stroke: '#bbb'
        fill: '#ddd'
        'fill-opacity': 0.2
        transform: 's3'
    tapbb = @tap.getBBox(true)

    tapx = @x + (@BUTTONS_GROUP_WIDTH - tapbb.width)/2
    tapy = @y + @PADDING + @BUTTON_WIDTH + @TIME_LABEL_SEP + tlbb.height*2 + @TIME_LABEL_SEP
    @tap.transform "...T#{tapx},#{tapy}"
    @time_label.attr
      x: @x + (@BUTTONS_GROUP_WIDTH - tlbb.width)/2 + tlbb.width
      text: "0 seconden"
      y: @y + @PADDING + @BUTTON_WIDTH + @TIME_LABEL_SEP + tlbb.height/3

    bbtap = @tap.getBBox()

    @label = @paper.text 0, 0, "888,8 ml"
    @label.attr
        'font-family': 'Helvetica, Arial, sans-serif'
        'font-size': 18
        'text-anchor': 'end'
    bblabel = @label.getBBox()
    LABEL_SEP = 10
    @label.attr
        x: bbtap.x + bbtap.width - LABEL_SEP
        y: bbtap.y + bbtap.height - bblabel.height - LABEL_SEP*1.5
        text: "0 ml"

    stream_x = bbtap.x + 3
    stream_y = bbtap.y2
    @stream = @paper.rect stream_x, stream_y, 25, 0
    @stream.attr
      fill: '#abf'
      'fill-opacity': 0.1
      stroke: 'none'
    @stream.hide()

  draw_buttons: ->
    x = @x
    y = @y
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
      @simulation = buttongroup
      for button in buttongroup.buttons
        @buttons[button.value] = button



    if @spec.buttons.length is 0
      @BUTTONS_GROUP_WIDTH = 3 * (@BUTTON_WIDTH + @BUTTON_SEP) - @BUTTON_SEP
    else if 'time' in @spec.buttons
      @BUTTONS_GROUP_WIDTH = x - @GROUP_SEP - @x
    else
      @BUTTONS_GROUP_WIDTH = x - @BUTTON_SEP - @x


    


    


###

(c) 2012, Huub de Beer, Huub@heerdebeer.org

###
class Widget

  constructor: (@canvas, @x, @y, @spec = {}) ->
    @widgets = @canvas.set()
    @dx = @dy = 0
    
  place_at: (x, y) ->
    ###
    Place this widget at co-ordinates x an y
    ###
    @_compute_geometry()
    @dx = x - @geometry.left
    @dy = y - @geometry.top
    @widgets.transform "...t#{@dx},#{@dy}"
    @x = x
    @y = y
    @_compute_geometry()
    @
  
  _draw: () ->
    ###
    Draw this widget. Virtual method to be overloaded by all subclasses of 
    Widget. All shapes drawn are added to the list of widgets
    ###

  _compute_geometry: () ->
    ###
    Compute the left, top, bottom, right, width, height, and center of this 
    widget given its top-left corner (x, y). 
    
    This does not work with paths that do not start at (0,0)


    ###
    bbox = @widgets.getBBox()
    @geometry = {}
    @geometry.width = bbox.width
    @geometry.height = bbox.height
    @geometry.top = bbox.y
    @geometry.left = bbox.x
    @geometry.right = bbox.x2
    @geometry.bottom = bbox.y2
    @geometry.center =
      x: (@geometry.right - @geometry.left) / 2 + @geometry.left
      y: (@geometry.bottom - @geometry.top) / 2 + @geometry.top
# export Widget
window.Widget = Widget


###
(c) 2012, Huub de Beer, Huub@heerdebeer.org
###

class WMeasureLine extends Widget
  
  constructor: (@canvas, @x, @y, @ml, @foot, @spec = {}) ->
    super @canvas, @x, @y, @spec
    @_draw()

    if @ml.movable
      @widgets.mouseover (e) =>
        @border.attr
          fill: 'gold'
          'fill-opacity': 0.25
          'stroke-opacity': 0.75
          cursor: 'move'
      @widgets.mouseout (e) =>
        @border.attr
          'stroke-opacity': 0
          cursor: 'default'
          fill: 'white'
          'fill-opacity': 0
      @widgets.drag @drag, @start, @end

  drag: (dx, dy, x, y, e) =>
    tx = Math.floor(dx - @dpo.x)
    ty = Math.floor(dy - @dpo.y)
    
    @x += tx
    @y += ty
    @widgets.transform "...t#{tx},#{ty}"
    @dpo =
      x: dx
      y: dy
    @_compute_geometry()
    @ml.position.x = @x
    @ml.position.y = @y
    @ml.glass.change_measure_line @ml.volume, (@foot - @y) / @ml.glass.unit

  show: ->
    @widgets.show()

  hide: ->
    @widgets.hide()


  start: =>
    @dpo = @dpo ? {}
    @dpo =
      x: 0
      y: 0
    @border.attr
      'fill': 'gold'
      'fill-opacity': 0.05
      
  end: =>
    @border.attr
      'fill': 'white'
      'fill-opacity': 0

  _draw: () ->
    TICKWIDTH = @spec['thickwidth'] ? 10
    LABELSKIP = @spec['labelskip'] ? 5
    BENDINESS = 6

    @bend = @spec.bend ? false
    switch @ml.side
      when 'right'
        if @bend
          tickpath = "M#{@ml.position.x},#{@ml.position.y}c0,#{2},-#{BENDINESS},#{BENDINESS},-#{TICKWIDTH},#{BENDINESS}"
        else
          tickpath = "M#{@ml.position.x},#{@ml.position.y}h-#{TICKWIDTH}"
        tick = @canvas.path tickpath
        label = @canvas.text 0, 0, "#{@ml.volume} ml"
        # determine the position of the label
        label.attr
          'font-family': @spec['font-family'] ? 'sans-serif'
          'font-size': @spec['font-size'] ? 12
          'text-anchor': 'start'
        bbox = label.getBBox()
        labelleft = @ml.position.x - LABELSKIP - bbox.width - TICKWIDTH
        if @bend
          # if the mls are bended (3d), place the labels somewhat lower
          label.attr
            x: labelleft
            y: @ml.position.y + BENDINESS
        else
          label.attr
            x: labelleft
            y: @ml.position.y
        bbox = label.getBBox()
        @border = @canvas.rect bbox.x, bbox.y, bbox.width + TICKWIDTH, bbox.height
        @border.attr
          stroke: 'black'
          fill: 'white'
          'fill-opacity': 0
          'stroke-opacity': 0
          'stroke-dasharray': '. '
      when 'left'
        tickpath = "M#{@ml.position.x},#{@ml.position.y}h#{TICKWIDTH}"
        

    

    @widgets.push tick, label, @border
    bbox = @widgets.getBBox()
    @width = bbox.width
    @height = bbox.height
    #@widgets.hide() unless @ml.visible


# export WMeasureLine
window.WMeasureLine = WMeasureLine


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



###
(c) 2012, Huub de Beer (Huub@heerdebeer.org)
###

class WRuler extends Widget

  constructor: (@canvas, @x, @y, @width, @height, @height_in_mm, @spec = {
    orientation: "vertical"
    rounded_corners: 5
  }) ->
    super(@canvas, @x, @y, @spec)


# export WRuler
window.WRuler = WRuler


###
(c) 2012, Huub de Beer (Huub@heerdebeer.org)
###

class WVerticalRuler extends WRuler

  constructor: (@canvas, @x, @y, @width, @height, @height_in_mm, @spec = {
    orientation: "vertical"
    rounded_corners: 5
  }) ->
    super(@canvas, @x, @y, @width, @height, @height_in_mm, @spec)
    @_draw()
    @_compute_geometry()
    @widgets.mouseover (e) =>
      @measure_line.show()
    @widgets.mouseout (e) =>
      @measure_line.hide()
    @widgets.mousemove (e, x, y) =>
      p = @fit_point x, y
      #      y = e.pageY - @canvas.offset.top - @dy
      @_move_measure_line p.y
    @widgets.click (e, x, y) =>
      p = @fit_point x, y
      @_place_pointer p.y
  
  fit_point: (x, y) ->
    point =
      x: x - @canvas.canvas.parentNode.offsetLeft
      y: y - @canvas.canvas.parentNode.offsetTop
    point

  _place_pointer: (y) ->
    T_WIDTH = 10
    T_HEIGHT = 2
    triangle = "l#{T_WIDTH},#{T_HEIGHT}v-#{2 * T_HEIGHT}l-#{T_WIDTH},#{T_HEIGHT}m#{T_WIDTH},0"
    pointer = @canvas.path "M#{@x+@width},#{y}" + triangle + "h#{(@spec['measure_line_width'] ? 500) - @width - T_WIDTH - 2}"
    pointer.attr
        fill: '#222'
        stroke: '#222'
        'stroke-opacity': 0.5
        'stroke-width': 0.5
        'fill-opacity': 1
        'stroke-dasharray': '. '

    active = (elt) ->
        elt.attr
            fill: "red"
            stroke: "red"
            'stroke-opacity': 0.5
            'fill-opacity': 0.5
        
    unactive = (elt) ->
        elt.attr
            fill: "#222"
            stroke: '#222'
            'stroke-opacity': 0.5
            'stroke-width': 0.5
            'fill-opacity': 1
        
    remove = (elt) ->
        elt.unmouseover active
        elt.unmouseout unactive
        # Chrome gives error that attr is called of removed object, ie and
        # ff do not.
        elt.remove()


    pointer.mouseover ->
        active @
    pointer.mouseout ->
        unactive @
    pointer.click ->
        remove @
    pointer.touchstart ->
        active @
    pointer.touchcancel ->
        unactive @
    pointer.touchend ->
        remove @

    # Works only when whole group isn't translated
    #
    # pointer.transform(@transformstring)
    @pointers.push pointer

  _move_measure_line: (y) ->
    MEASURELINE_LENGTH = @spec['measure_line_width'] ? 500
    @measure_line.attr
      path: "M#{@x - @dx},#{y}h#{MEASURELINE_LENGTH}"
      stroke: 'red'
      'stroke-opacity': 0.5
      'stroke-width': 1

  _draw: () ->
    ###
    Draw a vertical ruler
    ###
    @unit = @height / @height_in_mm
    background = @canvas.rect @x, @y, @width, @height, @spec.rounded_corners ? 5
    background.attr
      fill: @spec.background ? "white"
      stroke: @spec.stroke ? "black"
      'stroke-width': @spec['stroke-width'] ? 2
    @widgets.push background

    ticks = @canvas.path @_ticks_path()
    ticks.attr
      stroke: @spec.stroke ? "black"
    @widgets.push ticks

    labels = @_ticks_labels()
    for label in labels
      label.attr
        'font-family': @spec['font-family'] ? 'sans-serif'
        'font-size': @spec['font-size'] ? 10
        'font-weight': 'bold'
      @widgets.push label

    cmlabel = @canvas.text @x + 11, @y + 11, "cm"
    cmlabel.attr
        'font-family': @spec['font-family'] ? 'sans-serif'
        'font-size': (@spec['font-size'] ? 10) + 2
        'font-weight': 'bold'
    @widgets.push cmlabel

    @pointers = @canvas.set()
    @widgets.push @pointers

    @measure_line = @canvas.path "M#{@x},#{@y}"
    @measure_line.hide()
    @widgets.push @measure_line

  _ticks_path: () ->
    ###
    Generate the ticks by moving from tick to tick and drawing a horizontal line
    for every tick.
    ###
    MM_WIDTH = @spec.mm_width ? 3
    HCM_WIDTH = @spec.hcm_width ? 7
    CM_WIDTH = @spec.cm_width ? 11
    x = @x + @width
    y = @y + @height - (@spec.border_width ? 2)
    d = ""
    for mm in [2...@height_in_mm - 1]
      y -= @unit
      d += "M#{x},#{y}"
      if mm % 10 is 0
        # a cm tick
        d += "h-#{CM_WIDTH}"
      else if mm % 5 is 0
        # a half a cm tick
        d += "h-#{HCM_WIDTH}"
      else
        # a mm tick
        d += "h-#{MM_WIDTH}"
    d

  _ticks_labels: () ->
    ###
    Draw the labels of the cm ticks
    ###
    X_DISTANCE = @spec.x_distance ? 18
    Y_DISTANCE = @spec.y_distance ? 3
    x = @x + @width - X_DISTANCE
    y = @y + @height - (@spec.border_width ? 2)
    cm = 0
    labels = []
    for mm in [2...@height_in_mm - 1]
      y -= @unit
      if mm % 10 is 0
        cm++
        labels.push(@canvas.text x, y + Y_DISTANCE, "#{cm}")
    labels


# export WRuler
window.WVerticalRuler = WVerticalRuler


###
###
class WGlass extends Widget
  
  constructor: (@canvas, @x, @y, @glass, @spec = {}) ->
    super(@canvas, @x, @y, @spec)
    @points = @_compute_points( @glass )
    @lengths = @_compute_lengths_at_heigth()
    



  _compute_points: (glass) ->
    ###
    Compute points, lengths, and paths between points for the edge, foot, stem, and bowl
    ###
    diameter = (length) ->
      Math.abs(Raphael.getPointAtLength(glass.path, length).x - glass.foot.x) * 2

    points = {}
    # Length 0 on the path is the edge of the glass
    length = 0

    # from the edge working downward to the foot
    for line in ['edge', 'bowl', 'stem', 'foot']
      points[line] = {}
      points[line].length = length = @_length_at_y glass.path, glass[line].y, length
      points[line].right = right = Raphael.getPointAtLength glass.path, length
      points[line].left =
        x: right.x - diameter(length)
        y: right.y

    points


  _compute_lengths_at_heigth: ->
    lengths = []
    length = 0
    max_length = Raphael.getTotalLength @glass.path
    height = @glass.height_in_mm*Glass.TENTH_OF_MM
    
    while height > 0
      height_in_pixels = @glass.foot.y - ((height * @glass.unit) / Glass.TENTH_OF_MM)
      while length < max_length and Raphael.getPointAtLength(@glass.path, length).y < height_in_pixels
        length++

      lengths[height] = length
      height--

    lengths[0] = @points.foot.length
    lengths



  _length_at_y: (path, y, start = 0) ->
    ###
      Find the length on the path the path hat intersects the horizontal line at y
    ###
    length = start
    max_length = Raphael.getTotalLength path

    while length < max_length and Raphael.getPointAtLength(path, length).y < y
      length++
      
    length


  _mirror_path_vertically: (path, x_line) ->
    ###
    ###
    mirror_x = (x) ->
      x_line - Math.abs(x_line - x)

    # By translating a path to a curve, all path commands are C commands.
    # That makes for easier translation as there is only one command to
    # mirror.
    cpath = Raphael.path2curve path

    cpathsegs = Raphael.parsePathString cpath
    mirror = ""
    mirrorlist = []
    
    # First element is always a M command, first part is 'M', second and
    # third the x and y coordinate, respectively
    [x,y] = cpathsegs[0][1..2]
    
    # For all other elements, which are C commands of the form C, cp1x, cp1y,
    # cp2x, cp2y, x, y, mirror the coordinates
    for segment in cpathsegs[1..cpathsegs.length]
      [cp1x,cp1y,cp2x,cp2y] = segment[1..4]
      mirrorlist.push [mirror_x(cp2x), cp2y, mirror_x(cp1x), cp1y, mirror_x(x), y]
      [x, y] = segment[5..6]

    # Now string the mirrored segments in reversed order together"
    mirror = ('C'+ segment.join(",") for segment in mirrorlist.reverse()).join("")
    mirror
      



# export WGlass
window.WGlass = WGlass


###
###
class WContourGlass extends WGlass

  constructor: (@canvas, @x, @y, @glass, @spec = {}) ->
    super(@canvas, @x, @y, @glass, @spec)
    @_draw()
    @place_at @x, @y
    @move_handler = null
    @graph = null
  
  start_manual_diff: =>
    @glasspane.mouseover @show_longdrink
    @glasspane.mouseout @hide_longdrink

  show_longdrink: =>
    @longdrink.show()
    @lml.show()
    @lbl.show()
    @ll.show()
    @lf.show()
    @llp.show()
    @lrp.show()
    @move_handler = @move_handler ? @move_longdrink @
    @glasspane.mousemove @move_handler


  hide_longdrink: =>
    @longdrink.hide()
    @lml.hide()
    @lbl.hide()
    @ll.hide()
    @lf.hide()
    @llp.hide()
    @lrp.hide()
    @lgl.hide()
    @gp.hide()
  
  fit_point: (x, y) ->
    point =
      x: x - @canvas.canvas.parentNode.offsetLeft
      y: y - @canvas.canvas.parentNode.offsetTop
    point

  set_graph: (graph) ->
    @graph = graph

  del_graph: ->
    @graph = null

  move_longdrink: (glassrep) ->
    (e, x, y) =>
      # First fix the point on the page
      p = glassrep.fit_point x, y
      # Then remove the translate of the glass representation to put it the
      # same coordinate system as the original path
      py = p.y - @dy
      # compute the height from the foot and convert it into tenth of mm
      ph = glassrep.points.foot.right.y - py
      h = Math.ceil((ph / glassrep.glass.unit) * Glass.TENTH_OF_MM)
      # find corresponding point on the glass contour
      length = glassrep.lengths[h]
      right = Raphael.getPointAtLength glassrep.glass.path, length
      # compute the left hand point
      left = right.x - 2*(right.x - glassrep.glass.edge.x)
      # compute a nice volume for the longdrink glas with height >= 100
      # pixels
      # radius
      r = (right.x - left)/2
      rmm = r / glassrep.glass.unit
      # start around about 2 cm
      hi = Math.floor(20 * glassrep.glass.unit)

      compute_vol = (rmm, h) ->
        hmm = h / glassrep.glass.unit
        Math.floor(Math.PI * Math.pow(rmm, 2) * hmm/1000)

      while ((compute_vol(rmm, hi) % 2) isnt 0 and (compute_vol(rmm, hi) % 10) isnt 5)
        hi++

      # hi is a nice volume
      vol = compute_vol(rmm, hi)
      BELOW = 10 * glassrep.glass.unit
      # set the max and bottom lines
      # start the longdrink glass about a cm below this point
      if @spec.diff_graph and @graph
        # draw the manual diff over the graph
        OVER_GRAPH_LENGTH = 1000
        # draw and set the longdrnk graph line lgl and set point on graph gp
        gheight = Math.ceil((ph / glassrep.glass.unit) )
        gvol = @glass.volume_at_height gheight
        line = @graph.computer_line
        gpx = line.min.x + gvol / line.x_unit.per_pixel
        gpy = line.max.y - (gheight/10) / line.y_unit.per_pixel
        halfvol = vol / 2
        halfvolpx = halfvol / line.x_unit.per_pixel
        lglpath = "M#{gpx},#{gpy}l#{halfvolpx},#{-hi+BELOW}M#{gpx},#{gpy}l-#{halfvolpx},#{BELOW}"
        @lgl.attr
          path: lglpath
        @lgl.show().toFront()
        @gp.attr
          cx: gpx
          cy: gpy
        @gp.show().toFront()
      else
        @lgl.hide()
        @gp.hide()
        OVER_GRAPH_LENGTH = 0


      @lf.attr
        x: left + @dx
        y: right.y + @dy
        width: right.x - left
        height: BELOW

      path = "M#{right.x},#{right.y-hi+BELOW}H#{-@dx+10}"
      path += "M#{right.x},#{right.y-hi+BELOW}h#{OVER_GRAPH_LENGTH}"
      @lml.attr
        path: path
        transform: "t#{@dx},#{@dy}"
      @lml.toFront()
      
      path = "M#{right.x},#{right.y+BELOW}H#{-@dx+10}"
      path += "M#{right.x},#{right.y+BELOW}h#{OVER_GRAPH_LENGTH}"
      @lbl.attr
        path: path
        transform: "t#{@dx},#{@dy}"
      @lbl.toFront()

      # generate the longdrink glass
      path = "M#{right.x},#{right.y+BELOW}v-#{hi+10}M#{right.x},#{right.y+BELOW}L#{left},#{right.y+BELOW}v-#{hi+10}"
      # and display it after translating it as the glass is translated
      @longdrink.attr
        path: path
        transform: "t#{@dx},#{@dy}"
      # display the points
      @llp.attr
        cx: left + @dx
        cy: right.y + @dy
      @lrp.attr
        cx: right.x + @dx
        cy: right.y + @dy
      # and place label just above the max line
      #
      @ll.attr
        text: "#{vol} ml"
        transform: "t#{left+@dx+10},#{right.y-hi+@dy-10+BELOW}"


      



  stop_manual_diff: =>
    @longdrink.hide()
    @lgl.hide()
    @gp.hide()
    @glasspane.unmousemove @move_handler
    @glasspane.unmouseover @show_longdrink
    @glasspane.unmouseout @hide_longdrink

  fill_to_height: (height_in_mm) ->
    ###
    Update the fill-part to correspond to a water level equal to the height_in_mm.
    ###
    diameter = (length, glass) ->
      Math.abs(Raphael.getPointAtLength(glass.path, length).x - glass.foot.x) * 2

    height = @glass.foot.y - (height_in_mm * @glass.unit)
    if height < @glass.bowl.y
      # if the height is larger than the base, there is something to fill
      @points.water_level = {}
      @points.water_level.length = length = @lengths[height_in_mm*Glass.TENTH_OF_MM]
      @points.water_level.right = right = Raphael.getPointAtLength @glass.path, length
      @points.water_level.left =
          x: right.x - diameter(length, @glass)
          y: right.y

      # Base part 
      right = Raphael.path2curve Raphael.getSubpath(@glass.path,
        @points.water_level.length, @points.bowl.length)
      left = @_mirror_path_vertically right, @glass.bowl.x

      @water_level.attr
        path: right + "H#{@points.bowl.left.x}"+ left

  _draw: ->
    @paths = @_create_paths()
    base = @canvas.path @paths.base
    base.attr
      fill: '#aaa'
      stroke: 'black'
      'stroke-width': 2
    @widgets.push base

    @water_level = @canvas.path "M0,0"
    @water_level.attr
      fill: '#abf'
      'fill-opacity': 0.4
      stroke: 'none'
    @widgets.push @water_level

    bowl = @canvas.path @paths.bowl
    bowl.attr
      stroke: 'black'
      'stroke-width': 2
    @widgets.push bowl

    
    # add maximum measure line
    maxpoint = Raphael.getPointAtLength(@glass.path, @lengths[@glass.maximum_height * Glass.TENTH_OF_MM])

    max_x = maxpoint.x
    max_y = maxpoint.y
    @max_ml = new MeasureLine @glass.maximum_volume,
      @glass.maximum_height,
      @glass,
      {x: max_x, y: max_y},
      'right',
      true,
      false
    max_ml_representation = new WMeasureLine @canvas, max_x, max_y, @max_ml
    #    @glass.add_measure_line @glass.maximum_volume, @glass.maximum_height, @max_ml, max_ml_representation

    @widgets.push max_ml_representation.widgets

    # max longdrink line
    # "fill"
    @lf = @canvas.rect 0, 0, 0, 0
    @lf.attr
      fill: 'orange'
      'fill-opacity': 0.5
      'stroke': 'none'
    @lf.hide()
    @lml = @canvas.path "M0,0"
    @lml.attr
      stroke: 'orange'
      'stroke-opacity': 0.5
      'stroke-dasharray': '-'
    @lml.hide()
    # bottom longdrink line
    @lbl = @canvas.path "M0,0"
    @lbl.attr
      stroke: 'orange'
      'stroke-opacity': 0.5
      'stroke-dasharray': '-'
    @lbl.hide()
    # longdrink glass for differentiation
    @longdrink = @canvas.path "M0,0"
    @longdrink.attr
      stroke: 'orange'
      'stroke-width': 3
      'stroke-opacity': 0.9
    @longdrink.hide()
    # Longdrink graph on graph
    @lgl = @canvas.path "M0,0"
    @lgl.attr
      stroke: 'orange'
      'stroke-width': 3
      'stroke-opacity': 0.9
    @lgl.hide()
    #longdrink point on graph
    @gp = @canvas.circle 0, 0, 2
    @gp.attr
      fill: 'gray'
    @gp.hide()
    # volume label londrink
    @ll = @canvas.text 0,0, "250 ml"
    @ll.attr
      'font-family': 'sans-serif'
      'font-size': '12pt'
      'text-anchor': 'start'
      fill: 'gray'
    @ll.hide()

    @llp = @canvas.circle 0, 0, 2
    @llp.attr
      fill: 'gray'
    @llp.hide()
    @lrp = @canvas.circle 0, 0, 2
    @lrp.attr
      fill: 'gray'
    @lrp.hide()
    
    @glasspane = @canvas.path @paths.bowl
    @glasspane.attr
      fill: 'white'
      'fill-opacity': 0
      'stroke-width': 5
      'stroke-opacity': 0

    @widgets.push @glasspane
      
  _create_paths: ->
    ###
    Create the path of the part of this glass
    ###
    paths = {}
    # Base part 
    right = Raphael.path2curve Raphael.getSubpath(@glass.path,
      @points.bowl.length, @points.foot.length)
    left = @_mirror_path_vertically right, @glass.foot.x
    paths.base = right + "H#{@points.foot.left.x}"+ left
    # Bowl part
    right = Raphael.path2curve Raphael.getSubpath(@glass.path,
      @points.edge.length, @points.bowl.length)
    left = @_mirror_path_vertically right, @glass.foot.x
    paths.bowl = right + "H#{@points.bowl.left.x}" + left
    paths

  _compute_geometry: () ->
    
    base = Raphael.pathBBox @paths.base
    bowl = Raphael.pathBBox @paths.bowl
    @geometry = {}
    @geometry.top = bowl.y
    @geometry.left = Math.min base.x, bowl.x
    @geometry.bottom = base.y2
    @geometry.right = Math.max base.x2, bowl.b2
    @geometry.width = Math.max base.width, bowl.width
    @geometry.height = base.height + bowl.height
    @geometry.center =
      x: (@geometry.right - @geometry.left) / 2 + @geometry.left
      y: (@geometry.bottom - @geometry.top) / 2 + @geometry.top


# export WContourGlass
window.WContourGlass = WContourGlass


###

(c) 2012, Huub de Beer, Huub@heerdebeer.org

###
class W3DGlass extends WGlass
  constructor: (@canvas, @x, @y, @glass, @spec = {}) ->
    super @canvas, @x, @y, @glass, @spec
    @_draw()
    @place_at @x, @y

  fill_to_height: (height_in_mm) ->
    ###
    Update the fill-parts to correspond to a water level equal to the height_in_mm.
    ###
    diameter = (length, glass) ->
      Math.abs(Raphael.getPointAtLength(glass.path, length).x - glass.foot.x) * 2


    height = @glass.foot.y - (height_in_mm * @glass.unit)
    if height <= @glass.bowl.y

      # if the height is larger than the base, there is something to fill
      @points.water_level = {}
      @points.water_level.length = length = @lengths[height_in_mm*Glass.TENTH_OF_MM]
      @points.water_level.right = right = Raphael.getPointAtLength @glass.path, length
      @points.water_level.left =
          x: right.x - diameter(length, @glass)
          y: right.y
      @current_length = length
      
      # the fill elements
      @fillback.attr
        path: @_create_path 'bowl', 'water_level', 'back'
      @fillfront.attr
        path: @_create_path 'bowl', 'water_level', 'front'


  _draw: ->
    # The back of the glass
    bowlback = @canvas.path @_create_path 'bowl', 'edge', 'back'
    bowlback.attr
      fill: '344-#fff:10-#eee:75'
      'fill-opacity': 0.4
      stroke: '#eee'
    @widgets.push bowlback

    baseback = @canvas.path @_create_path 'foot', 'bowl', 'back'
    baseback.attr
      fill: '344-#eee-#fff-#eee-#ccc'
      'fill-opacity': 0.4
      stroke: '#eee'
    @widgets.push baseback
    
    @fillback = @canvas.path "m0,0"
    @fillback.attr
      fill: '348-#abf-#abf:50'
      'fill-opacity': 0.4
      stroke: 'none'
    @widgets.push @fillback

    # mid section of this glass
    bowlmid = @canvas.path @_create_path 'bowl', 'edge', 'mid'
    bowlmid.attr
      stroke: '#eee'
    @widgets.push bowlmid

    basemid = @canvas.path @_create_path 'foot', 'bowl', 'mid'
    basemid.attr
      stroke: '#eee'
    @widgets.push basemid

    # Front section of this glass
    @fillfront = @canvas.path "m0,0"
    @fillfront.attr
      fill: '348-#abf-#abf:50'
      'fill-opacity': 0.4
      stroke: 'none'
    @widgets.push @fillfront

    bowlfront = @canvas.path @_create_path 'bowl', 'edge', 'front'
    bowlfront.attr
      fill: '270-#fff-#eee:5'
      'fill-opacity': 0.4
      stroke: '#eee'
    @widgets.push bowlfront

    basefront = @canvas.path @_create_path 'foot', 'bowl', 'front'
    basefront.attr
      fill: '350-#eee:5-#eee:15'
      'fill-opacity': 0.2
      stroke: '#eee'
    @widgets.push basefront
      
    # add maximum measure line
    maxpoint = Raphael.getPointAtLength(@glass.path, @lengths[@glass.maximum_height * Glass.TENTH_OF_MM])
    max_x = maxpoint.x
    max_y = maxpoint.y
    @max_ml = new MeasureLine @glass.maximum_volume,
      @glass.maximum_height,
      @glass,
      {x: max_x, y: max_y},
      'right',
      true,
      false
    max_ml_representation = new WMeasureLine @canvas, max_x, max_y, @max_ml, @glass.foot, {bend: true}
    @widgets.push max_ml_representation.widgets




  _create_path: (bottom, top, kind) ->
    ###
    Create the paths of this glass for bowl and base
    ###
    path = ""
    switch kind
      when 'back'
        right = Raphael.path2curve Raphael.getSubpath(@glass.path,
          @points[top].length, @points[bottom].length)
        left  = @_mirror_path_vertically right, @glass.foot.x
        bottom = @_connect(@points[bottom].right, @points[bottom].left, false, 'belowbend')
        top = @_connect(@points[top].left, @points[top].right, false, 'abovebend')
        path += right + bottom + left + top
      when 'front'
        right = Raphael.path2curve Raphael.getSubpath(@glass.path, @points[top].length, @points[bottom].length)
        left = @_mirror_path_vertically right, @glass.foot.x
        top = @_connect(@points[top].right, @points[top].left, false, 'belowbackbend')
        bottom = @_connect(@points[bottom].right, @points[bottom].left, false, 'belowbend')
        path += right + bottom + left + top
      when 'mid'
        path += @_connect(@points[bottom].left, @points[bottom].right, true, 'abovebend')
    path
        

  _connect: (p1, p2, move = false, type = "straight") ->
      ###
      ###
      SMALLBEND = 15
      BIGBEND = 10
      path = ""
      path = "M#{p1.x},#{p1.y}" if move
      d = Math.abs(p1.x - p2.x) 
      switch type
          when "straight"
              path = path + "H#{p2.x}"
              @dh = 0
          when "abovebend"
              dh =  (d / SMALLBEND)
              path = path + "c5,-#{dh},#{d-5},-#{dh},#{d},0"
          when "abovebackbend"
              dh =  (d / SMALLBEND)
              path = path + "c5,-#{dh},-#{d-5},-#{dh},-#{d},0"
          when "belowbend"
              @dh = (d / BIGBEND)
              path = path + "c0,#{@dh},-#{d},#{@dh},-#{d},0"
          when "belowbackbend"
              @dh =  (d / BIGBEND)
              path = path + "c0,#{@dh},#{d},#{@dh},#{d},0"
      
      path
  
  _compute_geometry: () ->

    bowl = Raphael.pathBBox @_create_path('bowl', 'edge', 'front')
    base = Raphael.pathBBox @_create_path('foot', 'bowl', 'front')
    
    @geometry = {}
    @geometry.top = bowl.y
    @geometry.left = Math.min base.x, bowl.x
    @geometry.bottom = base.y2
    @geometry.right = Math.max base.x2, bowl.b2
    @geometry.width = Math.max base.width, bowl.width
    # the glass apears to be larger due to the 3D-effect; compote from points
    @geometry.height = @points.foot.left.y - @points.edge.left.y
    @geometry.center =
      x: (@geometry.right - @geometry.left) / 2 + @geometry.left
      y: (@geometry.bottom - @geometry.top) / 2 + @geometry.top
      
# export W3DGlass
window.W3DGlass = W3DGlass


# 
# filler.coffee (c) 2012 HT de Beer
#
# simulation of filling a glass and creating a measuring cup
#
window.Filler = class
  
  initialize_properties: (properties) ->
    # Initialize properties with properties or default values
    p = {}
    p.components = properties?.components ? ['tap', 'ruler', 'measure_lines', 'graph']
    p.dimension = properties?.dimension ? '2d'
    p.time = properties?.time ? false
    p.buttons = properties?.buttons ? ['show_ml', 'show_graph']
    if p.dimension isnt '2d' and 'manual_diff' in p.buttons
      delete p.buttons[p.buttons.indexOf('manual_diff')]
    if 'measure_lines' not in p.components and 'show_ml' in p.buttons
      delete p.buttons[p.buttons.indexOf('show_ml')]
    p.editable = properties?.editable ? true
    if not p.editable
      delete p.buttons[p.buttons.indexOf('show_ml')]
    p.icon_path = properties?.icon_path ? 'lib/icons'
    p.fillable = properties?.fillable ? true
    p.speed = properties?.speed ? 15
    p.graph_buttons = properties?.graph_buttons ? ['normal', 'point', 'straight', 'curve', 'remove', 'raster']
    p.computer_graph = properties?.computer_graph ? false
    p.time_graph = properties?.time_graph ? false
    p.speed_graph = properties?.speed_graph ? false
    p.diff_graph = properties?.diff_graph ? false
    p.hide_all_except_graph = properties?.hide_all_except_graph ? false
    p

  get_glass: ->
    @glass


  fit_point: (x, y) ->
    point =
      x: x - @paper.canvas.parentNode.offsetLeft
      y: y - @paper.canvas.parentNode.offsetTop
    point

  constructor: (@paper, @x, @y, @glass, @width, @height, properties) ->
    @spec = @initialize_properties(properties)

    @PADDING = 2
    @BUTTON_SEP = 5
    @BUTTON_WIDTH = 34
    CoffeeGrounds.Button.set_width @BUTTON_WIDTH
    @BUTTON_X = @x + @PADDING
    @BUTTON_Y = @y + @PADDING
    CoffeeGrounds.Button.set_base_path @spec.icon_path
    @GROUP_SEP = 15

    
    if 'tap' in @spec.components
      @TAP_SEP = 10
      @TAP_HEIGHT = 150
      @spec.buttons_orientation = 'vertical'
    else
      @TAP_SEP = @BUTTON_SEP
      @TAP_HEIGHT = @BUTTON_WIDTH
      @spec.buttons_orientation = 'horizontal'

    if 'ruler' in @spec.components
      @RULER_WIDTH = 50
      @RULER_SEP = 25
      @RULER_X = @x + @PADDING
      @RULER_Y = @y + @PADDING + @TAP_HEIGHT + @RULER_SEP
    else
      # no ruler
      @RULER_WIDTH = 0
      @RULER_SEP = 0
      @RULER_X = 0
      @RULER_Y = 0


    @GLASS_SEP = 50
    @GLASS_X = @x + @PADDING + @RULER_SEP + @RULER_WIDTH
    @GLASS_Y = @y + @PADDING + @TAP_HEIGHT + @GLASS_SEP

    @MLBOX_SEP = 30
    @MLBOX_X = @x + @PADDING

    @actions =
      show_ml:
        button:
          type: 'switch'
          group: 'components'
          icon: 'transform-move'
          tooltip: 'Laat de maatstreepjes zien / verberg de maatstreepjes'
          switched_on: true
          on_switch_on: =>
            @mlbox.show()
          on_switch_off: =>
            @mlbox.hide()
      manual_diff:
        button:
          type: 'switch'
          group: 'components'
          icon: 'draw-triangle'
          tooltip: 'Meet snelheid met een longdrink glas'
          switched_on: false
          on_switch_on: =>
            @differentiate_tool()
          on_switch_off: =>
            @differentiate_tool()

    @diff_tool = true
    @draw()

  differentiate_tool: =>
    if @diff_tool
      @glass_representation.stop_manual_diff()
      @diff_tool = false
    else
      @glass_representation.start_manual_diff()
      @diff_tool = true

  draw: ->
  
    if @spec.dimension is '2d'
      @glass_representation = new WContourGlass @paper, @GLASS_X, @GLASS_Y, @glass,
        diff_graph: @spec.diff_graph
    else
      @glass_representation = new W3DGlass @paper, @GLASS_X, @GLASS_Y, @glass
   
    @GLASS_HEIGHT = @glass_representation.geometry.height
    @GLASS_WIDTH = @glass_representation.geometry.width

    @RULER_EXTRA = (@GLASS_SEP - @RULER_SEP) * (@glass.height_in_mm/@GLASS_HEIGHT)
    if 'ruler' in @spec.components
      @ruler = new WVerticalRuler @paper, @RULER_X, @RULER_Y, @RULER_WIDTH,
        @GLASS_HEIGHT + @RULER_SEP,
        @glass.height_in_mm + @RULER_EXTRA,
          {'measure_line_width': @GLASS_WIDTH + @RULER_SEP*2 + @RULER_WIDTH}


    if 'measure_lines' in @spec.components
      @MLBOX_Y = @GLASS_Y + @GLASS_HEIGHT + @MLBOX_SEP
      @MLBOX_WIDTH = @RULER_WIDTH + @RULER_SEP + @GLASS_WIDTH
      @mlbox = new CoffeeGrounds.MeasureLineBox @paper, @MLBOX_X, @MLBOX_Y, @MLBOX_WIDTH, @glass, @GLASS_Y + @GLASS_HEIGHT, {
        editable: @spec.editable
        bend: if @spec.dimension is '2d' then false else true
      }

    if 'graph' in @spec.components
      @GRAPH_SEP = 50
      @GRAPH_GRAPH_SEP = 15
      @GRAPH_PADDING = 2
      @GRAPH_AXIS_WIDTH = 40
      @GRAPH_BUTTON_WIDTH = 34
      @GRAPH_X = @GLASS_X + @GLASS_WIDTH + @GRAPH_SEP
      @GRAPH_Y = @RULER_Y - @BUTTON_WIDTH - @GRAPH_GRAPH_SEP - @GRAPH_PADDING
      @GRAPH_HEIGHT = @GLASS_HEIGHT + (@GLASS_SEP - @RULER_SEP) + @GRAPH_PADDING*2 + @GRAPH_BUTTON_WIDTH + @GRAPH_AXIS_WIDTH + @GRAPH_GRAPH_SEP

      if @spec.time_graph
        # determine the time axis
        time = (@glass.maximum_volume * 1.1)/ @spec.speed
        @GRAPHER_WIDTH = 450
        @GRAPH_WIDTH = @GRAPHER_WIDTH - 2*@GRAPH_PADDING - @GRAPH_AXIS_WIDTH
        time_per_pixel = time / @GRAPH_WIDTH
        pixels_per_cm = @glass.unit*Glass.TENTH_OF_MM
        timestep_candidate = time / (@GRAPH_WIDTH / pixels_per_cm)

        timeticks = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
        timestep_i = 0
        while timestep_i < timeticks.length and timeticks[timestep_i] <= timestep_candidate
          timestep_i++
        
#      volstep = if volstep_i > 1 then (volticks[volstep_i - 1]/2).toFixed(1) else 0.5
#      ^^ nicer but not with a raster
        timetickspath = "#{timeticks[timestep_i - 1]}tL"
        
        #vol_per_pixel = 0.5

        @graph = new Graph @paper, @GRAPH_X, @GRAPH_Y, @GRAPHER_WIDTH, @GRAPH_HEIGHT,
          x_axis:
            label: "tijd (sec)"
            raster: true
            unit:
              per_pixel: time_per_pixel
              symbol: "sec"
              quantity: "tijd"
            max: time
            tickspath: timetickspath
            orientation: 'horizontal'
          y_axis:
            label: "hoogte (cm)"
            raster: true
            unit:
              per_pixel: (0.1/@glass.unit)
              symbol: "cm"
              quantity: "hoogte"
            max: @glass.height_in_mm + @RULER_EXTRA
            tickspath: "0.5tL"
            orientation: 'vertical'
          buttons: @spec.graph_buttons
          computer_graph: @spec.computer_graph
          editable: @spec.editable
          icon_path: @spec.icon_path

        @glass.create_graph(@paper, @graph.computer_graph, @graph.computer_line, 'time', @spec.speed)

      else if @spec.speed_graph

        # determine speed axis
        speed = @glass.maximum_speed * 1.10
        @GRAPHER_HEIGHT  = @GRAPH_HEIGHT - 2*@GRAPH_PADDING - @GRAPH_BUTTON_WIDTH - @GRAPH_AXIS_WIDTH - @GRAPH_GRAPH_SEP
        speed_per_pixel = speed / @GRAPHER_HEIGHT

        speedstep_candidate = speed / 10
        speedticks = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10]
        speedstep_i = 0
        while speedstep_i < speedticks.length and speedticks[speedstep_i] <= speedstep_candidate
          speedstep_i++
        
#      speedstep = if speedstep_i > 1 then (speedticks[speedstep_i - 1]/2).toFixed(1) else 0.5
#      ^^ nicer but not with a raster
        speedtickspath = "#{speedticks[speedstep_i - 1]}tL"

        # determine the volume axis
        vol = @glass.maximum_volume * 1.10
        @GRAPHER_WIDTH = 450
        @GRAPH_WIDTH = @GRAPHER_WIDTH - 2*@GRAPH_PADDING - @GRAPH_AXIS_WIDTH
        vol_per_pixel = vol / @GRAPH_WIDTH
        pixels_per_cm = @glass.unit*Glass.TENTH_OF_MM
        volstep_candidate = vol / 15

        volticks = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
        volstep_i = 0
        while volstep_i < volticks.length and volticks[volstep_i] <= volstep_candidate
          volstep_i++
        
#      volstep = if volstep_i > 1 then (volticks[volstep_i - 1]/2).toFixed(1) else 0.5
#      ^^ nicer but not with a raster
        voltickspath = "#{volticks[volstep_i - 1]}tL"
        
        #vol_per_pixel = 0.5

        @graph = new Graph @paper, @GRAPH_X, @GRAPH_Y, @GRAPHER_WIDTH, @GRAPH_HEIGHT,
          x_axis:
            label: "volume (ml)"
            raster: true
            unit:
              per_pixel: vol_per_pixel
              symbol: "ml"
              quantity: "volume"
            max: vol
            tickspath: voltickspath
            orientation: 'horizontal'
          y_axis:
            label: "stijgsnelheid (cm/ml)"
            raster: true
            unit:
              per_pixel: speed_per_pixel
              symbol: "cm/ml"
              quantity: "stijgsnelheid"
            max: speed
            tickspath: speedtickspath
            orientation: 'vertical'
          buttons: @spec.graph_buttons
          computer_graph: @spec.computer_graph
          editable: @spec.editable
          icon_path: @spec.icon_path

        @glass.create_graph(@paper, @graph.computer_graph, @graph.computer_line, 'vol', true)

      else
        # determine the volume axis
        vol = @glass.maximum_volume * 1.10
        @GRAPHER_WIDTH = 450
        @GRAPH_WIDTH = @GRAPHER_WIDTH - 2*@GRAPH_PADDING - @GRAPH_AXIS_WIDTH
        vol_per_pixel = vol / @GRAPH_WIDTH
        pixels_per_cm = @glass.unit*Glass.TENTH_OF_MM
        volstep_candidate = vol / (@GRAPH_WIDTH / pixels_per_cm)

        volticks = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
        volstep_i = 0
        while volstep_i < volticks.length and volticks[volstep_i] <= volstep_candidate
          volstep_i++
        
#      volstep = if volstep_i > 1 then (volticks[volstep_i - 1]/2).toFixed(1) else 0.5
#      ^^ nicer but not with a raster
        voltickspath = "#{volticks[volstep_i - 1]}tL"
        
        #vol_per_pixel = 0.5

        @graph = new Graph @paper, @GRAPH_X, @GRAPH_Y, @GRAPHER_WIDTH, @GRAPH_HEIGHT,
          x_axis:
            label: "volume (ml)"
            raster: true
            unit:
              per_pixel: vol_per_pixel
              symbol: "ml"
              quantity: "volume"
            max: vol
            tickspath: voltickspath
            orientation: 'horizontal'
          y_axis:
            label: "hoogte (cm)"
            raster: true
            unit:
              per_pixel: (0.1/@glass.unit)
              symbol: "cm"
              quantity: "hoogte"
            max: @glass.height_in_mm + @RULER_EXTRA
            tickspath: "0.5tL"
            orientation: 'vertical'
          buttons: @spec.graph_buttons
          computer_graph: @spec.computer_graph
          editable: @spec.editable
          icon_path: @spec.icon_path

        @glass.create_graph(@paper, @graph.computer_graph, @graph.computer_line, 'vol')

    # The tap wants a computergraph representation, so, if there is no
    # graphing component give it an empty path.
    @computer_graph = @graph?.computer_graph ? null
    if @spec.diff_graph
      # add the graph to the glass representation as to allow for
      # differentation on glass and grpah at the same time
      @glass_representation.set_graph @graph
    
    if 'tap' in @spec.components
      stream_extra = @GLASS_SEP - 5
      MID_MOVE = 10
      @tap = new CoffeeGrounds.Tap  @paper, @GLASS_X + @GLASS_WIDTH/2 - MID_MOVE, @y, @glass, @computer_graph, {
        glass_to_fill: @glass_representation
        time: @spec.time
        runnable: @spec.fillable
        speed: @spec.speed
        stream_extra: stream_extra
        icon_path: @spec.icon_path
      }



    @draw_buttons()

    if @spec.hide_all_except_graph
      # hide all except the graph
      cover = @paper.rect @x - 5, @y - 5, @GRAPH_X - @x, @height
      cover.attr
        fill: 'white'
        stroke: 'white'

  draw_buttons:  ->
    x = @BUTTON_X
    y = @BUTTON_Y
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
          if @spec.buttons_orientation is 'horizontal'
            if button.group is group
              x += @BUTTON_WIDTH + @BUTTON_SEP
            else
              x += @BUTTON_WIDTH + @GROUP_SEP
          else
            if button.group is group
              y += @BUTTON_WIDTH + @BUTTON_SEP
            else
              y += @BUTTON_WIDTH + @GROUP_SEP
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



