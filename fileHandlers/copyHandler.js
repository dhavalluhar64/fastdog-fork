const fs = require('fs-extra');
const path = require('path');

exports.copyFiles = function copyFiles(siteConfig) {
  const dirList = [
    'css',
    'js',
    'images',
  ];

  dirList.forEach((dir) => {
    const fullDir = path.join(siteConfig.source, dir);
    const targetDir = path.join(siteConfig.outputPath, dir);

    // Async with promises:
    fs.copy(fullDir, targetDir)
      .then(() => console.log(`${dir} copied.`))
      .catch(err => console.error(err));
  });
};
