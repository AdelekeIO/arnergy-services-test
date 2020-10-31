let finalResponse = {};
const load = require("./load.json");
let reqData = load;
let totalKeys = Object.keys(reqData);
let totalList = Object.values(reqData);

function getSystemSuggestion(quantityTmp) {
  let suggstn = "arnergy5000";
  let suggSize = "5kVA";
  let descr = "2 Batteries + 12 panels on 1 Arnergy 5000 cabinet";
  console.log({ quantityTmp });

  if (quantityTmp <= 0.6) {
    suggstn = "arnergy5000x";
    suggSize = "5kVA";
    descr = "1 Battery + 6 panels on 1 Arnergy 5000 cabinet";
  } else {
    quantityTmp = Math.floor(quantityTmp);
    console.log({ quantityTmp });

    if (quantityTmp == 1) {
      suggstn = "arnergy5000";
      suggSize = "5kVA";
      descr = "2 Batteries + 12 panels on 1 Arnergy 5000 cabinet";
    } else if (quantityTmp == 2) {
      suggstn = "arnergy10000";
      suggSize = "10kVA";
      descr = "4 Batteries + 24 panels on 1 Arnergy 10000 cabinet";
    } else if (quantityTmp == 3) {
      suggstn = "arnergy15000";
      suggSize = "15kVA";
      descr =
        "6 Batteries + 36 panels  on 1 Arnergy 5000 cabinet + 1 Arnergy 10000 cabinets";
    } else if (quantityTmp == 4) {
      suggstn = "arnergy20000";
      suggSize = "20kVA";
      descr = "8 batteries : 48 panels on 2 Arnergy 10000 cabinets.";
    } else if (quantityTmp == 5) {
      suggstn = "arnergy25000";
      suggSize = "25kVA";
      descr =
        "10 batteries : 2 Arnergy 10000 cabinets + 1 Arnergy 5000 cabinet";
    } else if (quantityTmp == 6) {
      suggstn = "arnergy30000";
      suggSize = "30kVA";
      descr =
        "Mini grid developers : 4 Arnergy 10000 boxes - 6 batteries each 97.6kWh and 6 inverters.";
    } else if (quantityTmp == 7) {
      suggstn = "arnergy35000";
      suggSize = "35kVA";
      descr = "";
    } else if (quantityTmp == 8) {
      suggstn = "arnergy40000";
      suggSize = "40kVA";
      descr = "";
    } else if (quantityTmp == 9) {
      suggstn = "arnergy45000";
      suggSize = "45kVA";
      descr = "";
    } else {
      suggstn = "Contact Technical Team";
      suggSize = "Customized System";
      descr = "Contact Technical Team";
    }
  }
  return {
    system: suggstn,
    size: suggSize,
    description: descr,
  };
}

let loadbreakdwn = totalKeys.reduce((acc, x) => {
  return (acc = {
    ...acc,
    [`${x}`]: {
      load_rating: reqData[x]["quantity"] * reqData[x]["wattage"],
      energy_required:
        reqData[x]["quantity"] *
        reqData[x]["wattage"] *
        reqData[x]["hours_per_day"],
    },
  });
}, {});
let total = Object.values(loadbreakdwn).reduce(
  (acc, x) => {
    acc = {
      in_watts: {
        //   ...acc["in_watts"]["load_rating"],
        [`load_rating`]: acc["in_watts"]["load_rating"] + x["load_rating"],
        [`energy_required`]:
          acc["in_watts"]["energy_required"] + x["energy_required"],
      },
      in_killowatts: {
        //   ...acc["in_killowatts"]["load_rating"],
        [`load_rating`]:
          (acc["in_watts"]["load_rating"] + x["load_rating"]) / 1000,
        [`energy_required`]:
          (acc["in_watts"]["energy_required"] + x["energy_required"]) / 1000,
      },
    };
    console.log(acc);
    return acc;
  },
  {
    in_watts: {
      load_rating: 0,
      energy_required: 0,
    },
    in_killowatts: {
      load_rating: 0,
      energy_required: 0,
    },
  }
);
// let suggested_system = {
//   type: "arnergy5000",
//   quantity:
//     Math.floor(total.in_killowatts.energy_required / 10.8) < 1
//       ? 1
//       : Math.floor(total.in_killowatts.energy_required / 10.8),
// };
let quantityTmp = total.in_killowatts.energy_required / 10.8;
let suggested_system = {
  ...getSystemSuggestion(quantityTmp),
};
//   let totalSumm = {
//       "in_watts": wtTotal ,
//       "in_killowatts":
//   }
let apiResponse = {
  loadbreakdown: loadbreakdwn,
  total,
  suggested_system,
};

console.log({ apiResponse });
const response = {
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(apiResponse),
};
// console.log({ response });

// callback(null, response);
