const Sequelize = require("sequelize");
const db = require("../config/db");

const Warningreport = db.define(
  "warningreport",
  {
    id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fault: {
      type: Sequelize.STRING,
      allowNull: false,
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

    timestamps: false,
  }
);

module.exports = Warningreport;
