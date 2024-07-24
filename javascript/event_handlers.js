// Create a variable to track if the code has been run yet
var rsen_init = false;

// Icon
var rsen_extra_networks_symbol = '🎴';

// Keep track of toggle state
var rsen_toggleState = false;

var rsen_lastTxt2imgTabButton;
var rsen_lastImg2imgTabButton;

var rsen_lastGenerationTabGridTemplateTxt2img = {
  saved: "1fr 16px 1fr"
}
var rsen_lastGenerationTabGridTemplateImg2img = {
  saved: "1fr 16px 1fr"
};

// This function is automatically called by automatic1111 when the UI is loaded
onUiLoaded(function() {
  // This code should only be run once, so if init is true dont do anything. Init is set after we complete this the first time.
  if(!rsen_init) {
    // Get all the elements you are interested in and put them into an object to make the later code a bit cleaner
    let settingsObjects = [
      { // Text2Image elements
        tools: document.getElementById('txt2img_tools'),
        last_button:  document.getElementById('txt2img_style_apply'),
        generation_tab: document.getElementById('txt2img_settings').parentNode.parentNode,
        generation_tab_att_id: 'txt2img_generation_tab',
        new_id: 'txt2img_toggle_extra'
      },
      { // Image2Image elements
        tools: document.getElementById('img2img_tools'),
        last_button:  document.getElementById('deepbooru'),
        generation_tab: document.getElementById('img2img_settings').parentNode.parentNode,
        generation_tab_att_id: 'img2img_generation_tab',
        new_id: 'img2img_toggle_extra'
      }
    ];
    if(typeof settingsObjects[0].last_button != "undefined" && typeof settingsObjects[1].last_button != "undefined") {
      // Loop through each object in the array we created earlier
      settingsObjects.forEach(obj => {
        // Do init code
        let newButton = obj.last_button.cloneNode(false); // Duplicate the last_button
        newButton.id = obj.new_id; // Change the id to new_id
        newButton.title = "Toggle Extra Networks."; // Change the title
        newButton.innerHTML = rsen_extra_networks_symbol; // Change the innerHTML

        obj.last_button.parentNode.insertBefore(newButton, obj.last_button.nextSibling); // Insert the new button after the last_button

        newButton.onclick = () => rsen_toggleExtraNetworks(); // Add new click event

        // Set an id for the inner generation tab div and parent div
				obj.generation_tab.setAttribute("sd-enr-id", obj.generation_tab_att_id);
				obj.generation_tab.parentNode.setAttribute("sd-enr-id", obj.generation_tab_att_id + "_parent");
      });
      
      // Now that we are done, set init to true so that it doesn't run more than once
      rsen_init = true;
    }
  }
});

function getText_ExtraNetworksSidePanel(text) {
    let tl = getTranslation(text);
    return tl !== undefined ? tl.trim() : text.trim();
}

