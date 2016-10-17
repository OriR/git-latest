const promisify = require('./promisify');
const fs = promisify(require('fs'));
const os = require('os');
const constants = require('../utils/constants');


module.exports = () => {
  return fs.readFile(constants.latestPath, 'utf-8')
    .then((branches) => branches.split(os.EOL).filter((branch) => branch.length !== 0));
};

module.exports.verify = (branches) => {
  if(branches.length === 0){
    throw new Error(constants.messages.noLatestBranches);
  }

  return branches;
};
