/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

// Storage keys // PG 17 Mar 2016: I think these values are not assigned - for SURVEY_STATUS I did the assignment in "OnDeviceReady"
var meterURL = "http://www.energy-use.org/app/"

var CURR_ACTIVITY = "current_activity";
var CURR_ACTIVITY_ID = "0";  // the time use code AND category as csv

var ACTIVITY_DATETIME = "same";  // default - meaning activity time = reported time
var ACTIVITY_MANUAL_DATE = "none";  // default - if entering manual 'past time' screen promt will ask for it to be set input#input-date

var CURR_LOCATION = "current_location";
var CURR_ENJOYMENT = "current_enjoyment";
var CURR_PEOPLE = "current_people";
var ACTIVITY_LIST = "activity_list";
var SURVEY_STATUS = "survey root";			// stores how far they got in the survey

var CATEGORIES = ["care_self",
"care_other",
"care_house",
"recreation",
"travel",
"food",
"work",
"other_category"];

var TO_BE_SPECIFIED     = "other specify";
var OTHER_SPECIFIED_ID  = 9990;
var TIMEUSE_MAX   		= 10000;

var ACTIVITY_TIME_MIN 	= 10000;	// provide time as a relative offset
var ACTIVITY_TIME_MAX 	= 10100;

var ACTIVITY_SET_TIME_MIN 	= 10100; // provide time in hours and minutes
var ACTIVITY_SET_TIME_MAX 	= 11000;

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
var deviceColour  = "#990000";				// to be used for background or colour marker

