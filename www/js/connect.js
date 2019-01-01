var getMetaID = meterURL +  "getMetaID.php";
var getAddresses =  meterURL +  "getAddresses.php";
var checkForHouseID = meterURL +  "checkAddress.php";
var linkHouseholdURL = meterURL +  "linkHousehold.php";
var insertSurvey = meterURL +  "insertSurvey.php";
var insertActivity = meterURL +  "insertActivity.php";
var insertError = meterURL +  "insertError.php";
var insertContactDetails = meterURL + "insertContactDetails.php";


setInterval(connectionManager, 10000); //Begin connecting to server on intervals , in ms (default 10s)

window.onerror = function(message, source, lineNumber) {
	//This doesn't trigger on every error (unreliable)
	message = message.replace(/[-'"+()]/g, ""); //Removing characters which could confuse php and split()
	var errorInfo = message + "#" + lineNumber;
	localStorage.setItem("errorsToUpload", localStorage.getItem('errorsToUpload') + ";" + errorInfo);
	//Then connection manager uses this value to upload to server
	return false; //true would catch the error
};


function uploadActivities() {
	var activitiesToUploadCopy = localStorage.getItem('activitiesToUpload');
	var activitiesToUploadArray = localStorage.getItem('activitiesToUpload').split(';');
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
				localStorage.setItem('activitiesToUpload', (localStorage.getItem("activitiesToUpload")).replace(activitiesToUploadCopy,''));
				//This removes the sent items from the current list (incase they add an activity whilst it's being sent)
			} else {
				console.log("MySQL connection error" + response);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
			console.log("Check server connection (to php): " + textStatus);
			//alert("Check internet connectivity");
		}
	});
}

/* Now handled in index.js
function addToUploadList(item) {
//'activitiesToUpload' contains all of the activities/surveys which have not been sent
}
*/

/*
Normal added activities are sent with actviity key + details
Deleted activities are uploaded with key but empty details and a "DELETED" string
(Edited activites are handled by the above two as they are first deleted then added again as normal under a different key)

Exceptions that are handled: no wifi connection, no connection to php host, php host fails to insert data
*/

function requestNextID(functionToExecuteNext){
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
				//functionToExecuteNext(); //upload or linkHousehold //ignore error; maybe remove this
			} else {
				console.log("MySQL connection error" + response);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
			console.log("Check server connection (to php): " + textStatus);
			if (localStorage.getItem("consent")==null) {
			}/* else { //Dont want to alert if they are still on consent screen
				alert("Please check your internet connection");
			}*/
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
			    localStorage.removeItem('householdStatus'); // tells connection manager that linking needs to be done
			    // localStorage.setItem('householdStatus', "NOTLINKED"); // tells connection manager that linking needs to be done
				app.returnToMainScreen();
                // XXX Message that you are already registered. [Request to update HH data > we email you]
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

function linkHousehold() {
	var request;
	request = $.ajax({ //Send request to php
		url: linkHouseholdURL,
		type: "POST",
		data: {household_id:localStorage.getItem('household_id'), metaID:localStorage.getItem('metaID')}, //send array of items
		success: function(response) {
			if (response.split("#")[0]=="Success") { //to confirm whether data has been inserted
				console.log("Succesfully uploaded!");
				console.log(response);
				localStorage.setItem('householdStatus', "LINKED"); //so we can determine that it has successfully linked
				app.statusCheck();
			} else {
			    localStorage.removeItem('householdStatus'); // tells connection manager that linking needs to be done
				// localStorage.setItem('householdStatus', "NOTLINKED"); //so we can determine that it has successfully linked
				console.log("MySQL connection error" + response);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
			console.log("Check server connection (to php): " + textStatus);
			localStorage.removeItem('householdStatus'); // tells connection manager that linking needs to be done
			// localStorage.setItem('householdStatus', "NOTLINKED"); //so we can determine that it has successfully linked
			//alert("Check internet connectivity");
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
			//alert("Check internet connectivity");
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

function connectionManager() {
	//
	// called from timer
	// gets Meta_ID, uploads activities, uploads survey
	//
	if (localStorage.getItem('metaID') == null){
		console.log("no meta");
		requestNextID();
	} else {
		console.log("meta: " + localStorage.getItem('metaID'));
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
			linkHousehold();
			console.log("Linking household");
		} else if (localStorage.getItem('dateChoice') == "" || localStorage.getItem('dateChoice') == null ) {
			//Request dates from server
        // Have a date...
		} 
        if (localStorage.getItem("errorsToUpload")!=null && localStorage.getItem("errorsToUpload")!="") {
			//If there is at least one error to upload
			// uploadErrorMessages();
		}
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
	if (message.split("#")[0]=="Return to app"){
		app.returnToMainScreen();
		var urlReceived = message.split("#")[1];
		localStorage.setItem('continue_registration_link', urlReceived);
		app.statusCheck();
		// localStorage.setItem('registrationStatus', 'incomplete');
		//Can ignore error below
		try {
			var pageNumber = urlReceived.split("hhq.php?pp=")[1].split("&pn")[0]; //getting the pp=12 value from url
			var sc = urlReceived.split("sc=")[1].split("&address1")[0]; //getting the sc=12 value from url
			localStorage.setItem('sc',sc);
		} catch (err) {
			var pageNumber = "none";
		}
		console.log("page number: " + pageNumber);
		if (pageNumber >= 17) { //If it is the last page
			localStorage.setItem('registrationStatus', 'complete');
		}
		app.statusCheck();
	}

	if (message.split("#")[0]=="Got date"){
		app.returnToMainScreen();
		var dateChoice = message.split("#")[1];
		if (dateChoice == '2000-01-01') {         // default, i.e. no date chosen
			dateChoice = null;
		}
		localStorage.setItem('dateChoice',dateChoice);
		app.statusCheck();
	}

	if (message.split("#")[0]=="Got Household ID"){
		console.log("Household id : " + message.split("#")[1]);
		if(localStorage.getItem('household_id') != message.split("#")[1]) { //If it is a different ID we must change it
			localStorage.setItem('household_id', message.split("#")[1]); // message example = "Questionnaire complete#10021" where 10021 is the household id
			if (localStorage.getItem('metaID') == null){
				console.log("request next id");
				requestNextID(linkHousehold); //We need a User ID to be able to link it to the household id
			} else {
				console.log("linking id");
				linkHousehold(); //(in upload.js)
			}
			//app.returnToMainScreen(); //no
		}
	}
	if (message.split("#")[0]=="Changed page"){
		var urlReceived = message.split("#")[1];
		try {
			var urlReceived = message.split("#")[1];
			localStorage.setItem('continue_registration_link', urlReceived);
			var pageNumber = "1"; //use regex
			//var pageNumber = urlReceived.split("hhq.php?")[1].split("&pn")[0]; //getting the pp=12 value from url
		} catch (err) {
			pageNumber = "none";
		}
		console.log("page number: " + pageNumber);
		if (pageNumber == "pp=0") { //If it is the first page
			sendMessageIframe("Fill address fields#" + localStorage.getItem("address") + "#" + localStorage.getItem("postcode"));
		}
	}
	/* Not used anymore
	fn = window[message]; //turns string into a function
	if (typeof fn === "function") fn(); //Executes the function if it is one
	*/
}

/* //Useful for testing whether the error uploading works
setInterval(makeError, 3000); //Begin connecting to server on intervals , in ms (default 10s)
function makeError () {
console.log("Making error");
if (localStorage.getm("error") == 10) {
console.log("nope");
}
}*/

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
