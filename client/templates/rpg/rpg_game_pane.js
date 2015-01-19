Template.rpgGamePane.events({
  'click .soloQuestAttack': function() {
    Meteor.call('questAttack', 'solo', function (error, result) {
      var image = result.gold + ' x <img src="images/coin.png" height="20" width="20">';
      $('.gold').data("content", result.gold);
      $('.gold').popover({'placement': 'bottom', content: image, html: true});
      $('.gold').popover('show');
      throwAlert(result.damage);

      setTimeout(function(){
        $('.gold').popover('hide');
      }, 4000);


      // $('.gold').popover('hide');

    });
  }
});

Template.rpgGamePane.helpers({
  otherCharacters: function() {
    var allCharacters = _.pluck(Characters.find().fetch(), "_id");
    return _.without(allCharacters, util.currentCharacter()._id);
  },
  alertMessage: function(field) {
    return Session.get('attackAlert')[field];
  },
  attackClass: function (field) {
    return !!Session.get('attackAlert')[field] ? 'has-alert' : '';
  },
  modalReward: function() {
    return Session.get('soloQuestMonsterData');
  },
  currentSoloQuest: function() {
    var soloQuest = util.questForCurrentCharacter('solo');
    return soloQuest;
  },

  currentSoloMonster: function() {
    // throwAlert("poop"); THROW ALERT FOR DAMAGE AND XP AND STUFF YO
    var quest = util.questForCurrentCharacter('solo');
    if(quest) {
      var monster = Monsters.findOne({_id: quest.monsterId});
      Session.set('soloQuestMonsterData', monster);
      Session.set('soloQuestRewardShown', false);
      return monster;
    } else if (Session.get('soloQuestRewardShown') === false) {
      $('#myModal').modal({show: true});
      Session.set('soloQuestRewardShown', true);
      return null;
    } else {
      return null;
    }
  },

  currentSoloMonsterHealthPercentage: function(){
    var monster = util.monsterForCurrentCharacter('solo');
    return monster ? Math.floor(monster.health / monster.fullHealth * 100) : null;
  },

  soloQuestTimeRemaining: function() {
    return Session.get('soloQuestRemainingTimePretty');
  }
});

Template.rpgGamePane.rendered = function() {//Global variables that will be accessed in the functions below.


  var TimerWalk;      // timer handle for walking
  var charStep = 2;   // current step, 1=1st foot, 2=stand, 3=2nd foot, 4=stand
  var currentKey = false; // records the current key pressed
  var lockUp = false;   // when lock up, character won't be able to move
  var me = $('#character');         // character object
  var boundary = $('#rpg-boundary');
  var monsterBoundary = $('.flowers');
  var character = util.currentCharacter();
  var characterPosition = Positions.findOne({characterId: character._id});
  if(!characterPosition) {
    me.css({'top': 70, 'left': 70});
    Positions.insert({characterId: character._id, posX: 70, posY: 70});
  } else {
    me.css({'top': characterPosition.posY, 'left': characterPosition.posX});
  }
  // move positions creation to character creation page
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
    {id: '.character1'}

  ];
  boundary.focus();
  monsterAreas = ['#f1', '#f2', '#f3', '#f4'];

    //add character state class
    me.addClass('front-stand');

    //KeyDown Function
    //if there is key down, execute charWalk
    boundary.keydown(function(e) {


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

      var monsterRadius = 16;

      var monstersWithinRange = _.find(Enemies.find().fetch(), function(enemy) {
        return enemy.enemyX > me.position().left - monsterRadius  && enemy.enemyX < me.position().left + monsterRadius && enemy.enemyY > me.position().top - monsterRadius && enemy.enemyY < me.position().top + monsterRadius;
      });

      if(monstersWithinRange && !util.questForCurrentCharacter('solo')) {
        Enemies.remove(monstersWithinRange);
        Meteor.call('randomEnemy', function (error, result) {});
      }

      Positions.update(characterPosition._id, {$set: {posX: me.position().left, posY: me.position().top}});

    });

    //KeyUp Function
    boundary.keyup(function(e) {

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

      Positions.update(characterPosition._id, {$set: {posX: me.position().left, posY: me.position().top}});

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
        stepType = dir+'-stand';
        me.addClass(stepType);
        break;
      case 2:
        stepType = dir+'-right';
        me.addClass(stepType);
        break;
      case 3:
        stepType = dir+'-stand';
        me.addClass(stepType);
        break;
      case 4:
        stepType = dir+'-left';
        me.addClass(stepType);
        break;
    }

    Positions.update(characterPosition._id, {$set: {stepType: stepType}});


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
    enemyLocationGeneration(1, $(area).position().left, $(area).position().top);
  });
};