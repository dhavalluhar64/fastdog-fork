// Node dependencies.
const yaml = require('yamljs');

// Fastdog dependencies.
const parsers = require('./parsers');

// Load config file using YAML.load.
const siteConfig = yaml.load('scaffold/config.yaml');

// Content storage
const content = [];

// Nothing about this seems like good style.
function complete() {
  console.log(content);
}

parsers.prepareFiles('scaffold/content', function (files) {
  console.log(siteConfig);
  let counter = 0;

  files.forEach(function (file) {
    content.push(parsers.handleFile(file));
    counter += 1;
    if (counter >= files.length) {
      complete();
    }
  });
  console.log(files);
});
