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
- Run `npm install`
- Create a `.env` file in the root directory of the app with the following contents:
```
MONGO_URI=mongodb://localhost:27017/letsmeet
GITHUB_KEY=[YOUR_GITHUB_KEY]
GITHUB_SECRET=[YOUR_GITHUB_SECRET]
APP_URL= http://localhost:8080/
seedDB=true
```
- Open a new terminal session and run `mongod`
- Run `npm run serve` from the app's root directory. This will start the app at port 8080 (unless overridden)

To build the app instead, run `npm run build`
