[![Build Status](https://travis-ci.org/freeCodeCamp/meeting-for-good.svg?branch=master)](https://travis-ci.org/freeCodeCamp/meeting-for-good)
[![codebeat badge](https://codebeat.co/assets/svg/badges/A-398b39-669406e9e1b136187b91af587d4092b0160370f271f66a651f444b990c2730e9.svg)](https://codebeat.co/projects/github-com-jrogatis-meeting-for-good-development-70f431f9-1e70-4bab-8318-0d348bab0998)
# Meeting for Good
A meeting coordination app for your team.

## Get Meeting for Good running locally

------------
### Prerequisites
- [NodeJS](https://nodejs.org)
- [MongoDB](https://www.mongodb.org)

------------
### Quick Start Steps:
- Fork the repo to your own account
- Clone it to your computer:
`git clone https://github.com/[your_account_name]/meeting-for-good.git && cd meeting-for-good`
- Run `npm install`
- Create a `.env` file in the root directory of the app with the following contents:
```
MONGO_URI=mongodb://localhost:27017/meeting-for-good
GOOGLE_KEY=[YOUR_GOOGLE_KEY]
GOOGLE_SECRET=[YOUR_GOOGLE_SECRET]
FACEBOOK_KEY=[YOUR_FACEBOOK_KEY]
FACEBOOK_SECRET=[YOUR_FACEBOOK_SECRET]
APP_URL= http://localhost:8080/
NODE_ENV = 'development'
AWS_ACCESS_KEY_ID='your AWS email user'
AWS_SECRET_KEY='your AWS  email pass'
EMAIL_FROM='default email from'
ANALYSE_PACK=false
LINT_CODE=false
GOOGLE_ANALYTICS_ID=[YOUR_GOOGLE_ANALYTICS_ID]
GOOGLE_ANALYTICS_DEBUG=false
OPBEAT_APP_ID=[YOUR_OPBEAT_APP_ID]
OPBEAT_ORGANIZATION_ID=[YOUR_OPBEAT_ORGANIZATION_ID]
OPBEAT_SECRET_TOKEN=[YOUR_OPBEAT_SECRET_TOKEN]
STATS_UPDATE_INTERVAL=[STATS_REFRESH_INTERVAL_IN_SECONDS (defaults to one hour if omitted)]

```
NOTE: The Google Calendar API must be enabled when Google key and secret keys are created.

- Open a new terminal session and run `mongod`
- Run `npm run serve` from the app's root directory. This will start the app at port 8080 (unless overridden)

To build the app instead, run `npm run build`

------------
### Detailed local development installation steps

You'll need to have the latest verison of **Node.js** installed. Either use your OS's package manager or follow the installation instructions on the [official website](http://nodejs.org).

This app uses **MongoDB** as its database engine. Follow [these instructions](https://docs.mongodb.com/manual/installation/#mongodb-community-edition) to install it locally and start the MongoDB server on your machine.

Install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) if it is not already installed. To clone this repository to your local machine, open a command line interface and navigate to the directory where you would like to the food-bank app directory to be in. Then run
`git clone https://github.com/freeCodeCamp/meeting-for-good.git`

Move to the `meeting-for-good` directory and run the `npm install` command to install the application dependencies.

Type `npm run dev` to start the application in development mode. If all goes well, it will be available at `http://localhost:8080`

------------
### Contributing

We welcome pull requests from seasoned Javascript developers. Please read our [guide](CONTRIBUTING.md)  first, then check out our open issues.
