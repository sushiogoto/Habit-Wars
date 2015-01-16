Meteor.startup(function () {
  $(document).on('keydown', function (e) {
    e.preventDefault();
    var monsterRadius = 16;
    var me = $('#character');
    var monstersWithinRange = _.find(Enemies.find().fetch(), function(enemy) {
      return enemy.enemyX > me.position().left - monsterRadius  && enemy.enemyX < me.position().left + monsterRadius && enemy.enemyY > me.position().top - monsterRadius && enemy.enemyY < me.position().top + monsterRadius;
    });

    if(monstersWithinRange) {
      Enemies.remove(monstersWithinRange);
      Meteor.call('randomEnemy', function (error, result) {});
    }

  });
});

Template.rpgGamePane.rendered = function() {//Global variables that will be accessed in the functions below.

  var TimerWalk;      // timer handle for walking
  var charStep = 2;   // current step, 1=1st foot, 2=stand, 3=2nd foot, 4=stand
  var currentKey = false; // records the current key pressed
  var lockUp = false;   // when lock up, character won't be able to move
  var me;         // character object
  var boundary = $('#rpg-boundary');
  var monsterBoundary = $('.flowers');
  // enemy locations client-side only saved
  Enemies = new Mongo.Collection(null);



  // Settings:
  var walkSpeed = 70;   //ms, animation speed
  var walkLength = 8;   //px, move how much px per "walk"

  obstacles = [
    {id:'#house1'},
    {id:'#t1'},
    {id:'#t2'},
    {id:'#t3'},
    {id:'#t4'},

  ];

  monsterAreas = ['#f1', '#f2', '#f3', '#f4'];

  $(document).ready(function() {

    me = $('#character');
    //add character state class
    me.addClass('front-stand');

    //KeyDown Function
    //if there is key down, execute charWalk
    $(document).keydown(function(e) {


      if (!lockUp && (currentKey === false)) {

        currentKey = e.keyCode;

        //execute character movement function walk('direction')
        switch(e.keyCode) {
          case 37:
            walk('left');
            e.preventDefault();
            break;
          case 38:
            walk('up');
            e.preventDefault();
            break;
          case 39:
            walk('right');
            e.preventDefault();
            break;
          case 40:
            walk('down');
            e.preventDefault();
            break;
        }
      }

    });

    //KeyUp Function
    $(document).keyup(function(e) {

      //don't stop the walk if the player is pushing other buttons
      //only stop the walk if the key that started the walk is released
      if (e.keyCode == currentKey) {

        //set the currentKey to false, this will enable a new key to be pressed
        currentKey = false;

        //clear the walk timer
        clearInterval(TimerWalk);

        //finish the character's movement
        me.stop(true, true);

      }

    });

  });

  //Character Walk Function
  function walk(dir) {

    // convert from language to code
    // left and right are the same
    if (dir == 'up')
      dir = 'back';
    if (dir == 'down')
      dir = 'front';

      //set the interval timer to continually move the character
      TimerWalk = setInterval(function() { processWalk(dir); }, walkSpeed);

  }

  //Process Character Walk Function
  function processWalk(dir) {

    //increment the charStep as we will want to use the next stance in the animation
    //if the character is at the end of the animation, go back to the beginning
    charStep++;
    if (charStep == 5)
      charStep = 1;

    //clear current class
    me.removeAttr('class');

    //add the new class
    switch(charStep) {
      case 1:
        me.addClass(dir+'-stand');
        break;
      case 2:
        me.addClass(dir+'-right');
        break;
      case 3:
        me.addClass(dir+'-stand');
        break;
      case 4:
        me.addClass(dir+'-left');
        break;
    }

    //move the char
    switch(dir) {

        case'front':
          newX = me.position().left;
          newY = me.position().top + walkLength ;
          break;

        case'back':
          newX = me.position().left;
          newY = me.position().top - walkLength ;
          break;

        case'left':
          newX = me.position().left - walkLength;
          newY = me.position().top;
          break;

        case'right':
          newX = me.position().left + walkLength;
          newY = me.position().top;
          break;
      }

    // Animate moving character (it will also update your character position)
    if(canIwalk(newX, newY)){
      me.animate({left:newX, top: newY}, walkSpeed/2);

    }

  }

  function enemyLocationGeneration(numEnemies, areaX, areaY) {
    for(i = 0; i <= numEnemies; i++) {
      // var enemy = {};
      enemyX =  areaX + Math.floor(Math.random() * (monsterBoundary.width() - me.width()/2));
      enemyY = areaY + Math.floor(Math.random() * (monsterBoundary.height() - me.height()/2));
      // enemy[i] = {enemyX: enemyX, enemyY: enemyY};
      Enemies.insert({enemyX: enemyX, enemyY: enemyY});
    }
  }

  //Character Walk Function
  function canIwalk(posX, posY) {

    // Within walking area - Screen (Walking boundaries)
    if((posX < 0 + me.width()/2) ||
      (posX > boundary.width() - me.width()/2) ||
      (posY < 0 + me.height()/2) ||
      (posY > boundary.height() - me.height()/2)){

      return false;
    }

    // regular obstacles (square size)
    for (var index in obstacles) {

      object = $(obstacles[index].id);

      obj_left = object.position().left + parseInt(object.css("margin-left"));
      obj_top = object.position().top + parseInt(object.css("margin-top"));

      if((((posX > ( obj_left - me.width()/2 )) &&  (posX < (obj_left + object.width() + me.width()/2))) ) &&
        (posY > (obj_top - me.height()/2)) && (posY < (obj_top + object.height() + me.height()/2))){

        // Cannot walk here
        return false;
      }
    }

    // Okay to walk
    return true;
  }

  monsterAreas.forEach(function(area) {
    enemyLocationGeneration(20, $(area).position().left, $(area).position().top);
  });
};