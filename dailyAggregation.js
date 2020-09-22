const fs = require("fs");
const axios = require("axios");
let moment = require("moment");
const connectedPayload = require("./SampleEnergyData.json");

const dailyAggregate = () => {
  console.log({ connectedPayload, mode: connectedPayload.ModeData });

  let aggregatedPayload = {
    deviceid: connectedPayload.DeviceID,
    lastseen: connectedPayload.Timestamp,
  };
};
dailyAggregate();
