// Example server call: http://172.81.178.14:8080/na/rndminternetman/

function main() {
    // Get the standardized summoner name, which has spaces removed and is lowercase.
    var summonerName = document.getElementById('summonerName').value.replace(/\s+/g, '').toLowerCase();
    var region = document.getElementById('region').value;
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onload = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            championMasteryLevels = JSON.parse(xmlHttp.responseText);
            for (var i = 0; i < championNames.length; ++i) {
                if (!championMasteryLevels[championNames[i]]) {
                    championMasteryLevels[championNames[i]] = 0;
                }
            }
            window.masteries = championMasteryLevels;
            songBuilder.buildAndPlay();
        }
    }
    xmlHttp.onerror = function() {
        alert('Something disasterous has occured, terribly sorry about that.');
    }
    xmlHttp.open('GET', 'http://172.81.178.14:8080/' + region + '/' + summonerName, true);
    xmlHttp.send(null);
}