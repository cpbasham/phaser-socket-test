function Player(x, y) {
  this.x = x;
  this.y = y;
}

Player.prototype.move = function(x, y) {
  this.x = x;
  this.y = y;
}

module.exports = Player;