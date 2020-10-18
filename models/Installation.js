const Sequelize = require("sequelize");
const db = require("../config/db");

const User = db.define(
  "installation",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false
    },
    solarkitids: {
      type: Sequelize.STRING,
      allowNull: false
    },
    from: {
      type: Sequelize.TIME,
      allowNull: false
    },

    to: {
      type: Sequelize.TIME,
      allowNull: false
    },
    createdat: {
      type: Sequelize.TIME,
      allowNull: false
    },
    updatedat: {
      type: Sequelize.TIME,
      allowNull: false
    },
    userid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    devicetypeid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    devicerequestid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },

    commissioned: {
      type: Sequelize.STRING,
      allowNull: false
    },
    maintenance: {
      type: Sequelize.STRING,
      allowNull: false
    },
    warranty: {
      type: Sequelize.STRING,
      allowNull: false
    },
    cid: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    assignedto: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // approvedto: {
    //   type: Sequelize.STRING,
    //   allowNull: false
    // },
    approvedat: {
      type: Sequelize.STRING,
      allowNull: false
    },
    approvedbyid: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    tableName: "installation",
    schema: "public",
    createdAt: "createdat",
    updatedAt: "updatedat"
  }
);

module.exports = User;
