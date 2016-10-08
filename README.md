# cordova-meteor-maps-test
Test repository for integrating Meteor app with native maps

Aim: to create example Meteor project integrating native google map into Meteor app.

Custom markers styles, map styling, and marker clustering. Markers and clusters should be native UIViews. Styles for everything should be loadable from JS side.

Simply speaking, it should be normal, fast, native google maps with all the features that we are used to in JS SDK.

It uses fork of [great plugin](https://github.com/mapsplugin/cordova-plugin-googlemaps).

## Runnning in simulator and device

Beforehand, run `./update_cordova_plugins.sh` to install Cordova plugins from GitHub to local filesystem.

Simply run `npm test` from project directory. Xcode would open your project soon. First time it can take a while -- need to download about 120mb of Google Maps SDK from [sdk repo](https://github.com/dmitry-sher/cordova-plugin-googlemaps-sdk).

The same build you can run on a device. You can get an error in XCode about Bad Access. Check [this SO answer](http://stackoverflow.com/questions/31264537/adding-google-maps-as-subview-crashes-ios-app-with-exc-bad). You need to turn off `GPU frame capture` in both your app and CordovaLib scheme.