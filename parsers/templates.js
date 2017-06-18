const twig = require('twig');

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
    case 'html':
    default:
      defaults.html_attributes = [];
      defaults.head_tags = [];
      defaults.head_title = [];
      defaults.page_top = {};
      defaults.page_top.header = '';
      defaults.page_bottom = {};
      defaults.page_bottom.footer = '';
      defaults.page_bottom.copyright = '';
      defaults.page = {};
      defaults.page.title = '';
      defaults.page.content = '';
      defaults.page.sidebar = '';
  }

  return defaults;
}

exports.loadTemplate = function loadTemplate(name, inputs) {
  const variables = {};
  Object.assign(variables, loadDefaults(name), inputs);

  twig.renderFile('./scaffold/templates/html.html.twig', variables, (err, html) => {
    console.log(html);
  });
};
