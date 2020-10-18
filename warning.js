const Conn = require("./config/db");
const User = require("./models/User");
const Warningreport = require("./models/Warningreport");

// Connection
Conn.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
// User.findAll();

const getNames = async () => {
  let data = await User.findAll();
  console.log({ User: JSON.stringify(data) });
};

const updateWarning = async () => {
  YourModel.findAll({
    where: {
      //your where conditions, or without them if you need ANY entry
    },
  }).then(function (entries) {
    //only difference is that you get users list limited to 1
    //entries[0]
  });
};
getNames();
