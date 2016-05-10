// Example server call: http://172.81.178.14:8080/na/rndminternetman/
(function() {
    function parseSearch(search) {
        // Try to parse parameters in the query string.
        var args = {};
        if (!search)
            return args;
        // Sometimes a '/' gets added to the end of the query string - if so, remove it.
        var search = location.search.trim();
        if (search && search.lastIndexOf('/') === search.length - 1)
            search = search.substring(0, search.length - 1);
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
    
    function updateShareButton() {
        var host = 'red3141.github.io/UrfTunes';
        var href = 'http://red3141.github.io/UrfTunes/' + location.search;
        $('.fb-share-button').attr('data-href', href);
        $('.fb-share-button iframe').attr('src',
            location.protocol + "//www.facebook.com/v2.3/plugins/share_button.php?app_id=&channel=http%3A%2F%2Fstatic.ak.facebook.com%2Fconnect%2Fxd_arbiter%2FKvoNGODIqPG.js%3Fversion%3D41%23cb%3Df29bfbb228%26domain%3D"
            + location.host + "%26origin%3D" + encodeURIComponent(encodeURIComponent(location.protocol)) + "%252F%252F" + host + "%252Ff2b736fc34%26relation%3Dparent.parent&container_width=191&href="
            + encodeURIComponent(href) + "&layout=button&locale=en_US&sdk=joey");
    }
    
    // Update the current song when the user presses the back button
    $(window).on('popstate', function(e) {
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
        updateShareButton();
    });
    
    $(document).ready(function() {
        $('#summonerName').focus();
        
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
        // Only Chome and Opera have full support of the Web Audio API. 
        // Most other browsers don't support suspend/resume/close. FireFox just makes the songs sound really bad.
        if (navigator.userAgent.indexOf('Chrome') === -1 || navigator.userAgent.indexOf('Edge') !== -1) {
            $('#browserErrorMessage').show();
        }
        
        $('#summonerForm').submit(function(e) {
            loadSummoner($('#summonerName').val(), $('#region').val(), true, true);
            e.preventDefault();
            return false;
        });
        updateShareButton();
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
        
        var summonerNotFound = false;
        $('#notFoundErrorMessage').hide();
        $('#serverDownErrorMessage').hide();
        $.ajax({
            url: 'http://172.81.178.14:8080/' + region + '/' + normalizedSummonerName,
            dataType: 'json'
        }).then(null, function(response) {
            // If the request failed, maybe the server is down. Try to get pre-cached data.
            summonerNotFound = response && response.readyState === 4 && response.status === 404;
            return $.ajax({
                url: 'json/' + normalizedSummonerName + '-' + region + ".json",
                dataType: 'json'
            });
        }).then(function(championMasteryLevels) {
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
            $('.social-media-buttons').show();
            $('#notFoundErrorMessage').hide();
            $('#serverDownErrorMessage').hide();
            $('#play').prop('disabled', false);
            $('#stop').prop('disabled', false);

            localStorage.setItem("summoner", summonerName);
            localStorage.setItem("region", region);
            if (pushState) {
                history.pushState(null, summonerName, '?summoner=' + encodeURIComponent(summonerName) + '&region=' + encodeURIComponent(region));
                updateShareButton();
            }
        }, function(response) {
            $('#play').prop('disabled', true);
            $('#stop').prop('disabled', true);
            $('#playbackButtons').css('visibility', 'hidden');
            $('.social-media-buttons').hide();
            $('#errorMessage').show();
            if (summonerNotFound)
                $('#notFoundErrorMessage').show();
            else
                $('#serverDownErrorMessage').show();
        });
    }
})();