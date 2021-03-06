chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
	
		if(request.action=="say") {
			settings = getSettings(); //Get for every phrase
			var options = settings.tts.options, //Alias, not clone
				characters = settings.tts.series[request.series];
			for(abbr in characters) {
				if(request.text.substr(0,abbr.length+2) == abbr.toLowerCase()+': ') {
					request.text = characters[abbr].name + request.text.substr(abbr.length);
					if(characters[abbr].voiceName) options.voiceName = characters[abbr].voiceName;
					if(characters[abbr].pitch) options.pitch = characters[abbr].pitch;
					if(characters[abbr].rate) options.rate = characters[abbr].rate;
				}
			}
			console.log(request.text);
			console.log(options);
			chrome.tts.speak(request.text,options,function(){
				if(chrome.extension.lastError) {
					sendResponse(chrome.extention.lastError);
				}
			});
			
		} else if(request.action=="stopSpeech") {
			chrome.tts.stop();
			
		} else if(request.action=="getSettings") {
			sendResponse(settings);
		
		} else if(request.action=="toggleSound") {
			settings.tts.enabled = !settings.tts.enabled;
			if(!settings.tts.enabled) chrome.tts.stop();
			saveSettings(settings);
		}
		
	}
);
