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
      defaults.page_top = '';
      defaults.page_bottom = '';
      defaults.page = '';
      // defaults.elements.page_bottom = loadDefaults('page-bottom');
      // defaults.elements.page_top = loadDefaults('page-top');
      // defaults.elements.page = loadDefaults('page');
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
