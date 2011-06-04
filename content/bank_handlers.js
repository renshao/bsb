var bank_handlers = {
    'cba' : function(account_info) {
        jQuery('input[name="NEW_ACCOUNT_NAME"]').val(account_info.name);
        jQuery('input[name="NEW_BSB_1"]').val(account_info.bsb1);
        jQuery('input[name="NEW_BSB_2"]').val(account_info.bsb2);
        jQuery('input[name="NEW_ACCOUNT_NUMBER"]').val(account_info.account_no);
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
    console.log(host);
    if(host.match(/.+commbank\.com\.au/i)){
        return 'cba';
    }else if(host.match(/.+nab\.com\.au/i)){
        return 'nab';
    }
    return null;
}