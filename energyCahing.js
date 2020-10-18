const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
let globalData = [],
  _LastEvaluatedKey = null;
const IOTHTTP = axios.create({
  // baseURL: 'http://localhost:3030',
  baseURL: "https://iot-solarbase.arnergy.com/",
  headers: {
    // Authorization: 'Bearer {token}'
  },
});
var headers = {
  "Content-Type": "application/plain",
};

// let startOfHour = moment(Date.now()).startOf("hour").format();
let startOfHour = moment(Date.now()).startOf("hour").format().split("+");
let beginsWithToday = moment(Date.now()).startOf("hour").format().split("T");

startOfHour = startOfHour[0] + "+00:00";
beginsWithToday = beginsWithToday[0];
console.log({ beginsWithToday });

let CID = 41681784;
// let CID = 416813;
let dataParams = {
  TableName: "HourlyChart",
  // DeviceTimeStamp
  KeyConditionExpression:
    "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
  // "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
  ExpressionAttributeValues: {
    ":key": `${CID}`,
    ":up": beginsWithToday,
  },
  ScanIndexForward: false,
  limit: 1,
};

// console.log({ dataParams });
// return;
IOTHTTP.post(`/devicedata`, dataParams, {
  headers,
})
  .then((resp) => {
    let { LastEvaluatedKey, Items } = resp.data;
    // console.log({ Items: JSON.stringify(Items) });
    let i = 0;
    let EnergyData = Items.map((d) => {
      if (d && d.EnergyData && d.EnergyData.Timestamp) {
        return d.EnergyData;
        console.log({ count: i });
        console.log({ payload: d });
      }
      console.log({ count: i });

      //   if (i > 2) {
      //     return;
      //   }
      ++i;
    });
    console.log({ EnergyData });
  })
  .catch((err) => {
    console.log(err);
  });
