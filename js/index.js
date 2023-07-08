// input tracking for drag & pinch
var startInputPos;
var endInputPos;
var dragging = false;
var multiTouch = {
  active: false,
  h: 0.0
};

// viewport setup
var padding = 5;
setUpViewport();

// canvas setup
var canvas = document.createElement('canvas');

canvas.id = "hexCanvas";
canvas.style.borderWidth = window.devicePixelRatio+"px";
canvas.width = window.innerWidth - ((padding + 1) * 2 * window.devicePixelRatio);
canvas.height = window.innerHeight - ((padding + 1) * 2 * window.devicePixelRatio);
canvas.addEventListener('mousedown', handleInputPosition);
canvas.addEventListener('touchstart', handleInputPosition);
canvas.addEventListener('touchmove', handleInputPosition);
canvas.addEventListener('mouseup', handleInputPosition);
canvas.addEventListener('touchend', handleInputPosition);

document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

// hex setup
var shapeType = 6;
var angle = 2 * Math.PI / shapeType;
var angleOffset = 2 * Math.PI / 4;
var radius = getRadius();
var buttonRadius = radius / 2;

// supporting vars to draw and track state for grid and ui
var dimensions = getDimensions();
var offsets = getOffsets();
var hexCoords = [];
var hexUICoords = [];
var menuUICoords = [];
var activeHex = undefined;
var activeHexUI = undefined;
var activeTri = undefined;
var menuOpen = false;
var fogTransparency = 0.50;

// initialisation
loadMapDetails();
drawGrid();
drawMenuUI();
window.onresize = handleResize;
window.onwheel = handleWheel;

function getRadius() {
  return 25 * zoom * window.devicePixelRatio * mobileMultiplier();
}

function mobileMultiplier() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i
  ];

  const isMobile = toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });

  return (isMobile) ? 1.25 : 1;
}

function getDimensions() {
  let cols = Math.ceil(canvas.width/(radius * 1.5)) + 1;
  let rows = Math.ceil(canvas.height/(radius * Math.sin(angle) * 2)) + 1;

  return {cols: cols, rows: rows};
}

function getOffsets() {
  let x = (canvas.width - ((dimensions.cols-1) * radius * 1.5)) / 2;
  let y = (canvas.height - ((dimensions.rows-0.5) * radius * Math.sin(angle) * 2)) / 2;

  return {x: x, y: y};
}

function setUpViewport() {
  let scale = 1 / window.devicePixelRatio;
  let viewport = document.createElement('meta');
  viewport.name = "viewport";
  viewport.content = "width=device-width, minimum-scale="+scale+", maximum-scale="+scale;
  document.getElementsByTagName('head')[0].appendChild(viewport);

  document.getElementsByTagName('body')[0].style.padding = (padding * window.devicePixelRatio)+"px";
}

function updateActiveHexXY() {
  hexCoords.some(hex => {
    if (activeHex[0] == hex[0] && activeHex[1] == hex[1]) {
      activeHex[2] = hex[2];
      activeHex[3] = hex[3];
      return true;
    }
  });
}

function redrawAll(activeHexXYChanged) {
  drawGrid();
  if (activeHex != undefined) {
    if (activeHexXYChanged) updateActiveHexXY();
    drawActiveHexAndUI();
  }
  drawMenuUI();
}

function drawHex(x, y, num, colour, highlight) {
  pathHex(x, y);
  ctx.lineWidth = radius/25;
  ctx.strokeStyle = 'dimgrey';
  ctx.stroke();
  ctx.fillStyle = colour;
  ctx.fill();

  if (!biomeVisible(num)) drawHexCoordsText(x, y, num, 'silver');
  
  drawBiome(x, y, num);
  drawRoad(x, y, num);
  drawAoi(x, y, num);

  if (showCoords && biomeVisible(num)) drawHexCoordsText(x, y, num, 'black', 'white');

  drawHighlight(x, y, highlight);
}

