#!  /usr/bin/env node

"use strict";
const utl = require("util");
const path = require("path");
const fs = require("fs");
const getStdin = require("get-stdin");
const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"],
});

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  getStdin().then(processFile).catch(error);
} else if (args.file) {
  fs.readFile(path.join(BASE_PATH, args.file), "utf-8", (err, contents) => {
    if (err) {
      error(err.toString);
    } else {
      processFile(contents);
    }
  });
} else {
  error("Incorrect usage", true);
}

function printHelp() {
  console.log("ex1 useage:");
  console.log("ex1. js --file={FILENAME}");
  console.log("");
  console.log("--help             print this help");
  console.log("--in, -            process stdin");
  console.log("--file             process this file");
  console.log("");
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

function processFile(contents) {
  contents = contents.toUpperCase();
  process.stdout.write(contents);
}
