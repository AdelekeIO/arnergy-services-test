const payloadDictionary = require("./payload_dictionary.json");
const axios = require("axios");
const fs = require("fs");
var DeviceIds = require("./v3Data.json");
var ID = 43450001;
const moment = require("moment");
let globalData = [],
  _LastEvaluatedKey = null;
const IOTHTTP = axios.create({
  // baseURL: 'http://localhost:3030',
  baseURL: "https://e6wa7gkf0i.execute-api.us-west-2.amazonaws.com/dev",
  headers: {
    // Authorization: 'Bearer {token}'
  },
});
function transformChartData(InverterDataList) {
  // console.log({ InverterDataList });

  // if (InverterDataList) {
  return InverterDataList.reduce((aggr, c_item) => {
    let tmpCurr = transformMapData(c_item);
    Object.keys(tmpCurr).map((singleKey) => {
      aggr[singleKey] = aggr[singleKey]
        ? Number(aggr[singleKey]) + Number(tmpCurr[singleKey])
        : Number(tmpCurr[singleKey]);
      // aggr[singleKey] =
      //   Number(aggr[singleKey]) + Number(tmpCurr[singleKey]);
    });
    return aggr;
    // console.log(aggr);
  }, {});
  // }
}
function transformListData(ListData) {
  // console.log({ ListData });
  return ListData.map((x) => {
    // Object.keys(x).map(key => {
    //   x[payloadDictionary.find(x => x.new_key == key)["old_key"]] = x[key];
    //   delete x[key];
    // });
    return x.length ? transformListData(x) : transformMapData(x);
  });
}
function transformMapData(MapData) {
  return Object.keys(MapData).reduce((cummData, key) => {
    let oldKey = payloadDictionary.find((x) => x.new_key == key);
    // console.log(oldKey);
    if (oldKey) {
      cummData[oldKey["old_key"]] = MapData[key];
      //   delete cummData[key];
    } else {
      cummData[key] = MapData[key];
    }
    return cummData;
  }, {});
}
function getDeviceData(
  inverterId,
  upperLimit = null,
  lowerLimit = null,
  limit = 500,
  LastEvaluatedKey = null
) {
  var headers = {
    "Content-Type": "application/plain",
  };
  let data = {
    TableName: "Parameters",
    KeyConditionExpression:
      "DeviceID = :key and DeviceTimeStamp BETWEEN :up AND :down",
    ExpressionAttributeValues: {
      ":key": `${inverterId}`,
      ":up":
        moment(upperLimit).startOf("day").toDate() ||
        moment("2019/6/20").startOf("day").toDate(),
      ":down":
        moment(lowerLimit).endOf("day").toDate() || new Date().toISOString(),
    },
    Limit: limit,
    ScanIndexForward: false,
  };
  // console.log({ query: data });
  if (LastEvaluatedKey) {
    data["ExclusiveStartKey"] = LastEvaluatedKey;
    // let tempQuery = ;
    data["FilterExpression"] = data["KeyConditionExpression"];
  }
  // console.log(data);
  IOTHTTP.post(`/devicedata/${LastEvaluatedKey ? "scan" : ""}`, data, {
    headers,
  })
    .then((resp) => {
      let { LastEvaluatedKey, Items } = resp.data;
      let parsed = [];
      globalData = [...globalData, ...Items];
      _LastEvaluatedKey = LastEvaluatedKey;

      parsed = globalData;
      if (
        _LastEvaluatedKey &&
        _LastEvaluatedKey["DeviceID"] == `${inverterId}`
      ) {
        getDeviceData(
          inverterId,
          upperLimit,
          lowerLimit,
          1000,
          _LastEvaluatedKey
        );
      } else {
        hrend = process.hrtime(hrstart);
        console.log(`httime: ${process.hrtime(process.hrtime())}`);
        console.log("final->", parsed.length);
        fs.writeFile("Today.json", JSON.stringify(parsed), (err) => {
          if (err) {
            console.log(err);
          }
          console.info(
            "Execution time (hr): %ds %dms",
            hrend[0],
            hrend[1] / 1000000
          );
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
var hrstart = process.hrtime(),
  hrend;
// getDeviceData(ID, "2020-08-05", "2020-08-05", (limit = 1000));
function getTodaysData(paramss, upDate) {
  console.log("Time Logs: Function Begins");

  let soy = moment().startOf("year").format();

  // let soy = moment().subtract(1, "day");

  let diff = moment().startOf("year").add(10, "days").diff(moment(soy), "days");

  var dates = [];
  for (let index = 0; index < diff + 1; index++) {
    let newDate = {
      from: moment(soy).add(index, "days").format("YYYY-MM-DD"),
      to: moment(soy).add(index, "days").endOf("day").format("YYYY-MM-DD"),
    };
    // let newDate = moment(soy).add(index, "days").format("YYYY-MM-DD");
    dates.push(newDate);
  }

  var headers = {
    "Content-Type": "application/plain",
  };

  var Items = [];
  var dataProcess = () => {
    IOTHTTP.post(`/devicedata`, paramss, {
      headers,
    })
      .then((result) => {
        console.log({ result: result.data });
        if (result.data.Count == 0) {
          console.log({ upDate });
          let newUpDate = moment(upDate).add(1, "day").format("YYYY-MM-DD");
          let p = {
            // TableName: "PowerData",
            TableName: "Parameters",

            KeyConditionExpression:
              "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
            ExpressionAttributeValues: {
              ":key": `${ID}`,
              ":up": `${newUpDate}`,
            },
            ScanIndexForward: false,
          };
          getTodaysData(p, newUpDate);
        }
        console.log({ result: result.data.Items[0].DeviceTimeStamp });
        // console.log({ result: JSON.stringify(result) });

        console.log({ result: moment(result.data.Items[0].DeviceTimeStamp) });

        let { LastEvaluatedKey } = result.data.Items;
        console.log({ LastEvaluatedKey });
        Items = [...Items, ...result.data.Items];
        parsed = Items;
        if (result.LastEvaluatedKey) {
          paramss.ExclusiveStartKey = result.LastEvaluatedKey;
          dataProcess();
        } else {
          console.log({ count: Items.length });
          console.log({ parsed: JSON.stringify(parsed) });

          hrend = process.hrtime(hrstart);
          console.log("final->", parsed.length);
          fs.writeFile("Today.json", JSON.stringify(parsed), (err) => {
            if (err) {
              console.log(err);
            }
            console.info(
              "Execution time (hr): %ds %dms",
              hrend[0],
              hrend[1] / 1000000
            );
          });

          //   return;
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
    // Items = [...Items, ...result.Items];
  };

  dataProcess();
}
async function getLastDateAndCreateParams(cb) {
  // updateDeviceList(async (resp) => {
  //   console.log({ resp });
  //   let newDate = {
  //     from: moment(resp.LEK)
  //       // .add(1, "day")
  //       .format("YYYY-MM-DD"),
  //     to: moment(resp.LEK)
  //       // .add(1, "day")
  //       .format("YYYY-MM-DD"),
  //   };
  //   let d = [];
  //   // let newDate = moment(soy).add(index, "days").format("YYYY-MM-DD");
  //   d.push(newDate);
  //   console.log({ d });

  //   cb(d);
  // });
  // return;
  var params = {
    TableName: "HourlyChart",
    // DeviceTimeStamp
    KeyConditionExpression: "DeviceID = :key and  DeviceTimeStamp < :up",
    // "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
    ExpressionAttributeValues: {
      ":key": `${ID}`,
      ":up": `2020-07-11`,
    },
    ScanIndexForward: false,
    limit: 1,
  };

  var headers = {
    "Content-Type": "application/plain",
  };
  await IOTHTTP.post(`/devicedata`, params, {
    headers,
  })
    .then((result) => {
      console.log({ resulet: result.data });
      if (result.data.Count == 0 && undefined == result.data.DeviceTimeStamp) {
        let newDate = {
          from: moment()
            .startOf("year")
            // .add(1, "day")
            .format("YYYY-MM-DD"),
          to: moment()
            .startOf("year")
            // .add(1, "day")
            .format("YYYY-MM-DD"),
        };
        let d = [];
        // let newDate = moment(soy).add(index, "days").format("YYYY-MM-DD");
        d.push(newDate);
        cb(d);
        return;
      }
      // if (
      //   moment(result.data.Items[0].DeviceTimeStamp)
      //     // .add(1, "day")
      //     .format("YYYY-MM-DD") >= "2020-01-27"
      // ) {

      // }
      console.log({ result: result.data.Items[0].DeviceTimeStamp });

      console.log({
        result: moment(result.data.Items[0].DeviceTimeStamp).format(
          "YYYY-MM-DD"
        ),
      });
      let newDate = {
        from: moment(result.data.Items[0].DeviceTimeStamp)
          // .add(1, "day")
          .format("YYYY-MM-DD"),
        to: moment(result.data.Items[0].DeviceTimeStamp)
          // .add(1, "day")
          .format("YYYY-MM-DD"),
      };
      let d = [];
      // let newDate = moment(soy).add(index, "days").format("YYYY-MM-DD");
      d.push(newDate);
      cb(d);
      return;
    })
    .catch((error) => {
      console.log({ errorB: error.response });
    });
}
async function updateDeviceList(cb) {
  DeviceIds = require("./v3Data.json");
  console.log({ DeviceId: DeviceIds.length });
  let nDevices = DeviceIds.filter((v) => v != DeviceIds[0]);

  var p = {
    TableName: "HourlyBatchUpdate",
    // DeviceTimeStamp
    KeyConditionExpression: "updateStatus = :key ",
    // "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
    ExpressionAttributeValues: {
      ":key": `${2}`,
    },
    ScanIndexForward: false,
    limit: 10,
  };

  var headers = {
    "Content-Type": "application/plain",
  };

  await IOTHTTP.post(`/devicedata`, p, {
    headers,
  })
    .then((result) => {
      console.log({ resulet: JSON.stringify(result.data) });

      ID = result.data.Items[0].DeviceId;
      let LEK = result.data.Items[0].LastEvaluated;
      // console.log({ ID, LEK });
      let cbData = {
        ID,
        LEK,
      };
      cb(cbData);
    })
    .catch((error) => {
      console.log({ error: error.response });
    });
  return;
}

getLastDateAndCreateParams(async (resp) => {
  console.log({ resp });

  let DEVICEID = ID;
  var paramss = {
    // TableName: "PowerData",
    TableName: "Parameters",

    KeyConditionExpression:
      "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
    ExpressionAttributeValues: {
      ":key": `${ID}`,
      ":up": `${resp[0]["from"]}`,
    },
    ScanIndexForward: false,
  };
  getTodaysData(paramss, resp[0]["from"]);
});
