#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const swig = require('swig');
let argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .describe('f', 'Load a file')
  .describe('s', 'Specific issue Subject')
  .describe('i', 'Specific issue Text')
  .describe('e', 'Specific editors')
  .demandOption(['f', 's', 'i', 'e'])
  .help('h')
  .argv;

let file = argv.f;
let subject = argv.s;
let issue_text = argv.i;
let editors = argv.e;

const issue = fs.createReadStream(path.resolve(process.cwd(), file), 'utf-8');

const meta = {
  subject: subject,
  issue_text: issue_text,
  categories: [],
  editors: editors && editors.split(',') || []
};

let category = {};
let artile = {};

let inCategory = false;
let inArticle = false;

const rl = readline.createInterface({
  input: issue,
  output: null
})


rl.on('line', function (line) {
  if (line.startsWith('####')) {
    if (inCategory) {
      meta.categories.push(category);
      category = {};
    }
    inCategory = true;
    category.name = line.slice(4).trim();
    category.articles = [];
    return;
  }

  linkTextMatch = line.match(/(?:__|[*#])|\[(.*?)\]\((.*?)\)/);

  if (linkTextMatch) {
    inArticle = true;
    artile.title = linkTextMatch[1];
    artile.link = linkTextMatch[2];
    return;
  }

  if (inArticle) {
    artile.description = line;
    category.articles.push(artile);
    artile = {};
    inArticle = false;
    return;
  };
});

var util = require('util');
rl.on('close', function () {
  meta.categories.push(category);
  // console.log(util.inspect(meta, { showHidden: false, depth: null }));

 const result = swig.renderFile(path.resolve(process.cwd(), './email/email.tpl.html'), meta);

  fs.writeFile(path.resolve(process.cwd(), './email/email.html'), result, (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  })
})
