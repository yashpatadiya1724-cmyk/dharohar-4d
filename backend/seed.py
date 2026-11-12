import os
import json
import sqlite3
import hashlib
from pathlib import Path
import imagehash
from PIL import Image, ImageDraw

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import docx
from pptx import Presentation

try:
    from app.config import DATABASE_URL, UPLOAD_PATH
    from app.db import get_db_connection, init_db, sync_fts_insert
    from app.extract import extract_pdf, extract_docx, extract_pptx
except ImportError:
    from backend.app.config import DATABASE_URL, UPLOAD_PATH
    from backend.app.db import get_db_connection, init_db, sync_fts_insert
    from backend.app.extract import extract_pdf, extract_docx, extract_pptx

def make_sample_image(filename: str, text: str, color=(70, 130, 180)):
    filepath = UPLOAD_PATH / filename
    img = Image.new("RGB", (800, 600), color=color)
    draw = ImageDraw.Draw(img)
    draw.text((40, 280), text, fill=(255, 255, 255))
    img.save(filepath, format="JPEG")
    with open(filepath, "rb") as f:
        data = f.read()
    sha = hashlib.sha256(data).hexdigest()
    try:
        phash = str(imagehash.phash(Image.open(filepath)))
    except Exception:
        phash = None
    return str(filepath), sha, phash

def make_sample_pdf(filename: str, title: str, paragraphs: list):
    filepath = UPLOAD_PATH / filename
    doc = SimpleDocTemplate(str(filepath), pagesize=letter)
    styles = getSampleStyleSheet()
    story = [
        Paragraph(title, styles["Title"]),
        Spacer(1, 14)
    ]
    for p in paragraphs:
        story.append(Paragraph(p, styles["Normal"]))
        story.append(Spacer(1, 10))
    doc.build(story)
    with open(filepath, "rb") as f:
        data = f.read()
    sha = hashlib.sha256(data).hexdigest()
    # Extract text using pdfplumber to get exact extracted text
    extracted = extract_pdf(str(filepath)) or "\n".join(paragraphs)
    return str(filepath), sha, extracted

def make_sample_docx(filename: str, title: str, paragraphs: list):
    filepath = UPLOAD_PATH / filename
    doc = docx.Document()
    doc.add_heading(title, level=0)
    for p in paragraphs:
        doc.add_paragraph(p)
    doc.save(str(filepath))
    with open(filepath, "rb") as f:
        data = f.read()
    sha = hashlib.sha256(data).hexdigest()
    extracted = extract_docx(str(filepath)) or "\n".join(paragraphs)
    return str(filepath), sha, extracted

def make_sample_pptx(filename: str, title: str, slides: list):
    filepath = UPLOAD_PATH / filename
    prs = Presentation()
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    slide.shapes.title.text = title
    slide.placeholders[1].text = "Dharohar 4D Heritage Documentation Series"

    bullet_layout = prs.slide_layouts[1]
    for heading, text in slides:
        s = prs.slides.add_slide(bullet_layout)
        s.shapes.title.text = heading
        s.placeholders[1].text = text
    prs.save(str(filepath))
    with open(filepath, "rb") as f:
        data = f.read()
    sha = hashlib.sha256(data).hexdigest()
    extracted = extract_pptx(str(filepath))
    return str(filepath), sha, extracted

def make_sample_text_file(filename: str, content: str):
    filepath = UPLOAD_PATH / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    with open(filepath, "rb") as f:
        data = f.read()
    sha = hashlib.sha256(data).hexdigest()
    return str(filepath), sha, content

