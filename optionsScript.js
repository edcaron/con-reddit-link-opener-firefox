function updateSettings() {
	browser.windows.getCurrent(function(win) {
		// get an array of the tabs in the window
		var tabs = browser.tabs.query({windowId : win.id});
		// loop over the tabs
		for(i in tabs){
			browser.tabs.sendMessage(tabs[i].id, {
				action : 'updateSettings',
				keyboardshortcut : localStorage["keyboardshortcut"],
				oldkeyboardshortcut : localStorage["oldkeyboardshortcut"]
			});
		}
	});
}

// Saves options to localStorage.
function save_options() {
	var radio_openingComportment = document.querySelector('input[name=openingComportment]:checked');
	var checkbox_openvisitedlinks = document.getElementById("openvisitedlinks");
	var checkbox_opennsfwlinks = document.getElementById("opennsfwlinks");
	var input_tabslimit = document.getElementById("tabslimit");
	var input_keyboardshortcut = document.getElementById("keyboardshortcut");

	if(isNaN(input_tabslimit.value)) {
		alert("Only Integer for New Tabs Limit !");
		input_tabslimit.value = localStorage["tabslimit"];
		return;
	}

	localStorage["openingComportment"] = radio_openingComportment.value;
	localStorage["openvisitedlinks"] = checkbox_openvisitedlinks.checked;
	localStorage["opennsfwlinks"] = checkbox_opennsfwlinks.checked;
	localStorage["tabslimit"] = input_tabslimit.value;

	localStorage["oldkeyboardshortcut"] = localStorage["keyboardshortcut"];

	localStorage["keyboardshortcut"] = input_keyboardshortcut.value;

	updateSettings();

	// Update status to let user know options were saved.
	var status = document.getElementById("status");
	status.innerHTML = '<span style="color:#FF0000">Options Saved.</span><br>';
	setTimeout(function() {
		status.innerHTML = "";
	}, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	var openingComportment = localStorage["openingComportment"];
	var openvisitedlinks = localStorage["openvisitedlinks"];
	var opennsfwlinks = localStorage["opennsfwlinks"];
	var tabslimit = localStorage["tabslimit"];
	var keyboardshortcut = localStorage["keyboardshortcut"];

	var radio_openingComportment = document.getElementById(openingComportment);
	var checkbox_openvisitedlinks = document.getElementById("openvisitedlinks");
	var checkbox_opennsfwlinks = document.getElementById("opennsfwlinks");
	var input_tabslimit = document.getElementById("tabslimit");
	var input_keyboardshortcut = document.getElementById("keyboardshortcut");

	radio_openingComportment.checked = true;
	checkbox_openvisitedlinks.checked = (openvisitedlinks == "true");
	checkbox_opennsfwlinks.checked = (opennsfwlinks == "true");
	input_tabslimit.value = tabslimit;
	input_keyboardshortcut.value = keyboardshortcut;
}

function clickHandler(e) {
	setTimeout(save_options, 0);
}

document.querySelector("form").addEventListener("submit", save_options);
document.addEventListener('DOMContentLoaded', function () {
	restore_options();
});