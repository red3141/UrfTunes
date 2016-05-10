var visualization = (function() {

    var currentChampionSet = -1;

    // Displays a set of champion portraits below the visualizer (n = 0-4)
    function displayChampionSet(n) {
        if (n === currentChampionSet)
            return;
        currentChampionSet = n;
        for (var i = 0; i < 5; ++i)
            $('#champions' + i)
                .toggle(i === n)
                .css('visibility', 'visible');
    }

    // Hides the champion portraits
    function clearChampionSet() {
        currentChampionSet = -1;
        $('#champions0')
            .css('visibility', 'hidden')
            .show();
        for (var i = 1; i < 5; ++i)
            $('#champions' + i).hide();
    }

    var isVisualizationStopped = true;

    function updateCanvasSize() {
        var canvas = document.getElementById('visualizationArea');
        canvas.width = 0;
        canvas.width = Math.max(512, $(document).width());
    }
    
    // Starts or resumes the visualization
    function start(analyzer) {
        isVisualizationStopped = false;
        var canvas = document.getElementById('visualizationArea');
        var canvasContext = canvas.getContext('2d');
        updateCanvasSize();
        $(window).off('resize', updateCanvasSize);
        $(window).on('resize', updateCanvasSize);
        
        var height = canvas.height;
        analyzer.fftSize = 1024;
        var bufferLength = analyzer.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);

        var draw = function() {
        
            analyzer.getByteFrequencyData(dataArray);
            
            var width = canvas.width;
            canvasContext.clearRect(0, 0, width, height);
            
            var barWidth = (width / bufferLength);
            var barHeight;
            var x = 0;
            
            for (var i = 0; i < bufferLength; ++i) {
                barHeight = dataArray[i];
                
                canvasContext.fillStyle = 'rgb(0,' + barHeight + ',' + (255 - barHeight) + ')';
                canvasContext.fillRect(x, height-barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
            
            if (!isVisualizationStopped)
                window.requestAnimationFrame(draw);
        };
        
        draw();
    }

    // Stops or pauses the visualization to free up resources
    function stop() {
        $(window).off('resize', updateCanvasSize);
        isVisualizationStopped = true;
    }
    
    return {
        start: start,
        stop: stop,
        displayChampionSet: displayChampionSet,
        clearChampionSet: clearChampionSet,
    }
})();
