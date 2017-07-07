#!/usr/bin/env node

// Node dependencies.
const yaml = require('yamljs');
const fs = require('fs');
const program = require('commander');
const path = require('path');
const pkg = require('./package.json');

// Prepare command line arguments.
program.version(`Fastdog yawn ${pkg.version}`)
  .option('-s, --source <path>', 'Path to the project directory.', String)
  .parse(process.argv);

// Fastdog dependencies.
const parsers = require('./parsers');
const fileHandlers = require('./fileHandlers');

if (typeof program.source === 'undefined') {
  console.error('Project source path required.');
  process.exit(1);
}

// Prepare config and merge with command line args.
const configPath = path.join(program.source, 'config.yaml');
const siteConfig = yaml.load(configPath);
siteConfig.source = program.source;
siteConfig.contentBasePath = path.join(siteConfig.source, siteConfig.contentPath);

console.log(siteConfig);

// Content storage
const content = [];

// This also seems to be bad style.
function contentPrepComplete() {
  // Loop through our pages.
  content.forEach((file) => {
    parsers.loadTemplate('page', {
      page: {
        content: file.html,
        sidebar: '',
        title: file.title,
      },
    }).then((response) => {
      parsers.loadTemplate('html', {
        page: response,
      }).then((fullResponse) => {
        fileHandlers.outputFile(siteConfig, file, fullResponse);
      });
    });
  });

  // Copy supporting files.
  fileHandlers.copyHandler(siteConfig);
}

parsers.prepareFiles(siteConfig.contentBasePath, (files) => {
  let counter = 0;

  files.forEach((file) => {
    content.push(parsers.handleFile(file));
    counter += 1;
    if (counter >= files.length) {
      contentPrepComplete();
    }
  });
});
