// Required modules
const fs = require('fs');
const yamlFront = require('yaml-front-matter');
const marked = require('marked');

// Recursive function to walk a directory and return a list of all files with
// complete path.
function directoryWalk(directory) {
  const dirList = fs.readdirSync(directory);
  let files = [];
  for (let i = 0; i < dirList.length; i += 1) {
    const path = [directory, dirList[i]].join('/');
    if (fs.existsSync(path)) {
      const f = fs.lstatSync(path);
      if (f.isFile()) {
        files.push(path);
      } else {
        files = files.concat(directoryWalk(path));
      }
    }
  }
  return files;
}

exports.prepareFiles = function prepareFiles(directory, callback) {
  const pages = [];
  const files = directoryWalk(directory);
  let counter = 0;

  files.forEach((file) => {
    const splitFile = yamlFront.loadFront(file, 'pageContent');
    splitFile.siteRoot = directory;
    splitFile.fullName = file;
    pages.push(splitFile);
    counter += 1;
    if (counter >= files.length) {
      callback(pages);
    }
  });
};

exports.handleFile = function handleFile(preparedFile) {
  const newFile = preparedFile;
  const content = preparedFile.pageContent;

  newFile.tokens = marked.lexer(content);
  newFile.html = marked.parser(newFile.tokens);
  return newFile;
};
