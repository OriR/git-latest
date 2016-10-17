const latestBranches = require('../utils/latestBranches');
const git = require('../utils/git');

module.exports = {
  handler() {
    latestBranches()
      .then(latestBranches.verify)
      .then((branches) => git.checkout(branches[0]))
      .catch((error) => console.log(error.message));
  },
  command: 'switch',
  desc: 'Switches to the last branch you worked on.',
  builder: {}
};
