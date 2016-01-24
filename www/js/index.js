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
var app = {
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
        
        $.getJSON('js/activity_screens.json', function(data) {
            app.activities = data.activities;
            app.screens = data.screens;
            app.questions = data.questions;
            
            app.navigateTo("home");
            
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
        
        var question = app.questions[screen_id];
        var title = question['question'];
        
        $("#title").html(title);
       
		for (i = 1; i < 7; i++) {
			console.log("test "+ app.activities[question['b'+i]])
            var _button = app.activities[question['b'+i]];
			console.log("no 0 " + _button[0])
            var _button_nextscreen = _button[0];
            var _button_name       = _button[1];
            var _button_description= _button[2];
            var _button_help       = _button[3];

            var button = $("#button"+i);
            button.html(_button_name);
            button.attr("onclick", "app.navigateTo('"+_button_nextscreen+"')")
		}
    }
};

app.initialize();
