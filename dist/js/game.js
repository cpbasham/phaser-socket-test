window.onload = function() {
  var platforms, enemies = [], updateCounter = 0; // fps is 30

  var game = new Phaser.Game(3000, 900, Phaser.AUTO, 'testgame', {preload: preload, create: create, update: update});

  // var gameTimer = new Phaser.Time(game);

  var socket = io.connect();
  socket.on("setup", function(data) {
    socket.gameId = data.gameId;
  });

  function preload(){
    game.load.atlasJSONHash('man', 'assets/running697x983.png', 'assets/running697x983.json');
    game.load.image('background', 'assets/background.png');
    game.load.image('ground', 'assets/ground.png');
  }

  function create(){

    game.physics.startSystem(Phaser.Physics.ARCADE);

    background = game.add.sprite(0,0, 'background');
    background.scale.setTo(0.5, 0.5);

    //add man to stage
    // man = game.add.sprite(20, 470, 'man');
    // man.scale.setTo(0.2,0.2);
    // man.animations.add('walk');
    // man.animations.play('walk', 15, true, true);



    platforms = game.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(0, game.world.height - 10, 'ground');
    ground.scale.setTo(0.5, 0.5);
    ground.body.immovable = true;
    var ledge = platforms.create(400, game.world.height - 200, 'ground');
    ledge.scale.setTo(0.1, 0.3)
    ledge.body.immovable = true;
    ledge = platforms.create(-150, game.world.height - 400, 'ground');
    ledge.scale.setTo(0.1, 0.3)
    ledge.body.immovable = true;


    player = game.add.sprite(32, -game.world.height, 'man')
    console.log(player);
    player.scale.setTo(0.2, 0.2);

    socket.on("serverUpdate", function(data) {
      // player.position.x = data.playerMap[socket.gameId].x;
      // player.position.y = data.playerMap[socket.gameId].y;

      while (enemies.length < data.numPlayers - 1) {
        var enemy = game.add.sprite(32, -game.world.height, 'man');
        enemies.push(enemy);
        enemy.scale.setTo(0.2, 0.2);
      }
      while (enemies.length > data.numPlayers - 1) {
        enemies.pop().destroy();
      }
      var enemyCounter = 0;
      // console.log("Start for");
      for (var key in data.playerMap) {
        if (key != socket.gameId.toString()) {
          console.log(enemies);
          enemies[enemyCounter].position.x = data.playerMap[key].x;
          enemies[enemyCounter].position.y = data.playerMap[key].y;
          enemyCounter++;
        }
      }
      // console.log(data.playerMap);
    });

    game.physics.arcade.enable(player);

    // player.body.bounce.y = 0.2;
    player.body.bounce.y = 0;
    player.body.gravity.y = 700;
    player.body.collideWorldBounds = true;

    player.animations.add('left',[0,1,2], 10, true);
    player.animations.add('right',[3,4,5], 10, true);

    cursors = game.input.keyboard.createCursorKeys();
  }

  function update(){
    game.physics.arcade.collide(player, platforms);
    // console.log(Math.floor((new Date()).getTime() / 1000));
    updateCounter = (updateCounter + 1) % 30;
    // if (updateCounter === 0) {console.log(Math.floor((new Date()).getTime() / 1000));}

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
      player.body.velocity.x = -750;
      player.anchor.setTo(0.5, 0);
      player.scale.x = -0.2;
      player.animations.play('left');
    } else if (cursors.right.isDown) {
      player.scale.x = 0.2;
      player.body.velocity.x = 750;
      player.animations.play('right');
    } else {
      player.animations.stop();
      player.frame = 0;
    }
    if (cursors.up.isDown && player.body.touching.down){
      player.body.velocity.y = -550;
      // socket.emit("jump", {});
    }

    if (updateCounter % 3 === 0) {
      socket.emit("gameUpdate", {x: player.position.x, y: player.position.y})
      // console.log(socket.gameId);
    }
  }

}