const promisify = require('../utils/promisify');
const fs = promisify(require('fs'));
const os = require('os');
const inquirer = require('inquirer');
const constants = require('../utils/constants');
const latestBranches = require('../utils/latestBranches');

const handler = {
  getSelectedBranches(argv, branches) {
    if (argv.keep !== undefined && !isNaN(argv.keep)){
      argv.white = argv.w = false;
      return Promise.resolve({ selectedBranches: branches.slice(0, argv.keep), branches });
    }

    return inquirer.prompt({
      type: argv.multiple ? 'checkbox' : 'list',
      name: 'branch',
      message: `Select branch${argv.multiple ? 'es': ''} to ${argv.white ? 'clear' : 'keep'}:`,
      choices: branches
    }).then((answer) => {
      return {
        selectedBranches: Array.isArray(answer.branch) ? answer.branch : [answer.branch],
        branches
      };
    });
  },
  getKeptBranches(argv, {selectedBranches, branches}) {
    return !argv.white ? selectedBranches : branches.filter((item) => !selectedBranches.includes(item));
  },
  writeKeptBranches(keptBranches) {
    return fs.writeFile(constants.latestPath, keptBranches.join(os.EOL));
  },
  handler(argv) {
    if(argv.all) {
      fs.writeFile(constants.latestPath, '');
    }
    else{
      latestBranches()
      .then(latestBranches.verify)
      .then(this.getSelectedBranches.bind(this, argv))
      .then(this.getKeptBranches.bind(this, argv))
      .then(this.writeKeptBranches.bind(this))
      .catch((error) => console.log(error.message));
    }
  },
  command: 'clear [all] [white] [multiple] [keep]',
  desc: 'Clears items from the latest branches list.',
  builder: {
    white: {
      alias: 'w',
      describe: 'Clears selected item(s). Otherwise, clears the inverse.',
      type: 'boolean'
    },
    multiple: {
      alias: 'm',
      describe: `Enables selection of multiple items to clear.
                 Otherwise, displays a single select for an item to clear.`,
      type: 'boolean'
    },
    keep: {
      alias: 'k',
      describe: `Keeps the given latest number of branches, clears the rest.`,
      type: 'number'
    },
    all: {
      alias: 'a',
      describe: `Clears all the latest branches.
                 Takes precedence over all the other flags if specified.`,
      type: 'boolean'
    }
  }
};

// Fixing `this`
handler.handler = handler.handler.bind(handler);

module.exports = handler;
