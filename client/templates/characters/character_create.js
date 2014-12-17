var keepSpinning = false;
function spin() {
    $('.circle').animate({
            borderSpacing: -360
        }, {
            start: function () {
                $('.circle').css({
                    '-webkit-animation': 'spin 2s 1 ease'
                });
            },
            complete: function () {
                $('.circle').css({
                    '-webkit-animation': ''
                });
                if (keepSpinning){
                    spin();
                }
            },
            duration: 2000
        });
}
function startSpin(){
    keepSpinning = true;
    spin();
}
function stopSpinning(){
    keepSpinning = false;
}

Template.characterCreate.events({
  'mouseover .one': function(event) {
    $('.circle').css({'transform': ''});
    $('.tiny-circle > li').css({'transform': ''});

    Session.set('currentCharacter', 'megaman');
    Session.set('currentCharacterAvatar', "http://www.gearfuse.com/wp-content/uploads/2010/06/retro-gaming-3d-3.gif");
    // change this when have time
  },
  'mouseover .two': function(event) {
    // $('.circle').removeClass('notransition');
    $('.circle').css({'transform': ''});
    $('.tiny-circle > li').css({'transform': ''});
    Session.set('currentCharacter', 'aero');
    Session.set('currentCharacterAvatar', "http://ranger.gamebanana.com/img/ico/sprays/zero_run_ekah_render.gif");
  },
  'mouseleave .two': function(event) {
    $('.circle').css({'transform': 'rotate(-120deg)'});
    $('.tiny-circle > li').css({'transform': 'rotate(120deg)'});
  },
  'mouseover .three': function(event) {
    // $('.circle').removeClass('notransition');
    $('.circle').css({'transform': ''});
    $('.tiny-circle > li').css({'transform': ''});
    Session.set('currentCharacter', 'mage');
    Session.set('currentCharacterAvatar', "images/prince_mage.gif");
  },
  'mouseleave .three': function(event) {
    $('.circle').css({'transform': 'rotate(-240deg)'});
    $('.tiny-circle > li').css({'transform': 'rotate(240deg)'});
  },
  'submit form': function(event) {
    event.preventDefault();
    var avatarUrl = Session.get('currentCharacterAvatar');
    var characterProperties = {
      name: $(event.target).find('[name=characterName]').val(),
      userId: Meteor.userId(),
      avatar_url: avatarUrl,
      attributePoints: 0,
      max_health: 100,
      current_health: 100,
      strength: 10,
      intelligence: 10,

      XP: 0,
      nextLevelXP: 100,
      level: 1,
      tokens: 5,
      gold: 0
    };
    var habitProperties = {
      userId: Meteor.userId(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, //moment(user.createdAt).format('x'),
      git_record: {},
      targets: {git_commit_target: $(event.target).find('[name=commitTarget]').val()}
    };

    var characterId = Characters.insert(characterProperties);
    var habitId = Habits.insert(habitProperties);

    var itemsGrid = [0, 0, 0, 0, 0].map(function(inner) {
      return [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    });
    Inventories.insert({
      characterId: characterId,
      items: [],
      itemsGrid: itemsGrid
    });
  }
});

Template.characterInfo.helpers({
  characterInfo: function() {
    if(Session.get('currentCharacter')) {
      return Session.get('currentCharacter');
    } else {
      Session.set('currentCharacterAvatar', "http://www.gearfuse.com/wp-content/uploads/2010/06/retro-gaming-3d-3.gif");
      return Session.set('currentCharacter', 'megaman');
    }
    // var characterAttributes = {
    //   megaman: {
    //     name: "Megaman",
    //     avatar_url: "http://www.gearfuse.com/wp-content/uploads/2010/06/retro-gaming-3d-3.gif",
    //     attributePoints: 0,
    //     max_health: 100,
    //     current_health: 100,
    //     strength: 10,
    //     intelligence: 10,
    //   }
    // };
    // console.log(currentCharacter);
    // console.log(characterAttributes.currentCharacter);
  }
});

Template.characterInfo.events({
  'click .select': function() {
    var chosenCharacter = Session.get('currentCharacter');
    Session.set('chosenCharacter', chosenCharacter);
  }
});

//client only code
Session.set('currentPage', 'characterCreatePage1');

var firstPanelIsCurrent = true;
var prevTemplate = null;

Template.transitioner.rendered = function() {
  this.autorun(function() {
    var currentPage = Session.get('currentPage');

    var $currentPanel = $('.panel:not(.current-panel)');
    var $prevPanel = $('.panel.current-panel');

    // out animation
    $prevPanel.one('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function() {
      $(this).removeClass('flip-out-right current-panel');
    });

    $prevPanel.addClass('flip-out-right');

    // in animation
    $currentPanel.one('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function() {
      $(this).removeClass('flip-in-left');
    });

    $currentPanel.addClass('current-panel flip-in-left');

    // save data for pageTemplate() helper
    firstPanelIsCurrent = !firstPanelIsCurrent;
    prevTemplate = Template[currentPage];
  });
};

Template.transitioner.helpers({
  pageTemplate: function() {
    currentTemplate = Template[Session.get('currentPage')];
    if ((firstPanelIsCurrent && this == 1) || (!firstPanelIsCurrent && this == 2)) return currentTemplate;
    else return prevTemplate;
  }
});

Template.characterInfo.events({
  'click button': function(event) {
    event.preventDefault();
    page = $(event.target).attr('href');
    Session.set('currentPage', page);
  }
});
