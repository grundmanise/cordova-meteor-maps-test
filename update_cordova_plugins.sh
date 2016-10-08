#!/bin/bash

cd ..
mkdir -p cordova_plugins
cd cordova_plugins
rm -rf *

# webapp (xcode 8)
git clone https://github.com/meteor/cordova-plugin-meteor-webapp.git
cd cordova-plugin-meteor-webapp
git reset --hard 8bf95eed3f313299fc2de33658866278eea2cdc5

# cordova native maps plugin --  using last master
cd ..
git clone https://github.com/dmitry-sher/cordova-plugin-googlemaps.git
cd cordova-plugin-googlemaps
# git reset --hard 8bf95eed3f313299fc2de33658866278eea2cdc5