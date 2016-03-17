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
    logOb: null,
    logAct: null,
    
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
        if (device.platform != "browser") {        
            window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
                console.log("got main dir",dir);
                dir.getFile("survey.csv", {create:true}, function(file) {
                    console.log("got survey file", file);
                    app.logSurvey = file;
                    app.writeSurvey("New session");          
                }, function(err) {
                    console.log(err);
                });
                dir.getFile("activities.csv", {create:true}, function(file) {
                    console.log("got activities file", file);
                    app.logAct = file;
                    app.writeActivity("New session");          
                }, function(err) {
                    console.log(err);
                });
                dir.getFile("debug.csv", {create:true}, function(file) {
                    console.log("got debug file", file);
                    app.logOb = file;
                    app.writeLog("App started");          
                }, function(err) {
                    console.log(err);
                });
            });
        }
        
		app.save(SURVEY_STATUS, "survey root");
        app.actionButtons    = $('.btn-activity');
        app.activity_ul      = $('#activity_list');
        app.activityListPane = $('#activity_list_pane');
        app.choicesPane      = $('#choices_pane');
        app.title            = $("#title");
        
        $.getJSON('js/activities.json', function(data) {
            app.activities = data.activities;
            $.getJSON('js/screens.json', function(screen_data) {
                app.screens = screen_data.screens;
                //app.navigateTo("home");
                app.showActivityList();
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
            app.save(CURR_ACTIVITY, prev_activity);
            }
            // within the code range of 'locations'
            // NOTE not all branches ask for location - so we ASSUME location doesn't change if not explicitly reported
            // On the 'home' view, the activity edit option could allow them to change 'offending' wrong locations
            else if (app.activities[prev_activity].ID > LOCATION_MIN && app.activities[prev_activity].ID < LOCATION_MAX) {
            app.save(CURR_LOCATION, prev_activity);
            }
            // within the code range of 'enjoyments'
            else if (app.activities[prev_activity].ID > ENJOYMENT_MIN && app.activities[prev_activity].ID < ENJOYMENT_MAX) {
            app.save(CURR_ENJOYMENT, prev_activity);
            }
            // within the code range of 'survey'
            else if (app.activities[prev_activity].ID > SURVEY_MIN && app.activities[prev_activity].ID < SURVEY_MAX) {
				// save the survey screen_id, such that we can return here via screen_id = 'survey'
            	app.save(SURVEY_STATUS, screen_id);
                app.writeSurvey(prev_activity);          
                console.log("survey entry: " + prev_activity);
            }
        }
        else {
            console.log("IT'S UNDEFINED");
        }
        
        console.log("switching to " + screen_id);
        app.writeLog("switching to " + screen_id);

        if (screen_id == "home" ) {
            app.addActivityToList();
            app.showActivityList();
            app.choicesPane.hide();
            app.activityListPane.show();
        }
        else {
			if (screen_id == "survey") {
				// SURVEY_STATUS is 'survey root' by default and gets updated with every survey screen
				screen_id = app.get(SURVEY_STATUS);
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

                CATEGORIES.forEach(function (cat) {
                    button.removeClass(cat);
                });
                if (activity === undefined) {
                    btn_title.html("&lt;"+activity_id + "&gt;<br>undefined");
                    button.attr("onclick", "");
                } else {
                    btn_title.html(activity.caption);
                    btn_caption.html(activity.help);
                    button.addClass(activity.category || "other_category");
                    button.attr("onclick", "app.navigateTo('"+activity.next+"', '"+activity_id+"')");
                }
            }
            app.activityListPane.hide();
            app.choicesPane.show();
        }
    },
    
    showActivityList: function() {
        var activity_list = app.getList(ACTIVITY_LIST) || []
        if (activity_list.length > 0) {
            console.log("ACTIVITIES: " + activity_list)
            var ul_ = ""
            activity_list.forEach(function (item) {
                ul_ += "<li class='activity_list'>" + app.activities[item].caption +"</li>\n"
            })
        } else {
            console.log("REALLY NO ACTIVITIES")
            ul_ = "<li class='activity_list'><i>No activities yet</i></li>"
        }
        
        app.title.html("Activities")
        app.activity_ul.html(ul_)
        app.choicesPane.hide();
        app.activityListPane.show();
    },
    
    addActivityToList: function() {
        activity_list = app.getList(ACTIVITY_LIST) || []
        console.log("ADDING TO CURRENT ACTIVITY: "+app.get(CURR_ACTIVITY))
        activity_list.push(app.get(CURR_ACTIVITY))
        app.saveList(ACTIVITY_LIST, activity_list)
        console.log("XXX Current List "+app.getList(ACTIVITY_LIST))
        app.writeActivity(" \"" + app.get(CURR_ACTIVITY) + "\", " + app.get(CURR_LOCATION) + ", " + app.get(CURR_ENJOYMENT));          
    },
    
    save: function(key, val) {
        localStorage.setItem(key, val);
    },
    
    get: function(key) {
        return localStorage.getItem(key);
    },
    
    saveList: function(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    },
    
    getList: function(key) {
        return JSON.parse(localStorage.getItem(key));
    },
    
    writeLog: function(str) {
        var log = "[" + (new Date()) + "] " + str + "\n";
        if (device.platform == "browser") {
            console.log(log);
            return;
        }
        if(!app.logOb) return;
        app.logOb.createWriter(function(fileWriter) {
            fileWriter.seek(fileWriter.length);
            var blob = new Blob([log], {type:'text/plain'});
            fileWriter.write(blob);
        }, function(err) {
            console.log(err)
        });
    },

    writeSurvey: function(str) {
        var log = (new Date()) + ", " + str + "\n";
        if (device.platform == "browser") {
            console.log(log);
            return;
        }
        if(!app.logAct) return;
        app.logSurvey.createWriter(function(fileWriter) {
            fileWriter.seek(fileWriter.length);
            var blob = new Blob([log], {type:'text/plain'});
            fileWriter.write(blob);
        }, function(err) {
            console.log(err)
        });
    },

    writeActivity: function(str) {
        var log = "[" + (new Date()) + "] " + str + "\n";
        if (device.platform == "browser") {
            console.log(log);
            return;
        }
        if(!app.logAct) return;
        app.logAct.createWriter(function(fileWriter) {
            fileWriter.seek(fileWriter.length);
            var blob = new Blob([log], {type:'text/plain'});
            fileWriter.write(blob);
        }, function(err) {
            console.log(err)
        });
    },
    
    toggleCaption: function() {
        
        $(".btn-caption").toggle();
    }
    
};

app.initialize();
