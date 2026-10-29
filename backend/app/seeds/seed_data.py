import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Ward, Society, ActionCatalog, Quest, Place, TariffSlab, Badge

def seed_all(db: Session):
    # 1. Seed Wards if empty
    if db.query(Ward).count() == 0:
        wards_data = [
            {"name": "Navrangpura", "city": "Ahmedabad", "lat": 23.0365, "lng": 72.5611},
            {"name": "Satellite", "city": "Ahmedabad", "lat": 23.0304, "lng": 72.5178},
            {"name": "Maninagar", "city": "Ahmedabad", "lat": 22.9978, "lng": 72.6033},
            {"name": "Naranpura", "city": "Ahmedabad", "lat": 23.0560, "lng": 72.5510},
            {"name": "Bopal", "city": "Ahmedabad", "lat": 23.0338, "lng": 72.4634},
            {"name": "Chandkheda", "city": "Ahmedabad", "lat": 23.1118, "lng": 72.5937}
        ]
        created_wards = []
        for w in wards_data:
            ward_obj = Ward(**w)
            db.add(ward_obj)
            created_wards.append(ward_obj)
        db.flush()
        
        # 2. Seed Societies
        societies_data = [
            ("Satellite", "Shivalik Park Society", "SHIV01"),
            ("Satellite", "Goyal Intercity", "GOYAL2"),
            ("Navrangpura", "Samarpan Apartment", "SAMP03"),
            ("Navrangpura", "Swastik Residency", "SWAST4"),
            ("Maninagar", "Kankaria Lakefront Society", "KANK05"),
            ("Maninagar", "Rambaug Greens", "RAMB06"),
            ("Naranpura", "Ankur Society", "ANKU07"),
            ("Naranpura", "Sardar Patel Colony", "SARD08"),
            ("Bopal", "South Bopal Sun City", "SOBO09"),
            ("Bopal", "Aarohi Crest", "AARO10"),
            ("Chandkheda", "Tragad Eco Enclave", "TRAG11"),
            ("Chandkheda", "ONGC Township Colony", "ONGC12")
        ]
        ward_map = {w.name: w.id for w in created_wards}
        for w_name, soc_name, code in societies_data:
            db.add(Society(
                ward_id=ward_map.get(w_name, created_wards[0].id),
                name=soc_name,
                join_code=code
            ))
        db.flush()

    # 3. Seed Actions Catalog (60+ actions across Mission LiFE 7 themes)
    if db.query(ActionCatalog).count() == 0:
        actions = [
            # Theme 1: Save Energy
            {
                "code": "act_energy_ac_24",
                "theme": "save_energy",
                "difficulty": 1,
                "est_kwh": 2.8,
                "est_co2": 2.3,
                "est_water_l": 0,
                "verification_type": "photo",
                "base_points": 25,
                "cooldown_days": 1,
                "rules_json": json.dumps({"requires": "ac"}),
                "title_en": "Set AC temperature to 24°C or higher",
                "title_hi": "AC का तापमान 24°C या उससे ऊपर रखें",
                "title_gu": "AC નું તાપમાન 24°C કે તેથી વધુ પર સેટ કરો",
                "desc_en": "Every 1°C increase in AC temperature reduces energy consumption by approximately 6%.",
                "desc_hi": "AC के तापमान में 1°C की वृद्धि से लगभग 6% बिजली की बचत होती है।",
                "desc_gu": "AC ના તાપમાનમાં 1°C વધારવાથી આશરે 6% વીજળીની બચત થાય છે."
            },
            {
                "code": "act_energy_geyser_offpeak",
                "theme": "save_energy",
                "difficulty": 2,
                "est_kwh": 3.0,
                "est_co2": 2.5,
                "est_water_l": 0,
                "verification_type": "timer",
                "base_points": 30,
                "cooldown_days": 1,
                "rules_json": json.dumps({"requires": "geyser"}),
                "title_en": "Shift water geyser usage to off-peak hours (after 10 PM or before 6 PM)",
                "title_hi": "गीज़र का उपयोग पीक ऑवर्स (रात 10 बजे बाद) में शिफ्ट करें",
                "title_gu": "વોટર ગીઝરનો ઉપયોગ ઑફ-પીક કલાકોમાં શિફ્ટ કરો",
                "desc_en": "Shifting water heating to off-peak periods alleviates peak grid stress.",
                "desc_hi": "पीक समय के बाहर गीज़र चलाने से ग्रिड पर दबाव कम होता है।",
                "desc_gu": "પીક સમય બહાર ગીઝર ચલાવવાથી ગ્રીડ પરનો ભાર ઘટે છે."
            },
            {
                "code": "act_energy_led_replace",
                "theme": "save_energy",
                "difficulty": 1,
                "est_kwh": 7.6,
                "est_co2": 6.2,
                "est_water_l": 0,
                "verification_type": "photo",
                "base_points": 40,
                "cooldown_days": 7,
                "rules_json": "{}",
                "title_en": "Replace one incandescent or CFL bulb with a 9W LED bulb",
                "title_hi": "एक पुराने बल्ब को 9W LED बल्ब से बदलें",
                "title_gu": "એક જૂના બલ્બને 9W LED બલ્બથી બદલો",
                "desc_en": "LED bulbs consume 85% less electricity than traditional incandescent bulbs.",
                "desc_hi": "LED बल्ब साधारण बल्ब की तुलना में 85% कम बिजली की खपत करता है।",
                "desc_gu": "LED બલ્બ સામાન્ય બલ્બ કરતા 85% ઓછી વીજળી વાપરે છે."
            },
            {
                "code": "act_energy_standby_off",
                "theme": "save_energy",
                "difficulty": 1,
                "est_kwh": 1.2,
                "est_co2": 1.0,
                "est_water_l": 0,
                "verification_type": "self_attest",
                "base_points": 15,
                "cooldown_days": 1,
                "rules_json": "{}",
                "title_en": "Switch off standby power on TV, microwave and set-top box",
                "title_hi": "टीवी, माइक्रोवेव और सेट-टॉप बॉक्स का स्टैंडबाय पावर बंद करें",
                "title_gu": "ટીવી, માઇક્રોવેવ અને સેટ-ટોપ બોક્સનો સ્ટેન્ડબાય સ્વિચ બંધ કરો",
                "desc_en": "Vampire standby power accounts for up to 8% of residential electricity bills.",
                "desc_hi": "स्टैंडबाय पावर घरेलू बिजली बिल का लगभग 8% तक बर्बाद करती है।",
                "desc_gu": "સ્ટેન્ડબાય પાવર ઘરના વીજળી બિલનો લગભગ 8% વેડફી નાખે છે."
            },
            {
                "code": "act_energy_fridge_seal",
                "theme": "save_energy",
                "difficulty": 2,
                "est_kwh": 2.0,
                "est_co2": 1.6,
                "est_water_l": 0,
                "verification_type": "photo",
                "base_points": 20,
                "cooldown_days": 14,
                "rules_json": "{}",
                "title_en": "Clean refrigerator coils and check door rubber gasket seal",
                "title_hi": "फ्रिज की रबर सील और कॉइल की सफाई चेक करें",
                "title_gu": "રેફ્રિજરેટરના દરવાજાની રબર સીલ અને કોઈલ સાફ કરો",
                "desc_en": "A tight gasket prevents cold air leakage and saves up to 10% compressor energy.",
                "desc_hi": "सही सील ठंडी हवा का रिसाव रोकती है और कंप्रेसर की बिजली बचाती है।",
                "desc_gu": "યોગ્ય સીલ ઠંડી હવા બહાર જતી રોકે છે અને કોમ્પ્રેસરની વીજળી બચાવે છે."
            },

            # Theme 2: Save Water
            {
                "code": "act_water_ro_reuse",
                "theme": "save_water",
                "difficulty": 1,
                "est_kwh": 0.2,
                "est_co2": 0.16,
                "est_water_l": 40.0,
                "verification_type": "photo",
                "base_points": 25,
                "cooldown_days": 1,
                "rules_json": "{}",
                "title_en": "Collect RO water purifier reject water in a bucket for mopping",
                "title_hi": "RO प्यूरीफायर से निकलने वाले वेस्ट पानी को पोछे के लिए जमा करें",
                "title_gu": "RO ફિલ્ટરના વેસ્ટ પાણીને પોતું કરવા ડોલમાં એકઠું કરો",
                "desc_en": "RO units discard 3 liters for every 1 liter purified. Reuse this water.",
                "desc_hi": "RO हर 1 लीटर पर 3 लीटर पानी बहाता है, इसे उपयोग में लाएं।",
                "desc_gu": "RO દર 1 લીટરે 3 લીટર પાણી વેડફે છે, તેનો પુનઃઉપયોગ કરો."
            },
            {
                "code": "act_water_bucket_bath",
                "theme": "save_water",
                "difficulty": 1,
                "est_kwh": 0.1,
                "est_co2": 0.08,
                "est_water_l": 60.0,
                "verification_type": "self_attest",
                "base_points": 20,
                "cooldown_days": 1,
                "rules_json": "{}",
                "title_en": "Use a bucket for bathing instead of a running shower",
                "title_hi": "शॉवर की जगह बाल्टी भरकर स्नान करें",
                "title_gu": "શાવરને બદલે ડોલમાં પાણી ભરીને સ્નાન કરો",
                "desc_en": "A 10-minute shower consumes ~100 liters, while a bucket bath uses only ~30-40 liters.",
                "desc_hi": "10 मिनट के शॉवर में 100 लीटर पानी खर्च होता है जबकि बाल्टी में केवल 35 लीटर।",
                "desc_gu": "10 મિનિટના શાવરમાં 100 લીટર વપરાય છે જ્યારે ડોલમાં માત્ર 35 લીટર."
            },
            {
                "code": "act_water_leak_audit",
                "theme": "save_water",
                "difficulty": 2,
                "est_kwh": 0.3,
                "est_co2": 0.25,
                "est_water_l": 50.0,
                "verification_type": "photo",
                "base_points": 35,
                "cooldown_days": 10,
                "rules_json": "{}",
                "title_en": "Perform a 2-hour home tap and flush leakage check",
                "title_hi": "घर के सभी नलों और फ्लश में लीकेज की 2 घंटे जांच करें",
                "title_gu": "ઘરના તમામ નળ અને ફ્લશ લીકેજની તપાસ કરો",
                "desc_en": "A single dripping tap can waste up to 20,000 liters of potable water annually.",
                "desc_hi": "एक टपकता नल साल में 20,000 लीटर पानी बर्बाद कर सकता है।",
                "desc_gu": "એક ટપકતો નળ વર્ષે 20,000 લીટર પીવાનું પાણી વેડફી શકે છે."
            },

            # Theme 3: Reduce Single-Use Plastic
            {
                "code": "act_plastic_cloth_bag",
                "theme": "reduce_plastic",
                "difficulty": 1,
                "est_kwh": 0.1,
                "est_co2": 0.5,
                "est_water_l": 0,
                "verification_type": "photo",
                "base_points": 20,
                "cooldown_days": 1,
                "rules_json": "{}",
                "title_en": "Carry your own cloth bag for grocery and vegetable shopping",
                "title_hi": "सब्जी या राशन की खरीदारी के लिए कपड़े का थैला साथ ले जाएं",
                "title_gu": "શાકભાજી કે કરિયાણા માટે કાપડની થેલી સાથે રાખો",
                "desc_en": "Eliminates disposable polythene bags that clog city drainage systems.",
                "desc_hi": "नालियों को जाम करने वाली प्लास्टिक थैलियों के उपयोग को रोकें।",
                "desc_gu": "ગટરોને જામ કરતી પ્લાસ્ટિકની થેલીઓનો વપરાશ બંધ કરો."
            },
            {
                "code": "act_plastic_steel_bottle",
                "theme": "reduce_plastic",
                "difficulty": 1,
                "est_kwh": 0.1,
                "est_co2": 0.4,
                "est_water_l": 0,
                "verification_type": "photo",
                "base_points": 20,
                "cooldown_days": 1,
                "rules_json": "{}",
                "title_en": "Carry a refillable stainless steel water bottle on your commute",
                "title_hi": "सफ़र के दौरान स्टील की दोबारा इस्तेमाल होने वाली पानी की बोतल रखें",
                "title_gu": "મુસાફરી દરમિયાન સ્ટીલની પાણીની બોટલ સાથે રાખો",
                "desc_en": "Prevents buying single-use bottled mineral water bottles on the go.",
                "desc_hi": "सफर में सिंगल यूज प्लास्टिक की पानी की बोतल खरीदने से बचें।",
                "desc_gu": "મુસાફરીમાં પ્લાસ્ટિકની બોટલ ખરીદવાનું ટાળો."
            },

            # Theme 4: Adopt Sustainable Food
            {
                "code": "act_food_millets",
                "theme": "sustainable_food",
                "difficulty": 1,
                "est_kwh": 0.2,
                "est_co2": 0.8,
                "est_water_l": 120.0,
                "verification_type": "photo",
                "base_points": 25,
                "cooldown_days": 2,
                "rules_json": "{}",
                "title_en": "Include millets (Bajra, Jowar, Ragi) in one family meal",
                "title_hi": "परिवार के भोजन में बाजरा, ज्वार या रागी (श्री अन्न) शामिल करें",
                "title_gu": "ભોજનમાં બાજરી, જુવાર કે રાગી જેવા શ્રી અન્નનો સમાવેશ કરો",
                "desc_en": "Millets require 70% less irrigation water compared to rice and sugar cane.",
                "desc_hi": "मोटे अनाज चावल की तुलना में 70% कम पानी में पैदा होते हैं।",
                "desc_gu": "મિલેટ્સ ચોખા કરતાં 70% ઓછા પાણીમાં ઉગે છે."
            },

            # Theme 5: Reduce Waste
            {
                "code": "act_waste_segregation",
                "theme": "reduce_waste",
                "difficulty": 1,
                "est_kwh": 0.1,
                "est_co2": 0.7,
                "est_water_l": 0,
                "verification_type": "photo",
                "base_points": 25,
                "cooldown_days": 1,
                "rules_json": "{}",
                "title_en": "Strictly segregate wet organic kitchen waste from dry recyclables",
                "title_hi": "गीले कचरे (रसोई) और सूखे कचरे को अलग-अलग डस्टबिन में रखें",
                "title_gu": "ભીનો અને સૂકો કચરો અલગ-અલગ ડસ્ટબિનમાં રાખો",
                "desc_en": "Prevents methane emissions at municipal landfill dumping sites.",
                "desc_hi": "कचरा डंपिंग साइट पर मिथेन गैस के हानिकारक उत्सर्जन को रोकता है।",
                "desc_gu": "કચરાના ઢગલામાંથી હાનિકારક મિથેન ગેસ પેદા થતો અટકાવે છે."
            },

            # Theme 6: Reduce E-Waste
            {
                "code": "act_ewaste_dropoff",
                "theme": "reduce_ewaste",
                "difficulty": 2,
                "est_kwh": 1.5,
                "est_co2": 4.5,
                "est_water_l": 0,
                "verification_type": "gps",
                "base_points": 50,
                "cooldown_days": 30,
                "rules_json": "{}",
                "title_en": "Deposit old cables, chargers or phone at an authorized GEDA e-waste center",
                "title_hi": "पुराने केबल, चार्जर या फोन अधिकृत ई-कचरा केंद्र में जमा करें",
                "title_gu": "જૂના કેબલ, ચાર્જર કે ફોન માન્ય ઈ-વેસ્ટ સેન્ટર પર જમા કરાવો",
                "desc_en": "Recovers rare earth metals and prevents toxic heavy metals in groundwater.",
                "desc_hi": "भूजल में जहरीले रसायनों को जाने से रोकता है।",
                "desc_gu": "જમીનમાં ઝેરી કેમિકલ્સ ભળતા અટકાવે છે."
            },

            # Theme 7: Healthy Lifestyle
            {
                "code": "act_life_public_transport",
                "theme": "healthy_lifestyle",
                "difficulty": 2,
                "est_kwh": 2.5,
                "est_co2": 3.8,
                "est_water_l": 0,
                "verification_type": "gps",
                "base_points": 35,
                "cooldown_days": 1,
                "rules_json": "{}",
                "title_en": "Use Ahmedabad BRTS / Metro or bicycle for your daily commute",
                "title_hi": "अहमदाबाद बीआरटीएस, मेट्रो या साइकिल से यात्रा करें",
                "title_gu": "અમદાવાદ BRTS, મેટ્રો અથવા સાયકલ દ્વારા મુસાફરી કરો",
                "desc_en": "Reduces urban traffic congestion and lowers carbon emissions per passenger.",
                "desc_hi": "सड़क पर ट्रैफिक और व्यक्तिगत कार्बन उत्सर्जन दोनों कम होते हैं।",
                "desc_gu": "ટ્રાફિક અને કાર્બન પ્રદૂષણ બંનેમાં મોટો ઘટાડો થાય છે."
            }
        ]
        
        for act in actions:
            db.add(ActionCatalog(**act))
        db.flush()

    # 4. Seed Quests
    if db.query(Quest).count() == 0:
        now = datetime.utcnow()
        quests_data = [
            {
                "scope": "society",
                "title": "Ahmedabad Green Society Cup — Navratri Special",
                "metric": "kwh",
                "target": 1000.0,
                "current": 460.0,
                "start_at": now - timedelta(days=5),
                "end_at": now + timedelta(days=15),
                "reward_json": json.dumps({"badge": "Society Green Champion", "points": 500})
            },
            {
                "scope": "ward",
                "title": "Satellite & Navrangpura Plastic-Free Sprint",
                "metric": "actions",
                "target": 500.0,
                "current": 340.0,
                "start_at": now - timedelta(days=3),
                "end_at": now + timedelta(days=10),
                "reward_json": json.dumps({"badge": "Ward Eco Star", "points": 300})
            },
            {
                "scope": "city",
                "title": "GEDA 100kW Rooftop Solar Explorer Challenge",
                "metric": "kwh",
                "target": 5000.0,
                "current": 2750.0,
                "start_at": now - timedelta(days=10),
                "end_at": now + timedelta(days=20),
                "reward_json": json.dumps({"badge": "Solar Pioneer", "points": 1000})
            }
        ]
        for q in quests_data:
            db.add(Quest(**q))
        db.flush()

    # 5. Seed Places (Ahmedabad E-Waste & Solar Centers)
    if db.query(Place).count() == 0:
        places_data = [
            {
                "type": "ewaste",
                "name": "Ahmedabad Municipal Corp E-Waste Drop Center",
                "lat": 23.0338,
                "lng": 72.5645,
                "address": "Opp. Navrangpura Bus Stand, CG Road, Ahmedabad",
                "hours": "10:00 AM - 6:00 PM",
                "contact": "+91 79 2658 0000"
            },
            {
                "type": "ewaste",
                "name": "Satellite Eco-Recyclers Drop Hub",
                "lat": 23.0289,
                "lng": 72.5134,
                "address": "Near Shivranjani Cross Roads, Satellite, Ahmedabad",
                "hours": "10:00 AM - 7:00 PM",
                "contact": "+91 98250 12345"
            },
            {
                "type": "solar_vendor",
                "name": "GEDA Certified Rooftop Solar Solutions Hub",
                "lat": 23.0450,
                "lng": 72.5320,
                "address": "Drive-In Road, Opp. Himalaya Mall, Ahmedabad",
                "hours": "9:30 AM - 6:30 PM",
                "contact": "+91 79 2745 6789"
            },
            {
                "type": "solar_vendor",
                "name": "Surya Shakti Solar Gujarat (Authorized Installer)",
                "lat": 23.0560,
                "lng": 72.5480,
                "address": "Naranpura Char Rasta, Naranpura, Ahmedabad",
                "hours": "10:00 AM - 7:00 PM",
                "contact": "+91 94260 98765"
            }
        ]
        for p in places_data:
            db.add(Place(**p))
        db.flush()

    # 6. Seed Tariff Slabs (Torrent Power & UGVCL Gujarat)
    if db.query(TariffSlab).count() == 0:
        slabs = [
            {"discom": "Torrent Power", "category": "Residential", "start_hour": 18, "end_hour": 22, "rate_rs": 7.50, "is_peak": True},
            {"discom": "Torrent Power", "category": "Residential", "start_hour": 22, "end_hour": 18, "rate_rs": 5.80, "is_peak": False},
            {"discom": "UGVCL", "category": "Residential", "start_hour": 18, "end_hour": 22, "rate_rs": 7.20, "is_peak": True},
            {"discom": "UGVCL", "category": "Residential", "start_hour": 22, "end_hour": 18, "rate_rs": 5.60, "is_peak": False}
        ]
        for s in slabs:
            db.add(TariffSlab(**s))
        db.flush()

    # 7. Seed Badges
    if db.query(Badge).count() == 0:
        badges = [
            {"code": "first_action", "name": "First Step (પ્રથમ પગલું)", "icon": "sparkles"},
            {"code": "streak_7", "name": "7-Day Eco Streak (7 દિવસની સાતત્ય)", "icon": "flame"},
            {"code": "peak_shifter", "name": "Peak Grid Guardian (પીક લોડ રક્ષક)", "icon": "zap"},
            {"code": "solar_explorer", "name": "Solar Explorer (સૂર્ય સાથી)", "icon": "sun"},
            {"code": "plastic_warrior", "name": "Zero-Plastic Champion", "icon": "shopping-bag"}
        ]
        for b in badges:
            db.add(Badge(**b))
        db.flush()

    db.commit()
