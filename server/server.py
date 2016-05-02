import json
import time
import urllib2

from collections import OrderedDict
from threading import Lock

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from SocketServer import ThreadingMixIn

with open("key.txt") as f:
    key = f.read()

regionToLocationMap = {
    "br" : "br1",
    "eune" : "eun1",
    "euw" : "euw1",
    "jp" : "jp1",
    "kr" : "kr",
    "lan" : "la1",
    "las" : "la2",
    "na" : "na1",
    "oce" : "oc1",
    "ru" : "ru",
    "tr" : "tr1"
}

championIdToNameMap = {
    266 : "aatrox",
    103 : 'ahri',
    84 : 'akali',
    12 : 'alistar',
    32 : 'amumu',
    34 : 'anivia',
    1 : 'annie',
    22 : 'ashe',
    136 : 'aurelionsol',
    268 : 'azir',
    432 : 'bard',
    53 : 'blitzcrank',
    63 : 'brand',
    201 : 'braum',
    51 : 'caitlyn',
    69 : 'cassiopeia',
    31 : 'chogath',
    42 : 'corki',
    122 : 'darius',
    131 : 'diana',
    36 : 'drmundo',
    119 : 'draven',
    245 : 'ekko',
    60 : 'elise',
    28 : 'evelynn',
    81 : 'ezreal',
    9 : 'fiddlesticks',
    114 : 'fiora',
    105 : 'fizz',
    3 : 'galio',
    41 : 'gangplank',
    86 : 'garen',
    150 : 'gnar',
    79 : 'gragas',
    104 : 'graves',
    120 : 'hecarim',
    74 : 'heimerdinger',
    420 : 'illaoi',
    39 : 'irelia',
    40 : 'janna',
    59 : 'jarvaniv',
    24 : 'jax',
    126 : 'jayce',
    202 : 'jhin',
    222 : 'jinx',
    429 : 'kalista',
    43 : 'karma',
    30 : 'karthus',
    38 : 'kassadin',
    55 : 'katarina',
    10 : 'kayle',
    85 : 'kennen',
    121 : 'khazix',
    203 : 'kindred',
    96 : 'kogmaw',
    7 : 'leblanc',
    64 : 'leesin',
    89 : 'leona',
    127 : 'lissandra',
    236 : 'lucian',
    117 : 'lulu',
    99 : 'lux',
    54 : 'malphite',
    90 : 'malzahar',
    57 : 'maokai',
    11 : 'masteryi',
    21 : 'missfortune',
    82 : 'mordekaiser',
    25 : 'morgana',
    267 : 'nami',
    75 : 'nasus',
    111 : 'nautilus',
    76 : 'nidalee',
    56 : 'nocturne',
    20 : 'nunu',
    2 : 'olaf',
    61 : 'orianna',
    80 : 'pantheon',
    78 : 'poppy',
    133 : 'quinn',
    33 : 'rammus',
    421 : 'reksai',
    58 : 'renekton',
    107 : 'rengar',
    92 : 'riven',
    68 : 'rumble',
    13 : 'ryze',
    113 : 'sejuani',
    35 : 'shaco',
    98 : 'shen',
    102 : 'shyvana',
    27 : 'singed',
    14 : 'sion',
    15 : 'sivir',
    72 : 'skarner',
    37 : 'sona',
    16 : 'soraka',
    50 : 'swain',
    134 : 'syndra',
    223 : 'tahmkench',
    91 : 'talon',
    44 : 'taric',
    17 : 'teemo',
    412 : 'thresh',
    18 : 'tristana',
    48 : 'trundle',
    23 : 'tryndamere',
    4 : 'twistedfate',
    29 : 'twitch',
    77 : 'udyr',
    6 : 'urgot',
    110 : 'varus',
    67 : 'vayne',
    45 : 'veigar',
    161 : 'velkoz',
    254 : 'vi',
    112 : 'viktor',
    8 : 'vladimir',
    106 : 'volibear',
    19 : 'warwick',
    62 : 'wukong',
    101 : 'xerath',
    5 : 'xinzhao',
    157 : 'yasuo',
    83 : 'yorick',
    154 : 'zac',
    238 : 'zed',
    115 : 'ziggs',
    26 : 'zilean',
    143 : 'zyra'
}

# From https://docs.python.org/2/library/collections.html#collections.OrderedDict
class LastUpdatedOrderedDict(OrderedDict):
    'Store items in the order the keys were last added'
    maxSize = 1000

    def __setitem__(self, key, value):
        if key in self:
            del self[key]
        elif len(self) >= self.maxSize:
            # Remove the least recently used cached data
            OrderedDict.popitem(last=False)
        OrderedDict.__setitem__(self, key, value)

# This least-recently-used cache will store retrieved champion mastery levels in the form:
# (<region>, <standardizedSummonerName>) : (<masteryLevels, initialRetrievalTime>)
# If a summoner's data is requested and the data in the cache is over 24 hours old, it will be removed.
cache = LastUpdatedOrderedDict()
cacheLock = Lock()
MAX_CACHE_TIME = 24 * 60 * 60; # One day in seconds

# Based heavily on: http://stackoverflow.com/questions/14088294/multithreaded-web-server-in-python
class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        BaseHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        # Expects a path of the form /region/summonerName (possibly with a / on the end)
        pathArgs = self.path.strip('/').split('/')
        if len(pathArgs) != 2 or pathArgs[0] not in regionToLocationMap:
            # Error
            self.send_response(400)
            self.end_headers()
            return

        # Check if we already have the summoner's data stored
        region = pathArgs[0]
        standardizedSummonerName = self.__getStandardizedSummonerName(pathArgs[1])
        key = (region, standardizedSummonerName)
        with cacheLock:
            if key in cache:
                if time.time() - cache[key][1] > MAX_CACHE_TIME:
                    del cache[key]
                else:
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    json.dump(cache[key][0], self.wfile)
                    # Reassign the cached value to mark it as recently used
                    cache[key] = (cache[key][0], cache[key][1])
                    return

        try:
            print region, standardizedSummonerName
            masteryLevels = self.__getChampionMastery(region, self.__getSummonerId(region, standardizedSummonerName))

            # Cache the mastery levels
            with cacheLock:
                if key not in cache:
                    cache[key] = (masteryLevels, time.time())

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            json.dump(masteryLevels, self.wfile)
            return
        except urllib2.URLError:
            self.send_response(500)
            self.end_headers()
            return
        else:
            self.send_response(500)
            self.end_headers()
            return

    def __getStandardizedSummonerName(self, summonerName):
        return summonerName.replace(" ", "").lower()

    def __getSummonerId(self, region, standardizedSummonerName):
        f = urllib2.urlopen("https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.4/summoner/by-name/" +
            standardizedSummonerName + "?api_key=" + key)
        j = json.loads(f.read())
        return j[standardizedSummonerName]["id"]

    def __getChampionMastery(self, region, summonerId):
        f = urllib2.urlopen("https://" + region + ".api.pvp.net/championmastery/location/" + regionToLocationMap[region] +
            "/player/" + str(summonerId) + "/champions?api_key=" + key)
        j = json.loads(f.read())
        return {championIdToNameMap[x["championId"]] : x["championLevel"] for x in j}
        

class GetChampionMasteryLevelsServer(ThreadingMixIn, HTTPServer):
    pass

if __name__ == "__main__":
    server = GetChampionMasteryLevelsServer(("", 8080), Handler)
    server.serve_forever()
