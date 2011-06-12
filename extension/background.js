var account_info = null;

// when new account info extracted
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == 'account_info') {
        account_info = request.account_info;
    } else if (request.type == 'fill'){
        send_account_info();
    }
    sendResponse({});
});


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