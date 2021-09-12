/*
* Meter Activity App
*/
var appVersion = "1.1.12";
var meterURL = "https://www.energy-use.org/app/"

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
    if (localStorage.getItem(jsonName) != null) {
        const response = await fetch(`text/${jsonName}-${language}.json`)
        // XXX const response = await fetch(`${meterURL}/json/${jsonName}.json`)
        const json     = await response.json();
        localStorage.setItem(jsonName, JSON.stringify(json));
    }
    return JSON.parse(localStorage.getItem(jsonName));
},

loadText: async function() {
    var language = navigator.language.split("-")[0]
    switch(language) {
      case 'de':
        localStorage.setItem('language', localLanguage);
      case 'US':
        localStorage.setItem('language', 'us');
      default:
        localStorage.setItem('language', 'en');
    }
    language = localStorage.getItem('language');
    [app.label, app.activities, app.screens] = await Promise.all([
        app.loadJSON('labels',language),
        app.loadJSON('activities',language),
        app.loadJSON('screens',language)
        ]);

    //if (localStorage.getItem("customActivities") != null) {
    //    // custom activities have been assigned - these overwrite the default activities
    //    cActs = JSON.parse(localStorage.getItem("customActivities"));
    //    for (act in cActs) {
    //        cAct = cActs[act];
    //        for (item in cAct) { app.activities[act][item] = cActs[act][item]; }
    //    }
    //}

    // does a local record of activities exist?
    if (localStorage.getItem("acts") == null) {
        localStorage.setItem("acts", JSON.stringify({}));
        localStorage.setItem('key', 0);
        localStorage.setItem('index', 0);
    }

    // CONSENT?
    if (localStorage.getItem("consent") == 1) {
        app.moveTo("menu");
    } else {
        $('#navbar').hide();
        $('#server').attr('src', 'https://www.energy-use.org/app/consent.php');
        $('#server').show(); 
    }

    $('#actListLabel').html(app.label.actListLabel);
    $('#lblBack').html(app.label.lblBack);
    $('#lblHome').html(app.label.lblHome);
    $('#lblNext').html(app.label.lblNext);
    $('#lblDone').html(app.label.lblDone);
    setInterval(function(){ app.updateNowTime(); }, 10000); // 10 second clock update
   },

  initialSetup: function() {
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
    app.history          = new Array();
    app.act_path         = new Array();
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
    return acts[key];
},

formatString: function(str) {
    if (str.startsWith('_')) {
        const act = app.getAct();
        var dt = new Date(act.dt_activity);
        const min = parseInt(str.split('_')[1])
        dt = new Date(dt.getTime() + (60000*min));
        str = `${min} min<br>${dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    if (str.includes('${time}')) {
        console.log("TIME:",str);
        const act = app.getAct();
        const dt = new Date(act.dt_activity);
        str = str.replace('${time}', dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }
    return str
},

newKey: async function(acts,key,dt) {
    return acts;
},
moveFrom: async function(from) {
    const act = app.activities[from];
    var   key = localStorage.getItem('key');
    var  acts = JSON.parse(localStorage.getItem('acts'));
    console.log("move from: ",act.category);
    switch(act.category) {
        case "abort":
            delete acts[key]
            key = '';
            localStorage.setItem('key',key);
            break;
        case "new":
            localStorage.setItem('index', parseInt(localStorage.getItem('index'))+1);
            key = `${Number(new Date())}_${localStorage.getItem('index')}`;
            localStorage.setItem('key',key);
            acts[key] = {};
            acts[key]['dt_recorded'] = new Date();
            acts[key]['dt_activity'] = new Date();
            acts[key]['Meta_idMeta'] = localStorage.getItem('metaID');
            acts[key]['path'] = [];
            app.setFooter('next');
            break;
        case "time":
            var actVals = acts[key];
            var dt = new Date(actVals['dt_activity']);
            dt = new Date(dt.getTime() + (60000*act.value));
            const newKey = `${Number(dt)}_${localStorage.getItem('index')}`;
            localStorage.setItem('key',newKey);
            actVals['dt_activity'] = dt;
            acts[newKey] = actVals;
            delete acts[key]
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
            acts[key]['category'] = act.category;
            document.getElementById('freetext').value = act.title;
            app.setFooter('done');
    }
    if (key in acts) {acts[key]['path'].push(act.ID)}; // 'if' for server use (key could be '')
    localStorage.setItem('acts',JSON.stringify(acts));
    console.log(acts);
},

moveTo: function(to) {
    console.log(`move to ${to}`);
    const screen = app.screens[to];
    $('#title').html(app.formatString(screen.title));
    app.history.push(to);        // for 'back'
    app.defaultView();
    if (to == "server") {
        $('#server').show();
        $('#header').hide();
    } else {
        var btn;
        var actKey;
        var act;
        for (i=0; i<6; i++) {
            actKey = screen.activities[i];
            act    = app.activities[actKey];
            btn = $(`#button${i+1}`);
            $(`#title${i+1}`).html(app.formatString(act.caption));
            $(`#caption${i+1}`).html(act.help);
            document.getElementById(`button${i+1}`).className = `btn-activity col ${act.category}`;
            document.getElementById(`button${i+1}`).style.backgroundImage = `url('img/${act.icon}.png')`;
            if (act.category == 'function') {
                btn.attr("onclick", act.next);
            } else {
                btn.attr("onclick", `app.moveFromTo('${actKey}','${act.next}')`);
            }
        }
        $('#buttons').hide();
        $('#buttons').show();
    }
    switch(to) {
        case "home":
            app.setNav('nav-home');
            app.listActivities();
            app.history = new Array();
            $('#list').show();
            $('#footer').hide();
            break;
        case "user":
            app.setNav('nav-user');
            break;
        case "menu":
            app.setNav('nav-menu');
            $('#footer').hide();
            break;
        case "help":
            app.setNav('nav-help');
            break;
        case "freetext":
            $('#input').show();
    }
},

