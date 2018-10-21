const fileHandlers = require('../fileHandlers');
const nunjucks = require('nunjucks');

function loadDefaults(name) {
  const defaults = {
    attributes: [],
  };

  switch (name) {
    case 'page-top':
      defaults.header = '';
      break;
    case 'page-bottom':
      defaults.footer = '';
      defaults.copyright = '';
      break;
    case 'page':
      defaults.title = '';
      defaults.content = '';
      defaults.sidebar = '';
      break;
    case 'index':
      defaults.title = '';
      defaults.content = '';
      defaults.sidebar = '';
      defaults.map = '';
      defaults.tags = '';
      break;
    case 'map':
      defaults.map = [
        {
          title: '',
          path: '',
        },
      ];
      break;
    case 'html':
    default:
      defaults.html_attributes = '';
      defaults.head_tags = '';
      defaults.head_title = '';
      defaults.page_top = '';
      defaults.page_top.header = '';
      defaults.page_bottom = '';
      defaults.page_bottom.footer = '';
      defaults.page_bottom.copyright = '';
      defaults.page = '';
      defaults.page.title = '';
      defaults.page.content = '';
      defaults.page.sidebar = '';
  }

  return defaults;
}

// Prepare the meta tags for the page.
// TODO: Add support for description.
// TODO: Add support for OpenGraph.
// TODO: Add support for TwitterCard.
// TODO: Add support for RDF.
function prepareMetaData(tags = {}) {
  const headers = [
    {
      type: 'meta',
      name: 'generator',
      value: 'Fastdog static site creator',
    },
  ];

  const groups = Object.keys(tags);
  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    headers.push({
      type: 'meta',
      name: 'keywords',
      value: Object.keys(tags[group]).join(' '),
    });
  }

  return headers;
}

/**
 * Where loadTemplate handles the details of loading one template (via promises)
 * processTemplate loads a sequence of templates and ensures they are handled
 * in the right order.
 *
 * This craziness used to be in main.js which was terrible, then in content.js
 * which was bad. This is the right place to hide it, but it's so terribly
 * written that I'd like to find a cleaner way to handled the nested promises.
 *
 * TODO: Refactor to get rid or this terrible hard coded sequence of nested promises.
 */
exports.processTemplate = function processTemplate(file, siteIndex, siteConfig) {
  // Index pages are special cased to allow site maps and sectional nav.
  if (file.localName.endsWith('/index.html')) {
    exports.loadTemplate(
      'map',
      { map: siteIndex.map },
      siteConfig,
    ).then(response =>
      exports.loadTemplate(
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
      exports.loadTemplate(
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
    exports.loadTemplate(
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
      const headerTags = prepareMetaData(file.tags);
      // TODO: Add support for all front matter in sample pages.
      exports.loadTemplate(
        'html',
        {
          page: response,
          head_title: file.title,
          head_tags: headerTags,
        },
        siteConfig,
      ).then((fullResponse) => {
        fileHandlers.outputFile(siteConfig, file, fullResponse);
      })
      .catch((rejection) => {
        // TODO: Something better should be done when things go wrong.
        console.log(rejection);
      });
    })
    .catch((rejection) => {
      // TODO: Something better should be done when things go wrong.
      console.log(rejection);
    });
  }
};

exports.loadTemplate = function loadTemplate(name, inputs, siteConfig) {
  return new Promise((resolve, reject) => {
    const path = `${siteConfig.source}/templates/`;
    const file = `${name}.html.njk`;
    const variables = {};

    // TODO: Determine why UTF-8 encoded characters get mangled.
    Object.assign(variables, loadDefaults(name), inputs);
    nunjucks.configure(path, { autoescape: false });
    nunjucks.render(file, variables, (err, html) => {
      if (!err) {
        resolve(html);
      } else {
        reject(err);
      }
    });
  });
};
