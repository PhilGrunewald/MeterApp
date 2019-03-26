/*
* Meter Activity App
*/

if (localStorage.getItem('language') == null) {
    var localLanguage = navigator.language.split("-")[0]
    if (localLanguage == 'de') {
        localStorage.setItem('language', localLanguage);
        console.log("Language is " + localLanguage + " - will use German")
    } else {
        localStorage.setItem('language', 'en');
        console.log("Language is " + localLanguage + " - will use English")
    }
}
var appVersion = "1.0.9";
var meterURL = "http://www.energy-use.org/app/"
var meterHost =  "http://www.energy-use.org"

var CURR_ACTIVITY = "current_activity";
var CURR_ACTIVITY_ID = "0";  // the time use code AND category as csv

var ACTIVITY_DATETIME = "same";  // default - meaning activity time = reported time

var CURR_LOCATION = "current_location";
var CURR_ENJOYMENT = "current_enjoyment";
var CURR_PEOPLE = "current_people";
var ACTIVITY_LIST = "activity_list";
var SURVEY_STATUS = "survey root";          // stores how far they got in the survey

var CATEGORIES = ["care_self",
"care_other",
"care_house",
"recreation",
"travel",
"food",
"work",
"other_category"];

var OTHER_SPECIFIED_ID  = 9990;
var TIMEUSE_MAX         = 10000;

var ACTIVITY_TIME_MIN   = 10000;    // provide time as a relative offset
var ACTIVITY_TIME_MAX   = 10100;

var ACTIVITY_SET_TIME_MIN   = 10100; // provide time in hours and minutes
var ACTIVITY_SET_TIME_MAX   = 11000;

var ENJOYMENT_MIN = 20000;
var ENJOYMENT_MAX = 20010;
var LOCATION_MIN  = 30000;
var LOCATION_MAX  = 30031;
var PEOPLE_MIN    = 40000;
var PEOPLE_MAX    = 40010;
var SURVEY_MIN    = 90000;
var SURVEY_MAX    = 91000;

var CATCHUP_INDEX = 0;
var catchupList   = "";
var deviceColour  = "#990000";              // to be used for background or colour marker

var app = {
  /** Application Constructor */
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
      app.initialSetup();
      app.loadText();
  },

  loadText: function() {
    $.getJSON('text/labels-' + localStorage.getItem('language') + '.json', function(label_data) {
    console.log('loading labels-' + localStorage.getItem('language') + '.json');
    app.label = label_data;

    app.title.html(app.label.title);
    $('#consentLabel').html(app.label.consentLabel);
    $('#dataPolicyButton').html(app.label.dataPolicyButton);
    $('#consentButton').html(app.label.consentButton);
    $('#actListLabel').html(app.label.actListLabel);
    $('#lblPersonalise').html(app.label.lblPersonalise);
    $('#lblSurvey').html(app.label.lblSurvey);
    $('#lblBack').html(app.label.lblBack);
    $('#lblHome').html(app.label.lblHome);
    $('#lblNext').html(app.label.lblNext);
    $('#lblDone').html(app.label.lblDone);
    $('#btn-other-specify').html(app.label.btnOther);
    $('#progress-authorise').html(app.label.Authorise)
    $('#progress1').html(app.label.progress1);
    $('#progress2').html(app.label.progress2);
    $('#progress3').html(app.label.progress3);
    $('#progress4').html(app.label.progress4);
    $('#progress5').html(app.label.progress5);

    $('#help-btn-now').html(app.label.help.btnNow);
    $('#help-btn-recent').html(app.label.help.btnRecent);
    $('#help-act-list').html(app.label.help.actList);
    $('#help-post-code').html(app.label.help.postcode);
    $('#help-contact-details').html(app.label.help.contactDetails);

    app.updateNowTime();
    setInterval(function(){ app.updateNowTime(); }, 10000);
        // 10 second clock update

    // app.statusCheck();
    setInterval(function(){ app.statusCheck(); }, 3*60*60*1000);
        // 3 hour update (needed for real idlers ?)
    }),

    $.getJSON('text/activities-' + localStorage.getItem('language') + '.json', function(data) {
      console.log('loading activities-' + localStorage.getItem('language') + '.json');
      app.activities = data.activities;
      app.showActivityList();   // to show already reported activities at startup
      });
    $.getJSON('text/screens-' + localStorage.getItem('language') + '.json', function(screen_data) {
      console.log('loading screens-' + localStorage.getItem('language') + '.json');
      app.screens = screen_data.screens;
    });
   },

  initialSetup: function() {
    utils.save(ACTIVITY_DATETIME, "same");

    app.actionButtons    = $('.btn-activity');
    app.activity_list_div= $('#activity-list');
    app.activityAddPane  = $('#activity_add_pane');
    app.activityListPane = $('#activity_list_pane');
    app.choicesPane      = $('#choices_pane');
    app.title            = $("#title");
    app.header           = $("#header");
    app.catchup          = $('#catch-up');
    app.now_time         = $("#now-time");
    app.act_count        = $('#act-count');
    app.helpCaption      = $(".help-caption");
    app.progressListPane = $("div#progress_list_pane");
    app.footerNav        = $("div.footer-nav");
    app.btnCaption           = $(".btn-caption");
    app.divStatus            = $("#divStatus");
    app.imgStatus            = $("#imgStatus");
    app.lblStatus            = $("#lblStatus");
    app.personaliseScreen    = $('#personalise_screen');
    app.appScreen            = $('#app_screen');
    app.btnSubmit            = $('#btn_submit');
    app.postcodeInput        = $('#postcode_input');
    app.postcodeSection      = $('#postcode_section');
    app.helpText             = $('#help_text');
    // app.back_btn_pers        = $('#personalise_back');
    app.addressList          = $('#address_list');
    app.register_screen      = $('#register_screen');
    app.contact_screen       = $('#contact_screen');
    app.disabled_list_option = $('#disabled_list_option');
    app.iframe_register      = $('#iframe_register');
    app.iframe_consent       = $('#iframe_consent');
    app.iframe_enjoyment     = $('#iframe_enjoyment');
    app.consent              = $('#consent');
    app.navbar               = $('#navbar');

    // The clock face behind the "Now" button
    app.nowClock        = $('#clock-now');
    app.initClock(app.nowClock);

    // clock face (move to utils?);
    app.recentClock     = $('#clock-recent');
    app.initClock(app.recentClock);

    // For time setting
    app.actClock        = $('#clock-act');
    app.actClockDiv     = $('.clock-act');
    app.initClock(app.actClock);
    app.actClock.hide();
    app.actClockDiv.hide();
    app.helpCaption.hide(); // hide help text when moving on (default off);
    app.catchup.hide();
    app.history          = new Array();
    app.act_path         = new Array();
},

