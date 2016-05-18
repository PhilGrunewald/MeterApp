/**
 * 
 */

var log = {

    logOb: null,
    logAct: null,
    logDebug: null,
    logSurvey: null,
    logID: null,
	metaID: null,
	pathID: '/sdcard/METER/id.txt',
	DEFAULT_ID: "99997",
    
	init: function() {
		if (device.platform != "browser") {        
			window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
				console.log("got main dir",dir);
				// the existence of folder METER is assumed
				// in this folder is also id.txt to identify the user
				//
				// Read ID file
				// XXX to be implemented

				//log.metaID="99997";
				log.readID( function(metaID) {
					dir.getFile("METER/"+metaID+"_ind.csv", {create:true}, function(file) {
	                    console.log("got survey file", file);
	                    log.logSurvey = file;
	                }, function(err) {
	                    console.log(err);
	                });
	                dir.getFile("METER/"+metaID+"_act.csv", {create:true}, function(file) {
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
    
    readID: function( callback ) {
    	$.get(log.pathID, function(id_) {
    		metaID = $.trim(id_);
    		callback(metaID);
    		log.metaID = metaID;
		});
    	
    	return log.metaID;
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
    	var dt_recorded = new Date().toISOString();
		var dt_act;
		if (utils.get(ACTIVITY_DATETIME) == "same") {
			dt_act = dt_recorded;
		} else {
			dt_act = utils.get(ACTIVITY_DATETIME);
		} 
		var act = "\"" + utils.get(CURR_ACTIVITY) + "\"";
		var tuc =  utils.get(CURR_ACTIVITY_ID) ;
		var loc =  utils.get(CURR_LOCATION) ;
		var enj =  utils.get(CURR_ENJOYMENT);          

    	var str = [log.metaID,dt_act, dt_recorded, tuc, act, loc, enj].join() + "\n";
    	log.writeLog(log.logAct, str)

		// "same" means 'not different from current time' - writeActivity replaces "same" with current time
    	utils.save(ACTIVITY_DATETIME, "same");
    }
}
