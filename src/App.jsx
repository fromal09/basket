import { useState, useRef, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';


// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#F7F6F2", surface:"#FFFFFF", surfaceUp:"#F0EEE9",
  border:"#E6E3DC", borderUp:"#D0CCC4",
  text:"#1C1A17", mid:"#6E6A63", dim:"#ABA69E", ink:"#1C1A17",
};

// ─── Aisles ───────────────────────────────────────────────────────────────────
const AISLES = {
  "Produce":               { color:"#2E8B57", emoji:"🥬" },
  "Canned Goods":          { color:"#C17A30", emoji:"🥫" },
  "Dairy":                 { color:"#2E7EB5", emoji:"🥛" },
  "Protein":               { color:"#A83020", emoji:"🥩" },
  "Condiments & Spices":   { color:"#B07820", emoji:"🫙" },
  "Snacks":                { color:"#908020", emoji:"🍿" },
  "Bread & Bakery":        { color:"#A06828", emoji:"🍞" },
  "Beverages":             { color:"#6050A0", emoji:"☕" },
  "Pasta / Rice / Cereal": { color:"#7A6040", emoji:"🍝" },
  "Baking":                { color:"#C08040", emoji:"🌾" },
  "Frozen":                { color:"#3870A8", emoji:"🧊" },
  "Personal Care":         { color:"#A05080", emoji:"🧴" },
  "Household Supplies":    { color:"#407080", emoji:"🧹" },
  "Other":                 { color:"#406858", emoji:"📦" },
};
const AISLE_ORDER = Object.keys(AISLES);

// ─── Emoji map ────────────────────────────────────────────────────────────────
const EMOJI = {
  // Produce
  apple:"🍎","green apple":"🍏",apricot:"🍑",artichoke:"🥦",arugula:"🥬",
  asparagus:"🥦",avocado:"🥑",banana:"🍌",basil:"🌿",beet:"🫚",
  blackberry:"🫐",blueberry:"🫐",broccoli:"🥦","brussels sprouts":"🥦",
  "butternut squash":"🎃",cabbage:"🥬",cantaloupe:"🍈",carrot:"🥕",
  cauliflower:"🥦",celery:"🥬",cherry:"🍒","cherry tomatoes":"🍅",
  chive:"🌿",cilantro:"🌿",coconut:"🥥",corn:"🌽",cranberry:"🍒",
  cucumber:"🥒",dill:"🌿",eggplant:"🍆",endive:"🥬",fennel:"🌿",
  garlic:"🧄",ginger:"🫚",grapefruit:"🍊",grapes:"🍇","green beans":"🫛",
  "green onion":"🧅",jalapeño:"🌶️",kale:"🥬",kiwi:"🥝",leek:"🧅",
  lemon:"🍋",lettuce:"🥬",lime:"🍋",mango:"🥭",mint:"🌿",mushroom:"🍄",
  nectarine:"🍑",onion:"🧅",orange:"🍊",papaya:"🍈",parsley:"🌿",
  peach:"🍑",pear:"🍐","pearl onion":"🧅",peas:"🫛",pineapple:"🍍",
  plum:"🍑",pomegranate:"🍎",potato:"🥔",pumpkin:"🎃",radish:"🌸",
  raspberry:"🍓",rosemary:"🌿",sage:"🌿",scallion:"🧅",shallot:"🧅",
  spinach:"🥬",strawberry:"🍓","sweet potato":"🍠",thyme:"🌿",
  tomato:"🍅",watermelon:"🍉",zucchini:"🥒",pepper:"🫑",
  "bell pepper":"🫑","snap peas":"🫛",chard:"🥬","collard greens":"🥬",
  turnip:"🥕",parsnip:"🥕",broccolini:"🥦","baby spinach":"🥬",
  // Canned Goods
  "canned tomatoes":"🥫","canned beans":"🥫","canned corn":"🥫",
  "canned tuna":"🥫","canned salmon":"🥫","canned sardines":"🥫",
  "canned chickpeas":"🥫","canned coconut milk":"🥫","canned pumpkin":"🥫",
  "canned olives":"🥫","canned artichokes":"🥫","tomato paste":"🥫",
  "tomato sauce":"🥫","chicken broth":"🥫","beef broth":"🥫",
  "vegetable broth":"🥫","chicken stock":"🥫","beef stock":"🥫",
  "tomato soup":"🥫","canned peaches":"🥫","canned fruit":"🥫",
  "refried beans":"🥫","black beans":"🥫","kidney beans":"🥫",
  "chickpeas":"🥫",lentils:"🥫","navy beans":"🥫",olives:"🫒",
  // Dairy
  milk:"🥛",butter:"🧈",cheese:"🧀",cheddar:"🧀",mozzarella:"🧀",
  parmesan:"🧀",brie:"🧀",feta:"🧀","goat cheese":"🧀",
  "cream cheese":"🧀",ricotta:"🧀","cottage cheese":"🥛",
  "sour cream":"🥛",cream:"🥛","heavy cream":"🥛","whipped cream":"🥛",
  "half and half":"🥛",yogurt:"🍦","greek yogurt":"🍦","oat milk":"🥛",
  "almond milk":"🥛","soy milk":"🥛",kefir:"🥛","lactaid milk":"🥛",
  "string cheese":"🧀",brie:"🧀","swiss cheese":"🧀","provolone":"🧀",
  // Protein
  chicken:"🍗","chicken breast":"🍗","chicken thighs":"🍗",
  "chicken wings":"🍗","rotisserie chicken":"🍗",beef:"🥩",
  "ground beef":"🥩",sirloin:"🥩",steak:"🥩","ribeye":"🥩",
  pork:"🥩","pork chops":"🥩",bacon:"🥓",sausage:"🌭",
  "hot dogs":"🌭",ham:"🍖",turkey:"🍗","ground turkey":"🍗",
  lamb:"🍖",salmon:"🐟",tuna:"🐟",cod:"🐟",tilapia:"🐟",
  shrimp:"🍤",lobster:"🦞",crab:"🦀",scallops:"🐚",
  mussels:"🦪",clams:"🦪",oysters:"🦪",anchovies:"🐟",
  eggs:"🥚",egg:"🥚",tofu:"🍱",tempeh:"🍱",edamame:"🫛",
  "fish fillets":"🐟","canned tuna":"🐟",duck:"🍗","pork belly":"🥩",
  prosciutto:"🍖",salami:"🍖","deli turkey":"🍗","deli ham":"🍗",
  // Condiments & Spices
  salt:"🧂","black pepper":"🫚",pepper:"🫚","garlic powder":"🧄",
  "onion powder":"🧅",cumin:"🌶️",paprika:"🌶️","chili powder":"🌶️",
  cayenne:"🌶️",turmeric:"🌿",cinnamon:"🌿",nutmeg:"🌿",oregano:"🌿",
  "red pepper flakes":"🌶️","mustard seed":"🌿",coriander:"🌿",
  cardamom:"🌿",cloves:"🌿",allspice:"🌿","vanilla extract":"🫙",
  "soy sauce":"🫙","fish sauce":"🫙",worcestershire:"🫙",
  "hot sauce":"🌶️",sriracha:"🌶️",ketchup:"🍅",mustard:"🫙",
  "dijon mustard":"🫙",mayonnaise:"🫙",relish:"🫙",honey:"🍯",
  "maple syrup":"🍁","olive oil":"🫒","vegetable oil":"🫙",
  "coconut oil":"🥥","sesame oil":"🫙",vinegar:"🫙",
  "apple cider vinegar":"🍎","balsamic vinegar":"🫙",
  "red wine vinegar":"🍷",tahini:"🫙","peanut butter":"🥜",
  "almond butter":"🥜",jam:"🫙",jelly:"🫙",salsa:"🫙",
  pesto:"🌿",hummus:"🫙",ranch:"🫙","caesar dressing":"🫙",
  "italian dressing":"🫙","olive oil spray":"🫒",
  "cooking spray":"🫙",capers:"🫙","anchovy paste":"🫙",
  "oyster sauce":"🫙","hoisin sauce":"🫙","teriyaki sauce":"🫙",
  "barbecue sauce":"🫙",
  // Snacks
  chips:"🥔","tortilla chips":"🥔","pita chips":"🥔",crackers:"🫙",
  popcorn:"🍿",pretzels:"🥨",nuts:"🥜",almonds:"🥜",cashews:"🥜",
  peanuts:"🥜",walnuts:"🥜",pistachios:"🫘","mixed nuts":"🥜",
  "trail mix":"🥜",granola:"🌾","granola bar":"🌾","protein bar":"🍫",
  "energy bar":"⚡","fruit snacks":"🍓","gummy bears":"🐻",
  candy:"🍬",chocolate:"🍫","dark chocolate":"🍫","milk chocolate":"🍫",
  cookies:"🍪",oreos:"🍪","rice cakes":"🍙",jerky:"🥩",
  "beef jerky":"🥩","dried mango":"🥭","dried cranberries":"🍒",
  raisins:"🍇","sunflower seeds":"🌻","pumpkin seeds":"🌱",
  "nut butter":"🥜","fruit leather":"🍓",
  // Bread & Bakery
  bread:"🍞",sourdough:"🍞","whole wheat bread":"🍞",
  "white bread":"🍞","rye bread":"🍞",baguette:"🥖",
  ciabatta:"🥖",pita:"🫓",naan:"🫓",tortilla:"🫓",
  wraps:"🫓",bagel:"🥯","english muffin":"🫓",croissant:"🥐",
  "dinner rolls":"🍞","hamburger buns":"🍞","hot dog buns":"🍞",
  muffin:"🧁","banana bread":"🍞",cornbread:"🌽",
  lavash:"🫓","pita bread":"🫓","flour tortillas":"🫓",
  "corn tortillas":"🫓",bun:"🍞",
  // Beverages
  water:"💧","sparkling water":"💧",seltzer:"💧",coffee:"☕",
  espresso:"☕","cold brew":"☕",tea:"🍵","green tea":"🍵",
  "black tea":"🍵","herbal tea":"🍵","orange juice":"🍊",
  "apple juice":"🍎","cranberry juice":"🍒",lemonade:"🍋",
  "iced tea":"🍵",kombucha:"🧃","coconut water":"🥥",
  wine:"🍷","red wine":"🍷","white wine":"🍾",rosé:"🍷",
  champagne:"🥂",beer:"🍺","hard cider":"🍎",
  "energy drink":"⚡","sports drink":"💧",gatorade:"💧",
  juice:"🥤",soda:"🥤",
  // Pasta / Rice / Cereal
  pasta:"🍝",spaghetti:"🍝",penne:"🍝",rigatoni:"🍝",
  fettuccine:"🍝",linguine:"🍝","lasagna noodles":"🍝",
  orzo:"🍝",rice:"🍚","white rice":"🍚","brown rice":"🍚",
  "basmati rice":"🍚","jasmine rice":"🍚","arborio rice":"🍚",
  quinoa:"🌾",farro:"🌾",barley:"🌾",oats:"🌾",
  "rolled oats":"🌾","steel cut oats":"🌾",cereal:"🥣",
  cornflakes:"🥣",cheerios:"🥣","granola cereal":"🥣",
  muesli:"🥣",ramen:"🍜",udon:"🍜","soba noodles":"🍜",
  couscous:"🌾",bulgur:"🌾",grits:"🌾",polenta:"🌾",
  // Baking
  flour:"🌾","all-purpose flour":"🌾","bread flour":"🌾",
  "cake flour":"🌾","almond flour":"🥜","coconut flour":"🥥",
  sugar:"🍬","brown sugar":"🍬","powdered sugar":"🍬",
  "baking powder":"🫙","baking soda":"🫙",yeast:"🍞",
  "cocoa powder":"🍫","chocolate chips":"🍫","baking chocolate":"🍫",
  cornstarch:"🌾","cream of tartar":"🫙",molasses:"🫙",
  "food coloring":"🎨",sprinkles:"🎂",
  "parchment paper":"📄","vanilla bean":"🌿",
  // Frozen
  "ice cream":"🍦",sorbet:"🍧","frozen yogurt":"🍦",
  "frozen berries":"🫐","frozen mango":"🥭","frozen corn":"🌽",
  "frozen peas":"🫛","frozen broccoli":"🥦","frozen vegetables":"🥦",
  "frozen pizza":"🍕","frozen burritos":"🌯","frozen waffles":"🧇",
  "frozen pancakes":"🥞","frozen fries":"🍟","frozen fish":"🐟",
  "frozen shrimp":"🍤",ice:"🧊","ice pops":"🧊",
  "frozen dinners":"🍱","pot pie":"🥧","frozen soup":"🍲",
  waffles:"🧇",pizza:"🍕",
  // Personal Care
  shampoo:"🧴",conditioner:"🧴","body wash":"🧴",soap:"🧼",
  "hand soap":"🧼",toothpaste:"🦷",toothbrush:"🦷",floss:"🦷",
  mouthwash:"🦷",deodorant:"🧴",razor:"🪒","shaving cream":"🧴",
  lotion:"🧴",moisturizer:"🧴",sunscreen:"🧴","face wash":"🧴",
  toner:"🧴","cotton balls":"🤍","q-tips":"🤍",tampons:"🩸",
  pads:"🩸","contact solution":"👁️","band-aids":"🩹",
  advil:"💊",tylenol:"💊",vitamins:"💊",ibuprofen:"💊",
  // Household Supplies
  "paper towels":"🧻","toilet paper":"🧻",tissues:"🧻",
  napkins:"🍽️","dish soap":"🫧","dishwasher pods":"🫧",
  "laundry detergent":"🧺","fabric softener":"🧺",
  "dryer sheets":"🧺","trash bags":"🗑️","garbage bags":"🗑️",
  "ziploc bags":"🛍️","plastic wrap":"🪙","aluminum foil":"🪙",
  sponge:"🧽","cleaning spray":"🧴","all-purpose cleaner":"🧴",
  bleach:"🧴",windex:"🪟","paper plates":"🍽️","plastic cups":"🥤",
  batteries:"🔋","light bulbs":"💡",candles:"🕯️",matches:"🔥",
  tape:"🖊️","ziplock bags":"🛍️","rubber gloves":"🧤",
  "dish towel":"🪣","toilet bowl cleaner":"🧴",
};

