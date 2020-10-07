// create new scene
let gameScene = new Phaser.Scene('Game');

// initiate scene parameters
gameScene.init = function () {
  this.playerSpeed = 3;

  this.enemyMinSpeed = 1;
  this.enemyMaxSpeed = 3;
  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  this.isTerminating = false;
};

// load assets
gameScene.preload = function () {
  // load images
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/dragon.png');
  this.load.image('goal', 'assets/treasure.png');
};

// called once after the preloads ends
gameScene.create = function () {
  // create player
  this.player = this.add.sprite(40, 180, 'player');

  // put player above bg (z-index)
  this.player.depth = 1;
  this.player.setScale(0.5);

  // create bg sprite
  this.bg = this.add.sprite(0, 0, 'background');

  // change origin to the top-left corner
  // Andreas: "setUpperLeftCorner" of the image itself
  // bg.setOrigin(0, 0);

  // place sprite in center
  // bg.setPosition(604 / 2, 360 / 2);

  let gameW = this.sys.game.config.width;
  let gameH = this.sys.game.config.height;

  // Tell phaser where the center of the BG should be
  this.bg.setPosition(gameW / 2, gameH / 2);

  this.goal = this.add.sprite(
    this.sys.game.config.width - 80,
    this.sys.game.config.height / 2,
    'goal'
  );

  this.goal.setScale(0.5);

  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 5,
    setXY: {
      x: 90,
      y: 100,
      stepX: 80,
      stepY: 20
    }
  });

  // set flipX, and speed
  Phaser.Actions.Call(
    this.enemies.getChildren(),
    function (enemy) {
      // flip enemy
      enemy.flipX = true;

      // set speed
      let direction = Math.random() < 0.5 ? 1 : -1;
      let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
      enemy.speed = direction * speed;
    },
    this
  );

  console.log(this.enemies.getChildren());

  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);
};

// called 60 times / sec
gameScene.update = function () {
  if (this.isTerminating) {
    return;
  }

  if (this.input.activePointer.isDown) {
    // player walks
    this.player.x += this.playerSpeed;
  }

  // treasure overlap check
  let playerRect = this.player.getBounds();
  let treasureRect = this.goal.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
    console.log('Reached goal!');

    return this.gameOver();
  }

  // get enemies
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {
    let enemy = enemies[i];

    // enemy movement
    enemy.y += enemy.speed;

    // check we haven't passed min Y
    if (enemy.speed < 0 && enemy.y <= this.enemyMinY) {
      enemy.speed *= -1;
    }

    // check we haven't passed max Y
    if (enemy.speed > 0 && enemy.y >= this.enemyMaxY) {
      enemy.speed *= -1;
    }

    let enemyRect = enemy.getBounds();

    // check enemy overlap
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      console.log('Game over!');

      return this.gameOver();
    }
  }
};

gameScene.gameOver = function () {
  // initiated game over sequence
  this.isTerminating = true;

  // shake camera
  this.cameras.main.shake(500, 0.01);

  // listen for event completion
  this.cameras.main.on(
    'camerashakecomplete',
    function (camera, effect) {
      this.cameras.main.fade(300);
    },
    this
  );

  this.cameras.main.on(
    'camerafadeoutcomplete',
    function (camera, effect) {
      this.scene.restart();
    },
    this
  );
};

// set config of game
let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
};

// create new game and pass config
let game = new Phaser.Game(config);
