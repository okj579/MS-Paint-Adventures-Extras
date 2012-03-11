function parseQuery(){
	window.location.search_object = {};
	var list = window.location.search.slice(1).split('&');
	for( i in list ) {
		var key_val = list[i].split('=');
		key_val[0] = unescape(key_val[0].replace(/\+/g, " "));
		key_val[1] = unescape(key_val[1].replace(/\+/g, " "));
		window.location.search_object[key_val[0]] = key_val[1];
	}
}
parseQuery();	

function speak(text) {
	text = text.toLowerCase().replace(/^\s*|\s*$|==>/g,'').replace(/\s+/g,' ');
	if(text==' ') return;
	chrome.extension.sendRequest({action:"say", text:text, series:series}, function(e){
		console.log('TTS Error: '+e);
		$('body').append(
			'<div style="position:fixed;bottom:0;left:0;width:100%;text-align:center;background-color:salmon;padding:2px;">' +
			'There was a problem with TTS. Check your <a href="'+chrome.extension.getURL('options.html')+'">settings</a> or try a ' +
			'<a href="https://chrome.google.com/webstore/detail/jcabofbhfighebggomnamjankeaplmhn">new voice</a>.' +
			'</div>'
		);
	});
}

var series = parseInt(window.location.search_object.s,10),
	page = parseInt(window.location.search_object.p,10);

$(window).unload(function(){chrome.extension.sendRequest({action:"stopSpeech"});});

$(function(){
	var page_trs = $('body > center > table > tbody > tr'),
		comic_section = $(page_trs[1]),
		banners = $([page_trs[0],page_trs[4]]);
		
	if(window.location.search_object.p === undefined) { //For first pages
		page = parseInt($('a:last',comic_section).attr('href').slice(-6),10);
	}

	function pad6(n) { return ('00000'+n).slice(-6); }
	function nav(offset, hist) {
		chrome.extension.sendRequest({action:"stopSpeech"});
		page += offset;
		$.get('/', {s:series, p:pad6(page)}, function(data) {
			new_comic = data.slice(
				data.indexOf('<!------------------------begin comic content----------------------------------->'),
				data.indexOf('<!------------------------end comic content----------------------------------->')
			);
			new_comic = new_comic.replace(/<script.*<\/script>/g,'');
			new_comic = new_comic.replace('<noscript>','');
			new_comic = new_comic.replace('<\/noscript>','');
			comic_section.find('td:eq(0)').html(new_comic);
			afterLoad();
		});
		if(!hist) window.history.pushState(null,'MS Paint Adventures','/?s='+series+'&p=' + pad6(page));
	}
	$(window).bind('popstate',function(){
		parseQuery();
		nav(parseInt(window.location.search_object.p,10) - page, true);
	});

	$(document).keydown(function(e){
		if(e.which==settings.keys.next) {
			nav(+1);
		} else if (e.which==settings.keys.back) {
			nav(-1);
		} else if (e.which==settings.keys.silence) {
			chrome.extension.sendRequest({action:"stopSpeech"});
		}
	});
	function toggleTheater() {
		$([page_trs[2],page_trs[3],page_trs[5]]).toggle();
		banners.css('height','0');
		page_trs.closest('table').css('height','100%');
	}
	function isTheater() {
		return localStorage['theater-mode'] === 'true';
	}
	function afterLoad() {
		var comic_parts = $('table table table table',comic_section),
			comic_title = $(comic_parts[0]),
			comic_caption = $(comic_parts[1]);
			comic_controls = comic_parts.last();
		$(':button',comic_caption).remove();
		$('.spoiler',comic_caption).show();
		$('a:first',comic_controls).click(function(){
			nav(+1);
			return false;
		});
		$('a:eq(2)',comic_controls).click(function(){
			nav(-1);
			return false;
		});
		$('b:last',comic_controls).after($('b:last',comic_controls).clone()).after(' | ');
		$('font:last',comic_controls).text('Shh!');
		$('a:last',comic_controls).attr('href','#stop');
		$('a:last',comic_controls).click(function(){
			chrome.extension.sendRequest({action:"stopSpeech"});
		});
		
		if(settings.tts.enabled) {
			if(settings.tts.title) speak($(comic_parts[0]).text());
			if(settings.tts.caption) $('p,span',comic_caption).not(':has(p,span)').each(function(i,span){
				speak($(span).text());
			});
			if(settings.tts.action) speak($('a:first',comic_controls).text());
		}
	}
	
	$('b',banners).append(' &nbsp; <img src="images/candycorn.gif" border="0" align="absmiddle"> &nbsp; <a href="'+chrome.extension.getURL('options.html')+'" target="_blank" style="color:white">EXTRAS OPTIONS</a>');
	$('b',banners).append(' | <a href="#" id="theater-mode" style="color:white">THEATER MODE</a>');
	$('#theater-mode').click(function(){
		toggleTheater();
		localStorage['theater-mode'] = !isTheater();
	});
	if(localStorage['theater-mode'] === 'true') { toggleTheater(); }
	
	chrome.extension.sendRequest({action:"getSettings"}, function(resp) {
		settings = resp;
		afterLoad();
	});
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if(request.action=='updateSettings') settings = request.settings;
	});

});