const getEmoji = name => {
  const n = name.toLowerCase().trim();
  if (EMOJI[n]) return EMOJI[n];
  for (const k of Object.keys(EMOJI)) if (n.includes(k)) return EMOJI[k];
  return null;
};

// ─── Category inference ────────────────────────────────────────────────────────
// Legacy aliases so items stored under old category names still display correctly
const CAT_ALIAS = {
  "Dairy & Eggs":"Dairy", "Meat & Seafood":"Protein",
  "Bakery":"Bread & Bakery", "Pantry":"Condiments & Spices",
  "Household":"Household Supplies",
};

const CAT = {
  // Produce
  apple:"Produce",apricot:"Produce",artichoke:"Produce",arugula:"Produce",
  asparagus:"Produce",avocado:"Produce",banana:"Produce",basil:"Produce",
  beet:"Produce",blackberry:"Produce",blueberry:"Produce",broccoli:"Produce",
  broccolini:"Produce",cabbage:"Produce",cantaloupe:"Produce",carrot:"Produce",
  cauliflower:"Produce",celery:"Produce",cherry:"Produce",cilantro:"Produce",
  coconut:"Produce",corn:"Produce",cranberry:"Produce",cucumber:"Produce",
  dill:"Produce",eggplant:"Produce",endive:"Produce",fennel:"Produce",
  garlic:"Produce",ginger:"Produce",grapefruit:"Produce",grapes:"Produce",
  jalapeño:"Produce",kale:"Produce",kiwi:"Produce",leek:"Produce",
  lemon:"Produce",lettuce:"Produce",lime:"Produce",mango:"Produce",
  mint:"Produce",mushroom:"Produce",nectarine:"Produce",onion:"Produce",
  orange:"Produce",papaya:"Produce",parsley:"Produce",parsnip:"Produce",
  peach:"Produce",pear:"Produce",peas:"Produce",pineapple:"Produce",
  plum:"Produce",pomegranate:"Produce",potato:"Produce",pumpkin:"Produce",
  radish:"Produce",raspberry:"Produce",rosemary:"Produce",sage:"Produce",
  scallion:"Produce",shallot:"Produce",spinach:"Produce",strawberry:"Produce",
  thyme:"Produce",tomato:"Produce",turnip:"Produce",watermelon:"Produce",
  zucchini:"Produce",pepper:"Produce",chard:"Produce",
  // Canned Goods
  "canned tomatoes":"Canned Goods","canned beans":"Canned Goods",
  "canned corn":"Canned Goods","canned tuna":"Canned Goods",
  "canned salmon":"Canned Goods","canned sardines":"Canned Goods",
  "canned chickpeas":"Canned Goods","canned coconut milk":"Canned Goods",
  "canned pumpkin":"Canned Goods","canned olives":"Canned Goods",
  "tomato paste":"Canned Goods","tomato sauce":"Canned Goods",
  "chicken broth":"Canned Goods","beef broth":"Canned Goods",
  "vegetable broth":"Canned Goods","chicken stock":"Canned Goods",
  "beef stock":"Canned Goods","refried beans":"Canned Goods",
  "black beans":"Canned Goods","kidney beans":"Canned Goods",
  chickpeas:"Canned Goods",lentils:"Canned Goods",olives:"Canned Goods",
  broth:"Canned Goods",stock:"Canned Goods",
  // Dairy
  milk:"Dairy",butter:"Dairy",cheese:"Dairy",cheddar:"Dairy",
  mozzarella:"Dairy",parmesan:"Dairy",brie:"Dairy",feta:"Dairy",
  "goat cheese":"Dairy","cream cheese":"Dairy",ricotta:"Dairy",
  "cottage cheese":"Dairy","sour cream":"Dairy",cream:"Dairy",
  "heavy cream":"Dairy","half and half":"Dairy",yogurt:"Dairy",
  "greek yogurt":"Dairy","oat milk":"Dairy","almond milk":"Dairy",
  "soy milk":"Dairy",kefir:"Dairy",
  // Protein
  chicken:"Protein","chicken breast":"Protein","chicken thighs":"Protein",
  beef:"Protein","ground beef":"Protein",steak:"Protein",sirloin:"Protein",
  pork:"Protein","pork chops":"Protein",bacon:"Protein",sausage:"Protein",
  "hot dogs":"Protein",ham:"Protein",turkey:"Protein",
  "ground turkey":"Protein",lamb:"Protein",salmon:"Protein",
  tuna:"Protein",cod:"Protein",tilapia:"Protein",shrimp:"Protein",
  lobster:"Protein",crab:"Protein",scallops:"Protein",mussels:"Protein",
  clams:"Protein",oysters:"Protein",anchovies:"Protein",
  egg:"Protein",eggs:"Protein",tofu:"Protein",tempeh:"Protein",duck:"Protein",
  // Condiments & Spices
  salt:"Condiments & Spices","black pepper":"Condiments & Spices",
  cumin:"Condiments & Spices",paprika:"Condiments & Spices",
  "chili powder":"Condiments & Spices",cayenne:"Condiments & Spices",
  turmeric:"Condiments & Spices",cinnamon:"Condiments & Spices",
  oregano:"Condiments & Spices","vanilla extract":"Condiments & Spices",
  "soy sauce":"Condiments & Spices","hot sauce":"Condiments & Spices",
  sriracha:"Condiments & Spices",ketchup:"Condiments & Spices",
  mustard:"Condiments & Spices","dijon mustard":"Condiments & Spices",
  mayonnaise:"Condiments & Spices",honey:"Condiments & Spices",
  "maple syrup":"Condiments & Spices","olive oil":"Condiments & Spices",
  oil:"Condiments & Spices",vinegar:"Condiments & Spices",
  tahini:"Condiments & Spices","peanut butter":"Condiments & Spices",
  jam:"Condiments & Spices",salsa:"Condiments & Spices",pesto:"Condiments & Spices",
  ranch:"Condiments & Spices","barbecue sauce":"Condiments & Spices",
  "teriyaki sauce":"Condiments & Spices",capers:"Condiments & Spices",
  // Snacks
  chips:"Snacks",crackers:"Snacks",popcorn:"Snacks",pretzels:"Snacks",
  nuts:"Snacks",almonds:"Snacks",cashews:"Snacks",peanuts:"Snacks",
  walnuts:"Snacks",pistachios:"Snacks","mixed nuts":"Snacks",
  "trail mix":"Snacks","granola bar":"Snacks","protein bar":"Snacks",
  "energy bar":"Snacks","fruit snacks":"Snacks","gummy bears":"Snacks",
  candy:"Snacks",chocolate:"Snacks",cookies:"Snacks",jerky:"Snacks",
  "beef jerky":"Snacks","dried mango":"Snacks","sunflower seeds":"Snacks",
  // Bread & Bakery
  bread:"Bread & Bakery",sourdough:"Bread & Bakery",bagel:"Bread & Bakery",
  baguette:"Bread & Bakery",ciabatta:"Bread & Bakery",pita:"Bread & Bakery",
  naan:"Bread & Bakery",tortilla:"Bread & Bakery",wraps:"Bread & Bakery",
  "english muffin":"Bread & Bakery",croissant:"Bread & Bakery",
  bun:"Bread & Bakery",muffin:"Bread & Bakery",cornbread:"Bread & Bakery",
  // Beverages
  coffee:"Beverages",tea:"Beverages",wine:"Beverages",beer:"Beverages",
  juice:"Beverages",soda:"Beverages",water:"Beverages",
  kombucha:"Beverages","sparkling water":"Beverages",seltzer:"Beverages",
  lemonade:"Beverages","coconut water":"Beverages",champagne:"Beverages",
  "energy drink":"Beverages","sports drink":"Beverages",
  // Pasta / Rice / Cereal
  pasta:"Pasta / Rice / Cereal",spaghetti:"Pasta / Rice / Cereal",
  penne:"Pasta / Rice / Cereal",rice:"Pasta / Rice / Cereal",
  quinoa:"Pasta / Rice / Cereal",oats:"Pasta / Rice / Cereal",
  cereal:"Pasta / Rice / Cereal",ramen:"Pasta / Rice / Cereal",
  udon:"Pasta / Rice / Cereal",couscous:"Pasta / Rice / Cereal",
  barley:"Pasta / Rice / Cereal",farro:"Pasta / Rice / Cereal",
  grits:"Pasta / Rice / Cereal",polenta:"Pasta / Rice / Cereal",
  // Baking
  flour:"Baking","all-purpose flour":"Baking",sugar:"Baking",
  "brown sugar":"Baking","powdered sugar":"Baking","baking powder":"Baking",
  "baking soda":"Baking",yeast:"Baking","cocoa powder":"Baking",
  "chocolate chips":"Baking",cornstarch:"Baking",molasses:"Baking",
  sprinkles:"Baking",
  // Frozen
  "ice cream":"Frozen",sorbet:"Frozen",waffles:"Frozen",pizza:"Frozen",
  "frozen berries":"Frozen","frozen vegetables":"Frozen",
  "frozen pizza":"Frozen","frozen waffles":"Frozen","frozen fries":"Frozen",
  "frozen shrimp":"Frozen","frozen fish":"Frozen",ice:"Frozen",
  edamame:"Frozen",
  // Personal Care
  shampoo:"Personal Care",conditioner:"Personal Care",
  "body wash":"Personal Care",soap:"Personal Care",
  "hand soap":"Personal Care",toothpaste:"Personal Care",
  toothbrush:"Personal Care",floss:"Personal Care",
  mouthwash:"Personal Care",deodorant:"Personal Care",
  razor:"Personal Care","shaving cream":"Personal Care",
  lotion:"Personal Care",moisturizer:"Personal Care",
  sunscreen:"Personal Care","face wash":"Personal Care",
  tampons:"Personal Care",pads:"Personal Care",
  "band-aids":"Personal Care",vitamins:"Personal Care",
  ibuprofen:"Personal Care",advil:"Personal Care",
  tylenol:"Personal Care",
  // Household Supplies
  "paper towels":"Household Supplies","toilet paper":"Household Supplies",
  tissues:"Household Supplies","dish soap":"Household Supplies",
  "dishwasher pods":"Household Supplies",
  "laundry detergent":"Household Supplies","trash bags":"Household Supplies",
  "garbage bags":"Household Supplies","ziploc bags":"Household Supplies",
  "plastic wrap":"Household Supplies","aluminum foil":"Household Supplies",
  sponge:"Household Supplies","cleaning spray":"Household Supplies",
  bleach:"Household Supplies","paper plates":"Household Supplies",
  batteries:"Household Supplies","light bulbs":"Household Supplies",
  candles:"Household Supplies",detergent:"Household Supplies",
};

