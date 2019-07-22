// Get ?user=XYZ parameter value
const urlParams = new URLSearchParams(window.location.search);
const parameterUsername = urlParams.get('user');
const replyIds = [];
// URL must include ?user=XYZ parameter. If not, redirect to homepage.
if (!parameterUsername) {
  window.location.replace('/');
}

/** Sets the page title based on the URL parameter username. */
function setPageTitle() {
  document.getElementById('page-title').innerText = parameterUsername;
  document.title = parameterUsername + ' - User Page';
}

/**
 * Shows the message form if the user is logged in and viewing their own page.
 */
function showMessageFormIfViewingSelf() {
  fetch('/login-status')
    .then((response) => {
      return response.json();
    })
    .then((loginStatus) => {
      if (loginStatus.isLoggedIn &&
        loginStatus.username == parameterUsername) {
        const messageForm = document.getElementById('message-form');
        messageForm.classList.remove('hidden');
      }
    });
}

/** Fetches messages and add them to the page. */
function fetchMessages() {
  const url = '/messages?user=' + parameterUsername;
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((messages) => {
      const messagesContainer = document.getElementById('message-container');
      if (messages.length == 0) {
        messagesContainer.innerHTML = '<p>This user has no posts yet.</p>';
      } else {
        messagesContainer.innerHTML = '';
      }
      messages.forEach((message) => {
        const messageDiv = buildMessageDiv(message);
        messageDiv.appendChild(buildMessageRepliesDiv(message));
        messagesContainer.appendChild(messageDiv);
      });
      replaceCKEditor();
    });
}

/**
 * Builds an element that displays the message.
 * @param {Message} message
 * @return {Element}
 */
function buildMessageDiv(message, isReply = false) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add("message-div");

  const id = message.id;

  // header elements
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('message-header');

  const usernameDiv = document.createElement('div');
  usernameDiv.classList.add("left-align");
  usernameDiv.appendChild(document.createTextNode(message.user));

  const timeDiv = document.createElement('div');
  timeDiv.classList.add('right-align');
  timeDiv.appendChild(document.createTextNode(new Date(message.timestamp)));

  const classDiv = document.createElement('div');
  classDiv.classList.add("right-align");
  classDiv.appendChild(document.createTextNode(message.className));

  headerDiv.appendChild(usernameDiv);
  headerDiv.appendChild(timeDiv);
  headerDiv.appendChild(classDiv);
  messageDiv.appendChild(headerDiv);

  // body elements
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('message-body');
  bodyDiv.innerHTML = message.text;

  messageDiv.appendChild(bodyDiv);

  // add reply form for non-replies
  if (!isReply) {
    // footer elements
    const footerDiv = document.createElement('div');
    footerDiv.classList.add('message-footer');

    const replyButton = createButton('Reply');
    replyButton.onclick = () => {
      const form = document.getElementById('reply-form' + id);
      if (form.style.display === 'none') {
        form.style.display = 'inline';
      } else {
        form.style.display = 'none';
      }
    };
    footerDiv.appendChild(replyButton);

    const replyForm = document.createElement('form');
    replyForm.id = 'reply-form' + id;
    replyForm.classList.add('message-input');
    replyForm.action = '/message-reply?id=' + id + '&class=' + message.className;
    replyForm.method = 'POST';
    replyForm.style.display = 'none';

    const input = document.createElement('textarea');
    input.classList.add('message-input');
    input.name = 'text';
    input.id = 'reply-input' + id;
    replyIds.push(input.id);
    replyForm.appendChild(input);

    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Submit';

    replyForm.appendChild(submit);
    footerDiv.appendChild(replyForm);
    messageDiv.appendChild(footerDiv);
  }

  return messageDiv;
}

function createButton(text) {
  const button = document.createElement('button');
  button.classList.add('button');
  button.type = 'button';
  button.innerHTML = text;
  return button;
}

function buildMessageRepliesDiv(message) {
  const url = '/message-reply?id=' + message.id;
  const replyContainer = document.createElement('div');
  replyContainer.id = 'reply-container' + message.id;
  fetch(url).then((response) => {
    return response.json();
  }).then((replies) => {
    replies.forEach((reply) => {
      // build reply div and append it to replyContainer
      const replyDiv = buildMessageDiv(reply, isReply = true);
      replyContainer.appendChild(replyDiv);
    });
  });
  return replyContainer;
}

/** Fetches data and populates the UI of the page. */
function buildUI() {
  setPageTitle();
  fetchMessages();
}

function replaceCKEditor() {
  replyIds.forEach(id => {
    ClassicEditor.create(document.getElementById(id), {
      extraPlugins: [MyCustomUploadAdapterPlugin],
    })
      .catch(error => {
        console.log(error);
      });
  });
}