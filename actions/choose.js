const inquirer = require('inquirer');
const latestBranches = require('../utils/latestBranches');
const git = require('../utils/git');

module.exports = {
  handler() {
    latestBranches()
      .then(latestBranches.verify)
      .then((branches) => inquirer.prompt({
        type: 'list',
        name: 'branch',
        message: 'Select the branch to checkout:',
        choices: branches
      }))
      .then((answer) => git.checkout(answer.branch))
      .catch((error) => console.log(error.message));
  },
  command: 'choose',
  desc: 'Choose one of the latest branches to checkout.',
  builder: {}
};

