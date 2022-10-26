import './scripts/socket.io.2.js';

let socket = io("https://0b5f-153-33-85-75.ngrok.io/", {jsonp: false, transports: ['websocket'], upgrade: false});
console.log("Reconnected");
console.log(socket.id);

function sendMsg(data) {
  console.log(data)
  chrome.tabs.query({url: "https://*.leetcode.com/*", currentWindow: true}, function(tabs) {
    console.log(tabs);
    chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
      console.log(response);
    });
  });
}

socket.on("room_info", function(room_info) {
  console.log(room_info)
  sendMsg({type: "room_info", data: room_info});
});

socket.on("message", function(data) {
  console.log(data);
  sendMsg({type: "message", data: data});
});

socket.on("leaderboard", function(data) {
  console.log(data);
  sendMsg({type: "leaderboard", data: data});
});

socket.on("error", function(data) {
  console.log(data);
  sendMsg({type: "message", data: data});
});

socket.on("new_owner", function(data) {
  console.log(data);
  sendMsg({type: "new_owner", data: data});
});

socket.on("start", function(data) {
  console.log(data);
  sendMsg({type: "start", data: data});
});

chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
      console.log(req);
      if ('data' in req) {
        socket.emit(req.type, req.data);
      } else {
        socket.emit(req.type);
      }
      sendResponse({status: 200});
    }
);

let lastMsgTime = Date.now();

// keep-alive
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(msg => {
    lastMsgTime = Date.now();
    console.log(msg);
  })
});

const timeout = 60;

let check = setInterval(() => {
  console.log("Checking")
  if (Date.now() - lastMsgTime >= 1000 * timeout) {
    socket.emit("leave_room");
    clearInterval(check);
  }
}, 1000);