$(document).ready(function(){
				var selectionText = chrome.extension.getBackgroundPage().getSelectionText();
				var paragraphs = selectionText.split(/\n/);
			    var html = '';
				$.each(paragraphs, function(index, value){
					html += '<p>' + value + '</p>';
				});
				$('#selectionText').html(html);
});
