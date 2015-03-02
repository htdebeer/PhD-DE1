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


