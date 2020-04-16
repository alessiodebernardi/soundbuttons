function AudioProcessorModule() {

   var audioCtx;
   var delayNode;
   var gainNode;
   var waveShaperNode;
   var analyserNode;
   var analyserCanvasCtx;
   var analyserCanvas;
   var analyserDataArray;
   var analyserBufferLength;
   var audioSources = [];
   var playindSource = undefined;
   var audioObj = [];
   var playindAudio = undefined;

   this.init = init;
   this.initAnalyzer = initAnalyzer;
   this.fetchAudio = fetchAudio;
   this.playAudio = playAudio;
   this.stopAudio = stopAudio;
   this.rateUp = rateUp;
   this.rateDown = rateDown;
   this.delayUp = delayUp;
   this.delayDown = delayDown;
   this.pitchUp = pitchUp;
   this.pitchDown = pitchDown;
   this.isPitchEIEnabled = isPitchEIEnabled;
   this.enablePitchEI = enablePitchEI;
   this.disablePitchEI = disablePitchEI;
   this.isPitchEDEnabled = isPitchEDEnabled;
   this.enablePitchED = enablePitchED;
   this.disablePitchED = disablePitchED;
   this.isDistortionEnabled = isDistortionEnabled;
   this.enableDistortion = enableDistortion;
   this.disableDistortion = disableDistortion;
   this.resetOptions = resetOptions;
   this.advancedModeDetect = advancedModeDetect;

   function init() {
      initAudioContext();
   }

   function initAudioContext() {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      delayNode = audioCtx.createDelay();
      delayNode.delayTime.value = audioProcessorOptions["delay"]["default"];
      gainNode = audioCtx.createGain();
      waveShaperNode = audioCtx.createWaveShaper();
      if (audioProcessorOptions["distortion"]["default"])
         enableDistortion();
      else
         disableDistortion();
      waveShaperNode.connect(audioCtx.destination);
      delayNode.connect(audioCtx.destination);
      gainNode.connect(audioCtx.destination);
   }

   function initAnalyzer(canvasId) {
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserBufferLength = analyserNode.frequencyBinCount;
      analyserDataArray = new Uint8Array(analyserBufferLength);
      analyserNode.getByteTimeDomainData(analyserDataArray);
      analyserCanvas = document.getElementById(canvasId);
      analyserCanvasCtx = analyserCanvas.getContext("2d");
      analyserCanvasCtx.clearRect(0, 0, analyserCanvas.width, analyserCanvas.height);
      drawAnalyzer();
   }

   function drawAnalyzer() {
      let WIDTH = analyserCanvas.width;
      let HEIGHT = analyserCanvas.height;
      drawVisual = requestAnimationFrame(drawAnalyzer);
      analyserNode.getByteFrequencyData(analyserDataArray);
      analyserCanvasCtx.fillStyle = '#5d5d5d';
      analyserCanvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
      var barWidth = (WIDTH / analyserBufferLength) * 2.5;
      var barHeight;
      var x = 0;
      for (var i = 0; i < analyserBufferLength; i++) {
        barHeight = analyserDataArray[i]/2;
        analyserCanvasCtx.fillStyle = '#d0d0d0';
        analyserCanvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);
        x += barWidth + 1;
      }
   }

   function fetchAudio(trackid, trackpath) {
      const id = trackid;
      if (typeof audioSources[id] == "undefined") {
         audioSources[id] = "downloading";
         const trackid = id;
         var request = new Request(trackpath, {
            method: 'GET',
            headers: new Headers({
               'Content-Type': 'arraybuffer'
            })
         });
         fetch(request)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer, function(audioBuffer){
               audioSources[id] = audioBuffer;
            }));
         audioObj[trackid] = new Audio(trackpath);
         audioObj[trackid].preload = "auto";
      }
   }

   function playAudio(id, from, offset, gain) {
      stopAudio();
      advancedModeDetect();
      if (audioProcessorOptions["advancedMode"]["current"]) {
         const sourceNode = audioCtx.createBufferSource();
         sourceNode.buffer = audioSources[id];
         sourceNode.connect(delayNode);
         sourceNode.connect(waveShaperNode);
         sourceNode.connect(gainNode);
         if (analyserNode) sourceNode.connect(analyserNode);
         gainNode.gain.value = gain;
         sourceNode.playbackRate.value = audioProcessorOptions["pitch"]["current"];
         if (audioProcessorOptions["exponentialincreasepith"]["current"])
            setExponentialIncreasePith(sourceNode);
         else if (audioProcessorOptions["exponentialdecreasepith"]["current"])
            setExponentialDecreasePith(sourceNode);
         sourceNode.connect(audioCtx.destination);
         sourceNode.start(0, from, offset);
         playindSource = sourceNode;
      } else {
         audioObj[id].ontimeupdate = function() {
            if (this.currentTime >= (from + offset)) {
               stopAudio();
            }
         };
         audioObj[id].currentTime = from;
         audioObj[id].playbackRate = audioProcessorOptions["playbackRate"]["current"];
         playindAudio = audioObj[id];
         audioObj[id].play();
      }
   }

   function stopAudio() {
      if (playindAudio != undefined) {
         playindAudio.pause();
         playindAudio.currentTime = 0;
         playindAudio = undefined;
      }
      if (playindSource != undefined) {
         playindSource.stop(0);
         playindSource = undefined;
      }
   }

   function setExponentialIncreasePith(sourceNode) {
      resetStandardOptions();
      sourceNode.playbackRate.exponentialRampToValueAtTime(audioProcessorOptions["exponentialincreasepith"]["pitchtarget"], audioCtx.currentTime + audioProcessorOptions["exponentialincreasepith"]["pitchtargetime"]);
   }

   function setExponentialDecreasePith(sourceNode) {
      resetStandardOptions();
      sourceNode.playbackRate.exponentialRampToValueAtTime(audioProcessorOptions["exponentialdecreasepith"]["pitchtarget"], audioCtx.currentTime + audioProcessorOptions["exponentialdecreasepith"]["pitchtargetime"]);
   }

   function isPitchEIEnabled() {
      return audioProcessorOptions["exponentialincreasepith"]["current"];
   }

   function enablePitchEI() {
      resetStandardOptions();
      audioProcessorOptions["pitch"]["current"] = audioProcessorOptions["exponentialincreasepith"]["pitchonenable"];
      audioProcessorOptions["exponentialincreasepith"]["current"] = true;
   }

   function disablePitchEI() {
      audioProcessorOptions["exponentialincreasepith"]["current"] = false;
   }

   function isPitchEDEnabled() {
      return audioProcessorOptions["exponentialdecreasepith"]["current"];
   }

   function enablePitchED() {
      resetStandardOptions();
      audioProcessorOptions["pitch"]["current"] = audioProcessorOptions["exponentialdecreasepith"]["pitchonenable"];
      audioProcessorOptions["exponentialdecreasepith"]["current"] = true;
   }

   function disablePitchED() {
      audioProcessorOptions["exponentialdecreasepith"]["current"] = false;
   }

   function isDistortionEnabled() {
      return audioProcessorOptions["distortion"]["current"];
   }

   function enableDistortion() {
      resetStandardOptions();
      waveShaperNode.curve = generateDistortionCurve(audioProcessorOptions["distortion"]["curvevalue"]);
      audioProcessorOptions["distortion"]["current"] = true;
   }

   function disableDistortion() {
      waveShaperNode.curve = generateDistortionCurve(0);
      audioProcessorOptions["distortion"]["current"] = false;
   }

   function generateDistortionCurve(amount) {
      var k = typeof amount === 'number' ? amount : 0,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
      for ( ; i < n_samples; ++i ) {
         x = i * 2 / n_samples - 1;
         curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      }
      return curve;
   };

   function delayDown() {
      resetStandardOptions();
      if ((parseFloat(audioProcessorOptions["delay"]["current"]).toFixed(2) - parseFloat(audioProcessorOptions["delay"]["step"]).toFixed(2)) >= parseFloat(audioProcessorOptions["delay"]["min"]).toFixed(2))
         audioProcessorOptions["delay"]["current"] -= audioProcessorOptions["delay"]["step"];
      delayNode.delayTime.value = audioProcessorOptions["delay"]["current"];
   }

   function delayUp() {
      resetStandardOptions();
      if ((parseFloat(audioProcessorOptions["delay"]["current"]).toFixed(2) + parseFloat(audioProcessorOptions["delay"]["step"]).toFixed(2)) <= parseFloat(audioProcessorOptions["delay"]["max"]).toFixed(2))
         audioProcessorOptions["delay"]["current"] += audioProcessorOptions["delay"]["step"];
      delayNode.delayTime.value = audioProcessorOptions["delay"]["current"];
   }

   function pitchDown() {
      resetStandardOptions();
      if ((parseFloat(audioProcessorOptions["pitch"]["current"]).toFixed(2) - parseFloat(audioProcessorOptions["pitch"]["step"]).toFixed(2)) >= parseFloat(audioProcessorOptions["pitch"]["min"]).toFixed(2))
         audioProcessorOptions["pitch"]["current"] -= audioProcessorOptions["pitch"]["step"];
   }

   function pitchUp() {
      resetStandardOptions();
      if ((parseFloat(audioProcessorOptions["pitch"]["current"]).toFixed(2) + parseFloat(audioProcessorOptions["pitch"]["step"]).toFixed(2)) <= parseFloat(audioProcessorOptions["pitch"]["max"]).toFixed(2))
         audioProcessorOptions["pitch"]["current"] += audioProcessorOptions["pitch"]["step"];
   }

   function rateDown() {
      resetAdvancedOptions();
      if ((parseFloat(audioProcessorOptions["playbackRate"]["current"]).toFixed(2) - parseFloat(audioProcessorOptions["playbackRate"]["step"]).toFixed(2)) >= parseFloat(audioProcessorOptions["playbackRate"]["min"]).toFixed(2))
         audioProcessorOptions["playbackRate"]["current"] -= audioProcessorOptions["playbackRate"]["step"];
   }

   function rateUp() {
      resetAdvancedOptions();
      if ((parseFloat(audioProcessorOptions["playbackRate"]["current"]).toFixed(2) + parseFloat(audioProcessorOptions["playbackRate"]["step"]).toFixed(2)) <= parseFloat(audioProcessorOptions["playbackRate"]["max"]).toFixed(2))
         audioProcessorOptions["playbackRate"]["current"] += audioProcessorOptions["playbackRate"]["step"];
   }

   function resetOptions() {
      resetStandardOptions();
      resetAdvancedOptions();
   }

   function resetStandardOptions() {
      audioProcessorOptions["playbackRate"]["current"] = audioProcessorOptions["playbackRate"]["default"];
   }

   function resetAdvancedOptions() {
      delayNode.delayTime.value = audioProcessorOptions["delay"]["default"];
      audioProcessorOptions["delay"]["current"] = audioProcessorOptions["delay"]["default"];
      disableDistortion();
      audioProcessorOptions["pitch"]["current"] = audioProcessorOptions["pitch"]["default"];
      audioProcessorOptions["exponentialincreasepith"]["current"] = audioProcessorOptions["exponentialincreasepith"]["default"];
      audioProcessorOptions["exponentialdecreasepith"]["current"] = audioProcessorOptions["exponentialdecreasepith"]["default"];
   }

   function advancedModeDetect() {
      if (parseFloat(audioProcessorOptions["playbackRate"]["current"]).toFixed(2) == parseFloat(audioProcessorOptions["playbackRate"]["default"]).toFixed(2))
         audioProcessorOptions["advancedMode"]["current"] = true;
      else
         audioProcessorOptions["advancedMode"]["current"] = false;
   }

}
