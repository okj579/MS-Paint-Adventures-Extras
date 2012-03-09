function Settings() {
	this.keys = {
		next: 39, //Right arrow
		back: 37, //Left arrow
		silence: 83 //Silence
	}
	this.tts = {
		enabled: true,
		title: true,
		caption: true,
		action: false,
		options: {
			rate: 1,
			enqueue: true
		}
	}
}

function saveSettings(settings) {
	localStorage['settings'] = JSON.stringify(settings);
	chrome.extension.sendRequest({action:"updateSettings",settings:settings});
}

function getSettings() {
	var settings = new Settings();
	$.extend(true, settings, JSON.parse(localStorage['settings'] || false));
	return settings;
}

settings = getSettings();

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.action=='updateSettings') settings = request.settings;
});