const inferCat = name => {
  const n = name.toLowerCase().trim();
  for (const k of Object.keys(CAT)) if (n === k || n.includes(k)) return CAT[k];
  return null;
};
// Resolve a stored category — handles old names and missing entries
const resolveCat = cat => CAT_ALIAS[cat] || (AISLES[cat] ? cat : "Other");


// ─── Helpers ──────────────────────────────────────────────────────────────────
// Normalise items from storage so old items without new fields still work
const normalizeItem = it => ({
  aisleNum: null, note: "", by: "", done: false,
  ...it,
  cat: resolveCat(it.cat || "Other"),
});
const normalizeLists = lists => {
  if (!lists) return {};
  const out = {};
  Object.keys(lists).forEach(k => { out[k] = (lists[k]||[]).map(normalizeItem); });
  return out;
};
const hexBg = (hex, pct) => hex + Math.round(pct * 255).toString(16).padStart(2,"0");

// Parse an aisle tag — could be a number ("3") or a section name ("Produce")
const parseAisle = val => {
  if (val == null || String(val).trim() === "") return null;
  const s = String(val).trim();
  const n = parseInt(s, 10);
  const isNum = !isNaN(n) && String(n) === s;
  return { isNum, num: n, str: s };
};
const aisleLabel = val => {
  const p = parseAisle(val);
  if (!p) return null;
  return p.isNum ? `Aisle ${p.str}` : p.str;
};

const parseAdd = raw => {
  let text = raw.trim(), note = "";
  const di = text.indexOf(" - ");
  if (di > -1) { note = text.slice(di + 3).trim(); text = text.slice(0, di).trim(); }
  const m = text.match(/^(\d+)\s*x?\s+(.+)$/i);
  return m ? { qty: +m[1], name: m[2].trim(), note } : { qty: 1, name: text, note };
};

const parseRecipe = raw =>
  raw.split(/\n/)
    .map(l => l.replace(/^\s*[\-•*\d.]+\s*/,"")
      .replace(/\b(\d[\s\d/]*)\s*(cup|tbsp|tsp|oz|lb|g|kg|ml|cloves?|bunch|cans?|pkg|large|medium|small)\b.*?(?=\s+[A-Z]|\s*,|\s*$)/i,"")
      .replace(/\b(fresh|dried|chopped|minced|sliced|diced|of|and)\b/gi,"")
      .replace(/\s+/g," ").trim())
    .filter(l => l.length > 1 && l.length < 55 && /[a-zA-Z]/.test(l));

// ─── Storage ──────────────────────────────────────────────────────────────────
// Supabase — only initialised when .env vars are present, otherwise localStorage is used
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
if (!supabase) console.info('Basket: Supabase not configured — using localStorage. Add .env to enable cross-device sync.');
const SUPABASE_OK = !!supabase;

