var nextlevel = Mario.nextlevel = function() {
  //The things that need to be passed in are basically just dependent on what
  //tileset we're in, so it makes more sense to just make one variable for that, so
  //TODO: put as much of this in the Level object definition as possible.
    if (currentLevelIndex == LevelsJson.length) {
        menuActive = true
        document.getElementById("EndDiv").style.visibility = "visible"
        return
    }
    let leveljson = LevelsJson[currentLevelIndex].level;
    let height = leveljson.length;
    let width = leveljson[0].length;
  level = new Mario.Level({
    playerPos: [50,192],
    loader: Mario.nextlevel,
    background: "#7974FF",
    scrolling: true,
    invincibility: [50,144, 192, 240],
    exit: width+15,
    floorSprite:  new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0,0],[16,16],0),
    cloudSprite:  new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0,320],[48,32],0),
    wallSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0, 16],[16,16],0),
    brickSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [16, 0], [16,16], 0),
    brickBounceSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png',[32,0],[16,16],0),
    rubbleSprite: function () {
      return new Mario.Sprite(pathPrefix+'sprites/items.png', [64,0], [8,8], 3, [0,1])
    },
    ublockSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [48, 0], [16,16],0),
    superShroomSprite: new Mario.Sprite(pathPrefix+'sprites/items.png', [0,0], [16,16], 0),
    fireFlowerSprite: new Mario.Sprite(pathPrefix+'sprites/items.png', [0,32], [16,16], 20, [0,1,2,3]),
    starSprite: new Mario.Sprite(pathPrefix+'sprites/items.png', [0,48], [16,16], 20, [0,1,2,3]),
    pipeLEndSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0, 128], [16,16], 0),
    pipeREndSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [16, 128], [16,16], 0),
    pipeLMidSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0, 144], [16,16], 0),
    pipeRMidSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [16, 144], [16,16], 0),

    pipeUpMid: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0, 144], [32,16], 0),
    pipeSideMid: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [48, 128], [16,32], 0),
    pipeLeft: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [32, 128], [16,32], 0),
    pipeTop: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0, 128], [32,16], 0),
    qblockSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [384, 0], [16,16], 8, [0,0,0,0,1,2,1]),
    bcoinSprite: function() {
      return new Mario.Sprite(pathPrefix+'sprites/items.png', [0,112],[16,16], 20,[0,1,2,3]);
    },
    cloudSprites:[
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [0,320],[16,32],0),
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [16,320],[16,32],0),
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [32,320],[16,32],0)
    ],
    hillSprites: [
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [128,128],[16,16],0),
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [144,128],[16,16],0),
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [160,128],[16,16],0),
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [128,144],[16,16],0),
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [144,144],[16,16],0),
      new Mario.Sprite(pathPrefix+'sprites/tiles.png', [160,144],[16,16],0)
    ],
    bushSprite: new Mario.Sprite(pathPrefix+'sprites/tiles.png', [176, 144], [48, 16], 0),
    bushSprites: [
     new Mario.Sprite(pathPrefix+'sprites/tiles.png', [176,144], [16,16],0),
     new Mario.Sprite(pathPrefix+'sprites/tiles.png', [192,144], [16,16],0),
     new Mario.Sprite(pathPrefix+'sprites/tiles.png', [208,144], [16,16],0)],
   goombaSprite: function() {
     return new Mario.Sprite(pathPrefix+'sprites/enemy.png', [0, 16], [16,16], 3, [0,1]);
   },
   koopaSprite: function() {
     return new Mario.Sprite(pathPrefix+'sprites/enemy.png', [96,0], [16,32], 2, [0,1]);
   },
   flagPoleSprites: [
     new Mario.Sprite(pathPrefix+'sprites/tiles.png', [256, 128], [16,16], 0),
     new Mario.Sprite(pathPrefix+'sprites/tiles.png', [256, 144], [16,16], 0),
     new Mario.Sprite(pathPrefix+'sprites/items.png', [128, 32], [16,16], 0)
   ]
 });
  prevLevelIndex = currentLevelIndex;
  ground = [[0,69],[71,86],[89,153],[155,212]];
  player.pos[0] = level.playerPos[0];
  player.pos[1] = level.playerPos[1];
  vX = 0;

  /*//build THE GROUND
  ground.forEach(function(loc) {
    level.putFloor(loc[0],loc[1]);
  });*/

  //build scenery
  clouds = [[7,3],[19, 2],[56, 3],[67, 2],[87, 2],[103, 2],[152, 3],[163, 2],[200, 3]];
  clouds.forEach(function(cloud){
    level.putCloud(cloud[0],cloud[1]);
  });

  twoClouds = [[36,2],[132,2],[180,2]];
  twoClouds.forEach(function(cloud){
    level.putTwoCloud(cloud[0],cloud[1]);
  });

  threeClouds = [[27,3],[75,3],[123,3],[171,3]];
  threeClouds.forEach(function(cloud){
    level.putThreeCloud(cloud[0],cloud[1]);
  });

  bHills = [0,48,96,144,192]
  bHills.forEach(function(hill) {
      if(![2,5,6,7,8,9].includes(leveljson[13][hill])) {
          level.putBigHill(hill, 12);
      }
  });

  sHills = [16,64,111,160];
  sHills.forEach(function(hill) {
      if(![2,5,6,7,8,9].includes(leveljson[13][hill])) {
          level.putSmallHill(hill, 12);
      }
  });

  bushes = [23,71,118,167];
  bushes.forEach(function(bush) {
      if(![2,5,6,7,8,9].includes(leveljson[13][bush])) {
          level.putBush(bush, 12);
      }
  });

  twoBushes = [41,89,137];
  twoBushes.forEach(function(bush) {
      if(![2,5,6,7,8,9].includes(leveljson[13][bush])) {
          level.putTwoBush(bush, 12);
      }
  });

  threeBushes = [11,59,106];
  threeBushes.forEach(function(bush) {
      if(![2,5,6,7,8,9].includes(leveljson[13][bush])) {
          level.putThreeBush(bush, 12);
      }
  });

  //interactable terrain

    for (let y = height-1; y > 0; y--) {
        for (let x = 0; x < width; x++) {
            let tile = leveljson[y][x]
            switch (tile){
                case 0: // this is solid and ground, so a check is needed to place wall blocks or floor blocks.
                    if(height-1-y > 0) {
                        level.putWall(x,y+1, 1)
                    } else {
                        level.putFloor(x,x+1);
                    }
                    break;
                case 1:
                    level.putBrick(x,y);
                    break;
                case 2:
                    break; //This is empty, so do nothing.
                case 3:
                    level.putQBlock(x,y, new Mario.Mushroom([x*16,y*16]));
                    break;
                case 4:
                    level.putQBlock(x,y, new Mario.Bcoin([x*16,y*16]));
                    break;
                case 5:
                    if(x >= (level.playerPos[0]/16)+2 || x <= (level.playerPos[0]/16)-2) {
                        level.putGoomba(x,y);
                    }
                    break;
                case 6:
                    level.putLEndPipe(x,y);
                    break;
                case 7:
                    level.putREndPipe(x,y);
                    break;
                case 8:
                    level.putLMidPipe(x,y);
                    break;
                case 9:
                    level.putRMidPipe(x,y);
                    break;
            }
        }
    }

    level.putFlagpole(width+5);
    level.putFloor(width, width + 20);

    let levelFitFun = LevelsJson[currentLevelIndex].fitfun;
    let levelName = LevelsJson[currentLevelIndex].name;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"FitnessFunction":levelFitFun,"LevelName":levelName});

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://81.234.117.70:14544/levels", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

  music.underground.pause();
  music.overworld.currentTime = 0;
  music.overworld.play();
};
