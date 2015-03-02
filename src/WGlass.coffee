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
