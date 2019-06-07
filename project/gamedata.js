'use strict';

(function() {

  window.GameData = window.GameData || {};

  GameData = function() {
    this.tableSize = {
      width: 0,
      depth: 0,
      height: 0
    };
    this.goalSize = {
      width: 0.3,
      depth: 0.045
    };
    this.state = 0;
    this.numPucks = 1; //simultaneous pucks
    this.playerA = {
      score: 0,
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      radius: 0
    };
    this.playerB = {
      score: 0,
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      radius: 0,
    };
    this.targetScore = 10;
    this.puck = {
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      radius: 0,
    };
  }

  GameData.STATES = {
    LOADING: 0,
    PLAYING: 1,
    GOALSCORED: 2
  }

  GameData.CAMERAS = {
    LUKE: 0,
    ANDREA: 1,
    TOP: 2,
    CUSTOM: 3
  }

  GameData.prototype = {
    setState: function(state) {
      this.state = state;
    },

    goal: function(whoScored) {
      //update scores
      whoScored == 1 ? this.playerA.score++ : this.playerB.score++;

      //reset puck
      this.puck.position.x = 0;
      this.puck.position.y = this.tableSize.height;
      this.puck.position.z = 0;

      //update window controls
      window.newGoal(whoScored);
    },

    init: function() {
      this.tableSize.width = 1.54
      this.tableSize.depth = 2.865
      this.tableSize.height = 1.117
      this.playerA.position.x = 0.0;
      this.playerA.position.y = this.tableSize.height;
      this.playerA.position.z = this.tableSize.depth * 0.25;
      this.playerB.position.x = 0.0;
      this.playerB.position.y = this.tableSize.height;
      this.playerB.position.z = -this.tableSize.depth * 0.25;
      this.playerA.radius = 0.077;
      this.playerB.radius = 0.077;
      this.puck.radius = 0.0539;
      this.puck.position.x = 0;
      this.puck.position.y = this.tableSize.height;
      this.puck.position.z = 0;
    }

  }

})();
