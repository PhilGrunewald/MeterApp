/*
* Meter Activity App
*/

if (localStorage.getItem('language') == null) {
    var localLanguage = navigator.language.split("-")[0]
    if (localLanguage == 'de') {
        localStorage.setItem('language', localLanguage);
        console.log("Language is " + localLanguage + " - will use German")
    } else {
        if (navigator.language.split("-")[1] == 'US') {
            localStorage.setItem('language', 'us');
            console.log("Language is " + localLanguage + " - will use U.S. English")
        } else {
        localStorage.setItem('language', 'en');
        console.log("Language is " + localLanguage + " - will use English")
        }
    }
}

var appVersion = "1.1.12";
var meterURL = "https://www.energy-use.org/app/"

// var CATEGORIES = ["new", "function", "assign", "care_self", "care_other", "care_house", "recreation", "travel", "food", "work", "other_category", "blank","location", "people", "enjoyment"];

var app = {
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

  loadJSON: async function(jsonName,language) {
    //if (localStorage.getItem(jsonName) == null) {
      const response = await fetch(`text/${jsonName}-${language}.json`)
      // XXX const response = await fetch(`${meterURL}/json/${jsonName}.json`)
      const json     = await response.json();
      localStorage.setItem(jsonName, JSON.stringify(json));
    //}
   return JSON.parse(localStorage.getItem(jsonName));
  },

  loadText: async function() {
    const language = localStorage.getItem('language');
    [app.label, app.activities, app.screens] = await Promise.all([
        app.loadJSON('labels',language),
        app.loadJSON('activities',language),
        app.loadJSON('screens',language)
        ]); // .then(values => { console.log("VALUES XX", values); });

    if (localStorage.getItem("customActivities") != null) {
        // custom activities have been assigned - these overwrite the default activities
        cActs = JSON.parse(localStorage.getItem("customActivities"));
        for (act in cActs) {
            cAct = cActs[act];
            for (item in cAct) { app.activities[act][item] = cActs[act][item]; }
        }
    }

    // does a local record of activities exist?
    if (localStorage.getItem("acts") == null) {
        localStorage.setItem("acts", JSON.stringify({}));
        localStorage.setItem('key', 0);
    }

    // CONSENT?
    if (localStorage.getItem("consent") == 1) {
      // XXX app.navigateTo("menu") 
      app.moveTo("menu");
    } else {
        app.navbar.hide();
        app.server.attr('src', 'https://www.energy-use.org/app/consent.php');
        app.server.show(); 
    }

        $('#dataPolicyButton').html(app.label.dataPolicyButton);
        $('#actListLabel').html(app.label.actListLabel);
        $('#lblPersonalise').html(app.label.lblPersonalise);
        $('#lblSurvey').html(app.label.lblSurvey);
        $('#lblBack').html(app.label.lblBack);
        $('#lblHome').html(app.label.lblHome);
        $('#lblNext').html(app.label.lblNext);
        $('#lblDone').html(app.label.lblDone);
        $('#btn-other-specify').html(app.label.btnOther);
        $('#progress-authorise').html(app.label.Authorise)
        $('#help-btn-now').html(app.label.help.btnNow);
        $('#help-btn-recent').html(app.label.help.btnRecent);
        $('#help-act-list').html(app.label.help.actList);
        $('#help-post-code').html(app.label.help.postcode);
        $('#help-contact-details').html(app.label.help.contactDetails);
        app.updateNowTime();
        setInterval(function(){ app.updateNowTime(); }, 10000); // 10 second clock update
   },

  initialSetup: function() {
    app.actionButtons        = $('.btn-activity');
    app.activity_list_div    = $('#activity-list');
    app.activityAddPane      = $('#activity_add_pane');
    app.activityListPane     = $('#activity_list_pane');
    app.choicesPane          = $('#choices_pane');
    app.title                = $("#title");
    app.header               = $("#header");
    app.now_time             = $("#now-time");
    app.helpCaption          = $(".help-caption");
    app.footerNav            = $("div.footer-nav");
    app.btnCaption           = $(".btn-caption");
    app.imgStatus            = $("#imgStatus");
    app.personaliseScreen    = $('#personalise_screen');
    app.appScreen            = $('#app_screen');
    app.btnSubmit            = $('#btn_submit');
    app.postcodeInput        = $('#postcode_input');
    app.postcodeSection      = $('#postcode_section');
    app.helpText             = $('#help_text');
    app.addressList          = $('#address_list');
    app.contact_screen       = $('#contact_screen');
    app.disabled_list_option = $('#disabled_list_option');
    app.server               = $('#server'); // iframe displaying server side php
    app.navbar               = $('#navbar');


    // The clock face behind the "Now" button
    clock.nowClock        = $('#clock-now');
    clock.initClock(clock.nowClock);

    // clock face (move to utils?);
    clock.recentClock     = $('#clock-recent');
    clock.initClock(clock.recentClock);

    // For time setting
    clock.actClock        = $('#clock-act');
    clock.actClockDiv     = $('.clock-act');
    clock.initClock(clock.actClock);
    clock.actClock.hide();
    clock.actClockDiv.hide();

    app.helpCaption.hide(); // hide help text when moving on (default off);
    app.history          = new Array();
    app.act_path         = new Array();
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
    var waitForAuthorisation = localStorage.getItem('AwaitAuthorisation');

  // Individual Survey
  if (localStorage.getItem("survey root") == 'survey complete') {
    app.activities['IndividualSurvey']['icon'] = "act3_user_green";
  }

  if (localStorage.getItem("householdSurvey") == 'COMPLETE') {
    app.activities['Register']['icon'] = "act3_home_green";
    if (localStorage.getItem("survey root") == 'survey complete') {
        app.imgStatus.attr("src","img/act3_user_green.png");
    }
  }
},

showStars: function() {
    // activityList = utils.getList(ACTIVITY_LIST) || {};
    // var actCount = Object.keys(activityList).length;
    var actCount = localStorage.getItem('ActivityCount');
    if (actCount > 4) {
          app.imgStatus.attr("src","img/act3_user_star.png");
    }
    //if (actCount > 24) {
    //  app.imgStatus.attr("src","img/stars_5.png");
    //} else if (actCount > 14) {
    //  app.imgStatus.attr("src","img/stars_4.png");
    //} else if (actCount > 9) {
    //  app.imgStatus.attr("src","img/stars_3.png");
    //} else if (actCount > 4) {
    //  app.imgStatus.attr("src","img/stars_2.png");
    //} else if (actCount > 0) {
    //  app.imgStatus.attr("src","img/stars_1.png");
    //} else {
    //  app.imgStatus.attr("src","img/stars_0.png");
    //}
    //app.imgStatus.show();
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

    clock.drawClock(clock.nowClock,hour,min,app.label.now, hour + ':' + minutes);
    clock.drawClock(clock.recentClock,hour,min, app.label.recently, "back arrow");
},

getAct: function() { // returns current activity
    const key = localStorage.getItem('key');
    const acts = JSON.parse(localStorage.getItem('acts'));
    console.log(acts,key);
    return acts[key];
},

formatString: function(str) {
    if (str.startsWith('_')) {
        const act = app.getAct();
        var dt = new Date(act.dt_activity);
        const min = parseInt(str.split('_')[1])
        dt = new Date(dt.getTime() + (60000*min));
        return `${min} min<br>${dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else
    if (str == '${rel_time}') {
        const act = app.getAct();
        const dt = new Date(act.dt_activity);
        return dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
        return str
    }
},

moveFrom: function(from) {
    const act = app.activities[from];
    var   key = localStorage.getItem('key');
    var  acts = JSON.parse(localStorage.getItem('acts'));

    console.log(act.category);
    switch(act.category) {
        case "abort":
            app.deleteAct(key); // bin current entry
        case "new":
            // high-precision time as key
            key = performance.now().toString();
            localStorage.setItem('key',key);
            acts[key] = {};
            acts[key]['dt_recorded'] = new Date();
            acts[key]['dt_activity'] = new Date();
            acts[key]['Meta_idMeta'] = localStorage.getItem('metaID');
            acts[key]['path'] = [];
            break;
        case "time":
            var dt = new Date(acts[key]['dt_activity']);
            acts[key]['dt_activity'] = new Date(dt.getTime() + (60000*act.value));
            break;
        case "location":
            acts[key]['location'] = act.value;
            break;
        case "people":
            acts[key]['people'] = act.value;
            break;
        case "enjoyment":
            acts[key]['enjoyment'] = act.value;
            break;
        case "text":
            acts[key]['title'] = document.getElementById('freetext').value;
            break;
        case "assign":
            // overwrite the activities JSON for e.g. "C1*" and "C1"
            app.activities[from]['title']   = acts[key]['title'];
            app.activities[from]['caption'] = acts[key]['title'];
            app.activities[from.slice(0,-1)]['title']   = acts[key]['title'];
            app.activities[from.slice(0,-1)]['caption'] = acts[key]['title'];
            localStorage.setItem('activities', JSON.stringify(app.activities));
        case "skip":
            console.log("skipping");
            break;
        case "server":
            $('#server').attr('src',`${meterURL}${act.url}`);
            console.log(`server: ${act.url}`);
            break;
        default:
            acts[key]['key']  = from;
            acts[key]['tuc']  = act.ID;
            acts[key]['title']  = act.title;
            document.getElementById('freetext').value = act.title;
            acts[key]['category'] = act.category;
    }
    if (key in acts) {acts[key]['path'].push(act.ID)}; // 'if' for server use (key could be '')
    localStorage.setItem('acts',JSON.stringify(acts));
},

defaultView: function() {
    $('#input').hide();
    $('#server').hide();
    $('#clocks').hide();
    $('#list').hide();

    $('#header').show();
    $('#buttons').show();
    $('#footer').hide();
},

moveTo: function(to) {
    const screen = app.screens[to];
    app.defaultView();
    app.title.html(app.formatString(screen.title));
    app.history.push(to);        // for 'back' functionality
    console.log(`move to ${to}`);
    switch(to) {
        case "home":
            app.listActivities();
            app.history = new Array();
            $('#clocks').show();
            $('#list').show();
            $('#buttons').hide();
            localStorage.getItem('key',''); // prevent nav homeAbort to delete most recent
            break;
        // case "other specify":
        case "server":
            $('#server').show();
            $('#header').hide();
            $('#buttons').hide();
            break;
        case "freetext":
            $('#input').show();
            // no break!
        default:
            var btn;
            var actKey;
            var act;
            for (i=0; i<6; i++) {
                actKey = screen.activities[i];
                act    = app.activities[actKey];
                btn = $(`#button${i+1}`);
                $(`#title${i+1}`).html(app.formatString(act.caption));
                $(`#caption${i+1}`).html(act.help);
                //CATEGORIES.forEach(function (cat) { btn.removeClass(cat); });
                //btn.addClass(act.category);
                document.getElementById(`button${i+1}`).className = `btn-activity col ${act.category}`;
                document.getElementById(`button${i+1}`).style.backgroundImage = `url('img/${act.icon}.png')`;
                if (act.category == 'function') {
                    btn.attr("onclick", act.next);
                } else {
                    btn.attr("onclick", `app.moveFromTo('${actKey}','${act.next}')`);
                }
            }
            if (to != "menu") {$('#footer').show();}
    }
},

