#!/bin/bash

set -o errexit # Exit on error

git stash save 'Before deploy' # Stash all changes before deploy
git checkout -b deploy
git merge development --no-edit # Merge in the master branch without prompting
npm run build # Generate the bundled Javascript and CSS
rm -r client
rm -r server
cp package.json build
cp -r node_modules build
find . -maxdepth 1 -type f -exec rm {} \;
cp -r build/* .
rm -r build
git add -A
git commit -m "Deploy"
git push -f heroku deploy:master # Deploy to Heroku
git checkout development # Checkout master again
git branch -D deploy
git stash pop # And restore the changes