function drawHexCoordsText(x, y, num, colour, strokeColour) {
  ctx.fillStyle = colour;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontsize = radius * 0.4;
  ctx.font = fontsize+"px sans-serif";
  let text = "["+(num[0] - mapHexOffset[0])+","+(num[1] - mapHexOffset[1])+"]";

  if (strokeColour != undefined) {
    ctx.lineWidth = radius * 0.05;
    ctx.strokeStyle = strokeColour;
    ctx.strokeText(text, x, y);
  }

  ctx.fillText(text, x, y);
}

function pathHex(x, y) {
  ctx.beginPath();
  for (let i = 0; i < shapeType; i++) {
    let xx = x + radius * Math.cos(angle * i);
    let yy = y + radius * Math.sin(angle * i);
    ctx.lineTo(xx, yy);
  }
  ctx.closePath();
}

function getHexBgColour(col, row) {
  return (col == 0 || col == dimensions.cols-1 || row == 0 || row == dimensions.rows-1) ? "grey" : "darkgray";
}

function drawGrid() {
  hexCoords = [];
  for (let i = 0; i < dimensions.cols; i++) {
    for (let j = 0; j < dimensions.rows; j++) {
      let x = (radius * i * 1.5) + offsets.x;
      let y = (radius * Math.sin(angle) * (i % 2)) + (radius * j * Math.sin(angle) * 2) + offsets.y;
      let adjJ = (mapHexOffset[0] % 2 && !(i % 2)) ? j-1 : j;
      drawHex(x, y, [i, adjJ], getHexBgColour(i, j));
      hexCoords.push([i, adjJ, x, y]);
    }
  }
}

/*
function getSurroundingHexes(col, row, expanded) {
  let hexSearchArr = [[-1, (col % 2) ? 0 : -1],
                      [-1, (col % 2) ? 1 :  0],
                      [ 0, -1],
                      [ 0,  1],
                      [ 1, (col % 2) ? 0 : -1],
                      [ 1, (col % 2) ? 1 :  0]];
  let expandedSearchArr = [[-2, -1],
                           [-2,  0],
                           [-2,  1],
                           [-1, (col % 2) ? -1 : -2],
                           [-1, (col % 2) ?  2 :  1],
                           [ 0, -2],
                           [ 0,  2],
                           [ 1, (col % 2) ? -1 : -2],
                           [ 1, (col % 2) ?  2 :  1],
                           [ 2, -1],
                           [ 2,  0],
                           [ 2,  1]];
  let hexFoundArr = [];

  if (expanded) {
    hexSearchArr.push(...expandedSearchArr);
  }

  for (let i = 0; i < hexSearchArr.length; i++) {
    if (col + hexSearchArr[i][0] >= 0 &&
        col + hexSearchArr[i][0] <= dimensions.cols - 1 &&
        row + hexSearchArr[i][1] >= 0 &&
        row + hexSearchArr[i][1] <= dimensions.rows - 1) {
      hexFoundArr.push([col + hexSearchArr[i][0], row + hexSearchArr[i][1]]);
    }
  }

  return hexFoundArr;
}
*/

function getHexName(num) {
  return 'x' + (num[0] - mapHexOffset[0]) + 'y' + (num[1] - mapHexOffset[1]);
}

function biomeVisible(num) {
  let hexName = getHexName(num);
  if ((mapDetails.data.hasOwnProperty(hexName) &&
       !mapDetails.data[hexName]['biomes']['known'] &&
       ignoreFog) ||
      (mapDetails.data.hasOwnProperty(hexName) &&
       mapDetails.data[hexName]['biomes']['known'])) {
    return true;
  } else return false;
}

function drawBiome(x, y, num) {
  let hexName = getHexName(num);
  if (mapDetails.data.hasOwnProperty(hexName) &&
     (mapDetails.data[hexName]['biomes']['known'] || ignoreFog)) {
    let biomeNodes = mapDetails.data[hexName]['biomes']['value'];

    if (!mapDetails.data[hexName]['biomes']['known']) ctx.globalAlpha = fogTransparency;
    drawBiomeObject(x, y, radius, biomeNodes);
    ctx.globalAlpha = 1;
  }
}

