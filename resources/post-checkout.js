;(() => {
  const fs = require('fs');
  const spawn = require('child_process').spawn;
  const os = require('os');


  const previousHEAD = process.argv[2];
  const nextHEAD = process.argv[3];
  const isChangeBranch = process.argv[4];
  const latestFile = '.git/.latest';

  // Early exit. We're not interested in checkouts that are not changing branches.
  if(isChangeBranch !== '1'){
    return;
  }

  const callGit = (gitArgs) => {
    return new Promise((resolve, reject) => {

      const gitProcess = spawn('git', gitArgs);
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

  const branches = Promise.all(
    [
      callGit(['for-each-ref', '--sort=committerdate', '--format="%(refname:short)"', '--points-at', previousHEAD]),
      callGit(['for-each-ref', '--sort=-committerdate', '--format="%(refname:short)"', '--points-at', nextHEAD])
    ]
  );

  branches.then(([allPrevious, allNext]) => {
    const localBranchName = (branch) => branch.replace(/"/g, '').replace('origin/', '');

    const isNotHEAD = (branch) => branch !== 'HEAD';

    const duplicates = (noDuplicates, item) => {
      if (!noDuplicates.includes(item)) {
        noDuplicates.push(item);
      }
      return noDuplicates;
    };


    const normalizeBranches = (branches) => {
      // This makes sure we ignore remotes
      // (they can have the same sha1 as the checked out branch and interfere with the logic).
      // Also, ignoring HEAD since it has no meaning for us.
      return branches.split(os.EOL).map(localBranchName).filter(isNotHEAD).reduce(duplicates, []);
    };

    // Taking the latest changed previous head and the oldest new head.
    const next = normalizeBranches(allNext)[0];
    const previous = normalizeBranches(allPrevious)[0];

    // If the branches are different it means the user checked out a different branch than the current one.
    if (next !== previous) {
      fs.readFile(latestFile, 'utf-8', (error, branches) => {

        // In case we can't get the file - something bad happened.
        // We assume there's no file and we'll create it at the end of this function with the latest branch.
        if (error) {
          branches = '';
        }

        const lines = branches.length === 0 ? [] : branches.split(os.EOL);
        const foundIndex = lines.indexOf(previous);

        if (foundIndex >= 0) {
          lines.splice(foundIndex, 1);
        }

        lines.unshift(previous);

        fs.writeFile(latestFile, lines.join(os.EOL));
      });
    }
  });
})();
