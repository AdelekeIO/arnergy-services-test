const payloadDictionary = require("./payload_dictionary.json");
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
let globalData = [],
  _LastEvaluatedKey = null;
const IOTHTTP = axios.create({
  // baseURL: 'http://localhost:3030',
  baseURL: "https://e6wa7gkf0i.execute-api.us-west-2.amazonaws.com/dev",
  headers: {
    // Authorization: 'Bearer {token}'
  }
});
function transformChartData(InverterDataList) {
  // console.log({ InverterDataList });

  // if (InverterDataList) {
  return InverterDataList.reduce((aggr, c_item) => {
    let tmpCurr = transformMapData(c_item);
    Object.keys(tmpCurr).map(singleKey => {
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
  return ListData.map(x => {
    // Object.keys(x).map(key => {
    //   x[payloadDictionary.find(x => x.new_key == key)["old_key"]] = x[key];
    //   delete x[key];
    // });
    return x.length ? transformListData(x) : transformMapData(x);
  });
}
function transformMapData(MapData) {
  return Object.keys(MapData).reduce((cummData, key) => {
    let oldKey = payloadDictionary.find(x => x.new_key == key);
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
    "Content-Type": "application/plain"
  };
  let data = {
    TableName: "Parameters",
    KeyConditionExpression:
      "DeviceID = :key and DeviceTimeStamp BETWEEN :up AND :down",
    ExpressionAttributeValues: {
      ":key": `${inverterId}`,
      ":up":
        moment(upperLimit)
          .startOf("day")
          .toDate() ||
        moment("2019/6/20")
          .startOf("day")
          .toDate(),
      ":down":
        moment(lowerLimit)
          .endOf("day")
          .toDate() || new Date().toISOString()
    },
    Limit: limit,
    ScanIndexForward: false
  };
  // console.log({ query: data });
  if (LastEvaluatedKey) {
    data["ExclusiveStartKey"] = LastEvaluatedKey;
    // let tempQuery = ;
    data["FilterExpression"] = data["KeyConditionExpression"];
  }
  // console.log(data);
  IOTHTTP.post(`/devicedata/${LastEvaluatedKey ? "scan" : ""}`, data, {
    headers
  })
    .then(resp => {
      let { LastEvaluatedKey, Items } = resp.data;
      let parsed = [];
      globalData = [...globalData, ...Items];
      _LastEvaluatedKey = LastEvaluatedKey;
      // console.log({
      //   fullCount: globalData.length,
      //   LastEvaluatedKey
      // });
      // let { Version, ModeData } = globalData[0].payload;
      // console.log({ Version, ModeData, lengh: globalData });
      // console.log({ fullData: globalData });

      // switch (Version) {
      //   case "v3":
      //     // console.log("->", globalData);
      //     parsed = globalData.map(x => {
      //       // console.log(x);
      //       // console.log(x.payload["InverterData"]);
      //       return {
      //         DeviceTimeStamp: x.DeviceTimeStamp,
      //         EnergyData: transformChartData(x.payload["EnergyData"]),
      //         ...transformChartData(x.payload["InverterData"])
      //       };
      //     });

      //     // console.log({ parsed });
      //     break;
      //   case "v4":
      //     parsed = globalData.map(x => {
      //       // console.log(x.payload["InverterData"]);
      //       return {
      //         DeviceTimeStamp: x.DeviceTimeStamp,
      //         EnergyData: transformChartData(
      //           x.payload["EnergyData"] ? x.payload["EnergyData"] : []
      //         ),
      //         ...transformChartData(
      //           x.payload["InverterData"] ? x.payload["InverterData"] : []
      //         )
      //       };
      //     });
      //     //   console.log({ parsed: globalData });
      //     break;
      //   case undefined:
      //     parsed = globalData;
      //     break;
      //   default:
      //     parsed = globalData;
      //     break;
      // }

      parsed = globalData;
      // console.log({
      //   // data: parsed
      //   _LastEvaluatedKey
      // });
      // //   return parsed;
      // console.log(parsed.length);
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
        console.log("final->", parsed.length);
        fs.writeFile("Today.json", JSON.stringify(parsed), err => {
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
    .catch(err => {
      console.log(err);
    });
}
var hrstart = process.hrtime(),
  hrend;
getDeviceData(417470, "2020-08-05", "2020-08-05", (limit = 1000));
