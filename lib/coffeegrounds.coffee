window.CoffeeGrounds = class

  canvas = {}
  constructor: (@id, width, height) ->
    canvas = Raphael @id, width, height
