// Required modules
const fs = require('fs');
const yamlFront = require('yaml-front-matter');
const marked = require('marked');
const merge = require('deepmerge');
const fileHandlers = require('../fileHandlers');
const templates = require('./templates.js');

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

function handleFile(preparedFile) {
  const newFile = preparedFile;
  const content = preparedFile.pageContent;

  newFile.tokens = marked.lexer(content);
  newFile.html = marked.parser(newFile.tokens);
  return newFile;
}

// Nested promisses seems like terrible style. There must be a better way.
// TODO: refactor this into something saner.
// TODO: Ensure all promises catch rejections.
function finishContent(siteIndex, siteConfig) {
  // Loop through our pages.
  siteIndex.content.forEach((file) => {
    // Index pages are special cased to allow site maps and sectional nav.
    if (file.localName.endsWith('/index.html')) {
      templates.loadTemplate(
        'map',
        { map: siteIndex.map },
        siteConfig,
      ).then(response =>
        templates.loadTemplate(
          'index',
          {
            page: {
              content: file.html,
              sidebar: '',
              title: file.title,
              map: response,
              tags: siteIndex.tags,
            },
          },
          siteConfig,
        ),
      ).then(response =>
        templates.loadTemplate(
          'html',
          { page: response },
          siteConfig,
        ),
      ).then((fullResponse) => {
        fileHandlers.outputFile(siteConfig, file, fullResponse);
      })
      .catch((rejection) => {
        // TODO: Something better should be done when things go wrong.
        console.log(rejection);
      });
    } else {
      // All other pages go on through (at least for now).
      templates.loadTemplate(
        'page',
        {
          page: {
            content: file.html,
            sidebar: '',
            title: file.title,
          },
        },
        siteConfig,
      ).then((response) => {
        // TODO: Add metatag support (head_tags)
        // TODO: Add support for all front matter in sample pages.
        templates.loadTemplate(
          'html',
          {
            page: response,
            head_title: file.title,
          },
          siteConfig,
        ).then((fullResponse) => {
          fileHandlers.outputFile(siteConfig, file, fullResponse);
        });
      });
    }
  });

  // Copy supporting files.
  fileHandlers.copyHandler(siteConfig);
}

function buildSiteIndex(files, siteConfig) {
  // An organized index of the site.
  const siteIndex = {
    content: [],
    tags: {},
    map: {},
  };

  let counter = 0;

  files.forEach((file) => {
    const processedFile = handleFile(file);

    // Add new page to main content list:
    siteIndex.content.push(processedFile);

    // Maintain list of tags:
    if (processedFile.tags) {
      siteIndex.tags = merge(siteIndex.tags, processedFile.tags);
    }

    // Add to site map. If we haven't added this section yet, create a new Index
    // entry to track it.
    if (!Object.prototype.hasOwnProperty.call(siteIndex.map, processedFile.localPath)) {
      siteIndex.map[processedFile.localPath] = {
        hasSub: true,
        title: processedFile.title,
        path: processedFile.localPath,
        map: {},
      };
    }
    // If this is an index update the parent.
    if (processedFile.localName.endsWith('index.html')) {
      siteIndex.map[processedFile.localPath].title = processedFile.title;
    } else {
      // Otherwise add file to proper subsection.
      siteIndex.map[processedFile.localPath].map[processedFile.localName] = {
        hasSub: false,
        title: processedFile.title,
        path: processedFile.localName,
      };
    }
    // Check if we have completed all prep work and move on when last file is
    // ready.
    counter += 1;
    if (counter >= files.length) {
      finishContent(siteIndex, siteConfig);
    }
  });
}

exports.processFiles = function processFiles(siteConfig) {
  const directory = siteConfig.contentBasePath;
  const pages = [];
  const realDirectory = fs.realpathSync(directory);
  const files = directoryWalk(realDirectory);
  let counter = 0;

  files.forEach((file) => {
    const splitFile = yamlFront.loadFront(file, 'pageContent');

    // Add file specific meta data.
    splitFile.fullName = file;
    splitFile.localName = splitFile.fullName.slice(realDirectory.length, -2).concat('html');
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
      buildSiteIndex(pages, siteConfig);
    }
  });
};
