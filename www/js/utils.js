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
                dt = new Date();
            } else {
                dt = new Date(dt_act);
            }

            if (elems[1] == "-"){
                var mins = parseInt(elems[2]) * 60000;
                dt = new Date(dt.getTime() - mins);
            } else
            if (elems[1] == "+"){
                var mins = parseInt(elems[2]) * 60000;
                dt = new Date(dt.getTime() + mins);
            }
            var hours   = dt.getHours();
            var minutes = (dt.getMinutes()<10?'0':'') + dt.getMinutes();
            res = hours + ":" + minutes;
            return str.replace(intime_var, res);
        } else if (elems[0] == "rel_time") {
            var dt_act = utils.get(ACTIVITY_DATETIME);//.replace(" ","T");
            // var dt_act = utils.get(ACTIVITY_DATETIME);
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
                preStr  = app.label.time.after.pre;
                postStr = app.label.time.after.post;
            } else {
                preStr  = app.label.time.before.pre;
                postStr = app.label.time.before.post;
                minDiff *= -1;
            }
            // minDiff = Math.round(minDiff/5)*5;
            if (minDiff > 59) {
                hourStr = parseInt(minDiff/60) + " h ";
            }
            if (minDiff % 60 != 0) {
                minStr = minDiff % 60 + " min" ;
            }

            var hour = time_.getHours();
            var min  = time_.getMinutes();
            // min = Math.round(min/5)*5;
            if (min == 60) {
                min = 0;
                hour += 1;
            }
            // if (app.label.hours == "12") {
            //     hour = hour % 12;
            //     hour = hour ? hour : 12; // the hour '0' should be '12'
            // }
            minPad = min < 10 ? '0'+min : min;

            if (parseInt(minDiff) == 0) {
                res = app.label.AtTheMoment;
            } else {
                res = preStr + hourStr + minStr + postStr;
            }
            app.drawClock(app.actClock,hour,min,"",hour+":"+minPad);

            app.actClockDiv.show();
            app.actClock.show();
            return str.replace(intime_var, res)
        }
        else    {
            return str; // no other function implemented
        }

        // should never get here
        return str;

    },

    padded: function(i) {
        return i < 10 ? '0' + i : i;
    },

    getDateForSQL: function(dt) {
        // produces a ISO like string without timezone
        // 2000-07-31T00:59:59 (BST) -> 2007-07-30 23:59:59
        y = dt.getFullYear();
        m = utils.padded(dt.getMonth()+1);
        d = utils.padded(dt.getDate());
        h = utils.padded(dt.getHours());
        M = utils.padded(dt.getMinutes());
        s = utils.padded(dt.getSeconds());
        return y+'-'+m+'-'+d+' '+h+':'+M+':'+s;
    },


    actID : function(actDT) {
        actTime = utils.getDateForSQL(actDT); 
        actTime += performance.now();   //use high-precision timer
        return actTime.toString();
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
