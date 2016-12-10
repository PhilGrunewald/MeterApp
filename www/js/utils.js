/**
 * 
 */

String.prototype.format = String.prototype.f = function() {
	var s = this,
	i = arguments.length;
	while (i--) {
		s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}
	return s;
};


var utils = {
	format: function(str) {
		if (str === undefined || str == "") {
			return str;
		}
		var intime_arr = str.match(/\$.*\}/)
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
		var elems = intime.split(" ");
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
		} else if (elems[0] == "act_time") {
			var dt_act = utils.get(ACTIVITY_DATETIME);
			if (dt_act == "same") {
				time_ = new Date();
			} else { 
				time_ = new Date(dt_act);
			}

			res = new Date(time_.getTime());
			if (elems[1] == "-"){
				var mins = parseInt(elems[2]) * 60000;
				res = new Date(time_.getTime() - mins);
				console.log("res: " +res);
			} else 
			if (elems[1] == "+"){
				var mins = parseInt(elems[2]) * 60000;
				res = new Date(time_.getTime() + mins);
			}
			ISOtime = res.toISOString();
			res = ISOtime.substring(11,16);
			return str.replace(intime_var, res)
		} else if (elems[0] == "rel_time") {
			var dt_act = utils.get(ACTIVITY_DATETIME);
			if (dt_act == "same") {
				time_ = new Date();
			} else { 
			time_ = new Date(dt_act);
			}

			var nowTime  = new Date().getTime();
			var minDiff  = Math.round((time_.getTime() - nowTime)/60000);
			var preStr  = "";
			var postStr = "";
			var hourStr  = "";
			var minStr   = "";

			if (minDiff > 0) {
				preStr  = "in ";
				postStr = "";
			} else {
				preStr  = "";
				postStr = " ago";
				minDiff *= -1;
			}
			minDiff = Math.round(minDiff/5)*5;
				// if (minDiff > 119) {
				//     hourStr = parseInt(minDiff/60) + " hours ";
				// } else
				if (minDiff > 59) {
					hourStr = parseInt(minDiff/60) + " h ";
				//     hourStr = parseInt(minDiff/60) + " hour ";
				}
				if (minDiff % 60 != 0) {
					minStr = minDiff % 60 + " min" ;
				}
				var act_time = time_.toISOString();
				var actHour = act_time.substring(11,13);
				var actMin = act_time.substring(14,16);
				actMin = Math.round(actMin/5)*5;
				if (actMin == 60) {
					actMin = 0;
					actHour = parseInt(actHour)+1;
				}

			actMinStr = ("0" + actMin).slice(-2);

			if (parseInt(minDiff) == 0) {
				app.drawClock(app.actClock,parseInt(actHour),parseInt(actMin),"",actHour+":"+actMinStr);
				res = " at the moment";
			} else {
				res = preStr + hourStr + minStr + postStr;
				app.drawClock(app.actClock,parseInt(actHour),parseInt(actMin),"",actHour+":"+actMinStr);
			}

			app.actClockDiv.show();
			app.actClock.show();
			return str.replace(intime_var, res)
		}
	      else	{
			return str; // no other function implemented
		}

		// should never get here
		return str;

	}, 

	actID : function(actTime) {
		//var d = new Date().getTime();
		actTime += performance.now();  	//use high-precision timer 
		return actTime.toString();
	},

	uuid : function() {
		// used to create ID based on creation time
		// superseeded (?) by actID
		var d = new Date().getTime();
		d += performance.now();  	//use high-precision timer 
		return d.toString();
	},

        //
        //  TIME handling
        //

	format_time : function(str) {
		return new Date(str).toTimeString().substring(0, 5)
	},
	
	extractTimeStr: function(ISOTime) {
		var hours=parseInt(ISOTime.slice(11,13));
		var minutes=parseInt(ISOTime.slice(14,16));
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0'+minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;
	},

	formatAMPM: function(hours,minutes) {
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0'+minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;
	},

        //
        // LOCAL variable handling
        //

        save: function(key, val) {
            localStorage.setItem(key, val);
            console.log("saving: " + key + " > " + val);
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

}
