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
var CURR_LOCATION = "current_location";
var CURR_ENJOYMENT = "current_enjoyment";
var ACTIVITY_LIST = "activity_list";
var SURVEY_STATUS;			// stores how far they got in the survey

var CATEGORIES = ["care_self",
                  "care_other",
                  "care_house",
                  "recreation",
                  "travel",
                  "food",
                  "work",
                  "other_category"];

var TIMEUSE_MAX   = 20000;
var ENJOYMENT_MIN = 20000;
var ENJOYMENT_MAX = 20010;
var LOCATION_MIN  = 30000;
var LOCATION_MAX  = 30100;
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
        app.receivedEvent('deviceready');
        log.init();
        
		utils.save(SURVEY_STATUS, "survey root");
        app.actionButtons    = $('.btn-activity');
        app.activity_list_div= $('#activity-list');
        app.activityListPane = $('#activity_list_pane');
        app.choicesPane      = $('#choices_pane');
        app.title            = $("#title");
        
        $.getJSON('js/activities.json', function(data) {
            app.activities = data.activities;
            $.getJSON('js/screens.json', function(screen_data) {
                app.screens = screen_data.screens;
                //app.navigateTo("home");
            	log.writeLog("001...");          
                app.showActivityList();
            	log.writeLog("002...");          
            });    
        });
        
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);
    },
        
    navigateTo: function(screen_id, prev_activity) {
        if (prev_activity !== undefined) {
            // within the code range of 'activity codes'
            if (app.activities[prev_activity].ID < TIMEUSE_MAX) {
            utils.save(CURR_ACTIVITY, prev_activity);
            }
            // within the code range of 'locations'
            // NOTE not all branches ask for location - so we ASSUME location doesn't change if not explicitly reported
            // On the 'home' view, the activity edit option could allow them to change 'offending' wrong locations
            else if (app.activities[prev_activity].ID > LOCATION_MIN && app.activities[prev_activity].ID < LOCATION_MAX) {
            utils.save(CURR_LOCATION, prev_activity);
            }
            // within the code range of 'enjoyments'
            else if (app.activities[prev_activity].ID > ENJOYMENT_MIN && app.activities[prev_activity].ID < ENJOYMENT_MAX) {
            utils.save(CURR_ENJOYMENT, prev_activity);
            }
            // within the code range of 'survey'
            else if (app.activities[prev_activity].ID > SURVEY_MIN && app.activities[prev_activity].ID < SURVEY_MAX) {
				// save the survey screen_id, such that we can return here via screen_id = 'survey'
            	utils.save(SURVEY_STATUS, screen_id);
                log.writeSurvey(prev_activity);          
                console.log("survey entry: " + prev_activity);
            }
        }
        else {
            console.log("IT'S UNDEFINED");
        }
        
        console.log("switching to " + screen_id);
        log.writeLog("switching to " + screen_id);

        if (screen_id == "home" ) {
            // an entry has been completed
            log.writeLog("1 home");          
            app.addActivityToList();
            log.writeLog("2 home");          
            app.showActivityList();
            log.writeLog("3 home");          
            app.choicesPane.hide();
            log.writeLog("4 home");          
            app.activityListPane.show();
        } else {
        	
            CATEGORIES.forEach(function (cat) {
                app.actionButtons.each(function (button) {
                	$(button).removeClass(cat);
                });
            });
            
            // an entry is still in the middle of completion
            if (screen_id == "survey") {
                // "survey" is where the top navigation button points to
                // here it gets redirected to the latest survey screen
                // SURVEY_STATUS is 'survey root' by default and gets updated with every survey screen
                screen_id = utils.get(SURVEY_STATUS);
                console.log("Survey ID" + screen_id);
            }
            // populate buttons XXX move to 'if not home'?
            var screen_ = app.screens[screen_id];
            $("#title").html(screen_.title);
            for (i = 0; i < screen_.activities.length; i++) {
                var activity_id = screen_.activities[i];
                var activity    = app.activities[activity_id];
                var button      = $(app.actionButtons[i]);
                var btn_title   = button.find(".btn-title");
                var btn_caption = button.find(".btn-caption");

                if (activity === undefined) {
                    btn_title.html("&lt;"+activity_id + "&gt;<br>undefined");
                    button.attr("onclick", "");
                } else {
                    btn_title.html(activity.caption);
                    btn_caption.html(utils.format(activity.help));
                    button.addClass(activity.category || "other_category");
                    button.attr("onclick", "app.navigateTo('"+activity.next+"', '"+activity_id+"')");
                }
            }
            app.activityListPane.hide();
            app.choicesPane.show();
        }
    },
    
    showActivityList: function() {
		// localStorage.clear();
        log.writeLog("3 showActivityList" + activityList);          
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
            
            console.log("ACTIVITIES: " + JSON.stringify(activityList))
            
		    	
            Object.keys(activityList).forEach( function(key, index) {
            	var item = activityList[key];
            	console.log("ITEM is:", item)
				curr_acts += row.format(utils.format_time(item.time), 
										app.activities[item.name].caption,
										'app.removeActivity(\'' + key + '\')',
										"done")					
        		//log.writeLog("rm ...");          
				//app.remove(item)
            })
        } else {
            
            console.log("REALLY NO ACTIVITIES")
            curr_acts = row.format("", "<i>No activity yet</i>", "", "")
        }
        
        log.writeLog("4 showActivityList");          
        app.title.html("Activities")
        app.activity_list_div.html(curr_acts)
        app.choicesPane.hide();
        app.activityListPane.show();
    },
    
    addActivityToList: function() {
        activityList = utils.getList(ACTIVITY_LIST) || {};
        console.log("ADDING TO CURRENT ACTIVITY: "+utils.get(CURR_ACTIVITY))
        
        var uuid = utils.uuid()
        activityList[uuid] = {
        	"name" : utils.get(CURR_ACTIVITY),
        	"time" : Date.now()
        }
        
        // TODO: clear current activity
        
        console.log("NEW AL: "+ activityList)
        
        utils.saveList(ACTIVITY_LIST, activityList)
        console.log("XXX Current List "+utils.getList(ACTIVITY_LIST))
        log.writeLog("2 addActivityToList");          
        log.writeActivity(" \"" + utils.get(CURR_ACTIVITY) + "\", " + 
        		utils.get(CURR_LOCATION) + ", " + utils.get(CURR_ENJOYMENT));          
    },
    
    removeActivity: function (uuid) {
    	    	
    	if (uuid) {
    		
        	activityList = utils.getList(ACTIVITY_LIST) || {};
        	
        	if (uuid in activityList) {
        		delete activityList[uuid];
            	
            	utils.saveList(ACTIVITY_LIST, activityList)
                console.log("XXX Current List "+utils.getList(ACTIVITY_LIST))
                log.writeLog("2 addActivityToList");
            	
            	app.showActivityList();
        	}
    			
    	}
    	
    },
    
    toggleCaption: function() {
        
        $(".btn-caption").toggle();
    },
    

};

app.initialize();
