var fill_button = jQuery("<button type='button'>Fill Account</button>");
fill_button.click(function() {
    chrome.extension.sendRequest({
        type: 'fill'
    });
});

var host = window.location.host;
if (host.match(/.+commbank\.com\.au/i)) {
    var transferForm = jQuery('form[name="transferForm"]');
    if (transferForm.length === 1) {
        jQuery('#accountName').after(fill_button);
    }
} else if (host.match(/.+nab\.com\.au/i)) {
    var bsb = jQuery('input[name="payeeBsb"]');
    if (bsb.length === 1) {
        bsb.after(fill_button);
    }
}

var bank_handlers = {
    'cba' : function(account_info) {
        jQuery('#newAccount').click();
        jQuery('#accountName').val(account_info.name);
        jQuery('#BSB1').val(account_info.bsb1);
        jQuery('#BSB2').val(account_info.bsb2);
        jQuery('#accountNumber').val(account_info.account_no);
    },
    'nab' : function(account_info) {
        jQuery('input[name="payeeAcctName"]').val(account_info.name);
        jQuery('input[name="payeeBsb"]').val(account_info.bsb1 + account_info.bsb2);
        jQuery('input[name="payeeAcctId"]').val(account_info.account_no);
    },
    'anz' : function() {
    },
    'westpac' : function() {
    },
    'stgeorge' : function() {
    }
};


function get_bank_code() {
    var host = window.location.host;
    if (host.match(/.+commbank\.com\.au/i)) {
        return 'cba';
    } else if (host.match(/.+nab\.com\.au/i)) {
        return 'nab';
    }
    return null;
}