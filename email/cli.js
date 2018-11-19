#!/usr/bin/env node

const parse = require('./parse');
const send = require('./send');
const path = require('path');

let argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .describe('f', 'Load a source file of the post')
  .describe('s', 'Specific issue Subject of the Email')
  .describe('i', 'Specific issue Sub Title of the Email')
  .describe('e', 'Specific editors，must use english comma divider')
  .describe('to', 'Specific receiver')
  .describe('bcc', 'Specific receiver')
  .describe('action', 's for Send, p for Parse, d for default (Parse and send)')
  .demandOption(['f', 's', 'i', 'e', 'bcc'])
  .help('h')
  .argv;


let file = argv.f;
let subject = argv.s;
let issue_text = argv.i;
let editors = argv.e;
let to = argv.to;
let bcc = argv.bcc;
let action = argv.action || 'd'

if (action === 'd') {
  parse(file, subject, issue_text, editors)
    .then(html => {
      send(to, bcc,subject, html)
    })
}

if (action === 's') {
  let html = require('fs').readFileSync(path.resolve(__dirname, './email.html'))
  send(to, bcc,subject, html)
}


if (action === 'p') {
  parse(file, subject, issue_text, editors)
}
