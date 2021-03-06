/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Adds a login or logout link to the page, depending on whether the user is
 * already logged in.
 */
function setupNavigation() {
  const div = document.createElement('div');
  const nav = document.createElement('nav');
  const navigationElement = document.createElement('ul');

  div.setAttribute('class', 'w3-bar w3-black w3-card');
  navigationElement.appendChild(createLink('/', 'HOME'));
  navigationElement.appendChild(createLink('/aboutus.html', 'ABOUT US'));
  navigationElement.appendChild(createLink('/classes.html', 'CLASS LIST'));

  fetch('/login-status')
      .then((response) => {
        return response.json();
      })
      .then((loginStatus) => {
        if (loginStatus.isLoggedIn) {
          navigationElement.appendChild(createLink(
              '/user-page.html?user=' + loginStatus.username, 'Your Page'));

          navigationElement.appendChild(
              createLink('/logout', 'Logout'));
        } else {
          navigationElement.appendChild(
              createLink('/login', 'Login'));
        }
      });
  nav.appendChild(navigationElement);
  div.appendChild(nav);
  document.getElementById('navigation').appendChild(div);
}

/**
 * Creates an li element.
 * @param {Element} childElement
 * @return {Element} li element
 */
function createListItem(childElement) {
  const listItemElement = document.createElement('li');
  listItemElement.appendChild(childElement);
  return listItemElement;
}

/**
 * Creates an anchor element.
 * @param {string} url
 * @param {string} text
 * @return {Element} Anchor element
 */
function createLink(url, text) {
  const linkElement = document.createElement('a');
  linkElement.appendChild(document.createTextNode(text));
  linkElement.setAttribute('class','w3-bar-item w3-button w3-padding-large w3-hide-small');
  linkElement.href = url;
  return linkElement;
}
