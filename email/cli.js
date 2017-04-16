const parse = require('./parse');
const send = require('./send');

let argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .describe('f', 'Load a file')
  .describe('s', 'Specific issue Subject')
  .describe('i', 'Specific issue Text')
  .describe('e', 'Specific editors')
  .describe('to', 'Specific receiver')
  .demandOption(['f', 's', 'i', 'e', 'to'])
  .help('h')
  .argv;


let file = argv.f;
let subject = argv.s;
let issue_text = argv.i;
let editors = argv.e;
let to = argv.to

parse(file, subject, issue_text, editors)
  .then(html => {
    send(to, subject, html)
  })
