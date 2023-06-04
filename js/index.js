var zoom = 1;

var shapeType = 6;
var angle = 2 * Math.PI / shapeType;
var angleOffset = 2 * Math.PI / 4;
var radius = 25 * zoom;
var buttonRadius = radius / 2;

var mapHexOffset = [2,2];
var ignoreFog = true;

var canvas = document.createElement('canvas');

canvas.id = "hexCanvas";
canvas.width = window.innerWidth - 12;
canvas.height = window.innerHeight - 12;
canvas.addEventListener('mousedown', function(e) {
  getCursorPosition(canvas, e);
});

document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

var dimensions = getDimensions();
var offsets = getOffsets();
var hexCoords = [];
var uiCoords = [];
var activeHex = undefined;
var activeUI = undefined;
var activeTri = undefined;

drawGrid();

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

function drawHex(x, y, num, colour, highlight) {
  pathHex(x, y);
  ctx.lineWidth = radius/25;
  ctx.strokeStyle = 'dimgrey';
  ctx.stroke();
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.fillStyle = 'silver';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontsize = radius * 0.4;
  ctx.font = fontsize+"px sans-serif";
  ctx.fillText("["+num+"]", x, y);

  drawBiome(x, y, num);
  drawRoad(x, y, num);
  drawAoi(x, y, num);
  drawHighlight(x, y, highlight);
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
      drawHex(x, y, [i,j], getHexBgColour(i, j));
      hexCoords.push([i,j,x,y]);
    }
  }
}

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

function getHexName(num) {
  return 'x' + (num[0] - mapHexOffset[0]) + 'y' + (num[1] - mapHexOffset[1]);
}

function drawBiome(x, y, num) {
  let hexName = getHexName(num);
  if (mapDetails.hasOwnProperty(hexName) &&
     (mapDetails[hexName]['biomes']['known'] || ignoreFog)) {
    let biomeNodes = mapDetails[hexName]['biomes']['value'];

    drawBiomeObject(x, y, radius, biomeNodes);
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
  if (mapDetails.hasOwnProperty(hexName) &&
     (mapDetails[hexName]['roads']['known'] || ignoreFog)) {
    let roadNodes = mapDetails[hexName]['roads']['value'];

    drawRoadObject(x, y, radius, roadNodes);
  }
}

function drawRoadObject(x, y, r, roadNodes) {
  for (let i = 0; i < roadNodes.length; i++) {
    ctx.beginPath();
    ctx.lineTo(x, y);
    let xx = x + r * Math.cos(angle * (roadNodes[i]-1.5)) * Math.sqrt(3)/2;
    let yy = y + r * Math.sin(angle * (roadNodes[i]-1.5)) * Math.sqrt(3)/2;
    ctx.lineTo(xx, yy);
    ctx.lineWidth = radius/10;
    ctx.strokeStyle = 'sienna';
    ctx.stroke();
  }
}

function drawAoi(x, y, num) {
  let hexName = getHexName(num);
  if (mapDetails.hasOwnProperty(hexName) &&
     (mapDetails[hexName]['aoi']['known'] || ignoreFog)) {
    if (mapDetails[hexName]['aoi']['value'] != 0) {
      drawAoiObject(x, y, mapDetails[hexName]['aoi']['value']);
    }
  }
}

function drawAoiObject(x, y, value) {
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
  ctx.arc(x, y, radius/5, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.lineWidth = radius/10;
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