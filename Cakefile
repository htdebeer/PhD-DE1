fs = require 'fs'
{exec} = require 'child_process'

knmi_grapher = [
  'line',
  'button',
  'graph',
  'KNMIGrapher'
]
life_simulator = [
  'line',
  'button',
  'graph',
  'life',
  'life_simulator'
]

track_racer = [
  'line',
  'button',
  'graph',
  'racer',
  'track_racer'
]
# fill in later
compare_filler = [
  'glass',
  'button',
  'tap',
  'measure_line',
  'Widget',
  'WMeasureLine',
  'WRuler',
  'WVerticalRuler',
  'WGlass',
  'WContourGlass',
  'compare_filler'
]

# fill in later
flask_filler = [
  'glass',
  'line',
  'button',
  'graph',
  'measure_line',
  'tap',
  'Widget',
  'WMeasureLine',
  'measure_line_box',
  'WRuler',
  'WVerticalRuler',
  'WGlass',
  'WContourGlass',
  'W3DGlass',
  'filler'
]

# glass design component
glass_grafter = [
  'contour_line',
  'button',
  'glass',
  'grafter'
]

# graphing component
growth_grapher = [
  'line',
  'button',
  'graph'
]


task 'build:glass_grafter', 'Build glass grafter component from source files', ->
  componentContents  = new Array remaining = glass_grafter.length
  for file, index in glass_grafter then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      componentContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/glass_grafter.coffee', componentContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/glass_grafter.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'
  
task 'build:growth_grapher', 'Build growth grapher component from source files', ->
  componentContents  = new Array remaining = growth_grapher.length
  for file, index in growth_grapher then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      componentContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/growth_grapher.coffee', componentContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/growth_grapher.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'
  
task 'build:flask_filler', 'Build flask filler component from source files', ->
  componentContents  = new Array remaining = flask_filler.length
  for file, index in flask_filler then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      componentContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/flask_filler.coffee', componentContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/flask_filler.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'

task 'build:compare_filler', 'Build compare filler component from source files', ->
  componentContents  = new Array remaining = compare_filler.length
  for file, index in compare_filler then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      componentContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/compare_filler.coffee', componentContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/compare_filler.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'

task 'build:track_racer', 'Build track racer component from source files', ->
  componentContents  = new Array remaining = track_racer.length
  for file, index in track_racer then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      componentContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/track_racer.coffee', componentContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/track_racer.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'

task 'build:knmi_grapher', 'Build knmi graph component from source files', ->
  componentContents  = new Array remaining = knmi_grapher.length
  for file, index in knmi_grapher then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      componentContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/knmi_grapher.coffee', componentContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/knmi_grapher.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'

task 'build:life_simulator', 'Build track racer component from source files', ->
  componentContents  = new Array remaining = life_simulator.length
  for file, index in life_simulator then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      componentContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/life_simulator.coffee', componentContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/life_simulator.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'
