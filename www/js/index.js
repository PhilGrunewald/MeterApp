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
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
                console.log("got main dir",dir);
				// the existence of folder METER is assumed
				// in this folder is also id.txt to identify the user
                dir.getFile("METER/survey.csv", {create:true}, function(file) {
                    console.log("got survey file", file);
                    app.logSurvey = file;
                    app.writeSurvey("New session");          
                }, function(err) {
                    console.log(err);
                });
                dir.getFile("METER/activities.csv", {create:true}, function(file) {
                    console.log("got activities file", file);
                    app.logAct = file;
                    app.writeActivity("New session");          
                }, function(err) {
                    console.log(err);
                });
                dir.getFile("METER/debug.csv", {create:true}, function(file) {
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
            	app.writeLog("001...");          
                app.showActivityList();
            	app.writeLog("002...");          
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
            // an entry has been completed
            app.writeLog("1 home");          
            app.addActivityToList();
            app.writeLog("2 home");          
            app.showActivityList();
            app.writeLog("3 home");          
            app.choicesPane.hide();
            app.writeLog("4 home");          
            app.activityListPane.show();
        }
        else {
            // an entry is still in the middle of completion
            if (screen_id == "survey") {
                // "survey" is where the top navigation button points to
                // here it gets redirected to the latest survey screen
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
                    btn_caption.html(app.format(activity.help));
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
        app.writeLog("3 showActivityList" + activity_list);          
        var activity_list = app.getList(ACTIVITY_LIST) || []

        if (activity_list.length > 0) {
            console.log("ACTIVITIES: " + activity_list)
            var ul_ = ""
            activity_list.forEach(function (item) {
				ul_ += "<li class='activity_list'><div onCLick='app.remove(" + item + ")'> XXX </div>" + app.activities[item].caption +"</li>\n"
        		//app.writeLog("rm ...");          
				//app.remove(item)
            })
        } else {
            console.log("REALLY NO ACTIVITIES")
            ul_ = "<li class='activity_list'><i>No activities yet</i></li>"
        }
        
        app.writeLog("4 showActivityList");          
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
        app.writeLog("2 addActivityToList");          
        app.writeActivity(" \"" + app.get(CURR_ACTIVITY) + "\", " + app.get(CURR_LOCATION) + ", " + app.get(CURR_ENJOYMENT));          
    },
    
    save: function(key, val) {
        localStorage.setItem(key, val);
    },
    
    get: function(key) {
        return localStorage.getItem(key);
    },
    
	remove: function(key) {
		localStorage.removeItem(key);
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
    },
    
    format: function(str) {
    	
    	console.log("formatting: " + str);
    	
    	if (str === undefined || str == "") {
    		return str;
    	}
    	
    	var intime_arr = str.match(/\$.*\}/)
    	console.log("intime arr: "+ intime_arr)
    	
    	if (!intime_arr) {
    		return str;
    	}
    	
    	/* return value is an array. Check it's not empty */
    	var intime;
    	if (intime_arr.length > 0){
    		intime_var = intime_arr[0];
    	} else {
    		return str;
    	}
    	
    	/* keep the contents of the variable */
    	intime = intime_var.substring(2, intime_var.length-1);
    	
    	elems = intime.split(" ");
    	console.log(elems);
    	
    	var res;
    	
    	if (elems[0] == "time") {
    		var time_ = Date.now();
    		
    		if (elems.length > 2) {
    			
    			if (elems[1] == "-"){
    				var mins = parseInt(elems[2]) * 60000;
    				res = new Date(time_-mins);
    			} else {
    				return str; // no other operation implemented;
    			}
    		} else {
    			res = new Date(time_);
    		}
    		
    		return str.replace(intime_var, res.toTimeString().substring(0, 5))
    	} else {
    		return str; // no other function implemented
    	}
    	
    	// should never get here
    	return str;
    	
    } 
    
};

app.initialize();
