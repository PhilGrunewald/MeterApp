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
	                    app.writeActivity("New session");          
	                }, function(err) {
	                    console.log(err);
	                });
	                dir.getFile("METER/debug.csv", {create:true}, function(file) {
	                    console.log("got debug file", file);
	                    log.logOb = file;
	                    log.writeLog("App started");          
	                }, function(err) {
	                    console.log(err);
	                });
	            });
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
	            console.log(err);
	        });
	    }
}