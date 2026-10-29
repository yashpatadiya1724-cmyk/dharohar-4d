from typing import List, Tuple, Optional
from app.schemas import CoachAskResponse

# Curated Mission LiFE Knowledge Base
KB_DOCUMENTS = [
    {
        "id": "kb_ac_24",
        "theme": "Energy Saving",
        "title": "Air Conditioner 24°C Rule",
        "content_en": "Setting your AC thermostat to 24°C instead of 18°C saves approximately 6% electricity per degree Celsius. In Gujarat climate, setting AC to 24°C-25°C with a ceiling fan delivers optimal comfort while saving ~18-24% on monthly AC electricity consumption.",
        "content_hi": "AC का तापमान 18°C की जगह 24°C पर रखने से प्रति डिग्री लगभग 6% बिजली की बचत होती है। पंखे के साथ 24°C पर चलाने से महीने में 18-24% तक बिजली बचती है।",
        "content_gu": "AC નું તાપમાન 18°C ને બદલે 24°C પર રાખવાથી દર 1 ડિગ્રીએ આશરે 6% વીજળીની બચત થાય છે. પંખા સાથે 24°C રાખવાથી શ્રેષ્ઠ ઠંડક અને મહત્તમ બચત મળે છે.",
        "action_id": "act_energy_ac_24",
        "action_title": "Set AC to 24°C / AC 24 ડિગ્રી પર ચલાવો"
    },
    {
        "id": "kb_peak_shifting",
        "theme": "Peak Load Optimization",
        "title": "Shift Heavy Load from Peak Hours (6 PM - 10 PM)",
        "content_en": "During evening hours (6:00 PM to 10:00 PM), state grid demand peaks in Gujarat. Shifting heavy appliances like water geysers, washing machines, and agricultural/water pumps to night (after 10 PM) or midday off-peak helps grid stability and avoids peak surcharge.",
        "content_hi": "शाम 6 बजे से रात 10 बजे के बीच ग्रिड पर सबसे ज्यादा लोड होता है। गीज़र और वाशिंग मशीन को रात 10 बजे के बाद या दोपहर में चलाने से पीक लोड कम होता है।",
        "content_gu": "સાંજે 6 થી રાત્રે 10 વાગ્યા સુધી ગ્રીડ પર સૌથી વધુ લોડ હોય છે. ગીઝર અને વોશિંગ મશીન રાત્રે 10 પછી ચલાવવાથી ગ્રીડને રાહત અને વીજળી બચત થાય છે.",
        "action_id": "act_energy_geyser_offpeak",
        "action_title": "Run Geyser Off-Peak / ગીઝર ઑફ-પીક ચલાવો"
    },
    {
        "id": "kb_solar_pm_surya_ghar",
        "theme": "Rooftop Solar",
        "title": "PM Surya Ghar Muft Bijli Yojana Gujarat",
        "content_en": "PM Surya Ghar scheme provides direct subsidy for residential rooftop solar: ₹30,000 for 1 kW, ₹60,000 for 2 kW, and ₹78,000 for 3 kW or higher systems. In Gujarat, a 2-3 kW system produces 10-12 units (kWh) per day, offsetting ₹1,500 - ₹2,500 from monthly electricity bills.",
        "content_hi": "पीएम सूर्य घर योजना के तहत 1 kW पर ₹30,000, 2 kW पर ₹60,000 और 3 kW या उससे अधिक पर ₹78,000 की केंद्रीय सब्सिडी मिलती है। 2-3 kW सोलर सिस्टम से हर महीने ₹1500-₹2500 की बचत होती है।",
        "content_gu": "પીએમ સૂર્ય ઘર યોજના હેઠળ 1 kW માટે ₹30,000, 2 kW માટે ₹60,000 અને 3 kW કે તેથી વધુ માટે ₹78,000 સબસિડી મળે છે. 2-3 kW સિસ્ટમથી દર મહિને ₹1500-₹2500 ની બચત થાય છે.",
        "action_id": "act_solar_survey",
        "action_title": "Check Solar Feasibility / સોલાર કેલ્ક્યુલેટર ચેક કરો"
    },
    {
        "id": "kb_led_retrofit",
        "theme": "Energy Saving",
        "title": "Replace Incandescent and CFL Bulbs with 9W LED",
        "content_en": "A 9W LED bulb gives equal light to a 60W incandescent bulb or 18W CFL bulb, consuming 80-85% less power. Replacing 5 old bulbs saves approximately 38 kWh and ₹230 per month.",
        "content_hi": "9W LED बल्ब 60W के साधारण बल्ब जितनी ही रोशनी देता है और 85% कम बिजली खाता है। 5 बल्ब बदलने से हर महीने लगभग 38 यूनिट बिजली बचती है।",
        "content_gu": "9W LED બલ્બ 60W ના સામાન્ય બલ્બ જેટલો જ પ્રકાશ આપે છે અને 85% ઓછી વીજળી વાપરે છે. 5 બલ્બ બદલવાથી મહિને 38 યુનિટ બચે છે.",
        "action_id": "act_energy_led_replace",
        "action_title": "Switch to 9W LED / 9W LED બલ્બ લગાવો"
    },
    {
        "id": "kb_water_ro_reuse",
        "theme": "Save Water",
        "title": "RO Reject Water Reuse",
        "content_en": "Standard household RO water purifiers reject 2-3 litres of water for every 1 litre of pure drinking water. Collecting this reject water in a bucket allows it to be used for mopping floors, watering plants, or flushing.",
        "content_hi": "RO वाटर प्यूरीफायर 1 लीटर पीने के पानी के बदले 2-3 लीटर पानी बाहर बहा देता है। इस पानी को बाल्टी में इकट्ठा करके पोछा लगाने या पौधों में डालने के लिए इस्तेमाल करें।",
        "content_gu": "RO ફિલ્ટર 1 લીટર પીવાના પાણી માટે 2-3 લીટર પાણી વેડફે છે. આ પાણી ડોલમાં એકઠું કરીને પોતા કરવા કે છોડવાઓમાં વાપરવું જોઈએ.",
        "action_id": "act_water_ro_reuse",
        "action_title": "Reuse RO Reject Water / RO વેસ્ટ પાણીનો સદુપયોગ"
    },
    {
        "id": "kb_plastic_cloth_bag",
        "theme": "Reduce Single-Use Plastic",
        "title": "Always Carry a Reusable Cloth Bag",
        "content_en": "Single-use plastic bags take 500+ years to degrade and choke urban drainage. Keeping a foldable cotton or cloth bag in your vehicle or handbag avoids an average of 40-50 plastic bags per household every month.",
        "content_hi": "सिंगल-यूज़ प्लास्टिक बैग नालियों को जाम करते हैं। बाज़ार जाते समय कपड़े का थैला साथ रखने से हर महीने घर में 40-50 प्लास्टिक थैलियों की बचत होती है।",
        "content_gu": "શાકભાજી કે કરિયાણું લેવા જતી વખતે કાપડની થેલી સાથે રાખો, જેથી દર મહિને 40-50 પ્લાસ્ટિક બેગનો કચરો અટકાવી શકાય.",
        "action_id": "act_plastic_cloth_bag",
        "action_title": "Carry Reusable Cloth Bag / કાપડની થેલી વાપરો"
    }
]

