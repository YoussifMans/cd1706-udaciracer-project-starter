// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	track_name: undefined,
	player_id: undefined,
	player_name: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	console.log("Getting form info for dropdowns!")
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
			store.track_id = target.id
			store.track_name = target.innerHTML
		}

		// Racer form field
		if (target.matches('.card.racer')) {
			handleSelectRacer(target)
			store.player_id = target.id
			store.player_name = target.innerHTML
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

		console.log("Store updated :: ", store)
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}

// ^ PROVIDED CODE ^ DO NOT REMOVE

// BELOW THIS LINE IS CODE WHERE STUDENT EDITS ARE NEEDED ----------------------------
// TIP: Do a full file search for TODO to find everything that needs to be done for the game to work

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
    console.log("Creating race...");

    // Render starting UI
    renderAt("#race", renderRaceStartView(store.track_name));

    // Ensure IDs are correctly extracted
    const { player_id, track_id } = store;

    if (!player_id || !track_id) {
        console.error("Player ID or Track ID is missing!");
        return;
    }

    try {
        // Create the race
        const race = await createRace(player_id, track_id);
        
        if (!race || !race.ID) {
            console.error("Race creation failed, response:", race);
            return;
        }

        // Store the race ID
        store.race_id = race.ID;

        console.log("Race created:", race);

        // Start countdown
        await runCountdown();

        // Start race
        await startRace(store.race_id);

        // Run race
        await runRace(store.race_id);
    } catch (error) {
        console.error("Error in handleCreateRace:", error);
    }
}

async function runRace(raceID) {
	return new Promise((resolve) => {
        const raceInterval = setInterval(async () => {
            try {
                const res = await getRace(raceID);

                if (!res) {
                    console.error("Race fetch failed!");
                    return;
                }

                if (res.status === "in-progress") {
                    renderAt("#leaderBoard", raceProgress(res.positions));
                }

                if (res.status === "finished") {
                    clearInterval(raceInterval);
                    renderAt("#race", resultsView(res.positions));
                    resolve(res);
                }
            } catch (error) {
                console.error("Error in runRace:", error);
            }
        }, 500);
    });
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const countdownInterval = setInterval(() => {
			// run this DOM manipulation inside the set interval to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer

				if (timer == 0) {
					clearInterval(countdownInterval)
					resolve()
				}
			}, 1000)
			// TODO - when the setInterval timer hits 0, clear the interval, resolve the promise, and return

		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectRacer(target) {
	console.log("selected a racer", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')
}

function handleSelectTrack(target) {
	console.log("selected track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')	
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id)

	/*

	HELP IDK WHAT IM SUPPOSED TO DO HERE!!!
	
	 */

}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	// OPTIONAL: There is more data given about the race cars than we use in the game, if you want to factor in top speed, acceleration, 
	// and handling to the various vehicles, it is already provided by the API!
	return `<h4 class="card racer" id="${id}">${driver_name}</h3>`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `<h4 id="${id}" class="card track">${name}</h4>`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id)) // ✅ Define `userPlayer`
    if (userPlayer) {
        userPlayer.driver_name += " (you)"
    }

    let count = 1
  
    const results = positions.map(p => {
		return `
			<tr>
 				<td>
                    <h3>${count++} - ${p.driver_name}</h3>
                </td>
            </tr>
        `
    })

   return `
		<header>
			<h1>Race Results</h1>
    	</header>
    	<main>
    		<h3>Race Results</h3>
       		 <p>The race is done! Here are the final results:</p>
       	 	${results.join('')}
        	<a href="/race">Start a new race</a>
    	</main>
    `
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<table>
			${results.join('')}
		</table>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:3001'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	console.log(`calling server :: ${SERVER}/api/tracks`)
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
	.then(res => res.json())
	.catch(err => console.error('getTracks fetch returned error::', err))
	// TODO: Fetch tracks
	// TIP: Don't forget a catch statement!
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
	.then(res => res.json())
	.catch(err => console.error("getRacers fetch returned error::", err))
	// TODO: Fetch racers
	// TIP: Do a file search for "TODO" to make sure you find all the things you need to do! There are even some vscode plugins that will highlight todos for you
}

function createRace(player_id, track_id) {
	const body = { player_id: parseInt(player_id), track_id: parseInt(track_id) };

    return fetch(`${SERVER}/api/races`, {
        method: "POST",
        ...defaultFetchOpts(),
        body: JSON.stringify(body),
    })
    .then((res) => res.json())
    .then((data) => {
        console.log("createRace response:", data);
        return data;
    })
    .catch((err) => {
        console.error("Problem with createRace request:", err);
    });
}
/*
function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`, {...defaultFetchOpts()})
	.then((res) => res.text())
	.catch((err) => console.error("getRace fetch returned error::", err))
}
*/

async function getRace(id) {
	try {
        let response = await fetch(`${SERVER}/api/races/${id}`);
        let data = await response.json();
        return data;
    } catch (err) {
        console.error("getRace fetch returned error:", err);
    }
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.log("Problem with getRace request::", err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
	.catch(err => console.error("accelerate post returned error::", err))
}