initClock: function(thisClock) {
  var clock = thisClock[0].getContext("2d");
  var r = thisClock.height()/2;
  clock.translate(r,r);
},


statusCheck: function() {
    // steps are                    condition
    // 1: personalise               hh id
    // 2: finish personalise        registration status = 'complete'
    // 3: get date                  dateChoice
    // 4: survey                    SURVEY_STATUS
    // 5: study (stars);
    // 6: return eMeter             date > dateChoice +1
    
    var dateChoice = localStorage.getItem('dateChoice');
    var hh = localStorage.getItem('household_id');
    var sc = localStorage.getItem('sc');
    var consented = localStorage.getItem("consent")

  if (consented == null) {
    app.divStatus.attr("onclick","");
    app.lblStatus.html("");
    app.consent.show();
    app.appScreen.hide();
  } else if (hh == null) {
        // personalise -> hhq
        app.title.html(app.label.titlePersonalise);
        // app.lblStatus.html(app.label.lblPersonalise); // overfilled
        app.lblStatus.html("");
        app.divStatus.attr("onclick","app.personaliseClick()");
        app.imgStatus.attr("src","img/AR_4.png");
    } else if (sc == null) {
        // all this phone can do is request an email, which will have the links to change date or survey details
        app.lblStatus.html("");
        app.updateStars();
        app.divStatus.attr("onclick","app.showProgressList()");
        app.title.html(app.label.titleProgress);
        $("#progress-row-date").hide();
        $("#progress-row-hhSurvey").hide();
        checkAuthorisation();
        if (localStorage.getItem('Online') == "true") {
            $("#progress-row-authorise").show();
        } else {
            $("#progress-row-authorise").hide();
        }
    } else {
        // this is a master phone or has been authorised. Option to pick dates directly and modify HH survey
        $("#progress-row-authorise").hide();
        $("#progress-row-date").show();
        $("#progress-row-hhSurvey").show();
        if (localStorage.getItem('continue_registration_link') != null && localStorage.getItem('householdSurvey') == null) {
            // complete registration
            app.title.html(app.label.titlePersonaliseFinish);
            app.lblStatus.html(app.label.lblPersonaliseFinish);
            app.divStatus.attr("onclick","app.continueRegistration()");
            app.imgStatus.attr("src","img/act_others1.png");
        } else if (dateChoice == null && sc != null) {
            // get Date
            app.title.html(app.label.titleDate);
            app.lblStatus.html(app.label.lblDate);
            app.divStatus.attr("onclick","app.getDate()");
            app.imgStatus.attr("src","img/time_forward.png");
        } else {
            // got a date - show stars for further options
            app.lblStatus.html("");
            app.updateStars();
            app.divStatus.attr("onclick","app.showProgressList()");
            app.title.html(app.label.titleProgress);
        }
    }
},

updateStars: function() {
  activityList = utils.getList(ACTIVITY_LIST) || {};
  var actCount = Object.keys(activityList).length;
  if (actCount > 24) {
    app.imgStatus.attr("src","img/stars_5.png");
  } else if (actCount > 14) {
    app.imgStatus.attr("src","img/stars_4.png");
  } else if (actCount > 9) {
    app.imgStatus.attr("src","img/stars_3.png");
  } else if (actCount > 4) {
    app.imgStatus.attr("src","img/stars_2.png");
  } else {
    app.imgStatus.attr("src","img/stars_1.png");
  }
},

updateNowTime: function() {
  var now = new Date();
  var hour = now.getHours();
  var min  = now.getMinutes();
  if (app.label.hours == "12") {
    hour = hour % 12;
  }
  hour = hour ? hour : 12; // the hour '0' should be '12'
  minutes = min < 10 ? '0'+min : min;

  app.drawClock(app.nowClock,hour,min,app.label.now, hour + ':' + minutes);
  app.drawClock(app.recentClock,hour,min, app.label.recently, "back arrow");
},

drawClock: function(thisClock,hour,minute,caption,subcaption) {
  var clock = thisClock[0].getContext("2d");
  var clockEdge = thisClock.height() * 0.08;
  var radius = (thisClock.height()/2) - (clockEdge /2);

  // face
  app.drawFace(clock, radius, clockEdge);

  // hour
  hour=hour%12;
  hour=(hour*Math.PI/6)+(minute*Math.PI/(6*60));
  app.drawHand(clock, hour, radius*0.5, clockEdge);

  // minute
  minute=(minute*Math.PI/30);
  app.drawHand(clock, minute, radius*0.8, clockEdge*0.6);

  // caption

  //font-family:'HelveticaNeue-Light', 'HelveticaNeue', Helvetica, Arial, sans-serif;
  clock.textAlign="center";
  clock.font = radius*0.5 + "px HelveticaNeue-Light";

  clock.fillStyle = "green";
  if (subcaption == "back arrow") {
    clock.fillText(caption, 0, 0);
    app.drawBackArrow(clock, radius*0.6, clockEdge);
  } else {
    clock.fillText(caption, 0, -radius*0.25);
    clock.fillText(subcaption, 0, radius*0.25);
  }
},

