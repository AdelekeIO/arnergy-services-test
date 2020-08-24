// const AWS = require("aws-sdk");
// const documentClient = new AWS.DynamoDB.DocumentClient({});
const fs = require("fs");
const axios = require("axios");
let moment = require("moment");
const IOTHTTP = axios.create({
  // baseURL: 'http://localhost:3030',
  baseURL: "https://e6wa7gkf0i.execute-api.us-west-2.amazonaws.com/dev",
  headers: {
    "Content-Type": "application/plain",
    // var headers = {
    //   "Content-Type": "application/plain",
    // };
  },
});
const adminAddr =
  "holhushehun@gmail.com,customer.operations@arnergy.com,kunle.adebayo@arnergy.com";
const payloadDictionary = require("./payload_dictionary.json");
// Sorting data export
// const localDataExport = require("./Today.json").sort(
//   (a, b) => moment(a["DeviceTimeStamp"]) - moment(b["DeviceTimeStamp"])
// );
const localDataExport = require("./connectedDevices.json").sort(
  (a, b) => moment(a["DeviceTimeStamp"]) - moment(b["DeviceTimeStamp"])
);
// Final Export Hourly
let TMP_DB = {};
// console.log(localDataExport[0])
// process.exit(-1);
const transformChartData = (InverterDataList) => {
  // console.log(InverterDataList);
  // console.log("In transform Chart Data");

  // return;
  if (undefined !== InverterDataList && InverterDataList.length > 0) {
    return InverterDataList.reduce((aggr, tmpCurr) => {
      // let tmpCurr = transformMapData(c_item);
      Object.keys(tmpCurr).map((singleKey) => {
        aggr[singleKey] = aggr[singleKey]
          ? Number(aggr[singleKey]) + Number(tmpCurr[singleKey])
          : Number(tmpCurr[singleKey]);
        // aggr[singleKey] =
        //   Number(aggr[singleKey]) + Number(tmpCurr[singleKey]);
      });
      return aggr;
    }, {});
  }
};

const processLoadEnergySourceVisualization = async (data, modeData) => {
  let loadEnergySource = {
    pvSource: 0,
    gridSource: 0,
    batterySource: 0,
  };
  let pvp = data && data[0]["PVCgP"] ? parseInt(data[0]["PVCgP"]) : 0;
  let acoap = data && data[0]["ACOAP"] ? parseInt(data[0]["ACOAP"]) : 0;
  let mode = modeData && modeData[0]["Mode"] ? modeData[0]["Mode"] : "";
  if (pvp >= acoap) {
    return (loadEnergySource = {
      pvSource: acoap,
      gridSource: 0,
      batterySource: 0,
    });
  }

  if (pvp < acoap) {
    if (pvp > 0 && (mode === "L" || mode === "E" || mode === "Y")) {
      return (loadEnergySource = {
        pvSource: pvp,
        gridSource: acoap - pvp,
        batterySource: 0,
      });
    }

    if (pvp > 0 && (mode !== "L" || mode !== "E" || mode !== "Y")) {
      return (loadEnergySource = {
        pvSource: pvp,
        gridSource: 0,
        batterySource: acoap - pvp,
      });
    }

    if (pvp === 0 && (mode === "L" || mode === "E" || mode === "Y")) {
      return (loadEnergySource = {
        pvSource: 0,
        gridSource: acoap,
        batterySource: 0,
      });
    }

    if (pvp === 0 && (mode !== "L" || mode !== "E" || mode !== "Y")) {
      loadEnergySource = {
        pvSource: 0,
        gridSource: 0,
        batterySource: acoap,
      };

      return loadEnergySource;
    }
  }

  console.log({ pvp, acoap, mode, loadEnergySource });
  return loadEnergySource;
};

const extractBatteryData = (BatteryPayload) => ({
  SOC: Number(BatteryPayload["SOC"]),
  TotalBatCur: Number(BatteryPayload["TotalBatCur"]),
  TotalBatVolt: Number(BatteryPayload["TotalBatVolt"]),
});

