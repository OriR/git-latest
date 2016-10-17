const os = require('os');

const gitPath = `${process.cwd()}/.git`;
const postCheckoutPath = `${gitPath}/hooks/post-checkout`;
const latestPath = `${gitPath}/.latest`;
const installMessage = 'git-latest post-checkout hook';
const beginningInstallMessage = `/* Start ${installMessage} */`;
const endingInstallMessage = `/* End ${installMessage} */`;
const postCheckoutResource = `${__dirname}/../resources/post-checkout.js`;
const nodeShebang = '#!/usr/bin/env node';

module.exports = {
  gitPath,
  postCheckoutPath,
  postCheckoutResource,
  latestPath,
  beginningInstallMessage,
  endingInstallMessage,
  nodeShebang,
  messages: {
    existingNonNodeScript: `Can't install git-latest because a non node post-checkout hook exists here ${os.EOL + postCheckoutPath}`,
    alreadyInstalled: `Already installed git-latest, you're good to go :)`,
    alreadyUninstalled: `You haven't installed the post-checkout hook yet, so you can't uninstall it :(`,
    notAGitDirectory: `Can't install git-latest here, this is not a git directory!`,
    successfulInstall: `git-latest installed successfully! :)`,
    successfulUninstall: `git-latest uninstalled successfully! :(`,
    noLatestBranches: `Oh no! you haven't done any checkout yet!${os.EOL}go ahead, I'm listening :)`
  }
};