// Session (which user/room this device is logged into) lives in localStorage — per-device is correct
const Session = {
  get: k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// Room data: Supabase when configured, localStorage fallback for local dev
const Store = {
  async get(key) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('basket_rooms').select('data').eq('id', key).single();
        if (!error) return data?.data ?? null;
        // PGRST116 = row not found — return null, do NOT fall back to stale localStorage
        if (error.code === 'PGRST116') return null;
        // Any other Supabase error (network etc.) — fall through to localStorage below
        console.warn('Supabase get error, falling back to localStorage:', error.message);
      } catch(e) {
        console.warn('Supabase exception, falling back to localStorage:', e);
      }
    }
    try { const v = localStorage.getItem('basket__' + key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  async set(key, val) {
    if (supabase) {
      try {
        if (val === null) await supabase.from('basket_rooms').delete().eq('id', key);
        else await supabase.from('basket_rooms').upsert({ id: key, data: val, updated_at: new Date().toISOString() });
        return;
      } catch(e) { console.warn('Supabase write error, falling back to localStorage:', e); }
    }
    try { val === null ? localStorage.removeItem('basket__' + key) : localStorage.setItem('basket__' + key, JSON.stringify(val)); } catch {}
  },
};

// ─── Item factory ─────────────────────────────────────────────────────────────
let _uid = 1;
const mkItem = (name, qty=1, note="", by="", forceCat=null) => ({
  id: _uid++, name: name.charAt(0).toUpperCase()+name.slice(1).trim(),
  qty, note, by, cat: forceCat || inferCat(name) || "Other", aisleNum: null, done: false,
});

const FREQ = ["Milk","Eggs","Bananas","Coffee","Bread","Olive oil","Chicken breast","Spinach","Avocado","Garlic","Onion","Butter"];
const SEED_TMPLS = { "Sunday meal prep":["Chicken breast","Rice","Spinach","Sweet potato","Olive oil","Garlic","Lemon"] };

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  plus:   (s=15)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  mic:    (s=15)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  check:  (s=10)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  trash:  (s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  book:   (s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  rows:   (s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  save:   (s=13)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  archive:(s=13)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  reload: (s=13)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>,
  share:  (s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  eye:    (s=13)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: (s=13)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  copy:   (s=13)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  chevron:(dir="up",s=11)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points={dir==="up"?"18 15 12 9 6 15":"18 9 12 15 6 9"}/></svg>,
  x:      (s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  lock:   (s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600&family=DM+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
button{cursor:pointer;border:none;background:none;color:inherit;font-family:inherit}
input,textarea{font-family:inherit}
.scr::-webkit-scrollbar{display:none}.scr{scrollbar-width:none}
.qi{transition:border-color .12s}
.qi:focus{outline:none;border-color:#ABA69E!important;box-shadow:0 0 0 3px rgba(0,0,0,.04)}
.tap{transition:opacity .1s}.tap:active{opacity:.55}
.chip{transition:border-color .12s,color .12s,background .12s}
.chip:hover{border-color:#ABA69E!important;color:#1C1A17!important}
.qbtn{transition:background .1s}.qbtn:hover{background:#F0EEE9}
.note-i:focus{outline:none}
.note-i::placeholder{color:#C8C4BC;font-style:italic}
input,textarea,select{font-size:16px!important}  /* prevent iOS zoom on focus */
button,.tap{touch-action:manipulation}            /* remove 300ms tap delay */
@keyframes up{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
.toast{animation:up .18s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.fi{animation:fadeIn .15s ease}
`;

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]   = useState(null);
  const [initialRoom, setInitialRoom] = useState(null);

  // Restore session from localStorage — never blocks render
  useEffect(() => {
    const s = Session.get("basket_session");
    if (!s?.username) return;
    const key = `basket_room_${s.roomCode}`;
    Store.get(key)
      .then(r => {
        if (r) {
          // Migrate to Supabase if not already there (handles rooms created before Supabase was configured)
          if (supabase) {
            supabase.from('basket_rooms')
              .select('id').eq('id', key).single()
              .then(({ data, error }) => {
                if (error || !data) {
                  // Not in Supabase yet — push it now
                  supabase.from('basket_rooms')
                    .upsert({ id: key, data: r, updated_at: new Date().toISOString() })
                    .then(() => console.info('Basket: migrated room to Supabase'));
                }
              });
          }
        }
        setInitialRoom(r);
        setSession(s);
      })
      .catch(() => setSession(s));
  }, []);

  const handleLogin = (s, roomData) => {
    setInitialRoom(roomData);
    setSession(s);
    Session.set("basket_session", s);          // session → localStorage
    Store.set(`basket_room_${s.roomCode}`, roomData).catch(() => {}); // room → Supabase
  };

  const handleLogout = () => {
    setSession(null);
    setInitialRoom(null);
    Session.set("basket_session", null);
  };

  if (!session) return <LoginScreen onLogin={handleLogin} />;
  return <MainApp session={session} initialRoom={initialRoom} onLogout={handleLogout} />;
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [tab, setTab]   = useState("join");
  // Auto-fill from invite link (?join=CODE)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const j = p.get("join");
    if (j) { setTab("join"); setCode(j.toUpperCase()); }
  }, []);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [showP, setShowP] = useState(false);
  const [err, setErr]   = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !code.trim() || !pass.trim()) { setErr("All fields required."); return; }
    setBusy(true); setErr("");
    const key = `basket_room_${code.trim().toUpperCase()}`;
    const session = { username: name.trim(), roomCode: code.trim().toUpperCase() };

    if (tab === "create") {
      // Check if room already exists (best-effort — proceed even if check fails)
      const existing = await Store.get(key).catch(() => null);
      if (existing && existing.password) {
        setErr("That code already exists — try joining it, or choose a different code.");
        setBusy(false); return;
      }
      const newRoom = {
        name: `${name.trim()}'s Basket`, password: pass.trim(),
        members: [name.trim()],
        lists: {
          Weekly: [mkItem("Milk",2,"",name.trim()), mkItem("Eggs",1,"",name.trim()), mkItem("Bread",1,"",name.trim())],
          Costco: [], Target: [],
        },
        history: [], templates: { ...SEED_TMPLS },
      };
      Store.set(key, newRoom).catch(() => {}); // best-effort, never blocks
      onLogin(session, newRoom);              // pass data directly — no storage round-trip
    } else {
      const room = await Store.get(key).catch(() => null);
      if (!room) { setErr("Room not found. Check the code or create a new one."); setBusy(false); return; }
      if (room.password !== pass.trim()) { setErr("Wrong password."); setBusy(false); return; }
      if (!room.members.includes(name.trim())) {
        room.members.push(name.trim());
        Store.set(key, room).catch(() => {});
      }
      onLogin(session, room);                // pass data directly
    }
    setBusy(false);
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ width:"100%", maxWidth:380 }}>
        <img src="/logo.png" alt="Basket" style={{ height:72, display:"block", margin:"0 auto 6px", mixBlendMode:"multiply" }} />
        <p style={{ textAlign:"center", color:C.mid, fontSize:13, marginBottom:32 }}>A shared grocery list for people who cook.</p>

        {/* Tabs */}
        <div style={{ display:"flex", background:C.surfaceUp, borderRadius:10, padding:3, marginBottom:20 }}>
          {[["join","Join a basket"],["create","Create new"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ flex:1, padding:"8px 0", borderRadius:8, fontSize:13, fontWeight:600,
                background:tab===t?C.surface:"transparent",
                color:tab===t?C.text:C.mid,
                boxShadow:tab===t?"0 1px 3px rgba(0,0,0,.08)":"none",
                transition:"background .15s, color .15s" }}
            >{l}</button>
          ))}
        </div>

        <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.border}`, padding:20, display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { label:"Your name", val:name, set:setName, ph:"Adam", type:"text" },
            { label:tab==="create"?"Choose a room code":"Room code", val:code, set:v=>setCode(v.toUpperCase()), ph:tab==="create"?"e.g. ADLEXI":"e.g. ADLEXI", type:"text" },
          ].map(({ label, val, set, ph, type })=>(
            <div key={label}>
              <label style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em", color:C.dim, display:"block", marginBottom:5 }}>{label}</label>
              <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} type={type}
                style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:14 }}
                className="qi" onKeyDown={e=>e.key==="Enter"&&submit()} />
            </div>
          ))}
          <div>
            <label style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em", color:C.dim, display:"block", marginBottom:5 }}>
              {tab==="create"?"Set a password":"Password"}
            </label>
            <div style={{ position:"relative" }}>
              <input value={pass} onChange={e=>setPass(e.target.value)} type={showP?"text":"password"}
                placeholder={tab==="create"?"Share this with your partner":"Enter room password"}
                style={{ width:"100%", padding:"10px 38px 10px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:14 }}
                className="qi" onKeyDown={e=>e.key==="Enter"&&submit()} />
              <button onClick={()=>setShowP(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:C.dim, padding:3 }}
                className="tap">{showP?Ic.eyeOff():Ic.eye()}</button>
            </div>
          </div>
          {err && <p style={{ fontSize:12, color:"#B54030", background:"#FFF5F4", border:"1px solid #FFD0C8", borderRadius:6, padding:"7px 10px" }}>{err}</p>}
          <button onClick={submit} disabled={busy} className="tap"
            style={{ padding:"11px 0", borderRadius:8, background:C.ink, color:"#FFF", fontWeight:600, fontSize:14, marginTop:4, opacity:busy?.6:1 }}>
            {busy?"…":tab==="create"?"Create basket":"Join basket"}
          </button>
        </div>
        {tab==="join" && <p style={{ textAlign:"center", fontSize:12, color:C.dim, marginTop:14, lineHeight:1.6 }}>Ask whoever set up the basket to share<br/>the room code and password with you.</p>}
      </div>
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────
function MainApp({ session, initialRoom, onLogout }) {
  const { username, roomCode } = session;
  const roomKey = `basket_room_${roomCode}`;

  const defaultLists = initialRoom?.lists || {
    Weekly: [mkItem("Milk",2,"",session.username), mkItem("Eggs",1,"",session.username), mkItem("Bread",1,"",session.username)],
    Costco: [], Target: [],
  };
  const [room, setRoom]         = useState(initialRoom || null);
  const [lists, setListsState]  = useState(normalizeLists(initialRoom?.lists) || defaultLists);
  const [templates, setTmplsState] = useState(initialRoom?.templates || SEED_TMPLS);
  const [historyState, setHistState] = useState(initialRoom?.history || []);
  const [members, setMembers]   = useState(initialRoom?.members || [session.username]);
  const [customCats, setCustomCats] = useState(initialRoom?.customCats || {});
  const [pendingItem, setPendingItem] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);
  const [sortMode, setSortMode]   = useState("category");
  const [listOrder, setListOrder] = useState(
    initialRoom?.listOrder || Object.keys(normalizeLists(initialRoom?.lists) || defaultLists)
  );
  const [customFreq, setCustomFreq] = useState(initialRoom?.customFreq || null);
  const [editingLists, setEditingLists] = useState(false);
  const [editingFreq,  setEditingFreq]  = useState(false);
  const [freqInput,    setFreqInput]    = useState("");
  const [activeList, setActive] = useState("Weekly");
  const [input, setInput]       = useState("");
  const [recipeOpen, setROpen]  = useState(false);
  const [recipeText, setRText]  = useState("");
  const [collapsed, setCol]     = useState({});
  const [newListOpen, setNLO]   = useState(false);
  const [newListName, setNLN]   = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast]       = useState(null);
  const inputRef     = useRef(null);
  const toastTimer   = useRef(null);
  const lastToggle   = useRef(0);
  const [renaming, setRenaming] = useState(null); // { name, draft }
  const [confirmDeleteList, setConfirmDeleteList] = useState(null);

  // Initial load + Supabase realtime subscription (replaces polling)
  useEffect(() => {
    // Load latest from Supabase on mount
    Store.get(roomKey).then(r => {
      if (!r) return;
      setRoom(r);
      if (r.lists)     setListsState(normalizeLists(r.lists));
      if (r.templates) setTmplsState(r.templates);
      if (r.history)   setHistState(r.history);
      if (r.members)   setMembers(r.members);
    }).catch(() => {});

    // Subscribe to realtime changes — any device's write triggers this
    if (!supabase) return; // no realtime without Supabase — localStorage-only mode
    const channel = supabase
      .channel(`room-${roomCode}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'basket_rooms',
        filter: `id=eq.${roomKey}`,
      }, payload => {
        const r = payload.new?.data;
        if (!r) return;
        setRoom(r);
        if (r.lists)     setListsState(r.lists);
        if (r.templates) setTmplsState(r.templates);
        if (r.history)   setHistState(r.history);
        if (r.members)    setMembers(r.members);
        if (r.customCats) setCustomCats(r.customCats);
        if (r.listOrder)  setListOrder(r.listOrder);
        if (r.customFreq !== undefined) setCustomFreq(r.customFreq);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomKey, roomCode]);

  // Best-effort persist — write current in-memory state, never blocks UI
  // newCC: pass explicit customCats object when saving a new category assignment
  const persistLists = (newLists, newTmpls, newHist, newCC, newOrder, newFreq) => {
    const updated = {
      ...(room || {}),
      name: room?.name || `${session.username}'s Basket`,
      password: room?.password || "",
      members,
      lists:      newLists ?? lists,
      templates:  newTmpls ?? templates,
      history:    newHist  ?? historyState,
      customCats: newCC    !== undefined ? newCC : customCats,
      listOrder:  newOrder ?? listOrder,
      customFreq: newFreq  !== undefined ? newFreq : customFreq,
    };
    setRoom(updated);
    Store.set(roomKey, updated).catch(() => {});
  };

  const flash = msg => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2100);
  };

  const setItems = async fn => {
    setListsState(prev => {
      const updated = { ...prev, [activeList]: typeof fn==="function" ? fn(prev[activeList]||[]) : fn };
      persistLists(updated, null, null);
      return updated;
    });
  };

  const allItems = lists[activeList] || [];
  const pending  = allItems.filter(i => !i.done);
  const done     = allItems.filter(i => i.done);

  // addItem: forceCat skips the picker (used by recipe import, category picker callback)
  const addItem = (name, qty=1, note="", by=username, forceCat=null) => {
    if (!name.trim()) return;
    const em = getEmoji(name);
    const n  = name.toLowerCase().trim();

    // Category resolution: forced → room memory → hardcoded map → show picker
    const cat = forceCat || customCats[n] || inferCat(name);
    if (!cat) {
      setPendingItem({ name, qty, note, by });
      setInput(""); // clear the add bar so user sees the picker clearly
      return;
    }

    setItems(prev => {
      const prev2 = prev || [];
      const idx = prev2.findIndex(i => i.name.toLowerCase()===n && !i.done);
      if (idx > -1) {
        const next = [...prev2]; next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        flash(`${next[idx].name} — now ×${next[idx].qty}${em?" "+em:""}`);
        return next;
      }
      return [...prev2, mkItem(name, qty, note, by, cat)];
    });
  };

  const handleAdd = e => {
    e.preventDefault();
    if (!input.trim()) return;
    const { qty, name, note } = parseAdd(input);
    addItem(name, qty, note);
    setInput(""); inputRef.current?.focus();
  };

  const toggleDone = id => setItems(p => (p||[]).map(i => i.id===id?{...i,done:!i.done}:i));
  const removeItem = id => setItems(p => (p||[]).filter(i => i.id!==id));
  const updateQty  = (id, qty) => setItems(p => (p||[]).map(i => i.id===id?{...i,qty:Math.max(1,qty)}:i));
  const updateNote = (id, note) => setItems(p => (p||[]).map(i => i.id===id?{...i,note}:i));

  const fromRecipe = () => {
    const lines = parseRecipe(recipeText);
    lines.forEach(l => { const { qty, name } = parseAdd(l); if(name.length>1) addItem(name, qty); });
    flash(`Added ${lines.length} ingredient${lines.length!==1?"s":""} 🍽️`);
    setRText(""); setROpen(false);
  };

  const loadTemplate = name => { templates[name].forEach(n=>addItem(n)); flash(`Loaded "${name}" 📋`); };

  const saveTemplate = () => {
    if (!pending.length) return;
    const name = `${activeList} — saved`;
    const newT = { ...templates, [name]: pending.map(i=>i.name) };
    setTmplsState(newT);
    persistLists(null, newT, null);
    flash(`Saved as "${name}"`);
  };

  const archiveTrip = () => {
    if (!done.length) return;
    const newH = [{ list:activeList, items:done, date:new Date().toLocaleDateString() }, ...historyState];
    setHistState(newH);
    persistLists(null, null, newH);
    setItems(p => (p||[]).filter(i=>!i.done));
    flash("Trip archived 🗂️");
  };

  const reloadTrip = entry => { entry.items.forEach(i=>addItem(i.name,i.qty)); flash(`Reloaded ${entry.items.length} items`); };

  // Called when user picks a category for an unknown item
  const deleteList = (name) => {
    if (listOrder.length <= 1) { flash("Can't delete your only list"); return; }
    const newLists = { ...lists };
    delete newLists[name];
    const newO = listOrder.filter(n => n !== name);
    setListsState(newLists); setListOrder(newO);
    if (activeList === name) setActive(newO[0]);
    persistLists(newLists, null, null, null, newO);
    flash(`Deleted "${name}"`);
    setEditingLists(false);
  };

  const moveList = (name, dir) => {
    const idx = listOrder.indexOf(name);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= listOrder.length) return;
    const newO = [...listOrder];
    newO.splice(idx, 1);
    newO.splice(newIdx, 0, name);
    setListOrder(newO);
    persistLists(null, null, null, null, newO);
  };

  const saveCustomFreq = (newFreq) => {
    setCustomFreq(newFreq);
    persistLists(null, null, null, null, null, newFreq);
  };

  const deleteTemplate = (name) => {
    const newT = { ...templates };
    delete newT[name];
    setTmplsState(newT);
    persistLists(null, newT, null);
    flash(`Template removed`);
  };

  const updateAisleNum = (id, raw) => {
    const val = raw.trim() === "" ? null : raw.trim();
    setItems(p => (p||[]).map(i => i.id===id ? {...i, aisleNum: val} : i));
  };

  const updateItemCat = (id, newCat) => {
    const item = (lists[activeList]||[]).find(i => i.id===id);
    if (!item) return;
    const n = item.name.toLowerCase().trim();
    setItems(p => (p||[]).map(i => i.id===id ? {...i, cat:newCat} : i));
    const newCC = { ...customCats, [n]: newCat };
    setCustomCats(newCC);
    persistLists(null, null, null, newCC);
    setEditingCatId(null);
    flash(`${AISLES[newCat]?.emoji||""} ${item.name} moved to ${newCat}`);
  };

  const handlePickCategory = (cat, skip=false) => {
    if (!pendingItem) return;
    const { name, qty, note, by } = pendingItem;
    const n = name.toLowerCase().trim();
    const em = getEmoji(name);
    const finalCat = skip ? "Other" : cat;

    // Save to room memory (unless skipped)
    const newCC = skip ? customCats : { ...customCats, [n]: finalCat };
    if (!skip) setCustomCats(newCC);

    // Add item directly, bypassing addItem's picker check
    const currentList = lists[activeList] || [];
    const existingIdx = currentList.findIndex(i => i.name.toLowerCase()===n && !i.done);
    let nextList;
    if (existingIdx > -1) {
      nextList = currentList.map((it, idx) =>
        idx===existingIdx ? {...it, qty: it.qty+qty} : it
      );
      flash(`${name} — now ×${nextList[existingIdx].qty}${em?" "+em:""}`);
    } else {
      nextList = [...currentList, mkItem(name, qty, note, by, finalCat)];
      if (!skip) flash(`${em||AISLES[finalCat]?.emoji||""} ${name} saved to ${finalCat}`);
    }

    const nextLists = { ...lists, [activeList]: nextList };
    setListsState(nextLists);
    persistLists(nextLists, null, null, newCC); // persist lists + category memory together
    setPendingItem(null);
  };

  const renameList = (oldName, newName) => {
    const n = newName.trim();
    if (!n || n === oldName) { setRenaming(null); return; }
    if (lists[n]) { flash('A list with that name already exists'); setRenaming(null); return; }
    const nextLists = {};
    Object.keys(lists).forEach(k => { nextLists[k === oldName ? n : k] = lists[k]; });
    const nextOrder = listOrder.map(k => k === oldName ? n : k);
    setListsState(nextLists); setListOrder(nextOrder);
    if (activeList === oldName) setActive(n);
    persistLists(nextLists, null, null, null, nextOrder);
    setRenaming(null);
    flash(`Renamed to "${n}"`);
  };

  const createList = () => {
    const n = newListName.trim();
    if (!n || lists[n]) return;
    const newL = { ...lists, [n]: [] };
    const newO = [...listOrder, n];
    setListsState(newL); setListOrder(newO);
    persistLists(newL, null, null, null, newO);
    setActive(n); setNLN(""); setNLO(false);
  };

  const groupedItems = useMemo(() => {
    if (sortMode === 'flat') return { All: pending };
    if (sortMode === 'shopping') {
      // Smart sort: numeric aisles ascending → text sections A–Z → unset at bottom
      const sorted = [...pending].sort((a, b) => {
        const pa = parseAisle(a.aisleNum), pb = parseAisle(b.aisleNum);
        if (!pa && !pb) return 0;
        if (!pa) return 1;
        if (!pb) return -1;
        if (pa.isNum && pb.isNum) return pa.num - pb.num;   // 1, 2, 3 …
        if (!pa.isNum && !pb.isNum) return pa.str.localeCompare(pb.str); // Deli, Frozen …
        return pa.isNum ? -1 : 1;  // numbers before text labels
      });
      return { All: sorted };
    }
    // 'category' mode — group by aisle
    const g = {};
    AISLE_ORDER.forEach(a => (g[a]=[]));
    pending.forEach(it => {
      const cat = resolveCat(it.cat);
      (g[cat]||(g[cat]=[])).push(it);
    });
    Object.keys(g).forEach(k => { if (!g[k].length) delete g[k]; });
    return g;
  }, [pending, sortMode]);



  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:C.bg, minHeight:"100vh", color:C.text }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Header ── */}
      <div style={{ borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:20, background:C.bg }}>
        <div style={{ maxWidth:620, margin:"0 auto", padding:"16px 18px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <img src="/logo.png" alt="Basket" style={{ height:44, mixBlendMode:"multiply" }} />
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Sync status */}
              {!SUPABASE_OK && (
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 8px",
                  borderRadius:100, background:"#FEF3C7", border:"1px solid #FCD34D" }}>
                  <span style={{ fontSize:11 }}>⚠️</span>
                  <span style={{ fontSize:11, fontWeight:600, color:"#92400E" }}>Not syncing</span>
                </div>
              )}
              {/* Members */}
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: SUPABASE_OK ? "#2E8B57" : "#D97706" }} />
                <span style={{ fontSize:12, color:C.mid }}>{username}</span>
                {members.filter(m=>m!==username).map(m=>(
                  <span key={m} style={{ fontSize:12, color:C.dim }}>· {m}</span>
                ))}
              </div>
              {/* Share button */}
              <button onClick={()=>setShareOpen(v=>!v)} className="tap chip"
                style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:100, background:C.surface, border:`1px solid ${C.border}`, color:C.mid, fontSize:11, fontWeight:500 }}>
                {Ic.share()} Invite
              </button>
              {/* Logout */}
              <button onClick={onLogout} className="tap" style={{ color:C.dim, fontSize:11, padding:"5px 0" }}>Sign out</button>
            </div>
          </div>

          {/* Share panel */}
          {shareOpen && (
            <div className="fi" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", color:C.dim }}>Invite someone to this basket</p>
                <button onClick={()=>setShareOpen(false)} className="tap" style={{ color:C.dim }}>{Ic.x()}</button>
              </div>
              {[
                { label:"Room code", val:roomCode, mono:true },
                { label:"Password", val:showPass?room.password:"•".repeat(room.password.length), mono:true,
                  action: <button onClick={()=>setShowPass(v=>!v)} className="tap" style={{ color:C.dim }}>{showPass?Ic.eyeOff():Ic.eye()}</button> },
              ].map(({ label, val, mono, action })=>(
                <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.bg, borderRadius:8, padding:"9px 12px", marginBottom:8 }}>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:C.dim, marginBottom:3 }}>{label}</p>
                    <p style={{ fontFamily:mono?"'DM Mono',monospace":"inherit", fontSize:15, fontWeight:600, color:C.text, letterSpacing:mono?".1em":"normal" }}>{val}</p>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {action}
                    <button onClick={()=>{ navigator.clipboard?.writeText(val.replace(/•/g,"")||""); flash("Copied!"); }} className="tap" style={{ color:C.dim }}>{Ic.copy()}</button>
                  </div>
                </div>
              ))}
              {/* Invite link — one tap to share */}
              <button
                onClick={()=>{
                  const url = `${window.location.origin}/?join=${roomCode}`;
                  if (navigator.share) {
                    navigator.share({ title:"Join my Basket", text:`Join room ${roomCode} on Basket`, url });
                  } else {
                    navigator.clipboard?.writeText(url);
                    flash("Invite link copied!");
                  }
                }}
                className="tap"
                style={{ width:"100%", marginTop:4, padding:"10px 14px", borderRadius:10,
                  background:C.ink, color:"#FFF", fontWeight:600, fontSize:13,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {Ic.share(14)} Send invite link
              </button>
              <p style={{ fontSize:11, color:C.dim, lineHeight:1.6, marginTop:10 }}>
                The invite link auto-fills the room code. They still need the password.
              </p>
            </div>
          )}

          {/* List tabs */}
          <div className="scr" style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:14, alignItems:"center" }}>
            {listOrder.filter(n=>lists[n]!==undefined).map((name, idx) => {
              const count = (lists[name]||[]).filter(i=>!i.done).length;
              const isAct = name===activeList;

              if (renaming?.name === name) return (
                <div key={name} style={{ flexShrink:0 }}>
                  <form onSubmit={e=>{e.preventDefault();renameList(name,renaming.draft);}}
                    style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <input autoFocus value={renaming.draft}
                      onChange={e=>setRenaming(r=>({...r,draft:e.target.value}))}
                      onBlur={e=>{ if (!e.relatedTarget?.dataset?.keep) renameList(name,renaming.draft); }}
                      onKeyDown={e=>e.key==='Escape'&&setRenaming(null)}
                      style={{ width:Math.max(80,renaming.draft.length*9), padding:"6px 12px", borderRadius:100,
                        fontSize:13, background:C.surface, border:`1px solid ${C.borderUp}`,
                        color:C.text, fontFamily:"inherit", fontWeight:600 }}
                      className="qi" />
                    <button type="button" data-keep="true"
                      onClick={()=>setConfirmDeleteList(name)} className="tap"
                      style={{ padding:"5px 8px", color:"#EF4444", borderRadius:100,
                        background:C.surface, border:`1px solid ${C.border}` }}>
                      {Ic.trash(12)}
                    </button>
                  </form>
                  {confirmDeleteList === name && (
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px",
                      borderRadius:100, background:"#FEE2E2", border:"1px solid #FCA5A5", marginTop:4 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:"#991B1B" }}>Delete?</span>
                      <button onClick={()=>{deleteList(name);setConfirmDeleteList(null);setRenaming(null);}}
                        className="tap" style={{ fontSize:11, fontWeight:700, color:"#991B1B" }}>Yes</button>
                      <button onClick={()=>setConfirmDeleteList(null)}
                        className="tap" style={{ fontSize:11, color:"#6B7280" }}>No</button>
                    </div>
                  )}
                </div>
              );

              if (editingLists) return (
                <div key={name} style={{ flexShrink:0, display:"flex", alignItems:"center" }}>
                  <button onClick={()=>moveList(name,-1)} className="tap"
                    style={{ opacity:idx===0?0.25:1, width:28, height:32, fontSize:16, color:C.mid,
                      background:C.surface, border:`1px solid ${C.border}`, borderRight:"none",
                      borderRadius:"100px 0 0 100px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    ‹
                  </button>
                  <div style={{ padding:"6px 10px", background:isAct?C.ink:C.surface,
                    color:isAct?"#FFF":C.mid, fontWeight:600, fontSize:13,
                    border:`1px solid ${isAct?C.ink:C.border}`, borderLeft:"none", borderRight:"none",
                    display:"flex", alignItems:"center", gap:6 }}>
                    {name}
                    {count>0&&<span style={{ fontSize:10, fontWeight:700, borderRadius:100, padding:"1px 5px",
                      background:isAct?"rgba(255,255,255,.18)":C.surfaceUp, color:isAct?"#FFF":C.dim }}>{count}</span>}
                    <button onClick={()=>deleteList(name)} className="tap"
                      style={{ color:"#EF4444", fontSize:16, lineHeight:1, marginLeft:1 }}>×</button>
                  </div>
                  <button onClick={()=>moveList(name,1)} className="tap"
                    style={{ opacity:idx===listOrder.length-1?0.25:1, width:28, height:32, fontSize:16, color:C.mid,
                      background:C.surface, border:`1px solid ${C.border}`, borderLeft:"none",
                      borderRadius:"0 100px 100px 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    ›
                  </button>
                </div>
              );

              return (
                <button key={name} onClick={()=>setActive(name)} onDoubleClick={()=>setRenaming({name,draft:name})}
                  className="tap" title="Double-click to rename"
                  style={{ flexShrink:0, padding:"6px 14px", borderRadius:100, fontWeight:600, fontSize:13,
                    background:isAct?C.ink:C.surface, color:isAct?"#FFF":C.mid,
                    border:`1px solid ${isAct?C.ink:C.border}`, display:"flex", alignItems:"center", gap:6 }}>
                  {name}
                  {count>0&&<span style={{ fontSize:10, fontWeight:700, borderRadius:100, padding:"1px 5px",
                    background:isAct?"rgba(255,255,255,.18)":C.surfaceUp, color:isAct?"#FFF":C.dim }}>{count}</span>}
                </button>
              );
            })}

            {editingLists ? (
              <button onClick={()=>setEditingLists(false)} className="tap"
                style={{ flexShrink:0, padding:"6px 14px", borderRadius:100, fontWeight:600, fontSize:13,
                  background:C.ink, color:"#FFF", border:`1px solid ${C.ink}` }}>Done</button>
            ) : newListOpen ? (
              <form onSubmit={e=>{e.preventDefault();createList();}} style={{ flexShrink:0 }}>
                <input autoFocus value={newListName} onChange={e=>setNLN(e.target.value)}
                  onBlur={()=>!newListName&&setNLO(false)} onKeyDown={e=>e.key==="Escape"&&setNLO(false)}
                  placeholder="Name…"
                  style={{ width:100, padding:"6px 12px", borderRadius:100, fontSize:13,
                    background:C.surface, border:`1px solid ${C.borderUp}`, color:C.text }}
                  className="qi" />
              </form>
            ) : (
              <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                <button onClick={()=>setNLO(true)}
                  style={{ width:32, height:32, borderRadius:"50%", background:C.surface,
                    border:`1px solid ${C.border}`, color:C.mid,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ic.plus(14)}
                </button>
                <button onClick={()=>setEditingLists(true)} title="Manage lists"
                  style={{ width:32, height:32, borderRadius:"50%", background:C.surface,
                    border:`1px solid ${C.border}`, color:C.mid,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
                  ⠿
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:620, margin:"0 auto", padding:"20px 18px 110px" }}>

        {/* Quick add */}
        <form onSubmit={handleAdd} style={{ display:"flex", gap:8, marginBottom:12 }}>
          <div style={{ flex:1, position:"relative" }}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              placeholder='Add an item — try "2 garlic - fresh"'
              style={{ width:"100%", padding:"13px 44px 13px 14px", borderRadius:10, fontSize:14, background:C.surface, color:C.text, border:`1px solid ${C.border}` }}
              className="qi" />
            <button type="button" onClick={()=>flash("Voice add coming soon 🎤")}
              style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:C.dim, padding:5 }}>{Ic.mic()}</button>
          </div>
          <button type="submit" className="tap"
            style={{ flexShrink:0, padding:"0 18px", borderRadius:10, background:C.ink, color:"#FFF", fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:6, border:`1px solid ${C.ink}` }}>
            {Ic.plus()} Add</button>
        </form>

        {/* Tool row */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:22 }}>
          {[
            { icon:Ic.book(), label:"Paste recipe", act:recipeOpen, fn:()=>setROpen(v=>!v) },
            { icon:Ic.rows(), label:{category:"By category",shopping:"Shopping order",flat:"Flat list"}[sortMode],
              fn:()=>setSortMode(m=>({category:"shopping",shopping:"flat",flat:"category"}[m])) },
          ].map(({ icon, label, act, fn })=>(
            <button key={label} onClick={fn} className="tap chip"
              style={{ padding:"6px 12px", borderRadius:100, fontSize:12, fontWeight:500,
                background:act?C.text:C.surface, border:`1px solid ${act?C.text:C.border}`,
                color:act?"#FFF":C.mid, display:"flex", alignItems:"center", gap:6 }}>
              {icon}{label}</button>
          ))}
        </div>

        {/* Recipe panel */}
        {recipeOpen && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:22 }}>
            <p style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".04em", color:C.dim, marginBottom:10 }}>Paste ingredient lines</p>
            <textarea value={recipeText} onChange={e=>setRText(e.target.value)} rows={5}
              placeholder={"2 cups flour\n3 garlic cloves, minced\n1 lb chicken breast\n…"}
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, fontSize:13, lineHeight:1.65, resize:"vertical", background:C.bg, border:`1px solid ${C.border}`, color:C.text }}
              className="qi" />
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:10 }}>
              <button onClick={()=>{setROpen(false);setRText("");}} className="tap" style={{ fontSize:13, color:C.dim, padding:"6px 10px" }}>Cancel</button>
              <button onClick={fromRecipe} className="tap"
                style={{ padding:"7px 14px", borderRadius:100, background:C.ink, color:"#FFF", fontWeight:600, fontSize:13, border:`1px solid ${C.ink}` }}>
                Extract & add</button>
            </div>
          </div>
        )}

        {/* Quick add shelf — customisable */}
        {(() => {
          const freq = (customFreq && customFreq.length > 0) ? customFreq : FREQ;
          return (
            <div style={{ marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", color:C.dim }}>Quick add</p>
                <button onClick={()=>setEditingFreq(v=>!v)} className="tap"
                  style={{ fontSize:11, color:editingFreq?C.text:C.dim, fontWeight:editingFreq?600:400, padding:"2px 6px" }}>
                  {editingFreq ? "Done" : "Edit"}
                </button>
              </div>
              {editingFreq ? (
                <div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                    {freq.map(f => (
                      <div key={f} style={{ display:"flex", alignItems:"center" }}>
                        <span style={{ padding:"6px 10px", borderRadius:"100px 0 0 100px", fontSize:12,
                          fontWeight:500, background:C.surface, border:`1px solid ${C.border}`,
                          borderRight:"none", color:C.mid, display:"flex", alignItems:"center", gap:4 }}>
                          {getEmoji(f)&&<span style={{ fontSize:13 }}>{getEmoji(f)}</span>}
                          {f}
                        </span>
                        <button onClick={()=>saveCustomFreq(freq.filter(x=>x!==f))} className="tap"
                          style={{ padding:"6px 8px", borderRadius:"0 100px 100px 0", fontSize:14,
                            background:C.surface, border:`1px solid ${C.border}`, borderLeft:"none",
                            color:"#EF4444", display:"flex", alignItems:"center" }}>×</button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e=>{
                    e.preventDefault();
                    const v=freqInput.trim();
                    if(v&&!freq.includes(v)){saveCustomFreq([...freq,v]);setFreqInput("");}
                  }} style={{ display:"flex", gap:6 }}>
                    <input value={freqInput} onChange={e=>setFreqInput(e.target.value)}
                      placeholder="Add an item…"
                      style={{ flex:1, padding:"7px 12px", borderRadius:100, fontSize:13,
                        background:C.surface, border:`1px solid ${C.border}`, color:C.text }}
                      className="qi" />
                    <button type="submit" className="tap"
                      style={{ padding:"7px 14px", borderRadius:100, background:C.ink,
                        color:"#FFF", fontWeight:600, fontSize:13 }}>+ Add</button>
                  </form>
                </div>
              ) : (
                <div className="scr" style={{ display:"flex", gap:6, overflowX:"auto" }}>
                  {freq.map(f => {
                    const em = getEmoji(f);
                    return (
                      <button key={f} onClick={()=>{addItem(f);flash(`+ ${f}${em?" "+em:""}`);}}
                        className="tap chip"
                        style={{ flexShrink:0, padding:"6px 12px", borderRadius:100, fontSize:12,
                          fontWeight:500, background:C.surface, border:`1px solid ${C.border}`,
                          color:C.mid, display:"flex", alignItems:"center", gap:5 }}>
                        {em&&<span style={{ fontSize:13 }}>{em}</span>}
                        {f}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Templates */}
        {Object.keys(templates).length>0&&(
          <Shelf label="Templates">
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {Object.keys(templates).map(name=>(
                <div key={name} style={{ display:"flex", alignItems:"center", gap:2 }}>
                  <button onClick={()=>loadTemplate(name)} className="tap chip"
                    style={{ padding:"6px 12px", borderRadius:"100px 0 0 100px", fontSize:12, fontWeight:500,
                      background:C.surface, border:`1px solid ${C.border}`, borderRight:"none", color:C.mid,
                      display:"flex", alignItems:"center", gap:6 }}>
                    {Ic.reload()} {name}
                  </button>
                  <button onClick={()=>deleteTemplate(name)} className="tap"
                    style={{ padding:"6px 8px", borderRadius:"0 100px 100px 0", fontSize:11,
                      background:C.surface, border:`1px solid ${C.border}`, borderLeft:"none",
                      color:C.dim, display:"flex", alignItems:"center" }}
                    title="Delete template">
                    {Ic.x(10)}
                  </button>
                </div>
              ))}
            </div>
          </Shelf>
        )}

        {/* Shopping mode banner */}
        {sortMode==="shopping"&&pending.length>0&&(
          <div style={{ background:"#7A604015", border:"1px solid #7A604030", borderRadius:8,
            padding:"8px 12px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:15 }}>🛒</span>
            <span style={{ fontSize:12, color:"#7A6040", fontWeight:500 }}>
              Sorted by aisle number — set each item's aisle in the row below its name.
            </span>
          </div>
        )}

        {/* Empty */}
        {pending.length===0&&!done.length&&(
          <div style={{ textAlign:"center", padding:"52px 0 44px" }}>
            <div style={{ fontSize:44, marginBottom:14, opacity:.3 }}>🧺</div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:C.dim, marginBottom:6 }}>Empty basket</p>
            <p style={{ fontSize:13, color:C.dim, lineHeight:1.7 }}>Add an item above or tap a quick-add chip to start.</p>
          </div>
        )}

        {/* Grouped items */}
        {Object.entries(groupedItems).map(([aisle, list]) => {
          const meta  = AISLES[aisle]||AISLES["Other"];
          const isCol = collapsed[aisle];
          return (
            <div key={aisle} style={{ marginBottom:28 }}>
              {sortMode !== "flat" && aisle!=="All" && (
                <button onClick={()=>setCol(c=>({...c,[aisle]:!c[aisle]}))} className="tap"
                  style={{
                    position:"relative", overflow:"hidden",
                    display:"flex", alignItems:"center", gap:8,
                    width:"100%", marginBottom:8,
                    background:hexBg(meta.color, 0.07),
                    borderLeft:`3px solid ${meta.color}`,
                    borderRadius:"0 8px 8px 0",
                    padding:"8px 12px 8px 10px",
                  }}>
                  {/* Watermark */}
                  <span aria-hidden="true" style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:32, lineHeight:1, opacity:.13, userSelect:"none", pointerEvents:"none" }}>{meta.emoji}</span>
                  <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", color:meta.color }}>{aisle}</span>
                  <span style={{ fontSize:11, color:meta.color, opacity:.6 }}>· {list.length}</span>
                  <span style={{ marginLeft:"auto", color:meta.color, opacity:.6 }}>{Ic.chevron(isCol?"down":"up", 11)}</span>
                </button>
              )}
              {!isCol&&(
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {list.map(it=>(
                    <Card key={it.id} item={it}
                      barColor={resolveCat(it.cat) !== "Other" ? (AISLES[resolveCat(it.cat)]?.color || AISLES["Other"].color) : AISLES["Other"].color}
                      aisleEmoji={AISLES[resolveCat(it.cat)]?.emoji || AISLES["Other"].emoji}
                      shoppingMode={sortMode==="shopping"}
                      onToggle={()=>toggleDone(it.id)}
                      onRemove={()=>removeItem(it.id)}
                      onQty={qty=>updateQty(it.id,qty)}
                      onNote={note=>updateNote(it.id,note)}
                      onAisleNum={num=>updateAisleNum(it.id,num)}
                      onEditCat={()=>setEditingCatId(it.id)}
                      onRename={newName=>{
                        setItems(p=>(p||[]).map(i=>i.id===it.id?{...i,name:newName.charAt(0).toUpperCase()+newName.slice(1)}:i));
                        flash(`Renamed to "${newName}"`);
                      }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Done */}
        {done.length>0&&(
          <div style={{ marginTop:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:C.dim }}>
                In cart {done.length>2?"🛒":"·"} {done.length}
              </span>
              <button onClick={archiveTrip} className="tap chip"
                style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:100, background:C.surface, border:`1px solid ${C.border}`, color:C.dim, fontSize:11, fontWeight:500 }}>
                {Ic.archive()} Archive trip</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {done.map(it=>(
                <Card key={it.id} item={it} barColor={AISLES[it.cat]?.color||AISLES["Other"].color}
                  aisleEmoji={AISLES[it.cat]?.emoji||"📦"}
                  onToggle={()=>toggleDone(it.id)} onRemove={()=>removeItem(it.id)} isDone />
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {historyState.length>0&&(
          <div style={{ marginTop:40, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
            <Shelf label="Past trips 📦">
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {historyState.map((h,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px" }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600 }}>{h.list}</p>
                      <p style={{ fontSize:11, color:C.dim, marginTop:2 }}>{h.date} · {h.items.length} items</p>
                    </div>
                    <button onClick={()=>reloadTrip(h)} className="tap chip"
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:100, background:C.surfaceUp, border:`1px solid ${C.border}`, color:C.mid, fontSize:12, fontWeight:500 }}>
                      {Ic.reload()} Reload</button>
                  </div>
                ))}
              </div>
            </Shelf>
          </div>
        )}
      </div>

      {/* Category Picker — bottom sheet for unknown items */}
      {(pendingItem || editingCatId) && (() => {
        const isEdit = !!editingCatId;
        const targetItem = isEdit ? (lists[activeList]||[]).find(i=>i.id===editingCatId) : null;
        const label = isEdit ? targetItem?.name : pendingItem?.name;
        const onPick = isEdit
          ? cat => updateItemCat(editingCatId, cat)
          : cat => handlePickCategory(cat);
        const onDismiss = isEdit
          ? () => setEditingCatId(null)
          : () => handlePickCategory(null, true);
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(28,26,23,0.45)", zIndex:60,
            display:"flex", alignItems:"flex-end", justifyContent:"center" }}
            onClick={e=>e.target===e.currentTarget&&onDismiss()}>
            <div style={{ background:C.surface, borderRadius:"16px 16px 0 0", padding:24,
              width:"100%", maxWidth:620, boxShadow:"0 -4px 24px rgba(0,0,0,.12)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:600, color:C.text }}>
                    {isEdit ? "Move " : "What aisle is "}
                    <span style={{ fontStyle:"italic" }}>{label}</span>
                    {isEdit ? " to which aisle?" : " in?"}
                  </p>
                  <p style={{ fontSize:12, color:C.dim, marginTop:3 }}>
                    {isEdit ? "Updates category memory for this basket." : "Your choice is remembered for this basket. ✓"}
                  </p>
                </div>
                <button onClick={onDismiss} className="tap"
                  style={{ color:C.dim, flexShrink:0, marginLeft:12 }}>{Ic.x(16)}</button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16 }}>
                {Object.entries(AISLES).filter(([a])=>a!=="Other").map(([aisle,{emoji,color}])=>(
                  <button key={aisle} onClick={()=>onPick(aisle)} className="tap"
                    style={{ padding:"8px 14px", borderRadius:100, fontSize:13, fontWeight:500,
                      background:`${color}15`, border:`1.5px solid ${color}50`, color,
                      display:"flex", alignItems:"center", gap:6 }}>
                    {emoji} {aisle}
                  </button>
                ))}
              </div>
              {!isEdit && (
                <button onClick={onDismiss} className="tap"
                  style={{ marginTop:16, fontSize:12, color:C.dim, width:"100%", textAlign:"center", padding:"8px 0" }}>
                  Skip — add as "Other"
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Toast */}
      {toast&&(
        <div className="toast" style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:C.ink, color:"#FFF", fontSize:12, fontWeight:600, padding:"9px 16px", borderRadius:100, boxShadow:"0 4px 20px rgba(0,0,0,.18)", whiteSpace:"nowrap", zIndex:99 }}>
          {toast}</div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
// Row 2 indent: bar(2) + gap(10) + emoji(44) + gap(10) = 66px
const ROW2 = 66;

function Card({ item, barColor, aisleEmoji, onToggle, onRemove, onQty, onNote, onAisleNum, onEditCat, onRename, isDone, shoppingMode }) {
  const em = getEmoji(item.name) || aisleEmoji;
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(item.name);
  const saveName = () => {
    const n = nameDraft.trim();
    if (n && n !== item.name && onRename) onRename(n);
    setEditingName(false);
  };
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 12px 0 0" }}>
        <div style={{ width:2, alignSelf:"stretch", minHeight:20, borderRadius:"0 1px 1px 0", flexShrink:0, background:isDone?C.border:barColor }} />
        <button onClick={onToggle} className="tap"
          style={{ flexShrink:0, width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, lineHeight:1, opacity:isDone?.25:1, transition:"opacity .15s", userSelect:"none",
            margin:"-7px 0" }}>
          {em}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            {editingName ? (
              <input autoFocus value={nameDraft}
                onChange={e=>setNameDraft(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') saveName(); if(e.key==='Escape'){setEditingName(false);setNameDraft(item.name);} }}
                onBlur={saveName}
                style={{ fontSize:14, fontWeight:500, border:"none", background:"transparent",
                  padding:0, color:C.text, fontFamily:"inherit", minWidth:60, flex:1 }}
                className="note-i" />
            ) : (
              <span
                onDoubleClick={()=>{ if(!isDone){ setEditingName(true); setNameDraft(item.name); } }}
                title={isDone ? "" : "Double-click to rename"}
                style={{ fontSize:14, fontWeight:500, lineHeight:1.35,
                  color:isDone?C.dim:C.text, textDecoration:isDone?"line-through":"none",
                  cursor:isDone?"default":"text" }}>
                {item.name}
              </span>
            )}
            {/* Aisle badge — prominent in shopping mode */}
            {shoppingMode && item.aisleNum != null && (
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700,
                color:barColor, background:`${barColor}15`, border:`1px solid ${barColor}40`,
                borderRadius:4, padding:"1px 6px" }}>
                {aisleLabel(item.aisleNum)}
              </span>
            )}
            {shoppingMode && item.aisleNum == null && !isDone && (
              <span style={{ fontSize:10, color:C.dim, fontStyle:"italic" }}>set aisle ↓</span>
            )}
            {item.by && item.by !== "" && (
              <span style={{ fontSize:11, color:C.dim }}>· {item.by}</span>
            )}
          </div>
        </div>
        {/* Category badge — tap to reassign */}
        {!isDone && onEditCat && (
          <button onClick={onEditCat} className="tap"
            title="Change category"
            style={{ flexShrink:0, padding:"2px 5px", borderRadius:6, fontSize:14, lineHeight:1,
              opacity:0.45, transition:"opacity .12s" }}
            onMouseEnter={e=>e.currentTarget.style.opacity=0.9}
            onMouseLeave={e=>e.currentTarget.style.opacity=0.45}>
            {aisleEmoji}
          </button>
        )}
        {/* Undo button — only on done items */}
        {isDone && (
          <button onClick={onToggle} className="tap"
            style={{ flexShrink:0, padding:"3px 8px", borderRadius:100, fontSize:11, fontWeight:600,
              color:C.mid, background:C.surfaceUp, border:`1px solid ${C.border}` }}>
            ↩
          </button>
        )}
        <button onClick={onRemove} className="tap" style={{ padding:"0 2px", color:C.dim, flexShrink:0 }}>{Ic.trash()}</button>
      </div>

      {/* Row 2 — qty · aisle # · note */}
      {!isDone&&(
        <div style={{ display:"flex", alignItems:"center", paddingLeft:ROW2, paddingRight:12, paddingBottom:10, paddingTop:6, gap:0 }}>
          <div style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
            <button onClick={()=>item.qty>1&&onQty(item.qty-1)} className="qbtn tap"
              style={{ width:22, height:22, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, lineHeight:1, color:item.qty>1?C.mid:C.border }}>−</button>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:C.mid, minWidth:20, textAlign:"center" }}>{item.qty}</span>
            <button onClick={()=>onQty(item.qty+1)} className="qbtn tap"
              style={{ width:22, height:22, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, lineHeight:1, color:C.mid }}>+</button>
          </div>
          <div style={{ width:1, height:13, background:C.border, flexShrink:0, margin:"0 8px" }} />
          {/* Aisle number input */}
          <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
            <span style={{ fontSize:11, color:C.dim }}>Aisle</span>
            <input type="text"
              value={item.aisleNum ?? ""} onChange={e=>onAisleNum(e.target.value)}
              placeholder="# or section"
              style={{ width:72, border:"none", background:"transparent", padding:0,
                fontSize:12, color:C.mid, fontFamily:"'DM Mono',monospace" }}
              className="note-i" />
          </div>
          <div style={{ width:1, height:13, background:C.border, flexShrink:0, margin:"0 8px" }} />
          <input className="note-i" value={item.note} onChange={e=>onNote(e.target.value)}
            placeholder="Add a note…"
            style={{ flex:1, border:"none", background:"transparent", padding:0, fontSize:12,
              color:item.note?C.mid:undefined, fontStyle:item.note?"normal":"italic" }} />
        </div>
      )}
    </div>
  );
}

// ─── Shelf ────────────────────────────────────────────────────────────────────
function Shelf({ label, children }) {
  return (
    <div style={{ marginBottom:22 }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", color:C.dim, marginBottom:9 }}>{label}</p>
      {children}
    </div>
  );
}
