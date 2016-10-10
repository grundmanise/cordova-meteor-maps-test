// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
    id: 'com.lokls.maps-test.ios',
    version: '0.0.1',
    name: 'map-test',
    description: 'App description',
    author: 'SIA Silver Spoon',
    email: 'dima.virtuallight@gmail.com',
    website: 'dmitrysher.club',
});

// App.icons({
//     "iphone_2x": "resources/icons/iphone_2x.png", // 120x120
//     "iphone_3x": "resources/icons/iphone_3x.png", // 180x180
//     "ipad": "resources/icons/ipad.png", // 76x76
//     "ipad_2x": "resources/icons/ipad_2x.png", // 152x152
//     "ipad_pro": "resources/icons/ipad_pro.png", // 167x167
//     "ios_settings": "resources/icons/ios_settings.png", // 29x29
//     "ios_settings_2x": "resources/icons/ios_settings_2x.png", // 58x58
//     "ios_settings_3x": "resources/icons/ios_settings_3x.png", // 87x87
//     "ios_spotlight": "resources/icons/ios_spotlight.png", // 40x40
//     "ios_spotlight_2x": "resources/icons/ios_spotlight_2x.png", // 80x80
// });

// App.launchScreens({
//     // "iphone_2x": "resources/splashes/iphone_2x.png", // 640x490
//     "iphone5": "resources/splashes/iphone5.png", // 640x1136
//     "iphone6": "resources/splashes/iphone6.png", // 750x1334
//     "iphone6p_portrait": "resources/splashes/iphone6p_portrait.png", // 1242x2208
//     "iphone6p_landscape": "resources/splashes/iphone6p_landscape.png", // 2208x1242
// });

// Set Cordova preferences
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'portrait');
App.setPreference('StatusBarOverlaysWebView', true);
App.setPreference('KeyboardDisplayRequiresUserAction', false);
App.setPreference('AutoHideSplashScreen', false);
App.setPreference('ShowSplashScreenSpinner', false);
App.setPreference('AllowInlineMediaPlayback', true);


// Pass preferences for a particular PhoneGap/Cordova plugin
App.configurePlugin('cordova-plugin-googlemaps', {
    "API_KEY_FOR_IOS": "AIzaSyBTeKxFGgd0pbqpjpUaJ1vyTwqix6AmSF0",
    "API_KEY_FOR_ANDROID": "AIzaSyBTeKxFGgd0pbqpjpUaJ1vyTwqix6AmSF0"
});