const urlParams = new URLSearchParams(window.location.search);
const parameterClassname = urlParams.get('class');
const replyIds = [];
// URL must include ?class=XYZ parameter. If not, redirect to homepage.
if (!parameterClassname) {
  window.location.replace('/');
}

function fetchMessages() {
  const url = '/feed?class=' + parameterClassname;
  fetch(url).then((response) => {
    return response.json();
  }).then((messages) => {
    const messageContainer = document.getElementById('message-container');
    if (messages.length == 0) {
      messageContainer.innerHTML = '<p>There are no posts yet.</p>';
    }
    else {
      messageContainer.innerHTML = '';
    }
    messages.forEach((message) => {
      const messageDiv = buildMessageDiv(message);
      messageDiv.appendChild(buildMessageRepliesDiv(message));
      messageContainer.appendChild(messageDiv);
    });
    replaceCKEditor();
  });
}

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

  headerDiv.appendChild(usernameDiv);
  headerDiv.appendChild(timeDiv);
  messageDiv.appendChild(headerDiv);

  // body elements
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('message-body');
  bodyDiv.innerHTML = message.text;

  messageDiv.appendChild(bodyDiv);

  // footer elements
  const footerDiv = document.createElement('div');
  footerDiv.classList.add('message-footer');

  const likeButton = createButton('Like');
  likeButton.onclick = () => {
    alert('This doesn\'t do anything yet :(');
  }

  footerDiv.appendChild(likeButton);

  // add reply form for non-replies
  if (!isReply) {

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
    replyForm.action = '/message-reply?id=' + id + '&class=' + parameterClassname;
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
  }
  messageDiv.appendChild(footerDiv);
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

// sets the action field of the form to /messages + class name parameter, then show form
function setMessageFormAction() {
  const form = document.getElementById('message-form');
  form.action = '/messages?class=' + parameterClassname;
  form.classList.remove('hidden');
}

// Fetch data and populate the UI of the page.
function buildUI() {
  setMessageFormAction();
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