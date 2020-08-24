// const DeviceIds = require("./v3Data.json");
const axios = require("axios");
const fs = require("fs");

function updateDeviceList() {
  const DeviceIds = require("./v3Data.json");
  console.log({ DeviceId: DeviceIds.length });
  let nDevices = DeviceIds.filter((v) => v != DeviceIds[0]);
  fs.writeFile("v3Data.json", JSON.stringify(nDevices), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Success");
      console.log({ DeviceId: nDevices.length });
    }

    //   console.info(
    //     "Execution time (hr): %ds %dms",
    //     hrend[0],
    //     hrend[1] / 1000000
    //   );
  });
}

updateDeviceList();