const extractDataStat = (oldMap, newMap) => {
  if (newMap !== undefined) {
    return Object.keys(newMap).reduce((aggr, singleKey) => {
      let oldSnap = oldMap[singleKey];
      let newSnap = Number(newMap[singleKey]);
      aggr[singleKey] = computeAverage(oldSnap, newSnap);
      return aggr;
    }, {});
  }
};

const loadEnergySourcePlusOld = (oldLoadEnergySource, newLoadEnergySource) => {
  let loadEnergySource = {};
  // console.log({ oldLoadEnergySource });
  console.log("old============" + JSON.stringify(oldLoadEnergySource));
  return (loadEnergySource = {
    pvSource:
      oldLoadEnergySource.pvSource && newLoadEnergySource.pvSource
        ? parseInt(oldLoadEnergySource.pvSource) +
          parseInt(newLoadEnergySource.pvSource)
        : newLoadEnergySource.pvSource
        ? newLoadEnergySource.pvSource
        : oldLoadEnergySource.pvSource,
    gridSource:
      oldLoadEnergySource.gridSource && newLoadEnergySource.gridSource
        ? parseInt(oldLoadEnergySource.gridSource) +
          parseInt(newLoadEnergySource.gridSource)
        : newLoadEnergySource.gridSource
        ? newLoadEnergySource.gridSource
        : oldLoadEnergySource.gridSource,
    batterySource:
      oldLoadEnergySource.batterySource && newLoadEnergySource.batterySource
        ? parseInt(oldLoadEnergySource.batterySource) +
          parseInt(newLoadEnergySource.batterySource)
        : newLoadEnergySource.batterySource
        ? newLoadEnergySource.batterySource
        : oldLoadEnergySource.batterySource,
  });
};
const computeAverage = (oldSnap, newSnap) => {
  // console.log({
  //   oldSnap,
  //   newSnap,
  // });
  let tmpOldSnap = oldSnap ? oldSnap : [];
  if (undefined == tmpOldSnap || tmpOldSnap.length) {
    let snaps = {
      max: newSnap ? newSnap : 0,
      min: newSnap ? newSnap : 0,
      avg: newSnap ? newSnap : 0,
    };
    oldSnap.push(snaps);
  }

  let min = tmpOldSnap["min"] < newSnap ? tmpOldSnap["min"] : newSnap;
  let max = tmpOldSnap["max"] > newSnap ? tmpOldSnap["max"] : newSnap;
  return {
    min,
    max,
    avg: (min + max) / 2,
  };
};

const processChartData = (oldData, newData) => ({
  Battery: extractDataStat(oldData["Battery"], newData["Battery"]),
  InverterData: extractDataStat(
    oldData["InverterData"],
    newData["InverterData"]
  ),
  EnergyData: newData["EnergyData"],
});

