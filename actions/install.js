const promisify = require('../utils/promisify');
const fs = promisify(require('fs'));
const os = require('os');
const constants = require('../utils/constants');

const handler = {
  verifyInsideGitDirectory() {
    return fs.access(constants.gitPath, fs.constants.W_OK)
      .catch(() => {
        throw new Error(constants.messages.notAGitDirectory);
      });
  },
  getCurrentPostCheckoutHook(argv) {
    return argv.force ?
      Promise.resolve(null) :
      fs.readFile(constants.postCheckoutPath, 'utf-8').catch(() => null);
  },
  verifyCurrentPostCheckoutIsNode(postCheckout) {
    if (postCheckout && !postCheckout.includes(constants.nodeShebang)) {
      throw new Error(constants.messages.existingNonNodeScript);
    }

    return postCheckout;
  },
  verifyNotInstalledGitLatest(postCheckout) {
    if(postCheckout && postCheckout.includes(constants.beginningInstallMessage)){
      throw new Error(constants.messages.alreadyInstalled);
    }

    return postCheckout;
  },
  createHookWriteHandler(postCheckout) {
    return {
      writeAction: postCheckout ? 'appendFile' : 'writeFile',
      setGitLatestPostCheckout(gitLatestPostCheckout) {
        this.gitLatestPostCheckout = gitLatestPostCheckout;
        return this;
      },
      transform() {
        const lines = this.gitLatestPostCheckout.split(os.EOL);
        lines.unshift(constants.beginningInstallMessage);
        lines.push(constants.endingInstallMessage);

        if (!postCheckout) {
          lines.unshift(constants.nodeShebang);
        }

        return lines.join(os.EOL);
      }
    };
  },
  setGitLatestPostCheckoutHook(writeHandler) {
    return fs.readFile(constants.postCheckoutResource, 'utf-8')
      .then(writeHandler.setGitLatestPostCheckout.bind(writeHandler));
  },
  writeGitLatestPostCheckoutHook(writeHandler) {
    return fs[writeHandler.writeAction](constants.postCheckoutPath, writeHandler.transform(), { mode: 0o777 });
  },
  clearLatestBranchesFile() {
     return fs.writeFile(constants.latestPath, '');
  },
  handler(argv) {
    this.verifyInsideGitDirectory()
    .then(this.getCurrentPostCheckoutHook.bind(this, argv))
    .then(this.verifyCurrentPostCheckoutIsNode.bind(this))
    .then(this.verifyNotInstalledGitLatest.bind(this))
    .then(this.createHookWriteHandler.bind(this))
    .then(this.setGitLatestPostCheckoutHook.bind(this))
    .then(this.writeGitLatestPostCheckoutHook.bind(this))
    .then(this.clearLatestBranchesFile.bind(this))
    .then(() => console.log(constants.messages.successfulInstall))
    .catch((error) => console.log(error.message));
  },
  command: 'install [force]',
  desc: 'Installs a post-checkout git hook.',
  builder: {
    force: {
      alias: 'f',
      describe: `Overwrites the post-checkout hook for the current repository.`,
      type: 'boolean'
    }
  }
};

// Fixing `this`
handler.handler = handler.handler.bind(handler);

module.exports = handler;
