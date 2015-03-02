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
  
  fit_point: (x, y) ->
    point =
      x: x - @canvas.canvas.parentNode.offsetLeft
      y: y - @canvas.canvas.parentNode.offsetTop
    point

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
      # set the max and bottom lines
      # start the longdrink glass about a cm below this point
      BELOW = 10 * glassrep.glass.unit
      @lf.attr
        x: left + @dx
        y: right.y + @dy
        width: right.x - left
        height: BELOW

      path = "M#{right.x},#{right.y-hi+BELOW}H#{-@dx+10}"
      @lml.attr
        path: path
        transform: "t#{@dx},#{@dy}"
      
      path = "M#{right.x},#{right.y+BELOW}H#{-@dx+10}"
      @lbl.attr
        path: path
        transform: "t#{@dx},#{@dy}"

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


# 
# compare_filler.coffee (c) 2012 HT de Beer
#
# simulation of filling a glasses while comparing them
#
window.CompareFiller = class
  
  initialize_properties: (properties) ->
    # Initialize properties with properties or default values
    p = {}
    p.dimension = properties?.dimension ? '2d'
    p.time = properties?.time ? false
    p.icon_path = properties?.icon_path ? 'lib/icons'
    p.fillable = properties?.fillable ? true
    p

  get_glass: ->
    @glass

  start: ->
    for glass in @glasses
      glass.tap.start()
      glass.tap.simulation.select 'play'

  empty: ->
    for glass in @glasses
      glass.tap.empty()
      glass.tap.simulation.select 'start'

  pause: ->
    for glass in @glasses
      glass.tap.pause()
      glass.tap.simulation.select 'pause'
  
  full: ->
    for glass in @glasses
      glass.tap.full()
      glass.tap.simulation.select 'end'

  fit_point: (x, y) ->
    point =
      x: x - @paper.canvas.parentNode.offsetLeft
      y: y - @paper.canvas.parentNode.offsetTop
    point

  constructor: (@paper, @x, @y, @glasses, @width, @height, properties) ->
    @spec = @initialize_properties(properties)

    @PADDING = 2
    
    @TAP_SEP = 10
    @TAP_HEIGHT = 150

    @RULER_WIDTH = 50
    @RULER_SEP = 25
    @RULER_X = @x + @PADDING
    @RULER_Y = @y + @PADDING + @TAP_HEIGHT + @RULER_SEP


    @GLASS_SEP = 50
    @GLASS_X = @x + @PADDING + @RULER_SEP + @RULER_WIDTH
    @GLASS_Y = @y + @PADDING + @TAP_HEIGHT + @GLASS_SEP

    @COMPARE_SEP = 75

    @draw()
    
  draw: ->
    x = @x + @PADDING
    y = @y + @PADDING + @TAP_HEIGHT + @GLASS_SEP

    # Find largest glass (height)
    max_height = 0 # in mm
    max_glass_height = 0 # in px
    for glass in @glasses
      max_height = Math.max max_height, glass.model.height_in_mm
      glass.glass_height = glass.model.foot.y - glass.model.edge.y
      max_glass_height = Math.max max_glass_height, glass.glass_height

    # draw all glasses; compute total width
    total_width = 0
    for glass in @glasses
      glass_x = x + @RULER_WIDTH + @RULER_SEP
      glass_y = y + (max_glass_height - glass.glass_height)

      glass_representation = new WContourGlass @paper, glass_x, glass_y, glass.model
      glass_height = glass_representation.geometry.height
      glass_width = glass_representation.geometry.width

      
      MID_MOVE = 10
      stream_extra = Math.abs(glass.glass_height-max_glass_height) + @GLASS_SEP - 7
      tap = new CoffeeGrounds.Tap @paper,
        glass_x + glass_width/2 - MID_MOVE,
        @y + @PADDING,
        glass.model,
        null,
          speed: glass.speed
          glass_to_fill: glass_representation
          time: glass.time
          runnable: glass.runnable
          icon_path: @spec.icon_path
          stream_extra: stream_extra
     
      x += glass_width + @COMPARE_SEP
      total_width += glass_width + @COMPARE_SEP

      glass.tap = tap


    # Put in one ruler to rule them all
    ruler_extra = (@GLASS_SEP - @RULER_SEP) * (max_height/max_glass_height)
    ruler = new WVerticalRuler @paper,
      @RULER_X,
      @RULER_Y,
      @RULER_WIDTH,
      max_glass_height + @RULER_SEP,
      max_height + ruler_extra,
        'measure_line_width': total_width + @RULER_SEP*2 + @RULER_WIDTH