moveFromTo: function(from, to) {
    app.moveFrom(from);
    app.moveTo(to);
},

deleteAct: function(key) {
    var acts = JSON.parse(localStorage.getItem('acts'));
    delete acts[key];
    localStorage.setItem('acts',JSON.stringify(acts));
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

changeTime: function(key) {
    localStorage.setItem('key',key);
    app.moveTo('adjust time');
    document.getElementById('title').onclick = function() { app.moveTo('home') };
    document.getElementById('foot-right').onclick = function() { app.moveTo('home') };
    document.getElementById('foot-right-lbl').innerHTML = app.label.lblDone;
},

changeTitle: function(key) {
    localStorage.setItem('key',key);
    var  acts = JSON.parse(localStorage.getItem('acts'));
    document.getElementById('freetext').value = acts[key]['title'];
    app.moveTo('freetext');
},

updateTitle: function() {
    const key = localStorage.getItem('key');
    var  acts = JSON.parse(localStorage.getItem('acts'));
    console.log("ACT KEY:",acts[key]);
    acts[key]['title'] = document.getElementById('text').value;
    localStorage.setItem('acts',JSON.stringify(acts));
    app.moveTo('home');
},

changeEnj: function(key) {
    localStorage.setItem('key',key);
    app.moveTo('enjoyment');
    document.getElementById('foot-right').onclick = function() { app.moveTo('home') };
    document.getElementById('foot-right-lbl').innerHTML = app.label.lblDone;
},

listActivities: function() {
  document.getElementById('list').innerHTML = ''; // start afresh
  var acts = JSON.parse(localStorage.getItem('acts'));
  for (var key in acts) {
      var act = acts[key];
      var row = document.createElement('div');
          row.className = `activity-row ${act.category}`;
      var time = document.createElement('div');
          time.className = 'activity-item activity-time';
          time.setAttribute("onclick",`app.changeTime("${key}")`);
          var dt = new Date(act.dt_activity);
          time.innerHTML = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      var title = document.createElement('div');
          title.className = 'activity-item';
          title.setAttribute("onclick",`app.changeTitle("${key}")`);
          title.innerHTML = act.title;
      var divImg = document.createElement('div');
          divImg.className = 'activity-item';
      var actImg = document.createElement('img');
          actImg.className = 'activity-icon';
          actImg.src = `img/${app.activities[act.key].icon}.png`;
      var divEnj = document.createElement('div');
          divEnj.className = 'activity-item';
          divEnj.setAttribute("onclick",`app.changeEnj("${key}")`);
      var actEnj = document.createElement('img');
          actEnj.className = 'activity-icon';
          actEnj.src = `img/enjoy_${act.enjoyment}.png`;
      document.getElementById('list').appendChild(row);
      row.appendChild(time);
      row.appendChild(title);
      row.appendChild(divImg);
        divImg.appendChild(actImg);
      row.appendChild(divEnj);
        divEnj.appendChild(actEnj);
  }
},

showActivityList: function() {
  // only used on home screen
  // used as a proxy for 'being home'
  // thus populate the title and do some of the hiding

  app.title.html(app.screens['home'].title);
  app.statusCheck();
  app.returnToMainScreen();
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
    var dt  = utils.getDate(item.dt_activity)
    // var dt  = new Date(item.dt_activity.replace(" ","T"))
    // dt.setTime( dt.getTime() + dt.getTimezoneOffset()*60*1000 );
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
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

    // special case for our own labels (Study starts/ends; Intervention starts/ends)
    if (activity.category == 'study' || activity.category == 'intervention') {
        actsHTML +='<div class="activity-row '+activity.category+'"><div class="study-item">' + activity.title + hhmm + '</div></div>';
    } else {
    actsHTML +=
    '<div class="activity-row ' + item.category + '" onClick="app.editActivityScreen(\'' + key + '\')">' +
    '<div class="activity-time activity-item">' + hhmm + '</div>' +
    '<div class="activity-item">' + item.activity  + '</div> ' +
    '<div class="activity-icon activity-item"><img class="activity-icon" src="img/'+activity.icon+'.png"></div>'+
    '<div class="activity-icon activity-item"><img class="activity-icon" src="img/loc_'+item.location+'.png"></div>'+
    '<div class="activity-icon activity-item"><img class="activity-icon" src="img/enjoy_'+item.enjoyment+'.png"></div>'+
    '</div>';
      }
  }
  app.activity_list_div.html(actsHTML);
  $('div.contents').animate({ scrollTop: 0 }, 'slow'); // only needed when using the home button on the home screen after having scrolled down
  app.updateNowTime();
  clock.actClockDiv.hide();
},