drawFace: function(ctx, radius, width) {
  ctx.beginPath();
  // the ring (inner white, grey edge);
  ctx.arc(0, 0 , radius, 0, 2*Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = width;
  ctx.stroke();
  // four ticks
  ctx.lineWidth = width/3;
  ctx.lineCap = "round";
  for(num= 0; num < 4; num++){
    ang = num * Math.PI / 2;
    ctx.rotate(ang);
    ctx.moveTo(0,radius*0.85);
    ctx.lineTo(0,radius);
    ctx.stroke();
    ctx.rotate(-ang);
  }
},

drawBackArrow: function(ctx,radius,width) {
  ctx.rotate(2/12*Math.PI);
  // arch
  ctx.lineWidth = width/3;
  ctx.strokeStyle = "green";
  ctx.beginPath();
  ctx.arc(0, 0 , radius, 0, 2/3*Math.PI);
  ctx.stroke();
  // arrow
  ctx.beginPath();
  ctx.fillStyle = "green";
  ctx.moveTo(radius,-5);
  ctx.lineTo(radius+12,+12);
  ctx.lineTo(radius-12,12);
  ctx.fill();
  ctx.rotate(-2/12*Math.PI);
},

drawHand: function(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
},

navigateTo: function(screen_id, prev_activity) {
  // the button pressed had 'prev_activity' as its 'title'
  // next screen has the key 'screen_id'
  app.actClock.hide();

  app.catchup.hide();
  app.title.show();

  app.history.push(screen_id);                     // for 'back' functionality
  if (prev_activity !== undefined) {
    if (!(prev_activity in app.activities)) {    // previous activity is defined but not known (free text);
      app.activities[prev_activity] = {
        "title"   : prev_activity,
        "caption" : prev_activity,
        "help"    : "Custom input",
        "category": "other_category",
        "ID"      : OTHER_SPECIFIED_ID,
        "next"    : screen_id
      }
    }
    app.act_path.push(app.activities[prev_activity].ID);                     // for to keep a record 'how people got to final activity

    //******************************
    //
    // Activity.ID specific action
    //
    //******************************

    //
    // Is Time Use activity entry
    //
    if (app.activities[prev_activity].ID < TIMEUSE_MAX) {
      utils.save(CURR_ACTIVITY, prev_activity);
      utils.save(CURR_ACTIVITY_ID, [app.activities[prev_activity].ID,app.activities[prev_activity].category,app.activities[prev_activity].title].join()); // running save for category separately caused ID and category to be set to the same value (???!!!) - so we do it in one go into the same var
      // now that an activity is selected btn-done will not create a new entry
      app.footer_nav("done");
    }
    //
    // Is TIME setting
    //
    else if (app.activities[prev_activity].ID > ACTIVITY_TIME_MIN && app.activities[prev_activity].ID < ACTIVITY_TIME_MAX) {
      var offset = app.activities[prev_activity].value * 60000;
      var dt_activity = utils.get(ACTIVITY_DATETIME).replace(" ","T");
      var dt_activity2 = new Date(dt_activity);
      var dt_activity3 = new Date(dt_activity2.getTime() +offset).toISOString();
      utils.save(ACTIVITY_DATETIME, dt_activity3);
    }
    //
    //  LOCATION
    //
    else if (app.activities[prev_activity].ID > LOCATION_MIN && app.activities[prev_activity].ID < LOCATION_MAX) {
      utils.save(CURR_LOCATION, app.activities[prev_activity].value);
    }
    //
    // PEOPLE
    //
    else if (app.activities[prev_activity].ID > PEOPLE_MIN && app.activities[prev_activity].ID < PEOPLE_MAX) {
      utils.save(CURR_PEOPLE, app.activities[prev_activity].value);
    }
    //
    // ENJOYMENT
    //
    else if (app.activities[prev_activity].ID > ENJOYMENT_MIN && app.activities[prev_activity].ID < ENJOYMENT_MAX) {
      utils.save(CURR_ENJOYMENT, app.activities[prev_activity].value);
    }
    //
    // SURVEY
    //
    else if (app.activities[prev_activity].ID > SURVEY_MIN && app.activities[prev_activity].ID < SURVEY_MAX) {
      // save the survey screen_id, such that we can return here via screen_id = 'survey'
      utils.save(SURVEY_STATUS, screen_id);
      // log.writeSurvey(app.activities[prev_activity].title, app.activities[prev_activity].value);

      var newSurveyInput = app.activities[prev_activity].title + "," + app.activities[prev_activity].value;
      if (localStorage.getItem("surveyAnswers")==null){ //Otherwise there is a "null" value at start
      localStorage.setItem("surveyAnswers", newSurveyInput);
    } else {
      localStorage.setItem("surveyAnswers", localStorage.getItem("surveyAnswers") + "#" + newSurveyInput);
    }
    if (app.activities[prev_activity].title=="TimeExercise") { // if it is final question (survey complete);
  }

  $("img#survey-status").attr("src","img/AR_progress.png");
  }
} // if prev undefined

//******************************
//
// SCREEN ID SPECIFIC ACTIONS
//
//******************************

app.activityAddPane.hide();
app.activityListPane.hide();
app.progressListPane.hide();
app.choicesPane.show();
app.footerNav.show();
app.helpCaption.hide(); // hide help text when moving on (default off);
app.btnCaption.hide(); // hide help text when moving on (default off);

console.log("Screen ID: " + screen_id);
// app.personalise.hide();

if (screen_id == "home" ) {
  // an entry has been completed (incl. via "Done");
  if (prev_activity !== "ignore") {
    app.addActivityToList();
  }
  app.header.attr("onclick", "");
  app.title.removeClass("btn-box");
  app.showActivityList();
  // in saveActivityPropertiesLocally home was repointed here to avoid loosing item when aborting change
  $("#nav-home").attr("onclick", "app.showActivityList()");
} else
if (screen_id == "activity time relative") {
  // pressed "recently" button - relative time entry followed by "activity root"
  // unlike "adjust time" which is triggered by "edit activity"
  var dt_ = Date.now();
  var dt_ = new Date(dt_).toISOString();
  utils.save(ACTIVITY_DATETIME, dt_);
  utils.format("${rel_time}")
  app.footer_nav("next");
  app.header.attr("onclick", "app.navigateTo('activity root')");
  app.title.addClass("btn-box");
} else
if (screen_id == "activity root") {
  // btn-next is only for "activity time relative" actions
  // it points to "activity root", thus turning itself back to "Done" here
  app.footer_nav("f");
  app.actClockDiv.hide();
  app.header.attr("onclick", "");
  app.title.removeClass("btn-box");
  $("div#btn-other-specify").attr("onclick", "app.submitOther()");
  // SPECIAL CASE for 'getting home'
  // if last location was not home, go to screen 'activity root away', which will have an option to 'arrive home'
  if (utils.get(CURR_LOCATION) != 1) {
    screen_id = "activity root away";
  }

} else
if (screen_id == "other specify" || screen_id == "name specify") {     // display text edit field
  console.log("Free text screen");
  $("div#other-specify").show();
  app.footerNav.hide();
  app.choicesPane.hide();
} else
if (screen_id == "other specify household ID") {     // display text edit field
  console.log("Get HH id from user as free text");
  $("div#btn-other-specify").attr("onclick", "app.submitHHid()");
  $("input#free-text").val("");
  $("div#other-specify").show();
  app.footerNav.hide();
  app.choicesPane.hide();
} else
if (screen_id == "survey root") {
  // an entry is still in the middle of completion
  // "survey root" is where the top navigation button points to
  // here it gets redirected to the latest survey screen
  // SURVEY_STATUS is 'survey root' by default and gets updated with every survey screen
  screen_id = utils.get(SURVEY_STATUS);
  // clearTimeout(app.waitFor5pm);
  $('div.contents').show();
  app.footer_nav("home");

  if (screen_id === null) {  // in case SURVEY_STATUS was not set
    screen_id = "survey root";
  }
} else
if (screen_id == "survey complete") {
  // app.nav_survey.hide();
  app.imgStatus.attr("src","img/stars_1.png");
  // app.nav_status.show();
  app.showActivityList();
  app.choicesPane.hide();
} else
if (screen_id == "adjust time") {
  console.log("Doing nothing - just so that the <else> part doesn't remove the title action");
  utils.format("${rel_time}")
}
else
if (screen_id == "other people") {
  // bit of a special case - for "edit repeat" going straight to 'other people'
  app.actClockDiv.hide();
  app.header.attr("onclick", "");
  app.title.removeClass("btn-box");
}
else {
  app.header.attr("onclick", "");
  app.title.removeClass("btn-box");
}

//******************************
//      Buttons
//******************************
var screen_ = app.screens[screen_id];
app.title.html(utils.format(screen_.title));
if (screen_id !== "home") {
  for (i = 0; i < screen_.activities.length; i++) {
    var activity_id = screen_.activities[i];
    var activity    = app.activities[activity_id];
    var button      = $(app.actionButtons[i]);
    CATEGORIES.forEach(function (cat) {
      button.removeClass(cat);
    });
    var btn_title   = button.find(".btn-title");
    var btn_caption = button.find(".btn-caption");
    var btn_button  = button.find(".btn-activity");
    var number = i+1;
    var buttonNo    = "button"+ number;

    if (activity === undefined) {
      btn_title.html("&lt;"+activity_id + "&gt;<br>undefined");
      button.attr("onclick", "");
    } else {
      document.getElementById(buttonNo).style.backgroundImage = "url('img/"+activity.icon+".png')";
      btn_title.html(utils.format(activity.caption));
      btn_caption.html(utils.format(activity.help));
      //button.addClass(activity.category || "other_category");
      button.addClass(activity.category);
      button.attr("onclick", "app.navigateTo('"+activity.next+"', '"+activity_id+"')");
    }
    if (activity.ID == -1) {
      document.getElementById(buttonNo).style.backgroundImage = "";
      button.addClass("other_category");
      button.attr("onclick", "");
    }
  }
}
},

goBack: function() {
  $("div#other-specify").hide();
  app.act_path.push(app.activities['Back'].ID);                     // for to keep a record 'how people got to final activity
  curr = app.history.pop();
  prev = app.history.pop();

  if (prev === undefined) {
    app.showActivityList();
  } else {
    //app.navigateTo(prev,prev);
    app.navigateTo(prev);
    console.log("Back to: " + prev);
    if (prev == "adjust time") {
      app.footer_nav("next");
    }
    // XXX undo potential time offsets
  }
},

showProgressList: function() {
    // Date may have changed externally (web or other app user)
    getHHDateChoice();

    var dateChoice = localStorage.getItem('dateChoice');
    var hhSurveyStatus = localStorage.getItem('householdSurvey');

    var activityList = utils.getList(ACTIVITY_LIST) || []
    var actCount = Object.keys(activityList).length;
    app.title.html(app.label.titleProgress1 + actCount + app.label.titleProgress2);

    if (dateChoice != null && new Date() < new Date(dateChoice)) {
        // a future date is assigned
        var dtChoice  = new Date(dateChoice);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
        var options = { weekday: 'short', day: 'numeric', month: 'short'};
        $('#progress-date').html("Study " + dtChoice.toLocaleDateString(app.label.locale, options));
        $('#progress-img-date').attr("src","img/nav_done.png");
    } else {
        $('#progress-date').html("Do the study");
        $('#progress-img-date').attr("src","img/meter_go.png");
    }
    if (hhSurveyStatus == 'COMPLETE') {
        $('#progress-img-hhSurvey').attr("src","img/nav_done.png");
    }
    
    if (utils.get(SURVEY_STATUS) == "survey complete") {
        $('#progress-img-indivSurvey').attr("src","img/stars_on.png");
    }

  if (actCount > 4 && localStorage.getItem('Online')) {
    $("img#stars2").attr("src","img/stars_on.png");
    var idMeta = localStorage.getItem('metaID');
    var enjoymentURL = app.label.enjoymentURL + idMeta;
    app.iframe_enjoyment.show(); 
    app.iframe_enjoyment.attr('src', enjoymentURL);
    app.iframe_enjoyment.load(function(){
        sendMessageIframe("App requested enjoyment");
    });
  } else {
    app.iframe_enjoyment.hide(); 
  }
  if (actCount > 9) {
    $("img#stars3").attr("src","img/stars_on.png");
  }
  if (actCount > 14) {
    $("img#stars4").attr("src","img/stars_on.png");
  }
  if (actCount > 24) {
    $("img#stars5").attr("src","img/stars_on.png");
  }
  var progressList = $("div#progress_list_pane");
  if (progressList.is(':visible')) {
    progressList.hide();
  } else {
    progressList.show();
  }
  $('div.contents').animate({ scrollTop: 0 }, 'slow'); // only needed when using the home button on the home screen after having scrolled down
},


showActivityList: function() {
  // only used on home screen
  // used as a proxy for 'being home'
  // thus populate the title and do some of the hiding

  console.log("Checking if registered...");
  app.statusCheck();
  app.returnToMainScreen();

  $("div#progress_list_pane").hide();
  app.choicesPane.hide();
  $("div#other-specify").hide();

  app.title.attr("onclick", "");
  console.log("hist: " + app.act_path);
  app.history = new Array();
  app.act_path = new Array();
  var activityList = utils.getList(ACTIVITY_LIST) || []
  var actsHTML = "";

  var actKeys = Object.keys(activityList);
  var actLength =Object.keys(activityList).length;
  actKeys.sort();

  var weekday = '';
  for (i = actLength-1; i > -1; i--) {
    var key = actKeys[i];
    var item = activityList[key];
      var dt  = new Date(item.dt_activity.replace(" ","T"))
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
      // var options = { hour: 'numeric', minute: '2-digit', timeZone: 'UTC'};
      var options = { hour: 'numeric', minute: '2-digit' };
      var hhmm = dt.toLocaleString(app.label.locale, options);
      var options = { weekday: 'long', day: 'numeric', month: 'short'};
      thisWeekday = dt.toLocaleString(app.label.locale, options);
    if (weekday != thisWeekday) {
      actsHTML +=
      '<div class="row activity-row">' + thisWeekday + '</div>'
    }
    weekday = thisWeekday;
    var activity    = app.activities[item.key];
    // safety catch - somehow some people managed to store entries with a 'custom key', which is not in the list
    if (activity !== undefined) {
      var icon = activity.icon;
    }
    else {
      var icon = "Other_type"
    }

    actsHTML +=
    '<div class="activity-row ' + item.category + '" onClick="app.editActivityScreen(\'' + key + '\')">' +
    '<div class="activity-time activity-item">' + hhmm + '</div>' +
    '<div class="activity-cell activity-item">' + item.activity  + '</div> ' +
    '<div class="activity-icon activity-item"><img class="activity-icon" src="img/'+icon+'.png"></div>'+
    '<div class="activity-icon activity-item"><img class="activity-icon" src="img/loc_'+item.location+'.png"></div>'+
    '<div class="activity-icon activity-item"><img class="activity-icon" src="img/enjoy_'+item.enjoyment+'.png"></div>'+
    '</div>';
  }
  app.act_count.show();
  app.activity_list_div.html(actsHTML);
  $('div.contents').animate({ scrollTop: 0 }, 'slow'); // only needed when using the home button on the home screen after having scrolled down
  app.activityAddPane.show();
  app.activityListPane.show();
  app.title.html(app.screens['home'].title);
  app.footer_nav("home");
  app.updateNowTime();
  app.actClockDiv.hide();
  app.showCatchupItem(); // overwrites app.title if catchup items exist
},

showCatchupItem: function() {
  // test for catchup items in list and display if applies
  // drop (shift) catchup items more than 8 ours old
  if (Date(catchupList[0]) in window) { //If this variable exists (otherwise we get an error);
    while ((new Date() - new Date(catchupList[0])) > (8*60*60*1000)) {
      catchupList.shift();
      if (!catchupList.length) {
        break;
      }
    }
  }

  // find most recent item that is in the past (starting from the back);
  var catchupIndex = catchupList.length-1;
  while (new Date() < new Date(catchupList[catchupIndex])) {
    catchupIndex -= 1;
    if (catchupIndex < 0) { break;}
  }

  // show specific time in title
  if (catchupIndex > -1) {
    var hh= parseInt(catchupList[catchupIndex].slice(11,13));
    var mm= parseInt(catchupList[catchupIndex].slice(14,16));
    var strTime = utils.formatAMPM(hh,mm);
    app.catchup.html(" at "+ strTime +"? <img src=\"img/AR_"+ (parseInt(catchupIndex)+1) +".png\">");
    app.catchup.attr("onclick", "app.catchupActivity('"+catchupIndex+"')");
    app.catchup.show();
    app.title.attr("onclick", "app.catchupActivity('"+catchupIndex+"')");
  } else {
    app.title.html(app.screens['home'].title);
    app.actClock.hide();
    app.catchup.hide();
    app.title.show();
  }
},


catchupActivity: function(catchupIndex) {
  // takes the 'catchupTime' before navigate to activity selection
  var catchupTime = catchupList[catchupIndex];
  utils.save(ACTIVITY_DATETIME, catchupTime);
  catchupList.splice(catchupIndex,1); // remove this catchup request
  app.navigateTo('activity root');
},


addActivityToList: function() {
  // 2 Lists: local ACTIVITY_LIST and logActJSON file
  var dt_recorded = new Date(); // .toISOString();
  var dt_act;
  if (utils.get(ACTIVITY_DATETIME) == "same") {
    dt_act = dt_recorded;
  } else {
    dt_act = new Date(utils.get(ACTIVITY_DATETIME).replace(" ","T"));
  }

  var actID = utils.actID(dt_act);

  activityList = utils.getList(ACTIVITY_LIST) || {};
  activityList[actID] = {
    "key"       : utils.get(CURR_ACTIVITY),
    "Meta_idMeta": localStorage.getItem('metaID'),
    "dt_activity": utils.getDateForSQL(dt_act),
    "dt_recorded": utils.getDateForSQL(dt_recorded),
    "location"  : utils.get(CURR_LOCATION),
    "people"    : utils.get(CURR_PEOPLE),
    "enjoyment" : utils.get(CURR_ENJOYMENT),
    "tuc"       : utils.get(CURR_ACTIVITY_ID).split(",")[0],
    "category"  : utils.get(CURR_ACTIVITY_ID).split(",")[1],
    "activity"  : utils.get(CURR_ACTIVITY_ID).split(",")[2],
    "path"      : app.act_path.join()
  }
  utils.saveList(ACTIVITY_LIST, activityList);
  var newActivityList = activityList[actID]['dt_activity'] + "#" + activityList[actID]['dt_recorded'] + "#"  + activityList[actID]['tuc'] + "#"  + activityList[actID]['activity'] + "#" + activityList[actID]['location'] + "#" +  activityList[actID]['enjoyment'] + "#" + activityList[actID]['category'] + "#" + activityList[actID]['people'] + "#" + activityList[actID]['path'] + "#" + activityList[actID]['key'];
  console.log("New list: " + newActivityList);
  localStorage.setItem('activitiesToUpload', localStorage.getItem('activitiesToUpload') + ";" + newActivityList);

  // reset values
  utils.save(ACTIVITY_DATETIME, "same"); // reset to assume 'now' entry
  utils.save(CURR_PEOPLE, "-1");
  app.updateStars();
},

removeActivity: function (uuid) {
  app.deleteAct(uuid);
  app.showActivityList();
},

deleteAct: function (actKey) {
  if (actKey) {
    activityList = utils.getList(ACTIVITY_LIST) || {};
    if (actKey in activityList) {
      var newActivityList = activityList[actKey]['dt_activity'] + "#" + activityList[actKey]['dt_recorded'] + "#"  + activityList[actKey]['tuc'] + "#"  + activityList[actKey]['activity'] + "#" + activityList[actKey]['location'] + "#" +  activityList[actKey]['enjoyment'] + "#" + activityList[actKey]['category'] + "#" + activityList[actKey]['people'] + "#" + activityList[actKey]['path'] +  ",11006" + "#" + activityList[actKey]['key']; //actKey = actID??
      localStorage.setItem('activitiesToUpload', localStorage.getItem('activitiesToUpload') + ";" + newActivityList); //List of activities to upload
      delete activityList[actKey];
      // XXX this is where to add the "add to ..._act_edited.csv"
      utils.saveList(ACTIVITY_LIST, activityList);
    }
  }
},

editActivityScreen: function (actKey) {
  // this is a special case of "navigateTo":
  // instead of "next screen", onclick() points to specific functions
  var activityList = utils.getList(ACTIVITY_LIST) || {};
  var item = activityList[actKey];
  app.title.html(utils.extractTimeStr(item.dt_activity) + ": " + item.activity);
  var screen_ = app.screens["edit activity"];
  for (i = 0; i < screen_.activities.length; i++) {
    var activity_id = screen_.activities[i];
    var activity    = app.activities[activity_id];
    var button      = $(app.actionButtons[i]);
    CATEGORIES.forEach(function (cat) {
      button.removeClass(cat);
    });
    var btn_title   = button.find(".btn-title");
    var btn_caption = button.find(".btn-caption");
    var btn_button  = button.find(".btn-activity");
    var number = i+1;
    var buttonNo    = "button"+ number;
    document.getElementById(buttonNo).style.backgroundImage = "url('img/"+activity.icon+".png')";
    btn_title.html(activity.caption);
    btn_caption.html(utils.format(activity.help));
    button.addClass(activity.category);
    button.attr("onclick", activity.next + "('"+ actKey + "')");
  }
  app.actClockDiv.hide();
  app.activityAddPane.hide();
  app.activityListPane.hide();
  app.choicesPane.show();
  app.footer_nav("home");
},

saveActivityPropertiesLocally: function(actKey) {
  // this is where app.navigateTo("home") will create new activity from
  var activityList = utils.getList(ACTIVITY_LIST) || {};
  var thisAct = activityList[actKey];
  var dtAct   = new Date(actKey.substring(0,19));
  //// var dt  = thisAct.dt_activity.replace(" ","T")
  //// utils.save(ACTIVITY_DATETIME, dt);
  //// console.log("2nd testing for T: " + dt)
  /////// utils.save(ACTIVITY_DATETIME, thisAct.dt_activity);
  utils.save(ACTIVITY_DATETIME, utils.getUTCDateForSQL(dtAct));
  utils.save(CURR_ACTIVITY, thisAct.key);
  utils.save(CURR_ACTIVITY_ID, [thisAct.tuc, thisAct.category, thisAct.activity].join());
  utils.save(CURR_LOCATION, thisAct.location);
  utils.save(CURR_PEOPLE, thisAct.people);
  utils.save(CURR_ENJOYMENT, thisAct.enjoyment);
  // if home is pressed now the item is left as is (conventional home > app.showActivityList would have lost it)
  $("#nav-home").attr("onclick", "app.navigateTo('home')");
},

footer_nav: function(btn) {
  app.footerNav.show();
  $("#btn-home").hide();
  $("#btn-done").hide();
  $("#btn-next").hide();
  $("#btn-"+btn).show();
  $("#btn-back").attr("onclick", "app.goBack();");
},

// Edit btn XXX
repeatActivityNow: function(actKey) {
  // XXX no longer used
  // set local variables as copy of this activity, then overwrite time
  app.saveActivityPropertiesLocally(actKey);
  var thisTime = new Date().toISOString();
  utils.save(ACTIVITY_DATETIME, thisTime);
  app.act_path.push(app.activities['Repeat activity now'].ID);
  app.navigateTo("home");
},

// Edit btn 1 - I did More
moreActivity: function(actKey) {
  app.act_path.push(app.activities['More activity'].ID);
  app.saveActivityPropertiesLocally(actKey);
  app.footer_nav("next");
  app.header.attr("onclick", "app.navigateTo('activity root')");
  app.title.addClass("btn-box");
  app.navigateTo("adjust time");
},

// Edit btn 2: Repeat
repeatActivityRecently: function(actKey) {
  // create a new instance as a copy of this activity and then allow to adjust the time
  app.saveActivityPropertiesLocally(actKey);
  //
  // get the original path and append this button ID
  var activityList = utils.getList(ACTIVITY_LIST) || {};
  var thisAct = activityList[actKey];
  app.act_path.push(thisAct.path);
  app.act_path.push(app.activities['Repeat activity recently'].ID);

  // default is 'now'
  var thisTime = new Date().toISOString();
  utils.save(ACTIVITY_DATETIME, thisTime);
  app.footer_nav("done");
  app.header.attr("onclick", "app.navigateTo('other people')");
  app.title.addClass("btn-box");
  app.navigateTo("adjust time");
},

// Edit btn 3: Rename
editActivityTitle: function(actKey) {
  // the old List and CSV entries need to be removed and a new one is created when navigating Home

  // get the original path and append this button ID
  var activityList = utils.getList(ACTIVITY_LIST) || {};
  var thisAct = activityList[actKey];
  app.act_path.push(thisAct.path);

  app.act_path.push(app.activities['Edit activity title'].ID);
  app.saveActivityPropertiesLocally(actKey);
  app.deleteAct(actKey);
  var oldDetail = utils.get(CURR_ACTIVITY_ID);
  var oldTitle  = oldDetail.split(",")[2];
  $("input#free-text").val(oldTitle);
  $("div#btn-other-specify").attr("onclick", "app.submitEdit()");
  app.navigateTo("other specify");
},

// Edit btn 4: Adjust time
adjustTime: function(actKey) {
  // the old List and CSV entries need to be removed and a new one is created when navigating Home
  app.saveActivityPropertiesLocally(actKey);
  //
  // get the original path and append this button ID
  var activityList = utils.getList(ACTIVITY_LIST) || {};
  var thisAct = activityList[actKey];
  app.act_path.push(thisAct.path);
  app.act_path.push(app.activities['Edit activity time'].ID);

  app.deleteAct(actKey);
  app.footer_nav("done");
  // Remap back button to ensure entry isn't lost
  $("#btn-back").attr("onclick", "app.navigateTo('home')");
  app.header.attr("onclick", "app.navigateTo('home')");
  app.title.addClass("btn-box");
  app.navigateTo("adjust time");
},

// Edit btn 5: "END"
endActivity: function(actKey) {
  // mark entry with "(end)" and confirm exact time

  // create a new instance as a copy of this activity and then allow to adjust the time
  app.saveActivityPropertiesLocally(actKey);

  // get the original path and append this button ID
  var activityList = utils.getList(ACTIVITY_LIST) || {};
  var thisAct = activityList[actKey];
  app.act_path.push(thisAct.path);
  app.act_path.push(app.activities['End activity'].ID);


  // check if title ends with "(end)" and toggle
  var tuc_cat_title = utils.get(CURR_ACTIVITY_ID);
  var endStr = " (end)";
  if (tuc_cat_title.endsWith(endStr)) {
    // already ended activity: remove the end delete the old entry and put in the new
    tuc_cat_title = tuc_cat_title.substring(0, tuc_cat_title.length - endStr.length);
    utils.save(CURR_ACTIVITY_ID,tuc_cat_title);
    app.deleteAct(actKey);
    app.navigateTo("home"); // ignore stops creation of new entry
  } else {
    // add end
    tuc_cat_title = tuc_cat_title + endStr;
    utils.save(CURR_ACTIVITY_ID,tuc_cat_title);

    // set recording time
    var thisTime = new Date().toISOString();
    utils.save(ACTIVITY_DATETIME, thisTime);

    // get time when it ended
    app.footer_nav("done");
    app.header.attr("onclick", "app.navigateTo('home')");
    app.title.addClass("btn-box");
    app.navigateTo("adjust time");
  }
},


// Edit btn 6: Delete
deleteActivity: function(actKey) {
  app.act_path.push(app.activities['Delete activity'].ID);
  // set local variables as copy of this activity, then overwrite time
  app.deleteAct(actKey);
  app.navigateTo("home", "ignore"); // ignore stops creation of new entry
},


submitEdit: function() {
  var prev_activity =
  $("div#other-specify").hide();
  var details = utils.get(CURR_ACTIVITY_ID) ;
  var detailsArray = details.split(",");  // contains tuc, category, title
  var tuc = detailsArray[0];
  var cat = detailsArray[1];            // .category
  var act = $("input#free-text").val();//.replace(/'/g, "\\'");
  utils.save(CURR_ACTIVITY_ID, [tuc, cat, act].join());
  app.navigateTo("home");
},

    submitHHid: function() {
        // h was followed by nothing but a number
        var hhID = $("input#free-text").val();//.replace(/'/g, "\\'");
        localStorage.removeItem('metaID');          // get new metaID
        localStorage.removeItem('householdStatus'); // for connection manager "not linked yet"
        localStorage.setItem('household_id', hhID);
        localStorage.setItem('householdSurvey', 'COMPLETE');
        app.navigateTo("home", "ignore"); // ignore stops creation of new entry
        app.title.html("HH ID set to " + hhID);
    },

submitOther: function() {
  // includes special functionality to change language and link with hh (triggers new meta ID)
  $("div#other-specify").hide();
  var prev_activity = $("input#free-text").val();//.replace(/'/g, "\\'");
    // 31 Dec 2018 - Phil
    // here we allow custom hh configuration
    // hhID can be entered in the format:
    //     *h1234
    // 
    hhID = prev_activity.split("*h")[1];
    if (!isNaN(hhID)) {
        // h was followed by nothing but a number
        localStorage.removeItem('metaID');          // get new metaID
        localStorage.removeItem('householdStatus'); // for connection manager "not linked yet"
        utils.saveList(ACTIVITY_LIST, {});          // DELETE all activities from device
        localStorage.setItem('household_id', hhID);
        localStorage.setItem('householdSurvey', 'COMPLETE');
        utils.save(SURVEY_STATUS, "survey root");   // reset individual survey
        app.imgStatus.attr("src","img/AR_4.png");
        app.navigateTo("home", "ignore"); // ignore stops creation of new entry
        app.title.html("HH ID set to " + hhID);
    } else if (prev_activity == "*en"){
        localStorage.setItem('language','en');
        app.loadText();
    } else if (prev_activity == "*de"){
        localStorage.setItem('language','de');
        app.loadText();
    } else {
        app.navigateTo("other people", prev_activity);
    }
},

toggleCaption: function() {
  app.btnCaption.toggle();
  app.helpCaption.toggle();
},

personaliseClick: function() { //Goes to the screen with the postcode input
  if (localStorage.getItem('language') == 'de') {
    app.navigateTo("other specify household ID");
  } else {
    app.appScreen.hide();
    app.addressList.hide();
    app.contact_screen.hide();
    app.personaliseScreen.show();
    app.postcodeInput.show();
    app.btnSubmit.attr("onclick","app.submitPostcode()");
    // document.getElementById('personalise_back').innerHTML = 'Do this later'; > Use Home
    // app.back_btn_pers.attr("onclick","app.returnToMainScreen()");
    app.btnSubmit.html("Submit");
    }
},

returnToMainScreen: function() {
  console.log("returning");
  app.appScreen.show();
  app.contact_screen.hide();
  app.personaliseScreen.hide();
  app.register_screen.hide();
  app.statusCheck();
},

submitPostcode: function() {
  var postcodeValue = document.getElementById('postcode_input').value;
  if (postcodeValue == "" || postcodeValue == null) {
    //do nothing
  } else {
    localStorage.setItem("postcode", postcodeValue);
    app.helpText.html("Select your address");
    app.btnSubmit.html("Loading...");
    app.addressList.show();
    app.postcodeInput.hide();
    console.log("hello " + postcodeValue);
    app.btnSubmit.attr("onclick","app.submitAddress()");
    // app.back_btn_pers.attr("onclick","app.personaliseClick()");
    // document.getElementById('personalise_back').innerHTML = 'Do this later';
    requestAddresses(postcodeValue);
    localStorage.setItem("postcode", postcodeValue);
    (app.addressList).empty(); //Clear list incase this isn't first time
  }
  //app.btnSubmit.prop('disabled', true);
  //app.postcodeSection.hide();
},

submitAddress: function() {
  console.log("submitted address");
  if (app.addressList.val() == "None of the above") {
    console.log("None of the above houses");
    localStorage.setItem("address", "ignore");
    app.contactInfoScreen();//Shows email and name inputs

  } else if (app.addressList.val() == null){
    //do nothing
    console.log("nothing");
  } else { //Then we must check whether house is in database
    localStorage.setItem("address", app.addressList.val());
    console.log("This is the house: " + app.addressList.val());

    var count = parseInt(localStorage.getItem("address_security_count")) || 0;

    if(count < 2) {
      checkForAddress(app.addressList.val());
      count += 1;
      localStorage.setItem("address_security_count", count.toString());
    } else {
      alert("You have tried this too many times");
    }
  }
},

populateAddressList: function(array) {
  app.btnSubmit.html("Submit");

  var option = document.createElement('option');
  option.innerHTML = "Choose here";
  option.disabled = true;
  option.selected = true;
  option.hidden = true;
  (app.addressList).append(option); //value is null

  app.disabled_list_option.html("Select here");

  array.forEach(function(entry){
    //console.log("This is the address: " + entry);
    var option = document.createElement('option');
    //option.value = entry.split("; ")[2]; //Household_id
    var address1 = entry.split(",")[0];
    var address2 = "," + entry.split(",")[1];
    //var town = entry.split(",")[4];
    if (address2 == ", ") { //If empty remove the commas
      address2 = "";
    }
    var town = "";
    option.innerHTML = address1 + address2 + town; //Hnumber, street name and town (see https://getaddress.io/Documentation);
    (app.addressList).append(option);
    option.value = entry;
  });

  var option = document.createElement('option');
  option.value = "None of the above";
  option.innerHTML = "None of the above";
  (app.addressList).append(option);
},

authorise: function() {
  app.title.html(app.label.titleAuthorise);
  $("input#free-text").val("");
  $("div#btn-other-specify").attr("onclick", "requestAutorisation()");
  app.navigateTo("name specify");
},

getDate: function() {
    // XXX this function needs to become a 'date request' - i.e. send me an email to pick a date
    var sc = localStorage.getItem('sc');
    var hh = localStorage.getItem('household_id');
    if (sc == null) {
        // send email
        console.log("Slave device > email");
        requestAutorisation();
    } else {
        // date selection
        console.log("Slave device > email");
        var getDateURL = meterURL +  "date.php";
        var dateURL = getDateURL + "?hh=" +hh+ "&sc=" + sc
        console.log("Get date" + dateURL);
        app.appScreen.hide();
        app.personaliseScreen.hide();
        app.register_screen.show();
        app.iframe_register.attr('src', dateURL);
    }
},

changeHHsurvey: function() {
    var sc = localStorage.getItem('sc');
    var hh = localStorage.getItem('household_id');
    if (hh == null) {
        // start fresh registration
        personaliseClick();
    } else {
        if (sc == null) {
            // send email
            console.log("Slave device > email");
            requestAutorisation();
        } else {
            // continue
            app.continueRegistration();
        }
    }
},

changeINDIVsurvey: function() {
  var surveyScreen = utils.get(SURVEY_STATUS);
    if (surveyScreen == null) {
        surveyScreen = 'survey root';
    }
    app.navigateTo(surveyScreen);
},

registerNewHousehold: function(registerURL) {
  console.log("Register new hh");
    app.contact_screen.hide();
  app.appScreen.hide();
  app.personaliseScreen.hide();
  app.register_screen.show();
  app.iframe_register.attr('src', registerURL);
  app.iframe_register.load(function(){
    sendMessageIframe("I am registering from the app");
    sendMessageIframe("Fill address fields#" + localStorage.getItem("address") + "#" + localStorage.getItem("postcode"));
  });
},

continueRegistration: function() {
  //var1.hostname is now just the "www.energy-use.org"
  console.log("Continue link: " + localStorage.getItem('continue_registration_link'));
  app.contact_screen.hide();
  app.appScreen.hide();
  app.personaliseScreen.hide();
  app.register_screen.show();
  app.iframe_register.attr('src', localStorage.getItem('continue_registration_link'));
},

contactInfoScreen: function() {
  app.appScreen.hide();
  app.personaliseScreen.hide();
  app.register_screen.hide();
  app.contact_screen.show();
},

showPolicy: function() {
  $("#consentLabel").html("");
  $("#dataPolicyButton").hide();
  app.iframe_consent.attr('src', app.label.dataPolicyURL);
  app.iframe_consent.load(function(){
    sendMessageIframe("App requested data policy");
  });
  app.consent.height("90%"); // for some reason the screen reduced to 50% or less
  $("#consent_frame").height("90%"); // for some reason the screen reduced to 50% or less
  $("#iframe_consent").height("90%"); // for some reason the screen reduced to 50% or less
},


givenConsent: function() {
  localStorage.setItem("consent", 1);
  app.consent.hide();
  app.appScreen.show();
  app.statusCheck();
},

};

app.initialize();
