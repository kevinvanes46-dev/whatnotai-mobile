'use strict';
// JP set identity is separate from marketplace counterparts.
// Search-only species aliases (generations 1–2): https://raw.githubusercontent.com/PokeAPI/pokeapi/8fe210b21c9abbe73de93670f3d5a346c80a3625/data/v2/csv/pokemon_species_names.csv
(()=>{
  const sets=[
    ['PMCG1','BASE','Expansion Pack'],
    ['PMCG2','JUNGLE','Pokémon Jungle'],
    ['PMCG3','FOSSIL','Mystery of the Fossils'],
    ['PMCG4','ROCKET','Rocket Gang'],
    ['PMCG5','JP GYM 1',"Leader's Stadium"],
    ['PMCG6','JP GYM 2','Challenge from the Darkness'],
    ['neo1','NEO GENESIS','Neo Genesis'],
    ['neo2','NEO DISCOVERY','Neo Discovery'],
    ['neo3','NEO REVELATION','Awakening Legends'],
    ['neo4','NEO DESTINY','Neo Destiny']
  ].map(([source,key,label])=>Object.freeze({source,key,label}));
  const species=[["フシギダネ","Bulbasaur"],["フシギソウ","Ivysaur"],["フシギバナ","Venusaur"],["ヒトカゲ","Charmander"],["リザード","Charmeleon"],["リザードン","Charizard"],["ゼニガメ","Squirtle"],["カメール","Wartortle"],["カメックス","Blastoise"],["キャタピー","Caterpie"],["トランセル","Metapod"],["バタフリー","Butterfree"],["ビードル","Weedle"],["コクーン","Kakuna"],["スピアー","Beedrill"],["ポッポ","Pidgey"],["ピジョン","Pidgeotto"],["ピジョット","Pidgeot"],["コラッタ","Rattata"],["ラッタ","Raticate"],["オニスズメ","Spearow"],["オニドリル","Fearow"],["アーボ","Ekans"],["アーボック","Arbok"],["ピカチュウ","Pikachu"],["ライチュウ","Raichu"],["サンド","Sandshrew"],["サンドパン","Sandslash"],["ニドラン♀","Nidoran♀"],["ニドリーナ","Nidorina"],["ニドクイン","Nidoqueen"],["ニドラン♂","Nidoran♂"],["ニドリーノ","Nidorino"],["ニドキング","Nidoking"],["ピッピ","Clefairy"],["ピクシー","Clefable"],["ロコン","Vulpix"],["キュウコン","Ninetales"],["プリン","Jigglypuff"],["プクリン","Wigglytuff"],["ズバット","Zubat"],["ゴルバット","Golbat"],["ナゾノクサ","Oddish"],["クサイハナ","Gloom"],["ラフレシア","Vileplume"],["パラス","Paras"],["パラセクト","Parasect"],["コンパン","Venonat"],["モルフォン","Venomoth"],["ディグダ","Diglett"],["ダグトリオ","Dugtrio"],["ニャース","Meowth"],["ペルシアン","Persian"],["コダック","Psyduck"],["ゴルダック","Golduck"],["マンキー","Mankey"],["オコリザル","Primeape"],["ガーディ","Growlithe"],["ウインディ","Arcanine"],["ニョロモ","Poliwag"],["ニョロゾ","Poliwhirl"],["ニョロボン","Poliwrath"],["ケーシィ","Abra"],["ユンゲラー","Kadabra"],["フーディン","Alakazam"],["ワンリキー","Machop"],["ゴーリキー","Machoke"],["カイリキー","Machamp"],["マダツボミ","Bellsprout"],["ウツドン","Weepinbell"],["ウツボット","Victreebel"],["メノクラゲ","Tentacool"],["ドククラゲ","Tentacruel"],["イシツブテ","Geodude"],["ゴローン","Graveler"],["ゴローニャ","Golem"],["ポニータ","Ponyta"],["ギャロップ","Rapidash"],["ヤドン","Slowpoke"],["ヤドラン","Slowbro"],["コイル","Magnemite"],["レアコイル","Magneton"],["カモネギ","Farfetch’d"],["ドードー","Doduo"],["ドードリオ","Dodrio"],["パウワウ","Seel"],["ジュゴン","Dewgong"],["ベトベター","Grimer"],["ベトベトン","Muk"],["シェルダー","Shellder"],["パルシェン","Cloyster"],["ゴース","Gastly"],["ゴースト","Haunter"],["ゲンガー","Gengar"],["イワーク","Onix"],["スリープ","Drowzee"],["スリーパー","Hypno"],["クラブ","Krabby"],["キングラー","Kingler"],["ビリリダマ","Voltorb"],["マルマイン","Electrode"],["タマタマ","Exeggcute"],["ナッシー","Exeggutor"],["カラカラ","Cubone"],["ガラガラ","Marowak"],["サワムラー","Hitmonlee"],["エビワラー","Hitmonchan"],["ベロリンガ","Lickitung"],["ドガース","Koffing"],["マタドガス","Weezing"],["サイホーン","Rhyhorn"],["サイドン","Rhydon"],["ラッキー","Chansey"],["モンジャラ","Tangela"],["ガルーラ","Kangaskhan"],["タッツー","Horsea"],["シードラ","Seadra"],["トサキント","Goldeen"],["アズマオウ","Seaking"],["ヒトデマン","Staryu"],["スターミー","Starmie"],["バリヤード","Mr. Mime"],["ストライク","Scyther"],["ルージュラ","Jynx"],["エレブー","Electabuzz"],["ブーバー","Magmar"],["カイロス","Pinsir"],["ケンタロス","Tauros"],["コイキング","Magikarp"],["ギャラドス","Gyarados"],["ラプラス","Lapras"],["メタモン","Ditto"],["イーブイ","Eevee"],["シャワーズ","Vaporeon"],["サンダース","Jolteon"],["ブースター","Flareon"],["ポリゴン","Porygon"],["オムナイト","Omanyte"],["オムスター","Omastar"],["カブト","Kabuto"],["カブトプス","Kabutops"],["プテラ","Aerodactyl"],["カビゴン","Snorlax"],["フリーザー","Articuno"],["サンダー","Zapdos"],["ファイヤー","Moltres"],["ミニリュウ","Dratini"],["ハクリュー","Dragonair"],["カイリュー","Dragonite"],["ミュウツー","Mewtwo"],["ミュウ","Mew"],["チコリータ","Chikorita"],["ベイリーフ","Bayleef"],["メガニウム","Meganium"],["ヒノアラシ","Cyndaquil"],["マグマラシ","Quilava"],["バクフーン","Typhlosion"],["ワニノコ","Totodile"],["アリゲイツ","Croconaw"],["オーダイル","Feraligatr"],["オタチ","Sentret"],["オオタチ","Furret"],["ホーホー","Hoothoot"],["ヨルノズク","Noctowl"],["レディバ","Ledyba"],["レディアン","Ledian"],["イトマル","Spinarak"],["アリアドス","Ariados"],["クロバット","Crobat"],["チョンチー","Chinchou"],["ランターン","Lanturn"],["ピチュー","Pichu"],["ピィ","Cleffa"],["ププリン","Igglybuff"],["トゲピー","Togepi"],["トゲチック","Togetic"],["ネイティ","Natu"],["ネイティオ","Xatu"],["メリープ","Mareep"],["モココ","Flaaffy"],["デンリュウ","Ampharos"],["キレイハナ","Bellossom"],["マリル","Marill"],["マリルリ","Azumarill"],["ウソッキー","Sudowoodo"],["ニョロトノ","Politoed"],["ハネッコ","Hoppip"],["ポポッコ","Skiploom"],["ワタッコ","Jumpluff"],["エイパム","Aipom"],["ヒマナッツ","Sunkern"],["キマワリ","Sunflora"],["ヤンヤンマ","Yanma"],["ウパー","Wooper"],["ヌオー","Quagsire"],["エーフィ","Espeon"],["ブラッキー","Umbreon"],["ヤミカラス","Murkrow"],["ヤドキング","Slowking"],["ムウマ","Misdreavus"],["アンノーン","Unown"],["ソーナンス","Wobbuffet"],["キリンリキ","Girafarig"],["クヌギダマ","Pineco"],["フォレトス","Forretress"],["ノコッチ","Dunsparce"],["グライガー","Gligar"],["ハガネール","Steelix"],["ブルー","Snubbull"],["グランブル","Granbull"],["ハリーセン","Qwilfish"],["ハッサム","Scizor"],["ツボツボ","Shuckle"],["ヘラクロス","Heracross"],["ニューラ","Sneasel"],["ヒメグマ","Teddiursa"],["リングマ","Ursaring"],["マグマッグ","Slugma"],["マグカルゴ","Magcargo"],["ウリムー","Swinub"],["イノムー","Piloswine"],["サニーゴ","Corsola"],["テッポウオ","Remoraid"],["オクタン","Octillery"],["デリバード","Delibird"],["マンタイン","Mantine"],["エアームド","Skarmory"],["デルビル","Houndour"],["ヘルガー","Houndoom"],["キングドラ","Kingdra"],["ゴマゾウ","Phanpy"],["ドンファン","Donphan"],["ポリゴン２","Porygon2"],["オドシシ","Stantler"],["ドーブル","Smeargle"],["バルキー","Tyrogue"],["カポエラー","Hitmontop"],["ムチュール","Smoochum"],["エレキッド","Elekid"],["ブビィ","Magby"],["ミルタンク","Miltank"],["ハピナス","Blissey"],["ライコウ","Raikou"],["エンテイ","Entei"],["スイクン","Suicune"],["ヨーギラス","Larvitar"],["サナギラス","Pupitar"],["バンギラス","Tyranitar"],["ルギア","Lugia"],["ホウオウ","Ho-Oh"],["セレビィ","Celebi"]];
  const bySource=new Map(sets.map(set=>[set.source,set]));
  function identity(card={}){
    if((card.language||card.lang)!=='JP')return null;
    const id=card.source_id||card.sourceId||card.catalogId||'';
    const source=id.slice(0,id.lastIndexOf('-')),set=bySource.get(source);
    if(!set||!id.slice(id.lastIndexOf('-')+1)||(card.source_set_id&&card.source_set_id!==source))return null;
    const legacy=set.source==='PMCG5'?'GYM HEROES':set.source==='PMCG6'?'GYM CHALLENGE':'';
    if(card.set&&card.set!=='AUTO'&&card.set!==set.key&&card.set!==legacy)return null;
    return set;
  }
  // These aliases only broaden search; they must never establish card equivalence.
  function searchAliases(name){
    const value=String(name||'').normalize('NFKC');
    const match=species.find(([ja])=>value===ja||value.endsWith('の'+ja)||value==='わるい'+ja||value==='やさしい'+ja||value==='ひかる'+ja);
    if(!match)return [];
    const prefix=value.startsWith('わるい')?'Dark ':value.startsWith('やさしい')?'Light ':value.startsWith('ひかる')?'Shining ':'';
    return [prefix+match[1]];
  }
  function normalize(card){
    const set=identity(card);if(!set)return card;
    return {...card,set:set.key,set_name:set.label,source_set_id:set.source,
      search_aliases:searchAliases(card.name)};
  }
  window.JPSetCatalog={sets:Object.freeze(sets),sourceSets:Object.fromEntries(sets.map(s=>[s.key,[s.source]])),identity,normalize,searchAliases};
})();
