'use strict';

// Globals
///////////////////

var github = new Octokat();

var repos = [
    [ "Oblivion", "oblivion" ],
    [ "Skyrim", "skyrim" ],
    [ "Fallout 3", "fallout3" ],
    [ "Fallout: New Vegas", "falloutnv" ],
    [ "Fallout 4", "fallout4" ]
]

var repoBranch = 'master';  //The repository branch to search.

var gameSelect = document.getElementById('gameSelectMenu');
var gameButton = document.getElementById(gameSelect.getAttribute('for'));
var searchButton = document.getElementById('searchButton');
var searchBox = document.getElementById('searchBox');
var resultsDiv = document.getElementById('results');

// Functions
///////////////////

function isRegexEntry(name) {
    var end = name.substring(name.length - 5).toLowerCase();
    if (end == '\\.esp' || end == '\\.esm') {
        return true;
    }
}

function readMasterlist(err, data) {
    if (err) {
        console.log(err);
        document.getElementById('progress').classList.add('hidden');
        return;
    }

    var masterlist = jsyaml.safeLoad(data);
    document.getElementById('progress').classList.add('hidden');

    /* Do search here. */
    console.log("Starting search.");
    if (masterlist.hasOwnProperty('plugins')) {
        for (var i in masterlist['plugins']) {
            var index = -1;
            if (isRegexEntry(masterlist["plugins"][i].name)) {
                if (RegExp(masterlist["plugins"][i].name, 'i').test(searchBox.value)) {
                    index = i;
                }
            } else if (masterlist["plugins"][i].name.toLowerCase().indexOf(searchBox.value.toLowerCase()) !== -1) {
                index = i;
            }
            if (index != -1) {
                console.log("Match: " + JSON.stringify(masterlist["plugins"][index]));
                var code = document.createElement('code');
                code.className = 'loot-search-result';
                code.textContent = '  - ' + jsyaml.safeDump(masterlist["plugins"][index]).replace(new RegExp('\n', 'g'), '\n    ').trim();
                resultsDiv.appendChild(code);
            }
        }
    }

    if (resultsDiv.children.length == 0) {
        var elem = document.createElement('code');
        elem.className = 'loot-search-result';
        elem.textContent = "No matching entries found.";
        resultsDiv.appendChild(elem);
    }

    console.log("Search complete.");
}

function onSearchInit(evt) {
    github.repos('loot', gameButton.getAttribute('data-selected')).contents('masterlist.yaml').read(readMasterlist);

    /* Clear any previous search results. */
    while (resultsDiv.children.length > 0) {
        resultsDiv.removeChild(resultsDiv.firstElementChild);
    }

    console.log("Loading masterlist...");
    progress.classList.remove('hidden');
}

function onGameSelect(evt) {
    gameButton.textContent = evt.target.textContent;
    gameButton.setAttribute('data-selected', evt.target.getAttribute('data-game'));
}

// Startup Code
///////////////////

/* Fill the drop-down games box with stuff. */
for (var i=0; i < repos.length; ++i) {
    var option = document.createElement('li');
    option.className = 'mdl-menu__item';
    option.textContent = repos[i][0];
    option.setAttribute('data-game', repos[i][1]);
    gameSelect.appendChild(option);
    option.addEventListener('click', onGameSelect, false);
}
gameSelect.firstElementChild.click();

searchButton.addEventListener("click", onSearchInit, false);
searchBox.addEventListener('change', onSearchInit, false);

/* If the page was loaded with a PHP-style GET string `?game=<game>&search=<search>`, read it for the search term and perform a search. */
var pos = document.URL.indexOf("?game=");
if (pos != -1) {
    var pos2 = document.URL.indexOf("&search=");
    searchBox.value = decodeURIComponent(document.URL.substring(pos2+8));
    var game = decodeURIComponent(document.URL.substring(pos+6, pos2).toLowerCase());
    if (game == "oblivion") {
        gameButton.setAttribute('data-selected', repos[0][1]);
    } else if (game == "skyrim") {
        gameButton.setAttribute('data-selected', repos[1][1]);
    } else if (game == "fallout3") {
        gameButton.setAttribute('data-selected', repos[2][1]);
    } else if (game == "falloutnv") {
        gameButton.setAttribute('data-selected', repos[3][1]);
    } else {
        gameButton.setAttribute('data-selected', repos[0][1]);
    }

    searchButton.click();
} else {
    gameButton.setAttribute('data-selected', repos[0][1]);
}
