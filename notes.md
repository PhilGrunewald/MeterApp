Upload to Google Play
=====================

Play console:
https://play.google.com/apps/publish/

Click "aMeter"
Left: select "Release Management" > App releases



Build
-----

Key generation
- see pw file under aMeter App



In Cordova Project
(~/Sites/uk.joymeter.Activities)
cordova build android --release -- --keystore=aMeterAndroid.keystore --storePassword='XXX' --alias=aMeterKey --password='XXX'


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


