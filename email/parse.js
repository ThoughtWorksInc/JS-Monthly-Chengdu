#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const swig = require('swig')

module.exports = function (file, subject, issue_text, editors) {
  const issue = fs.createReadStream(path.resolve(process.cwd(), file), 'utf-8')

  const meta = {
    subject: subject,
    issue_text: issue_text,
    categories: [],
    editors: editors && editors.split(',') || []
  }

  let category = {}
  let artile = {}

  let inCategory = false
  let inArticle = false

  const rl = readline.createInterface({
    input: issue,
    output: null
  })

  rl.on('line', function (line) {
    if (line.startsWith('####')) {
      if (inCategory) {
        meta.categories.push(category)
        category = {}
      }
      inCategory = true
      category.name = line.slice(4).trim()
      category.articles = []
      return
    }

    linkTextMatch = line.match(/(?:__|[*#])|\[(.*?)\]\((.*?)\)/)

    if (linkTextMatch) {
      inArticle = true
      artile.title = linkTextMatch[1]
      artile.link = linkTextMatch[2]
      return
    }

    if (inArticle) {
      artile.description = line
      category.articles.push(artile)
      artile = {}
      inArticle = false
      return
    }
  })

  var util = require('util')

  return new Promise((resolve, reject) => {
    rl.on('close', function () {
      meta.categories.push(category)

      const result = swig.renderFile(path.resolve(process.cwd(), './email/email.tpl.html'), meta)

      fs.writeFile(path.resolve(process.cwd(), './email/email.html'), result, (err) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      })
    })
  })
}
