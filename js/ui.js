function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - 1;
  const y = event.clientY - rect.top - 1;

  let button = getButton(x, y, menuUICoords);
  if (button != undefined) {
    // if top menu ui button hit...
    handleMenuButtonOutcome(getActiveMenuUIList()[button[0]]);
    drawGrid();
    // if there's an active hex, draw it and its ui back in
    if (activeHex != undefined) {
      drawHex(activeHex[2], activeHex[3], [activeHex[0], activeHex[1]], getHexBgColour(activeHex[0], activeHex[1]), "yellow");
      drawHexUI(activeHex[2], activeHex[3]);
    }
  } else if (editMode && activeHex != undefined) {
    // no top menu ui button hit...
    // a hex is active, and we're in edit mode, look at hex ui buttons
    button = getButton(x, y, hexUICoords);
    if (button != undefined) {
      // if hex ui button hit...
      // refresh the grid
      drawGrid();
      if (button[0] == 0 && activeHexUI == undefined) {
        // if top level cancel button hit...
        // hex no longer active
        activeHex = undefined;
      } else {
        // button other than top level cancel button hit...
        // highlight the hex and update the ui
        handleHexButtonOutcome(getActiveHexUIList()[button[0]]);
        drawHex(activeHex[2], activeHex[3], [activeHex[0], activeHex[1]], getHexBgColour(activeHex[0], activeHex[1]), "yellow");
        drawHexUI(activeHex[2], activeHex[3]);
      }
    } else {
      // if no hex ui button hit...
      // refresh the grid
      // hex and hex ui no longer active
      drawGrid();
      activeHex = undefined;
      activeHexUI = undefined;
    }
  } else if (editMode) {
    // a hex is not active, and we're in editMode, set active hex
    // highlight the hex and update the ui
    let hex = getHex(x, y);
    activeHex = hex;
    drawHex(hex[2], hex[3], [hex[0], hex[1]], getHexBgColour(hex[0], hex[1]), "yellow");
    drawHexUI(hex[2], hex[3]);
  }

  // update the top menu ui
  drawMenuUI();
}

function handleHexButtonOutcome(button) {
  switch (activeHexUI) {
    case undefined:
      // first level of ui
      switch (button) {
        case "eye":
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          activeHexUI = "eye";
          break;
        case "biomes":
          activeHexUI = "biomes";
          break;
        case "roads":
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          activeHexUI = "roads";
          break;
        case "aoi1":
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          activeHexUI = "aoi";
          break;
      }
      break;
    case "eye":
      // toggle visibility ui
      switch (button) {
        case "cancel":
          activeHexUI = undefined;
          break;
        case "biomes":
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          toggleVisibility('biomes');
          break;
        case "roads":
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          toggleVisibility('roads');
          break;
        case "aoi1":
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          toggleVisibility('aoi');
          break;
      }
      break;
    case "biomes":
      // alter biomes
      switch (button) {
        case "cancel":
          activeHexUI = undefined;
          break;
        case "hex":
          activeHexUI = "hexColours";
          break;
        case "tri0":
          activeHexUI = "tri";
          break;
      }
      break;
    case "tri":
      // alter tri
      switch (button) {
        case "cancel":
          activeHexUI = "biomes";
          break;
        default:
          activeHexUI = "triColours";
          activeTri = Number(button.substring(3));
          break;
      }
      break;
    case "hexColours":
      // alter hex biome colour
      switch (button) {
        case "cancel":
          activeHexUI = "biomes";
          break;
        default:
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          updateHexBiome(button);
          break;
      }
      break;
    case "triColours":
      // alter tri biome colour
      switch (button) {
        case "cancel":
          activeHexUI = "tri";
          break;
        default:
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          updateTriBiome(button);
          break;
      }
      break;
    case "roads":
      // toggle roads
      switch (button) {
        case "cancel":
          activeHexUI = undefined;
          break;
        default:
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          updateRoads(Number(button.substring(4)));
          break;
      }
      break;
    case "aoi":
      // toggle aoi
      switch (button) {
        case "cancel":
          activeHexUI = undefined;
          break;
        default:
          prepHexForUpdate([activeHex[0], activeHex[1]]);
          updateAoi(Number(button.substring(3)));
          break;
      }
      break;
  }
}

function handleMenuButtonOutcome(button) {
  switch (button) {
    case "eye":
      ignoreFog = !ignoreFog;
      break;
    case "pencil":
      editMode = !editMode;
      if (!editMode) {
        activeHex = undefined;
        activeHexUI = undefined;
      }
      break;
    default:
      menuOpen = !menuOpen;
      break;
  }
}

function getHex(canvasX, canvasY) {
  let gotHex;
  let d = Infinity;

  hexCoords.forEach(hex => {
    let a = Math.abs(hex[2] - canvasX);
    let b = Math.abs(hex[3] - canvasY);
    let h = Math.sqrt((a*a)+(b*b));
    if (h < d) {
      gotHex = hex;
      d = h;
    }
  });

  return gotHex;
}

