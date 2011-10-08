const NOTIFICATION_CLASS = '__ac_jgrowl_container';
const NOTIFICATION_CLASS_SELECTOR = '.' + NOTIFICATION_CLASS;

/**
 * Lifespan of a non-sticky notification
 */
        const NOTE_LIFE = 10000;

var previous_selected_text = null;
var template = "<div class='__ac_notification'>" +
        "<table class='__ac_table'>" +
        "<tr><td class='__ac_label'>BSB:</td><td>${bsb1}-${bsb2}</td></tr>" +
        "<tr><td class='__ac_label'>Account No:</td><td>${account_no}</td></tr>" +
        "<tr><td class='__ac_label'>Name:</td><td>${name}</td></tr>" +
        "</table>" +
        "<div class='__ac_selected_text_container'>" +
        "<div class='__ac_selected_text_header'></div>" +
        "<div class='__ac_selected_text_outer'><div class='__ac_selected_text'>Selected Text: ${selected_text}</div></div>" +
        "</div> " +
        "</div>";


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type === 'show_notification') {
        show_account_notification(request.account_info, {sticky : true, header : 'Account Clipboard (Sticky)'});
    } else if (request.type === 'auto_complete') {
        fill_text_fields(request.account_info);
    } else if (request.type === 'capture_selected') {
        capture_selected();
    }

    sendResponse({});
});


jQuery(document).ready(function() {
//    jQuery(document).mouseup(onmouseup);
//    jQuery('iframe').each(function(index, iframe) {
//        jQuery(iframe.contentDocument).mouseup(onmouseup);
   // });
});

function capture_selected() {
    var selected_text = getSelectionText();
    if (selected_text === null) {
        return;
    }

    if (previous_selected_text != selected_text) {
        previous_selected_text = selected_text;
    }

    account_info = {};
    account_info.selected_text = selected_text;

    // send account_info to backend
    chrome.extension.sendRequest(account_info);
    show_account_notification(account_info, {header: 'Selected text captured'});
}


function fill_text_fields(account_info) {
    var bank_code = get_bank_code();
    if (bank_code === null) {
        console.log('Unable to determine Internet Banking website.');
        return;
    }
    console.log('Internet Banking: ' + bank_code);

    var handler = bank_handlers[bank_code];

    if (handler !== null) {
        handler(account_info);
    }
}

/**
 * Fired on mouse up in browser. Try to detect if selected text
 * contains account information
 */
function onmouseup() {
    var account_info = null;
    var selected_text = getSelectionText();
    if (selected_text === null) {
        return;
    }

    if (previous_selected_text != selected_text) {
        previous_selected_text = selected_text;

        account_info = extract_account_info(selected_text);
    }

    if (account_info === null) {
        return;
    }

    account_info.selected_text = selected_text;

    // send account_info to backend
    chrome.extension.sendRequest({
        type: 'account_info',
        account_info: account_info
    });
    show_account_notification(account_info, {header : 'BSB & account detected'});
}


function show_account_notification(account_info, options) {
    options = options === undefined ? {} : options;
    options.theme = NOTIFICATION_CLASS;
    options.life = NOTE_LIFE;
    options.theme = 'bsb';
    // when responded, show notification
    var account_info_html = jQuery.tmpl(template, account_info).html();
    jQuery.jGrowl(account_info_html, options);
}


function getSelectionText() {
    // first try to detect selection from main window
    var selection = window.getSelection();

    // if not detected, try all iframes within main window
    if (selection.type !== 'Range') {
        jQuery('iframe').each(function(index, iframe) {
            selection = iframe.contentDocument.getSelection();
            if (selection.type === 'Range') {
                return false;
            }
        });
    }

    if (selection.type !== 'Range') {
        return null;
    }

    var selected_node = jQuery(selection.anchorNode);

    // ignore if selecting within the notification box
    if (selected_node.parents(NOTIFICATION_CLASS_SELECTOR).length > 0) {
        return null;
    }

    return selection.toString();
}


function extract_account_info(selected_text) {
    var bsb = extract_bsb(selected_text);

    var bsb1 = null;
    var bsb2 = null;

    if (bsb !== null) {
        bsb1 = bsb.bsb1;
        bsb2 = bsb.bsb2;
    }

    var account_no = extract_account_no(bsb === null ? null : bsb1 + bsb2, selected_text);

    var name = extract_name(selected_text);

    if (bsb1 || bsb2) {
        return {
            name:name,
            bsb1:bsb1,
            bsb2:bsb2,
            account_no:account_no};
    }

    return null;
}


function extract_bsb(account_info /* string */) {
    // start of file or any non-digit char, then 3 digits, then hyphen -, then another 3 digits,
    // then any whitespace chars
    var bsbs = account_info.match(/bsb\D+\d{3}\s*-{0,1}\s*\d{3}\D+?/ig);
    if (bsbs == null) {
        bsbs = account_info.match(/(^|\D)\d{3}\s*-{0,1}\s*\d{3}\D+?/g);
    }
    console.log(account_info);
    console.log(bsbs);

    if (bsbs == null) {
        // start of file or any non-digit char, then 6 digits, then any whitespace chars
        bsbs = account_info.match(/(^|\D)\d{6}\W+/g);
    }

    var bsb = null;
    var bsb1 = null;
    var bsb2 = null;

    if (bsbs != null) {
        for (var i = 0; i < bsbs.length; i++) {
            bsbs[i] = bsbs[i].replace(/\D/g, '');
        }

        console.log(bsbs);

        bsb = bsbs[0];

        if (/\d{6}/g.test(bsb)) {
            bsb1 = bsb.substr(0, 3);
            bsb2 = bsb.substr(3, 3);
        }
    }

    return {bsb1:bsb1, bsb2:bsb2};
}


function extract_account_no(bsb /*string*/, selected_text) {
    // a / c 012 343
    var account_nums = selected_text.match(/a\s*\/\s*c\D+\d[\d\s-]+/gi);

    if (account_nums == null) {
        // Try a more specific pattern: acc 02323 (just in case Westpac - BSB 032-099 Acc # 25-0072)
        account_nums = selected_text.match(/acc\D+\d[\d\s-]+/gi);
    }

    if (account_nums == null) {
        // now try ac
        account_nums = selected_text.match(/ac\D+\d[\d\s-]+/gi);
    }


    if (account_nums != null) {
        if (account_nums.length > 1) {
            console.log('More then 1 account numbers detected.');
        }

        var account_no = null;
        jQuery.each(account_nums, function(index, candidate) {
            candidate = candidate.replace(/\D/g, '');
            if (candidate !== bsb) {
                account_no = candidate;
                return false;
            }
        });
        return account_no;
    }

    return null;
}

function extract_name(selected_text) {
    var regex = /account\s+name\W+(.+)/gi;
    var names = selected_text.match(regex);

    if (names == null) {
        // name:shao
        regex = /name:(.+)/gi;
        names = selected_text.match(regex);
    }

    if (names == null) {
        // name - divine cakes
        regex = /name\s{0,3}\-\s{0,3}([a-z\s]+)/gi;
        names = selected_text.match(regex);
    }

    if (names != null) {
        var name = names[0];
        name = name.replace(regex, "$1");
        name = name.replace(/[^a-z\s]/gi, '');
        return name;
    }

    return null;
}
