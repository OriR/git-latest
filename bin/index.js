#!/usr/bin/env node

const argv = require('yargs').commandDir('../actions').demand(1).strict().completion().help().argv;
