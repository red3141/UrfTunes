# UrfTunes

Created for the Riot Games API Challenge in April/May 2016

Urf Tunes uses your Champion Mastery levels to procedurally generate a song. 

Our project was inspired by the fact that there are over 1.4 * 10^101 different combinations of Champion Mastery levels, so pretty much every active summoner will have a unique "fingerprint" of levels. We thought of how that "fingerprint" could be represented, and eventually settled on music, since music is a prevalent part of the League of Legends community. 

Of particular importance in our project is a set of "instruments" that produce a sound created by combining harmonics with strengths determined by the Mastery levels of specific champions. Not only does this produce a unique sound for each summoner, it also causes the Champion Mastery level data to be displayed when the sound is passed through the visualizer. 

Link to the demo: http://red3141.github.io/UrfTunes/

Additional documentation and discussion of the project can be found on the demo page.

## Making changes to the project

Please feel free to take our code and play around with it! Here's a guide to what's in each file:
- server/
  - server.py
    - Probably unsurprisingly, this is where the server code is.
  - key.py
    - This isn't checked into the repository, but if you want to run your own server, you'll need to put your Riot API key in this file.
- www/
  - css/
    - main.css
      - Defines the styles for the elements of the web page.
  - img/
    - All the images used in the web page are stored here.
  - json/
    - We saved a few sets of Champion Mastery data in this folder to be used as a fallback in case our server is down or an error occurs.
  - championNames.js
    - This is just an array of the names of the champions in League of Legends. We use these names to index into the Champion Mastery data so it's easy to find which champions affect which part of the song.
  - commonFunctions.js
    - Contains a couple of general utility functions.
  - index.html
    - The layout of the web page is defined in this file.
  - instruments.js
    - The waveforms, sound envelopes, etc. for every instrument used in the song are defined here.
  - main.js
    - The code that gets the Champion Mastery data from our server is here. If you set up your own server, you'll need to change the URL in the loadSummoner() function in this file.
  - markovChain.js
    - Contains the functionality for building Markov chains.
  - rules.js
    - The rules for the Markov chains are defined in this file.
  - seedrandom.min.js
    - The seedable pseudorandom number generator library we used (link: https://github.com/davidbau/seedrandom).
  - songBuilder.js
    - The code that takes all the Markov chains, rules, instruments, and Champion Mastery data and turns it into a song.
  - visualization.js
    - The appearance of the visualizer is controlled by the code in this file.
  - WebAudioRecorder.min.js
    - The library we used to record the generated songs and make them available for download (link: https://github.com/higuma/web-audio-recorder-js).
  - WebAudioRecorderWav.min.js
    - From the WebAudioRecorder.js library, this is the .wav file writer.

## How to run our project on your own server

First, copy the server.py file into a directory on your server. If you like, change the port number from 8080.

Next, create a key.txt file in the same directory on your server, and paste your Riot API key into that file.

After that, run `python server.py` from the same directory on your server.

Next, change the URL in the loadSummoner() function in www/main.js to point to your server.

Open index.html in a browser, and you should have a working copy of Urf Tunes!

## Good luck, have fun!

If you make something awesome based on our code, we'd love to hear about it!
