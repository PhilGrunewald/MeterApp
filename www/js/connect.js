var getMetaID = "http://www.energy-use.org/app/getMetaID.php";
var getAddresses = "http://www.energy-use.org/app/getAddresses.php";
var linkHouseholdURL = "http://www.energy-use.org/app/linkHousehold.php";
var insertSurvey = "http://www.energy-use.org/app/insertSurvey.php";
var insertActivity = "http://www.energy-use.org/app/insertActivity.php";

setInterval(connectionManager, 10000); //Begin connecting to server on intervals , in ms (default 10s)

connectionManager(); // initial upload at start of app (in case of brief returns to the app)

function uploadActivity() {
	var itemsToUploadCopy = localStorage.getItem('itemsToUpload');
	var itemsToUploadArray = localStorage.getItem('itemsToUpload').split(';');
	var request;
	request = $.ajax({ //Send request to php
		url: insertActivity,
		type: "POST",
		data: {dataArray:itemsToUploadArray, metaID:localStorage.getItem('metaID')}, //send array of items
		success: function(response) {
			if (response.split("#")[0]=="Success") { //to confirm whether data has been inserted
				console.log("Succesfully uploaded!");
				localStorage.setItem('backedUp', '1'); // 1 = latest data has been uploaded ; This isn't used
	            localStorage.setItem('itemsToUpload', "");
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

function addToUploadList(item) {
	//'itemsToUpload' contains all of the activities/surveys which have not been sent
	if (localStorage.getItem('itemsToUpload') == null || localStorage.getItem('itemsToUpload') == ""){
		localStorage.setItem('itemsToUpload', item);
	} else {
		localStorage.setItem('itemsToUpload', localStorage.getItem('itemsToUpload') + ";" + item);
	}
	localStorage.setItem('backedUp', '0'); // 0 = latest data hasn't been uploaded
	/*if (localStorage.getItem('metaID') == null){
	requestNextID(upload); //so this should only ever happen once unless no connection
} else {
uploadActivity();
//we have a user id so may aswell make sure the ID has been linked
checkHouseholdLinked();
}
*/
}

/*
Normal added activities are sent with actviity key + details
Deleted activities are uploaded with key but empty details and a "DELETED" string
(Edited activites are handled by the above two as they are first deleted then added again as normal under a different key)

Exceptions that are handled: no wifi connection, no connection to php host, php host fails to insert data
*/

function requestNextID(functionToExecuteNext){
	console.log("Requesting the next ID");
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
				console.log("MySQL connection error");
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
			console.log("Check server connection (to php): " + textStatus);
			alert("Please check your internet connection");
		}
	});
}


function requestAddresses(postcode){
	console.log("Requesting Addresses");
	request = $.ajax({
		url: getAddresses,
		type: "POST",
		data: {postcode:postcode},
		success: function(response) {
			if (response.split("#")[0]=="Success") {
				console.log("Got addresses: " + response.split("#")[1]);
				app.populateAddressList((response.split("#<br>")[1]).split("<br>")); //List of addresses
			} else if (response=="0 results") {
				console.log("0 results");
				app.registerNewHousehold("http://energy-use.org");
			} else {
				console.log("MySQL (connection/query) error: " + response);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
			app.personaliseClick();
			console.log("Check server connection (to php): " + textStatus);
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
				app.checkIfRegistered();
			} else {
				localStorage.setItem('householdStatus', "NOTLINKED"); //so we can determine that it has successfully linked
				console.log("MySQL connection error" + response);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { //not using these variables but could be useful for debugging
			console.log("Check server connection (to php): " + textStatus);
			localStorage.setItem('householdStatus', "NOTLINKED"); //so we can determine that it has successfully linked
			//alert("Check internet connectivity");
		}
	});
}

function checkHouseholdLinked() {
	if (localStorage.getItem('householdStatus') == "LINKED" || localStorage.getItem('household_id') == null) {
		//ID has been linked or they haven't comepleted the "personalise" section
	} else {
		//ID hasn't been linked but has been obtained (unlikely scenario where they lost connection just before submitting a household address)
		linkHousehold();
	}
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

function connectionManager() { //gets Meta_ID, uploads activities, uploads survey
	console.log("Connecting again");
	if (localStorage.getItem('metaID') == null){
		requestNextID();
	} else {
		console.log("We have a meta ID");
		if (localStorage.getItem('itemsToUpload') != "" && localStorage.getItem('itemsToUpload') != null) {
			console.log("Uploading Activities");
			uploadActivity(); //Called if there are items to upload
		}
		if (localStorage.getItem('surveyUploaded') != 1 && localStorage.getItem('survey root') == 'survey complete') {
			console.log("Uploading Survey");
			surveyUpload(); //called if survey is complete but has not been uploaded up and we already have an ID
		}
		if(localStorage.getItem('householdStatus') == "NOTLINKED") {
			//This means we have got a hhid but havent linked to it yet
			//Unlikely scenario where they lose connection after having received an HouseholdID and so fail to link
			linkHousehold();
			console.log("Linking household");
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

		var urlReceived = message.split("#")[1]; //error doesn't matter; ignore
		var pageNumber = urlReceived.split("hhq.php?")[1].split("&pn")[0]; //getting the pp=12 value from url
		console.log("page number: "+pageNumber);
		if (pageNumber == "pp=19") { //If it is the last page
			localStorage.setItem('registrationStatus', 'complete');
		} else {
			localStorage.setItem('registrationStatus', 'incomplete');
		}
		localStorage.setItem('continue_registration_link', urlReceived);
		app.checkIfRegistered();
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
	/* Not used anymore
	fn = window[message]; //turns string into a function
	if (typeof fn === "function") fn(); //Executes the function if it is one
	*/
}
