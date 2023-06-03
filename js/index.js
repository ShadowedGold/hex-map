var zoom = 1;

var shapeType = 6;
var angle = 2 * Math.PI / shapeType;
var radius = 25 * zoom;

var mapHexOffset = [2,2];
var ignoreFog = true;

var canvas = document.createElement('canvas');

canvas.id = "hexCanvas";
canvas.width = window.innerWidth - 12;
canvas.height = window.innerHeight - 12;

document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

var dimensions = drawGrid();

function drawHex(x, y, num, colour) {
  ctx.beginPath();
  for (let i = 0; i < shapeType; i++) {
    let xx = x + radius * Math.cos(angle * i);
    let yy = y + radius * Math.sin(angle * i);
    ctx.lineTo(xx, yy);
  }
  ctx.closePath();
  ctx.lineWidth = radius/25;
  ctx.strokeStyle = 'dimgrey';
  ctx.stroke();
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.fillStyle = 'silver';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("["+num+"]", x, y);

  drawBiome(x, y, num);
  drawRoad(x, y, num);
  drawAoi(x, y, num);
}

function drawGrid() {
  let cols = Math.ceil(canvas.width/(radius * 1.5)) + 1;
  let rows = Math.ceil(canvas.height/(radius * Math.sin(angle) * 2)) + 1;
  let xOffset = canvas.width - ((cols-1) * radius * 1.5);
  let yOffset = canvas.height - ((rows-0.5) * radius * Math.sin(angle) * 2);
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      drawHex((radius * i * 1.5) + (xOffset / 2),
              (radius * Math.sin(angle) * (i % 2)) + (radius * j * Math.sin(angle) * 2) + (yOffset / 2),
              [i,j],
              (i == 0 || i == cols-1 || j == 0 || j == rows-1) ? "grey" : "darkgray");     
    }
  }

  return [cols, rows];
}

function getSurroundingHexes(x, y) {
  let hexSearchArr = [[-1, (x % 2) ? 0 : -1],
                      [-1, (x % 2) ? 1 :  0],
                      [ 0, -1],
                      [ 0,  1],
                      [ 1, (x % 2) ? 0 : -1],
                      [ 1, (x % 2) ? 1 :  0]];
  let hexFoundArr = [];

  for (let i = 0; i < 6; i++) {
    if (x + hexSearchArr[i][0] >= 0 &&
        x + hexSearchArr[i][0] <= dimensions[0] - 1 &&
        y + hexSearchArr[i][1] >= 0 &&
        y + hexSearchArr[i][1] <= dimensions[1] - 1) {
      hexFoundArr.push([x + hexSearchArr[i][0], y + hexSearchArr[i][1]]);
    }
  }

  return hexFoundArr;
}

function drawBiome(x, y, num) {
  let hexCoords = 'x' + (num[0] - mapHexOffset[0]) + 'y' + (num[1] - mapHexOffset[1]);
  if (mapDetails.hasOwnProperty(hexCoords) &&
     (mapDetails[hexCoords]['biomes']['known'] || ignoreFog)) {
    let biomeNodes = mapDetails[hexCoords]['biomes']['value'];

    for (let i = 0; i < biomeNodes.length; i++) {
      ctx.beginPath();
      ctx.lineTo(x, y);
      let xx = x + radius * Math.cos(angle * (i-2));
      let yy = y + radius * Math.sin(angle * (i-2));
      ctx.lineTo(xx, yy);
      xx = x + radius * Math.cos(angle * (i-1));
      yy = y + radius * Math.sin(angle * (i-1));
      ctx.lineTo(xx, yy);
      ctx.closePath();
      ctx.fillStyle = getBiomeColour(mapDetails[hexCoords]['biomes']['value'][i]);
      ctx.fill();
    }
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
  }
}

function drawRoad(x, y, num) {
  let hexCoords = 'x' + (num[0] - mapHexOffset[0]) + 'y' + (num[1] - mapHexOffset[1]);
  if (mapDetails.hasOwnProperty(hexCoords) &&
     (mapDetails[hexCoords]['roads']['known'] || ignoreFog)) {
    let roadNodes = mapDetails[hexCoords]['roads']['value'];

    for (let i = 0; i < roadNodes.length; i++) {
      ctx.beginPath();
      ctx.lineTo(x, y);
      let xx = x + radius * Math.cos(angle * (roadNodes[i]-1.5)) * Math.sqrt(3)/2;
      let yy = y + radius * Math.sin(angle * (roadNodes[i]-1.5)) * Math.sqrt(3)/2;
      ctx.lineTo(xx, yy);
      ctx.lineWidth = radius/10;
      ctx.strokeStyle = 'sienna';
      ctx.stroke();
    }
  }
}

function drawAoi(x, y, num) {
  let hexCoords = 'x' + (num[0] - mapHexOffset[0]) + 'y' + (num[1] - mapHexOffset[1]);
  if (mapDetails.hasOwnProperty(hexCoords) &&
     (mapDetails[hexCoords]['aoi']['known'] || ignoreFog)) {
    if (mapDetails[hexCoords]['aoi']['value'] != 0) {
      ctx.beginPath();
      ctx.arc(x, y, radius/5, 0, 2 * Math.PI, false)
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.lineWidth = radius/10;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
  }
}