const inquirer = require('inquirer');
const latestBranches = require('../utils/latestBranches');
const git = require('../utils/git');

module.exports = {
  handler() {
    latestBranches().then((branches) => {
      return inquirer.prompt({
        type: 'list',
        name: 'branch',
        message: 'Select the branch to checkout:',
        choices: branches
      });
    }).then((answer) => {
      return git.checkout(answer.branch);
    });
  },
  command: 'choose',
  desc: 'Choose one of the latest branches to checkout.',
  builder: {}
};

