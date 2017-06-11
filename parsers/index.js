const content = require('./content.js');
const templates = require('./templates.js');

module.exports = {
  prepareFiles: content.prepareFiles,
  handleFile: content.handleFile,
  loadTemplate: templates.loadTemplate,
};
