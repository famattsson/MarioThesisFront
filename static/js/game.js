
var requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

//create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
var updateables = [];
var fireballs = [];
var player = new Mario.Player([0,0]);
var pathPrefix = "../static/"

//we might have to get the size and calculate the scaling
//but this method should let us make it however big.
//Cool!
//TODO: Automatically scale the game to work and look good on widescreen.
//TODO: fiddling with scaled sprites looks BETTER, but not perfect. Hmm.
canvas.width = 762;
canvas.height = 720;
ctx.scale(3,3);
document.body.appendChild(canvas);

var JUMP_KEY = 87
var LEFT_KEY = 65
var RIGHT_KEY = 68
var DOWN_KEY = 83
var RUN_KEY = 16

//viewport
var vX = 0,
    vY = 0,
    vWidth = 256,
    vHeight = 240;

//load our images
resources.load([
  pathPrefix+'sprites/player.png',
  pathPrefix+'sprites/enemy.png',
  pathPrefix+'sprites/tiles.png',
  pathPrefix+'sprites/playerl.png',
  pathPrefix+'sprites/items.png',
  pathPrefix+'sprites/enemyr.png',
]);

resources.onReady(init);
var level;
var sounds;
var music;
//initializeg
var lastTime;
var currentLevelIndex = 0;
var prevLevelIndex = 0;
var currentLevelType;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function processQualityForm(e) {
  if (e.preventDefault) e.preventDefault();

  var form = e.target
  let enjoyment = form.elements["Enjoyment"].value
  let aesthetics = form.elements["Aesthetics"].value
  let difficulty = form.elements["Difficulty"].value
  let levelName = LevelsJson[currentLevelIndex].name
  if (enjoyment && levelName.toString() && difficulty && aesthetics) {
    currentLevelIndex++;
    setCookie("levelIndex", currentLevelIndex, 365)
    let UUID = getCookie("UUID")
    //Send data to database through API
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"PlayerId":UUID,"LevelName":levelName,"Enjoyment":enjoyment,"Aesthetics":aesthetics,"Difficulty":difficulty});

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://mario-thesis.ew.r.appspot.com/ratings", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));


    document.getElementById("QualityFormDiv").style.visibility = "hidden"
    menuActive = false
    form.reset()
  } else {
    alert("Please leave no fields empty")
  }

  return false;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getLevelOrder() {
  var levelOrder = []
  for (const levelIndex in LevelsJson) {
    levelOrder.push(LevelsJson[levelIndex].name)
  }
  return levelOrder
}

function orderLevels (levelOrder) {
  var orderedLevelsJson = []
  levelOrder = levelOrder.split(",")
  for (const index in levelOrder) {
    let name = levelOrder[index]
    for (const levelIndex in LevelsJson) {
      let level = LevelsJson[levelIndex]
      if(level.name == name) {
        orderedLevelsJson.push(level)
        break
      }
    }
  }
  LevelsJson = orderedLevelsJson
}

function processBackgroundForm(e) {
  if (e.preventDefault) e.preventDefault();

  const form = e.target
  let age = form.elements["Age"].value
  let gender = form.elements["Gender"].value
  let experience = form.elements["GamingExperience"].value

  if(age && gender && experience) {
    let UUID = uuidv4()

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"PlayerId":UUID,"Gender":gender,"Age":age,"GamingExperience":experience});

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://mario-thesis.ew.r.appspot.com/players", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    setCookie("UUID", UUID, 365)
    backgroundInfoProvided = true
    document.getElementById("BackgroundFormDiv").style.visibility = "hidden"
    menuActive = false
  } else {
    alert("Please leave no fields empty")
  }
  //send to database and wait for ok.

  return false;
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function initPlayer() {
  var backgroundInfoDiv = document.getElementById("BackgroundFormDiv")
  let introDiv = document.getElementById("introDiv")
  introDiv.style.visibility = "visible"
  menuActive = true
  backgroundInfoDiv.style.visibility = "visible"
}

var backgroundInfoProvided = false;

