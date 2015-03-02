###

(c) 2012, Huub de Beer, H.T.de.Beer@gmail.com

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
