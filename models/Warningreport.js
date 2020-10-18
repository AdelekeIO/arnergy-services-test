const Sequelize = require("sequelize");
const db = require("../config/db");

const User = db.define(
  "warningreport",
  {
    id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    deviceid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fault: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    starttime: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    endtime: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    severity: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "warningreport",
    schema: "public",
    // createdAt: "createdat",
    // updatedAt: "updatedat",
  }
);

module.exports = User;
