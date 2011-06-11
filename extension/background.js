var account_info = null;

// when new account info extracted
chrome.extension.onRequest.addListener(function(new_account_info, sender, sendResponse) {
    account_info = new_account_info;
    sendResponse({});
});


chrome.contextMenus.create({title: 'Fill Account', contexts: ['all'], onclick: send_account_info});


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