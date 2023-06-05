
function handleResize() {
  canvas.width = window.innerWidth - 12;
  canvas.height = window.innerHeight - 12;
  dimensions = getDimensions();
  offsets = getOffsets();

  redrawAll();
}

function handleWheel(event) {
  let newZoom = zoom + event.deltaY * -0.0025;

  // Restrict zoom level
  newZoom = Math.min(Math.max(0.75, newZoom), 2.25);

  if (newZoom != zoom) {
    zoom = newZoom;
    radius = 25 * zoom;

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

      if (offsetX % 2) {
        offsetX += (Math.round(percentX)) ? 1 : -1;
      }

      mapHexOffset[0] -= offsetX;
      mapHexOffset[1] -= offsetY;

      activeHex[0] -= offsetX;
      activeHex[1] -= offsetY;
    }

    // redraw at new zoom
    redrawAll(true);
  }
}

function handleMouseDown(x, y) {
  let button = getButton(x, y, menuUICoords);
  if (button != undefined) {
    // if top menu ui button hit...
    handleMenuButtonOutcome(getActiveMenuUIList()[button[0]]);
    redrawAll();
  } else {
    // no top menu ui button hit...
    if (editMode && activeHex != undefined) {
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