function drawBiomeObject(x, y, r, biomeNodes) {
  for (let i = 0; i < biomeNodes.length; i++) {
    ctx.beginPath();
    ctx.lineTo(x, y);
    let xx = x + r * Math.cos(angle * (i-2));
    let yy = y + r * Math.sin(angle * (i-2));
    ctx.lineTo(xx, yy);
    xx = x + r * Math.cos(angle * (i-1));
    yy = y + r * Math.sin(angle * (i-1));
    ctx.lineTo(xx, yy);
    ctx.closePath();
    ctx.fillStyle = getBiomeColour(biomeNodes[i]);
    ctx.fill();
  }
}

function getBiomeColour(biome) {
  switch (biome) {
    case "plains":
      return "greenyellow";
    case "swamp":
      return "darkseagreen";
    case "forest":
      return "limegreen";
    case "mountain":
      return "gainsboro";
    case "water":
      return "dodgerblue";
    case "desert":
      return "tan";
    case "snow":
      return "azure";
    default:
      return "white";
  }
}

function drawRoad(x, y, num) {
  let hexName = getHexName(num);
  if (mapDetails.data.hasOwnProperty(hexName) &&
     (mapDetails.data[hexName]['roads']['known'] || ignoreFog)) {
    let roadNodes = mapDetails.data[hexName]['roads']['value'];
    
    if (!mapDetails.data[hexName]['roads']['known']) ctx.globalAlpha = fogTransparency;
    drawRoadObject(x, y, radius, roadNodes);
    ctx.globalAlpha = 1;
  }
}

function drawRoadObject(x, y, r, roadNodes, opt) {
  for (let i = 0; i < roadNodes.length; i++) {
    ctx.beginPath();
    ctx.lineTo(x, y);
    let xx = x + r * Math.cos(angle * (roadNodes[i]-1.5)) * Math.sqrt(3)/2;
    let yy = y + r * Math.sin(angle * (roadNodes[i]-1.5)) * Math.sqrt(3)/2;
    ctx.lineTo(xx, yy);
    if (r == radius) ctx.lineWidth = radius/10;
    else if (opt == undefined) ctx.lineWidth = buttonRadius*2/10;
    else ctx.lineWidth = buttonRadius/10;
    ctx.strokeStyle = 'sienna';
    ctx.stroke();
  }
}

function drawAoi(x, y, num) {
  let hexName = getHexName(num);
  if (mapDetails.data.hasOwnProperty(hexName) &&
     (mapDetails.data[hexName]['aoi']['known'] || ignoreFog)) {
    if (mapDetails.data[hexName]['aoi']['value'] != 0) {
      if (!mapDetails.data[hexName]['aoi']['known']) ctx.globalAlpha = fogTransparency;
      drawAoiObject(x, y, radius, mapDetails.data[hexName]['aoi']['value']);
      ctx.globalAlpha = 1;
    }
  }
}

function drawAoiObject(x, y, r, value) {
  let colour = "";
  switch (value) {
    case 1:
      colour = "red";
      break;
    case 2:
      colour = "blueviolet";
      break;
    default:
      colour = "black";
      break;
  }

  ctx.beginPath();
  ctx.arc(x, y, r/5, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.lineWidth = r/10;
  ctx.strokeStyle = colour;
  ctx.stroke();
}

function drawHighlight(x, y, highlight) {
  if (highlight != undefined) {
    pathHex(x, y);
    ctx.lineWidth = radius/10;
    ctx.strokeStyle = highlight;
    ctx.stroke();
  }
}

/*
function drawTest(text) {
  ctx.beginPath();
  ctx.rect(buttonRadius, buttonRadius, buttonRadius*6, buttonRadius)
  ctx.strokeStyle = 'dimgrey';
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.fill();

  if (multiTouch.active) {
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let fontsize = buttonRadius;
    ctx.font = fontsize+"px sans-serif";
    ctx.fillText(text, buttonRadius, buttonRadius);
  }
}
*/