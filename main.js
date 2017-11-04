#!/usr/bin/env node

// Node dependencies.
const yaml = require('yamljs');
const fs = require('fs');
const program = require('commander');
const path = require('path');
const merge = require('deepmerge');
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

if (!path.isAbsolute(siteConfig.outputPath)) {
  // Recalculate the path based on the local of the source.
  siteConfig.outputPath = path.join(siteConfig.source, siteConfig.outputPath);
}

console.log(siteConfig);

// An organized index of the site.
const siteIndex = {
  content: [],
  tags: {},
  map: {},
};

// This also seems to be bad style, and really needs to be in another file.
// TODO: refactor this into something saner.
function contentPrepComplete() {
  // Loop through our pages.
  siteIndex.content.forEach((file) => {
    // Index pages are special cased to allow site maps and sectional nav.
    if (file.localName.endsWith('/index.html')) {
      parsers.loadTemplate('map', {
        map: siteIndex.map,
      }).then(response =>
        parsers.loadTemplate('index', {
          page: {
            content: file.html,
            sidebar: '',
            title: file.title,
            map: response,
            tags: siteIndex.tags,
          },
        }),
      ).then(response =>
        parsers.loadTemplate('html', {
          page: response,
        }),
      ).then((fullResponse) => {
        fileHandlers.outputFile(siteConfig, file, fullResponse);
      });
    } else {
      // All other pages go on through (at least for now).
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
    }
  });

  // Copy supporting files.
  fileHandlers.copyHandler(siteConfig);
}

// Do the initial parse of each file and build the site index.
// Note: when this is complete the entire site will be in memory.
parsers.prepareFiles(siteConfig.contentBasePath, (files) => {
  let counter = 0;

  files.forEach((file) => {
    const processedFile = parsers.handleFile(file);

    // Add new page to main content list:
    siteIndex.content.push(processedFile);

    // Maintain list of tags:
    if (processedFile.tags) {
      siteIndex.tags = merge(siteIndex.tags, processedFile.tags);
    }

    // Add to site map:
    if (Object.prototype.hasOwnProperty.call(siteIndex.map, processedFile.localPath)) {
      siteIndex.map[processedFile.localPath].map.push({
        title: processedFile.title,
        path: processedFile.localName,
      });
    } else {
      siteIndex.map[processedFile.localPath] = {
        hasSub: true,
        title: processedFile.title,
        path: processedFile.localPath,
        map: [{
          title: processedFile.title,
          path: processedFile.localName,
        }],
      };
    }

    // Check if we have completed all prep work and move on when last file is
    // ready.
    counter += 1;
    if (counter >= files.length) {
      contentPrepComplete();
    }
  });
});
