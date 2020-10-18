const Sequelize = require("sequelize");
const db = require("../config/db");

const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    roletype: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false
    },

    dateofbirth: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phonenumber: {
      type: Sequelize.STRING,
      allowNull: false
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: false
    },
    wallet: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdat: {
      type: Sequelize.STRING,
      allowNull: false
    },
    updatedat: {
      type: Sequelize.STRING,
      allowNull: false
    },
    realm: {
      type: Sequelize.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    emailverified: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    verificationtoken: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    tableName: "user",
    schema: "public",
    createdAt: "createdat",
    updatedAt: "updatedat"
  }
);

module.exports = User;
