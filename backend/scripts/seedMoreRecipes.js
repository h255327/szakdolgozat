/**
 * Seed script – inserts 30 additional recipes covering the expanded
 * category set: dessert, soup, salad, vegetarian, high-protein, quick meals,
 * plus more breakfast / lunch / dinner / snack / mediterranean / keto.
 *
 * Run from the backend/ directory:
 *   node scripts/seedMoreRecipes.js
 *
 * Safe to run multiple times – skips any title that already exists.
 */

'use strict';

require('dotenv').config();
const https = require('https');
const mysql = require('mysql2/promise');

// ── TheMealDB image helper ────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function findMealImage(title) {
  try {
    const data = await fetchJSON(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(title)}`
    );
    if (data.meals) {
      // Only accept an exact title match — a keyword fallback would assign an
      // unrelated dish's image (e.g. "Green" → "Green Thai Curry" for
      // "Green Smoothie Bowl"), causing visible title/image mismatches.
      const match = data.meals.find(
        (m) => m.strMeal.toLowerCase() === title.toLowerCase()
      );
      if (match) return match.strMealThumb;
    }
  } catch { /* network error – skip */ }
  return null;
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'healthy_eating_app',
  waitForConnections: true,
});

function ing(...items) { return JSON.stringify(items); }

// ── Recipe dataset ────────────────────────────────────────────────────────────

const RECIPES = [

  // ── Breakfast (3) ──────────────────────────────────────────────────────────
  {
    title:        'Avocado Toast with Poached Eggs',
    category:     'breakfast',
    diet:         'general',
    description:  'Creamy avocado on toasted sourdough topped with perfectly poached eggs.',
    ingredients:  ing('2 slices sourdough bread', '1 ripe avocado', '2 eggs',
                      '1 tbsp white wine vinegar', '½ lemon, juice', 'chilli flakes',
                      'salt and pepper'),
    instructions: 'Toast the bread. Mash avocado with lemon juice, salt and pepper; spread on toast.\nBring a pan of water to a gentle simmer with the vinegar. Crack each egg into a cup and slide into the water; poach 3 minutes.\nPlace eggs on top of avocado. Finish with chilli flakes.',
    prep_time:    15, servings: 2,
  },
  {
    title:        'Banana Oat Pancakes',
    category:     'breakfast',
    diet:         'vegetarian',
    description:  'Fluffy two-ingredient pancakes made with ripe banana and oats — naturally gluten-free.',
    ingredients:  ing('2 ripe bananas', '80g rolled oats', '2 eggs', '1 tsp baking powder',
                      '½ tsp cinnamon', 'coconut oil for frying', 'maple syrup to serve'),
    instructions: 'Blend bananas, oats, eggs, baking powder and cinnamon until smooth.\nHeat a little coconut oil in a non-stick pan over medium heat.\nPour small rounds of batter; cook 2–3 minutes per side until golden.\nServe with maple syrup and fresh fruit.',
    prep_time:    15, servings: 2,
  },
  {
    title:        'Green Smoothie Bowl',
    category:     'breakfast',
    diet:         'vegetarian',
    description:  'A thick, vibrant green smoothie bowl loaded with spinach, mango, and crunchy toppings.',
    ingredients:  ing('60g baby spinach', '1 frozen banana', '150g frozen mango chunks',
                      '100ml coconut milk', '1 tbsp chia seeds', '30g granola',
                      'sliced kiwi and berries to top'),
    instructions: 'Blend spinach, banana, mango and coconut milk until very smooth and thick.\nPour into a bowl. Top with granola, chia seeds, kiwi and berries.',
    prep_time:    10, servings: 1,
  },

  // ── Lunch (3) ──────────────────────────────────────────────────────────────
  {
    title:        'Lentil and Roasted Vegetable Wrap',
    category:     'lunch',
    diet:         'vegetarian',
    description:  'Hearty lentils and smoky roasted vegetables in a wholegrain wrap with hummus.',
    ingredients:  ing('2 wholegrain wraps', '150g cooked green lentils', '1 courgette, sliced',
                      '1 red pepper, sliced', '1 red onion, sliced', '2 tbsp olive oil',
                      '4 tbsp hummus', '1 tsp smoked paprika', 'handful of rocket'),
    instructions: 'Toss vegetables with olive oil and paprika; roast at 200°C for 25 minutes.\nSpread hummus on each wrap. Layer with lentils, roasted vegetables and rocket.\nRoll tightly and slice in half.',
    prep_time:    35, servings: 2,
  },
  {
    title:        'Prawn and Mango Salad',
    category:     'lunch',
    diet:         'general',
    description:  'Sweet mango and juicy prawns in a zesty lime dressing over crunchy lettuce.',
    ingredients:  ing('200g cooked king prawns', '1 ripe mango, diced', '1 avocado, diced',
                      '1 little gem lettuce, shredded', '½ red chilli, thinly sliced',
                      '2 tbsp lime juice', '1 tbsp fish sauce', '1 tsp honey',
                      'fresh coriander and mint to serve'),
    instructions: 'Whisk lime juice, fish sauce and honey into a dressing.\nArrange lettuce on a plate. Top with mango, avocado and prawns.\nDrizzle with dressing; scatter over chilli, coriander and mint.',
    prep_time:    15, servings: 2,
  },
  {
    title:        'Roasted Tomato Soup',
    category:     'soup',
    diet:         'vegetarian',
    description:  'Rich and velvety tomato soup made from oven-roasted tomatoes and garlic.',
    ingredients:  ing('800g ripe tomatoes, halved', '1 whole bulb garlic', '1 large onion, quartered',
                      '3 tbsp olive oil', '500ml vegetable stock', '1 tsp sugar',
                      'handful of fresh basil', 'salt and pepper', 'cream to serve (optional)'),
    instructions: 'Place tomatoes, garlic and onion on a roasting tray; drizzle with olive oil and season.\nRoast at 200°C for 35 minutes until caramelised.\nSqueeze garlic cloves from their skins into a blender with the roasted veg, stock and basil.\nBlend until smooth, pass through a sieve for extra silkiness, and reheat. Swirl cream on top.',
    prep_time:    50, servings: 4,
  },

  // ── Dinner (3) ─────────────────────────────────────────────────────────────
  {
    title:        'Lemon Herb Roasted Chicken',
    category:     'dinner',
    diet:         'general',
    description:  'Golden roasted chicken thighs infused with lemon, garlic and fresh herbs.',
    ingredients:  ing('6 chicken thighs, bone-in', '1 lemon, zested and juiced', '4 garlic cloves, minced',
                      '2 tbsp olive oil', '1 tbsp fresh rosemary, chopped', '1 tbsp fresh thyme',
                      'salt and pepper', '200g cherry tomatoes'),
    instructions: 'Combine olive oil, lemon zest, juice, garlic and herbs; rub all over chicken.\nMarinate at least 30 minutes.\nPlace in a roasting dish with cherry tomatoes; season generously.\nRoast at 200°C for 35–40 minutes until skin is golden and juices run clear.',
    prep_time:    50, servings: 3,
  },
  {
    title:        'Thai Green Vegetable Curry',
    category:     'dinner',
    diet:         'vegetarian',
    description:  'Fragrant and creamy Thai green curry with tofu, courgette and sugar snap peas.',
    ingredients:  ing('400ml coconut milk', '2 tbsp Thai green curry paste', '200g firm tofu, cubed',
                      '1 courgette, sliced', '100g sugar snap peas', '1 red pepper, sliced',
                      '2 tbsp fish sauce (or soy sauce)', '1 tbsp palm sugar', '1 lime, juice',
                      'fresh basil leaves', 'cooked jasmine rice to serve'),
    instructions: 'Fry curry paste in a dry wok for 1 minute until fragrant.\nAdd coconut milk; simmer 5 minutes.\nAdd tofu, courgette and pepper; cook 5 minutes.\nStir in sugar snaps, fish sauce and sugar; simmer 2 minutes.\nFinish with lime juice and basil. Serve over jasmine rice.',
    prep_time:    30, servings: 3,
  },
  {
    title:        'Beef and Black Bean Tacos',
    category:     'dinner',
    diet:         'general',
    description:  'Smoky seasoned beef and black beans in warm corn tortillas with fresh salsa.',
    ingredients:  ing('400g beef mince', '400g canned black beans, drained', '8 small corn tortillas',
                      '1 tsp cumin', '1 tsp smoked paprika', '½ tsp garlic powder',
                      '2 tomatoes, diced', '½ red onion, finely diced', '1 lime, juice',
                      'fresh coriander', 'sour cream and grated cheese to serve'),
    instructions: 'Brown beef mince over high heat; add spices and cook 1 minute.\nStir in black beans; cook 3 minutes. Season to taste.\nCombine tomatoes, onion, lime juice and coriander for salsa.\nWarm tortillas; fill with beef mixture, salsa, sour cream and cheese.',
    prep_time:    25, servings: 4,
  },

  // ── Dessert (4) ────────────────────────────────────────────────────────────
  {
    title:        'Chocolate Avocado Mousse',
    category:     'dessert',
    diet:         'vegetarian',
    description:  'Silky dairy-free chocolate mousse made with ripe avocado and raw cacao.',
    ingredients:  ing('2 ripe avocados', '3 tbsp raw cacao powder', '3 tbsp maple syrup',
                      '1 tsp vanilla extract', 'pinch of sea salt', 'berries to serve'),
    instructions: 'Blend avocados, cacao, maple syrup, vanilla and salt until completely smooth.\nTaste and adjust sweetness.\nSpoon into glasses and chill for 30 minutes.\nTop with fresh berries before serving.',
    prep_time:    10, servings: 4,
  },
  {
    title:        'Berry Chia Pudding',
    category:     'dessert',
    diet:         'vegetarian',
    description:  'No-cook overnight chia seed pudding layered with a bright mixed berry compote.',
    ingredients:  ing('4 tbsp chia seeds', '400ml oat milk', '1 tbsp maple syrup',
                      '1 tsp vanilla extract', '150g mixed berries (fresh or frozen)',
                      '1 tbsp lemon juice', '1 tbsp honey'),
    instructions: 'Mix chia seeds, oat milk, maple syrup and vanilla; stir well and refrigerate overnight.\nSimmer berries, lemon juice and honey for 5 minutes to make compote; cool.\nSpoon chia pudding into glasses and top with berry compote.',
    prep_time:    10, servings: 2,
  },
  {
    title:        'Baked Cinnamon Apples',
    category:     'dessert',
    diet:         'vegetarian',
    description:  'Tender baked apples stuffed with oats, cinnamon and brown sugar.',
    ingredients:  ing('4 medium apples', '40g rolled oats', '2 tbsp brown sugar', '1 tsp cinnamon',
                      '30g butter', '2 tbsp raisins', 'vanilla ice cream to serve'),
    instructions: 'Core apples, leaving base intact. Place in a baking dish.\nMix oats, sugar, cinnamon, butter and raisins; pack into apples.\nAdd a splash of water to the dish; bake at 180°C for 30–35 minutes until soft.\nServe with vanilla ice cream.',
    prep_time:    40, servings: 4,
  },
  {
    title:        'Mango Coconut Panna Cotta',
    category:     'dessert',
    diet:         'general',
    description:  'Light coconut panna cotta topped with a vibrant fresh mango coulis.',
    ingredients:  ing('400ml coconut cream', '200ml double cream', '50g caster sugar',
                      '2½ tsp powdered gelatine', '1 tsp vanilla extract',
                      '2 ripe mangoes, peeled', '2 tbsp icing sugar', '1 lime, juice'),
    instructions: 'Warm coconut cream, cream and sugar until sugar dissolves; do not boil.\nDissolve gelatine in 2 tbsp hot water; whisk into cream. Add vanilla.\nPour into moulds; refrigerate at least 4 hours.\nBlend mangoes with icing sugar and lime juice for coulis.\nTurn out panna cotta and pour coulis over.',
    prep_time:    20, servings: 4,
  },

  // ── Soup (3) ───────────────────────────────────────────────────────────────
  {
    title:        'Classic Minestrone',
    category:     'soup',
    diet:         'vegetarian',
    description:  'A robust Italian vegetable soup with cannellini beans and small pasta.',
    ingredients:  ing('2 tbsp olive oil', '1 onion, diced', '2 garlic cloves', '2 carrots, diced',
                      '2 celery stalks, diced', '1 courgette, diced', '400g canned tomatoes',
                      '400g canned cannellini beans', '1 litre vegetable stock',
                      '80g small pasta (ditalini or similar)', '1 tsp dried oregano',
                      'Parmesan rind (optional)', 'fresh basil and Parmesan to serve'),
    instructions: 'Sauté onion, garlic, carrot and celery in olive oil for 8 minutes.\nAdd courgette; cook 2 minutes. Pour in tomatoes, beans, stock and oregano.\nAdd Parmesan rind if using; simmer 20 minutes.\nAdd pasta; cook until al dente. Remove rind.\nServe topped with basil and grated Parmesan.',
    prep_time:    40, servings: 4,
  },
  {
    title:        'Butternut Squash and Ginger Soup',
    category:     'soup',
    diet:         'vegetarian',
    description:  'Warming velvety squash soup with a gentle heat from fresh ginger.',
    ingredients:  ing('1 large butternut squash (~1 kg), peeled and cubed', '1 onion, diced',
                      '3 garlic cloves', '4cm piece fresh ginger, grated', '1 tbsp olive oil',
                      '800ml vegetable stock', '200ml coconut milk',
                      'salt and pepper', 'toasted pumpkin seeds to serve'),
    instructions: 'Sauté onion in olive oil for 5 minutes. Add garlic and ginger; cook 1 minute.\nAdd squash and stock; simmer 20 minutes until squash is tender.\nBlend until smooth; stir in coconut milk. Season and reheat gently.\nServe topped with pumpkin seeds.',
    prep_time:    35, servings: 4,
  },
  {
    title:        'Chicken and Chickpea Soup',
    category:     'soup',
    diet:         'general',
    description:  'A comforting and protein-rich soup with tender chicken, chickpeas and spinach.',
    ingredients:  ing('300g cooked chicken, shredded', '400g canned chickpeas, drained',
                      '1 onion, diced', '3 garlic cloves', '2 carrots, sliced',
                      '1 litre chicken stock', '1 tsp cumin', '1 tsp turmeric',
                      '80g baby spinach', '1 lemon, juice', 'fresh parsley'),
    instructions: 'Sauté onion, garlic and carrot in a little oil for 6 minutes.\nAdd cumin and turmeric; cook 1 minute.\nPour in stock and chickpeas; simmer 15 minutes.\nAdd chicken and spinach; cook 2 minutes. Stir in lemon juice.\nServe with fresh parsley.',
    prep_time:    30, servings: 4,
  },

  // ── Salad (3) ──────────────────────────────────────────────────────────────
  {
    title:        'Classic Caesar Salad',
    category:     'salad',
    diet:         'general',
    description:  'Crisp romaine lettuce, crunchy croutons and a rich homemade Caesar dressing.',
    ingredients:  ing('1 large romaine lettuce, torn', '50g Parmesan, shaved',
                      '2 thick slices bread, cubed (croutons)', '1 tbsp olive oil',
                      '2 anchovy fillets (optional)', '1 garlic clove',
                      '3 tbsp mayonnaise', '1 tbsp lemon juice', '1 tsp Worcestershire sauce',
                      '1 tsp Dijon mustard', 'black pepper'),
    instructions: 'Toss bread cubes in olive oil; bake at 190°C for 10 minutes until golden.\nMash anchovies and garlic to a paste; whisk with mayonnaise, lemon juice, Worcestershire and mustard.\nToss lettuce with dressing until well coated.\nTop with croutons and Parmesan.',
    prep_time:    20, servings: 2,
  },
  {
    title:        'Greek Salad',
    category:     'salad',
    diet:         'mediterranean',
    description:  'The classic Greek village salad with ripe tomatoes, cucumber, olives and feta.',
    ingredients:  ing('3 ripe tomatoes, cut into wedges', '1 cucumber, roughly chopped',
                      '1 red onion, thinly sliced', '100g kalamata olives', '150g feta cheese, crumbled',
                      '1 green pepper, sliced', '3 tbsp extra-virgin olive oil', '1 tbsp red wine vinegar',
                      '1 tsp dried oregano', 'salt and pepper'),
    instructions: 'Combine tomatoes, cucumber, onion, pepper and olives in a bowl.\nDrizzle with olive oil and vinegar; season and toss gently.\nTop with crumbled feta and a generous pinch of oregano.\nServe immediately.',
    prep_time:    10, servings: 2,
  },
  {
    title:        'Roasted Vegetable and Quinoa Salad',
    category:     'salad',
    diet:         'vegetarian',
    description:  'Nutty quinoa tossed with roasted Mediterranean vegetables and a lemon-herb dressing.',
    ingredients:  ing('150g quinoa', '1 aubergine, diced', '1 red pepper, diced', '1 courgette, diced',
                      '200g cherry tomatoes', '3 tbsp olive oil', '2 tbsp lemon juice',
                      '1 garlic clove, minced', '1 tbsp fresh parsley', '50g feta (optional)',
                      'salt and pepper'),
    instructions: 'Cook quinoa according to packet; cool.\nToss vegetables with 2 tbsp olive oil; roast at 200°C for 25 minutes.\nWhisk remaining olive oil, lemon juice and garlic into dressing.\nCombine quinoa, roasted veg and dressing; scatter parsley and feta on top.',
    prep_time:    40, servings: 3,
  },

  // ── Vegetarian (3) ─────────────────────────────────────────────────────────
  {
    title:        'Shakshuka',
    category:     'vegetarian',
    diet:         'vegetarian',
    description:  'Eggs poached in a spiced tomato and pepper sauce — a Middle-Eastern brunch classic.',
    ingredients:  ing('400g canned chopped tomatoes', '2 red peppers, diced', '1 onion, diced',
                      '3 garlic cloves', '4 eggs', '1 tsp cumin', '1 tsp smoked paprika',
                      '½ tsp chilli flakes', '2 tbsp olive oil', 'fresh parsley', 'crusty bread to serve'),
    instructions: 'Sauté onion and pepper in olive oil for 8 minutes. Add garlic and spices; cook 1 minute.\nPour in tomatoes; simmer 10 minutes. Season well.\nMake 4 hollows in the sauce; crack an egg into each.\nCover and cook 5–7 minutes until whites are set.\nScatter parsley and serve with bread.',
    prep_time:    30, servings: 2,
  },
  {
    title:        'Stuffed Bell Peppers',
    category:     'vegetarian',
    diet:         'vegetarian',
    description:  'Colourful peppers filled with a herby rice, black bean and corn mixture, baked until tender.',
    ingredients:  ing('4 large bell peppers (mixed colours)', '200g cooked rice', '400g canned black beans, drained',
                      '150g sweetcorn', '1 red onion, diced', '2 garlic cloves',
                      '1 tsp cumin', '1 tsp paprika', '100g grated cheddar',
                      '400g canned tomatoes', 'fresh coriander'),
    instructions: 'Sauté onion and garlic; add cumin and paprika.\nStir in rice, beans, sweetcorn and half the tomatoes; season.\nCut tops off peppers; remove seeds. Fill with rice mixture and top with cheese.\nPlace upright in a baking dish; pour remaining tomatoes around. Cover with foil.\nBake at 190°C for 30 minutes; remove foil and bake 10 more until cheese is golden.',
    prep_time:    50, servings: 4,
  },
  {
    title:        'Mushroom and Lentil Bolognese',
    category:     'vegetarian',
    diet:         'vegetarian',
    description:  'A deeply savoury plant-based bolognese with mushrooms, lentils and red wine.',
    ingredients:  ing('400g chestnut mushrooms, finely chopped', '200g green lentils, cooked',
                      '1 large onion, diced', '2 carrots, diced', '3 garlic cloves',
                      '400g canned tomatoes', '150ml red wine', '1 tbsp tomato paste',
                      '1 tsp dried thyme', '1 tsp dried oregano', '2 tbsp olive oil',
                      '400g spaghetti', 'Parmesan to serve'),
    instructions: 'Sauté onion and carrot in olive oil for 8 minutes.\nAdd garlic and mushrooms; cook until all moisture evaporates (10 minutes).\nAdd tomato paste; cook 1 minute. Pour in wine and reduce by half.\nAdd tomatoes, lentils and herbs; simmer 25 minutes.\nServe over cooked spaghetti with Parmesan.',
    prep_time:    55, servings: 4,
  },

  // ── Mediterranean (3) ──────────────────────────────────────────────────────
  {
    title:        'Falafel with Tzatziki',
    category:     'mediterranean',
    diet:         'vegetarian',
    description:  'Crispy herb-packed falafel served with cool and creamy homemade tzatziki.',
    ingredients:  ing('400g canned chickpeas, drained', '1 onion, roughly chopped', '3 garlic cloves',
                      '1 tsp cumin', '1 tsp coriander', '1 tsp smoked paprika', '30g fresh parsley',
                      '2 tbsp plain flour', 'oil for frying',
                      '200g Greek yogurt', '½ cucumber, grated', '1 garlic clove', '1 tbsp dill',
                      '1 tbsp lemon juice'),
    instructions: 'Pulse chickpeas, onion, garlic, spices and parsley until a coarse paste forms. Add flour; mix.\nShape into small patties; rest in fridge 30 minutes.\nFry in 1cm oil over medium heat for 3 minutes per side until golden.\nFor tzatziki: squeeze excess water from cucumber; mix with yogurt, garlic, dill and lemon juice.\nServe falafel with tzatziki and flatbreads.',
    prep_time:    45, servings: 4,
  },
  {
    title:        'Baked Sea Bass with Olives and Capers',
    category:     'mediterranean',
    diet:         'mediterranean',
    description:  'Oven-baked sea bass fillets with a punchy olive, caper and tomato sauce.',
    ingredients:  ing('4 sea bass fillets', '200g cherry tomatoes, halved', '80g pitted olives',
                      '2 tbsp capers, drained', '3 garlic cloves, sliced', '3 tbsp olive oil',
                      '100ml white wine', '1 lemon, zested', 'fresh parsley', 'salt and pepper'),
    instructions: 'Sauté garlic in olive oil for 1 minute. Add tomatoes, olives, capers and wine; simmer 5 minutes.\nSeason fish and place in a baking dish. Pour tomato mixture over; add lemon zest.\nBake at 200°C for 12–14 minutes until fish flakes easily.\nScatter with parsley and serve with crusty bread.',
    prep_time:    30, servings: 4,
  },
  {
    title:        'Moroccan Chickpea Stew',
    category:     'mediterranean',
    diet:         'vegetarian',
    description:  'Aromatic North-African stew with chickpeas, sweet potato and harissa.',
    ingredients:  ing('2 x 400g canned chickpeas, drained', '1 large sweet potato, diced',
                      '400g canned tomatoes', '1 onion, diced', '3 garlic cloves',
                      '2 tbsp harissa paste', '1 tsp cumin', '1 tsp cinnamon', '1 tsp coriander',
                      '500ml vegetable stock', '100g spinach', '1 lemon, juice',
                      '2 tbsp olive oil', 'fresh coriander', 'couscous to serve'),
    instructions: 'Sauté onion in olive oil until softened. Add garlic, harissa and spices; cook 1 minute.\nAdd sweet potato, chickpeas, tomatoes and stock; simmer 20 minutes until sweet potato is tender.\nStir in spinach and lemon juice; cook 2 minutes.\nServe over couscous with fresh coriander.',
    prep_time:    35, servings: 4,
  },

  // ── High-Protein (4) ───────────────────────────────────────────────────────
  {
    title:        'Turkey and Quinoa Power Bowl',
    category:     'high-protein',
    diet:         'general',
    description:  'Lean turkey mince over quinoa with roasted broccoli and a tahini drizzle.',
    ingredients:  ing('300g turkey mince', '150g quinoa', '200g broccoli florets',
                      '1 tbsp olive oil', '1 tsp garlic powder', '1 tsp cumin',
                      '2 tbsp tahini', '1 tbsp lemon juice', '1 tbsp water',
                      'salt and pepper', 'sesame seeds to garnish'),
    instructions: 'Cook quinoa according to packet directions.\nRoast broccoli with olive oil at 200°C for 18 minutes.\nBrown turkey with garlic powder, cumin, salt and pepper until cooked through.\nWhisk tahini, lemon juice and water into a dressing.\nBuild bowl: quinoa, turkey, broccoli; drizzle with tahini and scatter sesame seeds.',
    prep_time:    30, servings: 2,
  },
  {
    title:        'Salmon and Edamame Rice Bowl',
    category:     'high-protein',
    diet:         'general',
    description:  'Omega-3-rich teriyaki salmon on brown rice with edamame and cucumber.',
    ingredients:  ing('2 salmon fillets', '150g edamame beans, shelled', '150g brown rice',
                      '1 cucumber, sliced', '2 tbsp soy sauce', '1 tbsp honey',
                      '1 tsp sesame oil', '1 tsp grated ginger', '1 tsp rice vinegar',
                      'sesame seeds', 'spring onions, sliced'),
    instructions: 'Cook rice; keep warm.\nMix soy sauce, honey, sesame oil and ginger into teriyaki glaze.\nPan-fry salmon skin-side down 4 minutes; flip, brush with glaze and cook 2 more minutes.\nBoil edamame 3 minutes; drain.\nBuild bowl: rice, salmon, edamame and cucumber; drizzle with remaining glaze and rice vinegar.\nFinish with sesame seeds and spring onions.',
    prep_time:    30, servings: 2,
  },
  {
    title:        'Cottage Cheese Pancakes',
    category:     'high-protein',
    diet:         'vegetarian',
    description:  'High-protein fluffy pancakes made with cottage cheese — under 300 calories a serving.',
    ingredients:  ing('200g low-fat cottage cheese', '3 eggs', '60g oat flour',
                      '1 tsp baking powder', '1 tbsp honey', '1 tsp vanilla extract',
                      'coconut oil for frying', 'Greek yogurt and berries to serve'),
    instructions: 'Blend cottage cheese, eggs, oat flour, baking powder, honey and vanilla until smooth.\nHeat coconut oil in a non-stick pan over medium-low heat.\nPour small rounds; cook 2–3 minutes until bubbles form, then flip and cook 1 minute.\nServe with a dollop of Greek yogurt and fresh berries.',
    prep_time:    20, servings: 2,
  },
  {
    title:        'Egg White Omelette with Spinach and Feta',
    category:     'high-protein',
    diet:         'vegetarian',
    description:  'Light and fluffy egg white omelette packed with iron-rich spinach and tangy feta.',
    ingredients:  ing('6 egg whites', '60g baby spinach', '50g feta cheese, crumbled',
                      '4 cherry tomatoes, halved', '1 tbsp olive oil',
                      '1 garlic clove, minced', 'salt, pepper and fresh herbs'),
    instructions: 'Season egg whites with salt and pepper; whisk until just combined.\nSauté garlic and spinach in olive oil until wilted; set aside.\nWipe pan; heat a little oil. Pour in egg whites; cook on medium-low until mostly set.\nAdd spinach, feta and tomatoes to one half; fold over.\nCook 1 minute more and serve immediately.',
    prep_time:    15, servings: 1,
  },

  // ── Quick Meals (4) ────────────────────────────────────────────────────────
  {
    title:        'Smoked Salmon Scrambled Eggs',
    category:     'quick meals',
    diet:         'general',
    description:  'Silky soft scrambled eggs with smoked salmon — ready in under 10 minutes.',
    ingredients:  ing('4 eggs', '100g smoked salmon, torn', '2 tbsp butter', '2 tbsp crème fraîche',
                      '1 tbsp chives, chopped', 'salt and white pepper', 'toasted bread to serve'),
    instructions: 'Whisk eggs with a pinch of salt. Melt butter in a non-stick pan over low heat.\nAdd eggs and stir slowly and constantly until just barely set and still creamy.\nRemove from heat; fold in crème fraîche and salmon.\nServe immediately on toast, scattered with chives.',
    prep_time:    10, servings: 2,
  },
  {
    title:        'Cheese and Black Bean Quesadilla',
    category:     'quick meals',
    diet:         'vegetarian',
    description:  'Crispy flour tortillas filled with melted cheese, black beans and jalapeños.',
    ingredients:  ing('4 large flour tortillas', '200g grated cheddar or Monterey Jack',
                      '400g canned black beans, drained and rinsed', '2 spring onions, sliced',
                      '1 tbsp pickled jalapeños (optional)', '1 tsp cumin',
                      'sour cream and salsa to serve'),
    instructions: 'Mix beans with cumin. Spread on one half of each tortilla; top with cheese, spring onions and jalapeños.\nFold in half.\nCook in a dry pan over medium heat for 2–3 minutes per side until golden and cheese melts.\nSlice into wedges; serve with sour cream and salsa.',
    prep_time:    15, servings: 2,
  },
  {
    title:        'Tuna and Avocado Rice Cakes',
    category:     'quick meals',
    diet:         'general',
    description:  'Light rice cakes topped with creamy avocado and protein-rich tuna — no cooking needed.',
    ingredients:  ing('8 plain rice cakes', '2 cans (160g each) tuna in water, drained',
                      '1 ripe avocado', '1 tbsp lemon juice', '2 tbsp low-fat cream cheese',
                      'salt, pepper and paprika', 'cucumber slices and cherry tomatoes'),
    instructions: 'Mash avocado with lemon juice, salt and pepper.\nMix tuna with cream cheese; season well.\nSpread avocado on rice cakes; top with tuna mixture.\nGarnish with cucumber, tomatoes and a pinch of paprika.',
    prep_time:    8, servings: 2,
  },
  {
    title:        'Pesto Pasta with Cherry Tomatoes',
    category:     'quick meals',
    diet:         'vegetarian',
    description:  'A 15-minute weeknight pasta with vibrant basil pesto and burst cherry tomatoes.',
    ingredients:  ing('300g pasta (linguine or penne)', '150g cherry tomatoes',
                      '4 tbsp basil pesto (shop-bought or homemade)', '2 tbsp pasta water',
                      '30g Parmesan, grated', '1 tbsp olive oil', 'salt and pepper',
                      'handful of fresh basil'),
    instructions: 'Cook pasta in salted boiling water until al dente; reserve 2 tbsp cooking water.\nMeanwhile, halve tomatoes and sauté in olive oil 2 minutes until just softened.\nDrain pasta; toss with pesto, pasta water and tomatoes until coated.\nServe topped with Parmesan and fresh basil.',
    prep_time:    15, servings: 2,
  },

  // ── Snack (2) ──────────────────────────────────────────────────────────────
  {
    title:        'Energy Balls',
    category:     'snack',
    diet:         'vegetarian',
    description:  'No-bake oat and date energy balls coated in desiccated coconut.',
    ingredients:  ing('150g Medjool dates, pitted', '100g rolled oats', '2 tbsp peanut butter',
                      '1 tbsp cocoa powder', '1 tbsp chia seeds', '2 tbsp desiccated coconut',
                      'pinch of salt'),
    instructions: 'Blend dates until a sticky paste forms.\nAdd oats, peanut butter, cocoa, chia seeds and salt; blend until combined.\nRoll into small balls; coat in desiccated coconut.\nRefrigerate at least 30 minutes before serving. Keep in the fridge for up to a week.',
    prep_time:    15, servings: 12,
  },
  {
    title:        'Apple Slices with Almond Butter',
    category:     'snack',
    diet:         'vegetarian',
    description:  'Crisp apple slices served with creamy almond butter and a sprinkle of cinnamon.',
    ingredients:  ing('2 apples, cored and sliced', '4 tbsp almond butter', '½ tsp cinnamon',
                      '1 tsp honey (optional)', 'pinch of flaky sea salt'),
    instructions: 'Arrange apple slices on a plate.\nDrizzle almond butter over or serve alongside for dipping.\nSprinkle with cinnamon and sea salt; drizzle honey if using.',
    prep_time:    5, servings: 2,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to database…');
  const conn = await pool.getConnection();

  try {
    // Find owner (prefer admin, fall back to any user)
    const [[owner]] = await conn.query(
      `SELECT id, username FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`
    );
    if (!owner) throw new Error('No admin user found. Run: npm run seed');
    console.log(`Owner: "${owner.username}" (id=${owner.id})\n`);

    // Load diet_type id map
    const [dtRows] = await conn.query('SELECT id, name FROM diet_types');
    const dtMap = Object.fromEntries(dtRows.map((r) => [r.name, r.id]));

    // ── Re-sync images for all dataset recipes (fixes previously wrong images) ─
    // Uses exact-match only — any recipe that was previously assigned an image
    // via the old keyword fallback will have its image corrected or cleared.
    const datasetTitles = RECIPES.map((r) => r.title.toLowerCase());
    const placeholders  = datasetTitles.map(() => '?').join(', ');
    const [datasetRows] = await conn.query(
      `SELECT id, title FROM recipes WHERE LOWER(title) IN (${placeholders})`,
      datasetTitles
    );
    if (datasetRows.length > 0) {
      console.log(`Re-syncing images for ${datasetRows.length} dataset recipe(s)…`);
      for (const row of datasetRows) {
        const imgUrl = await findMealImage(row.title);
        await conn.query('UPDATE recipes SET image_url = ? WHERE id = ?', [imgUrl ?? null, row.id]);
        console.log(`  ${imgUrl ? '✓ set' : '– cleared (no exact match)'}:  "${row.title}"`);
      }
      console.log('');
    }

    // ── Fix other existing recipes that still have no image ────────────────
    const [noImage] = await conn.query(
      `SELECT id, title FROM recipes WHERE (image_url IS NULL OR image_url = '') AND LOWER(title) NOT IN (${placeholders})`,
      datasetTitles
    );
    if (noImage.length > 0) {
      console.log(`Fetching images for ${noImage.length} other recipe(s) without images…`);
      let fixed = 0;
      for (const row of noImage) {
        const imgUrl = await findMealImage(row.title);
        if (imgUrl) {
          await conn.query('UPDATE recipes SET image_url = ? WHERE id = ?', [imgUrl, row.id]);
          console.log(`  ✓  image updated: "${row.title}"`);
          fixed++;
        } else {
          console.log(`  –  no image found: "${row.title}"`);
        }
      }
      console.log(`Fixed ${fixed}/${noImage.length} other recipe(s).\n`);
    }

    // ── Insert new recipes ─────────────────────────────────────────────────
    const [existing] = await conn.query('SELECT title FROM recipes');
    const existingTitles = new Set(existing.map((r) => r.title.toLowerCase()));

    let inserted = 0;
    let skipped  = 0;

    for (const r of RECIPES) {
      if (existingTitles.has(r.title.toLowerCase())) {
        console.log(`  –  "${r.title}" already exists, skipping`);
        skipped++;
        continue;
      }

      const imgUrl = await findMealImage(r.title);

      await conn.query(
        `INSERT INTO recipes
           (user_id, diet_type_id, title, description, category,
            ingredients, instructions, image_url, prep_time, servings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          owner.id,
          dtMap[r.diet] ?? null,
          r.title,
          r.description,
          r.category,
          r.ingredients,
          r.instructions,
          imgUrl ?? null,
          r.prep_time,
          r.servings,
        ]
      );

      existingTitles.add(r.title.toLowerCase());
      console.log(`  ✓  [${r.category}] ${r.title}${imgUrl ? ' 🖼' : ''}`);
      inserted++;
    }

    console.log('\n─────────────────────────────────');
    console.log(`Inserted : ${inserted}`);
    console.log(`Skipped  : ${skipped} (already exist)`);
    console.log('Done.');
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
