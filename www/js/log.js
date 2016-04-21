/**
 * 
 */

var log = {

	    logOb: null,
	    logAct: null,
	    
	    init: function() {
	        if (device.platform != "browser") {        
	            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
	                console.log("got main dir",dir);
					// the existence of folder METER is assumed
					// in this folder is also id.txt to identify the user
	                dir.getFile("METER/survey.csv", {create:true}, function(file) {
	                    console.log("got survey file", file);
	                    log.logSurvey = file;
	                    log.writeSurvey("New session");          
	                }, function(err) {
	                    console.log(err);
	                });
	                dir.getFile("METER/activities.csv", {create:true}, function(file) {
	                    console.log("got activities file", file);
	                    log.logAct = file;
	                    log.writeActivity("New session");          
	                }, function(err) {
	                    console.log(err);
	                });
	                dir.getFile("METER/debug.csv", {create:true}, function(file) {
	                    console.log("got debug file", file);
	                    log.logDebug = file;
	                    log.writeLog("App started");          
	                }, function(err) {
	                    console.log(err);
	                });
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
	        log.writeToFile(logobj, str);
	    },

	    writeDebug: function(str) {
	        var str = "[" + (new Date().toISOString()) + "] " + str + "\n";
	        log.writeLog(log.logDebug, str)
	    },

	    writeSurvey: function(str) {
	    	var dt_recorded = new Date().toISOString();
	    	var logstr = [dt_recorded, str].join() + "\n";

	        log.writeLog(log.logSurvey, str)
	    },

	    writeActivity: function(activity, dt_activity, location, enjoyment) {
	    	
	    	var dt_recorded = new Date().toISOString();
	    	var str = [dt_recorded, dt_activity, activity, location, enjoyment].join() + "\n";
	    	
	    	log.writeLog(log.logAct, str)
	    }
}