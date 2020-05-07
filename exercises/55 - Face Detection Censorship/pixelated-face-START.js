console.log('HII!!!!!');

// First, select all elements on the page
// We're goign to access the user's webcam, dump it into the video element
// Then take frames of video and put a square around face on canvas class="video"
// And pixelate face in canvas class="face"
// This could be done on one canvas but this is flexible if you want to use just one image

const video = document.querySelector('.webcam');
const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');
const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');
// Make a new face detector
// FaceDetector is showing up as not defined. Solve by adding window before it
// It's OK to add window to FaceDetector here
// FaceDetector doesn't exist in node.js so window won't cause problems
const faceDetector = new window.FaceDetector();
// console.log(video, canvas, faceCanvas, faceDetector);
const optionsInputs = document.querySelectorAll(
  '.controls input[type="range"]'
);
console.log(optionsInputs);

const options = {
  SIZE: 10, // all caps is common for varaibles that are constant throughout app
  SCALE: 1.35,
};

function handleOption(event) {
  // console.log(event.currentTarget.value);
  // console.log(event.currentTarget.name);
  const { value, name } = event.currentTarget;
  options[name] = parseFloat(value);
}

optionsInputs.forEach(input => input.addEventListener('input', handleOption));

// Write a function to populate the user's video
// This is a special function that returns a Promise
async function populateVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });
  //   console.log(stream);
  //   put MediaStream, stream, in video
  video.srcObject = stream;
  await video.play(); // await allows size of video to be correct
  // size the canvases to be the sames size as the video
  //   console.log(video.videoWidth, video.videoHeight);
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
}
// console.log(populateVideo);

async function detect() {
  // pass detect an image, video or canvas. We pass video
  const faces = await faceDetector.detect(video);
  // console.log(faces);
  faces.forEach(drawFace);
  faces.forEach(censor);
  // ask the browser when the next animation frame is and run detect for us
  requestAnimationFrame(detect); // this is recursive
}

function drawFace(face) {
  // console.log(face);
  const { width, height, top, left } = face.boundingBox;
  // console.log({ width, height, top, left });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffc600';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, width, height);
}

// function censor(face) {
//   const faceDetails = face.boundingBox;
// }
// Same as above using destructuring
function censor({ boundingBox: face }) {
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  // draw the small face
  faceCtx.drawImage(
    // 5 source  (how we pull data out of video)
    video, // where the source comes from
    face.x, // where do we start the source pull from
    face.y,
    face.width,
    face.height,
    // 4 draw args (how we paint it in)
    face.x, // where should we start drawing the x and y?
    face.y,
    options.SIZE,
    options.SIZE
  );

  // draw the small face back on but scaled up
  const width = face.width * options.SCALE;
  const height = face.height * options.SCALE;
  faceCtx.drawImage(
    faceCanvas, // source
    face.x, // where do we start the source pull from?
    face.y,
    options.SIZE,
    options.SIZE,
    // drawing args
    face.x - (width - face.width) / 2,
    face.y - (height - face.height) / 2,
    width,
    height
  );
}

// Call on pageload
populateVideo().then(detect);