function getButton(canvasX, canvasY, uiCoords) {
  let gotButton = undefined;

  uiCoords.forEach(button => {
    let a = Math.abs(button[1] - canvasX);
    let b = Math.abs(button[2] - canvasY);
    let h = Math.sqrt((a*a)+(b*b));
    if (h <= buttonRadius) gotButton = button;
  });
  return gotButton;
}

/*
function updateHexAndSurrounds(hex, expanded) {
  let updateHexes = getSurroundingHexes(hex[0], hex[1], expanded);
  updateHexes.push([hex[0], hex[1]]);

  updateHexes.forEach(updateHex => {
    hexDetails = [];
    hexCoords.some(detailedHex => {
      if (detailedHex[0] == updateHex[0] && detailedHex[1] == updateHex[1]) {
        hexDetails = detailedHex;
        return true;
      }
    });
    drawHex(hexDetails[2], hexDetails[3], [hexDetails[0], hexDetails[1]], getHexBgColour(hexDetails[0], hexDetails[1]));
  });
}
*/

function getActiveHexUIList() {
  switch (activeHexUI) {
    case undefined:
      // first level of ui
      return ["cancel", "eye", "biomes", "roads", "aoi1"];
    case "eye":
      // toggle visibility ui
      return ["cancel", "biomes", "roads", "aoi1"];
    case "biomes":
      // alter biomes
      return ["cancel", "hex", "tri0"];
    case "tri":
      // alter tri
      return ["cancel", "tri0", "tri1", "tri2", "tri3", "tri4", "tri5"];
    case "hexColours":
      // alter hex biome colour
      return ["cancel", "plains", "forest", "swamp", "mountain", "snow", "desert", "water"];
    case "triColours":
      // alter tri biome colour
      return ["cancel", "plains", "forest", "swamp", "mountain", "snow", "desert", "water"];
    case "roads":
      // toggle roads
      return ["cancel", "road0", "road1", "road2", "road3", "road4", "road5"];
    case "aoi":
      // toggle aoi
      return ["cancel", "aoi0", "aoi1", "aoi2"];
  }
}

function getActiveMenuUIList() {
  return (menuOpen) ? ["cancel", "eye", "pencil"] : ["closed"];
}

function drawHexUI(x, y) {
  hexUICoords = [];
  let uiList = getActiveHexUIList();

  let buttonAngle = 2 * Math.PI / uiList.length;
  let buttonRingRadius = radius * 2;

  uiList.forEach((button, i) => {
    let xx = x + buttonRingRadius * Math.cos((buttonAngle * i) - angleOffset) * Math.sqrt(3)/2;
    let yy = y + buttonRingRadius * Math.sin((buttonAngle * i) - angleOffset) * Math.sqrt(3)/2;

    drawButton(xx, yy, button);
    ctx.strokeStyle = getHexButtonStateColour(button);
    ctx.stroke();

    hexUICoords.push([i, xx, yy]);
  });
}

function drawButton(x, y, button) {
  pathButtonOutline(x, y);
  ctx.fillStyle = 'white';
  ctx.fill();

  switch (button) {
    case "cancel":
      emojiFontStyle();
      ctx.fillText("🗙", x, y);
      break;
    case "eye":
      emojiFontStyle();
      ctx.fillText("👁️", x, y);
      break;
    case "pencil":
      emojiFontStyle();
      ctx.fillText("✏️", x, y);
      break;
    case "closed":
      emojiFontStyle();
      ctx.fillText("⚙️", x, y);
      break;
    case "biomes":
      drawBiomeObject(x, y, buttonRadius, ["forest", "plains", "plains", "plains", "water", "forest"]);
      break;
    case "hex":
      drawBiomeObject(x, y, buttonRadius, ["forest", "forest", "forest", "forest", "forest", "forest"]);
      break;
    case "aoi0":
      break;
    case "aoi1":
      drawAoiObject(x, y, 1);
      break;
    case "aoi2":
      drawAoiObject(x, y, 2);
      break;
    case "tri0":
      drawBiomeObject(x, y, buttonRadius, ["forest"]);
      break;
    case "tri1":
      drawBiomeObject(x, y, buttonRadius, ["", "forest"]);
      break;
    case "tri2":
      drawBiomeObject(x, y, buttonRadius, ["", "", "forest"]);
      break;
    case "tri3":
      drawBiomeObject(x, y, buttonRadius, ["", "", "", "forest"]);
      break;
    case "tri4":
      drawBiomeObject(x, y, buttonRadius, ["", "", "", "", "forest"]);
      break;
    case "tri5":
      drawBiomeObject(x, y, buttonRadius, ["", "", "", "", "", "forest"]);
      break;
    case "plains":
      ctx.fillStyle = getBiomeColour("plains");
      ctx.fill();
      break;
    case "forest":
      ctx.fillStyle = getBiomeColour("forest");
      ctx.fill();
      break;
    case "swamp":
      ctx.fillStyle = getBiomeColour("swamp");
      ctx.fill();
      break;
    case "mountain":
      ctx.fillStyle = getBiomeColour("mountain");
      ctx.fill();
      break;
    case "snow":
      ctx.fillStyle = getBiomeColour("snow");
      ctx.fill();
      break;
    case "desert":
      ctx.fillStyle = getBiomeColour("desert");
      ctx.fill();
      break;
    case "water":
      ctx.fillStyle = getBiomeColour("water");
      ctx.fill();
      break;
    case "roads":
      drawRoadObject(x, y, buttonRadius, [1,3]);
      break;
    case "road0":
      drawRoadObject(x, y, buttonRadius, [0]);
      break;
    case "road1":
      drawRoadObject(x, y, buttonRadius, [1]);
      break;
    case "road2":
      drawRoadObject(x, y, buttonRadius, [2]);
      break;
    case "road3":
      drawRoadObject(x, y, buttonRadius, [3]);
      break;
    case "road4":
      drawRoadObject(x, y, buttonRadius, [4]);
      break;
    case "road5":
      drawRoadObject(x, y, buttonRadius, [5]);
      break;
  }

  pathButtonOutline(x, y);
  ctx.lineWidth = radius/10;
}

