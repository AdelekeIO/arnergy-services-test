const fs = require("fs");
const axios = require("axios");
let moment = require("moment");
const connectedPayload = require("./SampleEnergyData.json");
const payloadDictionary = require("./payload_dictionary.json");

const dailyAggregate = () => {
  console.log({ connectedPayload, mode: connectedPayload.ModeData });

  let aggregatedPayload = {
    deviceid: connectedPayload.DeviceID,
    lastseen: connectedPayload.Timestamp,
  };
};

const transformMapData = (MapData) => {
  console.log({ MapData: JSON.stringify(MapData) });
  MapData = transformChartData(MapData);
  // console.log(Object.keys(MapData).reduce((cummData, key) => {
  //   let oldKey = payloadDictionary.find(x => x.new_key == key);
  //   // console.log(oldKey);
  //   if (oldKey) {
  //     cummData[oldKey["old_key"]] = MapData[key];
  //     //   delete cummData[key];
  //   } else {
  //     cummData[key] = MapData[key];
  //   }
  //   // console.log({ cummData, key, oldKey });
  //   return cummData;
  // }, {}));
  return Object.keys(MapData).reduce((cummData, key) => {
    let oldKey = payloadDictionary.find((x) => x.new_key == key);
    console.log({ oldKey, key });
    if (oldKey && oldKey["old_key"] != "") {
      cummData[oldKey["old_key"]] = MapData[key];
      //   delete cummData[key];
    } else {
      cummData[key] = MapData[key];
    }
    // console.log({ cummData, key, oldKey });
    return cummData;
  }, {});
};

const transformChartData = (InverterDataList) => {
  // console.log({ InverterDataList });

  return InverterDataList.reduce((aggr, tmpCurr) => {
    // console.log({ aggr, tmpCurr });

    // let tmpCurr = transformMapData(c_item);
    Object.keys(tmpCurr).map((singleKey) => {
      // console.log({ singleKey });

      aggr[singleKey] = aggr[singleKey]
        ? Number(aggr[singleKey]) + Number(tmpCurr[singleKey])
        : Number(tmpCurr[singleKey]);
      // aggr[singleKey] =
      //   Number(aggr[singleKey]) + Number(tmpCurr[singleKey]);
    });
    // console.log({ aggr });

    return aggr;
  }, {});
};
// dailyAggregate();
transformMapData(connectedPayload.EnergyData.Data);
