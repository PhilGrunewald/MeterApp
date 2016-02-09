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

CATEGORIES = ["care_self","care_other","care_house","recreation", "travel",
              "food", "work", "other_category"]

var app = {
    
    logOb: null,
    
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        app.receivedEvent('deviceready');
        
        if (device.platform != "browser") {        
            window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
                console.log("got main dir",dir);
                dir.getFile("tuc_log.txt", {create:true}, function(file) {
                    console.log("got the file", file);
                    app.logOb = file;
                    app.writeLog("App started");          
                }, function(err) {
                    console.log(err);
                });
            });
        }
        
        
        app.actionButtons = $('.btn-activity');
        
        
        
        $.getJSON('js/activities.json', function(data) {
            
            app.activities = data.activities;
            
            $.getJSON('js/screens.json', function(screen_data) {
                
                app.screens = screen_data.screens;
                
                app.navigateTo("home");
            })    
            
        })
        
        
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
    
    navigateTo: function(screen_id) {
        
        console.log("switching to " + screen_id);
        app.writeLog("switching to " + screen_id);
        
        var screen_ = app.screens[screen_id];
        console.log("screen title: "+screen_.title)
        
        $("#title").html(screen_.title);
        
		for (i = 0; i < screen_.activities.length; i++) {
            
            var activity    = app.activities[screen_.activities[i]]
            var button      = $(app.actionButtons[i])
            var btn_title   = button.find(".btn-title")
            var btn_caption = button.find(".btn-caption")
            
            CATEGORIES.forEach(function (cat) {
                button.removeClass(cat)
            })
            
            if (activity === undefined) {
                btn_title.html(screen_.activities[i] + "<br>undefined");
                button.attr("onclick", "")
            } else {
                btn_title.html(activity.caption);
                btn_caption.html(activity.help);
                button.addClass(activity.category || "other_category")
                button.attr("onclick", "app.navigateTo('"+activity.next+"')")
            }
            
		}
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
    
    toggleCaption: function() {
        
        $(".btn-caption").toggle();
    }
    
};

app.initialize();
