/*
* Meter Activity App
*/
var appVersion = "1.1.12";
// var meterURL = "https://www.energy-use.org/app/"
var meterURL = "http://localhost:8000/app/"

var app = {
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

onDeviceReady: function() {
  app.loadText();
},

loadJSON: async function(jsonName,language) {
    if (localStorage.getItem(jsonName) == null) {
        const response = await fetch(`text/${jsonName}-${language}.json`)
        //const response = await fetch(`${meterURL}json/${jsonName}.json`)
        const json     = await response.json();
        localStorage.setItem(jsonName, JSON.stringify(json));
    }
    return JSON.parse(localStorage.getItem(jsonName));
},

loadText: async function() {
    if (localStorage.getItem('metaID') == null) { getUserID(); }

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
        localStorage.setItem("acts", JSON.stringify({})); // JSON to store activities
        localStorage.setItem('key', 0);                   // activity key currently being modified
        localStorage.setItem('index', 0);                 // incremental for unique keys
    }

    // CONSENT?
    if (localStorage.getItem("consent") == 1) {
        app.moveTo("menu");
    } else {
        app.defaultView();
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('footer').style.display = 'none';
        document.getElementById('server').style.display = '';
        document.getElementById('server').setAttibute('src', 'https://www.energy-use.org/app/consent.php');
    }
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

moveFrom: function(from) {
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
            acts[key]['path'] = act.ID;
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
            acts[key]['activity'] = document.getElementById('freetext').value;
            break;
        case "assign":
            // overwrite the activities JSON for e.g. "C1*" and "C1"
            app.activities[from]['title']   = acts[key]['activity'];
            app.activities[from]['caption'] = acts[key]['activity'];
            app.activities[from.slice(0,-1)]['title']   = acts[key]['activity'];
            app.activities[from.slice(0,-1)]['caption'] = acts[key]['activity'];
            localStorage.setItem('activities', JSON.stringify(app.activities));
        case "skip":
            console.log("skipping");
            break;
        case "server":
            document.getElementById('server').setAttribute('src',`${meterURL}${act.url}`);
            console.log(`server: ${act.url}`);
            break;
        default:
            acts[key]['key']  = from;
            acts[key]['tuc']  = act.ID;
            acts[key]['activity']  = act.title;
            acts[key]['category'] = act.category;
            document.getElementById('freetext').value = act.title;
            app.setFooter('done');
    }
    if (key in acts) {acts[key]['path'] += `,${act.ID}`}; // 'if' for server use (key could be '')
    localStorage.setItem('acts',JSON.stringify(acts));
},

moveTo: function(to) {
    console.log(`move to ${to}`);
    const screen = app.screens[to];
    app.defaultView();
    if (to == "server") {
        document.getElementById('server').style.display = '';
        document.getElementById('header').style.display = 'none';
    } else {
        console.log(screen.title);
        document.getElementById('title').innterHTML = app.formatString(screen.title);
        var btn;
        var actKey;
        var act;
        for (i=0; i<6; i++) {
            actKey = screen.activities[i];
            act    = app.activities[actKey];
            btn = document.getElementById(`button${i+1}`);
            document.getElementById(`title${i+1}`).innerHTML = app.formatString(act.caption);
            document.getElementById(`caption${i+1}`).innerHTML = act.help;
            document.getElementById(`button${i+1}`).className = `btn-activity col ${act.category}`;
            document.getElementById(`button${i+1}`).style.backgroundImage = `url('img/${act.icon}.png')`;
            if (act.category == 'function') {
                btn.setAttribute("onclick", act.next);
            } else {
                btn.setAttribute("onclick", `app.moveFromTo('${actKey}','${act.next}')`);
            }
        }
        document.getElementById('buttons').style.display = 'none';
        document.getElementById('buttons').style.display = '';
    }
    switch(to) {
        case "home":
            uploadActs();
            app.listActivities();
            app.history = new Array();
            document.getElementById('list').style.display = '';
            document.getElementById('footer').style.display = 'none';
            app.setNav('nav-home');
            break;
        case "user":
            app.setNav('nav-user');
            break;
        case "menu":
            app.history = new Array();
            app.setNav('nav-menu');
            document.getElementById('footer').style.display = 'none';
            break;
        case "help":
            app.setNav('nav-help');
            break;
        case "freetext":
            document.getElementById('input').style.display = '';
    }
    app.history.push(to);        // for 'back'
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
    document.getElementById('header').style.display = '';
    document.getElementById('input').style.display = 'none';
    document.getElementById('server').style.display = 'none';
    document.getElementById('clocks').style.display = 'none';
    document.getElementById('list').style.display = 'none';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('footer').style.display = '';
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
    document.getElementById('freetext').value = acts[key]['activity'];
    app.moveTo('freetext');
},

updateTitle: function() {
    const key = localStorage.getItem('key');
    var  acts = JSON.parse(localStorage.getItem('acts'));
    console.log("ACT KEY:",acts[key]);
    acts[key]['activity'] = document.getElementById('text').value;
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
            title.innerHTML = act.activity;
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


submitHHid: function() {
    // Special submission case for non UK participants via HH id
    var hhID = document.getElementById("input#free-text").val();
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
    //$("input#free-text").val("");
  } else {
    app.title.html(app.label.noInternet);
  }
},

showHelp: function() {
  if (localStorage.getItem('Online') == 'true') {
    var idMeta = localStorage.getItem('metaID');
    var helpURL = app.label.helpURL;
    app.title.html("Help"); 
    app.choicesPane.style.display = 'none';
    app.server.style.display = ''; 
    app.server.setAttibute('src', helpURL);
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
    app.header.style.display = 'none'; 
    app.choicesPane.style.display = 'none';
    app.server.style.display = ''; 
    app.server.setAttibute('src', profileURL);
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
    app.header.style.display = 'none'; 
    app.choicesPane.style.display = 'none';
    app.server.style.display = ''; 
    app.server.setAttibute('src', enjoymentURL);
    app.server.load(function(){
        sendMessageIframe("App requested enjoyment");
    });
  } else {
    app.title.html(app.label.noInternet);
  }
},

};

app.initialize();