moveFromTo: function(from, to) {
    document.getElementById('buttons').style.animation = '0.5s ease-out 0s 1 slideIn';
    app.moveFrom(from);
    app.moveTo(to);
},

setFooter: function(setting) {
    switch(setting) {
        case 'next':
            document.getElementById('foot-right-lbl').innerHTML = app.label.lblNext;
            document.getElementById('foot-right-img').src = 'img/nav_next.png';
            document.getElementById('foot-right').setAttribute("onclick", "app.moveTo('activity root')");
            break;
        case 'done':
            document.getElementById('foot-right-lbl').innerHTML = app.label.lblDone;
            document.getElementById('foot-right-img').src = 'img/nav_done.png';
            document.getElementById('foot-right').setAttribute("onclick", "app.moveTo('home')");
            break;
        case 'abort':
            document.getElementById('foot-right-lbl').innerHTML = app.label.lblAbort;
            document.getElementById('foot-right-img').src = 'img/edit_delete.png';
            document.getElementById('foot-right').setAttribute("onclick", "app.moveTo('home')");
    }
},

defaultView: function() {
    $('#input').hide();
    $('#server').hide();
    $('#clocks').hide();
    $('#list').hide();
    $('#header').show();
    $('#buttons').hide();
    $('#footer').show();
},

setNav: function(on) {
    document.getElementById('nav-menu').style.background = '#eee';
    document.getElementById('nav-home').style.background = '#eee';
    document.getElementById('nav-user').style.background = '#eee';
    document.getElementById('nav-help').style.background = '#eee';
    document.getElementById(on).style.background = '#ded';
},

deleteAct: async function(key) {
    var acts = JSON.parse(localStorage.getItem('acts'));
    await delete acts[key];
    await localStorage.setItem('acts',JSON.stringify(acts));
},

changeTime: function(key) {
    localStorage.setItem('key',key);
    app.setFooter('done');
    app.moveTo('adjust time');
    document.getElementById('title').onclick = function() { app.moveTo('home') };
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
    app.setFooter('done');
},

listActivities: function() {
  document.getElementById('list').innerHTML = ''; // start afresh
  const options = { weekday: 'long', day: 'numeric', month: 'short'};
  var acts = JSON.parse(localStorage.getItem('acts'));
  var keys = Object.keys(acts).sort().reverse();
  var weekday = '';
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var act = acts[key];
    if ('tuc' in act) {
          var dt = new Date(act.dt_activity);
          thisWeekday = dt.toLocaleString(app.label.locale, options);
          if (weekday != thisWeekday) { // add date row
          var row = document.createElement('div');
              row.className = 'activity-row date';
              row.innerHTML = thisWeekday;
              document.getElementById('list').appendChild(row);
              weekday = thisWeekday;
          }
          var row = document.createElement('div');
              row.className = `activity-row ${act.category}`;
          var time = document.createElement('div');
              time.className = 'activity-item activity-time';
              time.setAttribute("onclick",`app.changeTime("${key}")`);
              time.innerHTML = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          var title = document.createElement('div');
              title.className = 'activity-item';
              title.setAttribute("onclick",`app.changeTitle("${key}")`);
              title.innerHTML = act.title;
          var divImg = document.createElement('div');
              divImg.className = 'activity-item';
          var actImg = document.createElement('img');
              actImg.className = 'activity-icon';
              //actImg.src = `img/${app.activities[act.key].icon}.png`;
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
      } else {
          app.deleteAct(key);
      }
  }
},

goBack: function() {
  app.history.pop(); // remove current
  const prev = app.history.pop();
  document.getElementById('buttons').style.animation = '0.5s ease-out 0s 1 slideBack';
  if (prev === undefined) {
      app.moveTo("home");
  } else {
      app.moveTo(prev);
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


/*

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
*/
