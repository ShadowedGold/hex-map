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
  let cols = Math.ceil(canvas.width/(radius * 1.5));
  let rows = Math.ceil(canvas.height/(radius * Math.sin(angle) * 2)) + 1;
  let xOffset = canvas.width - ((cols-1) * radius * 1.5);
  let yOffset = canvas.height - ((rows-0.5) * radius * Math.sin(angle) * 2);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      drawHex((radius * i * 1.5) + (xOffset / 2),
              (radius * Math.sin(angle) * (i % 2)) + (radius * j * Math.sin(angle) * 2) + (yOffset / 2),
              "["+i+","+j+"]",
              (i == 0 || i == cols-1 || j == 0 || j == rows-1) ? "limegreen" : "greenyellow");     
    }
  }
}

drawGrid();
