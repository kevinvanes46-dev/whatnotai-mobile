'use strict';

const EMBEDDED_DATA = {"version":"v77","pokedex":{"001":"Bulbasaur","002":"Ivysaur","003":"Venusaur","004":"Charmander","005":"Charmeleon","006":"Charizard","007":"Squirtle","008":"Wartortle","009":"Blastoise","010":"Caterpie","011":"Metapod","012":"Butterfree","013":"Weedle","014":"Kakuna","015":"Beedrill","016":"Pidgey","017":"Pidgeotto","018":"Pidgeot","019":"Rattata","020":"Raticate","021":"Spearow","022":"Fearow","023":"Ekans","024":"Arbok","025":"Pikachu","026":"Raichu","027":"Sandshrew","028":"Sandslash","029":"Nidoran Female","030":"Nidorina","031":"Nidoqueen","032":"Nidoran Male","033":"Nidorino","034":"Nidoking","035":"Clefairy","036":"Clefable","037":"Vulpix","038":"Ninetales","039":"Jigglypuff","040":"Wigglytuff","041":"Zubat","042":"Golbat","043":"Oddish","044":"Gloom","045":"Vileplume","046":"Paras","047":"Parasect","048":"Venonat","049":"Venomoth","050":"Diglett","051":"Dugtrio","052":"Meowth","053":"Persian","054":"Psyduck","055":"Golduck","056":"Mankey","057":"Primeape","058":"Growlithe","059":"Arcanine","060":"Poliwag","061":"Poliwhirl","062":"Poliwrath","063":"Abra","064":"Kadabra","065":"Alakazam","066":"Machop","067":"Machoke","068":"Machamp","069":"Bellsprout","070":"Weepinbell","071":"Victreebel","072":"Tentacool","073":"Tentacruel","074":"Geodude","075":"Graveler","076":"Golem","077":"Ponyta","078":"Rapidash","079":"Slowpoke","080":"Slowbro","081":"Magnemite","082":"Magneton","083":"Farfetch'd","084":"Doduo","085":"Dodrio","086":"Seel","087":"Dewgong","088":"Grimer","089":"Muk","090":"Shellder","091":"Cloyster","092":"Gastly","093":"Haunter","094":"Gengar","095":"Onix","096":"Drowzee","097":"Hypno","098":"Krabby","099":"Kingler","100":"Voltorb","101":"Electrode","102":"Exeggcute","103":"Exeggutor","104":"Cubone","105":"Marowak","106":"Hitmonlee","107":"Hitmonchan","108":"Lickitung","109":"Koffing","110":"Weezing","111":"Rhyhorn","112":"Rhydon","113":"Chansey","114":"Tangela","115":"Kangaskhan","116":"Horsea","117":"Seadra","118":"Goldeen","119":"Seaking","120":"Staryu","121":"Starmie","122":"Mr. Mime","123":"Scyther","124":"Jynx","125":"Electabuzz","126":"Magmar","127":"Pinsir","128":"Tauros","129":"Magikarp","130":"Gyarados","131":"Lapras","132":"Ditto","133":"Eevee","134":"Vaporeon","135":"Jolteon","136":"Flareon","137":"Porygon","138":"Omanyte","139":"Omastar","140":"Kabuto","141":"Kabutops","142":"Aerodactyl","143":"Snorlax","144":"Articuno","145":"Zapdos","146":"Moltres","147":"Dratini","148":"Dragonair","149":"Dragonite","150":"Mewtwo","151":"Mew","152":"Chikorita","153":"Bayleef","154":"Meganium","155":"Cyndaquil","156":"Quilava","157":"Typhlosion","158":"Totodile","159":"Croconaw","160":"Feraligatr","161":"Sentret","162":"Furret","163":"Hoothoot","164":"Noctowl","165":"Ledyba","166":"Ledian","167":"Spinarak","168":"Ariados","169":"Crobat","170":"Chinchou","171":"Lanturn","172":"Pichu","173":"Cleffa","174":"Igglybuff","175":"Togepi","176":"Togetic","177":"Natu","178":"Xatu","179":"Mareep","180":"Flaaffy","181":"Ampharos","182":"Bellossom","183":"Marill","184":"Azumarill","185":"Sudowoodo","186":"Politoed","187":"Hoppip","188":"Skiploom","189":"Jumpluff","190":"Aipom","191":"Sunkern","192":"Sunflora","193":"Yanma","194":"Wooper","195":"Quagsire","196":"Espeon","197":"Umbreon","198":"Murkrow","199":"Slowking","200":"Misdreavus","201":"Unown","202":"Wobbuffet","203":"Girafarig","204":"Pineco","205":"Forretress","206":"Dunsparce","207":"Gligar","208":"Steelix","209":"Snubbull","210":"Granbull","211":"Qwilfish","212":"Scizor","213":"Shuckle","214":"Heracross","215":"Sneasel","216":"Teddiursa","217":"Ursaring","218":"Slugma","219":"Magcargo","220":"Swinub","221":"Piloswine","222":"Corsola","223":"Remoraid","224":"Octillery","225":"Delibird","226":"Mantine","227":"Skarmory","228":"Houndour","229":"Houndoom","230":"Kingdra","231":"Phanpy","232":"Donphan","233":"Porygon2","234":"Stantler","235":"Smeargle","236":"Tyrogue","237":"Hitmontop","238":"Smoochum","239":"Elekid","240":"Magby","241":"Miltank","242":"Blissey","243":"Raikou","244":"Entei","245":"Suicune","246":"Larvitar","247":"Pupitar","248":"Tyranitar","249":"Lugia","250":"Ho-Oh","251":"Celebi"},"sets":{"BASE":{"label":"Base Set","code":"BS","aliases":["base set","base","bs","wotc base"]},"JUNGLE":{"label":"Jungle","code":"JU","aliases":["jungle","ju"]},"FOSSIL":{"label":"Fossil","code":"FO","aliases":["fossil","fossile","fo"]},"BASE SET 2":{"label":"Base Set 2","code":"B2","aliases":["base set 2","base 2","baseset2","b2"]},"ROCKET":{"label":"Team Rocket","code":"TR","aliases":["team rocket","rocket","tr"]},"GYM HEROES":{"label":"Gym Heroes","code":"GH","aliases":["gym heroes","gym hero","gh"]},"GYM CHALLENGE":{"label":"Gym Challenge","code":"GC","aliases":["gym challenge","gym chall","gc"]},"NEO GENESIS":{"label":"Neo Genesis","code":"NG","aliases":["neo genesis","neo 1","ng"]},"NEO DISCOVERY":{"label":"Neo Discovery","code":"NDI","aliases":["neo discovery","neo disc","neo 2","ndi"]},"NEO REVELATION":{"label":"Neo Revelation","code":"NR","aliases":["neo revelation","neo rev","neo 3","nr"]},"NEO DESTINY":{"label":"Neo Destiny","code":"NDE","aliases":["neo destiny","neo 4","nde"]},"LEGENDARY COLLECTION":{"label":"Legendary Collection","code":"LC","aliases":["legendary collection","legendary","lc"]},"SOUTHERN ISLANDS":{"label":"Southern Islands","code":"SI","aliases":["southern islands","southern","si"]},"WOTC PROMO":{"label":"Wizards Black Star Promos","code":"WP","aliases":["wotc promo","black star promo","wizards promo","promo","wp"]},"EXPEDITION":{"label":"Expedition Base Set","code":"EX","aliases":["expedition","ecard","e card","ecard1"]},"AQUAPOLIS":{"label":"Aquapolis","code":"AQ","aliases":["aquapolis","ecard2"]},"SKYRIDGE":{"label":"Skyridge","code":"SK","aliases":["skyridge","ecard3"]},"EX RUBY SAPPHIRE":{"label":"EX Ruby & Sapphire","code":"RS","aliases":["ex ruby sapphire","ruby sapphire","ex ruby","rs"]},"EX SANDSTORM":{"label":"EX Sandstorm","code":"SS","aliases":["ex sandstorm","sandstorm","ss"]},"EX DRAGON":{"label":"EX Dragon","code":"DR","aliases":["ex dragon","dragon ex","dr"]},"EX TEAM MAGMA AQUA":{"label":"EX Team Magma vs Team Aqua","code":"MA","aliases":["ex team magma aqua","team magma vs team aqua","magma aqua","ma"]},"EX HIDDEN LEGENDS":{"label":"EX Hidden Legends","code":"HL","aliases":["ex hidden legends","hidden legends","hl"]},"EX FIRERED LEAFGREEN":{"label":"EX FireRed & LeafGreen","code":"FL","aliases":["ex firered leafgreen","firered leafgreen","fire red leaf green","frlg","fl"]},"EX TEAM ROCKET RETURNS":{"label":"EX Team Rocket Returns","code":"TRR","aliases":["ex team rocket returns","team rocket returns","rocket returns","trr"]},"EX DEOXYS":{"label":"EX Deoxys","code":"DX","aliases":["ex deoxys","deoxys","dx"]},"EX EMERALD":{"label":"EX Emerald","code":"EM","aliases":["ex emerald","emerald","em"]},"EX UNSEEN FORCES":{"label":"EX Unseen Forces","code":"UF","aliases":["ex unseen forces","unseen forces","uf"]},"EX DELTA SPECIES":{"label":"EX Delta Species","code":"DS","aliases":["ex delta species","delta species","ex delta","ds"]},"EX LEGEND MAKER":{"label":"EX Legend Maker","code":"LM","aliases":["ex legend maker","legend maker","lm"]},"EX HOLON PHANTOMS":{"label":"EX Holon Phantoms","code":"HP","aliases":["ex holon phantoms","holon phantoms","hp"]},"EX CRYSTAL GUARDIANS":{"label":"EX Crystal Guardians","code":"CG","aliases":["ex crystal guardians","crystal guardians","crystal","cg"]},"EX DRAGON FRONTIERS":{"label":"EX Dragon Frontiers","code":"DF","aliases":["ex dragon frontiers","dragon frontiers","df"]},"EX POWER KEEPERS":{"label":"EX Power Keepers","code":"PK","aliases":["ex power keepers","power keepers","pk"]},"EX TRAINER KIT 2":{"label":"EX Trainer Kit 2","code":"","aliases":["ex trainer kit 2","trainer kit 2","tk2"]},"LEGENDS AWAKENED":{"label":"Legends Awakened","code":"LA","aliases":["legends awakened","legend awakened","la","dp legends awakened"]}},"knownCards":[{"key":"en|base|1|alakazam","name":"Alakazam","number":"1","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Alakazam-V1-BS1","query":"Alakazam BS1","aliases":[],"verified":true,"direct":true},{"key":"en|base|2|blastoise","name":"Blastoise","number":"2","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Blastoise-V1-BS2","query":"Blastoise BS2","aliases":[],"verified":true,"direct":true},{"key":"en|base|3|chansey","name":"Chansey","number":"3","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Chansey-V1-BS3","query":"Chansey BS3","aliases":[],"verified":true,"direct":true},{"key":"en|base|4|charizard","name":"Charizard","number":"4","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Charizard-V1-BS4","query":"Charizard BS4","aliases":[],"verified":true,"direct":true},{"key":"en|base|5|clefairy","name":"Clefairy","number":"5","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Clefairy-V1-BS5","query":"Clefairy BS5","aliases":[],"verified":true,"direct":true},{"key":"en|base|6|gyarados","name":"Gyarados","number":"6","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Gyarados-V1-BS6","query":"Gyarados BS6","aliases":[],"verified":true,"direct":true},{"key":"en|base|7|hitmonchan","name":"Hitmonchan","number":"7","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Hitmonchan-V1-BS7","query":"Hitmonchan BS7","aliases":[],"verified":true,"direct":true},{"key":"en|base|8|machamp","name":"Machamp","number":"8","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Machamp-V1-BS8","query":"Machamp BS8","aliases":[],"verified":true,"direct":true},{"key":"en|base|9|magneton","name":"Magneton","number":"9","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Magneton-V1-BS9","query":"Magneton BS9","aliases":[],"verified":true,"direct":true},{"key":"en|base|10|mewtwo","name":"Mewtwo","number":"10","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Mewtwo-V1-BS10","query":"Mewtwo BS10","aliases":[],"verified":true,"direct":true},{"key":"en|base|11|nidoking","name":"Nidoking","number":"11","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Nidoking-V1-BS11","query":"Nidoking BS11","aliases":[],"verified":true,"direct":true},{"key":"en|base|12|ninetales","name":"Ninetales","number":"12","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Ninetales-V1-BS12","query":"Ninetales BS12","aliases":[],"verified":true,"direct":true},{"key":"en|base|13|poliwrath","name":"Poliwrath","number":"13","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Poliwrath-V1-BS13","query":"Poliwrath BS13","aliases":[],"verified":true,"direct":true},{"key":"en|base|14|raichu","name":"Raichu","number":"14","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Raichu-V1-BS14","query":"Raichu BS14","aliases":[],"verified":true,"direct":true},{"key":"en|base|15|venusaur","name":"Venusaur","number":"15","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Venusaur-V1-BS15","query":"Venusaur BS15","aliases":[],"verified":true,"direct":true},{"key":"en|base|16|zapdos","name":"Zapdos","number":"16","set":"BASE","set_name":"Base Set","code":"BS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Zapdos-V1-BS16","query":"Zapdos BS16","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|1|clefable","name":"Clefable","number":"1","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Clefable-V1-JU1","query":"Clefable JU1","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|2|electrode","name":"Electrode","number":"2","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Electrode-V1-JU2","query":"Electrode JU2","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|3|flareon","name":"Flareon","number":"3","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Flareon-V1-JU3","query":"Flareon JU3","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|4|jolteon","name":"Jolteon","number":"4","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Jolteon-V1-JU4","query":"Jolteon JU4","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|5|kangaskhan","name":"Kangaskhan","number":"5","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Kangaskhan-V1-JU5","query":"Kangaskhan JU5","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|6|mr. mime","name":"Mr. Mime","number":"6","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Mr-Mime-V1-JU6","query":"Mr. Mime JU6","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|7|nidoqueen","name":"Nidoqueen","number":"7","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Nidoqueen-V1-JU7","query":"Nidoqueen JU7","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|8|pidgeot","name":"Pidgeot","number":"8","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Pidgeot-V1-JU8","query":"Pidgeot JU8","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|9|pinsir","name":"Pinsir","number":"9","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Pinsir-V1-JU9","query":"Pinsir JU9","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|10|scyther","name":"Scyther","number":"10","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Scyther-V1-JU10","query":"Scyther JU10","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|11|snorlax","name":"Snorlax","number":"11","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Snorlax-V1-JU11","query":"Snorlax JU11","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|12|vaporeon","name":"Vaporeon","number":"12","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Vaporeon-V1-JU12","query":"Vaporeon JU12","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|13|venomoth","name":"Venomoth","number":"13","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Venomoth-V1-JU13","query":"Venomoth JU13","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|14|victreebel","name":"Victreebel","number":"14","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Victreebel-V1-JU14","query":"Victreebel JU14","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|15|vileplume","name":"Vileplume","number":"15","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Vileplume-V1-JU15","query":"Vileplume JU15","aliases":[],"verified":true,"direct":true},{"key":"en|jungle|16|wigglytuff","name":"Wigglytuff","number":"16","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Wigglytuff-V1-JU16","query":"Wigglytuff JU16","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|1|aerodactyl","name":"Aerodactyl","number":"1","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Aerodactyl-V1-FO1","query":"Aerodactyl FO1","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|2|articuno","name":"Articuno","number":"2","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Articuno-V1-FO2","query":"Articuno FO2","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|3|ditto","name":"Ditto","number":"3","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Ditto-V1-FO3","query":"Ditto FO3","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|4|dragonite","name":"Dragonite","number":"4","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Dragonite-V1-FO4","query":"Dragonite FO4","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|5|gengar","name":"Gengar","number":"5","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Gengar-V1-FO5","query":"Gengar FO5","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|6|haunter","name":"Haunter","number":"6","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Haunter-V1-FO6","query":"Haunter FO6","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|7|hitmonlee","name":"Hitmonlee","number":"7","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Hitmonlee-V1-FO7","query":"Hitmonlee FO7","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|8|hypno","name":"Hypno","number":"8","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Hypno-V1-FO8","query":"Hypno FO8","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|9|kabutops","name":"Kabutops","number":"9","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Kabutops-V1-FO9","query":"Kabutops FO9","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|10|lapras","name":"Lapras","number":"10","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Lapras-V1-FO10","query":"Lapras FO10","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|11|magneton","name":"Magneton","number":"11","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Magneton-V1-FO11","query":"Magneton FO11","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|12|moltres","name":"Moltres","number":"12","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Moltres-V1-FO12","query":"Moltres FO12","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|13|muk","name":"Muk","number":"13","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Muk-V1-FO13","query":"Muk FO13","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|14|raichu","name":"Raichu","number":"14","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Raichu-V1-FO14","query":"Raichu FO14","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|15|zapdos","name":"Zapdos","number":"15","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Zapdos-V1-FO15","query":"Zapdos FO15","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|1|alakazam","name":"Alakazam","number":"1","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Alakazam-B21","query":"Alakazam B21","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|2|blastoise","name":"Blastoise","number":"2","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Blastoise-B22","query":"Blastoise B22","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|3|chansey","name":"Chansey","number":"3","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Chansey-B23","query":"Chansey B23","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|4|charizard","name":"Charizard","number":"4","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Charizard-B24","query":"Charizard B24","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|5|clefable","name":"Clefable","number":"5","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Clefable-B25","query":"Clefable B25","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|6|clefairy","name":"Clefairy","number":"6","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Clefairy-B26","query":"Clefairy B26","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|7|gyarados","name":"Gyarados","number":"7","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Gyarados-B27","query":"Gyarados B27","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|8|hitmonchan","name":"Hitmonchan","number":"8","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Hitmonchan-B28","query":"Hitmonchan B28","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|9|magneton","name":"Magneton","number":"9","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Magneton-B29","query":"Magneton B29","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|10|mewtwo","name":"Mewtwo","number":"10","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Mewtwo-B210","query":"Mewtwo B210","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|11|nidoking","name":"Nidoking","number":"11","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Nidoking-B211","query":"Nidoking B211","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|12|nidoqueen","name":"Nidoqueen","number":"12","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Nidoqueen-B212","query":"Nidoqueen B212","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|13|ninetales","name":"Ninetales","number":"13","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Ninetales-B213","query":"Ninetales B213","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|14|pidgeot","name":"Pidgeot","number":"14","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Pidgeot-B214","query":"Pidgeot B214","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|15|poliwrath","name":"Poliwrath","number":"15","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Poliwrath-B215","query":"Poliwrath B215","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|16|raichu","name":"Raichu","number":"16","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Raichu-B216","query":"Raichu B216","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|17|scyther","name":"Scyther","number":"17","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Scyther-B217","query":"Scyther B217","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|18|venusaur","name":"Venusaur","number":"18","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Venusaur-B218","query":"Venusaur B218","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|19|wigglytuff","name":"Wigglytuff","number":"19","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Wigglytuff-B219","query":"Wigglytuff B219","aliases":[],"verified":true,"direct":true},{"key":"en|base set 2|20|zapdos","name":"Zapdos","number":"20","set":"BASE SET 2","set_name":"Base Set 2","code":"B2","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set-2/Zapdos-B220","query":"Zapdos B220","aliases":[],"verified":true,"direct":true},{"key":"en|rocket|1|dark alakazam","name":"Dark Alakazam","number":"1","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Alakazam TR1","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|2|dark arbok","name":"Dark Arbok","number":"2","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Arbok TR2","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|3|dark blastoise","name":"Dark Blastoise","number":"3","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Blastoise TR3","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|4|dark charizard","name":"Dark Charizard","number":"4","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Team-Rocket/Dark-Charizard-TR4","query":"Dark Charizard TR4","aliases":["dark zard"],"verified":true,"direct":true},{"key":"en|rocket|5|dark dragonite","name":"Dark Dragonite","number":"5","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Dragonite TR5","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|6|dark dugtrio","name":"Dark Dugtrio","number":"6","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Dugtrio TR6","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|7|dark golbat","name":"Dark Golbat","number":"7","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Golbat TR7","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|8|dark gyarados","name":"Dark Gyarados","number":"8","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Gyarados TR8","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|9|dark hypno","name":"Dark Hypno","number":"9","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Hypno TR9","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|10|dark machamp","name":"Dark Machamp","number":"10","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Machamp TR10","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|11|dark magneton","name":"Dark Magneton","number":"11","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Magneton TR11","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|12|dark slowbro","name":"Dark Slowbro","number":"12","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Slowbro TR12","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|13|dark vileplume","name":"Dark Vileplume","number":"13","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Vileplume TR13","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|14|dark weezing","name":"Dark Weezing","number":"14","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Dark Weezing TR14","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|15|here comes team rocket!","name":"Here Comes Team Rocket!","number":"15","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Here Comes Team Rocket! TR15","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|16|rocket's sneak attack","name":"Rocket's Sneak Attack","number":"16","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Rocket's Sneak Attack TR16","aliases":[],"verified":false,"direct":false},{"key":"en|rocket|17|rainbow energy","name":"Rainbow Energy","number":"17","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Holo Rare","url":"","query":"Rainbow Energy TR17","aliases":[],"verified":false,"direct":false},{"key":"en|gym heroes|1|blaine's moltres","name":"Blaine's Moltres","number":"1","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Blaines-Moltres-GH1","query":"Blaine's Moltres GH1","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|2|brock's rhydon","name":"Brock's Rhydon","number":"2","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Brocks-Rhydon-GH2","query":"Brock's Rhydon GH2","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|3|erika's clefable","name":"Erika's Clefable","number":"3","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Erikas-Clefable-GH3","query":"Erika's Clefable GH3","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|4|erika's dragonair","name":"Erika's Dragonair","number":"4","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Erikas-Dragonair-GH4","query":"Erika's Dragonair GH4","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|5|erika's vileplume","name":"Erika's Vileplume","number":"5","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Erikas-Vileplume-GH5","query":"Erika's Vileplume GH5","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|6|lt. surge's electabuzz","name":"Lt. Surge's Electabuzz","number":"6","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Lt-Surges-Electabuzz-GH6","query":"Lt. Surge's Electabuzz GH6","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|7|lt. surge's fearow","name":"Lt. Surge's Fearow","number":"7","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Lt-Surges-Fearow-GH7","query":"Lt. Surge's Fearow GH7","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|8|lt. surge's magneton","name":"Lt. Surge's Magneton","number":"8","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Lt-Surges-Magneton-GH8","query":"Lt. Surge's Magneton GH8","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|9|misty's seadra","name":"Misty's Seadra","number":"9","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Mistys-Seadra-GH9","query":"Misty's Seadra GH9","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|10|misty's tentacruel","name":"Misty's Tentacruel","number":"10","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Mistys-Tentacruel-GH10","query":"Misty's Tentacruel GH10","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|11|rocket's hitmonchan","name":"Rocket's Hitmonchan","number":"11","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Rockets-Hitmonchan-GH11","query":"Rocket's Hitmonchan GH11","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|12|rocket's moltres","name":"Rocket's Moltres","number":"12","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Rockets-Moltres-GH12","query":"Rocket's Moltres GH12","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|13|rocket's scyther","name":"Rocket's Scyther","number":"13","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Rockets-Scyther-GH13","query":"Rocket's Scyther GH13","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|14|sabrina's gengar","name":"Sabrina's Gengar","number":"14","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Sabrinas-Gengar-GH14","query":"Sabrina's Gengar GH14","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|15|brock","name":"Brock","number":"15","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Brock-GH15","query":"Brock GH15","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|16|erika","name":"Erika","number":"16","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Erika-GH16","query":"Erika GH16","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|17|lt. surge","name":"Lt. Surge","number":"17","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Lt-Surge-GH17","query":"Lt. Surge GH17","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|18|misty","name":"Misty","number":"18","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/Misty-GH18","query":"Misty GH18","aliases":[],"verified":true,"direct":true},{"key":"en|gym heroes|19|the rocket's trap","name":"The Rocket's Trap","number":"19","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Heroes/The-Rockets-Trap-GH19","query":"The Rocket's Trap GH19","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|1|blaine's arcanine","name":"Blaine's Arcanine","number":"1","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Blaines-Arcanine-GC1","query":"Blaine's Arcanine GC1","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|2|blaine's charizard","name":"Blaine's Charizard","number":"2","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Blaines-Charizard-GC2","query":"Blaine's Charizard GC2","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|3|brock's ninetales","name":"Brock's Ninetales","number":"3","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Brocks-Ninetales-GC3","query":"Brock's Ninetales GC3","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|4|erika's venusaur","name":"Erika's Venusaur","number":"4","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Erikas-Venusaur-GC4","query":"Erika's Venusaur GC4","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|5|giovanni's gyarados","name":"Giovanni's Gyarados","number":"5","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Giovannis-Gyarados-GC5","query":"Giovanni's Gyarados GC5","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|6|giovanni's machamp","name":"Giovanni's Machamp","number":"6","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Giovannis-Machamp-GC6","query":"Giovanni's Machamp GC6","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|7|giovanni's nidoking","name":"Giovanni's Nidoking","number":"7","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Giovannis-Nidoking-GC7","query":"Giovanni's Nidoking GC7","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|8|giovanni's persian","name":"Giovanni's Persian","number":"8","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Giovannis-Persian-GC8","query":"Giovanni's Persian GC8","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|9|koga's beedrill","name":"Koga's Beedrill","number":"9","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Kogas-Beedrill-GC9","query":"Koga's Beedrill GC9","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|10|koga's ditto","name":"Koga's Ditto","number":"10","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Kogas-Ditto-GC10","query":"Koga's Ditto GC10","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|11|lt. surge's raichu","name":"Lt. Surge's Raichu","number":"11","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Lt-Surges-Raichu-GC11","query":"Lt. Surge's Raichu GC11","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|12|misty's golduck","name":"Misty's Golduck","number":"12","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Mistys-Golduck-GC12","query":"Misty's Golduck GC12","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|13|misty's gyarados","name":"Misty's Gyarados","number":"13","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Mistys-Gyarados-GC13","query":"Misty's Gyarados GC13","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|14|rocket's mewtwo","name":"Rocket's Mewtwo","number":"14","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Rockets-Mewtwo-GC14","query":"Rocket's Mewtwo GC14","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|15|rocket's zapdos","name":"Rocket's Zapdos","number":"15","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Rockets-Zapdos-GC15","query":"Rocket's Zapdos GC15","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|16|sabrina's alakazam","name":"Sabrina's Alakazam","number":"16","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Sabrinas-Alakazam-GC16","query":"Sabrina's Alakazam GC16","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|17|blaine","name":"Blaine","number":"17","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Blaine-GC17","query":"Blaine GC17","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|18|giovanni","name":"Giovanni","number":"18","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Giovanni-GC18","query":"Giovanni GC18","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|19|koga","name":"Koga","number":"19","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Koga-GC19","query":"Koga GC19","aliases":[],"verified":true,"direct":true},{"key":"en|gym challenge|20|sabrina","name":"Sabrina","number":"20","set":"GYM CHALLENGE","set_name":"Gym Challenge","code":"GC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Gym-Challenge/Sabrina-GC20","query":"Sabrina GC20","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|1|ampharos","name":"Ampharos","number":"1","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Ampharos-NG1","query":"Ampharos NG1","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|2|azumarill","name":"Azumarill","number":"2","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Azumarill-NG2","query":"Azumarill NG2","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|3|bellossom","name":"Bellossom","number":"3","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Bellossom-NG3","query":"Bellossom NG3","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|4|feraligatr","name":"Feraligatr","number":"4","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Feraligatr-NG4","query":"Feraligatr NG4","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|5|feraligatr","name":"Feraligatr","number":"5","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Feraligatr-NG5","query":"Feraligatr NG5","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|6|heracross","name":"Heracross","number":"6","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Heracross-NG6","query":"Heracross NG6","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|7|jumpluff","name":"Jumpluff","number":"7","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Jumpluff-NG7","query":"Jumpluff NG7","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|8|kingdra","name":"Kingdra","number":"8","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Kingdra-NG8","query":"Kingdra NG8","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|9|lugia","name":"Lugia","number":"9","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Lugia-NG9","query":"Lugia NG9","aliases":["neo lugia"],"verified":true,"direct":true},{"key":"en|neo genesis|10|meganium","name":"Meganium","number":"10","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Meganium-NG10","query":"Meganium NG10","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|11|meganium","name":"Meganium","number":"11","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Meganium-NG11","query":"Meganium NG11","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|12|pichu","name":"Pichu","number":"12","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Pichu-NG12","query":"Pichu NG12","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|13|skarmory","name":"Skarmory","number":"13","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Skarmory-NG13","query":"Skarmory NG13","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|14|slowking","name":"Slowking","number":"14","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Slowking-NG14","query":"Slowking NG14","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|15|steelix","name":"Steelix","number":"15","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Steelix-NG15","query":"Steelix NG15","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|16|togetic","name":"Togetic","number":"16","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Togetic-NG16","query":"Togetic NG16","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|17|typhlosion","name":"Typhlosion","number":"17","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Typhlosion-NG17","query":"Typhlosion NG17","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|18|typhlosion","name":"Typhlosion","number":"18","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Typhlosion-NG18","query":"Typhlosion NG18","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|19|metal energy","name":"Metal Energy","number":"19","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Metal-Energy-NG19","query":"Metal Energy NG19","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|1|espeon","name":"Espeon","number":"1","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Espeon-NDI1","query":"Espeon NDI1","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|2|forretress","name":"Forretress","number":"2","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Forretress-NDI2","query":"Forretress NDI2","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|3|hitmontop","name":"Hitmontop","number":"3","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Hitmontop-NDI3","query":"Hitmontop NDI3","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|4|houndoom","name":"Houndoom","number":"4","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Houndoom-NDI4","query":"Houndoom NDI4","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|5|houndour","name":"Houndour","number":"5","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Houndour-NDI5","query":"Houndour NDI5","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|6|kabutops","name":"Kabutops","number":"6","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Kabutops-NDI6","query":"Kabutops NDI6","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|7|magnemite","name":"Magnemite","number":"7","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Magnemite-NDI7","query":"Magnemite NDI7","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|8|politoed","name":"Politoed","number":"8","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Politoed-NDI8","query":"Politoed NDI8","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|9|poliwrath","name":"Poliwrath","number":"9","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Poliwrath-NDI9","query":"Poliwrath NDI9","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|10|scizor","name":"Scizor","number":"10","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Scizor-NDI10","query":"Scizor NDI10","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|11|smeargle","name":"Smeargle","number":"11","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Smeargle-NDI11","query":"Smeargle NDI11","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|12|tyranitar","name":"Tyranitar","number":"12","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Tyranitar-NDI12","query":"Tyranitar NDI12","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|13|umbreon","name":"Umbreon","number":"13","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Umbreon-NDI13","query":"Umbreon NDI13","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|14|unown [a]","name":"Unown [A]","number":"14","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Unown-A-NDI14","query":"Unown [A] NDI14","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|15|ursaring","name":"Ursaring","number":"15","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Ursaring-NDI15","query":"Ursaring NDI15","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|16|wobbuffet","name":"Wobbuffet","number":"16","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Wobbuffet-NDI16","query":"Wobbuffet NDI16","aliases":[],"verified":true,"direct":true},{"key":"en|neo discovery|17|yanma","name":"Yanma","number":"17","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Discovery/Yanma-NDI17","query":"Yanma NDI17","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|1|ampharos","name":"Ampharos","number":"1","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Ampharos-NR1","query":"Ampharos NR1","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|2|blissey","name":"Blissey","number":"2","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Blissey-NR2","query":"Blissey NR2","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|3|celebi","name":"Celebi","number":"3","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Celebi-NR3","query":"Celebi NR3","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|4|crobat","name":"Crobat","number":"4","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Crobat-NR4","query":"Crobat NR4","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|5|delibird","name":"Delibird","number":"5","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Delibird-NR5","query":"Delibird NR5","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|6|entei","name":"Entei","number":"6","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Entei-NR6","query":"Entei NR6","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|7|ho-oh","name":"Ho-Oh","number":"7","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Ho-Oh-NR7","query":"Ho-Oh NR7","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|8|houndoom","name":"Houndoom","number":"8","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Houndoom-NR8","query":"Houndoom NR8","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|9|jumpluff","name":"Jumpluff","number":"9","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Jumpluff-NR9","query":"Jumpluff NR9","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|10|magneton","name":"Magneton","number":"10","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Magneton-NR10","query":"Magneton NR10","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|11|misdreavus","name":"Misdreavus","number":"11","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Misdreavus-NR11","query":"Misdreavus NR11","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|12|porygon2","name":"Porygon2","number":"12","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Porygon2-NR12","query":"Porygon2 NR12","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|13|raikou","name":"Raikou","number":"13","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Raikou-NR13","query":"Raikou NR13","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|14|suicune","name":"Suicune","number":"14","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Suicune-NR14","query":"Suicune NR14","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|65|shining gyarados","name":"Shining Gyarados","number":"65","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Gyarados-NR65","query":"Shining Gyarados NR65","aliases":[],"verified":true,"direct":true},{"key":"en|neo revelation|66|shining magikarp","name":"Shining Magikarp","number":"66","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Magikarp-NR66","query":"Shining Magikarp NR66","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|1|dark ampharos","name":"Dark Ampharos","number":"1","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Ampharos-NDE1","query":"Dark Ampharos NDE1","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|2|dark crobat","name":"Dark Crobat","number":"2","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Crobat-NDE2","query":"Dark Crobat NDE2","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|3|dark donphan","name":"Dark Donphan","number":"3","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Donphan-NDE3","query":"Dark Donphan NDE3","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|4|dark espeon","name":"Dark Espeon","number":"4","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Espeon-NDE4","query":"Dark Espeon NDE4","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|5|dark feraligatr","name":"Dark Feraligatr","number":"5","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Feraligatr-NDE5","query":"Dark Feraligatr NDE5","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|6|dark gengar","name":"Dark Gengar","number":"6","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Gengar-NDE6","query":"Dark Gengar NDE6","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|7|dark houndoom","name":"Dark Houndoom","number":"7","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Houndoom-NDE7","query":"Dark Houndoom NDE7","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|8|dark porygon2","name":"Dark Porygon2","number":"8","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Porygon2-NDE8","query":"Dark Porygon2 NDE8","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|9|dark scizor","name":"Dark Scizor","number":"9","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Scizor-NDE9","query":"Dark Scizor NDE9","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|10|dark typhlosion","name":"Dark Typhlosion","number":"10","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Typhlosion-NDE10","query":"Dark Typhlosion NDE10","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|11|dark tyranitar","name":"Dark Tyranitar","number":"11","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Dark-Tyranitar-NDE11","query":"Dark Tyranitar NDE11","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|12|light arcanine","name":"Light Arcanine","number":"12","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Light-Arcanine-NDE12","query":"Light Arcanine NDE12","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|13|light azumarill","name":"Light Azumarill","number":"13","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Light-Azumarill-NDE13","query":"Light Azumarill NDE13","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|14|light dragonite","name":"Light Dragonite","number":"14","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Light-Dragonite-NDE14","query":"Light Dragonite NDE14","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|15|light togetic","name":"Light Togetic","number":"15","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Light-Togetic-NDE15","query":"Light Togetic NDE15","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|16|miracle energy","name":"Miracle Energy","number":"16","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Miracle-Energy-NDE16","query":"Miracle Energy NDE16","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|106|shining celebi","name":"Shining Celebi","number":"106","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Celebi-NDE106","query":"Shining Celebi NDE106","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|107|shining charizard","name":"Shining Charizard","number":"107","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Charizard-NDE107","query":"Shining Charizard NDE107","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|108|shining kabutops","name":"Shining Kabutops","number":"108","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Kabutops-NDE108","query":"Shining Kabutops NDE108","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|109|shining mewtwo","name":"Shining Mewtwo","number":"109","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Mewtwo-NDE109","query":"Shining Mewtwo NDE109","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|110|shining noctowl","name":"Shining Noctowl","number":"110","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Noctowl-NDE110","query":"Shining Noctowl NDE110","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|111|shining raichu","name":"Shining Raichu","number":"111","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Raichu-NDE111","query":"Shining Raichu NDE111","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|112|shining steelix","name":"Shining Steelix","number":"112","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Steelix-NDE112","query":"Shining Steelix NDE112","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|113|shining tyranitar","name":"Shining Tyranitar","number":"113","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Tyranitar-NDE113","query":"Shining Tyranitar NDE113","aliases":[],"verified":true,"direct":true},{"key":"en|legendary collection|3|charizard","name":"Charizard","number":"3","set":"LEGENDARY COLLECTION","set_name":"Legendary Collection","code":"LC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V1-LC3","query":"Charizard LC3","aliases":["lc charizard","legendary charizard"],"verified":true,"direct":true},{"key":"en|legendary collection|3|charizard reverse holo","name":"Charizard Reverse Holo","number":"3","set":"LEGENDARY COLLECTION","set_name":"Legendary Collection","code":"LC","language":"EN","rarity":"Reverse Holo","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V2-LC3","query":"Charizard Reverse Holo LC3","aliases":["charizard reverse","lc charizard reverse"],"verified":true,"direct":true},{"key":"en|legendary collection|29|mewtwo","name":"Mewtwo","number":"29","set":"LEGENDARY COLLECTION","set_name":"Legendary Collection","code":"LC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Mewtwo-V1-LC29","query":"Mewtwo LC29","aliases":["lc mewtwo"],"verified":true,"direct":true},{"key":"en|legendary collection|4|dark blastoise","name":"Dark Blastoise","number":"4","set":"LEGENDARY COLLECTION","set_name":"Legendary Collection","code":"LC","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Dark-Blastoise-LC4","query":"Dark Blastoise LC4","aliases":["lc dark blastoise"],"verified":true,"direct":true},{"key":"en|expedition|6|charizard","name":"Charizard","number":"6","set":"EXPEDITION","set_name":"Expedition Base Set","code":"EX","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expedition-Base-Set/Charizard-EX6","query":"Charizard EX6","aliases":["expedition charizard holo"],"verified":true,"direct":true},{"key":"en|expedition|39|charizard","name":"Charizard","number":"39","set":"EXPEDITION","set_name":"Expedition Base Set","code":"EX","language":"EN","rarity":"Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expedition-Base-Set/Charizard-EX39","query":"Charizard EX39","aliases":["expedition charizard 39"],"verified":true,"direct":true},{"key":"en|expedition|40|charizard","name":"Charizard","number":"40","set":"EXPEDITION","set_name":"Expedition Base Set","code":"EX","language":"EN","rarity":"Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expedition-Base-Set/Charizard-EX40","query":"Charizard EX40","aliases":["expedition charizard 40"],"verified":true,"direct":true},{"key":"en|expedition|124|pikachu","name":"Pikachu","number":"124","set":"EXPEDITION","set_name":"Expedition Base Set","code":"EX","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expedition-Base-Set/Pikachu-EX124","query":"Pikachu EX124","aliases":["expedition pikachu"],"verified":true,"direct":true},{"key":"en|aquapolis|149|lugia","name":"Lugia","number":"149","set":"AQUAPOLIS","set_name":"Aquapolis","code":"AQ","language":"EN","rarity":"Crystal","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Aquapolis/Lugia-AQ149","query":"Lugia AQ149","aliases":["crystal lugia"],"verified":true,"direct":true},{"key":"en|aquapolis|148|kingdra","name":"Kingdra","number":"148","set":"AQUAPOLIS","set_name":"Aquapolis","code":"AQ","language":"EN","rarity":"Crystal","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Aquapolis/Kingdra-V3-AQ148","query":"Kingdra AQ148","aliases":["crystal kingdra"],"verified":true,"direct":true},{"key":"en|aquapolis|150|nidoking","name":"Nidoking","number":"150","set":"AQUAPOLIS","set_name":"Aquapolis","code":"AQ","language":"EN","rarity":"Crystal","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Aquapolis/Nidoking-V3-AQ150","query":"Nidoking AQ150","aliases":["crystal nidoking"],"verified":true,"direct":true},{"key":"en|aquapolis|h19|ninetales","name":"Ninetales","number":"H19","set":"AQUAPOLIS","set_name":"Aquapolis","code":"AQ","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Aquapolis/Ninetales-V1-AQH19","query":"Ninetales AQH19","aliases":["aquapolis ninetales holo"],"verified":true,"direct":true},{"key":"en|skyridge|146|charizard","name":"Charizard","number":"146","set":"SKYRIDGE","set_name":"Skyridge","code":"SK","language":"EN","rarity":"Crystal","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Skyridge/Charizard-V1-SK146","query":"Charizard SK146","aliases":["crystal charizard","skyridge charizard"],"verified":true,"direct":true},{"key":"en|skyridge|145|celebi","name":"Celebi","number":"145","set":"SKYRIDGE","set_name":"Skyridge","code":"SK","language":"EN","rarity":"Crystal","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Skyridge/Celebi-SK145","query":"Celebi SK145","aliases":["crystal celebi"],"verified":true,"direct":true},{"key":"en|skyridge|147|crobat","name":"Crobat","number":"147","set":"SKYRIDGE","set_name":"Skyridge","code":"SK","language":"EN","rarity":"Crystal","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Skyridge/Crobat-V1-SK147","query":"Crobat SK147","aliases":["crystal crobat"],"verified":true,"direct":true},{"key":"en|skyridge|h10|gyarados","name":"Gyarados","number":"H10","set":"SKYRIDGE","set_name":"Skyridge","code":"SK","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Skyridge/Gyarados-V1-SKH10","query":"Gyarados SKH10","aliases":["skyridge gyarados holo"],"verified":true,"direct":true},{"key":"en|ex team rocket returns|107|mudkip gold star","name":"Mudkip Gold Star","number":"107","set":"EX TEAM ROCKET RETURNS","set_name":"EX Team Rocket Returns","code":"TRR","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Team-Rocket-Returns/Mudkip-Gold-Star-TRR107","query":"Mudkip Gold Star TRR107","aliases":["gold star mudkip"],"verified":true,"direct":true},{"key":"en|ex team rocket returns|108|torchic gold star","name":"Torchic Gold Star","number":"108","set":"EX TEAM ROCKET RETURNS","set_name":"EX Team Rocket Returns","code":"TRR","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Team-Rocket-Returns/Torchic-Gold-Star-TRR108","query":"Torchic Gold Star TRR108","aliases":["gold star torchic"],"verified":true,"direct":true},{"key":"en|ex team rocket returns|109|treecko gold star","name":"Treecko Gold Star","number":"109","set":"EX TEAM ROCKET RETURNS","set_name":"EX Team Rocket Returns","code":"TRR","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Team-Rocket-Returns/Treecko-Gold-Star-TRR109","query":"Treecko Gold Star TRR109","aliases":["gold star treecko"],"verified":true,"direct":true},{"key":"en|ex deoxys|105|latias gold star","name":"Latias Gold Star","number":"105","set":"EX DEOXYS","set_name":"EX Deoxys","code":"DX","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Deoxys/Latias-Gold-Star-DX105","query":"Latias Gold Star DX105","aliases":["gold star latias"],"verified":true,"direct":true},{"key":"en|ex deoxys|106|latios gold star","name":"Latios Gold Star","number":"106","set":"EX DEOXYS","set_name":"EX Deoxys","code":"DX","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Deoxys/Latios-Gold-Star-DX106","query":"Latios Gold Star DX106","aliases":["gold star latios"],"verified":true,"direct":true},{"key":"en|ex deoxys|107|rayquaza gold star","name":"Rayquaza Gold Star","number":"107","set":"EX DEOXYS","set_name":"EX Deoxys","code":"DX","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Deoxys/Rayquaza-Gold-Star-DX107","query":"Rayquaza Gold Star DX107","aliases":["gold star rayquaza"],"verified":true,"direct":true},{"key":"en|ex firered leafgreen|104|blastoise ex","name":"Blastoise ex","number":"104","set":"EX FIRERED LEAFGREEN","set_name":"EX FireRed & LeafGreen","code":"FL","language":"EN","rarity":"Pokémon ex","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-FireRed-LeafGreen/Blastoise-ex-FL104","query":"Blastoise ex FL104","aliases":["frlg blastoise ex"],"verified":true,"direct":true},{"key":"en|ex firered leafgreen|105|charizard ex","name":"Charizard ex","number":"105","set":"EX FIRERED LEAFGREEN","set_name":"EX FireRed & LeafGreen","code":"FL","language":"EN","rarity":"Pokémon ex","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-FireRed-LeafGreen/Charizard-ex-FL105","query":"Charizard ex FL105","aliases":["frlg charizard ex"],"verified":true,"direct":true},{"key":"en|ex emerald|9|rayquaza","name":"Rayquaza","number":"9","set":"EX EMERALD","set_name":"EX Emerald","code":"EM","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Emerald/Rayquaza-EM9","query":"Rayquaza EM9","aliases":["emerald rayquaza"],"verified":true,"direct":true},{"key":"en|ex unseen forces|112|umbreon ex","name":"Umbreon ex","number":"112","set":"EX UNSEEN FORCES","set_name":"EX Unseen Forces","code":"UF","language":"EN","rarity":"Pokémon ex","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Unseen-Forces/Umbreon-ex-UF112","query":"Umbreon ex UF112","aliases":["unseen forces umbreon"],"verified":true,"direct":true},{"key":"en|ex unseen forces|113|entei gold star","name":"Entei Gold Star","number":"113","set":"EX UNSEEN FORCES","set_name":"EX Unseen Forces","code":"UF","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Unseen-Forces/Entei-Gold-Star-UF113","query":"Entei Gold Star UF113","aliases":["gold star entei"],"verified":true,"direct":true},{"key":"en|ex legend maker|88|mew ex","name":"Mew ex","number":"88","set":"EX LEGEND MAKER","set_name":"EX Legend Maker","code":"LM","language":"EN","rarity":"Pokémon ex","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Legend-Maker/Mew-ex-LM88","query":"Mew ex LM88","aliases":["legend maker mew ex"],"verified":true,"direct":true},{"key":"en|ex holon phantoms|103|mewtwo gold star","name":"Mewtwo Gold Star","number":"103","set":"EX HOLON PHANTOMS","set_name":"EX Holon Phantoms","code":"HP","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Holon-Phantoms/Mewtwo-Gold-Star-HP103","query":"Mewtwo Gold Star HP103","aliases":["gold star mewtwo"],"verified":true,"direct":true},{"key":"en|ex crystal guardians|4|charizard delta species","name":"Charizard Delta Species","number":"4","set":"EX CRYSTAL GUARDIANS","set_name":"EX Crystal Guardians","code":"CG","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Crystal-Guardians/Charizard-Delta-Species-CG4","query":"Charizard Delta Species CG4","aliases":["delta charizard","charizard delta"],"verified":true,"direct":true},{"key":"en|ex dragon frontiers|99|tyranitar ex delta species","name":"Tyranitar ex Delta Species","number":"99","set":"EX DRAGON FRONTIERS","set_name":"EX Dragon Frontiers","code":"DF","language":"EN","rarity":"Pokémon ex","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Tyranitar-ex-Delta-Species-DF99","query":"Tyranitar ex Delta Species DF99","aliases":["delta tyranitar ex"],"verified":true,"direct":true},{"key":"en|ex dragon frontiers|100|charizard gold star delta species","name":"Charizard Gold Star Delta Species","number":"100","set":"EX DRAGON FRONTIERS","set_name":"EX Dragon Frontiers","code":"DF","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Charizard-Gold-Star-Delta-Species-DF100","query":"Charizard Gold Star Delta Species DF100","aliases":["gold star charizard","charizard gold star"],"verified":true,"direct":true},{"key":"en|ex dragon frontiers|101|mew gold star delta species","name":"Mew Gold Star Delta Species","number":"101","set":"EX DRAGON FRONTIERS","set_name":"EX Dragon Frontiers","code":"DF","language":"EN","rarity":"Gold Star","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Mew-Gold-Star-Delta-Species-DF101","query":"Mew Gold Star Delta Species DF101","aliases":["gold star mew","mew gold star"],"verified":true,"direct":true},{"key":"en|ex power keepers|6|charizard","name":"Charizard","number":"6","set":"EX POWER KEEPERS","set_name":"EX Power Keepers","code":"PK","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Power-Keepers/Charizard-PK6","query":"Charizard PK6","aliases":["power keepers charizard"],"verified":true,"direct":true},{"key":"en|jungle|51|eevee","name":"Eevee","number":"51","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Eevee-JU51","query":"Eevee JU51","aliases":["jungle eevee"],"verified":true,"direct":true},{"key":"jp|base|002|ivysaur","name":"Ivysaur","number":"002","set":"BASE","set_name":"Base Set","code":"BS","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Ivysaur","query":"Ivysaur BS002","aliases":[],"verified":true,"direct":true},{"key":"jp|base|006|charizard","name":"Charizard","number":"006","set":"BASE","set_name":"Base Set","code":"BS","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Charizard","query":"Charizard BS006","aliases":[],"verified":true,"direct":true},{"key":"jp|base|009|blastoise","name":"Blastoise","number":"009","set":"BASE","set_name":"Base Set","code":"BS","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Blastoise","query":"Blastoise BS009","aliases":[],"verified":true,"direct":true},{"key":"jp|jungle|133|eevee","name":"Eevee","number":"133","set":"JUNGLE","set_name":"Jungle","code":"JU","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Pokemon-Jungle/Eevee","query":"Eevee JU133","aliases":[],"verified":true,"direct":true},{"key":"jp|fossil|094|gengar","name":"Gengar","number":"094","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Mystery-of-the-Fossils/Gengar","query":"Gengar FO094","aliases":[],"verified":true,"direct":true},{"key":"jp|rocket|006|dark charizard","name":"Dark Charizard","number":"006","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Rocket-Gang/Dark-Charizard-ROG","query":"Dark Charizard TR006","aliases":[],"verified":true,"direct":true},{"key":"jp|gym heroes|146|rocket's moltres","name":"Rocket's Moltres","number":"146","set":"GYM HEROES","set_name":"Gym Heroes","code":"GH","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Leaders-Stadium/Rockets-Moltres-LST","query":"Rocket's Moltres GH146","aliases":[],"verified":true,"direct":true},{"key":"jp|neo discovery|197|umbreon","name":"Umbreon","number":"197","set":"NEO DISCOVERY","set_name":"Neo Discovery","code":"NDI","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Crossing-the-Ruins/Umbreon-CTR","query":"Umbreon NDI197","aliases":[],"verified":true,"direct":true},{"key":"jp|neo revelation|220|swinub","name":"Swinub","number":"220","set":"NEO REVELATION","set_name":"Neo Revelation","code":"NR","language":"JP","rarity":"Vintage JP","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Swinub-AL","query":"Swinub NR220","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|54|shellder","name":"Shellder","number":"54","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Shellder-FO54","query":"Shellder FO54","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|55|slowpoke","name":"Slowpoke","number":"55","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Slowpoke-FO55","query":"Slowpoke FO55","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|59|energy search","name":"Energy Search","number":"59","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Trainer","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Energy-Search-FO59","query":"Energy Search FO59","aliases":[],"verified":true,"direct":true},{"key":"en|rocket|30|dark vileplume","name":"Dark Vileplume","number":"30","set":"ROCKET","set_name":"Team Rocket","code":"TR","language":"EN","rarity":"Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Team-Rocket/Dark-Vileplume-TR30","query":"Dark Vileplume TR30","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|53|chikorita","name":"Chikorita","number":"53","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Chikorita-NG53","query":"Chikorita NG53","aliases":[],"verified":true,"direct":true},{"key":"en|ex dragon frontiers|43|bagon delta species","name":"Bagon Delta Species","number":"43","set":"EX DRAGON FRONTIERS","set_name":"EX Dragon Frontiers","code":"DF","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43","query":"Bagon DF43","aliases":["Bagon","Delta Bagon"],"verified":true,"direct":true},{"key":"en|ex trainer kit 2|1|beldum","name":"Beldum","number":"1","set":"EX TRAINER KIT 2","set_name":"EX Trainer Kit 2","code":"TK2P","language":"EN","rarity":"No Rarity","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Trainer-Kit-2/Beldum-TK2P1","query":"Beldum TK2P1","aliases":[],"verified":true,"direct":true},{"key":"en|ex trainer kit 2|5|metang","name":"Metang","number":"5","set":"EX TRAINER KIT 2","set_name":"EX Trainer Kit 2","code":"TK2P","language":"EN","rarity":"No Rarity","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Trainer-Kit-2/Metang-TK2P5","query":"Metang TK2P5","aliases":[],"verified":true,"direct":true},{"key":"en|fossil|49|horsea","name":"Horsea","number":"49","set":"FOSSIL","set_name":"Fossil","code":"FO","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Horsea-FO49","query":"Horsea FO49","aliases":[],"verified":true,"direct":true},{"key":"en|neo genesis|62|horsea","name":"Horsea","number":"62","set":"NEO GENESIS","set_name":"Neo Genesis","code":"NG","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Horsea-NG62","query":"Horsea NG62","aliases":[],"verified":true,"direct":true},{"key":"en|ex holon phantoms|77|pidgey","name":"Pidgey","number":"77","set":"EX HOLON PHANTOMS","set_name":"EX Holon Phantoms","code":"HP","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Holon-Phantoms/Pidgey-Delta-Species-HP77","query":"Pidgey HP77","aliases":["Pidgey Delta Species","Delta Pidgey"],"verified":true,"direct":true},{"key":"en|legends awakened|31|jirachi","name":"Jirachi","number":"31","set":"LEGENDS AWAKENED","set_name":"Legends Awakened","code":"LA","language":"EN","rarity":"Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Legends-Awakened/Jirachi-Lv42-LA31","query":"Jirachi LA31","aliases":["Jirachi Lv.42","Jirachi Lv42"],"verified":true,"direct":true},{"key":"en|ex sandstorm|60|dunsparce","name":"Dunsparce","number":"60","set":"EX SANDSTORM","set_name":"EX Sandstorm","code":"SS","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Sandstorm/Dunsparce-SS60","query":"Dunsparce SS60","aliases":[],"verified":true,"direct":true},{"key":"en|neo destiny|80|remoraid","name":"Remoraid","number":"80","set":"NEO DESTINY","set_name":"Neo Destiny","code":"NDE","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Remoraid-NDE80","query":"Remoraid NDE80","aliases":[],"verified":true,"direct":true},{"key":"en|ex power keepers|7|cradily","name":"Cradily","number":"7","set":"EX POWER KEEPERS","set_name":"EX Power Keepers","code":"PK","language":"EN","rarity":"Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Power-Keepers/Cradily-PK7","query":"Cradily PK7","aliases":[],"verified":true,"direct":true}],"stats":{"total":258,"direct":242,"searchOnly":16,"sets":35}};

