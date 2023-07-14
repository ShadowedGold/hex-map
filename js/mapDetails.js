var mapDetails = {
  data: {},
  save: function () { return this.data; },
  update: function () { this.data = saveData.mapDetails; },
  clearAllHexes: function () { this.data = {}; },
  clearHex: function (num) { delete this.data[num]; }
};

function prepHexForUpdate(num) {
  let hexName = getHexName(num);

  if (!mapDetails.data.hasOwnProperty(hexName)) addNewMapHex(num);
}

function addNewMapHex(num) {
  mapDetails.data[getHexName(num)] = {
    roads: {
      value: [],
      known: false
    },
    biomes: {
      value: [
        "plains",
        "plains",
        "plains",
        "plains",
        "plains",
        "plains"
      ],
      known: false
    },
    aoi: {
      value: 0,
      known: false
    }
  };
}