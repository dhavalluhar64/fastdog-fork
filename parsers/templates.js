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

exports.loadTemplate = function loadTemplate(name, inputs, siteConfig) {
  return new Promise((resolve, reject) => {
    const path = siteConfig.source + "/templates/";
    const file = `${name}.html.njk`;
    const variables = {};

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
