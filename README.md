# Cobalt - A Bitcoin & Lightning Wallet

[![GitHub tag](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/CobaltApp/Cobalt/master/package.json&query=$.version&label=Version)](https://github.com/CobaltApp/Cobalt)
![](https://img.shields.io/github/license/CobaltApp/Cobalt)

Thin Bitcoin wallet built with React Native and Electrum.

## 🌟 Features

* Private Keys never leave your device
* Lightning Network Support
* SegWit Wallets
* Encryption
* Custom Fee Support
* Plausible Deniability
* And many more [features...](https://cobalt-pay.com/features)

## 🧑‍💻 Developing

Please refer to the engines field in package.json file for the minimum required versions of Node and npm. It is preferred that you use an even-numbered version of Node as these are LTS versions.

To view the version of Node and npm in your environment, run the following in your console:

```
node --version && npm --version
```

* In your console:

```
git clone https://github.com/CobaltApp/Cobalt.git
cd CobaltApp
npm install
```

Please make sure that your console is running the most stable versions of npm and node (even-numbered versions).

* To run on Android:

You will now need to either connect an Android device to your computer or run an emulated Android device using AVD Manager which comes shipped with Android Studio. To run an emulator using AVD Manager:

1. Download and run Android Studio
2. Click on "Open an existing Android Studio Project"
3. Open `build.gradle` file under `Cobalt/android/` folder
4. Android Studio will take some time to set things up. Once everything is set up, go to `Tools` -> `AVD Manager`.
    * 📝 This option [may take some time to appear in the menu](https://stackoverflow.com/questions/47173708/why-avd-manager-options-are-not-showing-in-android-studio) if you're opening the project in a freshly-installed version of Android Studio.
5. Click on "Create Virtual Device..." and go through the steps to create a virtual device
6. Launch your newly created virtual device by clicking the `Play` button under `Actions` column

Once you connected an Android device or launched an emulator, run this:

```
npx react-native run-android
```

The above command will build the app and install it. Once you launch the app it will take some time for all of the dependencies to load. Once everything loads up, you should have the built app running.

* To run on iOS:

```
npx pod-install
npm start
```

In another terminal window within the Cobalt folder:
```
npx react-native run-ios
```

* To run on macOS using Mac Catalyst:

```
npm run maccatalystpatches
```

Once the patches are applied, open Xcode and select "My Mac" as destination.

### Testing

```bash
npm run test
```

## 🤝 Community

Our community is the 💙 of the project. To chat with other community members in real-time, join our [Telegram channel](https://t.me/cobaltapp).

## 📜 License

Cobalt Pay software is provided under the [MIT License](https://github.com/CobaltApp/CobaltPay/blob/master/LICENSE).

## ❓ FAQ

Report a bug [here](https://github.com/CobaltApp/CobaltPay/issues/new/choose)
Builds automated and tested with [BrowserStack](https://www.browserstack.com)
Bugs reported via [BugSnag](https://www.bugsnag.com)
If you'd like to support the project, please visit the [donation page](https://cobalt-pay.com/donate/).
