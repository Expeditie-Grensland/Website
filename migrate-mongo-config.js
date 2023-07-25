export default {
  mongodb: {
    url: process.env.EG_MONGO_URL,

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  migrationsDir: "migrations",
  changelogCollectionName: "changelog",

  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: "esm",
};
