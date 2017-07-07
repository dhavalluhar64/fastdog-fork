const output = require('./outputHandler.js');
const copy = require('./copyHandler.js');

module.exports = {
  outputFile: output.writeFiles,
  copyHandler: copy.copyFiles,
};
