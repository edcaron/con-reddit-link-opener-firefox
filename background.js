function openAllUrls(tab) {
	if (tab.url.includes('reddit')){
		 browser.tabs.sendMessage(tab.id, {
			action : 'openRedditLinks',
			tabid : tab.id
		}, function(response) {
			openUrl(response.urls, 0, 0, response.tabid);
		});
	}
	else
	{
        browser.tabs.create({
	        url : "errorPage.html",
	        active : true
		});
	}
}

function createTab(url, active){
	browser.tabs.create({
		url : url,
		active : active
	});
}

async function openUrl(urls, index, count, tabid) {
	if(index == urls.length) {
		if(count == 0) {
			 browser.tabs.sendMessage(tabid, {
				action : 'openNextPage'
			});
		}
		return;
	}

	var url = urls[index];

	var pageTitle   = url[0];
	var commentsUrl = url[1];
	var articleUrl  = url[2];
	var isLinkNSFW  = url[3];

	if(!commentsUrl.match("javascript:.*")) {

		var openingComportment = localStorage["openingComportment"];
		var openvisitedlinks   = (localStorage["openvisitedlinks"] == "true");
		var opennsfwlinks      = (localStorage["opennsfwlinks"] == "true");
		var tabslimit          = localStorage["tabslimit"];

		if(!opennsfwlinks && ((pageTitle.toLowerCase().indexOf("nsfw") != -1) || isLinkNSFW)) {
			openUrl(urls, index + 1, count, tabid);
			return;
		}

		if(count >= tabslimit) {
			openUrl(urls, index + 1, count, tabid);
			return;
		}

		var historyItemUrl = commentsUrl;

		var isCommentsUrlvisited = false;
		await browser.history.getVisits({
			url : commentsUrl
		}).then( (result) => {
			if( result.length > 0){
				isCommentsUrlvisited = true;
			}else{
				isCommentsUrlvisited = false;
			}
		});

		var isArticleUrlvisited = false;
		await browser.history.getVisits({
			url : commentsUrl
		}).then( (result) => {
			if( result.length > 0){
				isArticleUrlvisited = true;
			}else{
				isArticleUrlvisited = false;
			}
		});

		browser.tabs.sendMessage(tabid, {
			action : "scrapeInfoCompanionBar",
			index : index
		});

		switch(openingComportment) {
		    case "comments":
				if(openvisitedlinks == false && isCommentsUrlvisited == true) {
					openUrl(urls, index + 1, count, tabid);
					return;
				}

				createTab(articleUrl, false);
		        break;
		    case "articles":
				if(openvisitedlinks == false && isArticleUrlvisited == true) {
					openUrl(urls, index + 1, count, tabid);
					return;
				}

				createTab(commentsUrl, false);
		        break;
	        case "both":
				if(openvisitedlinks == false && (isCommentsUrlvisited == true ||  isArticleUrlvisited == true )) {
					openUrl(urls, index + 1, count, tabid);
					return;
				}

	        	createTab(commentsUrl, false);
				createTab(articleUrl, false);
		        break;
		    default:
				createTab(commentsUrl, false);
		}

		openUrl(urls, index + 1, count + 1, tabid);
	}
}

function checkVersion() {

	function onInstall() {
		browser.tabs.create({
			url : "options.html",
			active : true
		});
	}

	function onUpdate() {

		browser.tabs.create({
			url : "changelog.html",
			active : true
		});
	}

// return the number of installed version
	function getVersion() {
		var manifest = browser.runtime.getManifest();
		return manifest.version;
	}

	// Check if the version has changed.
	var currVersion = getVersion();
	var prevVersion = localStorage['version'];
	if(currVersion != prevVersion) {
		// Check if we just installed this extension.
		if( typeof prevVersion == 'undefined') {
			onInstall();
		} else {
			onUpdate();
		}
		localStorage['version'] = currVersion;
	}
}

function init() {

	var openingComportment = localStorage["openingComportment"];
	var openvisitedlinks = localStorage["openvisitedlinks"];
	var opennsfwlinks = localStorage["opennsfwlinks"];
	var tabslimit = localStorage["tabslimit"];
	var keyboardshortcut = localStorage["keyboardshortcut"];

	localStorage["oldkeyboardshortcut"] = undefined;

	// set default options
	if(!openingComportment) {
		localStorage["openingComportment"] = "comments";
	}

	if(!openvisitedlinks) {
		localStorage["openvisitedlinks"] = "false";
	}

	if(!opennsfwlinks) {
		localStorage["opennsfwlinks"] = "true";
	}

	if(!tabslimit) {
		localStorage["tabslimit"] = 25;
	}

	if(!keyboardshortcut) {
		localStorage["keyboardshortcut"] = "Ctrl+Shift+f";
	}

	browser.browserAction.onClicked.addListener(function(tab) {
		openAllUrls(tab);
	});

	browser.runtime.onMessage.addListener(function(request, sender, callback) {
		switch (request.action) {
			case 'keyboardShortcut':
				openAllUrls(sender.tab);
				break;

			case 'initKeyboardShortcut':
				 browser.tabs.sendMessage(sender.tab.id, {
					action : 'updateSettings',
					keyboardshortcut : localStorage["keyboardshortcut"]
				});
				break;

			default:
				break;
		}
	});
	checkVersion();
}

document.addEventListener('DOMContentLoaded', function () {
  init();
});