var app = {
  /** Application Constructor */
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
    /** Load json files before we get going
    * has to be nested to run sequentially
    * @param {js/activities.json} contains the activities
    */
    $.getJSON('json/labels.json', function(label_data) {
      console.log("loading labels");
      app.label = label_data;
      app.initialSetup();
    }),

    $.getJSON('json/activities.json', function(data) {
      console.log("loading activities.json");
      app.activities = data.activities;
      $.getJSON('json/screens.json', function(screen_data) {
        console.log("loading screens.json");
        app.screens = screen_data.screens;
        log.init( function() {
          app.showActivityList();
          console.log("X3");
        });
      });
    });
  },

  initialSetup: function() {
    $("div#change-id").hide(); 	// replace by making the div default 'hide'
    $("div#change-date").hide(); 	// replace by making the div default 'hide'
    utils.save(ACTIVITY_DATETIME, "same");
    utils.save(ACTIVITY_MANUAL_DATE, "none");
    app.actionButtons    = $('.btn-activity');
    app.activity_list_div= $('#activity-list');
    app.activityAddPane  = $('#activity_add_pane');
    app.activityListPane = $('#activity_list_pane');
    app.choicesPane      = $('#choices_pane');
    app.title            = $("#title");
    app.header			 = $("#header");
    app.catchup		     = $('#catch-up');
    app.now_time         = $("#now-time");
    app.act_count        = $('#act-count');

    app.helpCaption		= $(".help-caption");
    app.progressListPane = $("div#progress_list_pane");
    app.footerNav		 = $("div.footer-nav");
    app.btnCaption		 = $(".btn-caption");

    // app.nav_personalise = $('#nav-personalise');
    // app.nav_survey  = $("#nav-aboutme");
    // app.nav_status  = $("#nav-status");

    app.divStatus  = $("#divStatus");
    app.imgStatus  = $("#imgStatus");
    app.lblStatus  = $("#lblStatus");

    // app.personalise = $('#personalise');
    app.personaliseScreen = $('#personalise_screen');
    app.appScreen = $('#app_screen');
    app.btnSubmit = $('#btn_submit');
    app.postcodeInput = $('#postcode_input');
    app.postcodeSection = $('#postcode_section');
    app.helpText = $('#help_text');
    app.back_btn_pers = $('#personalise_back');
    app.addressList = $('#address_list');
    app.register_screen = $('#register_screen');
    app.disabled_list_option = $('#disabled_list_option');

    app.iframe_register = $('#iframe_register');

    app.consent = $('#consent');
    app.navbar = $('#navbar');

    app.title.html(app.label.title);
    $('#actListLabel').html(app.label.actListLabel)
    $('#lblPersonalise').html(app.label.lblPersonalise)
    $('#lblSurvey').html(app.label.lblSurvey)
    $('#lblBack').html(app.label.lblBack)
    $('#lblHome').html(app.label.lblHome)
    $('#lblNext').html(app.label.lblNext)
    $('#lblDone').html(app.label.lblDone)

    $('#progress1').html(app.label.progress1)
    $('#progress2').html(app.label.progress2)
    $('#progress3').html(app.label.progress3)
    $('#progress4').html(app.label.progress4)
    $('#progress5').html(app.label.progress5)

    // The clock face behind the "Now" button
    app.nowClock		= $('#clock-now');
    app.initClock(app.nowClock);

    // clock face (move to utils?)
    app.recentClock		= $('#clock-recent');
    app.initClock(app.recentClock);

    // For time setting
    app.actClock		= $('#clock-act');
    app.actClockDiv		= $('.clock-act');
    app.initClock(app.actClock);
    app.actClock.hide();
    app.actClockDiv.hide();
    app.helpCaption.hide(); // hide help text when moving on (default off)

    app.catchup.hide();

    app.history          = new Array();
    app.act_path          = new Array();

    app.updateNowTime();
    setInterval(function(){ app.updateNowTime(); }, 10000);

    app.statusCheck();
    setInterval(function(){ app.statusCheck(); }, 3*60*60*1000);



    //console.log("Device type: " + device.platform + ", " + device.cordova + ", " + device.model + ", " + device.uuid +  ", " + device.version +  ", " + device.manufacturer + ", " + device.serial);
    /* Handled by connectionManager
    if (localStorage.getItem('metaID') == null){
    requestNextID();
  } else {
  if (localStorage.getItem('surveyUploaded') != 1 && localStorage.getItem('survey root') == 'survey complete') {
  surveyUpload(); //called if survey is complete but has not been uploaded up and we already have an ID
}
}
*/
// app.checkIfRegistered(); //(Changes the personalise button appropriately)
//app.registerNewHousehold("http://energy-use.org"); //faster debugging purposes - remove later
app.checkIfConsent(); //Shows consent screen if they havent agreed
//app.registerNewHousehold("https://nutellaplant.000webhostapp.com/hhqTestFile.php?sc=I7DpvDupHx&pg=0&id=10940");

},

initClock: function(thisClock) {
  var clock	= thisClock[0].getContext("2d");
  var r = thisClock.height()/2;
  clock.translate(r,r);
},


