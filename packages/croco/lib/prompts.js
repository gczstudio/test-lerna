/** @format */

const proPrompt = {
  name: {
    type: 'string',
    required: true,
    message: 'Project Name'
  },
  description: {
    type: 'string',
    required: false,
    message: 'Project Description',
    default: 'A Niubility Project'
  },
  author: {
    type: 'string',
    message: 'Author Name',
    default: 'Admin'
  },
  spa: {
    type: 'confirm',
    message: 'Use SPA Mode in Your Project?'
  },
  framework: {
    when: 'false',
    type: 'string',
    message: 'Framework',
    default: 'fly'
  },
  library: {
    when: 'framework === "vue"',
    type: 'list',
    message: 'Pick An UI Component Library',
    choices: [
      {
        name: 'Element UI',
        value: 'element'
      },
      {
        name: 'iView',
        value: 'iview'
      }
    ]
  },
  vuex: {
    when: 'framework === "vue"',
    type: 'confirm',
    message: 'Install vuex?'
  },
  build: {
    type: 'confirm',
    message: 'Generate Build Config In Your Project?'
  },
  autoInstall: {
    type: 'list',
    message:
      'Should run `npm install` for you after the project has been created?',
    choices: [
      {
        name: 'Yes, use NPM',
        value: 'npm',
        short: 'npm'
      },
      {
        name: 'Yes, use Yarn',
        value: 'yarn',
        short: 'yarn'
      },
      {
        name: 'No, I will handle that myself',
        value: false,
        short: 'no'
      }
    ]
  }
};

const compPrompt = {
  name: {
    type: 'string',
    required: true,
    message: 'Component Name'
  },
  space: {
    type: 'list',
    message: 'Component NameSpace',
    choices: [
      {
        name: 'edu',
        value: 'edu'
      },
      {
        name: 'stc',
        value: 'stc'
      }
    ]
  },
  ctype: {
    type: 'list',
    message: 'Component Type',
    choices: [
      {
        name: 'UI Component',
        value: 'ui'
      },
      {
        name: 'Business Component',
        value: 'app'
      }
    ]
  },
  description: {
    type: 'string',
    required: false,
    message: 'Component Description',
    default: 'A Niubility Component'
  },
  author: {
    type: 'string',
    message: 'Author Name',
    default: 'Admin'
  },
  autoInstall: {
    type: 'list',
    message:
      'Should run `npm install` for you after the project has been created?',
    choices: [
      {
        name: 'Yes, use NPM',
        value: 'npm',
        short: 'npm'
      },
      {
        name: 'Yes, use Yarn',
        value: 'yarn',
        short: 'yarn'
      },
      {
        name: 'No, I will handle that myself',
        value: false,
        short: 'no'
      }
    ]
  }
};

exports.proPrompt = proPrompt;
exports.compPrompt = compPrompt;
