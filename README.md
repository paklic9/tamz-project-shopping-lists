# Shopping lists

This app stores shopping lists and was created by student Vojtěch Zámečník in the subject TAMZ 1 (Creating applications for mobile devices) in the second year of studies.

This app can be also downloaded as apk and installed on android devices. You can find apk file in `/android/apk/shopping_lists.apk`

You can find demo at this url: https://shoppinglists.netlify.app/

## Pre requirements

#### - node.js
#### - yarn
#### - serve in your yarn (if you want to run production build)

To add `serve` to your yarn installation: `yarn global add serve` <br />

## Available commands

In the project directory, you can run:

### `yarn install`

Installs the necessary dependencies (node_modules), then you can use commands bellow.

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

### `serve -s build`

Runs the app in the production version from `build` folder.