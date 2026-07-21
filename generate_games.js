import fs from 'fs';
import path from 'path';

// Define categories to map to Netflix style rows
const categories = [
  { name: 'Featured Classics', keywords: ['street fighter', 'final fight', 'double dragon', 'mario', 'sonic'] },
  { name: 'Capcom Universe', keywords: ['marvel', 'x-men', 'capcom', 'cadillacs'] },
  { name: 'Anime & Manga', keywords: ['dragon ball', 'naruto', 'sailor moon', 'bleach', 'jojo'] },
  { name: 'Horror & Fantasy', keywords: ['castlevania', 'splatterhouse', 'dungeons'] },
  { name: 'Beats of Rage Originals', keywords: ['beats of rage', 'rage'] },
  { name: 'Arcade Brawlers', keywords: ['ninja turtles', 'tmnt', 'battletoads', 'simpsons'] },
  { name: 'Community Creations', keywords: [] } // Fallback category
];

const getCategory = (title) => {
  const lowerTitle = title.toLowerCase();
  for (const cat of categories) {
    if (cat.keywords.some(keyword => lowerTitle.includes(keyword))) {
      return cat.name;
    }
  }
  return 'Community Creations';
};

// Generate a random high-quality cover using Unsplash source (since we don't have scraped box art)
// We use a deterministic seed based on the title so it doesn't change every refresh
const getCover = (title) => {
  const seed = title.replace(/\s+/g, '').slice(0, 10);
  return `https://picsum.photos/seed/${seed}/400/600`;
};

try {
  // Read the raw file
  const filePath = "C:\\Users\\breev\\.gemini\\antigravity\\brain\\4b7fbcb0-1598-4ebd-94b8-ce72f1f02932\\.system_generated\\steps\\349\\content.md";
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the JSON portion
  const jsonStart = content.indexOf('{"alternate_locations"');
  const jsonString = content.substring(jsonStart);
  
  const parsed = JSON.parse(jsonString);
  const files = parsed.files;
  
  const baseUrl = "https://archive.org/download/openbor-pak-collection/";
  const gamesList = [];
  
  files.forEach(file => {
    if (file.name.endsWith('.pak')) {
      // Clean up the title (remove [v.3.0 Build 4086] and .pak)
      let title = file.name.replace(/\.pak$/i, '');
      title = title.replace(/\[.*?\]/g, '').trim(); // Remove anything in brackets
      
      const gameObj = {
        id: file.md5 || title.replace(/\s+/g, '-').toLowerCase(),
        title: title,
        pakUrl: baseUrl + encodeURIComponent(file.name),
        coverUrl: getCover(title),
        category: getCategory(title),
        description: `Experience ${title} - a classic OpenBOR fan game.`
      };
      gamesList.push(gameObj);
    }
  });

  // Write to src/games.json
  const outPath = path.join(process.cwd(), 'src', 'games.json');
  fs.writeFileSync(outPath, JSON.stringify(gamesList, null, 2));
  
  console.log(`Successfully extracted ${gamesList.length} games and saved to src/games.json`);
} catch (err) {
  console.error("Failed to parse archive metadata:", err);
}
