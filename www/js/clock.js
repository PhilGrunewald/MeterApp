var clock = {


initClock: function(thisClock) {
  var clock = thisClock[0].getContext("2d");
  var r = thisClock.height()/2;
  clock.translate(r,r);
},

drawClock: function(thisClock,hour,minute,caption,subcaption) {
  var clk = thisClock[0].getContext("2d");
  var clockEdge = thisClock.height() * 0.08;
  var radius = (thisClock.height()/2) - (clockEdge /2);

  // face
  clock.drawFace(clk, radius, clockEdge);

  // hour
  hour=hour%12;
  hour=(hour*Math.PI/6)+(minute*Math.PI/(6*60));
  clock.drawHand(clk, hour, radius*0.5, clockEdge);

  // minute
  minute=(minute*Math.PI/30);
  clock.drawHand(clk, minute, radius*0.8, clockEdge*0.6);

  // caption

  //font-family:'HelveticaNeue-Light', 'HelveticaNeue', Helvetica, Arial, sans-serif;
  clk.textAlign="center";
  clk.font = radius*0.5 + "px HelveticaNeue-Light";
  clk.fillStyle = "green";

  if (subcaption == "back arrow") {
    clk.fillText(caption, 0, 0);
    clock.drawBackArrow(clk, radius*0.6, clockEdge);
  } else {
    clk.fillText(caption, 0, -radius*0.25);
    clk.fillText(subcaption, 0, radius*0.25);
  }
},

drawFace: function(ctx, radius, width) {
  ctx.beginPath();
  // the ring (inner white, grey edge);
  ctx.arc(0, 0 , radius, 0, 2*Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = width;
  ctx.stroke();
  // four ticks
  ctx.lineWidth = width/3;
  ctx.lineCap = "round";
  for(num= 0; num < 4; num++){
    ang = num * Math.PI / 2;
    ctx.rotate(ang);
    ctx.moveTo(0,radius*0.85);
    ctx.lineTo(0,radius);
    ctx.stroke();
    ctx.rotate(-ang);
  }
},

drawBackArrow: function(ctx,radius,width) {
  ctx.rotate(2/12*Math.PI);
  // arch
  ctx.lineWidth = width/3;
  ctx.strokeStyle = "green";
  ctx.beginPath();
  ctx.arc(0, 0 , radius, 0, 2/3*Math.PI);
  ctx.stroke();
  // arrow
  ctx.beginPath();
  ctx.fillStyle = "green";
  ctx.moveTo(radius,-5);
  ctx.lineTo(radius+12,+12);
  ctx.lineTo(radius-12,12);
  ctx.fill();
  ctx.rotate(-2/12*Math.PI);
},

drawHand: function(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
},
}
