// Example server call: http://172.81.178.14:8080/na/rndminternetman/
(function() {
    function parseSearch(search) {
        var args = {};
        if (!search)
            return args;
        if (search.indexOf('?') === 0)
            search = search.substr(1);
        var items = search.split('&');
        for (var i = 0; i < items.length; ++i) {
            var split = items[i].split('=');
            if (split.length !== 2)
                continue;
            var name = split[0];
            var value = split[1];
            args[name] = decodeURIComponent(value);
        }
        return args;
    }
    
    $(window).on('popstate', function(e) {
        // Try to parse parameters in the query string.
        // Sometimes a '/' gets added to the end of the query string - if so, remove it.
        var search = location.search.trim();
        if (search && search.lastIndexOf('/') === search.length - 1)
            search = search.substring(0, search.length - 1);
            
        var args = parseSearch(search);
        if (args.summoner) {
            songBuilder.stop();
            args.region = args.region || 'na';
            $('#summonerName').val(args.summoner);
            $('#region').val(args.region);
            loadSummoner(args.summoner, args.region, false, false);
        } else {
            $('#summonerName').focus();
        }
    });
    
    $(document).ready(function() {
        var args = parseSearch(location.search);
        if (args.summoner) {
            args.region = args.region || 'na';
            $('#summonerName').val(args.summoner);
            $('#region').val(args.region);
            loadSummoner(args.summoner, args.region, false, false);
        } else {
            var summoner = localStorage.getItem("summoner");
            var region = localStorage.getItem("region") || "na";
            if (summoner) {
                $('#summonerName').val(summoner);
                $('#region').val(region);
                loadSummoner(summoner, region, false, false);
                history.replaceState(null, summonerName, '?summoner=' + encodeURIComponent(summoner) + '&region=' + encodeURIComponent(region));
            } else {
                $('#summonerName').focus();
            }
        }
        
        $("#summonerForm").submit(function(e) {
            loadSummoner($('#summonerName').val(), $('#region').val(), true, true);
            e.preventDefault();
            return false;
        });
    });
    
    function setChampionIconOpacities() {
        for (var i = 0; i < championNames.length; ++i) {
            $('#' + championNames[i]).css('opacity', 0.05 + 0.19 * window.masteries[championNames[i]]);
        }
    }

    function loadSummoner(summonerName, region, playOnLoad, pushState) {
        if (!summonerName) {
            $('#summonerName').focus();
            return;
        }
        songBuilder.stop();

        // Get the standardized summoner name, which has spaces removed and is lowercase.
        normalizedSummonerName = summonerName.replace(/\s+/g, '').toLowerCase();
        
        var connectionSucceeded = false;
        $.ajax({
            url: 'http://172.81.178.14:8080/' + region + '/' + normalizedSummonerName,
            dataType: 'json'
        }).then(null, function(response) {
            // If the request failed, maybe the server is down. Try to get pre-cached data.
            connectionSucceeded = response && response.readyState === 4;
            return $.ajax({
                url: 'json/' + normalizedSummonerName + '-' + region + ".json",
                dataType: 'json'
            });
        }).then(function(championMasteryLevels) {
            connectionSucceeded = true;
            for (var i = 0; i < championNames.length; ++i) {
                if (!championMasteryLevels[championNames[i]]) {
                    championMasteryLevels[championNames[i]] = 0;
                }
            }
            window.masteries = championMasteryLevels;
            setChampionIconOpacities();
            songBuilder.build();
            if (playOnLoad)
                songBuilder.play();
            $('#playbackButtons').css('visibility', 'visible');
            $('#errorMessage').hide();
            $('#play').prop('disabled', false);
            $('#stop').prop('disabled', false);

            localStorage.setItem("summoner", summonerName);
            localStorage.setItem("region", region);
            if (pushState)
                history.pushState(null, summonerName, '?summoner=' + encodeURIComponent(summonerName) + '&region=' + encodeURIComponent(region));
        }, function(response) {
            $('#play').prop('disabled', true);
            $('#stop').prop('disabled', true);
            $('#playbackButtons').css('visibility', 'hidden');
            $('#errorMessage').show();
            if (connectionSucceeded)
                $('#errorMessage').text('That summoner name was not found in the selected region. Check that the name is spelled correctly and that you are in the right region.');
            else
                $('#errorMessage').text('Oops! It looks like our server is down, so we can\'t get your data. Try checking out some of our suggested summoner songs.');
        });
    }
})();