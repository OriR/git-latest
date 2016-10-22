# git-latest
Manage your latest branches with ease.

## Setup

```
npm i -g git-latest
cd ~/my-project
git-latest install
```

## Usage

Doing a PR, you want to locally review a branch, then get back to your working branch?
```
git checkout branch-to-review

// Check that the work is ok.

git-latest switch
```

Remembered something you want to add to a PR you recently reviewed?

`git-latest choose // There will be a list of latest branches, ordered by checkout date.`

Too many branches to choose from and you can't even remember any of them except the first 4?

`git-latest clear --keep=4`

Too much clutter? want to start a fresh new latest branches list?

`git-latest clear --all`

Don't want to use `git-latest` anymore? :cry:

`git-latest uninstall`
