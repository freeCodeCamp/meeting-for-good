'use strict';

(function iife() {
  const profileId = document.querySelector('#profile-id') || null;
  const profileUsername = document.querySelector('#profile-username') || null;
  const profileRepos = document.querySelector('#profile-repos') || null;
  const displayName = document.querySelector('#display-name');
  const apiUrl = `${appUrl}/api/:id`;

  const updateHtmlElement = (data, element, userProperty) => element.innerHTML = data[userProperty];

  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, data => {
    const userObject = JSON.parse(data);

    if (userObject.displayName !== null) {
      updateHtmlElement(userObject, displayName, 'displayName');
    } else {
      updateHtmlElement(userObject, displayName, 'username');
    }

    if (profileId !== null) {
      updateHtmlElement(userObject, profileId, 'id');
    }

    if (profileUsername !== null) {
      updateHtmlElement(userObject, profileUsername, 'username');
    }

    if (profileRepos !== null) {
      updateHtmlElement(userObject, profileRepos, 'publicRepos');
    }
  }));
}());
