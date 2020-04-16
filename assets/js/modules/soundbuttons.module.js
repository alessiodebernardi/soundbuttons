function SoundButtonModule() {

   this.init = init;

   function init() {
      generateSoundButtons();
      bindTrackPlayEvent();
      bindOptionsChangeEvent();
      displayRefresh();
   }

   function generateSoundButtons() {
      for (var i = 0; i < buttons.length; i++) {
          var button = buttons[i];
          var keybordKey = String.fromCharCode(button.keybinding);
          var toCopy = $(".buttons .to-copy").clone().removeClass("d-none to-copy");
          $(".button", toCopy).addClass("sound-button")
              .attr("data-elem-index", i)
              .attr("data-elem-trackid", button.trackid)
              .attr("data-elem-from", button.from)
              .attr("data-elem-offset", button.offset)
              .attr("data-elem-gain", button.gain | 0)
              .attr("data-elem-keybinding", button.keybinding)
              .attr("data-elem-counter", 0)
              .addClass(button.classes);
          $(".button .name", toCopy).html(button.name);
          if(!window.mobileAndTabletcheck()) {
              $(".button .keyboardkey", toCopy).html(keybordKey);
          }
          $(".buttons").append(toCopy);
          audioProcessorModule.fetchAudio(button.trackid, button.path);
      }
      audioProcessorModule.initAnalyzer("oscilloscope");
   }

   function bindTrackPlayEvent() {
      $(".sound-button").on("click", function() {
          playBtnTrack(this);
          btnActiveAnimate(this);
      });

      $(document).on("keypress", function(event) {
          var key = event.which;
          var elem = $("[data-elem-keybinding='"+key+"'");
          if($(elem).length) {
             playBtnTrack(elem);
             btnActiveAnimate(elem);
          }
      });
   }

   function btnActiveAnimate(btn) {
      $(btn).addClass("active");
      setTimeout(function () {
         $(btn).removeClass("active");
      }, 100);
   }

   function btnLightAnimate(btn) {
      $(btn).addClass("lighted");
      setTimeout(function () {
         $(btn).removeClass("lighted");
      }, 100);
   }

   function playBtnTrack(btn) {
      var elemTrackId = $(btn).attr("data-elem-trackid");
      var elemFrom = parseFloat($(btn).attr("data-elem-from"));
      var elemOffset = parseFloat($(btn).attr("data-elem-offset"));
      var elemGain = parseFloat($(btn).attr("data-elem-gain"));
      var currentCounter = parseFloat($(btn).attr("data-elem-counter"));
      var elemLabel = $(".name", btn).html();
      audioProcessorModule.playAudio(elemTrackId, elemFrom, elemOffset, elemGain);
      $(btn).attr("data-elem-counter", ++currentCounter);
   }

   function bindOptionsChangeEvent() {
      $(".opt-button").on("click", function(btn) {
         var btn = this;
         btnActiveAnimate(btn);
         switch ($(btn).attr("data-option-action")) {
            case "stopaudio":
               audioProcessorModule.stopAudio();
               break;
            case "ratedown":
               audioProcessorModule.rateDown();
               break;
            case "rateup":
               audioProcessorModule.rateUp();
               break;
            case "delaydown":
               audioProcessorModule.delayDown();
               break;
            case "delayup":
               audioProcessorModule.delayUp();
               break;
            case "pitchdown":
               audioProcessorModule.pitchDown();
               break;
            case "pitchup":
               audioProcessorModule.pitchUp();
               break;
            case "pitchei":
               if (audioProcessorModule.isPitchEIEnabled())
                  audioProcessorModule.disablePitchEI();
               else {
                  audioProcessorModule.enablePitchEI();
                  audioProcessorModule.disablePitchED();
               }
               break;
            case "pitched":
               if (audioProcessorModule.isPitchEDEnabled())
                  audioProcessorModule.disablePitchED();
               else {
                  audioProcessorModule.enablePitchED();
                  audioProcessorModule.disablePitchEI();
               }
               break;
            case "distortion":
               if (audioProcessorModule.isDistortionEnabled())
                  audioProcessorModule.disableDistortion();
               else
                  audioProcessorModule.enableDistortion();
               break;
            case "reset":
               audioProcessorModule.resetOptions();
               break;
         }
         audioProcessorModule.advancedModeDetect();
         displayRefresh();
      });
   }

   function displayRefresh() {
      $("#ratevalue").html(parseFloat(audioProcessorOptions["playbackRate"]["current"]).toFixed(2));
      $("#delayvalue").html(parseFloat(audioProcessorOptions["delay"]["current"]).toFixed(2));
      $("#pitchvalue").html(parseFloat(audioProcessorOptions["pitch"]["current"]).toFixed(2));
      $("#pitchlivalue").html(audioProcessorOptions["exponentialincreasepith"]["current"] ? "ON" : "OFF");
      $("#pitchldvalue").html(audioProcessorOptions["exponentialdecreasepith"]["current"] ? "ON" : "OFF");
      $("#distortionvalue").html(audioProcessorOptions["distortion"]["current"] ? "ON" : "OFF");
      $("#advancedmodevalue").html(audioProcessorOptions["advancedMode"]["current"] ? "ON" : "OFF");
      if (audioProcessorOptions["advancedMode"]["current"])
         $(".display").removeClass("noadvmode");
      else
         $(".display").addClass("noadvmode");
   }

   function convertToSlug(Text) {
       return Text
           .toLowerCase()
           .replace(/ /g,'-')
           .replace(/[^\w-]+/g,'')
           ;
   }

   window.mobileAndTabletcheck = function() {
       var check = false;
       (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
       return check;
   };

}
