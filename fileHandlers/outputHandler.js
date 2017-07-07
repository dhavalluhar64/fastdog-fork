const fs = require('fs');
const path = require('path');

// Nothing about this seems like good style.
function writeFile(filePath, text) {
  fs.writeFile(filePath, text, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log(`${filePath} generated.`);
    return true;
  });
}

exports.writeFiles = function writeFiles(siteConfig, file, fileContent) {
  let outputFile = file.fullName.slice(siteConfig.contentBasePath.length, -2);
  outputFile = path.join(siteConfig.outputPath, outputFile).concat('html');
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
        writeFile(outputFile, fileContent);
      }
    });
  } else {
    writeFile(outputFile, fileContent);
  }
}