function emojiFontStyle() {
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontsize = radius * 0.6;
  ctx.font = fontsize+"px Noto Emoji";
}

function pathButtonOutline(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, radius/2, 0, 2 * Math.PI, false);
  ctx.closePath();
}

function updateHexBiome(biome) {
  let hexName = getHexName([activeHex[0],activeHex[1]]);

  for (let i = 0; i < shapeType; i++) {
    mapDetails[hexName]['biomes']['value'][i] = biome;
  }
}

function updateTriBiome(biome) {
  let hexName = getHexName([activeHex[0],activeHex[1]]);

  mapDetails[hexName]['biomes']['value'][activeTri] = biome;
}

function updateRoads(road) {
  let hexName = getHexName([activeHex[0],activeHex[1]]);

  if (mapDetails[hexName]['roads']['value'].includes(road)) {
    mapDetails[hexName]['roads']['value'].splice(mapDetails[hexName]['roads']['value'].indexOf(road),1);
  } else {
    mapDetails[hexName]['roads']['value'].push(road);
  }
}

function updateAoi(aoi) {
  let hexName = getHexName([activeHex[0],activeHex[1]]);

  mapDetails[hexName]['aoi']['value'] = aoi;
}

function toggleVisibility(feature) {
  let hexName = getHexName([activeHex[0],activeHex[1]]);

  mapDetails[hexName][feature]['known'] = !mapDetails[hexName][feature]['known'];
}

function getHexButtonStateColour(button) {
  let hexName = getHexName([activeHex[0], activeHex[1]]);
  let colour = 'grey';

  switch (activeHexUI) {
    case "eye":
      // toggle visibility ui
      switch (button) {
        case "biomes":
          if (mapDetails[hexName]['biomes']['known']) colour = 'yellow';
          break;
        case "roads":
          if (mapDetails[hexName]['roads']['known']) colour = 'yellow';
          break;
        case "aoi1":
          if (mapDetails[hexName]['aoi']['known']) colour = 'yellow';
          break;
      }
      break;
    case "triColours":
      // alter tri biome colour
      switch (button) {
        case "cancel":
          break;
        default:
          if (mapDetails[hexName]['biomes']['value'][activeTri] == button) colour = 'yellow';
          break;
      }
      break;
    case "roads":
      // toggle roads
      switch (button) {
        case "cancel":
          break;
        default:
          if (mapDetails[hexName]['roads']['value'].includes(Number(button.substring(4)))) colour = 'yellow';
          break;
      }
      break;
    case "aoi":
      // toggle aoi
      switch (button) {
        case "cancel":
          break;
        default:
          if (mapDetails[hexName]['aoi']['value'] == Number(button.substring(3))) colour = 'yellow';
          break;
      }
      break;
  }

  return colour;
}

function getMenuButtonStateColour(button) {
  let colour = 'grey';

  switch (button) {
    case "eye":
      if (ignoreFog) colour = 'yellow';
      break;
    case "pencil":
      if (editMode) colour = 'yellow';
      break;
  }

  return colour;
}

function drawMenuUI() {
  menuUICoords = [];
  let uiList = getActiveMenuUIList();

  uiList.forEach((button, i) => {
    let x = canvas.width - (buttonRadius * 2.5* i) - (buttonRadius * 2);
    let y = buttonRadius * 2;

    drawButton(x, y, button);
    ctx.strokeStyle = getMenuButtonStateColour(button);
    ctx.stroke();

    menuUICoords.push([i, x, y]);
  });
}