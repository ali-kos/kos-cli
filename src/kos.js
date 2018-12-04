#!/usr/bin/env node

const program = require('commander')

const action = require('./action');

program
  .version('1.0.0')
  .option('-T, --no-tests', 'ignore test hook')

program
  .command('init <projectName>')
  .description('kos init')
  .action(function(projectName) {
    action.init(projectName)
  });

program.parse(process.argv);