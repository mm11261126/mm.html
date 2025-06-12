import express from 'express';
import axios from 'axios';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const translate = JSON.parse(fs.readFileSync('./translate.json', 'utf-8'));
const nameMap = JSON.parse(fs.readFileSync('./name-map.json', 'utf-8'));

function translateType(type) {
  return translate.types[type] || type;
}
function translateAbility(ability) {
  return translate.abilities[ability] || ability;
}

app.post('/chat', async (req, res) => {
  const { query, currentPokemon } = req.body;

  // 顯示屬性相剋表
  if (query.includes('屬性相剋')) {
    return res.json({
      reply: '這是屬性相剋表：',
      showTypeChart: true
    });
  }

  const keyword = query.trim();
  const nameEn = nameMap[keyword] || keyword.toLowerCase();

  try {
    // 嘗試當作新的寶可夢名稱查詢
    const pokemonRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nameEn}`);
    const pokemon = pokemonRes.data;

    const image = pokemon.sprites.front_default;
    const types = pokemon.types.map(t => translateType(t.type.name));
    const nameZh = keyword;

    return res.json({
      basicInfo: true,
      name: nameZh,
      image,
      types: types.join('、')
    });

  } catch {
    // 若有 currentPokemon 則回答細節問題
    if (currentPokemon) {
      const nameEn2 = nameMap[currentPokemon] || currentPokemon.toLowerCase();
      try {
        const pokemonRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nameEn2}`);
        const pokemon = pokemonRes.data;

        const abilities = pokemon.abilities.map(a => translateAbility(a.ability.name));
        const height = pokemon.height / 10 + ' 公尺';
        const weight = pokemon.weight / 10 + ' 公斤';

        const typeUrl = pokemon.types[0].type.url;
        const typeData = (await axios.get(typeUrl)).data;
        const weaknesses = typeData.damage_relations.double_damage_from.map(t => translateType(t.name));

        const lowerQuery = query.toLowerCase();
        const detailRes = {};

        if (query.includes('弱點')) detailRes.weaknesses = weaknesses.join('、');
        if (query.includes('身高')) detailRes.height = height;
        if (query.includes('體重')) detailRes.weight = weight;
        if (query.includes('特性')) detailRes.abilities = abilities.join('、');

        if (Object.keys(detailRes).length === 0) {
          return res.json({ reply: '請問你想知道什麼？可以問弱點、身高、體重或特性。' });
        }

        return res.json({ moreInfo: true, ...detailRes });

      } catch {
        return res.json({ reply: '無法取得進一步資料，請再試一次。' });
      }
    }

    return res.json({ reply: '查無此寶可夢，或請先告訴我寶可夢名稱～' });
  }
});

app.get('/joke', (req, res) => {
  const jokes = [
    "皮卡丘為什麼不洗澡？因為他怕被放電！⚡",
    "小火龍不吃辣，因為他自己就很火了！🔥",
    "妙蛙種子最怕什麼？最怕除草劑！🌿",
    "卡比獸最怕什麼？最怕有人搶他的睡覺時間！😴",
    "傑尼龜打架用什麼？用龜派氣功！🐢",
    "伊布為什麼不喜歡下雨？因為他怕變成水伊布！🌧️",
    "超夢為什麼不喜歡打牌？因為他怕被人讀心！🃏",
    "小磁怪為什麼不喜歡去海邊？因為他怕被生鏽！🌊",
    "火箭隊為什麼總是失敗？因為他們的計畫總是被皮卡丘電到！⚡",
    "寶可夢為什麼不喜歡上學？因為他們已經有太多技能要學了！📚",
    "寶可夢為什麼不喜歡冬天？因為他們怕被凍結！❄️",

  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  res.json({ joke });
});


app.get('/cold', (req, res) => {
  const colds = [
    "小智的皮卡丘不會進化，是因為不願變強而失去自我",
    "小小智在每一代動畫都重設了部分實力與寶可夢",
    "火箭隊的「喵喵」會說人話，設定上是為了討好一隻母貓",
    "火箭隊經常說的「我們是穿梭銀河的雙人組合」是從日本俳句改編的",
    "原版動畫中皮卡丘第一次出現時的叫聲不像現在那麼可愛",
    "小智曾短暫死亡（在電影《超夢的逆襲》被石化）。",
    "動畫中的寶可夢有時會違反遊戲的招式限制。",
    "小智的手上曾有一只「神奇寶貝圖鑑」被稱為「最強AI」。",
    "寶可夢世界並沒有動物，所有生物都是寶可夢。",
    "寶可夢蛋的產生是個「謎」，官方故意保持模糊",
    "大部分寶可夢都能理解人類語言",
  ];
  const cold = colds[Math.floor(Math.random() * colds.length)];
  res.json({ cold });
});





const starters = {
  "1": { reply: '這是關都御三家的圖片：', image: '/images/1.png' },
  "2": { reply: '這是城都御三家的圖片：', image: '/images/2.png' },
  "3": { reply: '這是豐緣御三家的圖片：', image: '/images/3.png' },
  "4": { reply: '這是神奧御三家的圖片：', image: '/images/4.png' },
  "5": { reply: '這是卡洛斯御三家的圖片：', image: '/images/5.png' },
  "6": { reply: '這是阿羅拉御三家的圖片：', image: '/images/6.png' },
  "7": { reply: '這是伽勒爾御三家的圖片：', image: '/images/7.png' },
  "8": { reply: '這是洗翠御三家的圖片：', image: '/images/8.png' },
  "9": { reply: '這是帕底亞御三家的圖片：', image: '/images/9.png' }
};

app.get('/starter/:gen', (req, res) => {
  const { gen } = req.params;
  if (starters[gen]) {
    res.json({
      reply: starters[gen].reply,
      showImage: starters[gen].image
    });
  } else {
    res.json({
      reply: '查無資料，請選擇有效的世代。'
    });
  }
});



app.listen(3000, () => {
  console.log('伺服器啟動於 http://localhost:3000');
});
