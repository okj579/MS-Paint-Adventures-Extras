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
			pitch: 1,
			enqueue: true
		},
		series: {
			6: {
				"EB": { name: "Ecto-biologist" },
				"TT": { name: "Tentacle Therapist" },
				"TG": { name: "Turn-tech God-head" },
				"GG": { name: "Garden Gnostic" },
				"CG": { name: "Carcino-geneticist" },
				"GT": { name: "Ghosty Trickster" },
				"GA": { name: "Grim Auxiliatrix" },
				"AT": { name: "Adios Toreador" },
				"GC": { name: "Gallows Calibrator" },
				"TA": { name: "Twin Armageddons" },
				"WV": { name: "Wayward Vagabond" },
				"NANNASPRITE": { name: "Nanna Sprite" },
				"JOHN": { name: "John" }
			}
		}
	}
}

function saveSettings(settings) {
	localStorage['settings'] = JSON.stringify(settings);
	chrome.extension.sendRequest({action:"updateSettings",settings:settings});
}

function getSettings() {
	try {
		var defaults = new Settings(),
			settings = JSON.parse(localStorage['settings'] || false);
		$.extend(true, defaults, settings);
		if(settings.tts && settings.tts.series) defaults.tts.series = settings.tts.series
		return defaults;
	} catch(e) {
		return new Settings();
	}
}

settings = getSettings();

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.action=='updateSettings') settings = request.settings;
});