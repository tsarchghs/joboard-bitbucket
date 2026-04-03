const browserGlobal = globalThis;

if (typeof browserGlobal.global === "undefined") {
  browserGlobal.global = browserGlobal;
}

if (typeof browserGlobal.process === "undefined") {
  browserGlobal.process = { env: {} };
} else if (typeof browserGlobal.process.env === "undefined") {
  browserGlobal.process.env = {};
}