def search_coach_kb(query: str, lang: str = "en") -> CoachAskResponse:
    q_lower = query.lower()
    
    # Simple semantic keyword scoring
    best_match = None
    best_score = -1
    
    keywords_mapping = {
        "ac": ["ac", "air conditioner", "temp", "cool", "degree", "तापमान", "એસી", "ઠંડક"],
        "solar": ["solar", "roof", "rooftop", "sun", "panel", "surya", "subsidy", "સોલાર", "સબસિડી", "छत"],
        "peak": ["peak", "shift", "geyser", "evening", "time", "load", "गीज़र", "પીક", "સાંજ"],
        "led": ["led", "bulb", "light", "tube", "बल्ब", "બલ્બ", "લાઈટ"],
        "water": ["water", "ro", "tap", "leak", "bath", "bucket", "पानी", "પાણી"],
        "plastic": ["plastic", "bag", "bottle", "single-use", "पॉलिथीन", "પ્લાસ્ટિક", "થેલી"]
    }
    
    for doc in KB_DOCUMENTS:
        score = 0
        doc_id = doc["id"]
        for category, words in keywords_mapping.items():
            if any(w in q_lower for w in words):
                if category in doc_id:
                    score += 5
        if any(term in doc["content_en"].lower() for term in q_lower.split()):
            score += 2
        if score > best_score:
            best_score = score
            best_match = doc
            
    if not best_match or best_score == 0:
        best_match = KB_DOCUMENTS[0] # Fallback to AC 24 rule
        
    content_key = f"content_{lang}" if f"content_{lang}" in best_match else "content_en"
    answer_text = best_match[content_key]
    
    sources = [
        f"Mission LiFE National Guidelines — {best_match['theme']}",
        f"Bureau of Energy Efficiency (BEE) & GEDA Guidance Note"
    ]
    
    return CoachAskResponse(
        answer=answer_text,
        sources=sources,
        suggested_action_id=best_match.get("action_id"),
        suggested_action_title=best_match.get("action_title")
    )
