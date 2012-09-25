$(function(){
	function update() {
		settings.keys.next = $('#key-next').val();
		settings.keys.back = $('#key-back').val();
		settings.keys.silence = $('#key-silence').val();
		
		settings.tts.enabled = $('#tts').is(':checked');
		settings.tts.title = $('#tts-title').is(':checked');
		settings.tts.caption = $('#tts-caption').is(':checked');
		settings.tts.action = $('#tts-action').is(':checked');
		settings.tts.options.rate = parseFloat($('#tts-rate').val(),10);
		settings.tts.options.pitch = parseFloat($('#tts-pitch').val(),10);
		settings.tts.options.voiceName = $('#tts-voice').val();
		
		settings.tts.series = {};
		$('#characters tr').each(function(i, row){
			var series = parseInt($('.field-series select',row).val(), 10),
				abbr = $('.field-abbr input',row).val(),
				name = $('.field-name input',row).val(),
				voiceName = $('.field-voiceName select',row).val(),
				pitch = $('.field-pitch input',row).val(),
				rate = $('.field-rate input',row).val();
			if(series && abbr) {
				settings.tts.series[series] = settings.tts.series[series] || {};
				settings.tts.series[series][abbr] = {name: name};
				if(voiceName) settings.tts.series[series][abbr].voiceName = voiceName;
				if(pitch) settings.tts.series[series][abbr].pitch = parseFloat(pitch,10);
				if(rate) settings.tts.series[series][abbr].rate = parseFloat(rate,10);
			}
		});
		saveSettings(settings);
	}
	
	function addCharacter(series, abbr, name, voiceName, pitch, rate) {
		$('#characters').append( $(document.createElement('tr') )
			.append( $(document.createElement('td')) .addClass('field-series')
				.append( $(document.createElement('select'))
					.append( $(document.createElement('option')).val(6).text('Homestuck'))
					.append( $(document.createElement('option')).val(4).text('Problem Sleuth'))
					.append( $(document.createElement('option')).val(2).text('Bard Quest'))
					.append( $(document.createElement('option')).val(1).text('Jailbreak'))							 
					.val(series || '')
				)
			)
			.append( $(document.createElement('td')) .addClass('field-abbr')
				.append( $(document.createElement('input')) .val(abbr || '') )
			)
			.append( $(document.createElement('td')) .addClass('field-name')
				.append( $(document.createElement('input')) .val(name || '') )
			)
			.append( $(document.createElement('td')) .addClass('field-voiceName')
				.append( $('#tts-voice').clone() .val(voiceName || '') )
			)
			.append( $(document.createElement('td')) .addClass('field-pitch')
				.append( $(document.createElement('input')) .val(pitch || '')
					.attr('type','number') .attr('min','0') .attr('max','2') .attr('step','.1')
				)
			)
			.append( $(document.createElement('td')) .addClass('field-rate')
				.append( $(document.createElement('input')) .val(rate || '') 
					.attr('type','number') .attr('min','.1') .attr('max','10') .attr('step','.1')
				)
			)
			.append( $(document.createElement('td')) .addClass('delete-row')
				.append(
					$(document.createElement('a')) .addClass() .text('Delete')
					.click(function(){ $(this).closest('tr').remove(); update(); })
				)
			)
		);
	}
	
	$('input').live('input',update);
	$('input,select').live('change',update);
	
	$('#key-next').val(settings.keys.next);
	$('#key-back').val(settings.keys.back);
	$('#key-silence').val(settings.keys.silence);
	
	if(settings.tts.enabled) $('#tts').attr('checked','checked');
	if(settings.tts.title) $('#tts-title').attr('checked','checked');
	if(settings.tts.caption) $('#tts-caption').attr('checked','checked');
	if(settings.tts.action) $('#tts-action').attr('checked','checked');
	$('#tts-rate').val(settings.tts.options.rate);
	$('#tts-pitch').val(settings.tts.options.pitch);
	chrome.tts.getVoices(function(voices){
		for(i in voices) {
			$('#tts-voice').append('<option>');
			$('#tts-voice option:last').text(voices[i].voiceName)
									   .val(voices[i].voiceName);
			if(settings.tts.options.voiceName==voices[i].voiceName) $('#tts-voice option:last').attr('selected','selected');
		}
		if(!voices.length) $('#noVoicesWarning').show();
		
		// Populate Character Voices
		var s, abbr;
		for(s in settings.tts.series) {
			for(abbr in settings.tts.series[s]) {
				addCharacter(s,
							 abbr,
							 settings.tts.series[s][abbr].name,
							 settings.tts.series[s][abbr].voiceName,
							 settings.tts.series[s][abbr].pitch,
							 settings.tts.series[s][abbr].rate
							);
			}
		}
		
		update();
	});
	
	
	$('.keycode').keydown(function(e){
		this.value = e.which;
		update();
		return false;
	});
});
