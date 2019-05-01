var socket = io();

var start;
var go;
var restart = new Date();
var waiting = true;
var win = null;
var gameSpeed = 60;
var animationTime = 20;
var sprite = 0;
var cash = 0;
var shot = false;
var floorHeight = 0.563;

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
var context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

var sounds = [];
sounds.push(new Audio('/static/sounds/bird.mp3'));
sounds.push(new Audio('/static/sounds/horn.mp3'));
sounds.push(new Audio('/static/sounds/horse.mp3'));
sounds.push(new Audio('/static/sounds/wind.mp3'));
sounds.push(new Audio('/static/sounds/morewind.mp3'));

var gunshots = [];
gunshots.push(new Audio('/static/sounds/gunshot1.mp3'));
gunshots.push(new Audio('/static/sounds/gunshot2.mp3'));
gunshots.push(new Audio('/static/sounds/gunshot3.mp3'));
gunshots.push(new Audio('/static/sounds/gunshot4.mp3'));

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
var sun = new Image();
sun.src = '/static/sprites/sun.png';
var night = new Image();
night.src = '/static/sprites/night.png';
var cashSign = new Image();
cashSign.src = '/static/sprites/cash.png';
var plus = new Image();
plus.src = '/static/sprites/plus.png';
var alive = [alive1, alive2, alive3];
var numbers = [];

for(let i=0; i<10; i++) {
  var num = new Image();
  num.src = '/static/sprites/' + i + '.png';
  numbers.push(num);
}

function render() {
  if(go && start && new Date() - start >= go) {
    context.fillStyle = 'rgba(169, 232, 245, 1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sun, canvas.width/2 - sun.width*8.5, canvas.height/20, sun.width*14, sun.height*14);
  } else {
    context.fillStyle = 'rgba(255, 96, 5, 1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(night, canvas.width/2 - night.width*8.5, 0.43*canvas.height, night.width*14, night.height*14);
    context.fillStyle = 'rgba(' + (100 - 75*((i-0.58*canvas.height)/(floorHeight*canvas.height))) + ', 0, ' + (130 - 100*((i-0.58*canvas.height)/(floorHeight*canvas.height))) + ')';
  }

  for(var i=floorHeight*canvas.height; i<canvas.height; i+=canvas.height/100) {
    if(go && start && new Date() - start >= go) {
      context.fillStyle = 'rgba(' + (192 - 120*((i-0.58*canvas.height)/(floorHeight*canvas.height))) + ', ' + (162 - 110*((i-0.58*canvas.height)/(floorHeight*canvas.height))) + ', ' + (120 - 100*((i-0.58*canvas.height)/(floorHeight*canvas.height))) + ')';
    }
    else {
      context.fillStyle = 'rgba(' + (150 - 130*((i-0.58*canvas.height)/(floorHeight*canvas.height))) + ', 10, ' + (180 - 150*((i-0.58*canvas.height)/(floorHeight*canvas.height))) + ')';
    }
    context.fillRect(0, i, canvas.width, canvas.height/100 + 1);
  }

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

  context.drawImage(cashSign, canvas.width/80, canvas.height/40, cashSign.width*5, cashSign.height*5);

  var tempCash = ''+cash;
  for(var i=0; i<tempCash.length; i++) {
    context.drawImage(numbers[tempCash[i]], canvas.width/80 + cashSign.width*5 + i*numbers[tempCash[i]].width*5, canvas.height/40, numbers[tempCash[i]].width*5, numbers[tempCash[i]].height*5);
  }

  if(win) {
    context.drawImage(plus, canvas.width/80, canvas.height/40 + cashSign.height*5, plus.width*5, plus.height*5);
    context.drawImage(numbers[1], canvas.width/80 + plus.width*5, canvas.height/40 + cashSign.height*5, numbers[1].width*5, numbers[1].height*5);
  }
}

socket.on('join', function(startTime, goTime) {
  waiting = false;
  start = new Date(startTime);
  go = goTime;
});

socket.on('result', function(winner) {
  win = winner;

  if(winner) {
    cash += 1;
  }

  gunshots[Math.floor(Math.random()*4)].play();

  restart = new Date();
});

setInterval(function() {
  canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;

  if(win != null && new Date() - restart > 1500) {
    waiting = true;
    win = null;
    shot = false;
    socket.emit('end');
  }

  if(Math.floor(Math.random()*300) == 1) {
    sounds[Math.floor(Math.random()*5)].play();
  }

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