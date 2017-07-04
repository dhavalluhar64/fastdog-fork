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

// Nothing about this seems like good style.
function writeFile(filePath, content) {
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log(`${filePath} file was saved!`);
    return true;
  });
}

// This also seems to be bad style.
function contentPrepComplete() {
  // Loop through our chapter urls
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
        const outputFile = path.join(siteConfig.outputPath, file.fullName);
        const outputDir = path.dirname(outputFile);

        // Ensure the directory exists.
        // Hattip: https://stackoverflow.com/a/41970204/24215
        outputDir
          .split(path.sep)
          .reduce((currentPath, folder) => {
            let current = currentPath;
            current += folder + path.sep;
            if (!fs.existsSync(current)) {
              fs.mkdirSync(current);
            }
            return current;
          }, '');

        if (!fs.existsSync(outputDir)) {
          fs.mkdir(outputDir, (err) => {
            if (err) {
              console.error('Unable to create directory files.');
              console.log(err);
            } else {
              writeFile(outputFile, fullResponse);
            }
          });
        } else {
          writeFile(outputFile, fullResponse);
        }
      });
    });
  });
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
