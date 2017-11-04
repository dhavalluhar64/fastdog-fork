// Required modules
const fs = require('fs');
const yamlFront = require('yaml-front-matter');
const marked = require('marked');

// Recursive function to walk a directory and return a list of all files with
// complete path. Ignores dot files.
function directoryWalk(directory) {
  const dirList = fs.readdirSync(directory);
  let files = [];
  for (let i = 0; i < dirList.length; i += 1) {
    if (!dirList[i].startsWith('.')) {
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
  }
  return files;
}

exports.prepareFiles = function prepareFiles(directory, callback) {
  const pages = [];
  const realDirectory = fs.realpathSync(directory);
  const files = directoryWalk(realDirectory);
  let counter = 0;

  files.forEach((file) => {
    const splitFile = yamlFront.loadFront(file, 'pageContent');

    // Add file specific meta data.
    splitFile.fullName = file;
    splitFile.localName = splitFile.fullName.slice(directory.length, -2).concat('html');
    splitFile.localPath = splitFile.localName.split('/').slice(0, -1).join('/');

    // Add a reference to this page to the tags for index support later.
    if (splitFile.tags) {
      Object.keys(splitFile.tags).forEach((tag) => {
        Object.keys(splitFile.tags[tag]).forEach((subtag) => {
          if (splitFile.tags[tag][subtag]) {
            splitFile.tags[tag][subtag].push(splitFile.localName);
          } else {
            splitFile.tags[tag][subtag] = [splitFile.localName];
          }
        });
      });
    }

    // Add to list and check if we're done.
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
