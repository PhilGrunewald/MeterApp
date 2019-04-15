var checkServerURL = meterURL + "checkServer.php";
var getMetaID = meterURL +  "getMetaID.php";
var getAddresses =  meterURL +  "getAddresses.php";
var checkForHouseID = meterURL +  "checkAddress.php";
var linkHouseholdURL = meterURL +  "linkHousehold.php";
var getDateChoice = meterURL +  "getDateChoice.php";
var getIntervention = meterURL +  "getIntervention.php";
var requestAutorisationURL = meterURL +  "requestAutorisation.php";
var checkAuthorisationURL = meterURL +  "checkAuthorisation.php";

var insertSurvey = meterURL +  "insertSurvey.php";
var insertActivity = meterURL +  "insertActivity.php";
var insertError = meterURL +  "insertError.php";
var insertContactDetails = meterURL + "insertContactDetails.php";


setInterval(connectionManager, 10000); //Begin connecting to server on intervals , in ms (default 10s)
setInterval(hourlyChecks, 60*60*1000); // less frequently needed checks (1 hour)

window.onerror = function(message, source, lineNumber) {
    //This doesn't trigger on every error (unreliable)
    message = message.replace(/[-'"+()]/g, ""); //Removing characters which could confuse php and split()
    var errorInfo = message + "#" + lineNumber;
    localStorage.setItem("errorsToUpload", localStorage.getItem('errorsToUpload') + ";" + errorInfo);
    //Then connection manager uses this value to upload to server
    return false; //true would catch the error
};


function uploadActivities() {
    var activitiesToUploadCopy = localStorage.getItem('activitiesToUpload').replace(/'/g, "\\'");
    var activitiesToUploadArray = activitiesToUploadCopy.split(';');
    if (activitiesToUploadArray[0]=="" || activitiesToUploadArray[0]=="null"){
        activitiesToUploadArray.shift(); //removes fisrt item if it's empty or null
    }
    var request;
    request = $.ajax({ //Send request to php
        url: insertActivity,
        type: "POST",
        data: {dataArray:activitiesToUploadArray, metaID:localStorage.getItem('metaID')}, //send array of items
        success: function(response) {
            if (response.split("#")[0]=="Success") { //to confirm whether data has been inserted
                console.log("Succesfully uploaded!");
                localStorage.setItem('activitiesToUpload', '');
                //This removes the sent items from the current list (incase they add an activity whilst it's being sent)
            } else {
                console.log("MySQL connection error" + response);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
        }
    });
}

/*
Normal added activities are sent with actviity key + details
Deleted activities are uploaded with key but empty details and a "DELETED" string
(Edited activites are handled by the above two as they are first deleted then added again as normal under a different key)

Exceptions that are handled: no wifi connection, no connection to php host, php host fails to insert data
*/

function requestMetaID(functionToExecuteNext){
    console.log("Requesting next ID");
    var request;
    request = $.ajax({
        url: getMetaID,
        type: "POST",
        data: {deviceType:device.platform + ", " + device.cordova + ", " + device.model + ", " + device.version +  ", " + device.manufacturer + ", " + device.serial, deviceUUID:device.uuid},
        success: function(response) {
            if (response.split("#")[0]=="Success") {
                console.log("Got id: " + response.split("#")[1]);
                localStorage.setItem('metaID', response.split("#")[1]); // 1 = latest data has been uploaded
            } else {
                console.log("MySQL connection error" + response);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
        }
    });
}

function requestAddresses(postcode){ //Requesting from API (or really our PHP which connects to the API)
    console.log("Requesting Addresses");
    var request;
    request = $.ajax({
        url: getAddresses,
        type: "POST",
        data: {postcode:postcode},
        success: function(response) {
            console.log("Response: " + response);
            var status = response.split("#")[1];
            console.log("Address API status: " + status);
            //Handle possible events (see http://get address.so/Documentation)
            if (status=="Success") {
                console.log("Addresses: " + response.split("#<br>")[1]);
                var addresses = (response.split("#<br>")[1]).split("<br>"); //Array of addresses
                console.log("Got addresses: " + addresses);
                app.populateAddressList(addresses); //List of addresses
            } else if (status=="Invalid postcode") {
                alert("Please enter a valid postcode");
                app.personaliseClick();
            } else if (status=="Invalid API key") {
                alert("Invalid API key");
                app.returnToMainScreen();
            } else if (status=="No addresses found") {
                //How should this be handled?
                alert("No addresses found on that postcode");
                app.personaliseClick();
            } else if (status=="API limit reached") {
                alert("API limit reached");
                app.returnToMainScreen();
            } else if (status=="API server down") {
                alert("API server down");
                app.returnToMainScreen();
            } else if (status=="Unknown error") {
                app.returnToMainScreen();
                alert("1 Please try again later");
            } else {
                app.returnToMainScreen();
                alert("2 Please try again later");
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            app.personaliseClick();
            console.log("Check server connection (to php): " + textStatus);
            alert("Please check your internet connection");
        }
    });
}


function checkForAddress(address) { //Checks whether address is in our database
    console.log("Checking for contact with this address");
    var request;
    request = $.ajax({
        url: checkForHouseID,
        type: "POST",
        data: {address:address, postcode:localStorage.getItem("postcode")},
        success: function(response) {
            if (response.split("#")[0]=="Success") {
                // household already exists
                console.log("Got household id: " + response.split("#")[1]);
                localStorage.setItem('household_id', response.split("#")[1]);
                // Change menu
                app.screens['menu']['activities'][1] = "Authorise";
                // Trigger linking
                linkHousehold();
                // go home
                app.title.html(app.label.addressLinked);
                app.returnToMainScreen();
            } else if (response.split("#")[0]=="0 results") {
                // no such household yet > sign up form
                console.log("0 results");
                app.contactInfoScreen(); //Shows name and email inputs
            } else {
                alert("Please try again later");
                app.returnToMainScreen();
                console.log("MySQL (connection/query) error: " + response);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            app.personaliseClick();
            console.log("Check server connection (to php): " + textStatus);
            console.log(errorThrown);
            console.log(textStatus);

            alert("Please check your internet connection");
        }
    });
}


function checkHHIntervention() {
    var request;
    var date = localStorage.getItem('dateChoice');
    var sc   = localStorage.getItem('sc');
    var hhID = localStorage.getItem('household_id');
    request = $.ajax({ //Send request to php
        url: getIntervention,
        type: "POST",
        data: {hhID:hhID,date:date,sc:sc},
        success: function(response) {
            if (response.split("#")[0]=="Got intervention") {
                var intervention = response.split("#")[1];
                if (intervention > 0) { 
                    var d = new Date(date + 'T17:00:00'); // at 5pm
                    d.setDate(d.getDate() + 1);      // intervention on Day 2
                    d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
                    var itvID = utils.actID(d).substring(0,19);
                    localStorage.setItem('intervention',itvID);
                    var activityList = utils.getList(ACTIVITY_LIST);
                    var actIntStart = {
                                       'dt_activity': utils.getDateForSQL(d), 
                                       'key': 'intervention',
                                      };
                    activityList[itvID] = actIntStart;
                    utils.saveList(ACTIVITY_LIST, activityList);

                    console.log("Intervention is set!");
                    app.statusCheck();
                } else {
                    console.log("No intervention");
                    itvID = localStorage.getItem('intervention');
                    app.deleteAct(itvID);
                    localStorage.removeItem('intervention');
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
        }
    });
}


function checkDateChoiceExpired() {
    var dateChoice = localStorage.getItem('dateChoice');
    var d = new Date(dateChoice + 'T21:00:00'); // at 9pm
    d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
    d.setDate(d.getDate() + 1);      // end on Day 2 at 9pm
    var today = new Date();
    if (today > d) {
        localStorage.removeItem('dateChoice');
        var studyEndID = utils.actID(d).substring(0,19);
        var activityList = utils.getList(ACTIVITY_LIST);
        var actStudyEnd = {
                           'dt_activity': utils.getDateForSQL(d), 
                           'key': 'study end',
                          };
        activityList[studyEndID] = actStudyEnd;
        utils.saveList(ACTIVITY_LIST, activityList);
        console.log("Study completed");
        app.statusCheck();
    }
}

function checkInterventionExpired() {
    var dt = localStorage.getItem('intervention');
    var d = new Date(dt); // at 9pm
    d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
    d.setTime(d.getTime() + 2*60*1000);      // +2 hours end on Day 2 at 9pm
    var now = new Date();
    if (now > d) {
        localStorage.removeItem('intervention');
        var interventionEndID = utils.actID(d).substring(0,19);
        var activityList = utils.getList(ACTIVITY_LIST);
        var interventionEnd = { 'dt_activity': utils.getDateForSQL(d), 
                           'key': 'intervention end',
                          };
        activityList[interventionEndID] = interventionEnd;
        utils.saveList(ACTIVITY_LIST, activityList);
        console.log("intervention over");
        app.statusCheck();
    }
}

function getHHDateChoice() {
    var request;
    request = $.ajax({ //Send request to php
        url: getDateChoice,
        type: "POST",
        data: {hhID:localStorage.getItem('household_id')},
        success: function(response) {
            if (response.split("#")[0]=="Got date") { //to confirm whether data has been inserted
                var dateChoice = response.split("#")[1];
                if (dateChoice != '2000-01-01') {         // default, i.e. no date chosen
                    var d = new Date(dateChoice); 
                    var today = new Date();
                    if (d > today) {
                        localStorage.setItem('dateChoice',dateChoice);
                        var d = new Date(dateChoice + 'T17:00:00'); // at 5pm
                        // d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
                        var studyID = utils.actID(d).substring(0,19);

                        if (studyID != localStorage.setItem('studyID',studyID)) {
                                // study date changed / is new
                                localStorage.setItem('studyID',studyID);
                                var activityList = utils.getList(ACTIVITY_LIST);
                                var actStudyStart = { 'dt_activity': utils.getDateForSQL(d), 
                                                     'key': 'study'
                                                    };
                                activityList[studyID] = actStudyStart;
                                utils.saveList(ACTIVITY_LIST, activityList);

                                console.log("Study date is set!");
                        }
                    } else {
                        // date is past
                        console.log("Study date is outdated");
                    }
                } else {
                    // no date was chosen
                    localStorage.removeItem('dateChoice'); // will keep checking
                }
            app.statusCheck();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
        }
    });
}


function linkHousehold(hhID) {
    var request;
    request = $.ajax({ //Send request to php
        url: linkHouseholdURL,
        type: "POST",
        data: {household_id:hhID, metaID:localStorage.getItem('metaID')}, //send array of items
        success: function(response) {
            if (response.split("#")[0]=="Success") { //to confirm whether data has been inserted
                console.log("Succesfully uploaded!");
                console.log(response);
                localStorage.setItem('householdStatus', "LINKED"); // stops further attempts
                app.statusCheck();
            } else {
                localStorage.removeItem('householdStatus'); // keep trying
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { // for logging
            console.log("Check server connection (to php): " + textStatus);
            localStorage.removeItem('householdStatus'); // keep trying
        }
    });
}

function checkAuthorisation() {
    var request;
    request = $.ajax({ //Send request to php
        url: checkAuthorisationURL,
        type: "POST",
        data: {mID:localStorage.getItem('metaID'), serialNumber:device.uuid,pass:localStorage.getItem('pass')},
        success: function(response) {
            if (response.split("#")[0]=="Success") {
                console.log("This meta ID is authorised");
                var sc = response.split('#')[1]
                localStorage.setItem('sc',sc); 
                app.statusCheck();
            } else {
                console.log("This meta ID is not authorised");
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { // for logging
            console.log("error in checkAuthorisation");
        }
    });
}


function requestAutorisation() {
    var request;
    request = $.ajax({ //Send request to php
        url: requestAutorisationURL,
        type: "POST",
        data: {hhID:localStorage.getItem('household_id'), mID:localStorage.getItem('metaID'), name: $("input#free-text").val(), safeguard:"A_long_string_to_make_sure_we_do_not_get_bots_guessing_the_URL_and_send_annoying_emails_to_our_participants_7603q4#33"}, // send hh ID
        success: function(response) {
            if (response.split("#")[0]=="Success") { //to confirm whether data has been inserted
                console.log("Email sent!");
                console.log(response);
                app.title.html("Autorisation requested. Please check the registered email.");
                localStorage.setItem('AwaitAuthorisation', true);
                $("div#other-specify").hide();
                app.statusCheck();
            } else {
                console.log("MySQL connection error" + response);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
        }
    });
}


function surveyUpload() {
    var request;
    request = $.ajax({ //Send request to php
        url: insertSurvey,
        type: "POST",
        data: {survey:localStorage.getItem("surveyAnswers").split('#'), metaID:localStorage.getItem('metaID')}, //send survey array
        success: function(response) {
            if (response.split("#")[0]=="Success") { //to confirm whether data has been inserted
                console.log("Succesfully uploaded!");
                localStorage.setItem('surveyUploaded', '1'); // 1 = latest data has been uploaded
            } else {
                console.log("MySQL connection error" + response);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
        }
    });
}

function submitContactInfo() {
    var Name = document.getElementById("contact_name").value;
    var Email = document.getElementById("contact_email").value;
    var Source = "appVersion:" + appVersion;
    var address = localStorage.getItem("address").split(",");
    var address1 = address[0];
    var address2 = address[1];
    var town = address[4];
    var postcode = localStorage.getItem("postcode");
    var request;
    request = $.ajax({ //Send request to php
        url: insertContactDetails,
        type: "POST",
        data: {Name:Name,Email:Email,Source:Source,address1:address1,address2:address2,town:town,postcode:postcode}, //send survey array
        success: function(response) {
                console.log("Response: " + response);
                //response contains hhq.php? and the corresponding GET values
                //line 71: echo "app/hhq.php?sc=" . $securityCode . "&pg=0&id=" . $last_id  . "#";
                var hhqURL = meterURL + response.split("app/")[1].split("#")[0];
                console.log("This is the address received from insertContactDetails.php: " + hhqURL);
                app.registerNewHousehold(hhqURL);// address, localStorage.getItem("postcode"));
                //window.location.href = meterURL + response.split('#')[0];
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
            alert("Please check your internet connection and try again later");
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function online() {
    // assume the worst - no internet
    var isOnline;
    isOnline = true;
    var request;
    request = $.ajax({ //Send request tisOnlinephp
        url: checkServerURL,
        type: "POST",
        success: function(response) {
            if (response == "Success") {
                // isOnline = true;
                console.log("Online");
            }
        },
        error: function() {
            console.log("failed to check Onlineness");
            isOnline = false;
        }
    });
    return isOnline;
}

function checkServer() {
    if (online()) {
       localStorage.setItem('Online', true);
    } else {
       localStorage.removeItem('Online');
    }
}

function hourlyChecks() {

    if (localStorage.getItem('Online') == "true"){
            // Has a participation date been set?
            if (localStorage.getItem('household_id') != null && localStorage.getItem('dateChoice') == null) {
                getHHDateChoice();
            } 

            // Does this date come with an intervention?
            if (localStorage.getItem('dateChoice') != null && localStorage.getItem('intervention') == null) {
                checkHHIntervention();
            } 

            // Is device authorised?
            if (localStorage.getItem('household_id') != null && localStorage.getItem('sc') == null) {
                checkAuthorisation();
            }

            if (localStorage.getItem("errorsToUpload")!=null && localStorage.getItem("errorsToUpload")!="") {
                //If there is at least one error to upload
                uploadErrorMessages();
                console.log("there are errors...");
            }
    }
    app.statusCheck();
}

function connectionManager() {
    //
    // called from timer
    // gets Meta_ID, uploads activities, uploads survey
    //
    checkServer();
   
    if (localStorage.getItem('Online') == "true"){
        if (localStorage.getItem('metaID') == null){
            requestMetaID();
        } else {
            if (localStorage.getItem('activitiesToUpload') != "" && localStorage.getItem('activitiesToUpload') != null) {
                console.log("Uploading Activities");
                uploadActivities(); //Called if there are items to upload
            }
            if (localStorage.getItem('surveyUploaded') != 1 && localStorage.getItem('survey root') == 'survey complete') {
                console.log("Uploading Survey");
                surveyUpload(); //called if survey is complete but has not been uploaded up and we already have an ID
            }

            if(localStorage.getItem('household_id') != null && localStorage.getItem('householdStatus') == null) {
                // This means we have got a hhid but havent linked to it yet
                linkHousehold(localStorage.getItem('household_id'));
                console.log("Linking household");
            } 
            
            // Is device authorised?
            if (localStorage.getItem('AwaitAuthorisation') != null) {
                checkAuthorisation();
            }

        }
    } else {
        console.log("Offline");
    }
    // date check can be done offline as well
    if (localStorage.getItem('dateChoice') != null) {
        checkDateChoiceExpired();
    } 
    if (localStorage.getItem('intervention') != null) {
        checkInterventionExpired();
    } 
    if (localStorage.getItem('sc') != null) {
            localStorage.removeItem('AwaitAuthorisation'); 
    }
}


//Communication between iframe
function sendMessageIframe (message) {
    document.getElementById("iframe_register").contentWindow.postMessage(message, '*'); //send to iframe
}

window.addEventListener('message', function(e) { //This called whenever the iframe sends a message
    receiveMessageIframe(e.data);
});

function receiveMessageIframe(message) {
    console.log("Received message from iframe: " + message);
    
    // Go Home (Nav bar)
    if (message.split("#")[0]=="Go home"){
        app.statusCheck();
        app.returnToMainScreen();
    }

    // HH survey complete (hhq.php)
    if (message.split("#")[0]=="HH survey complete"){
        localStorage.setItem('householdSurvey', 'COMPLETE')
        app.statusCheck();
        app.returnToMainScreen();
    }

    // Got date (date.php)
    if (message.split("#")[0]=="Got date"){
        var dateChoice = message.split("#")[1];
        if (dateChoice != '2000-01-01') {         // default, i.e. no date chosen
            localStorage.setItem('dateChoice',dateChoice);
            console.log("Date set to this household " + dateChoice);
        } else {
            localStorage.removeItem('dateChoice'); // will keep checking
        }
        app.statusCheck();
        app.returnToMainScreen();
    }

    if (message.split("#")[0]=="Got Household ID"){
        console.log("Household id : " + message.split("#")[1]);
        if(localStorage.getItem('household_id') != message.split("#")[1]) { //If it is a different ID we must change it
            localStorage.setItem('household_id', message.split("#")[1]); // message example = "Questionnaire complete#10021" where 10021 is the household id
            if (localStorage.getItem('metaID') == null){
                console.log("request next id");
                requestMetaID(linkHousehold); //We need a User ID to be able to link it to the household id
            } else {
                console.log("linking id");
                linkHousehold(); //(in upload.js)
            }
            //app.returnToMainScreen(); //no
        }
    }
    if (message.split("#")[0]=="Changed page"){
        var urlReceived = message.split("#")[1];
        var sc = urlReceived.split("sc=")[1].split("&pg")[0]; //getting the sc=12 value from url
        localStorage.setItem('sc',sc);
        try {
            var urlReceived = message.split("#")[1];
            localStorage.setItem('continue_registration_link', urlReceived);
            var pageNumber = "1"; //use regex
        } catch (err) {
            pageNumber = "none";
        }
        console.log("page number: " + pageNumber);
        if (pageNumber == "pp=0") { //If it is the first page
            sendMessageIframe("Fill address fields#" + localStorage.getItem("address") + "#" + localStorage.getItem("postcode"));
        }
    }
}


function uploadErrorMessages(){ //This sends errors to the SQL database
    var errorsToUploadCopy = localStorage.getItem("errorsToUpload");
    console.log("Uploading the errors!");
    var deviceInfo = device.platform + ", " + device.cordova + ", " + device.model + ", " + device.version +  ", " + device.manufacturer + ", " + device.serial +  ", " + device.uuid;
    var metaID = localStorage.getItem("metaID");
    var errorInfoArray = localStorage.getItem("errorsToUpload").split(";"); //array of {errorMessage,lineNumber}
    if (errorInfoArray[0]== "" || errorInfoArray[0]== "null"){
        errorInfoArray.shift(); //removes fisrt item if it's empty or null
        console.log(errorInfoArray);
    }
    var request;
    request = $.ajax({ //Send request to php
        url: insertError,
        type: "POST",
        data: {errorInfoArray:errorInfoArray, deviceInfo:deviceInfo, metaID:metaID, appVersion:appVersion}, //send array of items
        success: function(response) {
            console.log(response);
            if (response.split("#")[0]=="Success") { //to confirm whether data has been inserted
                console.log("Succesfully uploaded error");
                localStorage.setItem('errorsToUpload', (localStorage.getItem("errorsToUpload")).replace(errorsToUploadCopy,''));
            } else {
                console.log("MySQL connection error" + response);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
            console.log("Check server connection (to php): " + textStatus);
        }
    });
}
