var themes = {
   "Classic" : "classictheme",
   "Native Instruments": "nativeinstrumentstheme"
};

var audioProcessorOptions = {
   "delay": {
      "min": 0,
      "max": 0.5,
      "default": 0,
      "current": 0,
      "step": 0.1
   },
   "distortion": {
      "default": false,
      "current": false,
      "curvevalue": 300
   },
   "pitch": {
      "min": 0.5,
      "max": 1.5,
      "default": 1,
      "current": 1,
      "step": 0.1
   },
   "exponentialincreasepith": {
      "default": false,
      "current": false,
      "pitchonenable": 0.5,
      "pitchtarget": 2,
      "pitchtargetime": 2
   },
   "exponentialdecreasepith": {
      "default": false,
      "current": false,
      "pitchonenable": 1.5,
      "pitchtarget": 0.5,
      "pitchtargetime": 1
   },
   "playbackRate" : {
      "min": 0.25,
      "max": 2,
      "default": 1.0,
      "current": 1.0,
      "step": 0.25
   },
   "advancedMode": {
      "default": true,
      "current": true
   }
};

//modules init
var audioProcessorModule;
var soundButtonModule;
$(document).ready(function() {
   audioProcessorModule = new AudioProcessorModule();
   audioProcessorModule.init();
   soundButtonModule = new SoundButtonModule();
   soundButtonModule.init();
});
