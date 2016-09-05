/**
 * Phil and Davide...
 */

var log = {

    logOb: null,
    logAct: null,
    logDebug: null,
    logSurvey: null,
	metaID: "0",
	id: 7,
	pathID: '/sdcard/METER/id.txt',
	pathCatchup: '/sdcard/METER/catchup.json',
    
	init: function() {
		if (device.platform != "browser") {        
			window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
		console.log("got main dir",dir);
		// the existence of folder METER is assumed
		// in this folder is also id.txt to identify the user


		$.getJSON("/sdcard/METER/config.json", function(config) {
			log.id 				= config.id;
			app.catchupList 	= config.catchup;
			app.deviceColour 	= config.colour;
		//});
		//
		//log.readID( function(thisID) {
		// if (thisID == "0") {
		if (config.id == "0") {
			$("div#change-id").show();
			$("div#btn-time").attr("onclick", "app.navigateTo('activity time absolute')"); // clicking 'recent' now leads to absolute time values
		}
		dir.getFile("METER/"+config.id+"_ind.csv", {create:true}, function(file) {
			console.log("got survey file", file);
			log.logSurvey = file;
		}, function(err) {
			console.log(err);
		});
		dir.getFile("METER/"+config.id+"_act.csv", {create:true}, function(file) {
			console.log("got activities file", file);
			log.logAct = file;
		}, function(err) {
			console.log(err);
		});
		// I made this txt, so that all data is distinct as csv files
		dir.getFile("METER/debug.txt", {create:true}, function(file) {
			console.log("got debug file", file);
			log.logDebug = file;
			log.writeLog("App started");          
		}, function(err) {
			console.log(err);
		});					
		});
			});
		}
	},
    
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

    readID: function( callback ) {
		if (log.metaID == "0") {
			$.get(log.pathID, function(id_) {
				metaID = $.trim(id_);
				if (typeof(callback) === "function" ) {
				log.metaID = metaID;
					callback(metaID);
				}
				log.metaID = metaID;
			});
		}
		return log.metaID;
    },


	setMetaID: function( metaID_ ) {
		log.metaID = metaID_;
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
    	var logstr = [dt_recorded, title, value, log.metaID].join() + "\n";
        // console.log("about to write survey log");
        log.writeLog(log.logSurvey, logstr)
    },

    writeActivity: function() {
		// SUPERSEEDED - now calling writeLog directly from index.js addActivityToList()
    	var dt_recorded = new Date().toISOString();
		var dt_act;
		if (utils.get(ACTIVITY_DATETIME) == "same") {
			dt_act = dt_recorded;
		} else {
			dt_act = utils.get(ACTIVITY_DATETIME);
		} 
		var act = "\"" + utils.get(CURR_ACTIVITY) + "\"";
		var details =  utils.get(CURR_ACTIVITY_ID); // tuc, category, title
		var loc =  utils.get(CURR_LOCATION) ;
		var enj =  utils.get(CURR_ENJOYMENT);          

    	var str = [log.metaID,dt_act, dt_recorded, details, loc, enj].join() + "\n";
    	log.writeLog(log.logAct, str)

		// "same" means 'not different from current time' - writeActivity replaces "same" with current time
		// var manualDate = utils.get(ACTIVITY_MANUAL_DATE);
		// if (manualDate !== "none") {
    	// 	utils.save(ACTIVITY_DATETIME, manualDate);
		// } else {
	    // 	utils.save(ACTIVITY_DATETIME, "same");
		// }
    }
}
