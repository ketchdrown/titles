const fs = require('fs');
const path = require('path');
const Command = require('command');

const UI = (() => {
	try {
		return require('ui');
	} catch(e) {
		console.warn('[titles] ui module not found. UI functionality will be unavailable.');
	}
})();

module.exports = function TeraTitles(dispatch) {
	
	const command = new Command(dispatch);
	
	let gameId, name, currentTitle;
	
	try {
		playerTitles = require('./player.json');
	} catch(e) {
		playerTitles = {};
		saveTitles();
	}
	
	if(UI) {
		ui = UI(dispatch);
		ui.use('/titles/', UI.static(__dirname + '/ui'));
		
		ui.get('/titles/api/*', (req, res) => {
			let data = req.params[0].split(";");
			let request = data.shift();

			switch(request) {
				case "load": {
					const titles = {
						currentTitle,
						titles: require('./titles.json')
					};
					return res.status(200).json(titles);
				}
				case "title": {
					let title = parseInt(data[0]);
					dispatch.send('S_APPLY_TITLE', 2, { gameId, title });
					playerTitles[name] = title;
					saveTitles();
					currentTitle = title;
					return res.status(200).json({ ok: 1 });
				}
				default:
					return res.status(404).send("404");
			}
		});
	}
	
	dispatch.hook('S_LOGIN', 10, (event) => { 
		({ gameId, name } = event);
		
		if(playerTitles[name])
			event.title = playerTitles[name];

		currentTitle = event.title;
		return true;
	});
	
	dispatch.hook('C_APPLY_TITLE', 1, event => {
		playerTitles[name] = undefined;
		saveTitles();
		currentTitle = event.id;
	});
	
	command.add('title', (arg) => {
		if(arg) {
			let title = parseInt(arg);
			dispatch.send('S_APPLY_TITLE', 2, { gameId, title });
			playerTitles[name] = title;
			saveTitles();
			currentTitle = title;
			command.message('[titles] Title changed to ID: ' + title);
		} else if(UI) {
			ui.open('/titles/');
		} else {
			command.message('[titles] UI unavailable. Title ID required.');
		}
	});
	
	function saveTitles() {
		fs.writeFile(path.join(__dirname, 'player.json'), JSON.stringify(playerTitles, null, 4), (err) => {
			if(err) console.warn(err);
		});
	}
}