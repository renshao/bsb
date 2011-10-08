var selectionText = "";
var notification = null;

var contextMenu = chrome.contextMenus.create({
	"title": "Send to Web Stand",
	"contexts": ["selection"],
	onclick : sendToStand
});

function sendToStand(selection, tab) {
	selectionText = selection.selectionText;
	
	if(notification !== null) {
		notification.cancel();
		notification = null;
	}
	notification = webkitNotifications.createHTMLNotification('notification.html');
	notification.show();
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.type = 'selectionText') {
		sendResponse(selectionText);
	}
});