statusCheck: function() {
    // steps are                    condition
    // 1: personalise               hh id
    // 2: finish personalise        registration status = 'complete'
    // 3: get date                  dateChoice
    // 4: survey                    SURVEY_STATUS
    // 5: study (stars)
    // 6: return eMeter             date > dateChoice +1
    //
    var dateChoice = localStorage.getItem('dateChoice');
    var hh = localStorage.getItem('household_id');
    var registrationStatus = localStorage.getItem('registrationStatus');
    var day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(dateChoice).getDay()];
    //var day = app.label.days[new Date(dateChoice).getDay()];

    if (hh == null) {
        // personalise -> hhq
        app.title.html(app.label.titlePersonalise);
        app.lblStatus.html(app.label.lblPersonalise);
        app.divStatus.attr("onclick","app.personaliseClick()");
        app.imgStatus.attr("src","img/act2_personal.png")
    } else if (registrationStatus == null) {
        // complete registration
        app.title.html(app.label.titlePersonaliseFinish);
        app.lblStatus.html(app.label.lblPersonaliseFinish);
        app.divStatus.attr("onclick","app.continueRegistration()");
        app.imgStatus.attr("src","img/act_others1.png")
    } else if (dateChoice == null) {
        // get Date
        app.title.html(app.label.titleDate);
        app.lblStatus.html(app.label.lblDate);
        app.divStatus.attr("onclick","app.getDate()");
        app.imgStatus.attr("src","img/time_forward.png")
    } else if (new Date() < new Date(dateChoice)) {
        // wait for big day
        app.title.html(app.label.titleWait1 + day + dateChoice + app.label.titleWait2);
        app.lblStatus.html(app.label.lblWait + day + dateChoice);
        app.divStatus.attr("onclick","app.getDate()");
        app.imgStatus.attr("src","")
    } else if (utils.get(SURVEY_STATUS) != "survey complete") {
        // survey
        app.title.html(app.label.titleSurvey);
        app.lblStatus.html(app.label.lblSurvey );
        app.divStatus.attr("onclick","app.navigateTo('survey root')");
        app.imgStatus.attr("src","img/AR_4.png")
    } else if (new Date() == new Date(dateChoice)) {
        app.lblStatus.html("");
        app.divStatus.attr("onclick","app.showProgressList()");
        app.title.html(app.label.titleDay1);
        app.updateStars();
    } else {
        app.lblStatus.html("");
        app.divStatus.attr("onclick","app.showProgressList()");
        app.title.html("Meter");
    }
    //
    // XXX add Day + 2 return kit
    //
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
  var clock	= thisClock[0].getContext("2d");
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
  // the ring (inner white, grey edge)
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
  // 		app.actClockDiv.hide();
  //app.header.removeClass('alert');
  app.catchup.hide();
  app.title.show();

  app.history.push(screen_id);                     // for 'back' functionality
  if (prev_activity !== undefined) {
    if (!(prev_activity in app.activities)) {    // previous activity is defined but not known (free text)
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
      var dt_activity = utils.get(ACTIVITY_DATETIME);
      dt_activity = new Date(dt_activity);
      var dt_activity = new Date(dt_activity.getTime() +offset).toISOString();
      utils.save(ACTIVITY_DATETIME, dt_activity);
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
      log.writeSurvey(app.activities[prev_activity].title, app.activities[prev_activity].value);

      var newSurveyInput = app.activities[prev_activity].title + "," + app.activities[prev_activity].value;
      if (localStorage.getItem("surveyAnswers")==null){ //Otherwise there is a "null" value at start
      localStorage.setItem("surveyAnswers", newSurveyInput);
    } else {
      localStorage.setItem("surveyAnswers", localStorage.getItem("surveyAnswers") + "#" + newSurveyInput);
    }
    if (app.activities[prev_activity].title=="TimeExercise") { // if it is final question (survey complete)
      /* Handled by connectionManager
      if (localStorage.getItem('metaID') == null){
      console.log("reuquest next id");
      requestNextID();
    } else {
    surveyUpload();
  }
  */
}

// var icon = "0"
// document.getElementById("survey-status").src = "img/AR_"+icon+".png";
$("img#survey-status").attr("src","img/AR_progress.png");
//console.log("survey entry: " + prev_activity);
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
app.helpCaption.hide(); // hide help text when moving on (default off)
app.btnCaption.hide(); // hide help text when moving on (default off)

console.log("Screen ID: " + screen_id);
// app.personalise.hide();

if (screen_id == "home" ) {
  // an entry has been completed (incl. via "Done")
  if (prev_activity !== "ignore") {
    app.addActivityToList();
  }
  app.header.attr("onclick", "");
  app.title.removeClass("btn-box");
  app.showActivityList();
} else
if (screen_id == "activity time relative") {
  // pressed "recently" button - relative time entry followed by "activity root"
  // unlike "adjust time" which is triggered by "edit activity"
  var dt_ = Date.now()
  var dt_ = new Date(dt_).toISOString();
  utils.save(ACTIVITY_DATETIME, dt_);
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
if (screen_id == "other specify") {     // display text edit field
  console.log("SHOWING");
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
  // app.nav_survey.hide()
  app.imgStatus.attr("src","img/stars_1.png");
  // app.nav_status.show();
  app.showActivityList();
  app.choicesPane.hide();
} else
if (screen_id == "adjust time") {
  console.log("Doing nothing - just so that the <else> part doesn't remove the title action")
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
  var activityList = utils.getList(ACTIVITY_LIST) || []
  var actCount = Object.keys(activityList).length;
  app.title.html("You have recorded</br>" + actCount + " entries")
  if (actCount > 5) {
    $("img#stars2").attr("src","img/stars_on.png");
  }
  if (actCount > 10) {
    $("img#stars3").attr("src","img/stars_on.png");
  }
  if (actCount > 15) {
    $("img#stars4").attr("src","img/stars_on.png");
  }
  if (actCount > 25) {
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

  // app.checkIfRegistered(); //Will show 'personalise' or 'finish registration' button or neither

  var nowDate = new Date().toISOString().slice(0, 10);
  var nowTime = new Date().toISOString().slice(11, 16);
  var nowDT   = nowDate + " " + nowTime;
  console.log("showActivityList: " + nowDT);
  var startDT = log.start + " 16:50";

  $("div#progress_list_pane").hide();
  app.choicesPane.hide();
  // app.actClock.hide();
  $("div#other-specify").hide();

  app.title.attr("onclick", "");
  console.log("nowDT: " + nowDT + " and startDT: " +startDT);
  if (nowDT < startDT) {
    var day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(log.start).getDay()];
    if (utils.get(SURVEY_STATUS) != "survey complete") {
      app.title.html("Please record activties from <b>" + day + " at 5pm</b>. Tap here to complete the survey.");
      //app.title.attr("onclick", "app.navigateTo('survey root')");
      // $('div.contents').hide();
    } else {
      app.title.html("That's the survey done. Please start recording activties on <b>" + day + " at 5pm</b>");
    }
    //app.activityAddPane.hide();
    //app.activityListPane.hide();
    //app.waitFor5pm = setTimeout(function(){ app.showActivityList(); }, 10000);
  }
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
    thisWeekday = utils.format_weekday(item.dt_activity);
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
    '<div class="activity-time activity-item">' + utils.format_dt_AMPM(item.dt_activity) + '</div>' +
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
  app.actClockDiv.hide()
  app.showCatchupItem(); // overwrites app.title if catchup items exist
},

showCatchupItem: function() {
  // test for catchup items in list and display if applies
  // drop (shift) catchup items more than 8 ours old
  if (Date(catchupList[0]) in window) { //If this variable exists (otherwise we get an error)
    while ((new Date() - new Date(catchupList[0])) > (8*60*60*1000)) {
      catchupList.shift();
      if (!catchupList.length) {
        break;
      }
    }
  }

  // find most recent item that is in the past (starting from the back)
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
  var dt_recorded = new Date().toISOString();
  var dt_act;
  if (utils.get(ACTIVITY_DATETIME) == "same") {
    dt_act = dt_recorded;
  } else {
    dt_act = utils.get(ACTIVITY_DATETIME);
  }
  var actID = utils.actID(dt_act)

  // trim trailing milliseconds and the trailing 'Z' upsetting mySQL datetime
  dt_act      = dt_act.substring(0,19);
  dt_recorded = dt_recorded.substring(0,19);
  activityList = utils.getList(ACTIVITY_LIST) || {};
  activityList[actID] = {
    "key"		: utils.get(CURR_ACTIVITY),
    "Meta_idMeta": log.id,
    "dt_activity": utils.getDateTimeStr(dt_act),
    "dt_recorded": utils.getDateTimeStr(dt_recorded),
    "location"  : utils.get(CURR_LOCATION),
    "people"	: utils.get(CURR_PEOPLE),
    "enjoyment"	: utils.get(CURR_ENJOYMENT),
    "tuc"		: utils.get(CURR_ACTIVITY_ID).split(",")[0],
    "category"	: utils.get(CURR_ACTIVITY_ID).split(",")[1],
    "activity"	: utils.get(CURR_ACTIVITY_ID).split(",")[2],
    "path"		: app.act_path.join()
  }
  utils.saveList(ACTIVITY_LIST, activityList);
  // log.rewriteFile(log.ActJSON, JSON.stringify(activityList)); //write to sdcard files only if on the old Alcatel phones
  // var newActivityToUpload = '"' + actID + '":' + JSON.stringify(activityList[actID]);
  var newActivityList = activityList[actID]['dt_activity'] + "#" + activityList[actID]['dt_recorded'] + "#"  + activityList[actID]['tuc'] + "#"  + activityList[actID]['activity'] + "#" + activityList[actID]['location'] + "#" +  activityList[actID]['enjoyment'] + "#" + activityList[actID]['category'] + "#" + activityList[actID]['people'] + "#" + activityList[actID]['path'] + "#" + activityList[actID]['key'];
  // activityList[actID]['key'] + "#" + activityList[actID]['Meta_idMeta'] + "#"
  // JSON.stringify(activityList[actID]);
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
      utils.saveList(ACTIVITY_LIST, activityList)
    }
  }
},

editActivityScreen: function (actKey) {
  // this is a special case of "navigateTo":
  // instead of "next screen", onclick() points to specific functions
  var activityList = utils.getList(ACTIVITY_LIST) || {};
  var item = activityList[actKey];
  app.title.html(utils.extractTimeStr(item.dt_activity) + ": " + item.activity)
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
  utils.save(ACTIVITY_DATETIME, thisAct.dt_activity);
  utils.save(CURR_ACTIVITY, thisAct.key);
  utils.save(CURR_ACTIVITY_ID, [thisAct.tuc, thisAct.category, thisAct.activity].join());
  utils.save(CURR_LOCATION, thisAct.location);
  utils.save(CURR_PEOPLE, thisAct.people);
  utils.save(CURR_ENJOYMENT, thisAct.enjoyment);
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
  var cat = detailsArray[1];			// .category
  var act = $("input#free-text").val();
  utils.save(CURR_ACTIVITY_ID, [tuc, cat, act].join());
  app.navigateTo("home")
},
submitOther: function() {
  var prev_activity = $("input#free-text").val();
  $("div#other-specify").hide();
  app.navigateTo("other people", prev_activity)
},

toggleCaption: function() {
  app.btnCaption.toggle();
  app.helpCaption.toggle();
},

personaliseClick: function() { //Goes to the screen with the postcode input
  if (localStorage.getItem('metaID') == null){
    //requestNextID(); //this should only ever happen once unless no ID is returned from SQL
  } // "null" ^ because we don't need to execute any function after wards
  app.appScreen.hide();
  app.addressList.hide();
  app.personaliseScreen.show();
  app.postcodeInput.show();
  app.btnSubmit.attr("onclick","app.submitPostcode()");
  document.getElementById('personalise_back').innerHTML = 'Do this later';
  app.back_btn_pers.attr("onclick","app.returnToMainScreen()");
  app.btnSubmit.html("Submit");
  app.helpText.html("Enter your postcode");
},

returnToMainScreen: function() {
  console.log("returning");
  app.appScreen.show();
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
    app.back_btn_pers.attr("onclick","app.personaliseClick()");
    document.getElementById('personalise_back').innerHTML = 'Do this later';
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
    app.registerNewHousehold("http://energy-use.org/app");

    //app.registerNewHousehold("https://nutellaplant.000webhostapp.com/hhqTestFile.php?sc=I7DpvDupHx&pg=0&id=10940");
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

    /*localStorage.setItem('household_id', app.addressList.val()); //Useful to store it if we are unable to connect now (this is storing the Household_id)
    if (localStorage.getItem('metaID') == null){
    //requestNextID(linkHousehold); //We need a User ID to be able to link it to the household id
  } else {
  linkHousehold(); //(in upload.js)
}
app.returnToMainScreen();
*/
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
    option.innerHTML = address1 + address2 + town; //Hnumber, street name and town (see https://getaddress.io/Documentation)
    (app.addressList).append(option);
    option.value = entry;
  });

  var option = document.createElement('option');
  option.value = "None of the above";
  option.innerHTML = "None of the above";
  (app.addressList).append(option);
},

