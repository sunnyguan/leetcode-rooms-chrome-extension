function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}


function waitForElmChange(selector, val) {
  return new Promise(resolve => {
    if (document.querySelector(selector) && document.querySelector(selector).getAttribute('href') !== val) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector) && document.querySelector(selector).getAttribute('href') !== val) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

function createRoom() {
  chrome.runtime.sendMessage({type: "create_room", data: {name: username}}, function(response) {
    console.log(response);
  });
}

function joinRoom() {
  const room = document.querySelector("#join-room-id").value;
  console.log("Trying to join room", room);
  chrome.runtime.sendMessage({type: "join_room", data: {room_id: room, name: username}}, function(response) {
    console.log(response);
  });
}

function leaveRoom() {
  console.log("Leaving current room");
  chrome.runtime.sendMessage({type: "leave_room"}, function(response) {
    console.log(response);
  });
}

function sendMsg() {
  let msg = document.querySelector("#chatbox").value;
  chrome.runtime.sendMessage({type: "message", data: {message: msg}}, function(response) {
    console.log(response);
  });
}

function inputEnterMsg(e) {
  if (e.key == "Enter") {
    sendMsg();
    document.querySelector("#chatbox").value = "";
  }
}

const chatStyle = 'background-color: lightblue;padding: 10px;border-radius: 0.75rem; clear: both; float: left;';

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === "players") {
        console.log("Room size", request.data);
        // document.querySelector("#join-room").style.display = 'none';
        document.querySelector('#room-size').textContent = "Room size: " + request.data;
      } else if (request.type === "room_num") {
        console.log("Room number", request.data);
        document.querySelector('#room-id').textContent = "Room id: " + request.data;
      } else if (request.type === "questions") {
        console.log("LC Questions", request.data);
        let questions = "<p>List of questions:</p>";
        let currentQuestionExists = false;
        for (let question of request.data) {
          questions += "<p>" + question + "</p>"
          if (question.replace('www.', '') === window.location.href)
            currentQuestionExists = true;
        }
        document.querySelector('#questions').innerHTML = questions;

        if (!currentQuestionExists) {
          console.log("about to redirect");
          console.log(request.data);
          console.log(window.location.href);
          window.location.href = request.data[0];
        }
      } else if (request.type === "message") {
        let user = request.data.user;
        let message = request.data.message;
        let type = request.data.type;
        let newChat;
        if (type === "submission") {
          newChat = createElementFromHTML(`<p style='${chatStyle}'><b>Submission</b>: ${message} </p>`);
        } else {
          newChat = createElementFromHTML(`<p style='${chatStyle}'>${user}: ${message} </p>`)
        }
        document.querySelector("#chats").appendChild(newChat);
      } else if (request.type === "chatlog") {
        for (const chat of request.data) {
          let newChat = createElementFromHTML(`<p style='${chatStyle}'>${chat.user}: ${chat.message}</p>`);
          document.querySelector("#chats").appendChild(newChat);
        }
      }
    }
);

const sidebar = `
<div style="display: flex;flex-direction: column;">
    <div style="
    background: #fafafa;
    padding: 10px;
">Rooms</div>
    <div style="
    padding: 10px;
    display: flex;
    flex-direction: column;
    height: fit-content;
    flex-grow: 1;
"><div style="
    padding: 10px;
">
<div style="display: flex;margin-bottom: 10px;"><span>Status: </span><div id="room-id" style="margin: auto 10px auto 10px">
  Not in room yet
</div></div>
<div id="room-size" style="">
</div>
<div id="questions">
</div>
<div style="display: flex">
  <input type="text" id="join-room-id">
  <button id="join-room" class="btn__1z2C btn-sm__2msL" data-no-border="true" icon="information">
          Join Room
  </button>
</div><button id="create-room" class="btn__1z2C btn-sm__2msL" data-no-border="true" icon="information" style="
    width: 100%;
">
        Create Room
</button></div>
<div style="
    flex-grow: 1;
    padding: 10px;
    background: #eeeeee;
    display: flex;
    flex-direction: column;
"><div id="chats" style="
    flex-grow: 1;
    height: 0;
    overflow-y: scroll;
">
</div><div style="
    display: flex;
"><input type="text" id="chatbox" style="
    flex-grow: 1;
"><div id="sendMsg" style="
    margin-left: 10px;
">Send</div></div>
</div>
<div style="display: flex;">
  <button id="leave-room" class="btn__1z2C btn-sm__2msL" data-no-border="true" icon="information" style="
    flex-grow: 1;
">
          Leave Room
  </button>
</div>
    </div>
</div>`

let username = "user" + Math.round(Math.random() * 100);

waitForElm('.btns__1OeZ').then((res) => {myMain(res)});

function myMain (e) {
  const parent = document.querySelector(".container__14Na");
  const side = createElementFromHTML(sidebar);
  side.querySelector("#create-room").addEventListener('click', createRoom);
  side.querySelector("#join-room").addEventListener('click', joinRoom);
  side.querySelector("#leave-room").addEventListener('click', leaveRoom);
  parent.appendChild(side);

  document.querySelector("#sendMsg").addEventListener('click', sendMsg);
  document.querySelector("#chatbox").addEventListener('keypress', inputEnterMsg);

  // window.onbeforeunload = function(e) {
  //   leaveRoom();
  // }

  // username = document.querySelector(".user-name__35Mk").textContent;

  // retrieve current room info
  chrome.runtime.sendMessage({type: "retrieve_room_info"}, function(response) {
    console.log(response);
  });
}

waitForElm(".detail__1Ye5").then((res) => {submitted(res)});

function submitted(e) {
  var href = document.querySelector(".detail__1Ye5").getAttribute('href');
  var check = href + "check";
  fetch(check).then(res => res.json()).then(data => {
    console.log(data);
    chrome.runtime.sendMessage({type: "submission", data: data}, function(response) {
      console.log(response);
    });
  })
  waitForElmChange(".detail__1Ye5", href).then(res => {submitted(res)});
}