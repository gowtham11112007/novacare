const fs = require('fs');

// 1. Update pregnancyData.js
let data = fs.readFileSync('src/data/pregnancyData.js', 'utf-8');

// Replace emojis with high-quality fruit image URLs (Wikimedia Commons / Unsplash)
const fruitImages = {
  'Week 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Poppy_seeds.jpg/320px-Poppy_seeds.jpg', // Poppy seed
  'Week 5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Sesame_seeds.jpeg/320px-Sesame_seeds.jpeg', // Sesame seed
  'Week 6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lentils_-_1.jpg/320px-Lentils_-_1.jpg', // Lentil
  'Week 7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Blueberries.jpg/320px-Blueberries.jpg', // Blueberry
  'Week 8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Raspberries05.jpg/320px-Raspberries05.jpg', // Raspberry
  'Week 9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Table_grapes_on_white.jpg/320px-Table_grapes_on_white.jpg', // Grape
  'Week 10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Kumquat_fruit.jpg/320px-Kumquat_fruit.jpg', // Kumquat
  'Week 11': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Figs.jpg/320px-Figs.jpg', // Fig
  'Week 12': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Lime_-_whole_and_halved.jpg/320px-Lime_-_whole_and_halved.jpg', // Lime
  'Week 13': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lemon.jpg/320px-Lemon.jpg', // Lemon
  'Week 14': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Peach_-_whole_and_halved.jpg/320px-Peach_-_whole_and_halved.jpg', // Peach
  'Week 15': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/320px-Red_Apple.jpg', // Apple
  'Week 16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Avocado_with_cross_section.jpg/320px-Avocado_with_cross_section.jpg', // Avocado
  'Week 17': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Turnip.jpg/320px-Turnip.jpg', // Turnip
  'Week 18': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bell_pepper.jpg/320px-Bell_pepper.jpg', // Bell pepper
  'Week 19': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/320px-Tomato_je.jpg', // Tomato
  'Week 20': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Single.jpg/320px-Banana-Single.jpg', // Banana
  'Week 21': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Carrots_at_Lonsdale_Quay_Market.jpg/320px-Carrots_at_Lonsdale_Quay_Market.jpg', // Carrot
  'Week 22': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Papaya_cross_section.jpg/320px-Papaya_cross_section.jpg', // Papaya
  'Week 23': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Grapefruit_half.jpg/320px-Grapefruit_half.jpg', // Grapefruit
  'Week 24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Cantaloupe_and_cross_section.jpg/320px-Cantaloupe_and_cross_section.jpg', // Cantaloupe
  'Week 25': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cauliflower.jpg/320px-Cauliflower.jpg', // Cauliflower
  'Week 26': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Iceberg_lettuce_in_studio.jpg/320px-Iceberg_lettuce_in_studio.jpg', // Lettuce
  'Week 27': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rutabaga.jpg/320px-Rutabaga.jpg', // Rutabaga
  'Week 28': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Eggplant.jpg/320px-Eggplant.jpg', // Eggplant
  'Week 29': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Butternut_Squash.jpg/320px-Butternut_Squash.jpg', // Butternut squash
  'Week 30': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cabbage.jpg/320px-Cabbage.jpg', // Cabbage
  'Week 31': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Coconut_white_background.jpg/320px-Coconut_white_background.jpg', // Coconut
  'Week 32': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Jicama.jpg/320px-Jicama.jpg', // Jicama
  'Week 33': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Pineapple_and_cross_section.jpg/320px-Pineapple_and_cross_section.jpg', // Pineapple
  'Week 34': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Honeydew.jpg/320px-Honeydew.jpg', // Honeydew
  'Week 35': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Honeydew.jpg/320px-Honeydew.jpg', // Honeydew
  'Week 36': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Romaine_lettuce.jpg/320px-Romaine_lettuce.jpg', // Romaine
  'Week 37': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Swiss_chard.jpg/320px-Swiss_chard.jpg', // Swiss chard
  'Week 38': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Leeks.jpg/320px-Leeks.jpg', // Leek
  'Week 39': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Watermelon_and_cross_section.jpg/320px-Watermelon_and_cross_section.jpg', // Watermelon
  'Week 40': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/French_Pumpkin.jpg/320px-French_Pumpkin.jpg' // Pumpkin
};

for (const [week, url] of Object.entries(fruitImages)) {
  const regex = new RegExp(`week: '${week}',\\s*emoji: '.*?'`, 'g');
  data = data.replace(regex, `week: '${week}',\n    imageUrl: '${url}'`);
}
// Remove emoji field from moodOptions
data = data.replace(/emoji:\s*'.*?',\s*/g, '');
fs.writeFileSync('src/data/pregnancyData.js', data);

// 2. Update BabyDevelopment.jsx to use imageUrl
let babyDev = fs.readFileSync('src/components/BabyDevelopment.jsx', 'utf-8');
babyDev = babyDev.replace(/<span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">.*?\{weekData\.emoji\}.*?<\/span>/s, 
  `<img src={weekData.imageUrl} alt={weekData.size} className="w-12 h-12 object-cover rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 border-2 border-white" />`);
fs.writeFileSync('src/components/BabyDevelopment.jsx', babyDev);

console.log("Updated data and components.");
