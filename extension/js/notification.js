$(document).ready(function(){
	chrome.extension.sendRequest({type:'selectionText'}, function selectionTextReturned(selectionText){
				var paragraphs = selectionText.split(/\n/);
			    var html = '';
				$.each(paragraphs, function(index, value){
					html += '<p>' + value + '</p>';
				});
				$('#selectionText').html(html);
	});			
});
