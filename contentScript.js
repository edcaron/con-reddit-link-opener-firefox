var jquery_set_links;
var jquery_set_comments;

function fakeClick(obj) {
	$(obj).closest('.thing').addClass('visited');

	var evObj = document.createEvent('MouseEvents');
	evObj.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 1, null);

	obj.dispatchEvent(evObj);
}

function isNSFW(url){
	for (var i = url.parentNode.nextSibling.children.length - 1; i >= 0; i--) {
		if (url.parentNode.nextSibling.children[i].innerHTML == 'nsfw'){
			return true;
		}
	}

	return false;
}

browser.runtime.onMessage.addListener(function(request, sender, callback) {
	switch (request.action) {
		case 'openRedditLinks':
			var isNewRedditLayout = $("#siteTable").length === 0;

			if (isNewRedditLayout) {
				jquery_set_links = $('.scrollerItem a[data-click-id="body"]:visible');
				jquery_set_comments = $('.scrollerItem a[data-click-id="comments"]:visible');
			} else {
				jquery_set_links = $("#siteTable a.title:visible");
				jquery_set_comments = $("#siteTable a.comments:visible");
			}

			var data = Array();
			for( var i = 0; i < jquery_set_comments.length; i++) {
				var isLinkNSFW = isNSFW(jquery_set_links[i]);
				data.push(new Array(jquery_set_comments[i].text, jquery_set_links[i].href, jquery_set_comments[i].href, isLinkNSFW));
			}

			if(data.length > 0) {
				callback({
					urls : data,
					tabid : request.tabid
				});
			}

			break;

		case 'openNextPage':
			var isNewRedditLayout = $("#siteTable").length === 0;

			if (isNewRedditLayout) {
				window.scrollTo(0, document.body.scrollHeight);
			} else {
				window.location = $('.nextprev a[rel~="next"]').attr("href");
			}

			break;

		case 'scrapeInfoCompanionBar':
			fakeClick(jquery_set_links[request.index]);
			break;

		case 'updateSettings':
			if(request.keyboardshortcut != request.oldkeyboardshortcut) {
				if(request.oldkeyboardshortcut) {
					shortcut.remove(request.oldkeyboardshortcut);
				}

				shortcut.add(request.keyboardshortcut, function() {
					browser.runtime.sendMessage({
						action : "keyboardShortcut"
					});
				});
			}
			break;
		default:
			break;
	}
});

browser.runtime.sendMessage({
	action : "initKeyboardShortcut"
});
