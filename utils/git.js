const spawn = require('child_process').spawn;

const callGit = (gitArgs) => {
  return new Promise((resolve, reject) => {
    const gitProcess = spawn('git', gitArgs, {
      cwd: process.cwd()
    });
    const data = [];

    gitProcess.stdout.on('data', (incoming) => {
      data.push(incoming);
    });

    gitProcess.stderr.on('error', (error) => {
      reject(error);
    });

    gitProcess.stdout.on('close', () => {
      resolve(data.join(''));
    });
  });
};

module.exports = {
  checkout(branch) {
    return callGit(['checkout', branch]).then(()=> undefined);
  }
};
