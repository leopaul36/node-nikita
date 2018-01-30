
fs = require 'fs'
nikita = require '..'

date = -> d = (new Date).toISOString()

source = "#{__dirname}/nikita.coffee"
target = "#{__dirname}/../doc/index.md"
docs = """
---
language: en
layout: page
title: "Node Nikita: Common functions for system deployment"
date: #{date()}
comments: false
sharing: false
footer: false
github: https://github.com/wdavidw/node-nikita
---
"""

fs.readFile source, 'ascii', (err, content) ->
  re = /###\n([\s\S]*?)\n( *)###/g
  re_code = /\n(\s{4}\s*?\w[\s\S]*?)\n(?!\s)/g
  match = re.exec content
  docs += match[1]
  while match = re.exec content
    match[1] = match[1].split('\n').map((line)->line.substr(2)).join('\n')
    match[1] = match[1].replace re_code, (str, code) ->
      code = code.split('\n').map((line)->line.substr(4)).join('\n')
      "\n```coffeescript\n#{code}\n```"
    docs += match[1]
  fs.writeFile target, docs, (err) ->
    return console.log err.message if err
    console.log 'Documentation generated'
    target = process.argv[2]
    return unless target
    nikita.system.copy
      source: "#{__dirname}/../doc/index.md"
      target: target
      force: true
    , (err, copied) ->
      console.log "Documentation published: #{target}"
