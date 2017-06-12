[![Build Status](https://travis-ci.org/jrogatis/meeting-for-good.svg?branch=master)](https://travis-ci.org/jrogatis/meeting-for-good)
[![codebeat badge](https://codebeat.co/badges/6f1e024c-3e83-4137-b8ae-b34dd088c309)](https://codebeat.co/projects/github-com-jrogatis-meeting-for-good-development-70f431f9-1e70-4bab-8318-0d348bab0998)
# Meeting for Good
A meeting coordination app for your team.

### Get Meeting for Good running locally

*Prerequisites*
- [NodeJS](https://nodejs.org)
- [MongoDB](https://www.mongodb.org)

*Steps*
- Fork the repo to your own account
- Clone it to your computer:
`git clone https://github.com/[your_account_name]/meeting-for-good.git && cd meeting-for-good`
- Run `npm install` or `yarn install`
- Create a `.env` file in the root directory of the app with the following contents:
```
MONGO_URI=mongodb://localhost:27017/meeting-for-good
GOOGLE_KEY=[YOUR_GOOGLE_KEY]
GOOGLE_SECRET=[YOUR_GOOGLE_SECRET]
FACEBOOK_KEY=[YOUR_FACEBOOK_KEY]
FACEBOOK_SECRET=[YOUR_FACEBOOK_SECRET]
APP_URL= http://localhost:8080/
NODE_ENV = 'development'
AWSAccessKeyID='your AWS email user'
AWSSecretKey='your AWS  email pass'
emailFrom='default email from'
ANALYSE_PACK=false
LINT_CODE=false
GoogleAnalyticsID=[YOUR_GOOGLE_ANALYTICS_ID]
GoogleAnalyticsDebug=false
opBeatAppId=[YOUR_OPBEAT_APP_ID]
opBeatOrganizationId=[YOUR_OPBEAT_ORGANIZATION_ID]
opBeatsecretToken=[YOUR_OPBEAT_SECRET_TOKEN]
```
- Open a new terminal session and run `mongod`
- Run `npm run serve` from the app's root directory. This will start the app at port 8080 (unless overridden)

To build the app instead, run `npm run build`
