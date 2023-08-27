function handleResize() {
  canvas.width = window.innerWidth - ((padding + 1) * 2 * window.devicePixelRatio);
  canvas.height = window.innerHeight - ((padding + 1) * 2 * window.devicePixelRatio);

  updateGridPositions(canvas.width/2, canvas.height/2);
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
    } else if (editMode && activeHexes.length > 0) {
      // a hex is active, and we're in edit mode...
      if (activeHexes.length == 1) {
        // look at hex ui buttons
        button = getButton(x, y, hexUICoords);
        if (button != undefined) {
          // if hex ui button hit...
          if (button[0] == 0 && activeHexUI == undefined) {
            // if top level cancel button hit...
            activeHexes = [];
          } else {
            // button other than top level cancel button hit...
            handleHexButtonOutcome(getActiveHexUIList()[button[0]]);
          }
        }
      } else {
        // look at the multi-select buttons;
        button = getButton(x, y, multiHexUICoords);
        if (button != undefined) {
          // if multi-hex ui button hit...
        }
      }
      if (button == undefined) {
        // if no hex/multi-hex ui button hit...
        if (longPress) {
          let hex = getHexFromXY(x, y);

          function compareHexes(givenHex) {
            if (givenHex[0] == hex[0] && givenHex[1] == hex[1])
            return true;
          }

          if (activeHexes.find(compareHexes)) activeHexes.splice(activeHexes.findIndex(compareHexes), 1);
          else activeHexes.push(hex);
        } else {
          activeHexes = [];
          activeHexUI = undefined;
        }
      }

      redrawAll();
    } else if (editMode) {
      // no active hex, and we're in editMode, set active hex
      let hex = getHexFromXY(x, y);
      activeHexes.push(hex);
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

  if (activeHexes.length > 0) {
    activeHexes.forEach((givenHex, i) => {
      activeHexes[i][0] -= offsetX;
      activeHexes[i][1] -= offsetY;
    });

    if (activeHexes[0][0] > dimensions.cols-2 ||
        activeHexes[0][0] < 1 ||
        activeHexes[0][1] > dimensions.rows-3 ||
        activeHexes[0][1] < 0) {
      activeHexes = [];
      activeHexUI = undefined;
    }
  }
  
  redrawAll(true);
}

function updateGridPositions(x, y) {
  var firstHex = getHexFromXY(x, y);

  let cursorDif = {
    x: (x - firstHex[2]) / radius,
    y: (y - firstHex[3]) / radius
  };
  
  radius = getRadius();
  dimensions = getDimensions();
  offsets = getOffsets();

  drawGrid();

  var secondHex = getHexFromXY(x, y);

  cursorDif = {
    x: cursorDif.x * radius,
    y: cursorDif.y * radius
  };

  let offsetX = firstHex[0] - secondHex[0];
  let offsetY = firstHex[1] - secondHex[1];

  let xCoord = firstHex[0] - mapHexOffset[0];

  //if odd / odd / even
  if ((xCoord % 2) && (offsetX % 2) && !(mapHexOffset[0] % 2)) offsetY++;
  //if even / odd / odd
  if (!(xCoord % 2) && (offsetX % 2) && (mapHexOffset[0] % 2)) offsetY--;

  mapHexOffset[0] -= offsetX;
  mapHexOffset[1] -= offsetY;

  if (activeHexes.length > 0) {
    activeHexes.forEach((givenHex, i) => {
      activeHexes[i][0] -= offsetX;
      activeHexes[i][1] -= offsetY;
    });
  }

  handleDrag(x - secondHex[2] - cursorDif.x,
             y - secondHex[3] - cursorDif.y);
}

function getH(t1, t2) {
  return Math.hypot(t1.clientX - t2.clientX,
                    t1.clientY - t2.clientY);
}

function LongPressTimer() {
  //console.log('start press');
  var id = setTimeout(() => {
    longPress = true;
    //console.log('long press');
  }, 500);
  this.cleared = false;
  this.clear = () => {
    this.cleared = true;
    clearTimeout(id);
    //console.log('clear timer');
  };
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
      canvas.style.cursor = "grabbing"; //all-scroll
      if (longPress) {
        longPress = false;
        timerId.cleared = true;
        //console.log('end long press');
      } else if (!timerId.cleared) {
        timerId.clear();
      }
      handleRelease(endInputPos.x, endInputPos.y);
    }
    if (e.type == "mouseup") {
      handleRelease(endInputPos.x, endInputPos.y);
    }
    if ((e.type == "mouseup" || e.type == "touchend") && dragging) {
      dragging = false;
      canvas.style.cursor = (editMode) ? "pointer" : "grab";
    }
    if ((e.type == "mouseup" || e.type == "touchend") && !dragging) {
      if (longPress) {
        longPress = false;
        timerId.cleared = true;
        //console.log('end long press');
      }
    }
  }
}

function updateEPos(ePos) {
  const rect = canvas.getBoundingClientRect();
  ePos.x -= rect.left - window.devicePixelRatio;
  ePos.y -= rect.top - window.devicePixelRatio;
}

function updateCursor(e) {
  let ePos = {
    x: e.clientX,
    y: e.clientY
  };
  updateEPos(ePos);

  let button = getButton(ePos.x, ePos.y, menuUICoords);
  if (!editMode) {
    // if over top menu ui button...
    if (button != undefined) canvas.style.cursor = "pointer";
    // if not over top menu ui button...
    else canvas.style.cursor = "grab";
  }
}