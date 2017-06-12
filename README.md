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
AWS_ACCESS_KEY_ID='your AWS email user'
AWS_SECRET_KEY='your AWS  email pass'
EMAIL_FROM='default email from'
ANALYSE_PACK=false
LINT_CODE=false
GOOGLE_ANALYTICS_ID=[YOUR_GOOGLE_ANALYTICS_ID]
GOOGLE_ANALYTICS_DEBUG=false
OP_BEAT_APP_ID=[YOUR_OPBEAT_APP_ID]
OP_BEAT_ORGANIZATION_ID=[YOUR_OPBEAT_ORGANIZATION_ID]
OP_BEAT_SECRET_TOKEN=[YOUR_OPBEAT_SECRET_TOKEN]
```
- Open a new terminal session and run `mongod`
- Run `npm run serve` from the app's root directory. This will start the app at port 8080 (unless overridden)

To build the app instead, run `npm run build`
