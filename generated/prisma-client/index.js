"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "File",
    embedded: false
  },
  {
    name: "Company",
    embedded: false
  },
  {
    name: "Invoice",
    embedded: false
  },
  {
    name: "Job",
    embedded: false
  },
  {
    name: "JOB_TYPE",
    embedded: false
  },
  {
    name: "STATUS_TYPE",
    embedded: false
  },
  {
    name: "ROLE_TYPE",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://eu1.prisma.sh/gjergj-kadriu-c6f550/joboard/dev`
});
exports.prisma = new exports.Prisma();
