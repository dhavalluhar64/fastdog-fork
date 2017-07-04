// Node dependencies.
const yaml = require('yamljs');

// Fastdog dependencies.
const parsers = require('./parsers');

// Load config file using YAML.load.
const siteConfig = yaml.load('scaffold/config.yaml');

// Content storage
const content = [];

// Nothing about this seems like good style.
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
        console.log(fullResponse);
      });
    });
  });
}

parsers.prepareFiles('scaffold/content', (files) => {
  let counter = 0;

  files.forEach((file) => {
    content.push(parsers.handleFile(file));
    counter += 1;
    if (counter >= files.length) {
      contentPrepComplete();
    }
  });
});
