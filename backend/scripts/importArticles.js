/**
 * Article import script – inserts 20 curated educational articles covering
 * traditional cuisines, cooking methods, healthy habits, diet culture,
 * ingredient knowledge, and meal planning.
 *
 * Run from the backend/ directory:
 *   node scripts/importArticles.js
 *
 * Safe to run multiple times – skips any title that already exists.
 */

'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'healthy_eating_app',
  waitForConnections: true,
});

// ── Article dataset ───────────────────────────────────────────────────────────

const ARTICLES = [

  // ── Traditional Cuisine (4) ───────────────────────────────────────────────

  {
    title:    'The Heart of Mediterranean Cuisine',
    category: 'traditional-cuisine',
    summary:  'Explore how the sun-drenched shores of southern Europe shaped one of the world\'s most celebrated and healthful food cultures.',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    content: `Mediterranean cuisine is not a single national tradition but a mosaic of cooking cultures united by geography, climate, and a shared pantry of ingredients. From the olive groves of Andalusia to the fishing villages of the Greek islands and the bustling souks of Moroccan port cities, a common thread of simplicity, freshness, and seasonal abundance runs through every plate.

At the core of this tradition is olive oil — the golden liquid that replaces butter across the region. Cold-pressed extra-virgin olive oil is used generously for cooking, dressing, and dipping. Its high monounsaturated fat content and polyphenol antioxidants have been linked to reduced cardiovascular disease, lower inflammation markers, and improved cholesterol profiles.

Vegetables take centre stage rather than serving as a side note. A typical Mediterranean meal might include roasted aubergines drizzled with tahini, braised courgettes with tomatoes and herbs, or a simple salad of ripe tomatoes, cucumber, red onion, and feta dressed with little more than oil and oregano. Legumes — chickpeas, lentils, white beans — appear in soups, stews, and fritters, providing plant protein and soluble fibre.

Fish and seafood are consumed several times a week, particularly in coastal communities. Grilled sardines, baked sea bass with capers and olives, prawn saganaki baked in a tomato and feta sauce — these dishes reflect a relationship with the sea as provider and cultural identity. Red meat appears, but sparingly; it is a celebration food rather than an everyday staple.

Bread, pasta, rice, and other grains are embraced wholeheartedly, but typically in their less processed, wholegrain or naturally leavened forms. A slow-fermented sourdough loaf or a bowl of al-dente whole-wheat pasta carries a very different nutritional profile from its industrially refined equivalents.

Perhaps most importantly, Mediterranean food culture is inseparable from the social ritual of eating together. Long lunches, shared meze spread across the table, neighbours bringing olives and cheese — the psychological dimension of unhurried, communal eating may be as important to wellbeing as any individual nutrient. Modern nutritional science increasingly supports this view: the social pleasure of eating has measurable effects on digestion, stress hormones, and long-term dietary adherence.`,
  },

  {
    title:    'Japanese Washoku: Philosophy Behind the Plate',
    category: 'traditional-cuisine',
    summary:  'Washoku, Japan\'s traditional dietary culture, is a UNESCO-recognised culinary heritage that balances aesthetics, nutrition, and mindfulness in every meal.',
    image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99eb4b847?auto=format&fit=crop&w=800&q=80',
    content: `In 2013, UNESCO inscribed Washoku — the traditional dietary culture of the Japanese people — on its Intangible Cultural Heritage list. The recognition acknowledged not merely a set of recipes but a coherent philosophy of cooking, eating, and relating to the natural world that has evolved over more than a thousand years.

The term Washoku derives from wa (harmony) and shoku (food). Harmony is not an abstract aspiration; it is a practical principle expressed in every aspect of the meal. Harmony of flavours: the Japanese culinary tradition identifies five fundamental tastes — sweet, sour, salty, bitter, and umami — and skilful cooking balances all five in a single sitting. Harmony of colours: a traditional ichiju sansai (one soup, three sides) meal is composed with attention to the five colours: white, black, red, yellow, and green, each associated with different nutrients and organs in traditional medicine.

Umami, the fifth taste identified and named by Japanese chemist Kikunae Ikeda in 1908, is the quiet backbone of Japanese cooking. It is the savoury depth that dashi — a stock made from dried kombu seaweed and bonito flakes — brings to miso soup, noodle broths, and simmered dishes. Umami-rich foods (fermented soy, shiitake mushrooms, dried fish) not only taste satisfying but reduce the need for salt, which partly explains why traditional Japanese diets, despite relatively high sodium content from miso and soy, are associated with low rates of heart disease.

Rice is the cultural and nutritional centre of the meal. Short-grain Japanese rice, polished but not stripped of all nutrition, provides complex carbohydrates and is traditionally eaten in moderate portions alongside multiple small dishes rather than in large quantities alone. The variety and smallness of portions — a practice called hara hachi bu by the long-lived people of Okinawa, meaning "eat until 80 percent full" — prevents overeating naturally.

Seasonality (shun) is perhaps the most beautiful aspect of Washoku. Each season brings its defining ingredients: bamboo shoots and sea bream in spring; cold soba noodles and iced matcha in summer; mushrooms and sweet potato in autumn; hot nabe stew and root vegetables in winter. Eating seasonally is not a trend in Japan — it is the foundation of the cuisine and the calendar.`,
  },

  {
    title:    'Hungarian Goulash and the Soul of Central European Cooking',
    category: 'traditional-cuisine',
    summary:  'From herdsmen\'s cauldrons to family kitchen tables, goulash tells the story of Hungarian food culture — hearty, paprika-scented, and deeply tied to the land.',
    image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    content: `Goulash — gulyás in Hungarian — began not as a refined dish but as practical sustenance for cattle drovers crossing the Great Hungarian Plain, the puszta. The herdsmen (gulyás literally means "herdsman") slow-cooked toughened beef in iron cauldrons over open fires, seasoning it heavily with dried paprika to preserve the meat during long journeys to market. By the 19th century, this humble cowboy stew had become a symbol of Hungarian national identity and one of the most recognised dishes in Central Europe.

Paprika is the soul of Hungarian cuisine. Hungary produces some of the finest paprika in the world, grown in the regions around Kalocsa and Szeged. The spice exists on a spectrum from édesnemes (sweet and mild) to erős (fiercely hot), and Hungarian cooks use it not merely as a garnish but as a primary flavour and colouring agent. A proper gulyás develops its deep brick-red colour and smoky sweetness from generous amounts of paprika bloomed in fat before the meat is added — a technique that releases the fat-soluble carotenoids responsible for both colour and flavour.

Beyond goulash, Hungarian cooking reflects the agricultural richness of the Carpathian Basin. Pork is the dominant meat; lard was historically used as the primary cooking fat, lending dishes a depth that vegetable oils cannot replicate. Sour cream (tejföl) is stirred into sauces, dolloped onto soups, and served alongside stuffed cabbage rolls (töltött káposzta) to add richness and a cooling acidity. Cabbage itself — both fresh and fermented into savanyúkáposzta — is a staple, providing vitamin C through winter months when fresh produce was historically scarce.

Hungarian pastry culture deserves its own chapter. Rétes (strudel), kürtőskalács (chimney cake), and dobos torta — the famous layered cake topped with caramel-glazed slabs — demonstrate a European pastry tradition of extraordinary sophistication. These are not everyday foods but festival foods, prepared for celebrations and shared generously, reflecting the Hungarian tradition of hospitality (vendégszeretet) that remains central to food culture today.`,
  },

  {
    title:    'The Spice Routes: How Indian Cuisine Changed the World',
    category: 'traditional-cuisine',
    summary:  'Indian culinary tradition spans thousands of years and hundreds of regional styles, unified by a sophisticated understanding of spice, balance, and the medicinal power of food.',
    image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    content: `India's relationship with spices is older than recorded history. Archaeological evidence from the Indus Valley Civilisation (3000–1500 BCE) reveals the use of turmeric, ginger, and mustard seeds in cooking — spices that remain central to Indian kitchens today. The ancient Ayurvedic medical system codified spices not merely as flavourings but as medicines, categorising them by their effects on the body's doshas (constitutional types) and prescribing specific combinations for health, digestion, and mood.

The concept of masala — a blend of spices ground or roasted together — is fundamental to Indian cooking. Unlike European cuisines that typically layer flavours sequentially, Indian cooking often begins with a tadka or chaunk: whole spices (mustard seeds, cumin, dried chillies) dropped into hot oil to bloom and crackle, releasing their aromatic compounds into the fat which then carries these flavours through the entire dish. This technique maximises the extraction of fat-soluble spice compounds and creates complexity in the very first seconds of cooking.

Regional diversity in Indian cuisine is staggering. The coconut-scented curries and seafood of Kerala differ completely from the mustard-oil-enriched fish preparations of Bengal, the yogurt-marinated tandoori meats of Punjab, the tamarind-and-lentil sambars of Tamil Nadu, and the slow-cooked, mildly spiced Mughlai biryanis of Hyderabad. Each regional style reflects local agriculture, climate, historical trade routes, and religious dietary practices.

Vegetarianism has deep roots in Indian culture, particularly among Hindu and Jain communities, and has produced some of the world's most sophisticated plant-based cooking. Dal — spiced lentil preparations — appear in countless variations from thin, soupy rasam to thick, rich dal makhani simmered overnight with butter. Paneer, a fresh acid-set cheese, provides protein in dishes like palak paneer (spinach and cheese) and matar paneer (peas and cheese). The diversity of vegetarian Indian cooking challenges the Western assumption that plant-based eating must sacrifice either flavour or satiety.

Modern nutritional science has vindicated many traditional Indian spice practices. Curcumin, the active compound in turmeric, has demonstrated anti-inflammatory properties in hundreds of studies. Fenugreek seeds help regulate blood sugar. Black pepper contains piperine, which dramatically increases the bioavailability of curcumin when consumed together — a combination that traditional Indian cooking has employed for millennia without knowing the molecular mechanism.`,
  },

  // ── Cooking Methods (4) ───────────────────────────────────────────────────

  {
    title:    'The Science and Art of Slow Cooking',
    category: 'cooking-methods',
    summary:  'Slow cooking transforms tough, cheap cuts of meat and humble vegetables into deeply flavoured, nutritious meals through the patient application of gentle heat.',
    image_url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80',
    content: `In an age of microwave meals and air-fryer hacks, slow cooking stands as a radical act of patience. It is also a profound piece of food science. When meat cooks for hours at temperatures between 70°C and 95°C, remarkable transformations occur at the molecular level that no amount of high-heat cooking can replicate.

Collagen — the tough connective tissue that makes cheap cuts like shin, brisket, oxtail, and shoulder chewy and difficult — begins to dissolve into gelatin at around 70°C, but the process takes time. Short, high-heat cooking denatures the proteins before collagen can convert, leaving meat dry and stringy. Extended low-heat cooking allows collagen conversion to proceed fully, producing that characteristic silky, unctuous texture of a well-braised dish. The gelatin also enriches the cooking liquid, transforming it into a glossy, deeply flavourful sauce that coats every element of the dish.

The Maillard reaction — the browning that creates hundreds of complex flavour compounds — occurs at high temperatures, which is why slow-cooked dishes typically begin with a searing step. Browning the meat in a very hot pan before adding liquid creates a flavour foundation that slow cooking then develops and integrates over hours. Skipping this step produces technically acceptable but flavourly flat results.

Slow cooking is also forgiving of timing. A dish that reaches its ideal temperature after four hours will hold its quality for another two hours without deteriorating, unlike a grilled steak that must be served within minutes of cooking. This makes slow cooking ideal for home cooks juggling busy schedules and for large communal meals where precise serving times are impossible.

Nutritionally, slow cooking preserves heat-sensitive vitamins less effectively than steaming but better than high-heat roasting. However, the extended cook time allows greater extraction of minerals and collagen from bones, making bone broths and stews particularly rich in calcium, magnesium, and glycine — an amino acid with demonstrated benefits for sleep quality and joint health. The liquid in which a slow-cooked dish sits accumulates much of its nutritional value, which is why serving the braising liquid as a sauce rather than discarding it is not just good cooking practice but good nutritional practice.`,
  },

  {
    title:    'Fermentation: Ancient Preservation, Modern Health',
    category: 'cooking-methods',
    summary:  'From kimchi to kombucha, sourdough to sauerkraut — fermentation is humanity\'s oldest food technology and one of the most exciting frontiers of nutritional science.',
    image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    content: `Long before refrigerators, before canning, before vacuum sealing, humans discovered that certain foods kept longer — and tasted better — when allowed to transform through microbial activity. Fermentation is this process: the metabolic conversion of sugars and starches by bacteria, yeasts, or moulds into acids, gases, and alcohols that preserve food and create entirely new flavour profiles.

The variety of fermented foods across human cultures is extraordinary. Korea has kimchi — lacto-fermented napa cabbage with chilli, garlic, and ginger, with hundreds of regional variations. Germany and Central Europe have sauerkraut — cabbage fermented in its own brine until sour and crisp. Japan has miso — soybeans fermented with koji mould into a paste that forms the base of one of the world's most consumed broths. Ethiopia has injera — a spongy flatbread made from teff flour fermented for three days, producing a complex sourness that balances the spiced stews (wot) served upon it. And virtually every bread-making tradition includes some form of leavening that relies on wild yeast fermentation.

The health implications of fermented foods have moved from folk wisdom to mainstream science. The human gut microbiome — the community of trillions of microorganisms inhabiting the digestive tract — is now understood to play a critical role in immune function, mood regulation, metabolic health, and even cognitive function. Fermented foods introduce live beneficial bacteria (probiotics) and create an environment that supports a diverse, healthy microbiome.

A landmark 2021 study published in Cell showed that a diet high in fermented foods — consumed for ten weeks — increased microbiome diversity and decreased markers of inflammation compared to a high-fibre diet. The researchers identified 19 measurable immune markers that improved with fermented food consumption. While this is a single study and the science is still developing, it validates centuries of traditional food wisdom.

Making fermented foods at home requires minimal equipment. Sauerkraut needs only cabbage, salt, a jar, and time. Sourdough starter can be cultivated from flour and water in a week. Yogurt requires only milk and a small amount of existing yogurt as a starter culture. The process reconnects the home cook with a fundamental aspect of food preparation that industrial production has largely removed from daily life.`,
  },

  {
    title:    'Mastering the Art of Grilling: Heat, Smoke, and Flavour',
    category: 'cooking-methods',
    summary:  'Grilling is the world\'s oldest cooking technique and one of its most nuanced — understanding heat zones, timing, and smoke transforms ordinary ingredients into extraordinary meals.',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    content: `Fire was humanity's first cooking tool, and grilling — the direct application of radiant heat to food — is the most direct expression of that original relationship between fire and nourishment. Every culture that has access to heat sources has developed grilling traditions: Korean bulgogi over charcoal, Argentine asado over wood embers, Turkish kebabs on skewers, Japanese yakitori over binchotan charcoal. The technique is universal; the expressions are endlessly varied.

The chemistry of grilling produces uniquely complex flavours through two primary reactions. The Maillard reaction, occurring above 140°C on the food's surface, creates hundreds of aromatic compounds responsible for the characteristic browned, savoury crust. The caramelisation of sugars above 160°C adds sweetness and colour. Both reactions require a dry, high-temperature surface — which is why patting protein dry before grilling and ensuring the grill grate is genuinely hot before placing food are the two most important technical steps.

Heat management is the skill that separates competent from excellent grillers. A properly set up charcoal grill has zones: direct heat over the coals for searing and crust development; indirect heat away from the coals for gentle cooking through to the centre. This two-zone approach — sear over direct heat, then move to indirect to finish — prevents the common problem of meat that is charred outside but raw inside, or perfectly cooked inside but pale and steamed-textured outside.

Smoke is an additional flavour dimension that charcoal and wood-fired grills provide over gas. Different wood species produce distinctive flavour profiles: cherry wood adds a mild, fruity sweetness suited to poultry; hickory brings a strong, bacon-like smokiness that pairs well with pork; oak is versatile and balanced. Wood chips soaked in water and placed on hot coals produce cooler, denser smoke that clings to food's surface and penetrates during the cook.

Vegetables deserve as much attention on the grill as proteins. Aubergine, courgette, peppers, corn, asparagus, and portobello mushrooms all develop remarkable depth when grilled. The high heat collapses cell walls and concentrates sugars, producing flavours that roasting in an oven cannot fully replicate. A drizzle of good olive oil, a few flakes of sea salt, and two minutes of direct heat can transform a humble courgette into something extraordinary.`,
  },

  {
    title:    'Steam Cooking: The Gentle Science of Preserving Nutrients',
    category: 'cooking-methods',
    summary:  'Steaming is one of the oldest and most nutritionally efficient cooking methods, preserving vitamins, minerals, and textures that boiling and roasting can destroy.',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    content: `Steam cooking may lack the dramatic spectacle of grilling or the deep flavours of slow braising, but it represents one of the most nutritionally intelligent approaches to preparing food. The principle is simple: food is placed above — not in — boiling water, where steam (at approximately 100°C at sea level) surrounds and penetrates the food, cooking it through moist heat without immersing it in liquid that can leach water-soluble nutrients away.

The nutritional case for steaming is compelling. A comparative study of broccoli cooking methods found that steaming retained approximately 90% of glucosinolates (cancer-preventive compounds) compared to 40–65% retained by boiling and around 70% by microwaving. Vitamin C, folate, and B vitamins are all water-soluble and are substantially lost when vegetables are boiled in large amounts of water and that water is discarded. Steaming avoids this leaching entirely because the food does not contact the water directly.

Asian culinary traditions have developed steam cooking to extraordinary levels of refinement. Chinese dim sum — the tradition of small steamed and fried dishes served at yum cha tea houses — includes hundreds of preparations: har gow (translucent shrimp dumplings), char siu bao (soft steamed pork buns), cheung fun (rice noodle rolls), and bao zi of every variety. Each demands precise control of steam temperature and timing; oversteaming causes wrappers to collapse and fillings to become rubbery, while understeaming leaves them doughy and undercooked.

Japanese cuisine employs a technique called mushimono — steamed dishes — with similar precision. Chawanmushi is a silky steamed egg custard containing mushrooms, shrimp, and gingko nuts; its perfect texture requires steaming at a relatively low temperature (between 80°C and 85°C) that sets the egg proteins gently without causing the custard to bubble and become porous. Achieving this in a conventional steamer requires placing a towel under the lid to prevent condensation water dripping onto the custard surface.

For the home cook, a simple bamboo steamer basket over a wok of simmering water is sufficient for most applications and costs very little. The gentle heat means that foods are more forgiving of slight timing variations than high-heat methods; a few extra minutes rarely ruins a steamed dish the way it would a grilled one.`,
  },

  // ── Healthy Habits (3) ────────────────────────────────────────────────────

  {
    title:    'Mindful Eating: Slowing Down to Nourish Well',
    category: 'healthy-habits',
    summary:  'Mindful eating is not a diet — it is a practice of attention that transforms the relationship between mind, body, and food, reducing overeating and increasing satisfaction.',
    image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    content: `The average adult in a modern urban environment eats while distracted — scrolling a phone, watching a screen, working through lunch at a desk. This is so normalised that eating with full attention to the food and the experience of eating feels almost radical. Yet the practice of mindful eating — which asks us to bring deliberate, non-judgmental awareness to what and how we eat — has substantial scientific evidence behind it for improving both physical and psychological aspects of nutrition.

Mindful eating is rooted in the Buddhist practice of mindfulness, brought into mainstream psychological and nutritional contexts through the work of researchers like Jon Kabat-Zinn and Jean Kristeller. It asks practitioners to notice hunger and satiety signals before, during, and after eating; to eat slowly enough to register the gradual satisfaction that builds over the course of a meal; to engage all senses — the visual appeal of food, its aroma, the sound of biting into it, the texture and flavour as it is chewed; and to observe emotional states that trigger eating.

The physiological basis for mindful eating's effectiveness lies in the lag between stomach fullness and the brain's registration of satiety. It takes approximately 20 minutes for stretch receptors in the stomach and hormonal signals (particularly leptin and cholecystokinin) to reach the hypothalamus and register fullness. Eating quickly can lead to consuming significantly more calories than needed before satiety registers. Slowing the pace of eating — by setting utensils down between bites, thoroughly chewing each mouthful, and pausing during the meal — aligns eating pace with this physiological signal.

Research published in the American Journal of Clinical Nutrition found that people who ate lunch while playing a computer game consumed more snacks two hours later than those who ate without distraction, because the distracted eaters had poorer memory of what they had eaten and thus felt less satisfied retrospectively. This finding suggests that the psychological experience of eating — not just caloric intake — matters for appetite regulation.

Practising mindful eating does not require formal meditation training or radical lifestyle change. Starting with one meal per day — ideally eaten seated, without screens, for at least twenty minutes — is sufficient to begin developing the habit of attentiveness.`,
  },

  {
    title:    'Building a Balanced Plate: The Evidence Behind Eating Well',
    category: 'healthy-habits',
    summary:  'Understanding how to build a nutritionally complete meal doesn\'t require a nutrition degree — a few simple principles cover the vast majority of what the evidence shows matters most.',
    image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    content: `Nutritional advice has a well-earned reputation for confusion and contradiction. Fat was the enemy in the 1980s; carbohydrates became the villain in the 1990s; protein is the current hero for many audiences. Much of this noise comes from individual studies being reported as definitive conclusions, from industry-funded research distorting the evidence base, and from the genuine complexity of a field where the exposure (food) is consumed multiple times daily across a lifetime and is nearly impossible to study with the rigour of pharmaceutical trials.

Yet when the most robust evidence is examined — long-term prospective studies, systematic reviews, dietary pattern analyses across populations — a surprisingly consistent picture emerges. The healthiest diets globally share several features: they emphasise whole, minimally processed plant foods; they include moderate amounts of lean protein from varied sources; they limit ultra-processed foods; and they are embedded in a culture of unhurried, social eating.

A practical framework for building a balanced plate: aim for vegetables and fruits to occupy roughly half the plate, prioritising variety and colour. Different pigments indicate different phytonutrients — purple berries provide anthocyanins, orange sweet potatoes provide beta-carotene, dark leafy greens provide lutein and folate, red tomatoes provide lycopene. A quarter of the plate should be whole grains or other quality starchy carbohydrates — brown rice, quinoa, whole-wheat pasta, sweet potato — which provide sustained energy, fibre, and B vitamins. The remaining quarter consists of protein: lean meat, fish, eggs, legumes, or tofu.

Healthy fats are not part of a "quarter" but are present throughout — in the olive oil used for cooking, the avocado sliced on the side, the handful of nuts as a finishing touch, or the fatty fish serving as the protein. Fat is not the enemy; it is a critical macro-nutrient providing fat-soluble vitamins (A, D, E, K), supporting brain function, and enabling the absorption of fat-soluble plant compounds like lycopene and beta-carotene.

Beverages matter as much as food. Water is the ideal primary beverage; unsweetened tea and coffee in moderate amounts carry documented health benefits. Sugary drinks — including fruit juices in large quantities — add substantial calories with minimal satiety and are among the most consistent dietary predictors of type 2 diabetes risk in epidemiological research.`,
  },

  {
    title:    'The Role of Breakfast in Metabolic Health',
    category: 'healthy-habits',
    summary:  'Is breakfast truly the most important meal of the day? The science is more nuanced than the old slogan suggests, but timing and composition of morning nutrition matter more than many realise.',
    image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    content: `"Breakfast is the most important meal of the day" has circulated since the early 20th century, popularised in part by cereal manufacturers whose commercial interests aligned conveniently with promoting morning eating occasions. This does not mean the claim is wrong — but it requires examination against the actual evidence rather than received wisdom.

The relationship between breakfast consumption and health outcomes is genuinely complex. Observational studies consistently find that breakfast skippers have higher rates of obesity, type 2 diabetes, and cardiovascular disease. However, observational data cannot establish causation: people who skip breakfast may do so for reasons (irregular schedules, financial stress, poor sleep) that themselves predict poor health outcomes independent of the meal timing.

Randomised controlled trials examining breakfast specifically find more mixed results. A 2019 systematic review of 13 trials found that adding breakfast to the daily routine of breakfast-skippers led to slightly higher daily caloric intake without consistent weight loss benefits — contradicting the common claim that breakfast "boosts metabolism." However, this analysis looked at body weight alone, not metabolic markers, cognitive performance, or energy regulation throughout the day.

What seems clearer is that breakfast composition matters enormously. A high-protein, moderate-fat breakfast (eggs, Greek yogurt, cottage cheese, nuts) produces significantly different metabolic effects than a high-sugar, refined-carbohydrate breakfast (sweetened cereals, pastries, fruit juice). The former produces stable blood sugar and sustained satiety; the latter causes rapid glucose spiking followed by a blood sugar dip that triggers hunger and cravings within two to three hours.

Circadian biology adds another dimension. Research in chronobiology indicates that insulin sensitivity is highest in the morning and declines through the day, meaning the same meal eaten at breakfast produces a smaller glucose response than the same meal eaten at dinner. This suggests that for people who do eat breakfast, consuming the majority of their carbohydrate intake earlier in the day may be metabolically advantageous — though individual variation in chronotype (whether someone is naturally a morning or evening person) modifies this significantly.`,
  },

  // ── Diet Culture (3) ──────────────────────────────────────────────────────

  {
    title:    'The Mediterranean Diet: Evidence, Myths, and Real-World Practice',
    category: 'diet-culture',
    summary:  'The Mediterranean diet is one of the most evidence-backed dietary patterns in nutritional science — but what does it actually mean to eat this way, and what does the research really show?',
    image_url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80',
    content: `Few dietary patterns have accumulated as much scientific attention as the Mediterranean diet. The 2013 PREDIMED trial — a large Spanish randomised trial of over 7,000 adults at high cardiovascular risk — found that participants assigned to a Mediterranean diet supplemented with extra-virgin olive oil or nuts had a 30% lower rate of major cardiovascular events compared to those assigned to a low-fat control diet. The result was striking enough that the trial was stopped early on ethical grounds, since it would have been wrong to continue denying the control group what appeared to be a significantly healthier diet.

But what exactly is the "Mediterranean diet"? The term was coined by American physiologist Ancel Keys in the 1960s following his Seven Countries Study, which observed low rates of coronary heart disease in Mediterranean populations despite relatively high fat intake. Keys described a pattern characterised by high consumption of olive oil, vegetables, legumes, fruits, nuts, and whole grains; moderate consumption of fish and seafood; low-to-moderate consumption of dairy and poultry; low consumption of red meat; and moderate consumption of wine with meals.

This original description reflects mid-20th century dietary patterns in southern Italy and Greece — patterns that have since changed substantially as these societies have adopted the processed food habits of northern Europe and America. The "Mediterranean diet" as currently prescribed by nutritionists is therefore partly a historical reconstruction rather than a description of how people currently eat in Mediterranean countries.

Several mechanisms have been proposed for the Mediterranean diet's protective effects. Olive oil provides oleocanthal, a compound with anti-inflammatory properties similar to ibuprofen; polyphenols from olive oil, red wine, and colourful vegetables reduce oxidative stress; high fibre intake from legumes and vegetables supports a diverse gut microbiome; omega-3 fatty acids from fish reduce triglycerides and inflammation; and the overall dietary pattern maintains lower glycaemic load than typical Western diets.

Importantly, the diet also comes embedded in a cultural context of practices that may matter independently: eating with family and friends, taking time for meals, moderate portion sizes, and physical activity integrated into daily life rather than confined to scheduled exercise sessions.`,
  },

  {
    title:    'Plant-Based Eating: Separating Evidence from Ideology',
    category: 'diet-culture',
    summary:  'Plant-based diets are among the fastest-growing food trends globally. What does the evidence say about their health, environmental, and practical implications?',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    content: `Plant-based eating exists on a spectrum from flexitarianism (reducing but not eliminating animal products) to pescatarianism, vegetarianism, and veganism. In common usage, "plant-based" often refers to a diet that centres whole plant foods while not necessarily excluding all animal products — a distinction that matters because the evidence for different points on this spectrum differs substantially.

The nutritional case for increasing plant food consumption is robust. Epidemiological data consistently shows that higher fruit and vegetable intake is associated with lower risk of cardiovascular disease, certain cancers, type 2 diabetes, and all-cause mortality. These associations likely reflect multiple mechanisms: fibre supporting gut health and cholesterol regulation; phytonutrients reducing inflammation and oxidative damage; lower calorie density supporting healthy body weight; and the displacement of less healthy foods from the diet.

The question of whether complete elimination of animal products is necessary for health optimisation is less clear-cut. Studies comparing vegans and vegetarians to matched omnivores generally find lower rates of cardiovascular disease in both plant-based groups, but do not consistently find significant differences between vegans and vegetarians. Meanwhile, populations eating traditional diets that include moderate amounts of animal products (Japanese, Mediterranean, certain hunter-gatherer communities) are among the longest-lived and healthiest observed.

Nutritional risks of poorly planned plant-based diets are real and should not be minimised. Vitamin B12 does not occur in plant foods in biologically meaningful quantities; vegans who do not supplement reliably will develop deficiency, which can cause irreversible neurological damage. Omega-3 fatty acids: plants provide ALA (alpha-linolenic acid), but conversion to the more biologically active EPA and DHA is limited; algae-based DHA supplements are recommended. Iron from plant sources (non-haem iron) is less bioavailable than haem iron from meat; consuming vitamin C-rich foods alongside plant iron sources and avoiding tea or coffee with meals significantly improves absorption.

Ultra-processed plant-based foods — vegan burgers, plant-based nuggets, oat-based desserts — deserve scepticism equal to that applied to ultra-processed animal-based products. The processing strips whole plant foods of fibre, phytonutrients, and structure, while adding salt, sugar, and industrial additives. A diet of processed vegan food is not inherently healthier than a diet of processed omnivore food.`,
  },

  {
    title:    'The Blue Zones: What the World\'s Longest-Lived People Eat',
    category: 'diet-culture',
    summary:  'In five regions of the world, people regularly live past 100 in good health. Researcher Dan Buettner identified these Blue Zones and found surprising commonalities in their diets and lifestyles.',
    image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80',
    content: `In the early 2000s, National Geographic researcher Dan Buettner and a team of demographers and epidemiologists set out to identify regions of the world with unusually high concentrations of centenarians — people living to 100 or beyond in good cognitive and physical health. They found five such regions, which they designated Blue Zones: Sardinia (Italy), Okinawa (Japan), Loma Linda (California, USA), Nicoya Peninsula (Costa Rica), and Ikaria (Greece).

These regions share several cultural and dietary characteristics that appear to contribute to exceptional longevity, though isolating any single factor as causal is impossible given the complex interplay of genetics, environment, culture, and lifestyle.

Dietary patterns across all five Blue Zones emphasise plant foods. Legumes — beans, lentils, soy, chickpeas — appear as a cornerstone of every Blue Zone diet, consumed daily in quantities far exceeding typical Western consumption. The Sardinian diet features fava beans and minestrone; Okinawans eat tofu and edamame; Seventh-day Adventists in Loma Linda (who are largely vegetarian by religious practice) consume substantial legumes; Costa Ricans eat black beans daily; Ikarians eat lentils and chickpeas in traditional preparations.

Meat is consumed, but sparingly — an average of five times per month across Blue Zone populations, usually in small portion sizes as flavouring rather than as the centrepiece of a meal. Fish is consumed more regularly, particularly in Sardinia, Ikaria, and Okinawa. Dairy consumption varies; Sardinians consume sheep and goat milk products; Adventists in Loma Linda include dairy in moderation; other Blue Zone populations consume little dairy.

Perhaps as notable as what Blue Zone inhabitants eat is how they eat. All five populations share strong social bonds around mealtimes; eating alone is uncommon. Most report stopping eating before feeling full (reflecting the Okinawan hara hachi bu practice). Alcohol consumption is present in four of five Blue Zones (Adventists abstain) but is low and usually confined to one to two glasses of wine with meals in a social setting, not consumed in isolation.

The dietary patterns of Blue Zone populations converge with the broader evidence base for healthy eating: minimally processed whole foods, plant-centred variety, moderate portions, and social pleasure in eating.`,
  },

  // ── Ingredient Knowledge (3) ──────────────────────────────────────────────

  {
    title:    'Olive Oil: Liquid Gold and How to Use It Well',
    category: 'ingredient-knowledge',
    summary:  'Extra-virgin olive oil is one of the most studied and celebrated ingredients in human nutrition. Understanding its chemistry, quality indicators, and culinary applications transforms how you cook.',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    content: `Olive oil has been produced in the Mediterranean basin for at least 8,000 years. Ancient civilisations prized it not merely as food but as fuel for lamps, as a medium for perfume and medicine, and as a symbol of peace and prosperity. The olive branch brought by the dove to Noah; the oil that anointed kings and athletes in ancient Greece; the sacred menorah oil of Jewish tradition — olive oil is woven into the foundational narratives of Western and Middle Eastern civilisation.

The chemistry of extra-virgin olive oil explains its culinary and nutritional supremacy. Oleic acid, a monounsaturated omega-9 fatty acid, constitutes 55–83% of olive oil's fat content. Unlike the polyunsaturated fats predominant in seed oils, oleic acid is relatively stable at cooking temperatures and resistant to oxidation, meaning that extra-virgin olive oil can be heated to moderate temperatures (170–190°C for most sautéing and stir-frying) without significant degradation — contrary to the persistent myth that olive oil "cannot be used for cooking."

Beyond oleic acid, extra-virgin olive oil contains hundreds of minor compounds that are responsible for both its distinctive flavour and its health properties. Oleocanthal, a phenolic compound, inhibits the same inflammatory pathways as ibuprofen, which may partly explain olive oil's association with lower rates of inflammatory diseases. Hydroxytyrosol and oleuropein are powerful antioxidants with demonstrated protective effects on low-density lipoprotein cholesterol oxidation — the process that initiates atherosclerotic plaque formation.

Quality in olive oil is determined by free acidity (extra-virgin must be below 0.8%) and by sensory characteristics: genuine extra-virgin oil should taste bitter (from polyphenols) and produce a distinct throat sensation on swallowing — a peppery "sting" that consumers unaccustomed to high-quality oil sometimes mistake for defect but is actually the marker of oleocanthal content. Flat, greasy, or "mild" olive oil has typically been degraded by poor storage, old age, or heat processing.

Storing olive oil correctly preserves its quality: away from heat, light, and air. Dark glass bottles or tin containers stored in a cool cupboard maintain quality far better than clear glass bottles on a sunlit countertop. Open bottles should ideally be used within three to four months.`,
  },

  {
    title:    'The Power of Legumes: Beans, Lentils, and Why They Matter',
    category: 'ingredient-knowledge',
    summary:  'Legumes are among the most nutritionally complete and environmentally efficient foods available. Yet they remain underused in many Western diets — here is why they deserve a daily place at the table.',
    image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    content: `The legume family — which includes all beans, lentils, peas, chickpeas, soybeans, and peanuts — has fed humanity across virtually every culture and continent for thousands of years. Yet in contemporary Western diets, legumes have been displaced from their traditional role as a dietary staple by animal protein and refined carbohydrates, to the significant detriment of both nutritional quality and environmental sustainability.

Legumes are nutritionally exceptional in their combined provision of protein and complex carbohydrate in a single food. A 100g serving of cooked lentils provides approximately 9g of protein, 20g of carbohydrate (of which over 8g is fibre), and substantial amounts of folate, iron, zinc, and magnesium — for approximately 115 calories. This nutritional density is difficult to match with other plant foods and challenging even for many animal foods when cost and environmental impact are factored in.

The protein in legumes is not complete — it is relatively low in the amino acid methionine — but this limitation is easily addressed by consuming legumes with grains (rice and beans, hummus and bread, lentil soup with bread), which together provide all essential amino acids. Traditional food cultures around the world developed these complementary combinations independently, not through nutritional calculation but through the practical experience of what satisfies and sustains.

Resistant starch and soluble fibre in legumes are among their most important functional properties. Unlike simple starches that are rapidly digested and absorbed, resistant starch passes into the large intestine intact, where it is fermented by gut bacteria into short-chain fatty acids — particularly butyrate, which serves as the primary energy source for colonocytes (cells lining the colon) and has anti-inflammatory and anti-cancer properties. Regular legume consumption is consistently associated with lower colorectal cancer risk in epidemiological studies.

The environmental case for legumes is equally compelling. Legumes fix atmospheric nitrogen through a symbiotic relationship with soil bacteria, reducing the need for synthetic nitrogen fertiliser. Their water and land footprint per gram of protein is dramatically lower than that of beef, pork, or chicken. A diet that replaces some animal protein with legume protein represents one of the most impactful personal choices for reducing dietary carbon footprint.`,
  },

  {
    title:    'Whole Grains vs. Refined Carbohydrates: What the Science Says',
    category: 'ingredient-knowledge',
    summary:  'Not all carbohydrates are equal. Understanding the structural and nutritional differences between whole grains and refined starches helps make sense of carbohydrate recommendations.',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    content: `Carbohydrates have occupied the most contested ground in nutritional debate for decades. The 1980s fat-phobia era led to widespread carbohydrate overconsumption; the subsequent low-carbohydrate backlash condemned all starchy foods indiscriminately. Both positions obscured a more nuanced reality: the source and processing of carbohydrate matters enormously, and whole grains represent a nutritionally distinct category from the refined starches that dominate industrial food production.

A whole grain is defined by the presence of all three anatomical parts: the bran (the outer fibrous layer), the germ (the nutrient-dense reproductive embryo), and the endosperm (the starchy core). Refining — the process that produces white flour, white rice, and other purified starches — removes the bran and germ, retaining only the endosperm. This process increases shelf life and produces a finer texture, but removes approximately 25% of the protein, 17 of the 24 key nutrients, and virtually all of the fibre.

The glycaemic index (GI) partially captures this difference. White bread typically has a GI of 70–75; whole-grain sourdough bread registers around 50–55. This reflects the slower digestion of intact grain structures — the physical matrix of fibre, protein, and starch in whole grains slows enzymatic access to starch molecules, producing a more gradual glucose release. Sustained, moderate blood glucose levels are associated with better satiety, reduced insulin secretion, lower risk of type 2 diabetes, and more stable energy throughout the day.

Beyond glycaemic response, whole grains provide nutrients that refined grains cannot. B vitamins (thiamine, niacin, B6, folate) lost in refining are sometimes added back to enriched white flour, but in fewer forms and lower quantities. Vitamin E, predominantly found in the germ, is lost in refining and rarely replaced. Magnesium, zinc, and selenium concentrations are substantially higher in whole grains. Phytochemicals including lignans, alkylresorcinols, and ferulic acid — found predominantly in the bran — have antioxidant and anti-inflammatory properties not present in refined counterparts.

Practical application: substituting whole-grain versions of existing staples — whole-wheat pasta, brown rice, oats instead of cornflakes, wholegrain bread — requires minimal cooking adjustment while substantially improving the nutritional profile of familiar meals.`,
  },

  // ── Meal Planning (3) ─────────────────────────────────────────────────────

  {
    title:    'Meal Prep 101: How to Eat Well Without Cooking Every Day',
    category: 'meal-planning',
    summary:  'Meal preparation — cooking in advance and storing portions for the week ahead — is one of the most effective practical strategies for maintaining healthy eating habits in a busy life.',
    image_url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80',
    content: `The most common reason people give for not eating healthily is lack of time. Preparing a nutritious meal from scratch after a long workday, when hunger is sharpening the appeal of fast food delivery, genuinely requires more willpower than most people reliably possess. Meal preparation — the practice of cooking in advance, typically on a weekend day, to create ready-to-assemble or fully cooked meals for the week ahead — addresses this problem structurally rather than relying on daily willpower.

Research supports the practical effectiveness of meal preparation as a dietary strategy. A 2017 study published in the International Journal of Behavioural Nutrition and Physical Activity found that adults who meal-prepped were significantly more likely to meet dietary guidelines for fruit and vegetable consumption and were less likely to be overweight — an association that held after controlling for other lifestyle factors. The directionality is debated (do organised people both meal-prep and eat better for other reasons?), but the correlation is robust.

Effective meal preparation begins with strategic planning. The most efficient approach is not to cook ten complete meals simultaneously but to prepare versatile components that can be combined differently across the week: a large batch of cooked grains (brown rice, quinoa, or farro) that serves as the base for bowls, salads, and stir-fries; roasted vegetables that go into wraps, alongside eggs for breakfast, and stirred into pasta; a batch of legumes or lean protein that appears in different guises each day.

Food safety during meal preparation deserves attention. Most cooked foods can be safely refrigerated for three to four days; extending beyond five days requires freezing. Portion into separate containers rather than storing in one large batch, as this reduces repeated temperature fluctuations from opening and resealing. Label with dates, especially if freezing. Foods most suitable for advance preparation: grains, legumes, roasted vegetables, soups and stews, marinated proteins (cook within 24 hours of marinating), and baked goods.

The psychological dimension of meal preparation should not be overlooked. Having prepared food visible and accessible in the refrigerator reduces the cognitive friction of deciding what to eat; the decision has already been made. This pre-commitment mechanism is one of the most reliable ways to align actual eating behaviour with dietary intentions.`,
  },

  {
    title:    'Eating Seasonally: Why Seasonal Produce Tastes Better and Costs Less',
    category: 'meal-planning',
    summary:  'Seasonal eating aligns meals with the natural production calendar, delivering better flavour, higher nutritional value, lower cost, and reduced environmental impact.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    content: `A supermarket in a wealthy country in the 21st century offers remarkable abundance year-round: strawberries in December, asparagus in October, butternut squash in April. This perpetual availability has dissolved the traditional rhythm of seasonal eating, the anticipation that made the first asparagus of spring or the first sweet corn of summer a genuine occasion. With this dissolution has come a flattening of flavour, a lengthening of supply chains, and a disconnection from the agricultural reality of food production.

The flavour case for seasonal eating is scientific as well as sentimental. Produce harvested at peak ripeness — which occurs in its natural season and locally — has higher sugar content, more developed aromatic compounds, and superior texture compared to produce harvested unripe for long-distance transport and cold-storage ripening. A tomato picked ripe from a summer field contains dramatically more lycopene, glutamic acid (responsible for its umami depth), and volatile aromatic compounds than one harvested green and ripened artificially in ethylene gas.

Nutritional value also peaks at harvest and declines during storage and transport. Vitamin C in spinach degrades at approximately 15% per day at room temperature; even refrigerated, significant losses occur within a week. Broccoli florets lose glucosinolates (cancer-preventive compounds) during cold storage. Eating produce harvested that day from a local farm or a well-organised farmers' market provides meaningfully higher nutritional value than the same produce purchased from a supermarket after weeks of transport and storage.

Economic logic supports seasonal eating strongly. In-season produce that is locally abundant is priced to sell quickly, resulting in the lowest prices of the year for that ingredient. Out-of-season produce requires long-distance shipping, climate-controlled storage, and premium retail positioning, all of which add cost. Strawberries are cheapest in June; squash is cheapest in October; root vegetables are cheapest in winter. Building meals around what is both in season and on offer aligns diet quality with budget efficiency.

A practical tool for seasonal eating is a regional seasonal produce calendar. Committing to including at least one seasonal ingredient in every meal — even in a small supporting role — gradually shifts cooking habits toward seasonality without requiring a wholesale change in how you shop or cook.`,
  },

  {
    title:    'Smart Grocery Shopping: Building a Healthy Kitchen Without Breaking the Budget',
    category: 'meal-planning',
    summary:  'The supermarket is an environment engineered to encourage impulsive, high-margin purchases. Navigating it with intention requires understanding both nutritional priorities and retail psychology.',
    image_url: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80',
    content: `The modern supermarket is a masterpiece of commercial psychology. Eye-level shelves feature the highest-margin products; end-of-aisle displays create an impression of special offers whether or not prices are actually reduced; essential items like milk and eggs are placed at the back of the store, ensuring customers walk past aisles of impulse purchases to reach them; the smell of fresh-baked bread is pumped towards the entrance to stimulate appetite and increase basket size. Understanding these dynamics is the first step to navigating retail environments with intention rather than impulse.

Shopping with a list is the single most evidence-supported behaviour for improving both dietary quality and food budget management. A 2015 study found that list users purchased significantly more fruit and vegetables and fewer unhealthy snacks than non-list users, and spent less total money despite buying more food. The mechanism is simple: a list externalises the decision-making process from the store environment (where commercial pressures operate) to the home environment (where health goals and budget constraints are most salient).

The perimeter-versus-centre heuristic — "shop the perimeter" — contains useful nutritional wisdom, though it oversimplifies. The perimeter typically houses fresh produce, meat, fish, dairy, and bakery; the centre aisles house processed and packaged foods. However, the centre aisles also contain canned legumes, dried pulses, whole grains, tinned fish, nuts, and spices — some of the most nutritionally valuable and cost-effective foods in the store. The more accurate principle is to seek whole or minimally processed foods wherever they appear and to be sceptical of foods with long ingredient lists.

Frozen vegetables deserve rehabilitation from their reputation as inferior to fresh. Frozen produce is typically frozen within hours of harvest, preserving nutritional value at that moment. Frozen peas, spinach, edamame, sweetcorn, and berries often contain more nutrients than the fresh equivalents that have been sitting in transport and refrigerated display for days. They are also cheaper, produce no waste, and require no preparation — a genuine nutrition win for busy households.

Staple pantry building — maintaining stocks of olive oil, canned legumes, whole grains, tinned tomatoes, good vinegar, dried spices, and nuts — enables nutritious cooking even when fresh shopping is not possible. A well-stocked pantry turns any fridge remnants into a meal and eliminates the conditions that lead to expensive convenience food purchases.`,
  },

];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to database…');
  const conn = await pool.getConnection();

  try {
    // Ensure image_url column exists (idempotent)
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'image_url'`
    );
    if (cols.length === 0) {
      await conn.query(
        `ALTER TABLE articles ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER category`
      );
      console.log('Added image_url column to articles table.\n');
    }

    // Find owner (prefer admin, fall back to any user)
    const [[owner]] = await conn.query(
      `SELECT id, username FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`
    );
    if (!owner) throw new Error('No admin user found. Run: npm run seed');
    console.log(`Owner: "${owner.username}" (id=${owner.id})\n`);

    // ── Sync image_url for already-existing articles ──────────────────────
    // Runs before the insert loop so previously seeded articles always get
    // the correct (deduplicated) image URL from the dataset above.
    console.log('Syncing images for existing articles…');
    for (const a of ARTICLES) {
      const [[row]] = await conn.query(
        'SELECT id FROM articles WHERE LOWER(title) = ?',
        [a.title.toLowerCase()]
      );
      if (row) {
        await conn.query('UPDATE articles SET image_url = ? WHERE id = ?', [a.image_url ?? null, row.id]);
      }
    }
    console.log('Image sync done.\n');

    // ── Insert new articles ────────────────────────────────────────────────
    const [existing] = await conn.query('SELECT title FROM articles');
    const existingTitles = new Set(existing.map((a) => a.title.toLowerCase()));

    let inserted = 0;
    let skipped  = 0;

    for (const a of ARTICLES) {
      if (existingTitles.has(a.title.toLowerCase())) {
        console.log(`  –  "${a.title}" already exists, skipping`);
        skipped++;
        continue;
      }

      await conn.query(
        `INSERT INTO articles (user_id, title, summary, category, image_url, content)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [owner.id, a.title, a.summary, a.category, a.image_url, a.content]
      );

      existingTitles.add(a.title.toLowerCase());
      console.log(`  ✓  [${a.category}] ${a.title}`);
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