// checkIfRegistered: function() { //Called onDeviceReady and when returning to main screen
//   if (localStorage.getItem('household_id') != null) {                  // HH id present
//     if (localStorage.getItem('registrationStatus') != null) {  // form wasn't finished
//         console.log("Have incomplete HH id");
//         // app.nav_personalise.show();
//         // app.nav_personalise.html(app.label.lblPersonaliseFinish);
//         // app.nav_personalise.attr("onclick","app.continueRegistration()");
//         app.divStatus.html(app.label.lblPersonaliseFinish);
//         app.divStatus.attr("onclick","app.continueRegistration()");
//     } else {                                                        // completed HH - hide personalise
//         console.log("Have complete HH id");
//         app.nav_personalise.hide();
//         // $("div#nav-aboutme").show();                         // AR activate by dateChoice
//     }
//   } else {
//     console.log("No HH id");
//     app.nav_personalise.show();  //Hide "personalise button" as they have already completed it
//   }
// },

getDate: function() {
  var getDateURL = meterURL +  "date.php";
  var sc = localStorage.getItem('sc');
  var hh = localStorage.getItem('household_id');
  var dateURL = getDateURL + "?hh=" +hh+ "&sc=" + sc
  console.log("Get date" + dateURL);
  app.appScreen.hide();
  app.personaliseScreen.hide();
  app.register_screen.show();
  app.iframe_register.attr('src', dateURL);
//   app.iframe_register.ready(function(){
//   sendMessageIframe("Getting date from app");
//   });
},

