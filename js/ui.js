function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - 1;
  const y = event.clientY - rect.top - 1;
  
  let hex = getHex(x, y);
  
  if (activeHex != hex) {
    if (activeHex != undefined) {
      updateHexAndSurrounds(activeHex);
      activeHex = hex;
      drawHex(hex[2], hex[3], [hex[0], hex[1]], getHexBgColour(hex[0], hex[1]), "yellow");
      //console.log("activehex now ["+[hex[0],hex[1]]+"]");
    } else {
      activeHex = hex;
      drawHex(hex[2], hex[3], [hex[0], hex[1]], getHexBgColour(hex[0], hex[1]), "yellow");
      //console.log("activehex undefined, now ["+[hex[0],hex[1]]+"]");
    }
  } else {
    activeHex = undefined;
    updateHexAndSurrounds(hex);
    //console.log("reset ["+[hex[0],hex[1]]+"]");
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

function updateHexAndSurrounds(hex) {
  let updateHexes = getSurroundingHexes(hex[0], hex[1]);
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