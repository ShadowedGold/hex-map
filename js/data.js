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
  let failed = false;
  let fileName = 'hexMapSave_01.json';

  try {
    var handle = await getNewFileHandle(fileName);
  } catch (error) {
    if (error instanceof TypeError) {
      console.log(errorStr);
      failed = true;
    } else return;
  }

  updateSaveData();
  var file = new Blob([JSON.stringify(saveData, null, 2)], {type: 'application/json'});
  
  if (!failed) {
    writeFile(handle, file);
  } else {
    var el = document.createElement('a');
    el.setAttribute('href', window.URL.createObjectURL(file));
    el.setAttribute('download', fileName);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }
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

  radius = getRadius();
  dimensions = getDimensions();
  offsets = getOffsets();
  redrawAll();
}

async function getNewFileHandle(fileName) {
  const options = {
    suggestedName: fileName,
    startIn: 'downloads',
    types: [{
      description: 'JSON File',
      accept: {
        'application/json': ['.json']
      }
    }]
  };

  let handle = await window.showSaveFilePicker(options);
  return handle;
}

async function writeFile(fileHandle, contents) {
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
}

async function load() {
  let failed = false;
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
      console.log(errorStr);
      failed = true;
    } else return;
  }
  
  if (!failed) {
    const file = await fileHandle.getFile();
    var contents = await file.text();
    
    saveData = JSON.parse(contents);
    applySaveData();
  } else {
    var el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', '.json,application/json,application/JSON');
    el.addEventListener('change', uploadedFile);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }
}

function uploadedFile(e) {
  var file = e.target.files[0];
  var reader = new FileReader();

  reader.addEventListener('loadend', () => {
    saveData = JSON.parse(reader.result);
    applySaveData();
  });

  if ((file.type != '.json') &&
      (file.type != 'application/json') &&
      (file.type != 'application/JSON'))
  alert("Error: Wrong File Type.\nPlease upload a JSON file.");
  else reader.readAsText(file);
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