const content = require('./content.js');
const templates = require('./templates.js');

module.exports = {
  processFiles: content.processFiles,
  loadTemplate: templates.loadTemplate,
};
