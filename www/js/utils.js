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
		} else {
			return str; // no other function implemented
		}

		// should never get here
		return str;

	}, 

	uuid : function() {
		var d = new Date().getTime();
		if(window.performance && typeof window.performance.now === "function"){
			d += performance.now(); //use high-precision timer if available
		}
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	},

	format_time : function(str) {
		return new Date(str).toTimeString().substring(0, 5)
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

}