// v67: expand name vocabulary through Generation IV. The catalog can stay curated;
// OCR still needs to know ordinary Pokemon names that may not yet have a direct route.
const EXTRA_POKEMON_NAMES = [
  'Treecko','Grovyle','Sceptile','Torchic','Combusken','Blaziken','Mudkip','Marshtomp','Swampert','Poochyena','Mightyena','Zigzagoon','Linoone','Wurmple','Silcoon','Beautifly','Cascoon','Dustox','Lotad','Lombre','Ludicolo','Seedot','Nuzleaf','Shiftry','Taillow','Swellow','Wingull','Pelipper','Ralts','Kirlia','Gardevoir','Surskit','Masquerain','Shroomish','Breloom','Slakoth','Vigoroth','Slaking','Nincada','Ninjask','Shedinja','Whismur','Loudred','Exploud','Makuhita','Hariyama','Azurill','Nosepass','Skitty','Delcatty','Sableye','Mawile','Aron','Lairon','Aggron','Meditite','Medicham','Electrike','Manectric','Plusle','Minun','Volbeat','Illumise','Roselia','Gulpin','Swalot','Carvanha','Sharpedo','Wailmer','Wailord','Numel','Camerupt','Torkoal','Spoink','Grumpig','Spinda','Trapinch','Vibrava','Flygon','Cacnea','Cacturne','Swablu','Altaria','Zangoose','Seviper','Lunatone','Solrock','Barboach','Whiscash','Corphish','Crawdaunt','Baltoy','Claydol','Lileep','Cradily','Anorith','Armaldo','Feebas','Milotic','Castform','Kecleon','Shuppet','Banette','Duskull','Dusclops','Tropius','Chimecho','Absol','Wynaut','Snorunt','Glalie','Spheal','Sealeo','Walrein','Clamperl','Huntail','Gorebyss','Relicanth','Luvdisc','Bagon','Shelgon','Salamence','Beldum','Metang','Metagross','Regirock','Regice','Registeel','Latias','Latios','Kyogre','Groudon','Rayquaza','Jirachi','Deoxys',
  'Turtwig','Grotle','Torterra','Chimchar','Monferno','Infernape','Piplup','Prinplup','Empoleon','Starly','Staravia','Staraptor','Bidoof','Bibarel','Kricketot','Kricketune','Shinx','Luxio','Luxray','Budew','Roserade','Cranidos','Rampardos','Shieldon','Bastiodon','Burmy','Wormadam','Mothim','Combee','Vespiquen','Pachirisu','Buizel','Floatzel','Cherubi','Cherrim','Shellos','Gastrodon','Ambipom','Drifloon','Drifblim','Buneary','Lopunny','Mismagius','Honchkrow','Glameow','Purugly','Chingling','Stunky','Skuntank','Bronzor','Bronzong','Bonsly','Mime Jr.','Happiny','Chatot','Spiritomb','Gible','Gabite','Garchomp','Munchlax','Riolu','Lucario','Hippopotas','Hippowdon','Skorupi','Drapion','Croagunk','Toxicroak','Carnivine','Finneon','Lumineon','Mantyke','Snover','Abomasnow','Weavile','Magnezone','Lickilicky','Rhyperior','Tangrowth','Electivire','Magmortar','Togekiss','Yanmega','Leafeon','Glaceon','Gliscor','Mamoswine','Porygon-Z','Gallade','Probopass','Dusknoir','Froslass','Rotom','Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Regigigas','Giratina','Cresselia','Phione','Manaphy','Darkrai','Shaymin','Arceus'
];
const EXTRA_POKEDEX_START = 252;
EXTRA_POKEMON_NAMES.forEach((name, i) => {
  const dex = String(EXTRA_POKEDEX_START + i).padStart(3,'0');
  if(!EMBEDDED_DATA.pokedex[dex]) EMBEDDED_DATA.pokedex[dex] = name;
});