addActivityToList: function() {
  // 2 Lists: local ACTIVITY_LIST and logActJSON file
  var dt_recorded = new Date(); // .toISOString();
  var dt_act;
  if (utils.get(ACTIVITY_DATETIME) == "same") {
    dt_act = dt_recorded;
  } else {
    dt_act = utils.getDate(utils.get(ACTIVITY_DATETIME));// .replace(" ","T"));
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
  utils.save(CURR_ENJOYMENT, 0);
  utils.save(CURR_PEOPLE, "-1");

  actCount = localStorage.getItem('ActivityCount');
  if (actCount != null) {
      localStorage.setItem('ActivityCount', parseInt(actCount) + 1)
  } else {
      localStorage.setItem('ActivityCount', 1)
  }
},

submitHHid: function() {
    // Special submission case for non UK participants via HH id
    var hhID = $("input#free-text").val();
    localStorage.removeItem('metaID');          // get new metaID
    localStorage.setItem('household_id', hhID);
    localStorage.removeItem('householdStatus'); // for connection manager "not linked yet"
    linkHousehold(hhID);

    localStorage.setItem('householdSurvey', 'COMPLETE');
    app.returnToMainScreen();
    app.title.html("HH ID set to " + hhID);
},


toggleCaption: function() {
  app.btnCaption.toggle();
  app.helpCaption.toggle();
},


emailData: function() {
  if (localStorage.getItem('Online') == "true"){
    requestEmailData();
    app.title.html(app.label.titleEmailData);
    app.navigateTo("home");
    $("input#free-text").val("");
  } else {
    app.title.html(app.label.noInternet);
  }
},

showHelp: function() {
  if (localStorage.getItem('Online') == 'true') {
    var idMeta = localStorage.getItem('metaID');
    var helpURL = app.label.helpURL;
    app.title.html("Help"); 
    app.choicesPane.hide();
    app.server.show(); 
    app.server.attr('src', helpURL);
    app.server.load(function(){
        sendMessageIframe("App requested help");
    });
  } else {
    app.title.html(app.label.noInternet);
  }
},

showProfile: function() {
  if (localStorage.getItem('Online') == 'true') {
    var idMeta = localStorage.getItem('metaID');
    var profileURL = app.label.profileURL + idMeta;
    console.log("URL:" + profileURL);
    app.header.hide(); 
    app.choicesPane.hide();
    app.server.show(); 
    app.server.attr('src', profileURL);
    app.server.load(function(){
        sendMessageIframe("App requested profile");
    });
  } else {
    app.title.html(app.label.noInternet);
  }
},

showEnjoyment: function() {
  var activityList = utils.getList(ACTIVITY_LIST) || []
  var actCount = Object.keys(activityList).length;
  if (actCount == 0) {
    app.title.html(app.label.noActivities);
  }
  else if (localStorage.getItem('Online') != null) {
    var idMeta = localStorage.getItem('metaID');
    var enjoymentURL = app.label.enjoymentURL + idMeta;
    app.header.hide(); 
    app.choicesPane.hide();
    app.server.show(); 
    app.server.attr('src', enjoymentURL);
    app.server.load(function(){
        sendMessageIframe("App requested enjoyment");
    });
  } else {
    app.title.html(app.label.noInternet);
  }
},

};

app.initialize();
