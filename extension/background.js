var account_info = null;

var parent = chrome.contextMenus.create({"title": "Stick it", "contexts": ["selection"], onclick : stick});

var selectionText = "";

function getSelectionText() {
	return selectionText;
}

// when new account info extracted
function stick(info, tab) {
	selectionText = info.selectionText;
	var notification = webkitNotifications.createHTMLNotification(
  		'notification.html'
	);
	notification.show();
}


//chrome.contextMenus.create({title: 'Fill Account', contexts: ['all'], onclick: send_account_info});


function send_account_info() {
    if (account_info == null) {
        return;
    }

    chrome.windows.getLastFocused(function(window) {
        chrome.tabs.getSelected(window.id, function(tab) {
            chrome.tabs.sendRequest(tab.id, {type:'auto_complete', account_info: account_info}, function(response) {
                console.log('sent account info');
            });
        });
    });
}