let DATA = EMBEDDED_DATA;
let lastBuilt = null;
const APP_VERSION = 'v76';

const $ = (id) => document.getElementById(id);
const quickInput = $('quickInput');
const quickGo = $('quickGo');
const numberInput = $('numberInput');
const nameInput = $('nameInput');
const setSelect = $('setSelect');
const langSelect = $('langSelect');
const condSelect = $('condSelect');
const editionSelect = $('editionSelect');
const makeBtn = $('makeBtn');
const favoriteBtn = $('favoriteBtn');
const copyBtn = $('copyBtn');
const clearBtn = $('clearBtn');
const clearRecentBtn = $('clearRecentBtn');
const clearFavBtn = $('clearFavBtn');
const openBtn = $('openBtn');
const urlBox = $('urlBox');
const statusBox = $('status');
const matchBox = $('matchBox');
const recentList = $('recentList');
const favoriteList = $('favoriteList');

const STORAGE_RECENT = 'whatnotai_mobile_recent_v37'; // keep v37 key so saved items stay
const STORAGE_FAV = 'whatnotai_mobile_favorites_v37'; // keep v37 key so favorites stay
const MAX_RECENT = 10;
const MAX_FAV = 40;

const CONDITION_IDS = { NM: '2', EX: '3', GD: '4', PL: '6' };
const LANGUAGE_IDS = { EN: '1', JP: '7' };

const SET_ALIASES = [["BASE",["base set","base","bs","wotc base"]],["JUNGLE",["jungle","ju"]],["FOSSIL",["fossil","fossile","fo"]],["BASE SET 2",["base set 2","base 2","baseset2","b2"]],["ROCKET",["team rocket","rocket","tr"]],["GYM HEROES",["gym heroes","gym hero","gh"]],["GYM CHALLENGE",["gym challenge","gym chall","gc"]],["NEO GENESIS",["neo genesis","neo 1","ng"]],["NEO DISCOVERY",["neo discovery","neo disc","neo 2","ndi"]],["NEO REVELATION",["neo revelation","neo rev","neo 3","nr"]],["NEO DESTINY",["neo destiny","neo 4","nde"]],["LEGENDARY COLLECTION",["legendary collection","legendary","lc"]],["SOUTHERN ISLANDS",["southern islands","southern","si"]],["WOTC PROMO",["wotc promo","black star promo","wizards promo","promo","wp"]],["EXPEDITION",["expedition","ecard","e card","ecard1"]],["AQUAPOLIS",["aquapolis","ecard2"]],["SKYRIDGE",["skyridge","ecard3"]],["EX RUBY SAPPHIRE",["ex ruby sapphire","ruby sapphire","ex ruby","rs"]],["EX SANDSTORM",["ex sandstorm","sandstorm","ss"]],["EX DRAGON",["ex dragon","dragon ex","dr"]],["EX TEAM MAGMA AQUA",["ex team magma aqua","team magma vs team aqua","magma aqua","ma"]],["EX HIDDEN LEGENDS",["ex hidden legends","hidden legends","hl"]],["EX FIRERED LEAFGREEN",["ex firered leafgreen","firered leafgreen","fire red leaf green","frlg","fl"]],["EX TEAM ROCKET RETURNS",["ex team rocket returns","team rocket returns","rocket returns","trr"]],["EX DEOXYS",["ex deoxys","deoxys","dx"]],["EX EMERALD",["ex emerald","emerald","em"]],["EX UNSEEN FORCES",["ex unseen forces","unseen forces","uf"]],["EX DELTA SPECIES",["ex delta species","delta species","ex delta","ds"]],["EX LEGEND MAKER",["ex legend maker","legend maker","lm"]],["EX HOLON PHANTOMS",["ex holon phantoms","holon phantoms","hp"]],["EX CRYSTAL GUARDIANS",["ex crystal guardians","crystal guardians","crystal","cg"]],["EX DRAGON FRONTIERS",["ex dragon frontiers","dragon frontiers","df"]],["EX POWER KEEPERS",["ex power keepers","power keepers","pk"]],["EX TRAINER KIT 2",["ex trainer kit 2","trainer kit 2","tk2"]]];

