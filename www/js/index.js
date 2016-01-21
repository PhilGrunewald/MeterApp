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
            
            var screen = app.screens["h0"];
            var title = screen[1];
            
            $("#title").html(title);
            
            var _activities = screen[0];
            var counter = 1;
            _activities.forEach( function(_activity) {
                                
                var _button = app.activities[_activity+""];
                var _button_nextscreen = _button[0];
                var _button_name       = _button[1];
                var _button_description= _button[2];
                var _button_help       = _button[3];
                
                console.log("button "+counter+" name is "+_button_name)
                
                var button = $("#button"+counter);
                button.html(_button_name);
                button.attr("onclick", "alert('next is "+_button_nextscreen+"')")
                
                counter++;
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
    }
};

app.initialize();