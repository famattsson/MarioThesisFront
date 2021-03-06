var JUMP_KEY = 87
var LEFT_KEY = 65
var RIGHT_KEY = 68
var DOWN_KEY = 83
var RUN_KEY = 16

var gameTime
var menuActive
var lastFrameTimeMs
var maxFPS = 60
var delta
var timestep

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

var keysConfiging = false

function viewKeyConfig () {
  keysConfiging = true
  document.getElementById("controlConfigDiv").style.visibility = "VISIBLE"
  menuActive = true
}

function hideKeyConfig () {
  keysConfiging = false
  document.getElementById("controlConfigDiv").style.visibility = "HIDDEN"
  menuActive = false
}

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
var activeRebindButton = 0;
var currentLevelIndex = 0;
var prevLevelIndex = 0;
var currentLevelType;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var configkeyFunc
var currentConfigKeyChoice

function startKeyRebind(buttonId,keyLabel) {
  activeRebindButton = document.getElementById(buttonId)
  activeRebindButton.disabled = true
  currentConfigKeyChoice = keyLabel
  configkeyFunc = function(e) { configureKey(e, keyLabel) }
  document.addEventListener('keydown', configkeyFunc, true)
  document.getElementById('rebindWaitDiv').style.visibility = "Visible"
}

function configureKey (e) {
  if(keysConfiging) {
    switch (currentConfigKeyChoice) {
      case 'Left':
        LEFT_KEY = e.code.replace("Key","")
        document.getElementById("LeftKeyLabel").innerText = "left: " + LEFT_KEY + " | "
        document.getElementById("LeftKeyButton").innerText = LEFT_KEY
        break
      case 'Right':
        RIGHT_KEY = e.code.replace("Key","")
        document.getElementById("RightKeyLabel").innerText = "Right: " + RIGHT_KEY + " | "
        document.getElementById("RightKeyButton").innerText = RIGHT_KEY
        break
      case 'Jump':
        JUMP_KEY = e.code.replace("Key","")
        document.getElementById("JumpKeyLabel").innerText = "Jump: " + JUMP_KEY + " | "
        document.getElementById("JumpKeyButton").innerText = JUMP_KEY
        break
      case 'Run':
        RUN_KEY = e.code.replace("Key","")
        document.getElementById("RunKeyLabel").innerText = "Run: " + RUN_KEY
        document.getElementById("RunKeyButton").innerText = RUN_KEY
        break
      default:
        break
    }
  }
  document.getElementById('rebindWaitDiv').style.visibility = "Hidden"
  document.removeEventListener('keydown', configkeyFunc, true)
  saveKeys()
  activeRebindButton.disabled = false
}

function saveKeys() {
  let controlsString = LEFT_KEY + "," + RIGHT_KEY + "," + JUMP_KEY + "," + RUN_KEY
  setCookie("Controls", controlsString, 365)
}

function loadKeys() {
  controlsString = getCookie("Controls")
  savedControls = controlsString.split(",")
  LEFT_KEY = savedControls[0]
  RIGHT_KEY = savedControls[1]
  JUMP_KEY = savedControls[2]
  RUN_KEY = savedControls[3]
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

    fetch("http://81.234.117.70:14544/ratings", requestOptions)
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

    fetch("http://81.234.117.70:14544/players", requestOptions)
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
  DOWN_KEY = "S"
  if (getCookie("Controls") == "") {
    JUMP_KEY = "W"
    LEFT_KEY = "A"
    RIGHT_KEY = "D"
    RUN_KEY = "ShiftLeft"
  } else {
    loadKeys()
  }
  lastFrameTimeMs = 0;
  maxFPS = 60;
  delta = 0;
  timestep = 1000 / 60;

  document.getElementById("LeftKeyLabel").innerText = "left: " + LEFT_KEY + " | "
  document.getElementById("LeftKeyButton").innerText = LEFT_KEY

  document.getElementById("RightKeyLabel").innerText = "Right: " + RIGHT_KEY + " | "
  document.getElementById("RightKeyButton").innerText = RIGHT_KEY

  document.getElementById("JumpKeyLabel").innerText = "Jump: " + JUMP_KEY + " | "
  document.getElementById("JumpKeyButton").innerText = JUMP_KEY

  document.getElementById("RunKeyLabel").innerText = "Run: " + RUN_KEY
  document.getElementById("RunKeyButton").innerText = RUN_KEY

  music = {
    overworld: new Audio(pathPrefix+'sounds/aboveground_bgm.ogg'),
    underground: new Audio(pathPrefix+'sounds/underground_bgm.ogg'),
    clear: new Audio(pathPrefix+'sounds/stage_clear.wav'),
    death: new Audio(pathPrefix+'sounds/mariodie.wav'),
  };

music.clear.volume=0.2
music.underground.volume=0.2
music.overworld.volume=0.2
music.death.volume=0.2

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

  sounds.smallJump.volume=0.6
  sounds.bigJump.volume=0.6
  sounds.breakBlock.volume=0.6
  sounds.bump.volume=0.6
  sounds.coin.volume=0.6
  sounds.fireball.volume=0.6
  sounds.flagpole.volume=0.6
  sounds.kick.volume=0.6
  sounds.pipe.volume=0.6
  sounds.itemAppear.volume=0.6
  sounds.powerup.volume=0.6
  sounds.stomp.volume=0.6


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

    fetch("http://81.234.117.70:14544/players", requestOptions)
        .then(response => response.text())
        .then(result => {if(!checkPlayer(result)) {initPlayer()}})
        .catch(error => console.log('error', error));
    backgroundInfoProvided = true
  }

  Mario.nextlevel();

  lastTime = Date.now();

  requestAnimationFrame(mainLoop)
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




//set up the game loop
function mainLoop(timestamp) {
  // Throttle the frame rate.
  maxFPS = 60
  let frameTime = lastFrameTimeMs + (1000/ maxFPS)
  if (timestamp < frameTime) {
    requestAnimationFrame(mainLoop);
    return;
  }
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  while (delta >= timestep) {
    update(timestep/1000);
    delta -= timestep;
  }
  render();
  requestAnimationFrame(mainLoop);
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
