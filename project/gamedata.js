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
    this.state = GameData.STATES.LOADING;
    this.camera = GameData.CAMERAS.ANDREA;
    this.luke = {
      score: 0,
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      radius: 0
    };
    this.andrea = {
      score: 0,
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      radius: 0,
    };

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
    RESTING: 2
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
      whoScored == 1 ? this.luke.score++ : this.andrea.score++;

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
      this.luke.position.x = 0.0;
      this.luke.position.y = this.tableSize.height;
      this.luke.position.z = this.tableSize.depth * 0.25;
      this.andrea.position.x = 0.0;
      this.andrea.position.y = this.tableSize.height;
      this.andrea.position.z = -this.tableSize.depth * 0.25;
      this.luke.radius = 0.077;
      this.andrea.radius = 0.077;
      this.puck.radius = 0.0539;
      this.puck.position.x = 0;
      this.puck.position.y = this.tableSize.height;
      this.puck.position.z = 0;
    }

  }

})();
