const fs = require('fs');
const path = require('path');

module.exports = function TeraTitles(dispatch) {
	
	const { UI } = (() => {
		try {
			return dispatch;
		} catch (e) {
			console.warn('[titles] ui module not found. UI functionality will be unavailable.');
		}
	})();
	
	const { command } = dispatch;
	
	let gameId, name, currentTitle;
	let playerTitles = {};
	
	try { playerTitles = require('./player.json'); }
    catch (e) {
        playerTitles = {};
        saveTitles();
    }

	// UI WILL BE FIXED SOON FOR NOW USED IDs FROM titles.json

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
	
	dispatch.hook('S_LOGIN', 14, (event) => { 
		({ gameId, name } = event);
		
		if(playerTitles[name])
			event.title = playerTitles[name];

		currentTitle = event.title;
		return true;
	});
	
	// REMEMBER TO MOVE .map and .def FILES -> TOOLBOX -> DATA TY

	dispatch.hook('C_APPLY_TITLE', 1, event => {
		playerTitles[name] = undefined;
		saveTitles();
		currentTitle = event.id;
	});
	
	command.add('title', (arg) => {
		if(arg) {
			let title = parseInt(arg);
			dispatch.send('S_APPLY_TITLE', 3, { gameId, title });
			playerTitles[name] = title;
			saveTitles();
			currentTitle = title;
			command.message(' Title changed to ID: ' + title);
		} else if(UI) {
			dispatch.ui.open('/titles/');
		} else {
			command.message(' UI unavailable. Title ID required.');
		}
	});
	
	function saveTitles() {
		fs.writeFile(path.join(__dirname, 'player.json'), JSON.stringify(playerTitles, null, 4), (err) => {
			if(err) console.warn(err);
		});
	}
}