const WESTERN = {"BASE":{"code":"BS","label":"Base Set"},"JUNGLE":{"code":"JU","label":"Jungle"},"FOSSIL":{"code":"FO","label":"Fossil"},"BASE SET 2":{"code":"B2","label":"Base Set 2"},"ROCKET":{"code":"TR","label":"Team Rocket"},"GYM HEROES":{"code":"GH","label":"Gym Heroes"},"GYM CHALLENGE":{"code":"GC","label":"Gym Challenge"},"NEO GENESIS":{"code":"NG","label":"Neo Genesis"},"NEO DISCOVERY":{"code":"NDI","label":"Neo Discovery"},"NEO REVELATION":{"code":"NR","label":"Neo Revelation"},"NEO DESTINY":{"code":"NDE","label":"Neo Destiny"},"LEGENDARY COLLECTION":{"code":"LC","label":"Legendary Collection"},"SOUTHERN ISLANDS":{"code":"SI","label":"Southern Islands"},"WOTC PROMO":{"code":"WP","label":"Wizards Black Star Promos"},"EXPEDITION":{"code":"EX","label":"Expedition Base Set"},"AQUAPOLIS":{"code":"AQ","label":"Aquapolis"},"SKYRIDGE":{"code":"SK","label":"Skyridge"},"EX RUBY SAPPHIRE":{"code":"RS","label":"EX Ruby & Sapphire"},"EX SANDSTORM":{"code":"SS","label":"EX Sandstorm"},"EX DRAGON":{"code":"DR","label":"EX Dragon"},"EX TEAM MAGMA AQUA":{"code":"MA","label":"EX Team Magma vs Team Aqua"},"EX HIDDEN LEGENDS":{"code":"HL","label":"EX Hidden Legends"},"EX FIRERED LEAFGREEN":{"code":"FL","label":"EX FireRed & LeafGreen"},"EX TEAM ROCKET RETURNS":{"code":"TRR","label":"EX Team Rocket Returns"},"EX DEOXYS":{"code":"DX","label":"EX Deoxys"},"EX EMERALD":{"code":"EM","label":"EX Emerald"},"EX UNSEEN FORCES":{"code":"UF","label":"EX Unseen Forces"},"EX DELTA SPECIES":{"code":"DS","label":"EX Delta Species"},"EX LEGEND MAKER":{"code":"LM","label":"EX Legend Maker"},"EX HOLON PHANTOMS":{"code":"HP","label":"EX Holon Phantoms"},"EX CRYSTAL GUARDIANS":{"code":"CG","label":"EX Crystal Guardians"},"EX DRAGON FRONTIERS":{"code":"DF","label":"EX Dragon Frontiers"},"EX POWER KEEPERS":{"code":"PK","label":"EX Power Keepers"},"EX TRAINER KIT 2":{"code":"","label":"EX Trainer Kit 2"}};

const JAPANESE = {
  'BASE': {dir:'Expansion-Pack', suffix:''},
  'JUNGLE': {dir:'Pokemon-Jungle', suffix:''},
  'FOSSIL': {dir:'Mystery-of-the-Fossils', suffix:''},
  'GYM HEROES': {dir:'Leaders-Stadium', suffix:''},
  'GYM CHALLENGE': {dir:'Challenge-from-the-Darkness', suffix:''},
  'NEO GENESIS': {dir:'Gold-Silver-to-a-New-World', suffix:''},
  'NEO DISCOVERY': {dir:'Crossing-the-Ruins', suffix:''},
  'NEO REVELATION': {dir:'Awakening-Legends', suffix:'AL'},
  'NEO DESTINY': {dir:'Darkness-and-to-Light', suffix:''},
  'SOUTHERN ISLANDS': {dir:'Southern-Islands-JP', suffix:''},
};

function setStatus(text, type=''){
  statusBox.textContent = text;
  statusBox.className = 'status ' + (type || '');
}
function cleanNumber(n){ return String(n || '').trim().replace(/^0+(?=\d)/,'').split('/')[0]; }
function pad3(n){ const raw = String(n || '').trim().split('/')[0]; return raw.padStart(3,'0'); }
function normalizeName(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function slugifyName(s){
  return String(s || '').trim()
    .replace(/&/g,'and')
    .replace(/[’']/g,'')
    .replace(/[^A-Za-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .replace(/-+/g,'-');
}
function titleCasePokemon(s){
  if(!s) return '';
  const specials = {
    'mr mime':'Mr. Mime', 'farfetchd':"Farfetch'd", 'nidoran female':'Nidoran Female',
    'nidoran male':'Nidoran Male', 'ho oh':'Ho-Oh', 'porygon z':'Porygon-Z'
  };
  const key = normalizeName(s);
  if(specials[key]) return specials[key];
  return String(s).split(' ').map(w => w ? w[0].toUpperCase()+w.slice(1).toLowerCase() : '').join(' ').replace(/\bEx\b/g,'ex');
}

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);
}

function readStore(key){
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch(e) { return []; }
}
function writeStore(key, arr){
  try { localStorage.setItem(key, JSON.stringify(arr)); return true; }
  catch(e) { setStatus('Opslaan lokaal geblokkeerd door browser.', 'warn'); return false; }
}

function detectSet(text){
  const lower = ' ' + String(text).toLowerCase().replace(/\s+/g,' ') + ' ';
  for (const [set, aliases] of SET_ALIASES){
    for (const a of aliases){ if (lower.includes(' '+a+' ')) return set; }
  }
  return 'AUTO';
}
function removeSetWords(text){
  let out = ' ' + String(text).toLowerCase().replace(/\s+/g,' ') + ' ';
  const aliases = SET_ALIASES.flatMap(([, arr]) => arr).sort((a,b)=>b.length-a.length);
  for (const a of aliases){ out = out.replaceAll(' '+a+' ', ' '); }
  return out.trim();
}

function inferLanguageFromKnown(set, number, name, currentLang){
  // v62: de gekozen JP/EN-knop is altijd leidend.
  return currentLang;
}

function parseQuick(){
  const text = quickInput.value.trim();
  if(!text) return false;

  const lower = text.toLowerCase();
  let lang = /\b(jp|jpn|japanese|japans)\b/.test(lower)
    ? 'JP'
    : (/\b(en|eng|english)\b/.test(lower) ? 'EN' : langSelect.value);

  const set = detectSet(text);
  let withoutSet = removeSetWords(text);

  // v70: 1st Edition is een echte Cardmarket-offerfilter en mag nooit verdwijnen.
  // Voorbeelden: 1st, 1st ed, first edition, edition 1, 1e.
  const firstEditionTyped = /\b(1st(?:\s+ed(?:ition)?)?|first\s+edition|edition\s*1|1e)\b/i.test(text);
  const unlimitedTyped = /\b(unlimited|unl)\b/i.test(text);
  // Alleen wijzigen als de gebruiker editie expliciet typt. Zo blijft een handmatig
  // gekozen 1ST EDITION-knop actief bij een normale snelle zoekopdracht.
  if(editionSelect && firstEditionTyped) editionSelect.value = '1ST';
  else if(editionSelect && unlimitedTyped) editionSelect.value = 'AUTO';

  // De conditie hoort volgens de snelle invoer als laatste. Alleen dat laatste
  // conditiewoord verwijderen, zodat kaartnamen zoals "Rayquaza ex" intact blijven.
  let cond = condSelect.value || 'NM';
  const conditionMatch = withoutSet.match(/\b(near\s+mint|excellent|played|good|nm|ex|gd|pl)\s*$/i);
  if(conditionMatch){
    const token = conditionMatch[1].toLowerCase().replace(/\s+/g,' ');
    if(token === 'nm' || token === 'near mint') cond = 'NM';
    else if(token === 'ex' || token === 'excellent') cond = 'EX';
    else if(token === 'gd' || token === 'good') cond = 'GD';
    else if(token === 'pl' || token === 'played') cond = 'PL';
    withoutSet = withoutSet.slice(0, conditionMatch.index).trim();
  }

  const cleaned = withoutSet
    .replace(/\b(jp|jpn|japanese|japans|en|eng|english)\b/gi,' ')
    .replace(/\b(1st(?:\s+ed(?:ition)?)?|first\s+edition|edition\s*1|1e|unlimited|unl|holo|holorare|holo\s+rare)\b/gi,' ')
    .replace(/\b(reverse\s+holo|reverse|rev|rh|non\s*holo|nonholo|no\s+holo)\b/gi,' ')
    .replace(/\s+/g,' ')
    .trim();

  const tokens = cleaned.split(' ').filter(Boolean);
  let number = '';
  const nameParts = [];

  for (const t of tokens){
    if(!number && /^\d{1,3}(\/\d{1,3})?$/.test(t)) number = cleanNumber(t);
    else nameParts.push(t);
  }

  let name = nameParts.join(' ').trim();

  if(!name && lang === 'JP' && number){
    const dex = DATA.pokedex[pad3(number)];
    if(dex) name = dex;
  }

  numberInput.value = number;
  nameInput.value = titleCasePokemon(name);
  setSelect.value = set;
  langSelect.value = lang;
  condSelect.value = cond;
  updateCustomSelects();
  return true;
}


const AUTO_VALUE_DIRECTS = {
  'EN|shining gyarados|65': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Gyarados-NR65', set:'NEO REVELATION', name:'Shining Gyarados', note:'AUTO shortcut: Neo Revelation NR65'},
  'EN|shining magikarp|66': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Magikarp-NR66', set:'NEO REVELATION', name:'Shining Magikarp', note:'AUTO shortcut: Neo Revelation NR66'},
  'EN|lugia|9': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Lugia-NG9', set:'NEO GENESIS', name:'Lugia', note:'AUTO shortcut: Neo Genesis NG9'},
  'EN|shining charizard|107': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Charizard-NDE107', set:'NEO DESTINY', name:'Shining Charizard', note:'AUTO shortcut: Neo Destiny NDE107'},
  'EN|shining celebi|106': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Celebi-NDE106', set:'NEO DESTINY', name:'Shining Celebi', note:'AUTO shortcut: Neo Destiny NDE106'},
  'EN|shining kabutops|108': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Kabutops-NDE108', set:'NEO DESTINY', name:'Shining Kabutops', note:'AUTO shortcut: Neo Destiny NDE108'},
  'EN|shining raichu|111': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Raichu-NDE111', set:'NEO DESTINY', name:'Shining Raichu', note:'AUTO shortcut: Neo Destiny NDE111'},
  'EN|shining tyranitar|113': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Tyranitar-NDE113', set:'NEO DESTINY', name:'Shining Tyranitar', note:'AUTO shortcut: Neo Destiny NDE113'},
  'JP|lugia|249': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Lugia-GSNW', set:'NEO GENESIS', name:'Lugia', note:'JP AUTO shortcut: Gold/Silver/New World'},
  'JP|shining gyarados|130': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Shining-Gyarados-AL', set:'NEO REVELATION', name:'Shining Gyarados', note:'JP AUTO shortcut: Awakening Legends'},
  'JP|shining magikarp|129': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Shining-Magikarp-AL', set:'NEO REVELATION', name:'Shining Magikarp', note:'JP AUTO shortcut: Awakening Legends'},
  'JP|shining charizard|6': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Darkness-and-to-Light/Shining-Charizard-DL', set:'NEO DESTINY', name:'Shining Charizard', note:'JP AUTO shortcut: Darkness and to Light'},
};


function legendaryCollectionDirect(lang, number, name, cond){
  if(lang !== 'EN') return null;
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  if(nm === 'charizard' && n === '3'){
    const q = normalizeName(quickInput.value);
    let url = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V1-LC3';
    let note = 'Legendary Collection Charizard holo: V1 / LC3';
    if(q.includes('reverse') || q.includes('rev') || q.includes('rh')){
      url = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V2-LC3';
      note = 'Legendary Collection Charizard reverse holo: V2 / LC3';
    } else if(q.includes('non holo') || q.includes('nonholo') || q.includes('no holo')){
      url = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V3-LC3';
      note = 'Legendary Collection Charizard non-holo: V3 / LC3';
    }
    return {url:withFilters(url, lang, cond), exact:true, note, autoSet:'LEGENDARY COLLECTION', autoName:'Charizard'};
  }
  return null;
}


function baseHitmonchanDirect(lang, number, name, cond){
  if(lang !== 'EN') return null;
  const n = cleanNumber(number);
  const nm = normalizeName(name).replace(/\b(1st|first edition|holo|holorare|holo rare)\b/g,' ').replace(/\s+/g,' ').trim();
  if(nm !== 'hitmonchan' || n !== '7') return null;

  const base = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Hitmonchan-V1-BS7';

  return {
    url: withFilters(base, lang, cond),
    exact: true,
    note: (editionSelect?.value === '1ST') ? 'Base Set Hitmonchan #7 · 1st Edition filter actief' : 'Base Set Hitmonchan #7 · Holo route',
    autoSet: 'BASE',
    autoName: 'Hitmonchan'
  };
}

function autoValueDirect(lang, number, name, cond){
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  const key = `${lang}|${nm}|${n}`;
  const item = AUTO_VALUE_DIRECTS[key];
  if(!item) return null;
  return {
    url: withFilters(item.url, lang, cond),
    exact: true,
    note: item.note,
    autoSet: item.set,
    autoName: item.name
  };
}

function cardNameMatches(card, name){
  const wanted = normalizeName(name);
  if(!wanted) return false;
  if(normalizeName(card.name) === wanted) return true;
  return (card.aliases || []).some(alias => normalizeName(alias) === wanted);
}

function matchingKnownCards(set, number, name){
  const n = cleanNumber(number);
  return (DATA.knownCards || []).filter(c =>
    cardNameMatches(c, name) &&
    (cleanNumber(c.number) === n || pad3(c.number) === pad3(n)) &&
    (!set || set === 'AUTO' || c.set === set)
  );
}

function knownLookup(lang,set,number,name){
  return matchingKnownCards(set, number, name)
    .find(c => c.language === lang) || null;
}

function findAutoKnown(lang, number, name){
  return matchingKnownCards('AUTO', number, name)
    .filter(c => c.language === lang);
}
function withFilters(url, lang, cond, edition=(editionSelect?.value || 'AUTO')){
  const params = [];
  if(CONDITION_IDS[cond]) params.push(`minCondition=${CONDITION_IDS[cond]}`);
  if(LANGUAGE_IDS[lang]) params.push(`language=${LANGUAGE_IDS[lang]}`);
  if(edition === '1ST') params.push('isFirstEd=Y');
  if(!params.length) return url;
  return url + (url.includes('?') ? '&' : '?') + params.join('&');
}
function buildSearchTerm(name, number, set){
  const def = (DATA.sets || {})[set || ''];
  const n = cleanNumber(number);
  if(def && def.code && n) return `${name} ${def.code}${n}`;
  return [name, number].filter(Boolean).join(' ').trim() || 'pokemon';
}

function searchUrl(name, number, lang, cond, set='AUTO', explicitQuery=''){
  // JP kaarten hebben eigen Cardmarket-productpagina's en gebruiken niet
  // betrouwbaar de Engelse collectorcode. Daarom zoekt JP veilig op naam.
  const term = lang === 'JP'
    ? (String(name || '').trim() || 'pokemon')
    : (explicitQuery || buildSearchTerm(name, number, set));
  const q = encodeURIComponent(term);
  return withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${q}`, lang, cond);
}

function buildUrl(){
  const lang = langSelect.value;
  const set = setSelect.value;
  const number = cleanNumber(numberInput.value);
  let name = nameInput.value.trim();
  const cond = condSelect.value;
  if(!name && lang === 'JP' && number){
    const dex = DATA.pokedex[pad3(number)];
    if(dex){ name = dex; nameInput.value = dex; }
  }
  if(!name) return {url:'', exact:false, note:'Geen naam ingevuld.'};

  if(set === 'AUTO'){
    const lcDirect = legendaryCollectionDirect(lang, number, name, cond);
    if(lcDirect){
      if(lcDirect.autoSet) setSelect.value = lcDirect.autoSet;
      if(lcDirect.autoName) nameInput.value = lcDirect.autoName;
      updateCustomSelects();
      return lcDirect;
    }
    const autoDirect = autoValueDirect(lang, number, name, cond);
    if(autoDirect){
      if(autoDirect.autoSet) setSelect.value = autoDirect.autoSet;
      if(autoDirect.autoName) nameInput.value = autoDirect.autoName;
      updateCustomSelects();
      return autoDirect;
    }
    const matches = findAutoKnown(lang, number, name);
    if(matches.length === 1){
      const exact = matches[0];
      setSelect.value = exact.set;
      updateCustomSelects();
      if(exact.url){
        return {
          url: withFilters(exact.url, langSelect.value, cond),
          exact: true,
          note: `Direct: ${exact.set_name || exact.set} · ${exact.rarity || 'kaart'} · ${exact.name}`
        };
      }
      return {
        url: searchUrl(exact.name, exact.number, langSelect.value, cond, exact.set, exact.query),
        exact: false,
        note: `Exacte Cardmarket zoekcode: ${exact.query}. Eén klik op het resultaat.`
      };
    }
    if(matches.length > 1){
      const candidateLanguage = [...new Set(matches.map(c => c.language).filter(Boolean))];
      if(candidateLanguage.length === 1) langSelect.value = candidateLanguage[0];
      updateCustomSelects();
      return {
        url: searchUrl(name, number, langSelect.value, cond, set),
        exact: false,
        candidates: matches,
        note: `Meerdere matches voor ${name} #${number}. Kies hieronder de juiste set.`
      };
    }
    return {
      url: searchUrl(name, number, lang, cond, set),
      exact: false,
      note: number ? `Niet in directe database. Zoek op naam/nummer ${number}.` : 'Niet in directe database.'
    };
  }

  // v41 special correction: "delta charizard 4" is EX Crystal Guardians CG4, not EX Delta Species DS4.
  if(lang === 'EN' && (set === 'EX DELTA SPECIES' || set === 'EX CRYSTAL GUARDIANS') && cleanNumber(number) === '4' && normalizeName(name) === 'charizard'){
    const url = withFilters('https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Crystal-Guardians/Charizard-Delta-Species-CG4', lang, cond);
    return {url, exact:true, note:'Special: Delta Charizard #4 = EX Crystal Guardians / CG4'};
  }

  if(set === 'LEGENDARY COLLECTION'){
    const lcDirect = legendaryCollectionDirect(lang, number, name, cond);
    if(lcDirect) return lcDirect;
  }

  if(set === 'BASE'){
    const hitmonchanDirect = baseHitmonchanDirect(lang, number, name, cond);
    if(hitmonchanDirect) return hitmonchanDirect;
  }

  const verifiedExtraKey = `${lang}|${set}|${number}|${normalizeName(name)}`;
  const VERIFIED_EXTRA_DIRECTS = {
    'EN|FOSSIL|54|shellder':'https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Shellder-FO54',
    'EN|FOSSIL|55|slowpoke':'https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Slowpoke-FO55',
    'EN|FOSSIL|59|energy search':'https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Energy-Search-FO59',
    'EN|ROCKET|30|dark vileplume':'https://www.cardmarket.com/en/Pokemon/Products/Singles/Team-Rocket/Dark-Vileplume-TR30',
    'EN|NEO GENESIS|53|chikorita':'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Chikorita-NG53',
    'EN|EX DRAGON FRONTIERS|43|bagon':'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43',
    'EN|EX TRAINER KIT 2|1|beldum':'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Trainer-Kit-2/Beldum-TK2P1',
    'EN|EX TRAINER KIT 2|5|metang':'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Trainer-Kit-2/Metang-TK2P5'
  };
  if(VERIFIED_EXTRA_DIRECTS[verifiedExtraKey]){
    return {
      url: withFilters(VERIFIED_EXTRA_DIRECTS[verifiedExtraKey], lang, cond),
      exact:true,
      note:`Direct geverifieerd: ${set} · ${name} #${number}${editionSelect?.value === '1ST' ? ' · 1st Edition' : ''}`
    };
  }

  const known = knownLookup(lang,set,number,name);
  if(known){
    updateCustomSelects();
    if(known.url){
      return {
        url: withFilters(known.url, langSelect.value, cond),
        exact: true,
        note: `Direct: ${known.set_name || known.set} · ${known.rarity || 'kaart'} · ${known.name}`
      };
    }
    return {
      url: searchUrl(known.name, known.number, langSelect.value, cond, known.set, known.query),
      exact: false,
      note: `Exacte Cardmarket zoekcode: ${known.query}. Eén klik op het resultaat.`
    };
  }

  // v59 guaranteed WOTC holo fallback for the live test set.
  const directKey = `${String(set).toUpperCase()}|${cleanNumber(number)}|${normalizeName(name)}`;
  const guaranteedDirect = {
    'JUNGLE|12|vaporeon': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Vaporeon-V1-JU12',
    'BASE|7|hitmonchan': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Hitmonchan-V1-BS7',
    'FOSSIL|5|gengar': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Gengar-V1-FO5',
    'FOSSIL|4|dragonite': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Dragonite-V1-FO4'
  };
  if(lang === 'EN' && guaranteedDirect[directKey]){
    updateCustomSelects();
    return {
      url: withFilters(guaranteedDirect[directKey], 'EN', cond),
      exact: true,
      note: `Directe WOTC holo: ${set} · ${name} #${number}`
    };
  }

  // v56: nooit meer een product-URL gokken.
  // Cardmarket gebruikt per kaart soms V1/V2/V3 of afwijkende setcodes.
  // Alleen geverifieerde database-URL's openen direct; de rest opent veilig zoeken.
  const firstEd = editionSelect?.value === '1ST';
  // v70: bij 1st Edition nooit een onzekere collectorcode forceren. Een fout nummer
  // kan Cardmarket naar een lege algemene Search-pagina sturen. Zoek dan op naam + setnaam.
  const def=(DATA.sets||{})[set||''];
  const firstEdQuery = firstEd ? [name, def?.label || (set!=='AUTO'?set:''), '1st Edition'].filter(Boolean).join(' ') : '';
  return {
    url: searchUrl(name, firstEd ? '' : number, lang, cond, set, firstEdQuery),
    exact: false,
    note: firstEd
      ? `1st Edition: nog geen geverifieerde directe productroute. Veilige zoekpagina op naam/set; kies het juiste resultaat.`
      : (set && set !== 'AUTO'
          ? `Veilige zoekpagina: ${set}. Controleer kaartnummer ${number || '-'}.`
          : `Veilige zoekpagina. Controleer kaartnummer ${number || '-'}.`)
  };
}

