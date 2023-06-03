var zoom = 1;

var shapeType = 6;
var angle = 2 * Math.PI / shapeType;
var radius = 25;

var canvas = document.createElement('canvas');

canvas.id = "hexCanvas";
canvas.width = window.innerWidth - 12;
canvas.height = window.innerHeight - 12;

document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

function drawHex(x, y, num, colour) {
  ctx.beginPath();
  for (let i = 0; i < shapeType; i++) {
    let xx = x + radius * Math.cos(angle * i);
    let yy = y + radius * Math.sin(angle * i);
    ctx.lineTo(xx, yy);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(num, x, y);
}

function drawGrid() {
  let cols = Math.ceil(canvas.width/(radius * 3));
  let rows = Math.ceil(canvas.height/(radius * Math.sin(angle)))+1;
  let xOffset = canvas.width - ((cols-0.5) * radius * 3);
  let yOffset = canvas.height - ((rows-1) * radius * Math.sin(angle));
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      drawHex((radius * (1 + Math.cos(angle)) * (j % 2)) + (radius * i * 3) + (xOffset / 2),
              (radius * j * Math.sin(angle)) + (yOffset / 2),
              "["+i+","+j+"]",
              (i == 0 || i == cols-1 || j == 0 || j == rows-1) ? "limegreen" : "greenyellow");     
    }
  }
}

drawGrid();
