var saveData = {
  zoom: zoom,
  ignoreFog: ignoreFog,
  editMode: editMode,
  mapHexOffset: mapHexOffset,
  mapDetails: mapDetails.save()
};

function save() {
  saveData.zoom = zoom;
  saveData.ignoreFog = ignoreFog;
  saveData.editMode = editMode;
  saveData.mapHexOffset = mapHexOffset;
  saveData.mapDetails = mapDetails.save();
  
  localStorage.setItem('saveData', JSON.stringify(saveData));
  alert("data saved");
}

function retrieve() {
  if (localStorage.getItem('saveData') === null) {
    alert("no saved data");
  } else {
    saveData = JSON.parse(localStorage.getItem('saveData'));
    zoom = saveData.zoom;
    ignoreFog = saveData.ignoreFog;
    editMode = saveData.editMode;
    mapHexOffset = saveData.mapHexOffset;
    mapDetails.data = saveData.mapDetails;
    activeHex = undefined;
    activeHexUI = undefined;
    redrawAll();
    alert("loaded saved data");
  }
}

function deleteData() {
  if (localStorage.getItem('saveData') === null) {
    alert("saved data does not exist");
  } else {
    localStorage.removeItem('saveData');
    alert("save data deleted");
  }
}

function loadMapDetails() {
  var request = new XMLHttpRequest();
  request.open("GET", "json/mapDetails.json", false);
  request.send(null);
  var data = JSON.parse(request.responseText);
  mapDetails.data = data;
}