async function copyToClipboard(text){
  try { await navigator.clipboard.writeText(text); return true; }
  catch(e) { urlBox.focus(); urlBox.select(); return false; }
}

function currentQuickText(){
  const typed = quickInput.value.trim();
  if(typed) return typed;
  return `${langSelect.value.toLowerCase()} ${setSelect.value.toLowerCase()} ${numberInput.value} ${nameInput.value} ${editionSelect?.value === '1ST' ? '1st ' : ''}${condSelect.value.toLowerCase()}`.replace(/\s+/g,' ').trim();
}
function itemFromCurrent(url, result){
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    quick: currentQuickText(),
    url,
    name: nameInput.value.trim(),
    number: numberInput.value.trim(),
    set: setSelect.value,
    lang: langSelect.value,
    cond: condSelect.value,
    edition: editionSelect?.value || 'AUTO',
    exact: !!result.exact,
    note: result.note || ''
  };
}
function sameItem(a,b){
  return (a.quick || '').toLowerCase() === (b.quick || '').toLowerCase() || (a.url && b.url && a.url === b.url);
}
function addRecent(item){
  let arr = readStore(STORAGE_RECENT).filter(x => !sameItem(x,item));
  arr.unshift(item);
  arr = arr.slice(0, MAX_RECENT);
  writeStore(STORAGE_RECENT, arr);
  renderSaved();
}
function addFavorite(){
  if(!lastBuilt || !lastBuilt.url){ setStatus('Maak eerst een link.', 'warn'); return; }
  const item = itemFromCurrent(lastBuilt.url, lastBuilt.result);
  let arr = readStore(STORAGE_FAV).filter(x => !sameItem(x,item));
  arr.unshift(item);
  arr = arr.slice(0, MAX_FAV);
  writeStore(STORAGE_FAV, arr);
  renderSaved();
  setStatus('Favoriet opgeslagen ✅', 'ok');
}


function candidateButtonsHtml(candidates, cond){
  if(!candidates || !candidates.length) return '';
  return `<div class="candidateList">
    ${candidates.map((c, i) => `
      <button type="button" class="candidateBtn" data-candidate="${i}">
        <span>${escapeHtml(c.set)}</span>
        <small>${escapeHtml(c.name)} #${escapeHtml(c.number)}${c.rarity ? ' · ' + escapeHtml(c.rarity) : ''}</small>
      </button>
    `).join('')}
  </div>`;
}

function bindCandidateButtons(candidates){
  if(!candidates || !candidates.length) return;
  matchBox.querySelectorAll('[data-candidate]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const c = candidates[Number(btn.dataset.candidate)];
      if(!c) return;
      setSelect.value = c.set;
      nameInput.value = c.name;
      numberInput.value = c.number;
      updateCustomSelects();
      const url = c.url
        ? withFilters(c.url, langSelect.value, condSelect.value)
        : searchUrl(c.name, c.number, langSelect.value, condSelect.value, c.set, c.query);
      urlBox.value = url;
      openBtn.href = url;
      openBtn.classList.remove('disabled');
      lastBuilt = {url, result:{exact:true, note:`Gekozen: ${c.set} / ${c.name}`}};
      const ok = await copyToClipboard(url);
      setStatus(ok ? `${c.set} gekozen en link gekopieerd.` : `${c.set} gekozen.`, ok ? 'ok' : 'warn');
    });
  });
}

async function makeLink(autoCopy=true){
  const r = buildUrl();
  if(!r.url){
    urlBox.value = '';
    openBtn.href = '#';
    openBtn.classList.add('disabled');
    matchBox.innerHTML = '';
    lastBuilt = null;
    setStatus(r.note || 'Geen link.', 'warn');
    return;
  }
  urlBox.value = r.url;
  openBtn.href = r.url;
  openBtn.classList.remove('disabled');
  matchBox.innerHTML = `<b>${r.exact ? 'Directe kaartpagina' : (r.candidates ? 'Kies de juiste set' : 'Zoekpagina')}</b><br>${escapeHtml(r.note)}<br>${escapeHtml(nameInput.value || '-')} · ${escapeHtml(numberInput.value || '-')} · ${escapeHtml(setSelect.value)} · ${escapeHtml(langSelect.value)}/${escapeHtml(condSelect.value)}${editionSelect?.value === '1ST' ? ' · 1ST' : ''}${candidateButtonsHtml(r.candidates, condSelect.value)}`;
  bindCandidateButtons(r.candidates);
  lastBuilt = {url:r.url, result:r};
  addRecent(itemFromCurrent(r.url, r));
  if(autoCopy){
    const ok = await copyToClipboard(r.url);
    setStatus(ok ? 'Link gemaakt en gekopieerd.' : 'Link gemaakt. Kopieer handmatig.', ok ? 'ok' : 'warn');
  } else {
    setStatus('Link gemaakt.', 'ok');
  }
}

function applyItem(item, make=true){
  quickInput.value = item.quick || '';
  numberInput.value = item.number || '';
  nameInput.value = item.name || '';
  setSelect.value = item.set || 'AUTO';
  langSelect.value = item.lang || 'JP';
  condSelect.value = item.cond || 'NM';
  if(editionSelect) editionSelect.value = item.edition || 'AUTO';
  updateCustomSelects();
  if(make) makeLink(true);
}
function deleteItem(key, id){
  const arr = readStore(key).filter(x => x.id !== id);
  writeStore(key, arr);
  renderSaved();
}
function renderList(el, key){
  const arr = readStore(key);
  if(!arr.length){
    el.className = 'savedList empty';
    el.textContent = key === STORAGE_RECENT ? 'Nog geen recente zoekopdrachten.' : 'Nog geen favorieten.';
    return;
  }
  el.className = 'savedList';
  el.innerHTML = '';
  arr.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<div class="itemMain"><div class="itemTitle"></div><div class="itemMeta"></div></div><div class="itemActions"><button type="button" class="useBtn">Gebruik</button><a class="openMini" target="_blank" rel="noopener">Open</a><button type="button" class="delBtn">×</button></div>`;
    div.querySelector('.itemTitle').textContent = `${item.name || '-'} ${item.number ? '('+item.number+')' : ''}`;
    div.querySelector('.itemMeta').textContent = `${item.set || 'AUTO'} · ${item.lang}/${item.cond}${item.edition === '1ST' ? ' · 1ST' : ''} · ${item.exact ? 'direct' : 'search'}`;
    div.querySelector('.useBtn').addEventListener('click', () => applyItem(item, true));
    div.querySelector('.openMini').href = item.url || '#';
    div.querySelector('.delBtn').addEventListener('click', () => deleteItem(key, item.id));
    el.appendChild(div);
  });
}
function renderSaved(){ renderList(recentList, STORAGE_RECENT); renderList(favoriteList, STORAGE_FAV); }
function clearAll(){
  quickInput.value=''; numberInput.value=''; nameInput.value=''; setSelect.value='AUTO'; langSelect.value='JP'; condSelect.value='NM'; if(editionSelect) editionSelect.value='AUTO';
  updateCustomSelects();
  urlBox.value=''; openBtn.href='#'; openBtn.classList.add('disabled'); matchBox.innerHTML=''; lastBuilt=null;
  setStatus('Klaar.',''); quickInput.focus();
}
function processQuick(){
  if(quickInput.value.trim()) parseQuick();
  updateCustomSelects();
  makeLink(true);
}



function closeCustomSelects(){
  // v51: geen dropdowns. Set blijft AUTO/detected; taal/staat zijn vaste knoppen.
}

function updateCustomSelects(){
  const setInfo = document.getElementById('setInfo');
  if(setInfo){
    const set = setSelect.value || 'AUTO';
    if(set === 'AUTO'){
      setInfo.innerHTML = 'Set: <b>AUTO</b> · vul alleen <b>nummer + naam</b>. Ik open veilig zoeken als de set niet exact bekend is.';
    } else {
      setInfo.innerHTML = 'Set gedetecteerd: <b>' + set + '</b> · wijzig door de set in snel zoeken te typen.';
    }
  }
  document.querySelectorAll('[data-choice-target]').forEach(bar => {
    const target = document.getElementById(bar.dataset.choiceTarget);
    if(!target) return;
    bar.querySelectorAll('.choiceBtn').forEach(btn => {
      const selected = btn.dataset.value === target.value;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  });
}

function scrollActiveChipIntoView(select){
  // v51: niet nodig.
}

function initCustomSelects(){
  document.querySelectorAll('.hiddenSelect, select').forEach(sel => {
    sel.classList.add('hiddenSelect');
  });

  document.querySelectorAll('[data-choice-target] .choiceBtn').forEach(btn => {
    if(btn._ready) return;
    btn._ready = true;
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const bar = btn.closest('[data-choice-target]');
      const target = document.getElementById(bar.dataset.choiceTarget);
      if(!target) return;
      target.value = btn.dataset.value;
      updateCustomSelects();
      target.dispatchEvent(new Event('change', {bubbles:true}));
    });
  });

  updateCustomSelects();
}

function manualFieldChanged(){
  // Als je snel alleen nummer + naam invult, mag een oude set uit snelzoeken nooit blijven hangen.
  quickInput.value = '';
  setSelect.value = 'AUTO';
  updateCustomSelects();
}

function bind(){
  document.querySelectorAll('[data-fill]').forEach(b => b.addEventListener('click', () => { quickInput.value = b.dataset.fill; processQuick(); }));
  quickInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); processQuick(); }});
  quickGo.addEventListener('click', processQuick);
  makeBtn.addEventListener('click', processQuick);
  copyBtn.addEventListener('click', () => makeLink(true));
  favoriteBtn.addEventListener('click', addFavorite);
  clearBtn.addEventListener('click', clearAll);
  clearRecentBtn.addEventListener('click', () => { writeStore(STORAGE_RECENT, []); renderSaved(); setStatus('Recent gewist.', ''); });
  clearFavBtn.addEventListener('click', () => { writeStore(STORAGE_FAV, []); renderSaved(); setStatus('Favorieten gewist.', ''); });

  [numberInput,nameInput].forEach(el => {
    el.addEventListener('input', manualFieldChanged);
    el.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); makeLink(true); }});
  });

  [setSelect,langSelect,condSelect,editionSelect].filter(Boolean).forEach(el => el.addEventListener('change', () => makeLink(true)));
}

async function unregisterOldServiceWorkers(){
  if(!('serviceWorker' in navigator)) return;
  try {
    const appPath = new URL('./', window.location.href).pathname;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs
      .filter(r => {
        try { return new URL(r.scope).pathname.startsWith(appPath); }
        catch(e) { return false; }
      })
      .map(r => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith('whatnotai-mobile') || k.startsWith('cardscout'))
      .map(k => caches.delete(k)));
  } catch(e) {}
}


// ---------------- Photo + Local OCR + Guided Scan v74 ----------------
const takePhotoBtn = document.getElementById('takePhotoBtn');
const choosePhotoBtn = document.getElementById('choosePhotoBtn');
const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');
const cameraShell = document.getElementById('cameraShell');
const cameraViewport = document.getElementById('cameraViewport');
const cameraVideo = document.getElementById('cameraVideo');
const liveCardGuide = document.getElementById('liveCardGuide');
const cameraCancelBtn = document.getElementById('cameraCancelBtn');
const cameraShutterBtn = document.getElementById('cameraShutterBtn');
const cameraFallbackBtn = document.getElementById('cameraFallbackBtn');
const photoStage = document.getElementById('photoStage');
const photoPlaceholder = document.getElementById('photoPlaceholder');
const photoCanvas = document.getElementById('photoCanvas');
const photoTools = document.getElementById('photoTools');
const rotateLeftBtn = document.getElementById('rotateLeftBtn');
const rotateRightBtn = document.getElementById('rotateRightBtn');
const clearPhotoBtn = document.getElementById('clearPhotoBtn');
const continuePhotoBtn = document.getElementById('continuePhotoBtn');
const scanPhotoBtn = document.getElementById('scanPhotoBtn');
const ocrProgress = document.getElementById('ocrProgress');
const ocrProgressFill = document.getElementById('ocrProgressFill');
const ocrProgressText = document.getElementById('ocrProgressText');
const ocrResult = document.getElementById('ocrResult');
const scanEditionQuick = document.getElementById('scanEditionQuick');
const photoCtx = photoCanvas ? photoCanvas.getContext('2d') : null;

let photoImage = null;
let photoRotation = 0;
let activePhotoUrl = null;
let photoGuidedCrop = false;
let photoAutoCropped = false;
let cameraStream = null;

function resetPhoto(){
  photoImage = null;
  photoRotation = 0;
  photoGuidedCrop = false;
  photoAutoCropped = false;
  if(photoStage) photoStage.classList.remove('galleryPhoto','guidedPhoto');
  if(activePhotoUrl){
    URL.revokeObjectURL(activePhotoUrl);
    activePhotoUrl = null;
  }
  if(photoCtx) photoCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
  if(photoStage) photoStage.classList.add('empty');
  if(photoPlaceholder) photoPlaceholder.hidden = false;
  if(photoTools) photoTools.hidden = true;
  if(continuePhotoBtn) continuePhotoBtn.disabled = true;
  if(scanPhotoBtn) scanPhotoBtn.disabled = true;
  if(ocrProgress) ocrProgress.hidden = true;
  if(ocrResult){ ocrResult.hidden = true; ocrResult.textContent = ''; }
  if(scanEditionQuick) scanEditionQuick.hidden = true;
  if(cameraInput) cameraInput.value = '';
  if(galleryInput) galleryInput.value = '';
}

function drawPhoto(){
  if(!photoImage || !photoCtx || !photoCanvas) return;

  const stageWidth = Math.max(280, Math.min(900, photoStage.clientWidth * 2));
  const stageHeight = Math.round(stageWidth * 1.22);
  photoCanvas.width = stageWidth;
  photoCanvas.height = stageHeight;

  photoCtx.clearRect(0,0,stageWidth,stageHeight);
  photoCtx.save();
  photoCtx.translate(stageWidth / 2, stageHeight / 2);
  photoCtx.rotate(photoRotation * Math.PI / 180);

  const rotated = Math.abs(photoRotation % 180) === 90;
  const availableW = rotated ? stageHeight : stageWidth;
  const availableH = rotated ? stageWidth : stageHeight;
  const scale = Math.min(availableW / photoImage.width, availableH / photoImage.height);
  const drawW = photoImage.width * scale;
  const drawH = photoImage.height * scale;

  photoCtx.drawImage(photoImage, -drawW / 2, -drawH / 2, drawW, drawH);
  photoCtx.restore();

  photoStage.classList.remove('empty');
  photoPlaceholder.hidden = true;
  photoTools.hidden = false;
  continuePhotoBtn.disabled = false;
  if(scanPhotoBtn) scanPhotoBtn.disabled = false;
}

function loadPhotoFile(file, options={}){
  if(!file || !file.type.startsWith('image/')){
    setStatus('Kies een geldige foto.', 'warn');
    return;
  }
  if(file.size > 25 * 1024 * 1024){
    setStatus('Deze foto is groter dan 25 MB. Kies een kleinere foto.', 'warn');
    return;
  }

  photoGuidedCrop = !!options.guidedCrop;
  photoAutoCropped = false;
  if(photoStage){
    photoStage.classList.toggle('galleryPhoto', !photoGuidedCrop);
    photoStage.classList.toggle('guidedPhoto', photoGuidedCrop);
  }
  // v70: een nieuwe kaartfoto mag NOOIT oude scanvelden meenemen.
  // Taal en conditie blijven staan; kaartidentiteit + editie worden opnieuw bepaald.
  numberInput.value = '';
  nameInput.value = '';
  setSelect.value = 'AUTO';
  quickInput.value = '';
  if(editionSelect) editionSelect.value='AUTO';
  updateCustomSelects();
  urlBox.value='';
  openBtn.href='#';
  openBtn.classList.add('disabled');
  matchBox.innerHTML='';
  lastBuilt=null;
  if(activePhotoUrl) URL.revokeObjectURL(activePhotoUrl);
  activePhotoUrl = URL.createObjectURL(file);

  const img = new Image();
  img.decoding = 'async';
  img.onerror = () => {
    if(activePhotoUrl){ URL.revokeObjectURL(activePhotoUrl); activePhotoUrl = null; }
    setStatus('Foto kon niet worden geopend. Probeer een JPG, PNG of HEIC die je browser ondersteunt.', 'warn');
  };
  img.onload = () => {
    photoImage = img;
    photoRotation = 0;
    drawPhoto();
    if(activePhotoUrl){ URL.revokeObjectURL(activePhotoUrl); activePhotoUrl = null; }
    setStatus(photoGuidedCrop ? 'Foto geladen vanuit het camerakader.' : 'Galerijfoto geladen. Het stippelkader is alleen voor de camera; bij Scan kaart zoekt CardScout automatisch de kaartranden.', 'ok');
  };
  img.src = activePhotoUrl;
}


function stopGuidedCamera(){
  if(cameraStream){
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  if(cameraVideo) cameraVideo.srcObject = null;
  if(cameraShell){
    cameraShell.hidden = true;
    cameraShell.setAttribute('aria-hidden','true');
  }
  document.body.classList.remove('cameraOpen');
}

async function openGuidedCamera(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !cameraShell || !cameraVideo){
    cameraInput?.click();
    return;
  }
  try{
    cameraShell.hidden = false;
    cameraShell.setAttribute('aria-hidden','false');
    document.body.classList.add('cameraOpen');
    cameraStream = await navigator.mediaDevices.getUserMedia({
      audio:false,
      video:{
        facingMode:{ideal:'environment'},
        width:{ideal:1920},
        height:{ideal:1440}
      }
    });
    cameraVideo.srcObject = cameraStream;
    await cameraVideo.play();
  }catch(err){
    console.warn('Guided camera unavailable, falling back to native capture.', err);
    stopGuidedCamera();
    setStatus('Live kader kon niet openen. De gewone camera wordt gebruikt.', 'warn');
    cameraInput?.click();
  }
}

function guideSourceRect(){
  if(!cameraVideo || !liveCardGuide || !cameraViewport || !cameraVideo.videoWidth || !cameraVideo.videoHeight) return null;
  const videoRect = cameraVideo.getBoundingClientRect();
  const guideRect = liveCardGuide.getBoundingClientRect();
  const vw = cameraVideo.videoWidth;
  const vh = cameraVideo.videoHeight;
  const scale = Math.max(videoRect.width / vw, videoRect.height / vh); // object-fit: cover
  const renderedW = vw * scale;
  const renderedH = vh * scale;
  const cropOffsetX = (renderedW - videoRect.width) / 2;
  const cropOffsetY = (renderedH - videoRect.height) / 2;
  const relX = guideRect.left - videoRect.left;
  const relY = guideRect.top - videoRect.top;
  let sx = (relX + cropOffsetX) / scale;
  let sy = (relY + cropOffsetY) / scale;
  let sw = guideRect.width / scale;
  let sh = guideRect.height / scale;
  // Include a small safety margin around the visible guide so card edges are not clipped.
  const padX = sw * 0.055;
  const padY = sh * 0.045;
  sx -= padX; sy -= padY; sw += padX * 2; sh += padY * 2;
  sx = Math.max(0, sx); sy = Math.max(0, sy);
  sw = Math.min(vw - sx, sw); sh = Math.min(vh - sy, sh);
  return {sx,sy,sw,sh};
}

async function captureGuidedPhoto(){
  if(!cameraVideo || cameraVideo.readyState < 2){
    setStatus('Camera is nog niet klaar. Probeer nogmaals.', 'warn');
    return;
  }
  const r = guideSourceRect();
  if(!r){
    setStatus('Kaartkader kon niet worden gelezen.', 'warn');
    return;
  }
  const maxOut = 2300;
  const scale = Math.min(1, maxOut / Math.max(r.sw, r.sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(r.sw * scale));
  canvas.height = Math.max(1, Math.round(r.sh * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cameraVideo, r.sx, r.sy, r.sw, r.sh, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',0.98));
  if(!blob){
    setStatus('Foto kon niet worden opgeslagen. Probeer opnieuw.', 'warn');
    return;
  }
  const file = new File([blob], `cardscout-${Date.now()}.jpg`, {type:'image/jpeg'});
  stopGuidedCamera();
  loadPhotoFile(file,{guidedCrop:true});
}



let tesseractPromise = null;
let ocrWorker = null;
let ocrBusy = false;

function setOcrProgress(progress, text){
  if(ocrProgress) ocrProgress.hidden = false;
  if(ocrProgressFill) ocrProgressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  if(ocrProgressText && text) ocrProgressText.textContent = text;
}

function loadTesseract(){
  if(window.Tesseract) return Promise.resolve(window.Tesseract);
  if(tesseractPromise) return tesseractPromise;
  tesseractPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';
    script.async = true;
    script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('Tesseract niet beschikbaar'));
    script.onerror = () => reject(new Error('OCR-module kon niet worden geladen'));
    document.head.appendChild(script);
  });
  return tesseractPromise;
}

function detectYellowCardBounds(source){
  // v75 GALLERY AUTO-CROP: vintage Pokemonkaarten hebben doorgaans een gele rand.
  // We zoeken die rand alleen als hulpmiddel om een galerijfoto te normaliseren.
  // Bij onvoldoende zekerheid blijft de volledige foto intact; nooit blind croppen.
  if(!source || source.width<120 || source.height<160) return null;
  const maxDim=640;
  const scale=Math.min(1,maxDim/Math.max(source.width,source.height));
  const w=Math.max(1,Math.round(source.width*scale));
  const h=Math.max(1,Math.round(source.height*scale));
  const tmp=document.createElement('canvas'); tmp.width=w; tmp.height=h;
  const ctx=tmp.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(source,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h).data;
  let mask=new Uint8Array(w*h);
  let yellowCount=0;
  for(let i=0;i<w*h;i++){
    const r=data[i*4],g=data[i*4+1],b=data[i*4+2];
    const yellow=(r>135 && g>82 && b<150 && (r-b)>48 && (g-b)>24 && r>g*.82);
    if(yellow){mask[i]=1;yellowCount++;}
  }
  if(yellowCount < w*h*.008) return null;
  // Kleine dilatie zodat onderbroken gele randen als één component kunnen worden gezien.
  const dil=new Uint8Array(mask.length);
  for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){
    let on=0;
    for(let yy=y-1;yy<=y+1&&!on;yy++) for(let xx=x-1;xx<=x+1;xx++) if(mask[yy*w+xx]){on=1;break;}
    if(on) dil[y*w+x]=1;
  }
  mask=dil;
  const seen=new Uint8Array(mask.length), q=[];
  let best=null;
  for(let sy=0;sy<h;sy++) for(let sx=0;sx<w;sx++){
    const start=sy*w+sx;
    if(!mask[start]||seen[start]) continue;
    q.length=0;q.push(start);seen[start]=1;let qi=0,minX=sx,maxX=sx,minY=sy,maxY=sy,area=0;
    while(qi<q.length){
      const idx=q[qi++],y=Math.floor(idx/w),x=idx-y*w;area++;
      if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++) for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){
        const ni=yy*w+xx;if(mask[ni]&&!seen[ni]){seen[ni]=1;q.push(ni);}
      }
    }
    const bw=maxX-minX+1,bh=maxY-minY+1,ratio=bw/Math.max(1,bh),boxArea=bw*bh;
    if(bh<h*.32 || bw<w*.22 || ratio<.48 || ratio>.94 || boxArea>w*h*.82) continue;
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    const centerPenalty=Math.hypot((cx-w/2)/w,(cy-h/2)/h);
    const ratioPenalty=Math.abs(ratio-(63/88));
    const score=area*(1.4-ratioPenalty)*(1.2-Math.min(.7,centerPenalty));
    if(!best||score>best.score) best={minX,minY,maxX,maxY,bw,bh,score};
  }
  if(!best) return null;
  // Gele pixels zitten meestal op de rand zelf. Een kleine veiligheidsmarge houdt de hele kaart binnen beeld.
  const padX=best.bw*.025,padY=best.bh*.018;
  let left=Math.max(0,(best.minX-padX)/scale), top=Math.max(0,(best.minY-padY)/scale);
  let right=Math.min(source.width,(best.maxX+1+padX)/scale), bottom=Math.min(source.height,(best.maxY+1+padY)/scale);
  const bw=right-left,bh=bottom-top,ratio=bw/Math.max(1,bh);
  if(bw<source.width*.20 || bh<source.height*.30 || ratio<.48 || ratio>.95) return null;
  return {left,top,width:bw,height:bh,confidence:'yellow border'};
}

function cropCanvasToBounds(source,b){
  if(!source||!b) return source;
  const out=document.createElement('canvas');
  out.width=Math.max(1,Math.round(b.width)); out.height=Math.max(1,Math.round(b.height));
  out.getContext('2d',{willReadFrequently:true}).drawImage(source,b.left,b.top,b.width,b.height,0,0,out.width,out.height);
  return out;
}

function makeOcrCanvas(){
  if(!photoImage) return null;
  photoAutoCropped=false;
  const rotated = Math.abs(photoRotation % 180) === 90;
  const srcW = rotated ? photoImage.height : photoImage.width;
  const srcH = rotated ? photoImage.width : photoImage.height;
  // Meer bronpixels bewaren voor het piepkleine collector number rechtsonder.
  const maxDim = photoGuidedCrop ? 2300 : 2600;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
  ctx.save();
  ctx.translate(w/2,h/2);
  ctx.rotate(photoRotation * Math.PI / 180);
  const drawW = photoImage.width * scale;
  const drawH = photoImage.height * scale;
  ctx.drawImage(photoImage,-drawW/2,-drawH/2,drawW,drawH);
  ctx.restore();

  // Een camera-opname is al door het live kader uitgesneden. Een galerijfoto niet:
  // probeer daar eerst de daadwerkelijke kaartranden te vinden. Lukt dat niet, scan de hele foto.
  if(!photoGuidedCrop){
    const bounds=detectYellowCardBounds(canvas);
    if(bounds){
      const cropped=cropCanvasToBounds(canvas,bounds);
      photoAutoCropped=true;
      return cropped;
    }
  }
  return canvas;
}


function makeEnhancedCrop(source, rect, options={}){
  if(!source || !rect) return null;
  const sx=Math.max(0,Math.round(rect.left||0));
  const sy=Math.max(0,Math.round(rect.top||0));
  const sw=Math.max(1,Math.min(source.width-sx,Math.round(rect.width||source.width)));
  const sh=Math.max(1,Math.min(source.height-sy,Math.round(rect.height||source.height)));
  const zoom=options.zoom || 2.2;
  const out=document.createElement('canvas');
  out.width=Math.max(1,Math.round(sw*zoom));
  out.height=Math.max(1,Math.round(sh*zoom));
  const ctx=out.getContext('2d',{willReadFrequently:true});
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(source,sx,sy,sw,sh,0,0,out.width,out.height);
  const img=ctx.getImageData(0,0,out.width,out.height);
  const d=img.data;
  const contrast=options.contrast || 1.55;
  const threshold=options.threshold;
  for(let i=0;i<d.length;i+=4){
    let g=(d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114);
    g=(g-128)*contrast+128;
    g=Math.max(0,Math.min(255,g));
    if(typeof threshold==='number') g=g>=threshold?255:0;
    if(options.invert) g=255-g;
    d[i]=d[i+1]=d[i+2]=g;
  }
  ctx.putImageData(img,0,0);
  return out;
}

function normalizeScanText(v){
  return String(v || '').replace(/[’‘`]/g,"'").replace(/[^A-Za-z0-9À-ÿ'./&+\- ]+/g,' ').replace(/\s+/g,' ').trim();
}
function simpleNorm(v){ return normalizeScanText(v).toLowerCase().replace(/[^a-z0-9]/g,''); }
function levenshtein(a,b){
  a=simpleNorm(a); b=simpleNorm(b);
  if(!a.length) return b.length; if(!b.length) return a.length;
  const row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    let prev=row[0]; row[0]=i;
    for(let j=1;j<=b.length;j++){
      const old=row[j];
      row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=old;
    }
  }
  return row[b.length];
}
function pokemonCandidates(){
  const vals = Object.values(EMBEDDED_DATA.pokedex || {});
  const known = (EMBEDDED_DATA.knownCards || []).map(c=>c.name);
  return [...new Set([...vals,...known].filter(Boolean))];
}
function findPokemonName(text){
  const clean = normalizeScanText(text);
  const low = clean.toLowerCase();
  const candidates = pokemonCandidates();
  const direct = candidates
    .filter(n => low.includes(n.toLowerCase()))
    .sort((a,b)=>b.length-a.length)[0];
  if(direct) return {name:direct, confidence:'hoog', score:1, safe:true};

  const words = clean.split(/\s+/).filter(w=>w.length>=3);
  let best=null;
  for(const name of candidates){
    const nn=simpleNorm(name);
    if(nn.length<3 || nn.length>18) continue;
    for(const word of words){
      const ww=simpleNorm(word);
      if(Math.abs(ww.length-nn.length)>2) continue;
      const d=levenshtein(ww,nn);
      const max=Math.max(ww.length,nn.length);
      const score=1-d/max;
      const threshold = nn.length<=4 ? 0.90 : 0.79;
      if(score>=threshold && (!best || score>best.score)) best={name,score};
    }
  }
  if(!best) return null;
  const safe = best.score>=0.87;
  return {
    name:best.name,
    confidence:safe?'redelijk':'mogelijk',
    score:best.score,
    safe
  };
}
function normalizeCollectorOcr(text){
  return String(text||'')
    .replace(/[OoQ]/g,'0')
    .replace(/[Il|!]/g,'1');
}
function collectorDigitStreams(text){
  const t=normalizeCollectorOcr(text);
  const streams=[];
  // OCR zet kleine cijfers vaak los: "6 2 / 1 1 1". Bewaar zulke reeksen als één digit-stream.
  for(const m of t.matchAll(/[0-9\s/.,:;_-]{2,}/g)){
    const d=(m[0].match(/\d/g)||[]).join('');
    if(d.length>=2 && d.length<=10) streams.push(d);
  }
  const whole=(t.match(/\d/g)||[]).join('');
  if(whole.length>=2 && whole.length<=12) streams.push(whole);
  return [...new Set(streams)];
}
function extractCollectorNumber(text){
  const t=normalizeCollectorOcr(text);
  const frac=[...t.matchAll(/\b(\d{1,3})\s*[\/|]\s*(\d{1,3})\b/g)]
    .map(m=>({number:String(parseInt(m[1],10)), total:parseInt(m[2],10), source:'strict'}))
    .filter(x=>x.total>=5 && x.total<=300 && Number(x.number)<=x.total+20);
  return frac[0] || null;
}