function rsen_toggleExtraNetworks() {
	// Get all the elements you are interested in and put them into an object to make the later code a bit cleaner
	let settingsObjects = [
		{ // Text2Image elements
			all_tabs: document.getElementById('txt2img_extra_tabs'),
			generation_tab_parent: document.querySelector('[sd-enr-id="txt2img_generation_tab_parent"]'),
			generation_tab: document.querySelector('[sd-enr-id="txt2img_generation_tab"]'),
			generation_tab_resize: document.getElementById('txt2img_generation_tab_resize'),
			generation_tab_resize_id: 'txt2img_generation_tab_resize',
			tab_nav: document.querySelector('#txt2img_extra_tabs > .tab-nav'),
      lastTabButton: rsen_lastTxt2imgTabButton,
      lastGridTemplate: rsen_lastGenerationTabGridTemplateTxt2img
		},
		{ // Image2Image elements
			all_tabs: document.getElementById('img2img_extra_tabs'),
			generation_tab_parent: document.querySelector('[sd-enr-id="img2img_generation_tab_parent"]'),
			generation_tab: document.querySelector('[sd-enr-id="img2img_generation_tab"]'),
			generation_tab_resize: document.getElementById('img2img_generation_tab_resize'),
			generation_tab_resize_id: 'img2img_generation_tab_resize',
			tab_nav: document.querySelector('#img2img_extra_tabs > .tab-nav'),
      lastTabButton: rsen_lastImg2imgTabButton,
      lastGridTemplate: rsen_lastGenerationTabGridTemplateImg2img
		}
	];

	if (typeof settingsObjects[0].generation_tab != "undefined" && typeof settingsObjects[1].generation_tab != "undefined") {
		// Loop through each object in the array we created earlier
		settingsObjects.forEach(obj => {
			// Find the tab buttons with the text for the default tab and "Generation" tab
      let tabButtons = Array.from(obj.tab_nav.querySelectorAll('button'))
			let defaultTabButton = tabButtons.find(button => button.innerHTML.trim() === getText_ExtraNetworksSidePanel(opts.extra_networks_side_panel_default_tab));
			let generationButton = tabButtons.find(button => button.innerHTML.trim() === getText_ExtraNetworksSidePanel("Generation"));
      
			let lastTabButton;
      if (typeof obj.lastTabButton !== "undefined") {
        lastTabButton = Array.from(obj.tab_nav.querySelectorAll('button')).find(button => button.innerHTML.trim() === obj.lastTabButton.innerHTML.trim());
      }

			if (generationButton) {
				if (!rsen_toggleState) {
          if (defaultTabButton && typeof lastTabButton === "undefined") {
					  // Click the default tab button
					  defaultTabButton.click();
          } else {
            // Switch to the last tab open
            lastTabButton.click();
          }

          obj.all_tabs.parentNode.setAttribute("restore-separate-extra-network","");

					// Move the generation_tab node to be before the all_tabs node
					obj.all_tabs.parentNode.insertBefore(obj.generation_tab, obj.all_tabs);

          let resizeDiv = document.createElement('div');
          resizeDiv.setAttribute('id', obj.generation_tab_resize_id);

					obj.all_tabs.parentNode.insertBefore(resizeDiv, obj.all_tabs);

          // on mouse down (drag start)
          resizeDiv.onmousedown = function dragMouseDown(e) {
            // get position of mouse
            let dragX = e.clientX;
            // register a mouse move listener if mouse is down
            document.onmousemove = function onMouseMove(e) {
              // e.clientX will be the position of the mouse as it has moved a bit now
              let newWidth = obj.generation_tab.offsetWidth + e.clientX - dragX;
              let maxWidth = obj.all_tabs.parentNode.offsetWidth - 400;
              
              if (newWidth > 200 && newWidth < maxWidth) {
                // offsetWidth is the width of the block-1
                obj.generation_tab.style.width = newWidth  + "px";
                // update variable - till this pos, mouse movement has been handled
                dragX = e.clientX;
              }
            }
            // remove mouse-move listener on mouse-up (drag is finished now)
            document.onmouseup = () => document.onmousemove = document.onmouseup = null;
          }

          // Find the index of the generationButton within its parent node
					let generationButtonIndex = Array.from(obj.tab_nav.children).indexOf(generationButton) + 1;

					// Hide the "Generation" tab button
					obj.tab_nav.setAttribute("important-hide", generationButtonIndex.toString());

          // Allow the generation tab to be resized horizontally
          obj.generation_tab.style.overflowX = 'auto';
          obj.generation_tab.style.width = '';
          obj.generation_tab.style.paddingTop = '10px';

          // Reset the grid columns for the generation tab incase user made the columns too large
          if(obj.generation_tab.firstElementChild) {
            let tempVal = obj.generation_tab.firstElementChild.style.gridTemplateColumns;
            obj.generation_tab.firstElementChild.style.gridTemplateColumns = obj.lastGridTemplate.saved;
            obj.lastGridTemplate.saved = tempVal;
          }
				} else {
					// Show the "Generation" button
					obj.tab_nav.removeAttribute("important-hide");

          obj.all_tabs.parentNode.removeAttribute("restore-separate-extra-network","");

					// Move the generation_tab node back to its parent
					obj.generation_tab_parent.appendChild(obj.generation_tab);

          // Allow the generation tab to be resized horizontally
          obj.generation_tab.style.overflowX = '';
          obj.generation_tab.style.width = '';
          obj.generation_tab.style.paddingTop = '';

          obj.generation_tab_resize.remove();

          // Restore the grid columns for the generation tab incase user made the columns
          if(obj.generation_tab.firstElementChild) {
            let tempVal = obj.generation_tab.firstElementChild.style.gridTemplateColumns;
            obj.generation_tab.firstElementChild.style.gridTemplateColumns = obj.lastGridTemplate.saved;
            obj.lastGridTemplate.saved = tempVal;
          }

					// Click the "Generation" tab button
					generationButton.click();
				}
			}
		});
		// Toggle the state
		rsen_toggleState = !rsen_toggleState;
	}
}

onUiUpdate(function(args) {
  const lastTxt2imgTabButton = document.querySelector("#txt2img_extra_tabs > .tab-nav > .selected");
  const lastImg2imgTabButton = document.querySelector("#img2img_extra_tabs > .tab-nav > .selected");
  // onUiUpdate runs between localization so you have to check for both english and localized versions of the text
  let generationText = ["Generation", getText_ExtraNetworksSidePanel("Generation")];
  if(lastTxt2imgTabButton != null && typeof lastTxt2imgTabButton !== "undefined" && !generationText.includes(lastTxt2imgTabButton.innerHTML.trim())) {
    rsen_lastTxt2imgTabButton = lastTxt2imgTabButton;
  }
  if(lastImg2imgTabButton != null && typeof lastImg2imgTabButton !== "undefined" && !generationText.includes(lastImg2imgTabButton.innerHTML.trim())) {
    rsen_lastImg2imgTabButton = lastImg2imgTabButton;
  }
});