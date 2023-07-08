var saveData = {
  zoom: zoom,
  ignoreFog: ignoreFog,
  editMode: editMode,
  showCoords: showCoords,
  mapHexOffset: mapHexOffset,
  mapDetails: mapDetails.save()
};

const errorStr = "Not supported on mobile. Try using Chrome or Edge on desktop.";

async function save() {
  try {
    const handle = await getNewFileHandle();
  } catch (error) {
    if (error instanceof TypeError) {
      alert(errorStr);
      return;
    } else return;
  }

  updateSaveData();
  var file = new Blob([JSON.stringify(saveData, null, 2)], {type: 'application/json'});
  writeFile(handle, file);
}

function updateSaveData() {
  saveData.zoom = zoom;
  saveData.ignoreFog = ignoreFog;
  saveData.editMode = editMode;
  saveData.showCoords = showCoords;
  saveData.mapHexOffset = mapHexOffset;
  saveData.mapDetails = mapDetails.save();
}

function applySaveData() {
  zoom = saveData.zoom;
  ignoreFog = saveData.ignoreFog;
  editMode = saveData.editMode;
  showCoords = saveData.showCoords;
  mapHexOffset = saveData.mapHexOffset;
  mapDetails.data = saveData.mapDetails;
  activeHex = undefined;
  activeHexUI = undefined;
  redrawAll();
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
  try {
    [fileHandle] = await window.showOpenFilePicker(options);
  } catch (error) {
    if (error instanceof TypeError) {
      alert(errorStr);
      return;
    } else return;
  }
  
  const file = await fileHandle.getFile();
  const contents = await file.text();
  saveData = JSON.parse(contents);
  applySaveData();
}

function saveLocalData() {
  updateSaveData();
  localStorage.setItem('saveData', JSON.stringify(saveData));
  alert("data saved");
}

function retrieveLocalData() {
  if (localStorage.getItem('saveData') === null) {
    alert("no saved data");
  } else {
    saveData = JSON.parse(localStorage.getItem('saveData'));
    applySaveData();
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