// Collector-number denominators zoals ze daadwerkelijk op de Engelse kaarten staan.
// Meerdere sets mogen hetzelfde totaal hebben; naam + lokale kandidaten lossen dat later veilig op.
const SET_TOTAL_HINTS = {
  18:['SOUTHERN ISLANDS'],
  62:['FOSSIL'],64:['JUNGLE'],66:['NEO REVELATION'],75:['NEO DISCOVERY'],82:['ROCKET'],
  95:['EX TEAM MAGMA AQUA'],97:['EX DRAGON'],100:['EX SANDSTORM','EX CRYSTAL GUARDIANS'],
  101:['EX HIDDEN LEGENDS','EX DRAGON FRONTIERS'],102:['BASE'],105:['NEO DESTINY'],106:['EX EMERALD'],
  107:['EX DEOXYS'],108:['EX POWER KEEPERS'],109:['EX RUBY SAPPHIRE','EX TEAM ROCKET RETURNS'],
  110:['LEGENDARY COLLECTION','EX HOLON PHANTOMS'],111:['NEO GENESIS'],112:['EX FIRERED LEAFGREEN'],
  113:['EX DELTA SPECIES'],115:['EX UNSEEN FORCES'],130:['BASE SET 2'],132:['GYM HEROES','GYM CHALLENGE'],
  144:['SKYRIDGE'],146:['LEGENDS AWAKENED'],147:['AQUAPOLIS'],165:['EXPEDITION'],92:['EX LEGEND MAKER'],12:['EX TRAINER KIT 2']
};
function setTotalForSet(setKey){
  for(const [total,sets] of Object.entries(SET_TOTAL_HINTS)){
    if((sets||[]).includes(setKey)) return Number(total);
  }
  return null;
}
function candidateCollectorPattern(card){
  if(!card) return null;
  const total=setTotalForSet(card.set);
  const num=Number(cleanNumber(card.number));
  if(!total || !Number.isFinite(num) || num<=0) return null;
  return {card,number:String(num),total,pattern:`${num}${total}`};
}
function digitDistance(a,b){
  a=String(a||''); b=String(b||'');
  if(!a.length) return b.length; if(!b.length) return a.length;
  const row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    let prev=row[0]; row[0]=i;
    for(let j=1;j<=b.length;j++){
      const old=row[j];
      row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=old;
    }
  }
  return row[b.length];
}
function matchCollectorToCandidates(text,cards=[]){
  const candidates=(cards||[]).map(candidateCollectorPattern).filter(Boolean);
  if(!candidates.length) return null;
  const streams=collectorDigitStreams(text);
  if(!streams.length) return null;
  let best=null;
  for(const c of candidates){
    const totalText=String(c.total);
    for(const stream of streams){
      let score=0;
      let reason='';
      if(stream.includes(c.pattern)){
        score=1; reason='exact digits';
      }else if(stream.endsWith(totalText)){
        // Het denominator is voor setdetectie zeer waardevol. Bij één naamkandidaat in die set is dit veilig.
        score=.92; reason='set total';
        const prefix=stream.slice(0,-totalText.length);
        if(prefix && Number(prefix)===Number(c.number)) score=.99;
      }else if(stream.includes(totalText)){
        score=.84; reason='set total fragment';
      }else{
        // Kleine OCR-fout tolereren, bv. 62111 -> 6211 of 621I1.
        const lengths=[c.pattern.length-1,c.pattern.length,c.pattern.length+1].filter(n=>n>=2);
        for(const len of lengths){
          if(stream.length<len) continue;
          for(let i=0;i<=stream.length-len;i++){
            const part=stream.slice(i,i+len);
            const d=digitDistance(part,c.pattern);
            const q=1-d/Math.max(part.length,c.pattern.length);
            if(q>score){score=q;reason='fuzzy digits';}
          }
        }
      }
      if(score>=.76 && (!best || score>best.score)) best={...c,score,reason,stream};
    }
  }
  if(!best) return null;
  // Eis bij fuzzy matches een duidelijke winnaar, zodat twee sets met dezelfde naam nooit worden gegokt.
  const rivals=[];
  for(const c of candidates){
    if(c.card===best.card) continue;
    let r=0;
    for(const stream of streams){
      if(stream.includes(c.pattern)) r=Math.max(r,1);
      else if(stream.endsWith(String(c.total))) r=Math.max(r,.92);
      else if(stream.includes(String(c.total))) r=Math.max(r,.84);
      else{
        const d=digitDistance(stream.slice(-Math.min(stream.length,c.pattern.length)),c.pattern);
        r=Math.max(r,1-d/Math.max(Math.min(stream.length,c.pattern.length),c.pattern.length));
      }
    }
    rivals.push(r);
  }
  const rival=Math.max(0,...rivals);
  if(best.score<.90 && best.score-rival<.18) return null;
  return best;
}
function extractLikelySetTotal(text){
  const t=normalizeCollectorOcr(text);
  const hits=[];
  for(const stream of collectorDigitStreams(t)){
    const direct=Number(stream);
    if(Object.prototype.hasOwnProperty.call(SET_TOTAL_HINTS,direct)) hits.push(direct);
    for(const totalKey of Object.keys(SET_TOTAL_HINTS)){
      const ts=String(totalKey);
      if(stream===ts || stream.endsWith(ts)){
        const prefix=stream.slice(0,-ts.length);
        if(!prefix || (Number(prefix)>0 && Number(prefix)<=Number(totalKey)+20)) hits.push(Number(totalKey));
      }
    }
  }
  const unique=[...new Set(hits)];
  return unique.length===1 ? unique[0] : null;
}
function matchPartialCollectorToCandidates(text,cards=[]){
  const candidates=(cards||[]).map(candidateCollectorPattern).filter(Boolean);
  if(!candidates.length) return null;
  const t=normalizeCollectorOcr(text);
  const hits=new Map();

  // v76 NUMBER PATCH: kleine collector-nummers verliezen vaak de laatste cijfers van
  // de denominator (bijv. 62/111 -> 62/1). Gebruik zo'n half gelezen breuk alleen
  // als de numerator exact bij één lokale naamkandidaat past. Geen losse getallen gokken.
  for(let i=0;i<t.length;i++){
    if(t[i]!=='/' && t[i]!=='|') continue;
    const leftDigits=(t.slice(Math.max(0,i-10),i).match(/\d/g)||[]).join('').slice(-3);
    const rightDigits=(t.slice(i+1,Math.min(t.length,i+9)).match(/\d/g)||[]).join('').slice(0,3);
    if(!leftDigits) continue;

    for(const c of candidates){
      const num=String(c.number), total=String(c.total);
      if(!leftDigits.endsWith(num)) continue;

      let score=.91;
      let reason='partial numerator';
      if(rightDigits){
        if(total.startsWith(rightDigits)){ score=.995; reason='partial fraction'; }
        else if(total.startsWith(rightDigits[0])){ score=.965; reason='partial denominator'; }
        else continue;
      }
      const prev=hits.get(c.card)||{...c,score:0,count:0,reason};
      prev.score=Math.max(prev.score,score);
      prev.count+=1;
      prev.reason=reason;
      hits.set(c.card,prev);
    }
  }

  const ranked=[...hits.values()]
    .map(x=>({...x,score:Math.min(1,x.score+(x.count>=2?.004:0))}))
    .sort((a,b)=>b.score-a.score || b.count-a.count);
  if(!ranked.length) return null;
  const best=ranked[0], rival=ranked[1];
  if(best.score<.94) return null;
  if(rival && best.score-rival.score<.025 && best.count===rival.count) return null;
  return best;
}
function extractCollectorNumberLoose(text, candidateCards=[]){
  const strict=extractCollectorNumber(text);
  if(strict){
    const supportedTotal=Object.prototype.hasOwnProperty.call(SET_TOTAL_HINTS, Number(strict.total));
    const scopedExact=(candidateCards||[]).filter(c=>
      cleanNumber(c.number)===cleanNumber(strict.number) && setTotalForSet(c.set)===Number(strict.total)
    );
    // v77: OCR can hallucinate tiny fractions such as 4/7. A denominator that is not
    // part of any supported set is not allowed to beat a local name candidate.
    if(supportedTotal || scopedExact.length===1) return strict;
  }
  const streams=collectorDigitStreams(text);
  const totals=Object.keys(SET_TOTAL_HINTS).map(Number).sort((a,b)=>String(b).length-String(a).length);
  for(const stream of streams){
    for(const total of totals){
      const ts=String(total);
      if(!stream.endsWith(ts) || stream.length<=ts.length) continue;
      const prefix=stream.slice(0,-ts.length);
      const num=Number(prefix);
      if(prefix && Number.isFinite(num) && num>0 && num<=total+20){
        return {number:String(num), total, source:'digit stream'};
      }
    }
  }
  const partial=matchPartialCollectorToCandidates(text,candidateCards);
  if(partial) return {number:partial.number,total:partial.total,source:partial.reason,candidateCard:partial.card,score:partial.score};
  const match=matchCollectorToCandidates(text,candidateCards);
  if(match) return {number:match.number,total:match.total,source:match.reason,candidateCard:match.card,score:match.score};
  return null;
}
function inferSetFromTotal(total, candidateCards=[]){
  const hits=SET_TOTAL_HINTS[Number(total)] || [];
  if(candidateCards?.length){
    const allowed=new Set(candidateCards.map(c=>c.set));
    const scoped=hits.filter(s=>allowed.has(s));
    if(scoped.length===1) return scoped[0];
  }
  return hits.length===1 ? hits[0] : null;
}
function extractTrainerTitle(raw){
  const lines=String(raw||'').split(/\r?\n/).map(x=>normalizeScanText(x)).filter(Boolean);
  const idx=lines.findIndex(line=>/\btrainer\b/i.test(line));
  if(idx>=0){
    for(let i=idx+1;i<Math.min(lines.length,idx+3);i++){
      const line=lines[i].replace(/^trainer\s*/i,'').trim();
      if(line.length>=3 && line.length<=42 && !/^(search your|put |flip |basic pokemon)/i.test(line)) return line;
    }
  }
  const inline=normalizeScanText(raw).match(/\bTRAINER\b\s+([A-Za-z][A-Za-z' -]{2,38})/i);
  return inline ? inline[1].trim() : '';
}
function looksLikeTrainer(raw){
  return /\btrainer\b/i.test(String(raw||''));
}

const COMMON_TRAINER_TITLES = [
  'Energy Search','Energy Removal','Super Energy Removal','Energy Retrieval','Bill','Professor Oak',
  'Pokemon Trader','Pokémon Trader','Pokemon Breeder','Pokémon Breeder','Computer Search','Item Finder',
  'Lass','Maintenance','PlusPower','Pokedex','Pokédex','Potion','Super Potion','Switch','Defender',
  'Gust of Wind','Full Heal','Revive','Scoop Up','Devolution Spray','Imposter Professor Oak',
  'Pokemon Center','Pokémon Center','Clefairy Doll','Mysterious Fossil','Recycle','Gambler','Mr. Fuji',
  'The Boss Way','Challenge!','Here Comes Team Rocket!','Nightly Garbage Run','Goop Gas Attack'
];
function findTrainerCandidate(raw){
  const clean=normalizeScanText(raw);
  const low=clean.toLowerCase();
  const direct=COMMON_TRAINER_TITLES
    .filter(t=>low.includes(t.toLowerCase().replace('é','e')) || low.includes(t.toLowerCase()))
    .sort((a,b)=>b.length-a.length)[0];
  if(direct) return direct.replace('Pokemon','Pokémon');
  const words=clean.split(/\s+/).filter(Boolean);
  let best=null;
  for(const title of COMMON_TRAINER_TITLES){
    const parts=title.split(/\s+/).length;
    for(let i=0;i<words.length;i++){
      const phrase=words.slice(i,i+parts+1).join(' ');
      if(!phrase) continue;
      const a=simpleNorm(title), b=simpleNorm(phrase);
      if(Math.abs(a.length-b.length)>4) continue;
      const score=1-levenshtein(a,b)/Math.max(a.length,b.length,1);
      if(score>=0.78 && (!best || score>best.score)) best={title,score};
    }
  }
  return best?.title || '';
}

const SPECIAL_SCAN_HINTS = {
  'shellder|54|62':{set:'FOSSIL'},
  'slowpoke|55|62':{set:'FOSSIL'},
  'energysearch|59|62':{set:'FOSSIL'},
  'darkvileplume|30|82':{set:'ROCKET'},
  'chikorita|53|111':{set:'NEO GENESIS'},
  'bagon|43|101':{set:'EX DRAGON FRONTIERS'},
  'beldum|1|12':{set:'EX TRAINER KIT 2'},
  'metang|5|12':{set:'EX TRAINER KIT 2'},
  'horsea|62|111':{set:'NEO GENESIS'},
  'horsea|49|62':{set:'FOSSIL'}
};
function specialScanHint(name, collector){
  if(!name || !collector) return null;
  return SPECIAL_SCAN_HINTS[`${simpleNorm(name)}|${collector.number}|${collector.total}`] || null;
}

async function detectFirstEditionStamp(worker, canvas, guided){
  // v70: de WOTC 1st Edition-stempel is klein. Scan meerdere gerichte zones
  // rond midden-links onder het artwork, op meerdere contrast/threshold-niveaus.
  // CardScout zet 1ST alleen automatisch aan als EDITION overtuigend wordt gelezen.
  const rects = guided ? [
    {left:.00, top:.36, width:.30, height:.24},
    {left:.00, top:.30, width:.34, height:.34},
    {left:.02, top:.42, width:.28, height:.22}
  ] : [
    {left:.00, top:.32, width:.34, height:.28},
    {left:.00, top:.26, width:.40, height:.40}
  ];
  let allText='';
  const isHit = txt => {
    const compact=String(txt||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    return compact.includes('edition') || /editi[o0]n/.test(compact) || /edit[i1l][o0]n/.test(compact);
  };
  for(const rr of rects){
    const rect={
      left:Math.round(canvas.width*rr.left), top:Math.round(canvas.height*rr.top),
      width:Math.round(canvas.width*rr.width), height:Math.round(canvas.height*rr.height)
    };
    for(const cfg of [
      {zoom:4.8,contrast:2.25,threshold:125},
      {zoom:5.2,contrast:2.55,threshold:155},
      {zoom:4.6,contrast:2.35}
    ]){
      const crop=makeEnhancedCrop(canvas,rect,cfg);
      if(!crop) continue;
      await worker.setParameters({tessedit_pageseg_mode:'11',tessedit_char_whitelist:'EDITIONeditionIilL10 '});
      const r=await worker.recognize(crop);
      const text=normalizeScanText(r?.data?.text || '');
      allText += ' ' + text;
      if(isHit(text)) return {detected:true,text:allText.trim()};
    }
  }
  return {detected:false,text:allText.trim()};
}

// --- v74 LOCAL WOTC SET SYMBOL RESCUE ---
const SET_SYMBOL_BITS = {"JUNGLE":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAB8fgAAAAD4NwAAAAHHNgAAAAHnPD4AAADz8H+AAAAeAc3AAHwB493AAf+HE//gA//n2QDgB5H3+ABAD/D3+P8AD//n8fzAD4/AAefgB5+H+OPwB+YfHnMwA/w5vz3wAPh4x5zwAAD4wZ/gAAH//cfAAAH8f8AAAAH8f8AAAAD//8AAAAB//4AAAAAf/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","FOSSIL":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAA/AAAAAAAfgAAAAAAPgAAAAAAHAAAAAAAAfAAAAAAA/AAAAAAA/AAAAAAA/gAAAAAAfwAAAAfAH4AAAB/gD8AIAAPnB/AGAAHvw/AHAABP4PMHgAAP8HfHgAAf/AfjwAAP/wfjwAAA/4HwgAAAD7z4AAAQA39+AAA8AT//gA+/8A//wB8//zP/wD8//3//wAM//3//gAA/P3//AAAMAH//AAAAAD//AAAAAAH/AAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","BASE SET 2":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAAAAAP/wAAAAA//8AAAAD/D+AAAAH4AeAAAAPg/PAAAAOGA/AAAAYIAPAAAAQQAHgAAAggADgAAAggABAAAABAABAAAABAcAgAAAAAhAgAAACAdAgAAAD/d/gAAACANAgAAAAAiAgAAABAcAgAAABAABAAAAAgABAAAAAgACAAAAAQAEAAAAAMAIIeAAAfAz/wAAA++//AAAA8D/8AAAB4f/gAAAB4/8AAAAB7/wAAAAD//AAAAAD/4AAAAAD/wAAAAAD/AAAAAAH+AAAAAAH8AAAAAAH4AAAAAAHwAAAAAAHwAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","ROCKET":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///gAAA////8AAA////+AAA/////AAA/////gAB/////wAB/////wAB/wAH/wAD/wAD/wAD/gAD/wAD/gAD/wAD/gAH/gAH/AAP/gAH/////AAH////+AAH////8AAP////4AAP////wAAP///+AAAf///4AAAf8A/8AAAf8A/8AAAf8A/+AAA/8Af+AAA/4Af/AAA/4AP/AAB/4AP/AAB/wAH/gAB/wAH/gAB/wAH/wAD/gAD/wAD/gAD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","GYM HEROES":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAA///+AAAH////wAAP///8MAA///+BzAB///g8MgD///+DGQD///5whQD////MZQD////2IwB////yJwA////xPwAf///zfgAP///P/gAB/////AAAD////AAAB///+AAAAH//8AAAAD//4AAAAD//gAAAAB/+AAAAAB/wAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","GYM CHALLENGE":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//wAAAA////AAAHP///4AAYP///8AAxgf///ABOHh///gDYwfP//wCxDj///wDiM////wDkb////wDkT////gD8T////AB+T///+AB/5///4AA/////gAA////gAAAf///gAAAP//4AAAAD//wAAAAA//wAAAAAP/wAAAAAB/gAAAAAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","NEO GENESIS":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcOAAAAAA+fAAAAAA//AAAAAB//gAAAAB//gAAAAB//gAAAAD//wAAAAD//wAAAAD//wAAAAH//4AAB//////gD//////wD//////wD//////wD//////wB//////gAf////+AAP////8AAH////4AAB////gAAA////AAAB////gAAB////gAAB////gAAD////wAAD////wAAD////wAAH////4AAH////4AAH/+f/4AAD78P3wAADx4HjwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","NEO DISCOVERY":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//gAAAAD//wAAAAD//wAAAAH//4AAAAH//4AAAAH//4AAAAH//4AAAAP//8AAAAP//8AAAAP//8AAAD////wAAD////wAAH////4AAH////4AAP////8AAP////8AAP////8AAf////+AAf////+AA//////AD//////wD//////wD//////wD//////wD//////wD//////wD//////wD//////wD//////wB//////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","NEO REVELATION":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAH4AAAAAAP8AAAAAAP8AAAAAAP8AAAB8AP8APgB/AH4A/gD/AH4A/wD/gH4B/wD/wH4D/wB/4H4H/gB/9//v/gAf////+AAD////wAAB////gAAD////wAAH////4AAH////4AAH////4AAH////4AAP////8AAH////4AAH////4AAH////4AAD////wAAA////AAAAP//8AAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","NEO DESTINY":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAGAAAAAAA4AAAAAADwAAAAAAfgAAAAAB+AAAAABv8gAAAAH/zAAAAD//+AAAAAf///AAAB///gAAAD//wAAAAH//gAAAAf//gAAAA////4AAB9//8AAAHz/wAAAAPH/wAAAAYP7wAAAAg/hgAAACB+AgAAAAD4AAAAAAHgAAAAAAOAAAAAAAYAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","LEGENDARY COLLECTION":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAA////AAAAf//+AAAAf//+AAAAP//8AAAAP//8AAAAH//4AAAAB//gAAAAA//AAAAAA//gAAAAB//wAAAAD//4AAAAH//4AAAAP//8AAAAP//8AAAAP//+AAAAP//+AAAAf//+AAAAf//+AAAAf//+AAAAP//+AAAAP//8AAAAP//8AAAAH//8AAAAH//4AAAAD//wAAAAB//gAAAAA//AAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","SOUTHERN ISLANDS":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAf4AAAAAf/8AAAAB//+AAAAD//+/AAAH////wAAH////4AAD////8AAH////+AAP////+AAf////+AA//////AB//////AB//v///gD/gP///gD4Af///wDgAfz//wAAA/x//wAAA/h/3wAAB/g/7wAAD/gf7wAAD/AfxgAAH/APwAAAH+APwAAAP+APwAAAP8AHgAAAf8AHgAAAf8AHAAAAf8ACAAAAf8AAAAAAf8AAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","EXPEDITION":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAD//wAAAAP//8AAAAf//+AAAB////gAAD////wAAH////4AAP////8AAP////8AAf////+AA//////AA//////AB//////gB//////gB//////gB//////gD//////wD//////wD//////wD//////wD//////wD//////wD//////wD//////wB//////gB//////gB//////gB//////gA//////AA//////AAf////+AAP////8AAP////8AAH////4AAD////wAAB////gAAAf//+AAAAP//8AAAAD//wAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","AQUAPOLIS":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAABAAAAAAADgAAAAAADgAAAAAAHgAAAAAAHwAAAAAAP4AAAAAAP4AAAAAAf8AAAAAA/+AAAAAB//AAAAAD//gAAAAP//4AAAAf//8AAAA///+AAAB////AAAB////AAAD////gAAD////gAAH////wAAH////wAAP////4AAP////4AAP////4AAP////4AAP////4AAP////4AAP////4AAP////4AAH////wAAH////wAAH////wAAD////gAAB////AAAB////AAAA///+AAAAf//8AAAAH//wAAAAB//AAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","SKYRIDGE":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAH8AAAAAAP+AAAAAAP/AAAAAAf//gAAAAf//wAAAAf//4AAAAf//wAAAAf//wAAAA///gAAAD///AAAAH//+AAAAP//8AAAA///8AAAB///+fgAB///+/gAD/////wAD/////4AD/////4AB/////8AAH////+AAP////+AAP/////AAf/////gAf/////gA//////wA//////wA//////wA//////wAf/////wAf/////gAH/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"};
const SET_SYMBOL_SIZE = 48;
let setSymbolTemplateCache = null;
function unpackSymbolBits(b64){
  const raw=atob(b64), out=new Uint8Array(SET_SYMBOL_SIZE*SET_SYMBOL_SIZE);
  for(let i=0;i<out.length;i++){ const byte=raw.charCodeAt(i>>3); out[i]=(byte & (1 << (7-(i&7)))) ? 1 : 0; }
  return out;
}
function getSetSymbolTemplates(){
  if(setSymbolTemplateCache) return setSymbolTemplateCache;
  setSymbolTemplateCache={};
  for(const [set,bits] of Object.entries(SET_SYMBOL_BITS)) setSymbolTemplateCache[set]=unpackSymbolBits(bits);
  return setSymbolTemplateCache;
}
function symbolMaskIoUShift(a,b,size=SET_SYMBOL_SIZE){
  let best=0;
  for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++){
    let inter=0,uni=0;
    for(let y=0;y<size;y++){ const by=y-dy; for(let x=0;x<size;x++){ const bx=x-dx, av=a[y*size+x], bv=(bx>=0&&bx<size&&by>=0&&by<size)?b[by*size+bx]:0; if(av&&bv)inter++; if(av||bv)uni++; }}
    best=Math.max(best,inter/Math.max(1,uni));
  }
  return best;
}
function normalizeComponentMask(comp,size=SET_SYMBOL_SIZE,pad=4){
  if(comp.w<2||comp.h<2) return null;
  const scale=Math.min((size-pad*2)/comp.w,(size-pad*2)/comp.h);
  const nw=Math.max(1,Math.round(comp.w*scale)), nh=Math.max(1,Math.round(comp.h*scale));
  const out=new Uint8Array(size*size), ox=Math.floor((size-nw)/2), oy=Math.floor((size-nh)/2);
  for(let yy=0;yy<nh;yy++){ const sy=Math.min(comp.h-1,Math.floor(yy/scale)); for(let xx=0;xx<nw;xx++){ const sx=Math.min(comp.w-1,Math.floor(xx/scale)); if(comp.mask[sy*comp.w+sx]) out[(oy+yy)*size+(ox+xx)]=1; }}
  return out;
}
function grayscaleComponentsFromSymbolZone(canvas){
  const maxW=680, scale=Math.min(1,maxW/canvas.width), dw=Math.max(1,Math.round(canvas.width*scale)), dh=Math.max(1,Math.round(canvas.height*scale));
  const tmp=document.createElement('canvas'); tmp.width=dw; tmp.height=dh; const tctx=tmp.getContext('2d',{willReadFrequently:true}); tctx.drawImage(canvas,0,0,dw,dh);
  const x0=Math.round(dw*.68),x1=Math.round(dw*.995),y0=Math.round(dh*.34),y1=Math.round(dh*.70),rw=Math.max(1,x1-x0),rh=Math.max(1,y1-y0);
  const pix=tctx.getImageData(x0,y0,rw,rh).data, mask=new Uint8Array(rw*rh);
  for(let i=0;i<rw*rh;i++){ const r=pix[i*4],g=pix[i*4+1],b=pix[i*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx===0?0:((mx-mn)/mx)*255; if(sat<82&&mx>18)mask[i]=1; }
  const seen=new Uint8Array(mask.length), comps=[], q=[];
  for(let sy=0;sy<rh;sy++)for(let sx=0;sx<rw;sx++){ const start=sy*rw+sx; if(!mask[start]||seen[start])continue; q.length=0;q.push(start);seen[start]=1;let qi=0,minX=sx,maxX=sx,minY=sy,maxY=sy;const pts=[];
    while(qi<q.length){ const idx=q[qi++],y=Math.floor(idx/rw),x=idx-y*rw;pts.push(idx);if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y; for(let yy=Math.max(0,y-1);yy<=Math.min(rh-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(rw-1,x+1);xx++){const ii=yy*rw+xx;if(mask[ii]&&!seen[ii]){seen[ii]=1;q.push(ii);}}}
    const w=maxX-minX+1,h=maxY-minY+1,area=pts.length,aspect=w/Math.max(1,h),fill=area/Math.max(1,w*h); if(area<18||w<7||h<7||w>rw*.52||h>rh*.42||aspect<.28||aspect>3.2||fill<.10)continue;
    const cmask=new Uint8Array(w*h); for(const idx of pts){const y=Math.floor(idx/rw),x=idx-y*rw;cmask[(y-minY)*w+(x-minX)]=1;} comps.push({w,h,area,mask:cmask});
  }
  return comps;
}
function detectSetSymbolLocal(canvas,candidateCards=[]){
  if(!canvas||!(photoGuidedCrop||photoAutoCropped))return null; const templates=getSetSymbolTemplates();
  let allowed=[...new Set((candidateCards||[]).map(c=>c.set).filter(s=>templates[s]))], scoped=allowed.length>0; if(!allowed.length)allowed=Object.keys(templates);
  const comps=grayscaleComponentsFromSymbolZone(canvas); if(!comps.length)return null; let best=null, second=0;
  for(const comp of comps){const norm=normalizeComponentMask(comp);if(!norm)continue;for(const set of allowed){const score=symbolMaskIoUShift(norm,templates[set]);if(!best||score>best.score){second=best?Math.max(second,best.score):second;best={set,score};}else if(score>second)second=score;}}
  if(!best)return null; const margin=best.score-second, threshold=scoped?.62:.74, neededMargin=scoped?.07:.12; if(best.score<threshold||margin<neededMargin)return null;
  return {set:best.set,score:best.score,margin,source:'set symbol'};
}
// --- end v74 set-symbol rescue ---
function localCandidatesByName(name, lang='EN'){
  if(!name) return [];
  return (DATA.knownCards || []).filter(c => c.language === lang && cardNameMatches(c, name));
}

function findKnownLocal(name, number, setKey){
  const list=EMBEDDED_DATA.knownCards || [];
  const hits=list.filter(c => (!name || simpleNorm(c.name)===simpleNorm(name)) && (!number || String(parseInt(c.number,10))===String(parseInt(number,10))) && (!setKey || c.set===setKey));
  // Nooit meer de 'eerste' kaart uit de database pakken als meerdere sets mogelijk zijn.
  return hits.length===1 ? hits[0] : null;
}

function localCandidatesByCollector(number,total,lang='EN'){
  const n=cleanNumber(number);
  const t=Number(total);
  if(!n || !Number.isFinite(t)) return [];
  return (EMBEDDED_DATA.knownCards || []).filter(c =>
    c.language===lang && cleanNumber(c.number)===n && setTotalForSet(c.set)===t
  );
}
function uniqueLocalCollector(number,total,lang='EN'){
  const hits=localCandidatesByCollector(number,total,lang);
  return hits.length===1 ? hits[0] : null;
}

async function scanCollectorEvidence(worker, canvas, guided, candidateCards=[]){
  // v71 NUMBER + SET BOOST: begin breed, zoom daarna steeds verder in op de echte rechteronderhoek.
  // We bewaren alle OCR-snippers en matchen die ook tegen verwachte nummer/set-combinaties van de herkende naam.
  const rects = guided ? [
    {left:.69, top:.82, width:.30, height:.17},
    {left:.54, top:.78, width:.45, height:.21},
    {left:.36, top:.74, width:.63, height:.25},
    {left:.18, top:.82, width:.81, height:.17}
  ] : [
    {left:.66, top:.80, width:.33, height:.19},
    {left:.50, top:.74, width:.49, height:.25},
    {left:.22, top:.80, width:.77, height:.19}
  ];
  const quickPasses=[
    {zoom:5.0,contrast:1.35,psm:'7'},
    {zoom:5.6,contrast:1.95,threshold:150,psm:'7'},
    {zoom:5.8,contrast:2.15,threshold:180,psm:'13'},
    {zoom:7.2,contrast:2.05,threshold:145,psm:'7'}
  ];
  const deepPasses=[
    {zoom:6.4,contrast:2.20,threshold:115,psm:'7'},
    {zoom:6.4,contrast:2.30,threshold:135,psm:'7'},
    {zoom:6.4,contrast:2.35,threshold:165,psm:'7'},
    {zoom:6.4,contrast:2.25,threshold:190,psm:'7'},
    {zoom:6.0,contrast:2.20,threshold:145,invert:true,psm:'7'},
    {zoom:8.0,contrast:2.35,threshold:155,psm:'7'},
    {zoom:8.5,contrast:2.45,threshold:175,psm:'13'}
  ];
  let combined='';
  let total=null;
  const runPass=async(rr,pass)=>{
    const rect={left:Math.round(canvas.width*rr.left),top:Math.round(canvas.height*rr.top),width:Math.round(canvas.width*rr.width),height:Math.round(canvas.height*rr.height)};
    const crop=makeEnhancedCrop(canvas,rect,pass);
    if(!crop) return null;
    await worker.setParameters({tessedit_pageseg_mode:pass.psm,tessedit_char_whitelist:'0123456789/',preserve_interword_spaces:'1'});
    const res=await worker.recognize(crop);
    const text=res?.data?.text || '';
    combined += ' ' + text;
    const collector=extractCollectorNumberLoose(text,candidateCards);
    if(collector) return {collector,total:collector.total,text:combined,candidateCard:collector.candidateCard||null,evidence:collector.source||'ocr'};
    const candidate=matchCollectorToCandidates(text,candidateCards);
    if(candidate) return {collector:{number:candidate.number,total:candidate.total,source:candidate.reason},total:candidate.total,text:combined,candidateCard:candidate.card,evidence:candidate.reason};
    const maybeTotal=extractLikelySetTotal(text);
    if(maybeTotal) total=maybeTotal;
    return null;
  };
  for(const rr of rects){
    for(const pass of quickPasses){
      const hit=await runPass(rr,pass);
      if(hit) return hit;
    }
  }
  // Alleen als het nummer nog onzeker is: gerichte deep scan. Dit kost iets meer tijd maar voorkomt set-gokken.
  for(const rr of rects.slice(0,3)){
    for(const pass of deepPasses){
      const hit=await runPass(rr,pass);
      if(hit) return hit;
    }
  }
  const partialCandidate=matchPartialCollectorToCandidates(combined,candidateCards);
  if(partialCandidate){
    return {collector:{number:partialCandidate.number,total:partialCandidate.total,source:partialCandidate.reason,candidateCard:partialCandidate.card,score:partialCandidate.score},total:partialCandidate.total,text:combined,candidateCard:partialCandidate.card,evidence:partialCandidate.reason};
  }
  const candidate=matchCollectorToCandidates(combined,candidateCards);
  if(candidate){
    return {collector:{number:candidate.number,total:candidate.total,source:candidate.reason},total:candidate.total,text:combined,candidateCard:candidate.card,evidence:candidate.reason};
  }
  return {collector:null,total:total || extractLikelySetTotal(combined),text:combined,candidateCard:null,evidence:total?'set total':'none'};
}
async function ensureOcrWorker(){
  const T = await loadTesseract();
  if(ocrWorker) return ocrWorker;
  setOcrProgress(8,'OCR-engine laden… eerste keer kan wat langer duren.');
  ocrWorker = await T.createWorker('eng', 1, {
    logger: m => {
      if(m && m.status === 'recognizing text' && typeof m.progress === 'number'){
        setOcrProgress(15 + Math.round(m.progress*70), `Tekst lezen… ${Math.round(m.progress*100)}%`);
      }
    }
  });
  return ocrWorker;
}
async function scanCurrentPhoto(){
  if(!photoImage || ocrBusy) return;
  ocrBusy=true;
  scanPhotoBtn.disabled=true;
  if(ocrResult){ ocrResult.hidden=true; ocrResult.textContent=''; }
  try{
    setOcrProgress(2,'Scanner voorbereiden…');
    const canvas=makeOcrCanvas();
    if(!canvas) throw new Error('Geen foto geladen');
    const worker=await ensureOcrWorker();

    const guided=photoGuidedCrop || photoAutoCropped;
    const galleryAutoCrop=photoAutoCropped && !photoGuidedCrop;
    const headerRect = guided
      ? {left:Math.round(canvas.width*.02),top:Math.round(canvas.height*.01),width:Math.round(canvas.width*.96),height:Math.round(canvas.height*.22)}
      : {left:0,top:0,width:canvas.width,height:Math.max(1,Math.round(canvas.height*.34))};
    const nameRect = guided
      ? {left:Math.round(canvas.width*.025),top:Math.round(canvas.height*.02),width:Math.round(canvas.width*.73),height:Math.round(canvas.height*.14)}
      : headerRect;

    setOcrProgress(14,'Naamgebied lezen…');
    await worker.setParameters({
      tessedit_pageseg_mode: guided ? '7' : '6',
      tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'-. "
    });
    const nameScan=await worker.recognize(canvas,{rectangle:nameRect});
    let nameText=nameScan?.data?.text || '';

    setOcrProgress(36,'Kaartkop controleren…');
    await worker.setParameters({tessedit_pageseg_mode:'6',tessedit_char_whitelist:''});
    const headerScan=await worker.recognize(canvas,{rectangle:headerRect});
    let headerText=headerScan?.data?.text || '';

    // v70: a second high-contrast pass over a wider top band catches names such as
    // Beldum/Metang that can sit lower in a guided crop.
    setOcrProgress(44,'Naam extra scherp lezen…');
    const topBand={left:0,top:0,width:canvas.width,height:Math.round(canvas.height*(guided?.24:.34))};
    const enhancedTop=makeEnhancedCrop(canvas,topBand,{zoom:2.8,contrast:1.9});
    if(enhancedTop){
      await worker.setParameters({tessedit_pageseg_mode:'11',tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'-. ",preserve_interword_spaces:'1'});
      const enhancedScan=await worker.recognize(enhancedTop);
      headerText += ' ' + (enhancedScan?.data?.text || '');
    }

    const trainerGuess=findTrainerCandidate(headerText);
    const trainerDetected=looksLikeTrainer(headerText) || !!trainerGuess;
    const trainerTitle=trainerGuess || (trainerDetected ? extractTrainerTitle(headerText) : '');

    let found = trainerDetected ? null : findPokemonName(nameText + ' ' + headerText);
    let fullText = `${nameText} ${headerText}`;

    if(!found && !trainerDetected){
      setOcrProgress(54,'Naam niet zeker — bredere scan…');
      await worker.setParameters({tessedit_pageseg_mode:'6',tessedit_char_whitelist:''});
      const full=await worker.recognize(canvas);
      const broad=full?.data?.text || '';
      fullText += ' ' + broad;
      found=findPokemonName(broad + ' ' + nameText);
    }

    const provisionalName=trainerTitle || found?.name || '';
    const scanNameCandidates=provisionalName ? localCandidatesByName(provisionalName, langSelect.value) : [];

    setOcrProgress(62,'Set-symbool controleren…');
    const symbolEvidence=trainerDetected?null:detectSetSymbolLocal(canvas,scanNameCandidates);

    setOcrProgress(68,'Kaartnummer en set lezen…');
    let collector=null;
    let numberOcrText='';
    const collectorEvidence=await scanCollectorEvidence(worker,canvas,guided,scanNameCandidates);
    collector=collectorEvidence.collector;
    numberOcrText += ' ' + (collectorEvidence.text || '');
    fullText += ' ' + (collectorEvidence.text || '');

    // Als de gerichte hoekscan niets oplevert, nog één bredere onderrandscan.
    if(!collector && !collectorEvidence.total){
      const bottomRect={left:0,top:Math.round(canvas.height*0.70),width:canvas.width,height:Math.max(1,Math.round(canvas.height*0.30))};
      await worker.setParameters({tessedit_pageseg_mode:'6',tessedit_char_whitelist:''});
      const bot=await worker.recognize(canvas,{rectangle:bottomRect});
      const bottomText=bot?.data?.text || '';
      numberOcrText += ' ' + bottomText;
      fullText += ' ' + bottomText;
      collector=extractCollectorNumber(fullText);
    }

    const denominatorHint = collector ? collector.total : (collectorEvidence.total || extractLikelySetTotal(numberOcrText));
    let inferredSet=denominatorHint ? inferSetFromTotal(denominatorHint,scanNameCandidates) : null;
    if(!inferredSet && collectorEvidence.candidateCard) inferredSet=collectorEvidence.candidateCard.set;
    const specialHint=specialScanHint(provisionalName,collector);
    if(specialHint?.set) inferredSet=specialHint.set;
    // v77: een lokaal bevestigde collector-number kandidaat is sterker dan een
    // visuele set-symbol match. Zo kan 62/1 -> Horsea #62 Neo Genesis niet meer
    // door een fout symboolmodel naar Aquapolis worden overschreven.
    const numberConfirmedCard=collectorEvidence?.candidateCard || collector?.candidateCard || null;
    if(numberConfirmedCard) inferredSet=numberConfirmedCard.set;
    else if(symbolEvidence?.set) inferredSet=symbolEvidence.set;

    // v77 DB RESCUE: an exact collector number/total may identify one local card even
    // when the name OCR fails or the denominator belongs to multiple sets (e.g. 77/110).
    const globalCollectorCard = collector ? uniqueLocalCollector(collector.number, collector.total, langSelect.value) : null;
    if(globalCollectorCard) inferredSet=globalCollectorCard.set;

    // v70: 1st Edition wordt bewust NIET meer gescand. De gebruiker kiest dit zelf.
    // Zo kan een gemiste of fout gelezen stempel nooit de Cardmarket-route veranderen.
    setOcrProgress(86,'Set controleren…');

    let displayName='';
    let canAutofill=false;
    if(trainerDetected && trainerTitle){
      displayName=trainerTitle;
      canAutofill=true;
    }else if(found){
      displayName=found.name;
      canAutofill=!!found.safe;
    }

    // v77 DB RESCUE + SAFE RECONCILE:
    // houd de bewezen v71 OCR-zones exact hetzelfde, maar herstel pas ACHTERAF een
    // afgesneden numerator via naam + set. Dit voorkomt de v72-regressie zonder
    // terug te vallen op foutieve kaartnummers zoals Horsea 2/111.
    let localInference=collectorEvidence.candidateCard || globalCollectorCard || null;
    let collectorRejected=false;
    let rejectedCollectorNumber='';

    if(displayName){
      const allNameCandidates=localCandidatesByName(displayName, langSelect.value);
      const setCandidates=inferredSet ? allNameCandidates.filter(c=>c.set===inferredSet) : allNameCandidates;
      const exactCandidates=collector
        ? setCandidates.filter(c=>cleanNumber(c.number)===cleanNumber(collector.number))
        : setCandidates;

      // Sterkste regel: naam + eenduidige set + precies één lokale kaart wint van
      // een halve OCR-numerator. Ook toegestaan bij een 'mogelijk'-naam als de
      // set al sterk uit het denominator is afgeleid.
      if(inferredSet && setCandidates.length===1 && (canAutofill || (found && found.score>=0.72))){
        const expected=setCandidates[0];
        localInference=expected;
        displayName=expected.name;
        canAutofill=true;
        if(collector && cleanNumber(expected.number)!==cleanNumber(collector.number)){
          collectorRejected=true;
          rejectedCollectorNumber=collector.number;
        }
      }else if(exactCandidates.length===1 && canAutofill){
        localInference=exactCandidates[0];
      }else if(!collector && allNameCandidates.length===1 && canAutofill){
        localInference=allNameCandidates[0];
      }else if(collector && allNameCandidates.length===1 && canAutofill){
        const only=allNameCandidates[0];
        const expectedTotal=setTotalForSet(only.set);
        const collectorMatches = cleanNumber(only.number)===cleanNumber(collector.number) && expectedTotal===Number(collector.total);
        const collectorTotalSupported = Object.prototype.hasOwnProperty.call(SET_TOTAL_HINTS, Number(collector.total));
        // If OCR produced a nonsense fraction (e.g. Jirachi 4/7) and the database has
        // exactly one verified local card for this recognized name, reject the nonsense
        // instead of poisoning the set inference. Supported-but-different totals are NOT
        // overwritten, because that may be another version not yet in our small database.
        if(!collectorMatches && !collectorTotalSupported){
          localInference=only;
          inferredSet=only.set;
          collectorRejected=true;
          rejectedCollectorNumber=collector.number;
        }
      }

      // Als de gerichte hoekscan zelf al één lokale kaart vond en de fuzzy naam
      // daarmee overeenkomt, mag dat de naam bevestigen zonder extra OCR-pass.
      if(localInference && found && found.score>=0.72 && simpleNorm(localInference.name)===simpleNorm(found.name)){
        displayName=localInference.name;
        canAutofill=true;
        if(!inferredSet) inferredSet=localInference.set;
        if(collector && cleanNumber(localInference.number)!==cleanNumber(collector.number) && inferredSet===localInference.set){
          collectorRejected=true;
          rejectedCollectorNumber=collector.number;
        }
      }
    }

    // Exact collector rescue can also restore the name when name OCR failed.
    if(!canAutofill && globalCollectorCard){
      localInference=globalCollectorCard;
      displayName=globalCollectorCard.name;
      inferredSet=globalCollectorCard.set;
      canAutofill=true;
    }

    // Nummer + set kan op zichzelf ook veilig zijn als er in die set exact één lokale
    // kaart met dat nummer bestaat. Dit helpt wanneer de naamzone door reflectie faalt.
    if(!canAutofill && collector && inferredSet){
      const byNumber=EMBEDDED_DATA.knownCards.filter(c=>c.language===langSelect.value && c.set===inferredSet && cleanNumber(c.number)===cleanNumber(collector.number));
      if(byNumber.length===1){
        localInference=byNumber[0];
        displayName=localInference.name;
        canAutofill=true;
      }
    }

    // v70: velden weerspiegelen uitsluitend DEZE scan. Nooit oude kaartdata laten staan.
    nameInput.value = (displayName && canAutofill) ? displayName : '';
    numberInput.value = (collector && !collectorRejected) ? collector.number : (localInference ? cleanNumber(localInference.number) : '');
    setSelect.value = (inferredSet && [...setSelect.options].some(o=>o.value===inferredSet)) ? inferredSet : 'AUTO';
    updateCustomSelects();

    setOcrProgress(100,'Scan klaar. Controleer set en resultaat.');
    const resolvedNumber=(collector && !collectorRejected ? collector.number : '') || localInference?.number || '';
    const local=(displayName && canAutofill) ? (localInference || findKnownLocal(displayName, resolvedNumber, inferredSet)) : null;
    if(ocrResult){
      const pieces=[];
      if(trainerDetected){
        pieces.push('<strong>Type:</strong> Trainerkaart');
        if(trainerTitle) pieces.push(`<strong>Titel:</strong> ${escapeHtml(trainerTitle)} <small>(OCR)</small>`);
        else pieces.push('<span class="ocrWarn">Trainernaam nog niet zeker.</span>');
      }else if(found){
        const warn = found.safe ? '' : ' — niet automatisch ingevuld';
        pieces.push(`<strong>Naam:</strong> ${escapeHtml(found.name)} <small>(${found.confidence}${warn})</small>`);
      }else{
        pieces.push('<span class="ocrWarn">Naam nog niet betrouwbaar herkend.</span>');
      }
      if(collector && !collectorRejected) pieces.push(`<strong>Nummer:</strong> ${escapeHtml(collector.number)}/${collector.total}`);
      else if(collectorRejected && localInference) pieces.push(`<strong>Nummer:</strong> ${escapeHtml(localInference.number)} <small>(OCR ${escapeHtml(rejectedCollectorNumber || collector?.number || '?')} verworpen · naam+set bevestigd)</small>`);
      else if(localInference) pieces.push(`<strong>Nummer:</strong> ${escapeHtml(localInference.number)} <small>(unieke lokale match)</small>`);
      else pieces.push('<span class="ocrWarn">Kaartnummer nog niet zeker.</span>');
      if(inferredSet){
        let why='';
        if(symbolEvidence?.set===inferredSet) why=` <small>(set-symbool · ${Math.round(symbolEvidence.score*100)}%)</small>`;
        else if(collectorEvidence?.evidence && collectorEvidence.evidence!=='none') why=` <small>(${escapeHtml(collectorEvidence.evidence)})</small>`;
        else if(!collector && denominatorHint) why=' <small>(set-totaal gelezen)</small>';
        pieces.push(`<strong>Set-hint:</strong> ${escapeHtml(EMBEDDED_DATA.sets[inferredSet]?.label || inferredSet)}${why}`);
      }
      else if((displayName && canAutofill) || found){
        const choiceName=displayName || found?.name || '';
        const setChoices=localCandidatesByName(choiceName,langSelect.value).slice(0,4);
        if(setChoices.length>1){
          const buttons=setChoices.map(c=>`<button type="button" class="ocrSetPick" data-set="${escapeHtml(c.set)}" data-number="${escapeHtml(c.number)}" data-name="${escapeHtml(c.name)}">${escapeHtml(EMBEDDED_DATA.sets[c.set]?.label || c.set)} #${escapeHtml(c.number)}</button>`).join('');
          pieces.push(`<div class="ocrSetChoiceBox"><span class="ocrWarn"><strong>Set nog niet zeker.</strong> Tik de juiste:</span><div class="ocrSetChoiceGrid">${buttons}</div></div>`);
        }
      }
      pieces.push(`<span class="ocrEditionOff">Editie: handmatig · ${editionSelect?.value === '1ST' ? '<b>1ST EDITION</b>' : '<b>Normaal</b>'}. Tik de knop om dit te wijzigen.</span>`);
      if(local) pieces.push('<strong>Lokale match:</strong> gevonden in CardScout DB');
      if(collectorRejected && localInference) pieces.push('<strong>Correctie:</strong> kaartnummer hersteld uit naam + set');
      if(photoGuidedCrop) pieces.push('<strong>Foto:</strong> camerakader gebruikt');
      else if(galleryAutoCrop) pieces.push('<strong>Foto:</strong> galerijfoto automatisch op kaartranden uitgesneden');
      else pieces.push('<strong>Foto:</strong> volledige galerijfoto gescand');
      pieces.push('<span class="ocrRaw">OCR: '+escapeHtml(normalizeScanText(fullText).slice(0,260))+'</span>');
      ocrResult.innerHTML=pieces.join('<br>');
      ocrResult.hidden=false;
      if(scanEditionQuick) scanEditionQuick.hidden=false;
      updateCustomSelects();
    }

    if(displayName && canAutofill){
      setStatus(`Scan: ${displayName}${resolvedNumber?` #${resolvedNumber}`:''}${inferredSet?` · ${EMBEDDED_DATA.sets[inferredSet]?.label || inferredSet}`:''}. Controleer vooral set, editie en staat.`, 'ok');
      // Blijf bij het scanresultaat: hier kan 1st Edition direct worden gecorrigeerd.
      if(ocrResult) setTimeout(()=>ocrResult.scrollIntoView({behavior:'smooth',block:'nearest'}),250);
    }else if(found && !found.safe){
      setStatus(`Mogelijke naam: ${found.name}. Niet automatisch ingevuld omdat de scan nog onzeker is.`, 'warn');
    }else{
      setStatus('Scan kon de kaart nog niet betrouwbaar herkennen. Handmatig zoeken blijft beschikbaar.', 'warn');
    }
  }catch(err){
    console.error(err);
    setOcrProgress(0,'Scan mislukt.');
    if(ocrResult){
      ocrResult.innerHTML='<span class="ocrWarn">OCR kon niet starten. Controleer internet voor de eerste OCR-module-download en probeer opnieuw.</span>';
      ocrResult.hidden=false;
    }
    setStatus('OCR-beta kon niet starten. De gewone zoekfunctie werkt nog wel.', 'warn');
  }finally{
    ocrBusy=false;
    if(scanPhotoBtn) scanPhotoBtn.disabled=!photoImage;
  }
}
if(scanPhotoBtn) scanPhotoBtn.addEventListener('click',scanCurrentPhoto);
if(ocrResult){
  ocrResult.addEventListener('click', e => {
    const btn=e.target.closest('.ocrSetPick');
    if(!btn) return;
    const set=btn.dataset.set || 'AUTO';
    const number=btn.dataset.number || '';
    const name=btn.dataset.name || nameInput.value;
    nameInput.value=name;
    numberInput.value=number;
    setSelect.value=[...setSelect.options].some(o=>o.value===set) ? set : 'AUTO';
    updateCustomSelects();
    setStatus(`Set gekozen: ${EMBEDDED_DATA.sets[set]?.label || set} · ${name} #${number}.`, 'ok');
    ocrResult.querySelectorAll('.ocrSetPick').forEach(x=>x.classList.toggle('active',x===btn));
  });
}

if(takePhotoBtn && cameraInput){
  takePhotoBtn.addEventListener('click', openGuidedCamera);
  cameraInput.addEventListener('change', () => loadPhotoFile(cameraInput.files && cameraInput.files[0],{guidedCrop:false}));
}
if(cameraCancelBtn) cameraCancelBtn.addEventListener('click', stopGuidedCamera);
if(cameraShutterBtn) cameraShutterBtn.addEventListener('click', captureGuidedPhoto);
if(cameraFallbackBtn) cameraFallbackBtn.addEventListener('click', () => {
  stopGuidedCamera();
  cameraInput?.click();
});
if(choosePhotoBtn && galleryInput){
  choosePhotoBtn.addEventListener('click', () => galleryInput.click());
  galleryInput.addEventListener('change', () => loadPhotoFile(galleryInput.files && galleryInput.files[0],{guidedCrop:false}));
}
if(rotateLeftBtn){
  rotateLeftBtn.addEventListener('click', () => {
    photoRotation = (photoRotation - 90) % 360;
    drawPhoto();
  });
}
if(rotateRightBtn){
  rotateRightBtn.addEventListener('click', () => {
    photoRotation = (photoRotation + 90) % 360;
    drawPhoto();
  });
}
if(clearPhotoBtn) clearPhotoBtn.addEventListener('click', resetPhoto);
if(continuePhotoBtn){
  continuePhotoBtn.addEventListener('click', () => {
    const panel = document.getElementById('quickPanel');
    if(panel) panel.scrollIntoView({behavior:'smooth', block:'start'});
    setTimeout(() => quickInput.focus(), 450);
    setStatus('Typ: nummer + naam + set + staat.', 'ok');
  });
}
window.addEventListener('pagehide', stopGuidedCamera);
document.addEventListener('visibilitychange', () => {
  if(document.hidden && cameraStream) stopGuidedCamera();
});
window.addEventListener('resize', () => {
  if(photoImage) drawPhoto();
});

initCustomSelects();
bind();
renderSaved();
setStatus('v71 · Number + Set Boost · DB 253.', 'ok');
unregisterOldServiceWorkers();
