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
var fastTrack     = false;					// takes navTo("other people") straight "home"

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
		if (utils.get(SURVEY_STATUS) == "survey complete") {
			$("div#nav-aboutme").hide();
			$("div#nav-status").show();
		} else {
			$("div#nav-status").hide();
			$("div#nav-aboutme").show();
		}

		setInterval(function(){ app.updateNowTime(); }, 1000);
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
				utils.save(CURR_ACTIVITY_ID, [app.activities[prev_activity].ID,app.activities[prev_activity].category,app.activities[prev_activity].title].join()); // running save for category separately caused ID and category to be set to the same value (???!!!) - so we do it in one go into the same var
				// now that an activity is selected btn-done will not create a new entry
				app.footer_nav("done");
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
		$("div#progress_list_pane").hide();
		app.choicesPane.show();
		$("div.footer-nav").show();


		// skip "other people" and "enjoyment" if on fastTrack
		if (screen_id == "other people" || screen_id == "enjoyment") {
			if (fastTrack) {
				screen_id = "home";
				fastTrack = false;
			}
		}

		var screen_ = app.screens[screen_id];
		$("#title").html(utils.format(screen_.title));

		if (screen_id == "home" ) {
			// an entry has been completed (incl. via "Done")
			$("#title").html(utils.format(screen_.title));
			if (prev_activity !== "ignore") {
				app.addActivityToList();
			}
			// until and activity is selected btn-home will not create a new entry
			app.footer_nav("home");
			// app.updateNowTime();
			app.showActivityList();
			app.choicesPane.hide();
		} else 
		if (screen_id == "activity time relative") {
			// pressed "recently" button - relative time entry followed by "activity root"
			// unlike "adjust time" which is triggered by "edit activity"
			var dt_ = Date.now()
			var dt_ = new Date(dt_).toISOString();
			utils.save(ACTIVITY_DATETIME, dt_);
			app.footer_nav("next");
		} else
		if (screen_id == "activity time") {
			// this is only reached when operator set a manual date - absolute time entry
			var dt_ = utils.get(ACTIVITY_MANUAL_DATE);
			utils.save(ACTIVITY_DATETIME, dt_);
		} else
		if (screen_id == "activity root") {
			// btn-next is only for "activity time relative" actions
			// it points to "activity root", thus turning itself back to "Done" here
			$("div.footer-nav").show();
			app.footer_nav("home");
			$("div#btn-other-specify").attr("onclick", "app.submitOther()");
		} else 
		if (screen_id == "other specify") {     // display text edit field
			console.log("SHOWING");
			$("div#other-specify").show();
			$("div.footer-nav").hide();
			app.choicesPane.hide();
		} else
		if (screen_id == "survey root") {
			// an entry is still in the middle of completion
			// "survey root" is where the top navigation button points to
			// here it gets redirected to the latest survey screen
			// SURVEY_STATUS is 'survey root' by default and gets updated with every survey screen
			screen_id = utils.get(SURVEY_STATUS);
			app.footer_nav("home");
			if (screen_id === null) {
				screen_id = "survey root";
			}
		} else
		if (screen_id == "survey complete") {
			$("div#nav-aboutme").hide();
			$("img#stars").attr("src","img/stars_1.png");
			$("div#nav-status").show();
			app.showActivityList();
			app.choicesPane.hide();
		} 

		//****************************** 
		//      Buttons
		//****************************** 
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
        curr = app.history.pop();
        prev = app.history.pop();
        if (prev === undefined) {
            app.showActivityList();
        } else {
            app.navigateTo(prev,prev);
			// XXX undo potential time offsets
        }
    },

	showProgressList: function() {
        var activityList = utils.getList(ACTIVITY_LIST) || []
		var actCount = Object.keys(activityList).length;
		app.title.html("You have recorded</br>" + actCount + " activities")
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
	},


    showActivityList: function() {
        app.history = new Array();
        var activityList = utils.getList(ACTIVITY_LIST) || []
        var actsHTML = "";

		var actKeys = Object.keys(activityList);
		var actLength =Object.keys(activityList).length;
		actKeys.sort();

		for (i = actLength-1; i > -1; i--) {
			var key = actKeys[i];
			var item = activityList[key];
            actsHTML += 
            	'<div class="row activity-row ' + item.cat + '" onClick="app.editActivityScreen(\'' + key + '\')">' +
            	'<div class="activity-cell btn-time">' + utils.format_time(item.time) + '</div>' +
            	'<div class="activity-cell activity-item">' + item.act  + '</div> ' +
				'<div class="activity-cell btn-terminate">edit</div></div>';
		}
		// app.act_count.html("Your activities ("+Object.keys(activityList).length+")");
		app.act_count.show();
		app.activity_list_div.html(actsHTML);
        app.choicesPane.hide();
		$("div#progress_list_pane").hide();
		$("div#other-specify").hide();
        app.activityAddPane.show();
        app.activityListPane.show();
    	//app.title.html("What I did ...")
		app.showCatchupItem(); // overwrites app.title if catchup items exist
		$('div.contents').animate({ scrollTop: 0 }, 'slow'); // only needed when using the home button on the home screen after having scrolled down
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
			console.log("about to show Catchup");
			app.title.html("What happened <b>at " + strTime + "</b>? <img src=\"img/AR_"+ (parseInt(catchupIndex)+1) +".png\">");
            app.title.attr("onclick", "app.catchupActivity('"+catchupIndex+"')");
		} else {
    		app.title.html("xx What I did ...")
		}
	},

	extractTimeStr: function(ISOTime) {
		var hours=parseInt(ISOTime.slice(11,13));
		var minutes=parseInt(ISOTime.slice(14,16));
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0'+minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;
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
		var actCount = Object.keys(activityList).length;
		if (actCount > 25) {
			$("img#stars").attr("src","img/stars_5.png");
		} else
		if (actCount > 15) {
			$("img#stars").attr("src","img/stars_4.png");
		} else
		if (actCount > 10) {
			$("img#stars").attr("src","img/stars_3.png");
		} else
		if (actCount > 5) {
			$("img#stars").attr("src","img/stars_2.png");
		} 

        // log.writeActivity();          
    },


    removeActivity: function (uuid) {
		app.deleteAct(uuid);
    	app.showActivityList();
    },

	deleteAct: function (actKey) {
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
            var item = activityList[actKey];
			app.title.html(app.extractTimeStr(item.time) + ": " + item.act)
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
        	app.activityAddPane.hide();
            app.activityListPane.hide();
            app.choicesPane.show();
			app.footer_nav("home");
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

	footer_nav: function(btn) {
			$("#btn-home").hide();
			$("#btn-done").hide();
			$("#btn-next").hide();
			$("#btn-"+btn).show();
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
		app.footer_nav("done");
		app.navigateTo("adjust time");
	},

	// Edit btn 3
	adjustTime: function(actKey) {
		// the old List and CSV entries need to be removed and a new one is created when navigating Home
		app.saveActivityPropertiesLocally(actKey);
		// XXX add log.writeAct_mods(...) to have a CSV file saying to ignore the changed entry
		app.deleteAct(actKey);
		app.footer_nav("done");
		$("div.footer-nav").show();
		app.navigateTo("adjust time");
	},

	// Edit btn 4
	editActivityTitle: function(actKey) {
		// the old List and CSV entries need to be removed and a new one is created when navigating Home
		app.saveActivityPropertiesLocally(actKey);
		// XXX add log.writeAct_mods(...) to have a CSV file saying to ignore the changed entry
		app.deleteAct(actKey);
		var oldDetail = utils.get(CURR_ACTIVITY_ID);
		var oldTitle  = oldDetail.split(",")[2];
		$("input#free-text").val(oldTitle);
		$("div#btn-other-specify").attr("onclick", "app.submitEdit()");
		app.navigateTo("other specify");
	},

	// Edit btn 5
	endActivity: function(actKey) {
		// set local variables as copy of this activity, then overwrite time
		// XXX add log.writeAct_mods(...) to have a CSV file saying to end the entry
		app.deleteAct(actKey);
		app.navigateTo("home", "ignore"); // ignore stops creation of new entry
	},

	// Edit btn 5 - Something else now
	moreActivity: function(actKey) {
		app.saveActivityPropertiesLocally(actKey);
		// XXX add log.writeAct_mods(...) to have a CSV file saying to ignore the changed entry
		app.footer_nav("next");
		app.navigateTo("adjust time");
		fastTrack = true;
		// XXX should have boolean to redirect "other people/enjoyment" -> home
	},

	// Edit btn 6
	deleteActivity: function(actKey) {
		// set local variables as copy of this activity, then overwrite time
		// XXX add log.writeAct_mods(...) to have a CSV file saying to ignore entry
		app.deleteAct(actKey);
		app.navigateTo("home", "ignore"); // ignore stops creation of new entry
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
        $(".btn-caption").toggle();
    },
    };

    app.initialize();
