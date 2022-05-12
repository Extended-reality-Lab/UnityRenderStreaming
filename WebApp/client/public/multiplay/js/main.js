import { 
  VideoPlayer 
} from "./video-player.js";

import { 
  getServerConfig 
} from "../../js/config.js";

import { registerGamepadEvents, registerKeyboardEvents, registerMouseEvents, sendClickEvent } from "../../js/register-events.js";

setup();

let playButton;
let videoPlayer;
let useWebSocket;

window.document.oncontextmenu = function () {
  return false;     // cancel default menu
};

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  showWarningIfNeeded(res.startupMode);
  showPlayButton();
}

function showWarningIfNeeded(startupMode) {
  const warningDiv = document.getElementById("warning");
  if (startupMode == "private") {
    warningDiv.innerHTML = "<h4>Warning</h4> This sample is not working on Private Mode.";
    warningDiv.hidden = false;
  }
}

function showPlayButton() {
  if (!document.getElementById('playButton')) {
    let elementPlayButton = document.createElement('img');
    elementPlayButton.id = 'playButton';
    elementPlayButton.src = 'multiplay/images/Play.png';
    elementPlayButton.alt = 'Start Streaming';
    playButton = document.getElementById('player').appendChild(elementPlayButton);
    playButton.addEventListener('click', onClickPlayButton);
  }
}

function onClickPlayButton() {
  playButton.style.display = 'none';


  const backdropDiv = document.getElementById('backdrop');
  const playerDiv = document.getElementById('player');

  // add video player
  const elementVideo = document.createElement('video');
  elementVideo.id = 'Video';
  elementVideo.style.touchAction = 'none';
  playerDiv.appendChild(elementVideo);

  //add UI instructions list
  const UIInstructions = document.createElement('img')
  UIInstructions.id = 'UIInstructionsList'
  UIInstructions.src = 'multiplay/images/InstructionPanel1.png'
  UIInstructions.style.display = 'none'
  playerDiv.appendChild(UIInstructions)
  UIInstructions.addEventListener('click', function(){
    UIInstructions.style.display = 'none'
    controlInstructionsButton.style.display = 'none'
    UIInstructionsButton.style.display = 'none'
    backdropDiv.classList.toggle('hidden')
  })

  //add control instructions list
  const controlInstructions = document.createElement('img')
  controlInstructions.style.zIndex = 200;
  controlInstructions.id = 'controlInstructionsList'
  controlInstructions.src = 'multiplay/images/InstructionPanel2.png'
  controlInstructions.style.display = 'none'
  playerDiv.appendChild(controlInstructions)
  controlInstructions.addEventListener('click', function(){
    controlInstructions.style.display = 'none'
    controlInstructionsButton.style.display = 'none'
    UIInstructionsButton.style.display = 'none'
    backdropDiv.classList.toggle('hidden')
  })

  //add help button
  const elementInstructionsButton = document.createElement('img')
  elementInstructionsButton.id = 'instructionsButton'
  elementInstructionsButton.src = 'multiplay/images/questionJava.png'
  playerDiv.appendChild(elementInstructionsButton)
  elementInstructionsButton.addEventListener('click', function(){
    
    if(controlInstructionsButton.style.display == 'none'){
      controlInstructionsButton.style.display = 'block'
      UIInstructionsButton.style.display = 'block'
    }
    else{
      controlInstructionsButton.style.display = 'none'
      UIInstructionsButton.style.display = 'none'
    }
  })

  //add controls instructions button
  const controlInstructionsButton = document.createElement('img')
  controlInstructionsButton.id = 'controlInstructionsButton'
  controlInstructionsButton.src = 'multiplay/images/controlQuestions.png'
  controlInstructionsButton.style.display = 'none'
  playerDiv.appendChild(controlInstructionsButton)
  controlInstructionsButton.addEventListener('click', function(){

    if(controlInstructions.style.display == 'none'){
      controlInstructions.style.display = 'block'
      UIInstructions.style.display = 'none'
      backdropDiv.classList.toggle('hidden')
    }
    else{
      controlInstructions.style.display = 'none'
      backdropDiv.classList.toggle('hidden')
    }
  })

  //add UI instructions button
  const UIInstructionsButton = document.createElement('img')
  UIInstructionsButton.id = 'UIInstructionsButton'
  UIInstructionsButton.src = 'multiplay/images/UIQuestions.png'
  UIInstructionsButton.style.display = 'none'
  playerDiv.appendChild(UIInstructionsButton)
  UIInstructionsButton.addEventListener('click', function(){

    if(UIInstructions.style.display == 'none'){
      UIInstructions.style.display = 'block'
      controlInstructions.style.display = 'none'
      backdropDiv.classList.toggle('hidden')
    }
    else{
      UIInstructions.style.display = 'none'
      backdropDiv.classList.toggle('hidden')
    }
  })


  // add fullscreen button
  const elementFullscreenButton = document.createElement('img');
  elementFullscreenButton.id = 'fullscreenButton';
  elementFullscreenButton.src = 'multiplay/images/FullScreen.png';
  playerDiv.appendChild(elementFullscreenButton);
  elementFullscreenButton.addEventListener("click", function () {
    if (!document.fullscreenElement || !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else {
        if (playerDiv.style.position == "absolute") {
          playerDiv.style.position = "relative";
        } else {
          playerDiv.style.position = "absolute";
        }
      }
    }
  });
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('pointercancel', e => {
    console.log(e);
  });

  function onFullscreenChange() {
    if (document.webkitFullscreenElement || document.fullscreenElement) {
      playerDiv.style.position = "absolute";
      elementFullscreenButton.style.display = 'none';
    }
    else {
      playerDiv.style.position = "relative";
      elementFullscreenButton.style.display = 'block';
    }
  }

  setupVideoPlayer([elementVideo]).then(value => videoPlayer = value);
}

async function setupVideoPlayer(elements) {
  const videoPlayer = new VideoPlayer(elements);
  await videoPlayer.setupConnection(useWebSocket);

  window.addEventListener('resize', updateVideoSize, true);
  //document.addEventListener('webkitfullscreenchange', updateVideoSize, true);
  //document.addEventListener('fullscreenchange', updateVideoSize, true);

  function updateVideoSize() {
    videoPlayer.resizeVideo();
  }

  window.addEventListener('beforeunload', async () => {
    await videoPlayer.stop();
  }, true);

  elements[0].addEventListener('pointerdown', e => {
    if (e.pointerType == "mouse" && e.button == 2) {
      elements[0].requestPointerLock = elements[0].requestPointerLock || elements[0].mozRequestPointerLock;
      elements[0].requestPointerLock();
    }
  })

  elements[0].addEventListener('pointerup', e => {
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    document.exitPointerLock();
  })

  videoPlayer.ondisconnect = onDisconnect;

  return videoPlayer;
}

function onDisconnect() {
  const playerDiv = document.getElementById('player');
  clearChildren(playerDiv);
  videoPlayer = null;
  showPlayButton();
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
