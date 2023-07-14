function handleResize() {
  canvas.width = window.innerWidth - ((padding + 1) * 2 * window.devicePixelRatio);
  canvas.height = window.innerHeight - ((padding + 1) * 2 * window.devicePixelRatio);

  updateGridPositions();
}

function handleWheel(e) {
  let ePos = {
    x: e.clientX,
    y: e.clientY
  }
  updateEPos(ePos);
  handleZoom(ePos.x, ePos.y, e.deltaY);
}

function handlePinch(x, y, delta) {
  handleZoom(x, y, delta);
}

function handleZoom(x, y, delta) {
  let newZoom = zoom + delta * -0.0025;

  // Restrict zoom level
  newZoom = Math.min(Math.max(0.75, newZoom), 2.25);

  if (newZoom != zoom) {
    zoom = newZoom;
    radius = getRadius();

    updateGridPositions(x, y);
  }
}

function handleRelease(x, y) {
  let button = getButton(x, y, menuUICoords);
  if (button != undefined) {
    // if top menu ui button hit...
    handleMenuButtonOutcome(getActiveMenuUIList()[button[0]]);
    redrawAll();
  } else {
    // no top menu ui button hit...

    if (dragging) {
      // if we are dragging
      handleDrag(endInputPos.x - startInputPos.x, endInputPos.y - startInputPos.y);
      startInputPos = {x: x, y: y};
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
  dragOffsets.x += x;
  dragOffsets.y += y;

  let hexHeight = Math.sin(angle) * 2 * radius;
  let hexWidth = radius * 2;

  let offsetX = 0;
  let offsetY = 0;

  if ((dragOffsets.x + offsets.x) < (-radius)) {
    dragOffsets.x += hexWidth * 0.75;
    dragOffsets.y -= hexHeight / 2;
    offsetX++;

    //if odd
    if (mapHexOffset[0] % 2) offsetY--;
  }
  if ((dragOffsets.x + offsets.x) > (radius / 2)) {
    dragOffsets.x -= hexWidth * 0.75;
    dragOffsets.y += hexHeight / 2;
    offsetX--;
    
    //if even
    if (!(mapHexOffset[0] % 2)) offsetY++;
  }
  if (dragOffsets.y + offsets.y < -hexHeight / 2) {
    dragOffsets.y += hexHeight;
    offsetY++;
  }
  if (dragOffsets.y + offsets.y > 0) {
    dragOffsets.y -= hexHeight;
    offsetY--;
  }

  mapHexOffset[0] -= offsetX;
  mapHexOffset[1] -= offsetY;

  if (activeHex != undefined) {
    activeHex[0] -= offsetX;
    activeHex[1] -= offsetY;

    if (activeHex[0] > dimensions.cols-2 ||
        activeHex[0] < 1 ||
        activeHex[1] > dimensions.rows-3 ||
        activeHex[1] < 0) {
      activeHex = undefined;
      activeHexUI = undefined;
    }
  }
  
  redrawAll(true);
}

/*
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
*/

function updateGridPositions(x, y) {
  x = (x != undefined) ? x : 0;
  y = (y != undefined) ? y : 0;

  var firstHex = getHexFromXY(x, y);
  
  dimensions = getDimensions();
  offsets = getOffsets();

  drawGrid();

  var secondHex = getHexFromXY(x, y);

  let offsetX = firstHex[0] - secondHex[0];
  let offsetY = firstHex[1] - secondHex[1];

  let xCoord = firstHex[0] - mapHexOffset[0];

  //if odd / odd / even
  if ((xCoord % 2) && (offsetX % 2) && !(mapHexOffset[0] % 2)) offsetY++;
  //if even / odd / odd
  if (!(xCoord % 2) && (offsetX % 2) && (mapHexOffset[0] % 2)) offsetY--;

  mapHexOffset[0] -= offsetX;
  mapHexOffset[1] -= offsetY;

  if (activeHex != undefined) {
    activeHex[0] -= offsetX;
    activeHex[1] -= offsetY;
  }

  handleDrag(x-secondHex[2], y-secondHex[3]);
}

function getH(t1, t2) {
  return Math.hypot(t1.clientX - t2.clientX,
                    t1.clientY - t2.clientY);
}

function handleInputPosition(e) {
  if (e.type == "touchstart" && e.touches.length > 1) {
    multiTouch.active = true;
    multiTouch.h = getH(e.touches[0], e.touches[1]);
  }

  if (multiTouch.active) {
    if (e.type == "touchmove") {
      let h = getH(e.touches[0], e.touches[1]);
      let delta = multiTouch.h-h;
      multiTouch.h = h;

      let ePos = {
        x: e.touches[0].clientX + ((e.touches[0].clientX - e.touches[1].clientX) / 2),
        y: e.touches[0].clientY + ((e.touches[0].clientY - e.touches[1].clientY) / 2)
      };
      updateEPos(ePos);

      handlePinch(ePos.x, ePos.y, delta);
    }
    if (e.type == "touchend") {
      multiTouch.active = false;
      multiTouch.h = 0.0;
    }
  } else {
    let ePos = {
      x: 0,
      y: 0
    };
    if (e.type == "mouseup" || e.type == "mousemove" || e.type == "mousedown") {
      ePos.x = e.clientX;
      ePos.y = e.clientY;
    } else if (e.type == "touchstart" || e.type == "touchmove"){
      ePos.x = e.touches[0].clientX;
      ePos.y = e.touches[0].clientY;
    }
    updateEPos(ePos);

    if (e.type == "mousedown" || e.type == "touchstart") {
      startInputPos = {x: ePos.x, y: ePos.y};
    }
    if (e.type == "mouseup" || e.type == "mousemove" ||
        e.type == "touchstart" || e.type == "touchmove") {
      endInputPos = {x: ePos.x, y: ePos.y};
    }
    if (e.type == "mousemove" || e.type == "touchmove") {
      dragging = true;
      handleRelease(endInputPos.x, endInputPos.y);
    }
    if (e.type == "mouseup") {
      handleRelease(endInputPos.x, endInputPos.y);
    }
    if ((e.type == "mouseup" || e.type == "touchend") && dragging) {
      dragging = false;
    }
  }
}

function updateEPos(ePos) {
  const rect = canvas.getBoundingClientRect();
  ePos.x -= rect.left - window.devicePixelRatio;
  ePos.y -= rect.top - window.devicePixelRatio;
}