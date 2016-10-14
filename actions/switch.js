const latestBranches = require('../utils/latestBranches');
const gitCheckout = require('../utils/git').checkout;

module.exports = {
  handler() {
    latestBranches().then((branches) => {
      return gitCheckout(branches[0]);
    });
  },
  command: 'switch',
  desc: 'Switches to the last branch you worked on.',
  builder: {}
};