function init() {
  music = {
    overworld: new Audio(pathPrefix+'sounds/aboveground_bgm.ogg'),
    underground: new Audio(pathPrefix+'sounds/underground_bgm.ogg'),
    clear: new Audio(pathPrefix+'sounds/stage_clear.wav'),
    death: new Audio(pathPrefix+'sounds/mariodie.wav')
  };
  sounds = {
    smallJump: new Audio(pathPrefix+'sounds/jump-small.wav'),
    bigJump: new Audio(pathPrefix+'sounds/jump-super.wav'),
    breakBlock: new Audio(pathPrefix+'sounds/breakblock.wav'),
    bump: new Audio(pathPrefix+'sounds/bump.wav'),
    coin: new Audio(pathPrefix+'sounds/coin.wav'),
    fireball: new Audio(pathPrefix+'sounds/fireball.wav'),
    flagpole: new Audio(pathPrefix+'sounds/flagpole.wav'),
    kick: new Audio(pathPrefix+'sounds/kick.wav'),
    pipe: new Audio(pathPrefix+'sounds/pipe.wav'),
    itemAppear: new Audio(pathPrefix+'sounds/itemAppear.wav'),
    powerup: new Audio(pathPrefix+'sounds/powerup.wav'),
    stomp: new Audio(pathPrefix+'sounds/stomp.wav')
  };
  if(getCookie("UUID") == "") {
    shuffleArray(LevelsJson)
    setCookie("LevelsOrder", getLevelOrder(), 365)
  } else {
    orderLevels(getCookie("LevelsOrder"))
  }
  for (let i = 0; i < introLevels.length; i++) {
    LevelsJson.unshift(introLevels[i])
  }

  if (getCookie("levelIndex") == "") {
    setCookie("levelIndex", currentLevelIndex, 365)
  } else {
    currentLevelIndex = getCookie("levelIndex")
  }

  var qaulityForm = document.getElementById('QualityForm');
  if (qaulityForm.attachEvent) {
    qaulityForm.attachEvent("submit", processQualityForm);
  } else {
    qaulityForm.addEventListener("submit", processQualityForm);
  }

  var backgroundForm = document.getElementById('BackgroundForm');
  if (backgroundForm.attachEvent) {
    backgroundForm.attachEvent("submit", processBackgroundForm);
  } else {
    backgroundForm.addEventListener("submit", processBackgroundForm);
  }

  if (getCookie("UUID") == "") {
    initPlayer()
  } else {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch("https://mario-thesis.ew.r.appspot.com/players", requestOptions)
        .then(response => response.text())
        .then(result => {if(!checkPlayer(result)) {initPlayer()}})
        .catch(error => console.log('error', error));
    backgroundInfoProvided = true
  }

  Mario.nextlevel();

  lastTime = Date.now();

  main();
}

function checkPlayer(players) {
  let playersJSON = JSON.parse(players)
  for (let i = 0; i < playersJSON.length ; i++) {
    if (playersJSON[i].Playerid == getCookie("UUID")) {
      return true
    }
  }
  return false
}

var gameTime = 0;
var menuActive = false

//set up the game loop
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
}

function update(dt) {
  if (!menuActive) {
    if(currentLevelIndex !=  LevelsJson.length) {
      document.getElementById("CurrentLevelInfo").innerText = "Level Name: " + LevelsJson[currentLevelIndex].name + " | " + "Levels completed: " + (currentLevelIndex).toString() + " out of " + LevelsJson.length
    }
    gameTime += dt;

    handleInput(dt);
    updateEntities(dt, gameTime);

    checkCollisions();
  }
}

function handleInput(dt) {
  if (player.piping || player.dying || player.noInput) return; //don't accept input

  if (input.isDown('RUN')){
    player.run();
  } else {
    player.noRun();
  }
  if (input.isDown('JUMP')) {
    player.jump();
  } else {
    //we need this to handle the timing for how long you hold it
    player.noJump();
  }

  if (input.isDown('DOWN')) {
    player.crouch();
  } else {
    player.noCrouch();
  }

  if (input.isDown('LEFT')) { // 'd' or left arrow
    player.moveLeft();
  }
  else if (input.isDown('RIGHT')) { // 'k' or right arrow
    player.moveRight();
  } else {
    player.noWalk();
  }
}

//update all the moving stuff
function updateEntities(dt, gameTime) {
  player.update(dt, vX);
  updateables.forEach (function(ent) {
    ent.update(dt, gameTime);
  });

  //This should stop the jump when he switches sides on the flag.
  if (player.exiting) {
    if (player.pos[0] > vX + 96)
      vX = player.pos[0] - 96
  }else if (level.scrolling && player.pos[0] > vX + 80) {
    vX = player.pos[0] - 80;
  }

  if (player.powering.length !== 0 || player.dying) { return; }
  level.items.forEach (function(ent) {
    ent.update(dt);
  });

  level.enemies.forEach (function(ent) {
    ent.update(dt, vX);
  });

  fireballs.forEach(function(fireball) {
    fireball.update(dt);
  });
  level.pipes.forEach (function(pipe) {
    pipe.update(dt);
  });
}

//scan for collisions
function checkCollisions() {
  if (player.powering.length !== 0 || player.dying) { return; }
  player.checkCollisions();

  //Apparently for each will just skip indices where things were deleted.
  level.items.forEach(function(item) {
    item.checkCollisions();
  });
  level.enemies.forEach (function(ent) {
    ent.checkCollisions();
  });
  fireballs.forEach(function(fireball){
    fireball.checkCollisions();
  });
  level.pipes.forEach (function(pipe) {
    pipe.checkCollisions();
  });
}

//draw the game!
function render() {
  updateables = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = level.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //scenery gets drawn first to get layering right.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.scenery[i][j]) {
        renderEntity(level.scenery[i][j]);
      }
    }
  }

  //then items
  level.items.forEach (function (item) {
    renderEntity(item);
  });

  level.enemies.forEach (function(enemy) {
    renderEntity(enemy);
  });



  fireballs.forEach(function(fireball) {
    renderEntity(fireball);
  })

  //then we draw every static object.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.statics[i][j]) {
        renderEntity(level.statics[i][j]);
      }
      if (level.blocks[i][j]) {
        renderEntity(level.blocks[i][j]);
        updateables.push(level.blocks[i][j]);
      }
    }
  }

  //then the player
  if (player.invincibility % 2 === 0) {
    renderEntity(player);
  }

  //Mario goes INTO pipes, so naturally they go after.
  level.pipes.forEach (function(pipe) {
    renderEntity(pipe);
  });
}

function renderEntity(entity) {
  entity.render(ctx, vX, vY);
}
