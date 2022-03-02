#!  /usr/bin/env node

"use strict";
const utl = require("util");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const CAF = require("caf");

function streamComplete(stream) {
  return new Promise((res) => {
    stream.on("end", res);
  });
}

processFile = CAF(processFile);
let tooLong = CAF.timeout(20, "Took too long");

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out"],
  string: ["file"],
});
const Transform = require("stream").Transform;

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);
let OUTFILE = path.join(BASE_PATH, "out.txt");
if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(tooLong, process.stdin).catch(error);
} else if (args.file) {
  let stream = fs.createReadStream(path.join(BASE_PATH, args.file));

  processFile(tooLong, stream)
    .then(() => console.log("Complete!"))
    .catch(error);
} else {
  error("Incorrect usage", true);
}

function printHelp() {
  console.log("ex3 useage:");
  console.log("ex3.js --file={FILENAME}");
  console.log("");
  console.log("--help             print this help");
  console.log("--in, -            process stdin");
  console.log("--file             process this file");
  console.log("--out              print to the standard out");
  console.log("--compress         gzip the output");
  console.log("--uncompress       ungzip the intput");
  console.log("");
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

function* processFile(signal, inStream) {
  let outStream = inStream;

  if (args.uncompress) {
    const gunzipStream = zlib.createGunzip();
    outStream = outStream.pipe(gunzipStream);
  }
  const upperStream = new Transform({
    transform(chunk, enc, next) {
      this.push(chunk.toString().toUpperCase());
      next();
    },
  });

  outStream = outStream.pipe(upperStream);

  if (args.compress) {
    const gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUTFILE = `${OUTFILE}.gz`;
  }

  let targetStream;

  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);

  signal.pr.catch((e) => {
    outStream.unpipe(targetStream);
    outStream.destroy();
  });

  yield streamComplete(outStream);
}
