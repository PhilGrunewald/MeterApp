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
var CURR_ACTIVITY = "current_activity";
var CURR_ACTIVITY_ID = "0";  // the time use code AND category as csv

var ACTIVITY_DATETIME = "same";  // default - meaning activity time = reported time
var ACTIVITY_MANUAL_DATE = "none";  // default - if entering manual 'past time' screen promt will ask for it to be set input#input-date

var CURR_LOCATION = "current_location";
var CURR_ENJOYMENT = "current_enjoyment";
var ACTIVITY_LIST = "activity_list";
var CATCHUP_LIST = "catchup_list";			// keeps times that participants should follow up on
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
var SURVEY_MIN    = 90000;
var SURVEY_MAX    = 91000;

var CATCHUP_INDEX = 0;
var catchupList   = "";
var deviceColour  = "#990000";				// to be used for background or colour marker
var ToggleColon   = false;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
		app.initialSetup();
        //localStorage.clear(); // on restart browser failed to load localStorage
        log.init();
        $.getJSON('js/activities.json', function(data) {
            app.activities = data.activities;
            $.getJSON('js/screens.json', function(screen_data) {
                app.screens = screen_data.screens;
                app.showActivityList();
            });    
        });
    },

	initialSetup: function() {
        $("div#change-id").hide(); 	// replace by making the div default 'hide'
        $("div#change-date").hide(); 	// replace by making the div default 'hide'
        utils.save(ACTIVITY_DATETIME, "same");
        utils.save(ACTIVITY_MANUAL_DATE, "none");
        // XXX utils.save(SURVEY_STATUS, screen_id);
        app.actionButtons    = $('.btn-activity');
        app.activity_list_div= $('#activity-list');
        app.catchup_text     = $('#catchup-text');
        app.catchup_time     = $('#catchup-time');
        app.activityAddPane  = $('#activity_add_pane');
        app.activityListPane = $('#activity_list_pane');
        app.choicesPane      = $('#choices_pane');
        app.title            = $("#title");
        app.now_time         = $("#now-time");
		app.act_count        = $('#act-count');
        app.history          = new Array();
		setInterval(function(){ app.updateNowTime(); }, 1000);
		// app.updateNowTime();
        // $("#now-time").html(utils.format("${time}"));
	},

	updateNowTime: function() {
		var timeStr = utils.format("${time}");
		if (ToggleColon) {
			timeStr = timeStr.substring(0,2)+" "+timeStr.substring(3,5);
		}
		ToggleColon = (!ToggleColon);
        app.now_time.html(timeStr);
	},

	navigateTo: function(screen_id, prev_activity) {
		// the button pressed had 'prev_activity' as its 'title'
		// next screen has the key 'screen_id'
		app.history.push(screen_id);                     // for 'back' functionality
		if (prev_activity !== undefined) {
			if (!(prev_activity in app.activities)) {    // previous activity is defined but not known (free text)
					app.activities[prev_activity] = {
						"title"   : prev_activity,
						"caption" : prev_activity,
						"help"    : "Custom input",
						"ID"      : OTHER_SPECIFIED_ID,
						"next"    : screen_id
					}
			}

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
				  utils.save(CURR_ACTIVITY_ID, [app.activities[prev_activity].ID,app.activities[prev_activity].category,app.activities[prev_activity].title].join());
				  // running save for category separately caused ID and category to be set to the same value (???!!!) - so we do it in one go into the same var
			  }
			  //
			  // Is TIME setting
			  //
			  else if (app.activities[prev_activity].ID > ACTIVITY_TIME_MIN && app.activities[prev_activity].ID < ACTIVITY_TIME_MAX) {
				  // if going via "Recent" > prompted for time offset 
				  // apply offset to current time
				  var offset = app.activities[prev_activity].value * 60000;
				  //console.log('apply offset: ' + offset);
				  // var dt_ = Date.now();
				  var dt_activity = utils.get(ACTIVITY_DATETIME);
				  dt_activity = new Date(dt_activity);
				  var dt_activity = new Date(dt_activity.getTime() +offset).toISOString();
				  utils.save(ACTIVITY_DATETIME, dt_activity);
			  }

			  // Set specific time in hours and minutes
			  else if (app.activities[prev_activity].ID > ACTIVITY_SET_TIME_MIN && app.activities[prev_activity].ID < ACTIVITY_SET_TIME_MAX) {
				  var dt_activity = utils.get(ACTIVITY_DATETIME);
				  if (dt_activity == "same") {
					  dt_activity = utils.get(ACTIVITY_MANUAL_DATE);
					  if (dt_activity === "none") {
						  var dt_ = Date.now();
						  dt_activity = new Date(dt_);
					  }
				  }
				  dt_activity = new Date(dt_activity);
				  var addition = app.activities[prev_activity].value * 60000;
				  dt_activity = new Date(dt_activity.getTime() + addition).toISOString();
				  utils.save(ACTIVITY_DATETIME, dt_activity);
			  }

			  //
			  //  LOCATION 
			  //
			  else if (app.activities[prev_activity].ID > LOCATION_MIN && app.activities[prev_activity].ID < LOCATION_MAX) {
				  utils.save(CURR_LOCATION, app.activities[prev_activity].value);
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

				  var icon = "0"
				  document.getElementById("survey-status").src = "img/AR_"+icon+".png";
				  //console.log("survey entry: " + prev_activity);
			  }
		}

		//****************************** 
		//
		// SCREEN ID SPECIFIC ACTIONS
		//
		//****************************** 

		app.activityAddPane.hide();
		app.activityListPane.hide();
		app.choicesPane.show();

		console.log("PRev: " + prev_activity);
		console.log("Scr ID: " + screen_id);
		if (screen_id == "home" ) {
			// an entry has been completed (incl. via "Done")
			app.updateNowTime();
			app.addActivityToList();
			app.showActivityList();
			app.choicesPane.hide();
		} else 
		if (screen_id == "other specify") {     // display text edit field
			$("div#other-specify").show();
			$("div.footer-nav").hide();
			app.choicesPane.hide();
		} else
		if (screen_id == "activity root") {
			// btn-next is only for "activity time relative" actions
			// it points to "activity root", thus turning itself back to "Done" here
			$("div.footer-nav").show();
			$("#btn-done").show();
			$("#btn-next").hide();
			$("input#btn-other-specify").attr("onclick", "app.submitOther()");
		} else 
		if (screen_id == "activity time relative") {
			// pressed "recently" button - relative time entry followed by "activity root"
			// unlike "adjust time" which is triggered by "edit activity"
			var dt_ = Date.now()
			var dt_ = new Date(dt_).toISOString();
			utils.save(ACTIVITY_DATETIME, dt_);
			$("#btn-done").hide();
			$("#btn-next").show();
		} else
		if (screen_id == "activity time") {
			// this is only reached when operator set a manual date - absolute time entry
			var dt_ = utils.get(ACTIVITY_MANUAL_DATE);
			utils.save(ACTIVITY_DATETIME, dt_);
		} else
		if (screen_id == "survey root") {
			// an entry is still in the middle of completion
			// "survey root" is where the top navigation button points to
			// here it gets redirected to the latest survey screen
			// SURVEY_STATUS is 'survey root' by default and gets updated with every survey screen
			screen_id = utils.get(SURVEY_STATUS);
			if (screen_id === null) {
				screen_id = "survey root";
			}
		}

		//****************************** 
		//      Buttons
		//****************************** 
		var screen_ = app.screens[screen_id];
		$("#title").html(utils.format(screen_.title));
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
				btn_title.html(activity.caption);
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
	},

    goBack: function() {
        curr = app.history.pop();
        prev = app.history.pop();
        if (prev === undefined) {
            app.showActivityList();
        } else {
            app.navigateTo(prev, 'Back');
			// XXX undo potential time offsets
        }
    },

    showActivityHistory: function() {
        app.history = new Array();
        var activityList = utils.getList(ACTIVITY_LIST) || []
        var curr_acts = "";
        var row = ''+
            '<div class="row activity-row {4}" onclick="{2}">' + 
            '	<div class="activity-cell btn-time">{0}</div>' + 
            '	<div class="activity-cell activity-item">{1}</div>' + 
            '	<div class="activity-cell btn-terminate">{3}</div>' + 
            '</div>';

        if (Object.keys(activityList).length > 0) {
            row = row.format( '{0}', 
                '{1}', 
                '{2}',
                '<span class="bordered">{3}</span>','{4}')
            Object.keys(activityList).forEach( function(key, index) {
                var item = activityList[key];
                curr_acts += row.format(utils.format_time(item.time), 
                item.act,
                'app.editActivityScreen(\'' + key + '\')',
                "edit",
				item.cat)
            })
        } else {
            curr_acts = row.format("", "<i>No activity yet</i>", "", "")
        }

        app.activity_list_div.html(curr_acts)
        app.choicesPane.hide();
        app.activityAddPane.hide();
        app.activityListPane.show();
    	app.title.html("Your activities ("+Object.keys(activityList).length+")");
		app.act_count.hide();
    },

    showActivityList: function() {
        app.history = new Array();
        var activityList = utils.getList(ACTIVITY_LIST) || []
        var curr_acts = "";
        var row = ''+
            '<div class="row activity-row {3}" onclick="{1}">' + 
            '	<div class="activity-cell activity-item">{0}</div>' + 
            '	<div class="activity-cell btn-terminate">{2}</div>' + 
            '</div>';

        if (Object.keys(activityList).length > 0) {
            row = row.format(
                '{0}', 
                '{1}',
                '<span class="bordered">{2}</span>','{3}')
            Object.keys(activityList).forEach( function(key, index) {
                var item = activityList[key];
                curr_acts += row.format(item.act,
                'app.editActivityScreen(\'' + key + '\')',
                "redo",
				item.cat)
            })
        } else {
            curr_acts = row.format("", "<i>No activity yet</i>", "", "")
        }
		app.act_count.html("Recent activities: ");
		app.act_count.show();
		app.activity_list_div.html(curr_acts);
        app.choicesPane.hide();
        app.activityAddPane.show();
        app.activityListPane.show();
    	app.title.html("What I did ...")
		app.showCatchupItem(); // overwrites app.title if catchup items exist
    },

	showCatchupItem: function() {
		// drop (shift) catchup items more than 8 ours old
		while ((new Date() - new Date(app.catchupList.time[0])) > (8*60*60*1000)) {
			app.catchupList.time.shift();
			if (!app.catchupList.time.length) {
				break;
				}
			}

		// find most recent item that is in the past (starting from the back)
		var catchupIndex = app.catchupList.time.length-1;
		while (new Date() < new Date(app.catchupList.time[catchupIndex])) {
			catchupIndex -= 1;	
			if (catchupIndex < 0) { break;}
			}

		// show specific time in title
		if (catchupIndex > -1) {
			var hh=parseInt(app.catchupList.time[catchupIndex].slice(11,13));
			var mm=parseInt(app.catchupList.time[catchupIndex].slice(14,16));
			var strTime = app.formatAMPM(hh,mm);
			app.title.html("Do you remember " + strTime + "? <img src=\"img/AR_"+ (parseInt(catchupIndex)+1) +".png\">");
            app.title.attr("onclick", "app.catchupActivity('"+catchupIndex+"')");
		}
	},

	formatAMPM: function(hours,minutes) {
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0'+minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;
	},

	catchupActivity: function(catchupIndex) {
		// takes the 'catchupTime' before navigate to activity selection
		var catchupTime = app.catchupList.time[catchupIndex];
		utils.save(ACTIVITY_DATETIME, catchupTime);
		app.catchupList.time.splice(catchupIndex,1); // remove this catchup request
		app.navigateTo('activity root');
	},


    addActivityToList: function() {
		// 2 Lists: local ACTIVITY_LIST and logAct file
    	var dt_recorded = new Date().toISOString();
		var dt_act;
		if (utils.get(ACTIVITY_DATETIME) == "same") {
			dt_act = dt_recorded;
		} else {
			dt_act = utils.get(ACTIVITY_DATETIME);
		} 
		var actKey  = utils.get(CURR_ACTIVITY);
		var details = utils.get(CURR_ACTIVITY_ID) ;
		var loc     = utils.get(CURR_LOCATION) ;
		var enj     = utils.get(CURR_ENJOYMENT);          

		var detailsArray = details.split(",");  // contains tuc, category, title
		var tuc = detailsArray[0];
		var cat = detailsArray[1];			// .category
		var act = detailsArray[2];			// .title for this activity Key

        activityList = utils.getList(ACTIVITY_LIST) || {};

        var uuid = utils.uuid()
        activityList[uuid] = {
            "name" : actKey,
            "time" : dt_act,
			"loc"  : loc,
			"enj"  : enj,
			"tuc"  : tuc,
			"cat"  : cat,
			"act"  : act
        }
		utils.saveList(ACTIVITY_LIST, activityList);
                //console.log('act: ' + act);
		var actStr = "\""+act+"\"";
    	var str = [log.metaID,dt_act, dt_recorded, tuc, cat, actStr, loc, enj].join() + "\n";
    	log.writeLog(log.logAct, str)
        utils.save(ACTIVITY_DATETIME, "same"); // reset to assume 'now' entry
        // log.writeActivity();          
    },


    removeActivity: function (uuid) {
		app.deleteActivity(uuid);
    	app.showActivityList();
    },

	deleteActivity: function (actKey) {
        if (actKey) {
            activityList = utils.getList(ACTIVITY_LIST) || {};
            if (actKey in activityList) {
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
			console.log("activity list defined yet? : " + activityList); 
            var item = activityList[actKey];
			app.title.html(item.act + "(" + item.time + ")")
            var screen_ = app.screens["edit activity"];
            for (i = 0; i < screen_.activities.length; i++) {
				var activity_id = screen_.activities[i];
				var activity    = app.activities[activity_id];
				var button      = $(app.actionButtons[i]);
				console.log("activity_id: " + activity_id);
				console.log("button: " + button);
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
        	app.activityAddPane.hide();
            app.activityListPane.hide();
            app.choicesPane.show();
	},

	saveActivityPropertiesLocally: function(actKey) {
		// this is where app.navigateTo("home") will create new activity from
        var activityList = utils.getList(ACTIVITY_LIST) || {};
        var thisAct = activityList[actKey];

        utils.save(ACTIVITY_DATETIME, thisAct.time);
        utils.save(CURR_ACTIVITY, thisAct.name);
		utils.save(CURR_ACTIVITY_ID, [thisAct.tuc, thisAct.cat, thisAct.act].join());
        utils.save(CURR_LOCATION, thisAct.loc);
		utils.save(CURR_ENJOYMENT, thisAct.enj);
	},

	// Edit btn 1
	repeatActivityNow: function(actKey) {
		// set local variables as copy of this activity, then overwrite time
		app.saveActivityPropertiesLocally(actKey);
    	var thisTime = new Date().toISOString();
        utils.save(ACTIVITY_DATETIME, thisTime);
		app.navigateTo("home");
	},

	// Edit btn 2
	repeatActivityRecently: function(actKey) {
		// create a new instance as a copy of this activity and then allow to adjust the time
		app.saveActivityPropertiesLocally(actKey);
		app.navigateTo("adjust time");
	},

	// Edit btn 3
	adjustTime: function(actKey) {
		// the old List and CSV entries need to be removed and a new one is created when navigating Home
		app.saveActivityPropertiesLocally(actKey);
		// XXX add log.writeAct_mods(...) to have a CSV file saying to ignore the changed entry
		app.deleteActivity(actKey);
		app.navigateTo("adjust time");
	},

	// Edit btn 4
	editActivityTitle: function(actKey) {
		// the old List and CSV entries need to be removed and a new one is created when navigating Home
		app.saveActivityPropertiesLocally(actKey);
		// XXX add log.writeAct_mods(...) to have a CSV file saying to ignore the changed entry
		app.deleteActivity(actKey);
		var oldTitle = utils.get(CURR_ACTIVITY);
		$("input#free-text").val(oldTitle);
		$("input#btn-other-specify").attr("onclick", "app.submitEdit()");
		app.navigateTo("other specify");
	},

    changeDate: function() {
        var thisDate = $("input#input-date").val();
        var ds = thisDate.split(" ");
        var date_activity = new Date(parseInt(ds[0]), parseInt(ds[1])-1, parseInt(ds[2]));
        // utils.save(ACTIVITY_DATETIME, date_activity);
        utils.save(ACTIVITY_MANUAL_DATE, date_activity);
        $("div#change-date").hide();
		$("div#btn-recent").attr("onclick", "app.navigateTo('activity time absolute')");
    },

    changeID: function() {
        var metaID = $("input#input-id").val();
        log.setMetaID(metaID);
        $("div#change-id").hide();
        log.initSurveyFile();
        log.initActFile();
        $("div#change-date").show();
    },

    submitEdit: function() {
        var prev_activity = $("input#free-text").val();
        $("div#other-specify").hide();
        app.navigateTo("home", prev_activity)
    },
    submitOther: function() {
        var prev_activity = $("input#free-text").val();
        $("div#other-specify").hide();
        app.navigateTo("other people", prev_activity)
    },

    toggleCaption: function() {
        $(".btn-caption").toggle();
    },
    };

    app.initialize();