var handle = async (event) => {
  // console.log("Hourly Event", JSON.stringify(event));
  // return;
  let eventPayload = event;

  const getItemParam = {
    TableName: "HourlyChart",
    Key: {
      DeviceID: `${eventPayload.DeviceID}`,
      DeviceTimeStamp: moment(eventPayload["Timestamp"])
        .startOf("hour")
        .format(),
    },
  };

  // console.log({ newLoadEnergySource });
  let newLoadEnergySource = await processLoadEnergySourceVisualization(
    eventPayload["InverterData"],
    eventPayload["ModeData"]
  );
  // return;
  let chartDataNode = {
    DeviceID: `${eventPayload.DeviceID}`,
    Timestamp: eventPayload["Timestamp"],
    EnergyData: transformChartData(
      eventPayload["EnergyData"] ? eventPayload["EnergyData"] : []
    ),
    Battery: eventPayload["BatteryData"]
      ? extractBatteryData(eventPayload["BatteryData"])
      : {},
    InverterData: transformChartData(
      eventPayload["InverterData"] ? eventPayload["InverterData"] : []
    ),
  };
  let ky_ = `${eventPayload.DeviceID}-${moment(eventPayload["Timestamp"])
    .startOf("hour")
    .format()}`;
  // console.log({ getHourlyParams });
  let oldChartDataNode = TMP_DB[ky_];
  let ChartData = null;
  if (oldChartDataNode) {
    // console.log(oldChartDataNode, "Hourly found");
    // oldChartDataNode, chartDataNode
    // let oldChartDataNode = result["Item"];
    let loadEnergySourcePlus = await loadEnergySourcePlusOld(
      oldChartDataNode && oldChartDataNode["loadEnergySource"]
        ? oldChartDataNode["loadEnergySource"]
        : null,
      newLoadEnergySource
    );

    console.log(
      "From Plus Computation response" + JSON.stringify(newLoadEnergySource)
    );

    ChartData = {
      DeviceID: `${eventPayload.DeviceID}`,
      DeviceTimeStamp: moment(eventPayload["Timestamp"])
        .startOf("hour")
        .format(),
      ...processChartData(oldChartDataNode, chartDataNode),
      loadEnergySource: loadEnergySourcePlus,
      Hour: new Date(chartDataNode.Timestamp).getHours(),
      LastEvaluated: eventPayload["Timestamp"],
    };
    // const getHourlyParams = {
    //   TableName: "HourlyChart",
    //   Item: ChartData
    // };
    if (oldChartDataNode && oldChartDataNode["InverterData"]) {
      delete oldChartDataNode["InverterData"]["InverterId"];
    }

    if (chartDataNode && chartDataNode["InverterData"]) {
      delete chartDataNode["InverterData"]["InverterId"];
    }

    // console.log(
    //   JSON.stringify(
    //     {
    //       oldChartDataNode
    //     },
    //     undefined,
    //     4
    //   )
    // );

    // documentClient
    //   .put(
    //     getHourlyParams
    //   )
    //   .promise();
    // return ChartData;
  } else {
    console.log("Hourly NOT found");
    console.log({ newLoadEnergySource });

    ChartData = {
      DeviceID: `${eventPayload.DeviceID}`,
      DeviceTimeStamp: moment(eventPayload["Timestamp"])
        .startOf("hour")
        .format(),
      ...processChartData(chartDataNode, chartDataNode),
      loadEnergySource: newLoadEnergySource,
      Hour: new Date(chartDataNode.Timestamp).getHours(),
      LastEvaluated: eventPayload["Timestamp"],
    };
    // const getHourlyParams = {
    //   TableName: "HourlyChart",
    //   Item: ChartData
    // };
    // return ChartData;
    try {
      //   await documentClient.put(getHourlyParams).promise();
    } catch (err) {
      //Swallow any errors
      console.error(`Hourly error to be fixed`);
      console.error("===========================", err);
    }
  }

  // let ky_ =  `${eventPayload.DeviceID}-${moment(eventPayload["Timestamp"])
  //         .startOf("hour")
  //         .format()}`

  TMP_DB[ky_] = ChartData;
  // console.log({ TMP_DB });

  return TMP_DB;
  //  console.log(
  //   JSON.stringify(
  //     {
  //       ChartData
  //     },
  //     undefined,
  //     4
  //   )
  // );
};

// exports.handler = handle;
let response = [];
try {
  localDataExport.map(async ({ payload }) => await handle(payload));

  fs.writeFile(
    "HourlyTodayExport.json",
    JSON.stringify(
      {
        TMP_DB,
      },
      undefined,
      4
    ),
    (err) => {
      if (err) {
        console.log(err);
        console.log("====ERROR Writinh to file ===");
      }
      console.info(
        "Execution time (hr): %ds %dms"
        // hrend[0],
        // hrend[1] / 1000000
      );
    }
  );
} catch (error) {
  console.log({ error });
}

//    console.log(
//       JSON.stringify(
//         {
//           TMP_DB
//         },
//         undefined,
//         4
//       )
//     );
