# Lets Meet
A meeting coordination app for your team.

### Get LetsMeet running locally

*Prerequisites*
- [NodeJS](https://nodejs.org)
- [MongoDB](https://www.mongodb.org)

*Steps*
- Fork the repo to your own account
- Clone it to your computer:
`git clone https://github.com/[your_account_name]/letsmeet.git && cd letsmeet`
- Run `npm install` or `yarn install`
- Create a `.env` file in the root directory of the app with the following contents:
```
MONGO_URI=mongodb://localhost:27017/letsmeet
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
```
- Open a new terminal session and run `mongod`
- Run `npm run serve` from the app's root directory. This will start the app at port 8080 (unless overridden)

To build the app instead, run `npm run build`
