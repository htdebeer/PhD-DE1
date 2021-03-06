###
glass.coffee version 0.1

Modeling different glasses

(c) 2012 Huub de Beer H.T.de.Beer@gmail.com

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
    

