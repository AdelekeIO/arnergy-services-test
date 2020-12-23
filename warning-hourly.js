const Conn = require("./config/db");
const User = require("./models/User");
const Warningreport = require("./models/Warningreport");
const payloadDictionary = require("./payload_dictionary.json");
const moment = require("moment");

const axios = require("axios");

const IOTHTTP = axios.create({
  // baseURL: 'http://localhost:3030',
  baseURL: "https://iot-solarbase.arnergy.com",
  headers: {
    // Authorization: 'Bearer {token}'
    "Content-Type": "application/plain",
  },
});

var headers = {
  "Content-Type": "application/plain",
};
const flagsDict = {
  major: {
    InverterFault: "Inverter Fault",
    BusOver: "Bus Overload",
    BusUnder: "Bus Underload",
    BusSoftFail: "Bus Failed",
    InverterVoltageTooLow: "Inverter Voltage Too Low",
    InverterVoltageTooHigh: "Inverter Voltage Too High",
    InverterOverCurrent: "Inverter Overcurrent",
    InverterSoftFail: "Inverter failed (soft)",
    SelfTestFail: "Self test failed",
    OPDCVoltageOpen: "",
    BatteryOpen: "Battery Open",
    BatteryLowAlarm: "Battery Low",
    CurrentSensorFail: "Current Sensor failed",
  },

  minor: {
    lineFail: "Line Failed",
    LineFail: "Line Failed",
    OPVShort: "Pv Output Short Circuit",
    BatteryUnderShutdown: "Battery Under Shortdown",
    EepromFault: "EEPROM Fault",

    PVLoss: "No supply from PV",
    BatteryDerating: "Battery Derating",
    Overload: "System Overload",
  },
};

// Connection
// Conn.authenticate()
//   .then(() => {
//     console.log("Connection has been established successfully.");
//   })
//   .catch((err) => {
//     console.error("Unable to connect to the database:", err);
//   });
// User.findAll();

const getNames = async () => {
  let data = await User.findAll();
  console.log({ User: JSON.stringify(data) });
};

const transformMapData = (MapData) => {
  return Object.keys(MapData).reduce((cummData, key) => {
    // console.log("Hey");
    let oldKey = payloadDictionary.find((x) => x.new_key == key);
    if (oldKey && oldKey["old_key"] != "") {
      cummData[oldKey["old_key"]] = MapData[key];
    } else {
      cummData[key] = MapData[key];
    }
    return cummData;
  }, {});
};

const computeSeverity = async (alarm) => {
  if (flagsDict.minor[alarm]) {
    return "minor";
  } else if (flagsDict.major[alarm]) {
    return "major";
  }
};

const updateWarning = async (payload) => {
  Conn.authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
      Warningreport.findAll({
        where: {
          deviceid: payload["DeviceID"],
          status: "open",
          //your where conditions, or without them if you need ANY entry
        },
      }).then(function (currentlyOpen) {
        console.log({ warnings: JSON.stringify(currentlyOpen) });
        console.log({ warnings: JSON.stringify(currentlyOpen.length) });
        console.log(currentlyOpen.length < 1);

        try {
          if (currentlyOpen.length < 1) {
            // console.log(Object.keys(payload["payload"]));
            let errList_ = transformMapData(payload["payload"]);
            console.log("Heree");

            console.log({ errList_: JSON.stringify(errList_) });

            Object.keys(errList_).map(async (arlm) => {
              if (arlm != "InverterId") {
                let errVal = await {
                  deviceid: payload["DeviceID"],
                  fault: arlm,
                  starttime: payload["Timestamp"],
                  endtime: "string",
                  severity: await computeSeverity(arlm),
                  status: "open",
                };
                console.log(errVal, "----");

                let res = await Warningreport.create(errVal);
                console.log({ res });

                // console.log("severity undefined arlm" + JSON.stringify(arlm));
                // console.log(
                //   "severity undefined errList_" + JSON.stringify(errList_)
                // );
                // console.log("severity undefined errVal" + JSON.stringify(errVal));
              }
            });
          } else {
            console.log("hey");

            let errList_ = transformMapData(payload["payload"]);

            let errListKeys_ = Object.keys(errList_);
            console.log({ Starting: errListKeys_ });
            currentlyOpen.map(async (x) => {
              if (payload["payload"].hasOwnProperty(x.Fault)) {
                errListKeys_.splice(errListKeys_.indexOf(x.Fault), 1);
              } else {
                let _update = {
                  ...x,
                  EndTime: new Date().toISOString(),
                  Status: "resolved",
                };

                console.log({ _update });

                await Warningreport.update(_update, { where: x.id });
              }
            });
            console.log({ errListKeys_: JSON.stringify(errListKeys_) });
            errListKeys_.map(async (arlm) => {
              if (arlm != "InverterId") {
                let errVal = await {
                  DeviceID: payload["DeviceID"],
                  Fault: arlm,
                  StartTime: payload["Timestamp"],
                  EndTime: "string",
                  Severity: await computeSeverity(arlm),
                  Status: "open",
                };
                console.log(errVal, "----");
                await Warningreport.create(errVal);

                // console.log("severity undefined arlm" + JSON.stringify(arlm));
                // console.log(
                //   "severity undefined errList_" + JSON.stringify(errList_)
                // );
                // console.log("severity undefined errVal" + JSON.stringify(errVal));
              }
            });
          }
        } catch (error) {}
      });
    })
    .catch((err) => {
      console.error("Unable to connect to the database:", err);
    });
};

const clearWarning = async () => {
  // await Warningreport.updateAll({ Status: "open" }, { Status: "resolved" });
  // console.log("Done");
  Conn.authenticate()
    .then(async () => {
      console.log("Connection has been established successfully.");
      User.findAll();
      const result = await Warningreport.update(
        { status: "resolved" },
        { where: { status: "open" } }
      );
      console.log("cleared warning count", result.length);
    })
    .catch((err) => {
      console.error("Unable to connect to the database:", err);
    });

  return "done";
};
// getNames();
const getTodayData = () => {
  let CID = 416813;
  let LastEvaluatedKey = null;
  let data = {
    TableName: "Warnings",
    KeyConditionExpression:
      "DeviceID = :key and DeviceTimeStamp BETWEEN :up AND :down",
    ExpressionAttributeValues: {
      ":key": CID,
      ":up": moment().startOf("hour").toDate(),
      ":down": moment().endOf("hour").toDate() || new Date().toISOString(),
    },
    Limit: 2000,
    ScanIndexForward: true,
  };
  console.log({ start: moment().startOf("hour").toDate() });
  console.log({ plus10: moment().startOf("hour").add(10, "minutes").toDate() });
  console.log({
    Test10: moment() > moment().startOf("hour").add(20, "minutes").toDate(),
  });

  return;
  IOTHTTP.post(`/devicedata/${LastEvaluatedKey ? "scan" : ""}`, data)
    .then((resp) => {
      let warnings = resp.data.Items;
      console.log(warnings);
      console.log(resp);
    })
    .catch((err) => console.error(err.response));
};
let samplePayload = {
  DeviceID: "417960",
  Timestamp: "2020-10-18T23:19:57",
  payload: {
    InverterId: "92931905108600",
    PVLs: "1",
  },
};

const handler = () => {};
getTodayData();
// updateWarning(samplePayload);
// clearWarning();
