import re

with open('src/data/pregnancyData.js', 'r') as f:
    data = f.read()

fruitImages = {
  'Week 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Poppy_seeds.jpg/320px-Poppy_seeds.jpg',
  'Week 5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Sesame_seeds.jpeg/320px-Sesame_seeds.jpeg',
  'Week 6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lentils_-_1.jpg/320px-Lentils_-_1.jpg',
  'Week 7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Blueberries.jpg/320px-Blueberries.jpg',
  'Week 8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Raspberries05.jpg/320px-Raspberries05.jpg',
  'Week 9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Table_grapes_on_white.jpg/320px-Table_grapes_on_white.jpg',
  'Week 10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Kumquat_fruit.jpg/320px-Kumquat_fruit.jpg',
  'Week 11': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Figs.jpg/320px-Figs.jpg',
  'Week 12': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Lime_-_whole_and_halved.jpg/320px-Lime_-_whole_and_halved.jpg',
  'Week 13': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lemon.jpg/320px-Lemon.jpg',
  'Week 14': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Peach_-_whole_and_halved.jpg/320px-Peach_-_whole_and_halved.jpg',
  'Week 15': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/320px-Red_Apple.jpg',
  'Week 16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Avocado_with_cross_section.jpg/320px-Avocado_with_cross_section.jpg',
  'Week 17': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Turnip.jpg/320px-Turnip.jpg',
  'Week 18': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bell_pepper.jpg/320px-Bell_pepper.jpg',
  'Week 19': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/320px-Tomato_je.jpg',
  'Week 20': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Single.jpg/320px-Banana-Single.jpg',
  'Week 21': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Carrots_at_Lonsdale_Quay_Market.jpg/320px-Carrots_at_Lonsdale_Quay_Market.jpg',
  'Week 22': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Papaya_cross_section.jpg/320px-Papaya_cross_section.jpg',
  'Week 23': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Grapefruit_half.jpg/320px-Grapefruit_half.jpg',
  'Week 24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Cantaloupe_and_cross_section.jpg/320px-Cantaloupe_and_cross_section.jpg',
  'Week 25': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cauliflower.jpg/320px-Cauliflower.jpg',
  'Week 26': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Iceberg_lettuce_in_studio.jpg/320px-Iceberg_lettuce_in_studio.jpg',
  'Week 27': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rutabaga.jpg/320px-Rutabaga.jpg',
  'Week 28': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Eggplant.jpg/320px-Eggplant.jpg',
  'Week 29': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Butternut_Squash.jpg/320px-Butternut_Squash.jpg',
  'Week 30': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cabbage.jpg/320px-Cabbage.jpg',
  'Week 31': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Coconut_white_background.jpg/320px-Coconut_white_background.jpg',
  'Week 32': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Jicama.jpg/320px-Jicama.jpg',
  'Week 33': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Pineapple_and_cross_section.jpg/320px-Pineapple_and_cross_section.jpg',
  'Week 34': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Honeydew.jpg/320px-Honeydew.jpg',
  'Week 35': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Honeydew.jpg/320px-Honeydew.jpg',
  'Week 36': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Romaine_lettuce.jpg/320px-Romaine_lettuce.jpg',
  'Week 37': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Swiss_chard.jpg/320px-Swiss_chard.jpg',
  'Week 38': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Leeks.jpg/320px-Leeks.jpg',
  'Week 39': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Watermelon_and_cross_section.jpg/320px-Watermelon_and_cross_section.jpg',
  'Week 40': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/French_Pumpkin.jpg/320px-French_Pumpkin.jpg'
}

for week, url in fruitImages.items():
    pattern = rf"week:\s*'{week}',\s*emoji:\s*'.*?'"
    replacement = f"week: '{week}',\n    imageUrl: '{url}'"
    data = re.sub(pattern, replacement, data)

# Remove emoji field from moodOptions
data = re.sub(r"emoji:\s*'.*?',\s*", "", data)

with open('src/data/pregnancyData.js', 'w') as f:
    f.write(data)

with open('src/components/BabyDevelopment.jsx', 'r') as f:
    baby = f.read()

baby = re.sub(
    r'<span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">.*?\{weekData\.emoji\}.*?</span>',
    r'<img src={weekData.imageUrl} alt={weekData.size} className="w-12 h-12 object-cover rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 border-2 border-white" />',
    baby,
    flags=re.DOTALL
)

with open('src/components/BabyDevelopment.jsx', 'w') as f:
    f.write(baby)

print("done")
