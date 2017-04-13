const fs = require('fs');
const path = require('path');
const readline = require('readline')

const issue = fs.createReadStream(path.resolve(process.cwd(), './source/_posts/monthly-issue-15.md'), 'utf-8');


const rl = readline.createInterface({
  input: issue,
  output: null
})

const meta = [];
let category = {};
let artile = {};

let inCategory = false;
let inArticle = false;

rl.on('line', function (line) {
  if (line.startsWith('####')) {
    if (inCategory) {
      meta.push(category);
      category = {};
    }
    inCategory = true;
    category.name = line.slice(4).trim();
    category.articles = [];
    return;
  }
  
  linkTextMatch = line.match(/(?:__|[*#])|\[(.*?)\]\((.*?)\)/);
  
  if(linkTextMatch) {    
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
rl.on('close', function() {
  meta.push(category);
  console.log(util.inspect(meta, {showHidden: false, depth: null}));
})

