// const localDataExport = require("./HourlyTodayExport.json"); //.sort((a,b)=>moment(a["DeviceTimeStamp"])-moment(b["DeviceTimeStamp"]));
// console.log(Object.values(localDataExport).length);
// console.log(Object.values(localDataExport["TMP_DB"]).length);
// const batchWrite = (payload) => {
//   let tmpStore = Object.keys(payload).map((key) => ({
//     PutRequest: { Item: payload[key] },
//   }));
//   console.log({ tmpStore });
// };
// batchWrite(localDataExport["TMP_DB"]);
const localDataExport = require("./connectedDevices.json"); //.sort((a,b)=>moment(a["DeviceTimeStamp"])-moment(b["DeviceTimeStamp"]));
console.log(Object.values(localDataExport).length);
