# Lets Meet
#### A meeting coordination app for your team


## Get LetsMeet running locally

*Prerequisites*
- [NodeJS](https://nodejs.org)
- [MongoDB](https://www.mongodb.org)

The first thing you want to do is fork the repository. Once you have your own copy on your account, then you want to clone that to your local machine.

In your local version's root directory, you're going to need to create a `.env` file with the following information:
```
MONGO_URI=mongodb://localhost:27017/letsmeet
githubID=YOU_GITHIB_CLIENTID
githubSecret=YOUR_GITHUB_SECRET
githubCallbackURL=http://localhost:3000/auth/github/callback
```

Now just open up a terminal to the app's directory and run the following command: `mongod`.
Then in another window, run `node server` and LetsMeet should be running on port `3000`.
