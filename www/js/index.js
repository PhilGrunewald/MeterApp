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
var SURVEY_STATUS = "survey root";			// stores how far they got in the survey

var CATEGORIES = ["care_self",
    "care_other",
    "care_house",
    "recreation",
    "travel",
    "food",
    "work",
    "other_category"];

var TO_BE_SPECIFIED     = "Other specify";
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

var app = {

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');

        $("div#change-id").hide(); 	// replace by making the div default 'hide'
        $("div#change-date").hide(); 	// replace by making the div default 'hide'

		app.initialSetup();

        localStorage.clear(); // on restart browser failed to load localStorage

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
        utils.save(ACTIVITY_DATETIME, "same");
        utils.save(ACTIVITY_MANUAL_DATE, "none");
        app.actionButtons    = $('.btn-activity');
        app.activity_list_div= $('#activity-list');
        app.activityListPane = $('#activity_list_pane');
        app.choicesPane      = $('#choices_pane');
        app.title            = $("#title");
        app.history          = new Array();
        // utils.save(SURVEY_STATUS, "survey root");
		SURVEY_STATUS = "survey root";
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

            if (prev_activity == TO_BE_SPECIFIED) {     // display text edit field
                $("div#other-specify").show();
                $("div.footer-nav").hide();
                screen_id = "other specify";
            } else {
                $("div.footer-nav").show();
            }

            // within the code range of 'activity codes'
            if (app.activities[prev_activity].ID < TIMEUSE_MAX) {
                utils.save(CURR_ACTIVITY, prev_activity);
				utils.save(CURR_ACTIVITY_ID, [app.activities[prev_activity].ID,app.activities[prev_activity].category].join());
				// running save for category separately caused ID and category to be set to the same value (???!!!) - so we do it in one go into the same var
            }
            // if going via "Recent" > prompted for time offset 
            // apply offset to current time
            else if (app.activities[prev_activity].ID > ACTIVITY_TIME_MIN && app.activities[prev_activity].ID < ACTIVITY_TIME_MAX) {
                var offset = app.activities[prev_activity].value * 60000;
                //console.log('apply offset: ' + offset);
                var dt_ = Date.now();
                var dt_activity = new Date(dt_-offset).toISOString();
                utils.save(ACTIVITY_DATETIME, dt_activity);
            }

            // Set specific time in hours and minutes
            else if (app.activities[prev_activity].ID > ACTIVITY_SET_TIME_MIN && app.activities[prev_activity].ID < ACTIVITY_SET_TIME_MAX) {
                var dt_activity = utils.get(ACTIVITY_DATETIME);
                var addition = app.activities[prev_activity].value * 60000;
                dt_activity = new Date(dt_activity);
                dt_activity = new Date(dt_activity.getTime() + addition).toISOString();
                utils.save(ACTIVITY_DATETIME, dt_activity);
            }

            // within the code range of 'locations'
            else if (app.activities[prev_activity].ID > LOCATION_MIN && app.activities[prev_activity].ID < LOCATION_MAX) {
                utils.save(CURR_LOCATION, app.activities[prev_activity].value);
            }
            // within the code range of 'enjoyments'
            else if (app.activities[prev_activity].ID > ENJOYMENT_MIN && app.activities[prev_activity].ID < ENJOYMENT_MAX) {
                utils.save(CURR_ENJOYMENT, app.activities[prev_activity].value);
            }
            // within the code range of 'survey'
            else if (app.activities[prev_activity].ID > SURVEY_MIN && app.activities[prev_activity].ID < SURVEY_MAX) {
                // save the survey screen_id, such that we can return here via screen_id = 'survey'
                // utils.save(SURVEY_STATUS, screen_id);
				SURVEY_STATUS = screen_id;
                log.writeSurvey(app.activities[prev_activity].title, app.activities[prev_activity].value);          

				var icon = "0"
                    document.getElementById("survey-status").src = "img/AR_"+icon+".png";
                //console.log("survey entry: " + prev_activity);
            }
        }

		if (screen_id == "activity time") {
			var dt_ = utils.get(ACTIVITY_MANUAL_DATE);
			utils.save(ACTIVITY_DATETIME, dt_);
		} else if (utils.get(ACTIVITY_DATETIME) == null) {
			var dt_ = Date.now()
			var dt_ = new Date(dt_).toISOString();
			utils.save(ACTIVITY_DATETIME, dt_);
		}
		if (screen_id == "home" ) {
            // an entry has been completed
            $("#btn-time").html(utils.format("${time}"));
            app.addActivityToList();
            app.showActivityList();
            app.choicesPane.hide();
            app.activityListPane.show();
        } else {

            // an entry is still in the middle of completion
            if (screen_id == "survey root") {
                // "survey" is where the top navigation button points to
                // here it gets redirected to the latest survey screen
                // SURVEY_STATUS is 'survey root' by default and gets updated with every survey screen
                // screen_id = utils.get(SURVEY_STATUS);
                screen_id = SURVEY_STATUS;
                // console.log("Survey ID" + screen_id);
            }
            // populate buttons XXX move to 'if not home'?

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
            app.activityListPane.hide();
            app.choicesPane.show();
        }
    },

    goBack: function() {
        curr = app.history.pop();
        prev = app.history.pop();
        if (prev === undefined) {
            app.showActivityList();
        } else {
            app.navigateTo(prev, 'Back');
        }
    },


    showActivityList: function() {

        app.history = new Array();
        // localStorage.clear();
        var activityList = utils.getList(ACTIVITY_LIST) || []
        var curr_acts = "";
        var row = ''+
            '<div class="row activity-row">' + 
            '	<div class="activity-cell btn-time">{0}</div>' + 
            '	<div class="activity-cell activity-item">{1}</div>' + 
            '	<div class="activity-cell btn-terminate" onclick="{2}">{3}</div>' + 
            '</div>';

        if (Object.keys(activityList).length > 0) {
            row = row.format( '<span class="bordered">{0}</span>', 
                '{1}', 
                '{2}',
                '<span class="bordered">{3}</span>')
            Object.keys(activityList).forEach( function(key, index) {
                var item = activityList[key];
                curr_acts += row.format(utils.format_time(item.time), 
                app.activities[item.name].caption,
                'app.removeActivity(\'' + key + '\')',
                "-")					
            })
        } else {
            curr_acts = row.format("", "<i>No activity yet</i>", "", "")
        }

        app.title.html("Activities")
        app.activity_list_div.html(curr_acts)
        app.choicesPane.hide();
        app.activityListPane.show();
    },

    addActivityToList: function() {
        activityList = utils.getList(ACTIVITY_LIST) || {};
        var dt_act;
        if (utils.get(ACTIVITY_DATETIME) == "same") {
            dt_act = Date.now();
        } else {
            dt_act = utils.get(ACTIVITY_DATETIME);
        } 
        var uuid = utils.uuid()
        activityList[uuid] = {
            "name" : utils.get(CURR_ACTIVITY),
            "time" : dt_act
        }
        utils.saveList(ACTIVITY_LIST, activityList)
        log.writeActivity();          
    },

    removeActivity: function (uuid) {
        if (uuid) {
            activityList = utils.getList(ACTIVITY_LIST) || {};
            if (uuid in activityList) {
                delete activityList[uuid];
                utils.saveList(ACTIVITY_LIST, activityList)
                app.showActivityList();
            }
        }
    },

    changeDate: function() {
        var thisDate = $("input#input-date").val();
        var ds = thisDate.split(" ");
        var date_activity = new Date(parseInt(ds[0]), parseInt(ds[1])-1, parseInt(ds[2]));
        // utils.save(ACTIVITY_DATETIME, date_activity);
        utils.save(ACTIVITY_MANUAL_DATE, date_activity);
        $("div#change-date").hide();
    },

    changeID: function() {
        var metaID = $("input#input-id").val();
        log.setMetaID(metaID);
        $("div#change-id").hide();
        log.initSurveyFile();
        log.initActFile();
        $("div#change-date").show();
    },

    submitOther: function(origin) {
        if (origin === undefined) {
            origin = "Other specify";
        }
        var screen_id = app.activities[origin].next;
        var prev_activity = $("input#free-text").val();
        $("div#other-specify").hide();
        app.navigateTo(screen_id, prev_activity)
    },

    toggleCaption: function() {

        $(".btn-caption").toggle();
    },
    };

    app.initialize();
