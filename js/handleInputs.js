
function handleResize() {
  canvas.width = window.innerWidth - 12;
  canvas.height = window.innerHeight - 12;

  updateGridPositions();

  redrawAll(true);
}

function handleWheel(event) {
  let newZoom = zoom + event.deltaY * -0.0025;

  // Restrict zoom level
  newZoom = Math.min(Math.max(0.75, newZoom), 2.25);

  if (newZoom != zoom) {
    zoom = newZoom;
    radius = 25 * zoom;

    updateGridPositions();

    // redraw at new zoom
    redrawAll(true);
  }
}

function handleMouseUp(x, y) {
  let button = getButton(x, y, menuUICoords);
  if (button != undefined) {
    // if top menu ui button hit...
    handleMenuButtonOutcome(getActiveMenuUIList()[button[0]]);
    redrawAll();
  } else {
    // no top menu ui button hit...

    // check for drag
    let dragged = undefined;
    if (mouseDownPos.x != x || mouseDownPos.y != y) {
      // if mouse pos diff was over 1 hex...
      let startHex = getHexFromXY(mouseDownPos.x, mouseDownPos.y);
      let endHex = getHexFromXY(x, y);
      if (startHex[0] != endHex[0] || startHex[1] != endHex[1]) {
        if ((mapHexOffset[0] % 2) && !(endHex[0] % 2)) {
          endHex[1]++;
          console.log("endY ++");
        }

        let difX = startHex[0] - endHex[0];
        let difY = startHex[1] - endHex[1];

        if ((mapHexOffset[0] % 2) && (endHex[0] % 2)) {
          endHex[1]++;
          console.log("this");
        }

        dragged = [difX, difY];
      }
    }

    if (dragged != undefined) {
      // if we just dragged
      handleDrag(dragged[0], dragged[1]);
    } else if (editMode && activeHex != undefined) {
      // a hex is active, and we're in edit mode, look at hex ui buttons
      button = getButton(x, y, hexUICoords);
      if (button != undefined) {
        // if hex ui button hit...
        if (button[0] == 0 && activeHexUI == undefined) {
          // if top level cancel button hit...
          activeHex = undefined;
        } else {
          // button other than top level cancel button hit...
          handleHexButtonOutcome(getActiveHexUIList()[button[0]]);
        }
      } else {
        // if no hex ui button hit...
        activeHex = undefined;
        activeHexUI = undefined;
      }

      redrawAll();
    } else if (editMode) {
      // no active hex, and we're in editMode, set active hex
      let hex = getHexFromXY(x, y);
      activeHex = hex;
      redrawAll();
    }
  }
}

function handleDrag(x, y) {
  let offsetX = x;
  let offsetY = y;

  mapHexOffset[0] -= offsetX;
  mapHexOffset[1] -= offsetY;

  if (activeHex != undefined) {
    activeHex[0] -= offsetX;
    activeHex[1] -= offsetY;

    if (activeHex[0] > dimensions.cols-2 ||
        activeHex[0] < 1 ||
        activeHex[1] > dimensions.rows-2 ||
        activeHex[1] < 1) {
      activeHex = undefined;
      activeHexUI = undefined;
    }
  }

  // redraw at new zoom
  redrawAll(true);
}

function updateGridPositions() {
  if (activeHex != undefined) {
    var percentX = activeHex[0] / dimensions.cols;
    var percentY = activeHex[1] / dimensions.rows;
  }

  dimensions = getDimensions();
  offsets = getOffsets();

  if (activeHex != undefined) {
    let newX = Math.round(dimensions.cols * percentX);
    let newY = Math.round(dimensions.rows * percentY);

    if (newX == dimensions.cols-1) newX--;
    if (newX == 0) newX++;
    if (newY == dimensions.rows-1) newY--;
    if (newY == 0) newY++;
    
    let offsetX = activeHex[0] - newX;
    let offsetY = activeHex[1] - newY;

    mapHexOffset[0] -= offsetX;
    mapHexOffset[1] -= offsetY;

    activeHex[0] -= offsetX;
    activeHex[1] -= offsetY;
  }
}