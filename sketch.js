let masterVolume = -9; // in decibel.

let ready = false;

let wave; // this object allows us to draw waveforms
let synth;
let synthBass;
let loop;
let scale;
let prevNote;
let prevNotes = ['x', 'x'];

let mixer;
// Create a new canvas to match the browser size
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  Tone.Master.volume.value = masterVolume;
  
  mixer = new Tone.Gain();
  // mixer.toDestination();

  let reverb = new Tone.Reverb({
    wet: 0.5,
    decay: 10,
  });
  mixer.connect(reverb);
  reverb.toDestination();

  // scale = Tonal.Scale.get("A3 locrian").notes;
  scale = ["Eb3", "F3", "Ab3", "Bb3", "C3", "Eb2", "F2", "Ab2", "Bb2", "C2"];
  // scale = ["Eb3", "F3", "Ab3", "Bb3", "C2"];
  // scale = Tonal.Scale.scaleChords("pentatonic");
  // scale = ["Eb3", "Bb3"];
  scaleBass = Tonal.Scale.get("A2 locrian").notes;
}

function initializeAudio() {
  synth = new Tone.Synth(); // metalsynth see synths doc
  // synth.oscillator.type = 'sine';
  synth.toDestination();

  synthBass = new Tone.MetalSynth(); // metalsynth see synths doc
  // synth.oscillator.type = 'sine';
  synthBass.toDestination();

  loop = new Tone.Loop(time => {
    // let note = random(scale);
    let n = noise(frameCount * 0.1);
    let i = floor(map(n, 0, 1, 0, scale.length));

    let note = scale[i];

    // let nB = noise(frameCount * 0.2);
    // let iB = floor(map(nB, 0, 1, 0, scaleBass.length));
    // let bassNote = scaleBass[iB];
    if (prevNotes[0] == note && prevNotes[1] == note) {
      // return;
      synth.triggerAttackRelease('c4', "16n", time);
    } else {
      synth.triggerAttackRelease(note, "8n", time);
    }
    // (freq, noteDuration, time=now)
    // synth.triggerAttackRelease(bassNote, "16n", time);
    prevNotes = [prevNote, note];
    prevNote = note;
  }, "16n");
  loop.start();

  wave = new Tone.Waveform();
  Tone.Master.connect(wave);

  Tone.Transport.start();
}

// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Main render loop
function draw() {
  background(0);

  if (ready) {
    drawWaveform(wave);
  } else {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text("CLICK TO START", width / 2, height / 2);
  }
}

function drawWaveform(wave, w = width, h = height) {
  stroke(255);
  let buffer = wave.getValue(0);

  // look a trigger point where the samples are going from
  // negative to positive
  let start = 0;
  for (let i = 1; i < buffer.length; i++) {
    if (buffer[i - 1] < 0 && buffer[i] >= 0) {
      start = i;
      break; // interrupts a for loop
    }
  }

  // calculate a new end point such that we always
  // draw the same number of samples in each frame
  let end = start + buffer.length / 2;

  // drawing the waveform
  for (let i = start; i < end; i++) {
    let x1 = map(i - 1, start, end, 0, w);
    let y1 = map(buffer[i - 1], -1, 1, 0, h);
    let x2 = map(i, start, end, 0, w);
    let y2 = map(buffer[i], -1, 1, 0, h);
    line(x1, y1, x2, y2);
  }
}

function mousePressed() {
  if (!ready) {
    ready = true;
    initializeAudio();
  } else {
    ready = false;
    Tone.Transport.stop();
  }

  synth.triggerAttackRelease(220, "8n");
}
