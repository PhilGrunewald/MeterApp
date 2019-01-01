Upload to Google Play
=====================


Build
-----

Key generation
- see pw file under aMeter App for details
keytool -genkey -v -keystore aMeterAndroid.keystore -alias aMeterKey -keyalg RSA -keysize 2048 -validity 10000

In Cordova Project
(~/Sites/uk.joymeter.Activities)
cordova build android --release -- --keystore=aMeterAndroid.keystore --storePassword='XXX' --alias=aMeterKey --password='XXX'

Rename the file from 
/Users/phil/Sites/uk.joymeter.Activities/platforms/android/app/build/outputs/apk/release/app-release.apk
to
uk.joymeter.Activities.apk

Upload
------

Play console:
https://play.google.com/apps/publish/

Click "aMeter"
Left: select "Release Management" > App releases




Cordova issues
==============

To fix issues with ios the environment was re-created from scratch
- remove cordova (local and global)
- create copy of project directory (with only the core files)
- install cordova -g
- add plugins in project directory
- add platforms

on 
cordova platform add ios
    Plugin doesn't support this project's cordova-ios version. cordova-ios: 4.5.5, failed version requirement: <4.5.0
    Skipping 'cordova-plugin-console' for ios

cordova platform add android
    Installing "cordova-plugin-local-notification" for android
    Plugin doesn't support this project's android-sdk version. android-sdk: 25.0.0, failed version requirement: >=26
    Skipping 'cordova-plugin-local-notification' for android




Sign up steps (31 Dec 2018)
===========================

Manual configuration
--------------------

- Navigate to "Now" > "Home" > "Customise"
- enter new HH id in format: h12345
- assigns household_id = 12345
- deletes the current metaID to generate a new one (with WiFi)       index.js: submitOther()
- links new HH to MetaID in Meta table                               connect.js: requestNextID()

