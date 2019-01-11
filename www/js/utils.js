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
            var dt_act = utils.get(ACTIVITY_DATETIME).replace(" ","T");
            if (dt_act == "same") {
                time_ = new Date();
            } else {
                time_ = new Date(dt_act);
            }

            res = new Date(time_.getTime());
            if (elems[1] == "-"){
                var mins = parseInt(elems[2]) * 60000;
                res = new Date(time_.getTime() - mins);
            } else
            if (elems[1] == "+"){
                var mins = parseInt(elems[2]) * 60000;
                res = new Date(time_.getTime() + mins);
            }
            ISOtime = res.toISOString();
            res = utils.format_dt_AMPM(ISOtime);
            // res = ISOtime.substring(11,16);
            return str.replace(intime_var, res)
        } else if (elems[0] == "rel_time") {
            var dt_act = utils.get(ACTIVITY_DATETIME).replace(" ","T");
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
            minDiff = Math.round(minDiff/5)*5;
            if (minDiff > 59) {
                hourStr = parseInt(minDiff/60) + " h ";
            }
            if (minDiff % 60 != 0) {
                minStr = minDiff % 60 + " min" ;
            }

            var hour = time_.getHours();
            var min  = time_.getMinutes();
            min = Math.round(min/5)*5;
            if (min == 60) {
                min = 0;
                hour += 1;
            }
            if (app.label.hours == "12") {
                hour = hour % 12;
                hour = hour ? hour : 12; // the hour '0' should be '12'
            }
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

    getUTCDateForSQL: function(dt) {
        // produces a ISO like string without timezone
        // 2000-07-31T00:59:59 (BST) -> 2007-07-30 23:59:59
        y = dt.getFullYear();
        m = utils.padded(dt.getUTCMonth()+1);
        d = utils.padded(dt.getUTCDate());
        h = utils.padded(dt.getUTCHours());
        M = utils.padded(dt.getUTCMinutes());
        s = utils.padded(dt.getUTCSeconds());
        return y+'-'+m+'-'+d+' '+h+':'+M+':'+s;
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

    getDateTimeStr: function(DateTime) {
        // produces a ISO like string without timezone
        // 2000-07-31T00:59:59 (BST) -> 2007-07-30 23:59:59
        dt = new Date(DateTime);
        // y = dt.getFullYear();
        // m = utils.padded(dt.getMonth()+1);
        // d = utils.padded(dt.getDate());
        // h = utils.padded(dt.getHours());
        // M = utils.padded(dt.getMinutes());
        // s = utils.padded(dt.getSeconds());
        // return y+'-'+m+'-'+d+' '+h+':'+M+':'+s;
        return utils.getDateForSQL(dt);
    },

    actID : function(actDT) {
        //var d = new Date().getTime();
        actTime = actDT.toISOString();
        actTime += performance.now();   //use high-precision timer
        // ID needs the T for time zone - otherwise sorting goes funny
        return actTime.toString().replace(" ","T");
    },

    uuid : function() {
        // used to create ID based on creation time
        // superseeded (?) by actID
        var d = new Date().getTime();
        d += performance.now();     //use high-precision timer
        return d.toString();
    },

    //
    //  TIME handling
    //

    format_time : function(str) {
        return new Date(str).toTimeString().substring(0, 5)
    },

    format_weekday : function(str) {
        var d = new Date(str);
        var weekday = new Array(7);
        weekday[0]=  "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";

        return weekday[d.getDay()];
    },

    extractTimeStr: function(ISOTime) {
        var hours=parseInt(ISOTime.slice(11,13));
        var minutes=parseInt(ISOTime.slice(14,16));
        var ampm = hours >= 12 ? 'pm' : 'am';
        if (app.label.hours == "12") {
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
        }
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    },

    format_dt_AMPM: function(str) {
        var hh = new Date(str).toTimeString().substring(0, 2);
        var mm = new Date(str).toTimeString().substring(3, 5);
        return utils.formatAMPM(parseInt(hh),parseInt(mm));
    },

    formatAMPM: function(hours,minutes) {
        if (minutes > 57) {
            hours = parseInt(hours) + 1;
            minutes = 0;
        }
        minutes = Math.round(minutes/5)*5;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        if (app.label.hours == "12") {
            var ampm = hours >= 12 ? '<ampm> pm</ampm>' : '<ampm> am</ampm>';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            var strTime = hours + ':' + minutes + ampm;
        }
        else {
            var strTime = hours + ':' + minutes;
        }
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