def seed():
    print("Initializing database...")
    init_db()
    conn = get_db_connection()
    cur = conn.cursor()

    # Clear existing data to ensure idempotent seed
    cur.execute("DELETE FROM reports;")
    cur.execute("DELETE FROM reviews;")
    cur.execute("DELETE FROM models3d;")
    cur.execute("DELETE FROM sources;")
    cur.execute("DELETE FROM claims;")
    cur.execute("DELETE FROM resources;")
    cur.execute("DELETE FROM monuments;")
    try:
        cur.execute("INSERT INTO resources_fts(resources_fts) VALUES('delete-all');")
    except Exception as e:
        print(f"FTS clear warning: {e}")
    conn.commit()

    print("Seeding 5 Gujarat Monuments...")
    monuments = [
        (1, "Adalaj Stepwell", "अडालज की वाव", "અડાલજની વાવ", "Gandhinagar", "Gujarat", "15th Century (1498 CE)", 23.1667, 72.5801),
        (2, "Rani ki Vav", "रानी की वाव", "રાણીની વાવ", "Patan", "Gujarat", "11th Century (1063 CE)", 23.8589, 72.1017),
        (3, "Modhera Sun Temple", "मोढेरा सूर्य मंदिर", "મોઢેરા સૂર્ય मंदिर", "Mehsana", "Gujarat", "11th Century (1026 CE)", 23.5835, 72.1330),
        (4, "Sidi Saiyyed Mosque", "सीदी सैयद मस्जिद", "સીદી સૈયદની જાળી", "Ahmedabad", "Gujarat", "16th Century (1573 CE)", 23.0282, 72.5807),
        (5, "Sabarmati Ashram", "साबरमती आश्रम", "સાબરમતી આશ્રમ", "Ahmedabad", "Gujarat", "20th Century (1917 CE)", 23.0605, 72.5808),
    ]
    cur.executemany(
        """INSERT INTO monuments (id, name_en, name_hi, name_gu, district, state, period, lat, lon)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        monuments
    )
    conn.commit()

    print("Generating genuine binary files (PDFs, DOCX, PPTX) and photos...")
    img1_path, img1_sha, img1_phash = make_sample_image("adalaj_entrance.jpg", "Adalaj Stepwell Main Pavilion View", (180, 120, 70))
    img2_path, img2_sha, img2_phash = make_sample_image("adalaj_carving.jpg", "Adalaj Stepwell Floral Carvings", (140, 100, 60))
    img3_path, img3_sha, img3_phash = make_sample_image("rani_vav_apsaras.jpg", "Rani ki Vav Sculptures & Apsaras", (100, 120, 160))
    img4_path, img4_sha, img4_phash = make_sample_image("modhera_kund.jpg", "Modhera Sun Temple Surya Kund Stepped Tank", (190, 140, 80))
    img5_path, img5_sha, img5_phash = make_sample_image("sidi_saiyyed_jali.jpg", "Tree of Life Stone Lattice Screen", (80, 130, 90))

    # Real PDF 1: Adalaj Survey
    doc1_path, doc1_sha, doc1_text = make_sample_pdf(
        "adalaj_asi_survey.pdf",
        "Archaeological Survey of India: Adalaj Stepwell Monograph No. 44",
        [
            "The Adalaj stepwell was built in 1498 by Queen Rudabai in memory of Rana Veer Singh.",
            "It features Solanki style subterranean five-storey architecture with elaborate octagonal shafts.",
            "Temperature inside the well is about 5 degrees cooler than exterior air."
        ]
    )

    # Real DOCX: Rani ki Vav
    doc2_path, doc2_sha, doc2_text = make_sample_docx(
        "rani_vav_unesco_dossier.docx",
        "UNESCO World Heritage Documentation Dossier: Rani ki Vav (Queen's Stepwell) at Patan",
        [
            "Constructed during the rule of the Chaulukya dynasty, located on the banks of Saraswati river.",
            "It was commissioned by Queen Udayamati around 1063 CE in memory of King Bhima I.",
            "Over 500 principal sculptures and over a thousand minor ones adorn the seven stepped levels."
        ]
    )

    # Real PPTX: Modhera Sun Temple
    doc3_path, doc3_sha, doc3_text = make_sample_pptx(
        "modhera_sun_temple_study.pptx",
        "Modhera Sun Temple Architectural Analysis",
        [
            ("Historical Context", "Built in 1026-27 CE during the reign of Bhima I of the Chaulukya dynasty."),
            ("Architectural Complex", "Comprises three axial components: Gudhamandapa, Sabhamandapa, and the stepped water reservoir Surya Kunda."),
            ("Solar Alignment", "Aligned so that the first rays of the equinox sun illuminate the sanctum.")
        ]
    )

    # Text report: Sidi Saiyyed Mosque
    doc4_path, doc4_sha, doc4_text = make_sample_text_file(
        "sidi_saiyyed_jali_notes.txt",
        "Historical Records of Ahmedabad Sultanate Architecture.\n"
        "The Sidi Saiyyed Mosque was built in 1573 CE by Sidi Saiyyed in the retinue of Bilal Jhajar Khan.\n"
        "Renowned for the intricately carved ten stone lattice windows (jalis) depicting intertwined palm and foliage."
    )

    # Real PDF 2: Sabarmati Ashram
    doc5_path, doc5_sha, doc5_text = make_sample_pdf(
        "sabarmati_ashram_history.pdf",
        "National Gandhi Museum Archive: Historical Record of Sabarmati Ashram",
        [
            "Sabarmati Ashram was established in 1917 on the banks of Sabarmati river by Mahatma Gandhi.",
            "It served as the launching point for the famous 1930 Dandi Salt March on 12 March 1930.",
            "The ashram was initially known as Satyagraha Ashram and reflects simplicity, non-violence, and self-reliance."
        ]
    )

    resources_data = [
        (1, 1, "photo", "Adalaj Stepwell Entrance View", "en", "Placeholder image (generated for demo)", "CC-BY-4.0", "Heritage Volunteers",
         img1_path, "adalaj_entrance.jpg", img1_sha, img1_phash, "Photograph of Adalaj Stepwell entrance pavilion and columns.",
         "stepwell,gandhinagar,solanki,architecture", "solanki,vav,columns", "High quality photo of entrance pavilion.",
         "Stone entrance pavilion of Adalaj Stepwell with carved pillars", "published", "sourced"),

        (2, 1, "photo", "Adalaj Stepwell Column Carvings", "en", "Placeholder image (generated for demo)", "CC0", "Open Archive",
         img2_path, "adalaj_carving.jpg", img2_sha, img2_phash, "Intricate floral and geometric stone relief on pillars.",
         "carvings,sculpture,relief,stone", "carving,details", "Detailed close-up photo of carved pillar relief.",
         "Detailed sandstone pillar carvings at Adalaj Stepwell", "published", "sourced"),

        (3, 1, "pdf", "[Sample] ASI Survey Report: Adalaj Stepwell Structure", "en", "Demo sample (written by project team)", "CC0", "ASI Research Cell",
         doc1_path, "adalaj_asi_survey.pdf", doc1_sha, None, doc1_text,
         "asi,survey,adalaj,history,rudabai", "monograph,rudabai,1498", "Complete architectural study and historical background of Adalaj Vav.",
         "ASI survey report document for Adalaj Vav", "published", "sourced"),

        (4, 2, "photo", "Rani ki Vav Stepped Corridor & Deities", "en", "Placeholder image (generated for demo)", "CC-BY-4.0", "Gujarat Heritage Dept",
         img3_path, "rani_vav_apsaras.jpg", img3_sha, img3_phash, "Seven stepped tiers of Rani ki Vav with sculpted niches and Vishnu avatars.",
         "unesco,stepwell,patan,chaulukya,vishnu", "stepwell,unesco,sculpture", "Seven-tiered stepped well featuring ornate relief panels.",
         "Sculpted stone niches along the tiers of Rani ki Vav", "published", "sourced"),

        (5, 2, "docx", "[Sample] UNESCO Nomination Dossier: Rani ki Vav", "en", "Demo sample (written by project team)", "CC0", "UNESCO Repository",
         doc2_path, "rani_vav_unesco_dossier.docx", doc2_sha, None, doc2_text,
         "unesco,dossier,udayamati,chaulukya,patan", "unesco,1063,udayamati", "Official UNESCO dossier detailing history, significance and conservation of Rani ki Vav.",
         "UNESCO World Heritage dossier for Rani ki Vav", "published", "sourced"),

        (6, 3, "photo", "Surya Kund Stepped Tank at Modhera", "en", "Placeholder image (generated for demo)", "CC-BY-4.0", "Sunil Joshi",
         img4_path, "modhera_kund.jpg", img4_sha, img4_phash, "Stepped pyramid water tank Surya Kund facing the assembly hall at Modhera.",
         "modhera,sun-temple,surya-kund,reservoir", "kund,reservoir,stepped-tank", "Surya Kund stepped reservoir with miniature shrines.",
         "Surya Kund reservoir with geometrical stone steps at Modhera", "published", "sourced"),

        (7, 3, "pptx", "[Sample] Modhera Sun Temple Architectural Analysis", "en", "Demo sample (written by project team)", "CC-BY-SA-4.0", "School of Planning & Architecture",
         doc3_path, "modhera_sun_temple_study.pptx", doc3_sha, None, doc3_text,
         "modhera,solanki,equinox,mandapa,architecture", "presentation,chaulukya,1026", "Slide deck detailing ground plan, equinox alignment and friezes.",
         "Architectural presentation on Modhera Sun Temple", "published", "sourced"),

        (8, 4, "photo", "Sidi Saiyyed Mosque Tree of Life Jali", "en", "Placeholder image (generated for demo)", "CC0", "Ahmedabad Municipal Corp",
         img5_path, "sidi_saiyyed_jali.jpg", img5_sha, img5_phash, "Perforated stone lattice window featuring the famous Tree of Life motif.",
         "jali,sidi-saiyyed,ahmedabad,tree-of-life", "jali,lattice,ahmedabad", "Stone lattice work screen of palm tree and foliage.",
         "Perforated stone window screen at Sidi Saiyyed Mosque", "published", "sourced"),

        (9, 4, "report", "[Sample] Ahmedabad Sultanate Architecture Field Notes", "en", "Demo sample (written by project team)", "CC-BY-4.0", "T. Mansuri",
         doc4_path, "sidi_saiyyed_jali_notes.txt", doc4_sha, None, doc4_text,
         "sultanate,ahmedabad,sidi-saiyyed,1573", "lattice,sidi-saiyyed", "Field notes and architectural measurements of the Sidi Saiyyed Mosque.",
         "Field notes on Sidi Saiyyed Mosque", "published", "sourced"),

        (10, 5, "pdf", "[Sample] Sabarmati Ashram Historical Archive", "en", "Demo sample (written by project team)", "CC0", "Ashram Archives",
         doc5_path, "sabarmati_ashram_history.pdf", doc5_sha, None, doc5_text,
         "gandhi,ashram,sabarmati,dandi-march,freedom", "ashram,1917,dandi", "Historical archive document tracking the foundation and Dandi March departure.",
         "Historical archive document of Sabarmati Ashram", "published", "sourced"),

        (11, 1, "photo", "Draft Aerial View of Adalaj", "en", "Anonymous Contributor", "CC-BY-4.0", "New User",
         img1_path, "draft_adalaj.jpg", img1_sha + "_pending", None, "Unverified user upload awaiting approval.",
         "draft,unreviewed", "pending", "Pending review photo.",
         "Draft unreviewed image", "pending", "ai_suggested"),
    ]

    # Seeded demo resources are never "verified": only a human reviewer may set that.
    resources_data = [r[:18] + (("sourced" if (r[2] != "photo" and r[17] == "published") else "ai_suggested"),) for r in resources_data]

    for r in resources_data:
        cur.execute(
            """INSERT INTO resources
               (id, monument_id, type, title, language, creator, license, contributor,
                file_path, original_name, sha256, phash, text, tags, ai_tags, ai_summary,
                alt_text, publish_status, verify_status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            r
        )
        if r[17] == "published":
            sync_fts_insert(conn, r[0], r[3], r[12], r[13])

    conn.commit()

    print("Seeding authentic and sample claims with sources...")
    claims_data = [
        # (id, monument_id, resource_id, type, text, date_certainty, snippet, status, reviewer)
        (1, 1, 3, "builder", "Built in 1498 by Queen Rudabai in memory of Rana Veer Singh.", "exact",
         "The Adalaj stepwell was built in 1498 by Queen Rudabai in memory of Rana Veer Singh.", "sourced", None),
        (2, 1, 3, "style", "Solanki style subterranean five-storey architecture with elaborate octagonal shafts.", "exact",
         "features Solanki style subterranean five-storey architecture with elaborate octagonal shafts", "sourced", None),
        (3, 2, 5, "date", "Commissioned around 1063 CE by Queen Udayamati in memory of King Bhima I.", "circa",
         "commissioned by Queen Udayamati around 1063 CE in memory of King Bhima I", "sourced", None),
        (4, 3, 7, "date", "Built in 1026-27 CE during the reign of Bhima I of the Chaulukya dynasty.", "exact",
         "Built in 1026-27 CE during the reign of Bhima I of the Chaulukya dynasty", "sourced", None),
        (5, 4, 9, "builder", "Built in 1573 CE by Sidi Saiyyed in the retinue of Bilal Jhajar Khan.", "exact",
         "The Sidi Saiyyed Mosque was built in 1573 CE by Sidi Saiyyed in the retinue of Bilal Jhajar Khan", "sourced", None),
        (6, 5, 10, "event", "Served as the launching point for the famous Dandi Salt March on 12 March 1930.", "exact",
         "launching point for the famous 1930 Dandi Salt March on 12 March 1930", "sourced", None),
        # AI Suggested claim without source to demonstrate honest UI badge
        (7, 1, 1, "dimension", "Stepwell reaches approximately 16 meters below ground level.", "range",
         None, "ai_suggested", None),
        # Disputed claim to demonstrate conflict resolution
        (8, 1, 3, "date", "Disputed construction date recorded in local legend as 1499 CE.", "circa",
         None, "disputed", "Admin Reviewer"),
    ]

    for c in claims_data:
        cur.execute(
            """INSERT INTO claims
               (id, monument_id, resource_id, type, text, date_certainty, snippet, status, reviewer, reviewed_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            c
        )

    sources_data = [
        # (id, claim_id, title, author, year, url, locator, tier)
        # Tier 2 = Wikipedia. Upgrade to Tier 1 only after a human opens an official source and checks it.
        (1, 1, "Wikipedia: Adalaj Stepwell", "Wikipedia contributors", "2026", "https://en.wikipedia.org/wiki/Adalaj_Stepwell", "Article lead / History section", 2),
        (2, 2, "Wikipedia: Adalaj Stepwell", "Wikipedia contributors", "2026", "https://en.wikipedia.org/wiki/Adalaj_Stepwell", "Architecture section", 2),
        (3, 3, "Wikipedia: Rani ki Vav", "Wikipedia contributors", "2026", "https://en.wikipedia.org/wiki/Rani_ki_vav", "Article lead / History section", 2),
        (4, 4, "Wikipedia: Sun Temple, Modhera", "Wikipedia contributors", "2026", "https://en.wikipedia.org/wiki/Sun_Temple,_Modhera", "Article lead / History section", 2),
        (5, 5, "Wikipedia: Sidi Saiyyed Mosque", "Wikipedia contributors", "2026", "https://en.wikipedia.org/wiki/Sidi_Saiyyed_Mosque", "Article lead / History section", 2),
        (6, 6, "Wikipedia: Sabarmati Ashram", "Wikipedia contributors", "2026", "https://en.wikipedia.org/wiki/Sabarmati_Ashram", "History section", 2),
    ]

    cur.executemany(
        """INSERT INTO sources (id, claim_id, title, author, year, url, locator, tier)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        sources_data
    )

    print("Seeding 3D Models with honest labels...")
    models = [
        (1, 1, "photogrammetry", "Photo-reconstructed from 38 of 45 photos", 45,
         json.dumps({"registered": 38, "total": 45, "ratio": 0.84, "points": 120000, "source": "Crowdsourced 2D photos"}),
         "/models/adalaj.glb", "done"),
        (2, 2, "external_tool", "Processed with an external tool from 32 photos", 32,
         json.dumps({"registered": 30, "total": 32, "ratio": 0.93, "points": 95000, "source": "Multi-view photogrammetry"}),
         "/models/adalaj.glb", "done"),
        (3, 3, "parametric", "Parametric (not photo-based)", 0,
         json.dumps({"registered": 0, "total": 0, "ratio": 0.0, "points": 5000, "source": "Geometric architectural fallback"}),
         "/models/adalaj.glb", "done"),
    ]

    cur.executemany(
        """INSERT INTO models3d (id, monument_id, method, label, photo_count, quality_json, file_path, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        models
    )

    conn.commit()
    conn.close()
    print("Database seeding completed successfully with genuine binary documents!")

if __name__ == "__main__":
    seed()
