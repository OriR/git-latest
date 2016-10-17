const constants = require('../utils/constants');
const promisify = require('../utils/promisify');
const fs = promisify(require('fs'));
const os = require('os');

const handler = {
  verifyInstalled(postCheckout) {
    const beginningMessageIndex = postCheckout.indexOf(constants.beginningInstallMessage);

    if(beginningMessageIndex === -1) {
      throw new Error(constants.messages.alreadyUninstalled);
    }

    return {beginningMessageIndex, postCheckout};
  },
  uninstall({beginningMessageIndex, postCheckout}) {
    const endingMessageIndex = postCheckout.indexOf(constants.endingInstallMessage);
    const beforeHook = postCheckout.substring(0, beginningMessageIndex);
    const afterHook = postCheckout.substring(endingMessageIndex + constants.endingInstallMessage.length);
    const newPostCheckout = beforeHook + afterHook;
    const compact = (newArray, item)=> item ? newArray.concat([item]) : newArray;

    // If there is only one line of code remaining it means that's just the shebang line.
    // In this case we can safely remove this file.
    return (newPostCheckout.split(os.EOL).reduce(compact,[]).length === 1) ?
      fs.unlink(constants.postCheckoutPath) :
      fs.writeFile(constants.postCheckoutPath, newPostCheckout, { mode: 0o777 });
  },
  handler() {
    fs.readFile(constants.postCheckoutPath, 'utf-8')
      .then(this.verifyInstalled.bind(this))
      .then(this.uninstall.bind(this))
      .then(() => console.log(constants.messages.successfulUninstall))
      .catch((error) => console.log(error.message));
  },
  command: 'uninstall',
  desc: 'Uninstalls the git-latest post-checkout git hook.',
  builder: {}
};

// Fixing `this`
handler.handler = handler.handler.bind(handler);

module.exports = handler;
