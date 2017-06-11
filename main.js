// Node dependencies.
const yaml = require('yamljs');

// Fastdog dependencies.
const parsers = require('./parsers');

// Load config file using YAML.load.
const siteConfig = yaml.load('scaffold/config.yaml');

let content = parsers.prepareFiles('scaffold/content', function (files) {
  console.log(siteConfig);
  console.log(files);
});
