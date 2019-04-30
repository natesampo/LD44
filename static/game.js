var socket = io();

var start;
var go;
var waiting = true;
var win = null;
var gameSpeed = 60;
var animationTime = 20;
var sprite = 0;
var cash = 0;
var shot = false;

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
var context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

var alive1 = new Image();
alive1.src = '/static/sprites/alive1.png';
var alive2 = new Image();
alive2.src = '/static/sprites/alive2.png';
var alive3 = new Image();
alive3.src = '/static/sprites/alive3.png';
var dead = new Image();
dead.src = '/static/sprites/dead.png';
var shoot = new Image();
shoot.src = '/static/sprites/shoot.png';
var alive = [alive1, alive2, alive3];

function render() {
  if(win == null) {
    context.save();
    context.translate(canvas.width/3, 0);
    context.scale(-1, 1);
    context.drawImage(alive[Math.floor(sprite/animationTime)], 0, canvas.height/2, alive[Math.floor(sprite/animationTime)].width*7, alive[Math.floor(sprite/animationTime)].height*7);
    context.restore();
    sprite = (sprite+1)%(animationTime*3);
    if(waiting == false) {
      context.drawImage(alive[Math.floor(sprite/animationTime)], 2*canvas.width/3 - shoot.width*3.5, canvas.height/2, alive[Math.floor(sprite/animationTime)].width*7, alive[Math.floor(sprite/animationTime)].height*7);
    }
  } else if(win) {
    context.save();
    context.translate(canvas.width/3, 0);
    context.scale(-1, 1);
    context.drawImage(shoot, 0, canvas.height/2, shoot.width*7, shoot.height*7);
    context.restore();
    if(waiting == false) {
      context.drawImage(dead, 2*canvas.width/3 - shoot.width*3.5, canvas.height/2, dead.width*7, dead.height*7);
    }
  } else {
    context.save();
    context.translate(canvas.width/3, 0);
    context.scale(-1, 1);
    context.drawImage(dead, 0, canvas.height/2, dead.width*7, dead.height*7);
    context.restore();
    if(waiting == false) {
      context.drawImage(shoot, 2*canvas.width/3 - shoot.width*3.5, canvas.height/2, shoot.width*7, shoot.height*7);
    }
  }
}

socket.on('join', function(startTime, goTime) {
  waiting = false;
});

socket.on('result', function(winner) {
  win = winner;
});

setInterval(function() {
  render();
}, 1000 / gameSpeed);

document.addEventListener('mousedown', function(event) {
  if(win == null && !waiting && !shot) {
    socket.emit('shoot', new Date());
    shot = true;
  }
});

document.addEventListener('keydown', function(event) {
  if(win == null && !waiting && !shot) {
    socket.emit('shoot', new Date());
    shot = true;
  }
});

socket.emit('new player');