var saveData = {
  zoom: zoom,
  ignoreFog: ignoreFog,
  editMode: editMode,
  mapHexOffset: mapHexOffset,
  mapDetails: mapDetails.save()
};

async function save() {
  const handle = await getNewFileHandle();

  saveData.zoom = zoom;
  saveData.ignoreFog = ignoreFog;
  saveData.editMode = editMode;
  saveData.mapHexOffset = mapHexOffset;
  saveData.mapDetails = mapDetails.save();

  var file = new Blob([JSON.stringify(saveData, null, 2)], {type: 'application/json'});

  writeFile(handle, file);
}

async function getNewFileHandle() {
  const options = {
    suggestedName: 'hexMapSave_01.json',
    startIn: 'downloads',
    types: [{
      description: 'JSON File',
      accept: {
        'application/json': ['.json']
      }
    }]
  };

  const handle = await window.showSaveFilePicker(options);
  return handle;
}

async function writeFile(fileHandle, contents) {
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
}

async function load() {
  const options = {
    startIn: 'downloads',
    multiple: false,
    excludeAcceptAllOption: true,
    types: [{
      description: 'JSON File',
      accept: {
        'application/json': ['.json']
      }
    }]
  };

  let fileHandle;
  [fileHandle] = await window.showOpenFilePicker(options);
  const file = await fileHandle.getFile();
  const contents = await file.text();

  saveData = JSON.parse(contents);
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

function saveLocalData() {
  saveData.zoom = zoom;
  saveData.ignoreFog = ignoreFog;
  saveData.editMode = editMode;
  saveData.mapHexOffset = mapHexOffset;
  saveData.mapDetails = mapDetails.save();
  
  localStorage.setItem('saveData', JSON.stringify(saveData));
  alert("data saved");
}

function retrieveLocalData() {
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

function deleteLocalData() {
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