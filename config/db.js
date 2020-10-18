const Sequelize = require("sequelize");

module.exports = new Sequelize(
  "solarbase",
  "solaRbas3",
  "ReD8GGwG5tLmK3DfxW7WSyUG2ZxYvJDp",

  {
    dialect: "postgres",
    host: "solarbase.czwfrshabs2k.us-west-2.rds.amazonaws.com",

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
    // logging: console.log, // Default, displays the first parameter of the log function call
    // logging: (...msg) => console.log(msg), // Displays all log function call parameters
    // logging: false // Disables logging
    // logging: msg => logger.debug(msg), // Use custom logger (e.g. Winston or Bunyan), displays the first parameter
    // logging: logger.debug.bind(logger) // Alternative way to use custom logger, displays all messages
  }
);

// const Users = Conn.define("user", {
//   firstname: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   lastname: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   email: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     validate: { isEmail: true }
//   }
// });

// const Installations = Conn.define("installation", {
//   name: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   status: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   solarkitids: {
//     type: Sequelize.STRING,
//     allowNull: false
//   }
// });
