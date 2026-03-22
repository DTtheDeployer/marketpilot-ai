// Allow Prisma build scripts
module.exports = {
  hooks: {
    readPackage(pkg) {
      return pkg;
    },
  },
};
