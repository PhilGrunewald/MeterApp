/**
 * Phil and Davide...
 */

var log = {

    logOb: null,
    ActJSON: null,
    logAct: null,
    logDebug: null,
    logSurvey: null,
//	metaID: "0",
//	id: 7,

init: function() {
	if (device.platform != "browser") {
		window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
			console.log("got main dir",dir);
			// the existence of folder METER is assumed
			$.getJSON("/sdcard/METER/config.json", function(config) {
			// 31 Dec 2018 $.getJSON("/sdcard/METER/config.json", function(config) {
                // if a config file exists locally (this is one of our devices) use this one
                console.log("X4");
				localStorage.setItem('metaID', config.id);
				localStorage.setItem('household_id', config.hh);
				localStorage.setItem('dateChoice', config.start);
				log.id 				= config.id;
				log.start			= config.start;
				app.catchupList 	= config.times;
				// if (config.id == "0") {
				// 	$("div#change-id").show();
				// 	$("div#btn-time").attr("onclick", "app.navigateTo('activity time absolute')"); // clicking 'recent' now leads to absolute time values
				// }
				dir.getFile("METER/"+config.id+"_ind.csv", {create:false}, function(file) {
					console.log("got existing survey file", file);
					log.logSurvey = file;
				}, function(err) {
					dir.getFile("METER/"+config.id+"_ind.csv", {create:true}, function(file) {
						console.log("created survey file", file);
						utils.save(SURVEY_STATUS,'survey root');
						// $("div#nav-status").hide();
						// $("div#nav-aboutme").show();
						log.logSurvey = file;
					}, function(err) {
						console.log(err);
					});
				});

				dir.getFile("METER/"+config.id+"_act.json", {create:false}, function(file) {
					console.log("got exisiting activities file", file);
					log.ActJSON = file;
				}, function(err) {
					dir.getFile("METER/"+config.id+"_act.json", {create:true}, function(file) {
						console.log("created activities file", file);
						log.ActJSON = file;
						// utils.saveList(ACTIVITY_LIST,"");
					}, function(err) {
						console.log(err);
					});
				});

				dir.getFile("METER/"+config.id+"_act.csv", {create:false}, function(file) {
					console.log("got exisiting activities file", file);
					log.logAct = file;
				}, function(err) {
					dir.getFile("METER/"+config.id+"_act.csv", {create:true}, function(file) {
						console.log("created activities file", file);
						log.logAct = file;
						utils.saveList(ACTIVITY_LIST,"");
					}, function(err) {
						console.log(err);
					});
				});

				// I made this txt, so that all data is distinct as csv files
				dir.getFile("METER/debug.txt", {create:true}, function(file) {
					console.log("got debug file", file);
					log.logDebug = file;
				}, function(err) {
					console.log(err);
				});
			});
		});
	}
	//  else {
	// 	$.getJSON("/js/config.json", function(config) {
	// 		log.id 				= config.id;
	// 		log.start			= config.start;
	// 		app.catchupList 	= config.times;
	// 	})
	// }
},

// XXX take these two functions out (only were used by changeID()
	initSurveyFile: function() {
			window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
	                dir.getFile("METER/" + log.metaID + "_ind.csv", {create:true}, function(file) {
	                    log.logSurvey = file;
	                }, function(err) {
	                    console.log(err);
	                });
				});
	},
	initActFile: function() {
			window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
	                dir.getFile("METER/" + log.metaID + "_act.csv", {create:true}, function(file) {
	                    log.logAct = file;
	                }, function(err) {
	                    console.log(err);
	                });
				});
	},


	setMetaID: function( metaID_ ) {
		log.metaID = metaID_;
	},


    rewriteFile: function(obj, str) {
        if (device.platform != "browser") {
    	obj.createWriter(function(fileWriter) {
            //fileWriter.seek(fileWriter.length);
            var blob = new Blob([str], {type:'text/plain'});
            fileWriter.write(blob);
        }, function(err) {
            console.log(err)
        });
		}
    },


    writeToFile: function(obj, str) {
    	obj.createWriter(function(fileWriter) {
            fileWriter.seek(fileWriter.length);
            var blob = new Blob([str], {type:'text/plain'});
            fileWriter.write(blob);
        }, function(err) {
            console.log(err)
        });
    },

    writeLog: function(logobj, str) {
        if (device.platform == "browser") {
            console.log(str);
            return;
        }
        if (!logobj) {
        	console.log("Activity log undefined.");
        	return;
        }
        // console.log("about to write log", logobj);
        log.writeToFile(logobj, str);
    },

    writeDebug: function(str) {
        var str = "[" + (new Date().toISOString()) + "] " + str + "\n";
        // console.log("about to write debug log");
        log.writeLog(log.logDebug, str)
    },

    writeSurvey: function(title,value) {
    	var dt_recorded = new Date().toISOString();
		dt_recorded = dt_recorded.substring(0,19);
    	var logstr = [dt_recorded, title, value, log.id].join() + "\n";
        // console.log("about to write survey log");
        log.writeLog(log.logSurvey, logstr)
    },
}