registerNewHousehold: function(registerURL) {
  console.log("Register new hh");
  app.appScreen.hide();
  app.personaliseScreen.hide();
  app.register_screen.show();
  app.iframe_register.attr('src', registerURL);
  app.iframe_register.load(function(){
    console.log("Hello");
    sendMessageIframe("I am registering from the app");
    sendMessageIframe("Fill address fields#" + localStorage.getItem("address") + "#" + localStorage.getItem("postcode"));
  });
},

continueRegistration: function() {
  //var1.hostname is now just the "www.energy-use.org"
  if (localStorage.getItem('continue_registration_link') == null || localStorage.getItem('continue_registration_link') == "" || localStorage.getItem('continue_registration_link')=="http://energy-use.org/app/hhq.php"){
    continueRegistrationLink = "http://energy-use.org/app";
  } else {
    continueRegistrationLink = localStorage.getItem('continue_registration_link');
    var var1 = document.createElement ('a');
    var1.href = continueRegistrationLink;
    if (var1.hostname != "energy-use.org") { //A method of making sure the domain of the url is energy-use.org
      continueRegistrationLink = "http://energy-use.org/app";
    }
    console.log(continueRegistrationLink);
  }
  //If URL is not set or not on the energy-use.org domain, reset it.
  console.log(continueRegistrationLink);
  app.registerNewHousehold(continueRegistrationLink);
},

checkIfConsent: function() {
  if (localStorage.getItem("consent")==null) {
    app.consent.show();
    app.appScreen.hide();
    app.navbar.hide();
  }
},

givenConsent: function() {
  localStorage.setItem("consent", 1);
  app.consent.hide();
  app.appScreen.show();
  app.navbar.show();
},



};

app.initialize();
