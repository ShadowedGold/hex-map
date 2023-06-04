function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - 1;
  const y = event.clientY - rect.top - 1;

  if (activeHex != undefined) {
    // a hex is active, look at buttons
    var button = getButton(x, y);
    if (button != undefined) {
      // if button hit...
      updateHexAndSurrounds(activeHex, true);
      if (button[0] == 0 && activeUI == undefined) {
        // if cancel button hit...
        // if top level of UI...
        // hex no longer active
        activeHex = undefined;
      } else {
        handleButtonOutcome(getActiveUIList()[button[0]]);
        drawHex(activeHex[2], activeHex[3], [activeHex[0], activeHex[1]], getHexBgColour(activeHex[0], activeHex[1]), "yellow");
        drawUI(activeHex[2], activeHex[3]);
      }
    }
  } else {
    // a hex is not active, set active hex
    var hex = getHex(x, y);
    activeHex = hex;
    drawHex(hex[2], hex[3], [hex[0], hex[1]], getHexBgColour(hex[0], hex[1]), "yellow");
    drawUI(hex[2], hex[3]);
  }
}

function handleButtonOutcome(button) {
  switch (activeUI) {
    case undefined:
      // first level of ui
      switch (button) {
        case "eye":
          activeUI = "eye";
          break;
        case "biomes":
          activeUI = "biomes";
          break;
        case "roads":
          activeUI = "roads";
          break;
        case "aoi1":
          activeUI = "aoi";
          break;
      }
      break;
    case "eye":
      // toggle visibility ui
      switch (button) {
        case "cancel":
          activeUI = undefined;
          break;
        case "biomes":
          // toggle biome visibility
          break;
        case "roads":
          // toggle roads visibility
          break;
        case "aoi1":
          // toggle aoi visibility
          break;
      }
      break;
    case "biomes":
      // alter biomes
      switch (button) {
        case "cancel":
          activeUI = undefined;
          break;
        case "hex":
          activeUI = "hexColours";
          break;
        case "tri0":
          activeUI = "tri";
          break;
      }
      break;
    case "tri":
      // alter tri
      switch (button) {
        case "cancel":
          activeUI = "biomes";
          break;
        default:
          activeUI = "triColours";
          // pass button to something
          break;
      }
      break;
    case "hexColours":
      // alter hex biome colour
      switch (button) {
        case "cancel":
          activeUI = "biomes";
          break;
        default:
          // pass button to something
          break;
      }
      break;
    case "triColours":
      // alter tri biome colour
      switch (button) {
        case "cancel":
          activeUI = "tri";
          break;
        default:
          // pass button to something
          break;
      }
      break;
    case "roads":
      // toggle roads
      switch (button) {
        case "cancel":
          activeUI = undefined;
          break;
        default:
          updateRoads(button);
          break;
      }
      break;
    case "aoi":
      // toggle aoi
      switch (button) {
        case "cancel":
          activeUI = undefined;
          break;
        default:
          updateAoi(button);
          break;
      }
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

function getButton(canvasX, canvasY) {
  let gotButton = undefined;

  uiCoords.forEach(button => {
    let a = Math.abs(button[1] - canvasX);
    let b = Math.abs(button[2] - canvasY);
    let h = Math.sqrt((a*a)+(b*b));
    if (h <= buttonRadius) gotButton = button;
  });
  return gotButton;
}

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

function getActiveUIList() {
  switch (activeUI) {
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

function drawUI(x, y) {
  uiCoords = [];
  let uiList = getActiveUIList();

  let buttonAngle = 2 * Math.PI / uiList.length;
  let buttonRingRadius = radius * 2;

  uiList.forEach((button, i) => {
    let xx = x + buttonRingRadius * Math.cos((buttonAngle * i) - angleOffset) * Math.sqrt(3)/2;
    let yy = y + buttonRingRadius * Math.sin((buttonAngle * i) - angleOffset) * Math.sqrt(3)/2;

    pathButtonOutline(xx, yy);
    ctx.fillStyle = 'white';
    ctx.fill();
    drawButton(xx, yy, button);
    pathButtonOutline(xx, yy);
    ctx.lineWidth = radius/10;
    ctx.strokeStyle = 'grey';
    ctx.stroke();

    uiCoords.push([i, xx, yy]);
  });
}

function drawButton(x, y, button) {
  switch (button) {
    case "cancel":
      emojiFontStyle();
      ctx.fillText("🗙", x, y);
      break;
    case "eye":
      emojiFontStyle();
      ctx.fillText("👁️", x, y);
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
}

function emojiFontStyle() {
  let fontsize = radius * 0.6;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = fontsize+"px Noto Emoji";
}

function pathButtonOutline(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, radius/2, 0, 2 * Math.PI, false);
  ctx.closePath();
}

function updateHexBiome(biome) {

}

function updateTriBiome(biome) {

}

function updateRoads(road) {

}

function updateAoi(aoi) {

}