#!/usr/bin/env node

// Node dependencies.
const yaml = require('yamljs');
const program = require('commander');
const path = require('path');
const pkg = require('./package.json');

// Prepare command line arguments.
program.version(`Fastdog yawn ${pkg.version}`)
  .option('-s, --source <path>', 'Path to the project directory.', String)
  .parse(process.argv);

// Fastdog dependencies.
const parsers = require('./src/parsers');

if (typeof program.source === 'undefined') {
  console.error('Project source path required.');
  process.exit(1);
}

// Prepare config and merge with command line args.
const configPath = path.join(program.source, 'config.yaml');
const siteConfig = yaml.load(configPath);
siteConfig.source = program.source;
siteConfig.contentBasePath = path.join(siteConfig.source, siteConfig.contentPath);

if (!path.isAbsolute(siteConfig.outputPath)) {
  // Recalculate the path based on the local of the source.
  siteConfig.outputPath = path.join(siteConfig.source, siteConfig.outputPath);
}

console.log(siteConfig);

// Kick off the main worker function.
parsers.processFiles(siteConfig);
