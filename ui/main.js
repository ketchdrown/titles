var target;

function xhr(req, callback) {
	var x = new XMLHttpRequest();
	x.open("GET", "api/" + req, true);
	x.onload = callback;
	x.send();
}

function loadTitleList() {
	var titles = JSON.parse(this.responseText);
	list.add(titles.titles);
	
	var children = list.list.children;
	for(var i = 0; i < children.length; i++) {
		if(Number(children[i].getAttribute("data-id")) === titles.currentTitle) {
			children[i].className = "checked";
			target = children[i];
			return;
		}
	}
}

function listClickHandler(e) {
	if(target && target.className === "checked") target.className = "";
	target = e.target;
	if(!target.getAttribute("data-id")) target = target.parentNode;
	xhr('title;' + target.getAttribute("data-id"), listClickHandleResponse);
}

function listClickHandleResponse() {
	var res = JSON.parse(this.responseText);
	if(res && res.ok === 1) {
		target.className = "checked";
	}
}

function init() {
	var options = {
		valueNames: ['title', { data: ['id'] }],
		item: '<li><span class="title"></span></li>'
	};

	list = new List('title-list', options);
	xhr('load', loadTitleList);
	list.list.addEventListener('click', listClickHandler, true);
}

window.addEventListener('error', function(e) {
	_tera_client_proxy_.alert('Error: ' + e.message);
});

window.onload = function() {
	_tera_client_proxy_.resize_to(400, 800);
	_tera_client_proxy_.set_title('Titles');
	init();
};