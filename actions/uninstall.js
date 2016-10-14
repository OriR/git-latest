const constants = require('../utils/constants');
const promisify = require('../utils/promisify');
const fs = promisify(require('fs'));
const os = require('os');

module.exports = {
  handler() {
    fs.readFile(constants.postCheckoutPath, 'utf-8').then((postCheckout) => {
      const beginningMessageIndex = postCheckout.indexOf(constants.beginningInstallMessage);

      // Make sure the hook was installed
      if(beginningMessageIndex > -1) {
        const endingMessageIndex = postCheckout.indexOf(constants.endingInstallMessage);
        const beforeHook = postCheckout.substring(0, beginningMessageIndex);
        const afterHook = postCheckout.substring(endingMessageIndex + constants.endingInstallMessage.length);
        const newPostCheckout = beforeHook + afterHook;
        const compact = (newArray, item)=> item ? newArray.concat([item]) : newArray;

        // If there is only one line of code remaining it means that's just the shebang line.
        // In this case we can safely remove this file.
        const uninstallPromise = (newPostCheckout.split(os.EOL).reduce(compact,[]).length === 1) ?
          fs.unlink(constants.postCheckoutPath) :
          fs.writeFile(constants.postCheckoutPath, newPostCheckout, {mode: 0o777});

        uninstallPromise.then(() => console.log(constants.messages.successfulUninstall));
      }
      else {
        console.log(constants.messages.alreadyUninstalled);
      }
    })
  },
  command: 'uninstall',
  desc: 'Uninstalls the git-latest post-checkout git hook.',
  builder: {}
};
