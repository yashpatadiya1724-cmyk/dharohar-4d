import os
import sys
import random
from datetime import datetime, timedelta

# Fix Windows console UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, Base, engine
from app.models import (
    User, Household, Appliance, Habit, Ward, Society,
    ActionCatalog, UserAction, ImpactLedger, Score
)
from app.seeds.seed_data import seed_all

def run_simulation(num_users: int = 150, days_history: int = 45):
    print(f"🚀 Initializing Database and Seeding Base Catalogs...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_all(db)
    
    # Check if simulation already run
    existing_sim_users = db.query(User).filter(User.phone.like("98000%")).count()
    if existing_sim_users >= 50:
        print(f"✅ Simulation data already exists ({existing_sim_users} simulated users found).")
        db.close()
        return

    wards = db.query(Ward).all()
    societies = db.query(Society).all()
    actions = db.query(ActionCatalog).all()
    
    if not wards or not actions:
        print("❌ Error: Base seed data missing!")
        db.close()
        return

    print(f"🌱 Generating {num_users} households across Ahmedabad with {days_history} days history...")
    
    # Personas: (ratio, base_completion_probability)
    personas = {
        "enthusiast": (0.20, 0.85),
        "casual": (0.40, 0.45),
        "lapsed": (0.25, 0.25),
        "inactive": (0.15, 0.05)
    }
    
    today = datetime.utcnow()
    
    first_names = [
        "Aarav", "Rina", "Mehul", "Bhavin", "Ananya", "Pranav", "Dipti", "Jignesh",
        "Kavita", "Sanjay", "Nehal", "Kinjal", "Hiren", "Pooja", "Tushar", "Viral",
        "Het", "Nirav", "Shreya", "Ketan", "Mitesh", "Urvashi", "Chirag", "Alpa"
    ]
    last_names = ["Patel", "Shah", "Mehta", "Desai", "Trivedi", "Parikh", "Joshi", "Panchal", "Modi"]
    
    for i in range(1, num_users + 1):
        phone = f"98000{i:05d}"
        f_name = random.choice(first_names)
        l_name = random.choice(last_names)
        full_name = f"{f_name} {l_name}"
        
        # Pick persona
        r = random.random()
        if r < 0.20:
            persona_type = "enthusiast"
        elif r < 0.60:
            persona_type = "casual"
        elif r < 0.85:
            persona_type = "lapsed"
        else:
            persona_type = "inactive"
            
        prob = personas[persona_type][1]
        
        user = User(
            phone=phone,
            name=full_name,
            language=random.choice(["gu", "hi", "en", "gu"]),
            role="user"
        )
        db.add(user)
        db.flush()
        
        # Assign ward and society
        ward = random.choice(wards)
        soc_pool = [s for s in societies if s.ward_id == ward.id]
        society = random.choice(soc_pool) if soc_pool else random.choice(societies)
        
        home_type = random.choice(["1BHK", "2BHK", "2BHK", "3BHK", "Bungalow", "Flat"])
        members = random.choice([2, 3, 3, 4, 4, 5])
        commute = random.choice(["walk_cycle", "public_transport", "ev", "two_wheeler", "two_wheeler", "car_ice"])
        base_bill = random.uniform(900.0, 3800.0)
        
        household = Household(
            user_id=user.id,
            home_type=home_type,
            members=members,
            pincode="380009",
            ward_id=ward.id,
            society_id=society.id,
            monthly_bill_rs=round(base_bill, 0),
            monthly_kwh=round(base_bill / 6.2, 1),
            commute_mode=commute
        )
        db.add(household)
        db.flush()
        
        # Appliances
        appliances_configs = [
            ("fan", random.randint(2, 5), 75.0, 8.0, 3, 10),
            ("led_bulb", random.randint(4, 12), 9.0, 5.0, 5, 18),
            ("fridge", 1, 150.0, 24.0, random.randint(2, 5), 0),
            ("geyser", 1 if random.random() > 0.3 else 0, 2000.0, 0.75, random.randint(2, 5), random.choice([7, 8, 19, 20])),
            ("ac", 1 if random.random() > 0.4 else 0, 1400.0, random.uniform(2.0, 7.0), random.randint(2, 5), random.choice([14, 21, 22])),
            ("washing", 1 if random.random() > 0.3 else 0, 500.0, 1.0, 3, random.choice([10, 19, 21]))
        ]
        for a_type, count, watt, hrs, star, start_h in appliances_configs:
            if count > 0:
                db.add(Appliance(
                    household_id=household.id,
                    type=a_type,
                    count=count,
                    wattage=watt,
                    hours_per_day=hrs,
                    star_rating=star,
                    usual_start_hour=start_h
                ))
                
        # Habits
        db.add(Habit(
            household_id=household.id,
            waste_segregation=random.choice([0, 1, 1, 2]),
            plastic_level=random.choice([0, 1, 1, 2]),
            water_level=random.choice([0, 1, 1, 2])
        ))
        
        # Simulate historical activity over days_history
        for d in range(days_history, 0, -1):
            day_date = today - timedelta(days=d)
            day_str = day_date.strftime("%Y-%m-%d")
            
            # Action completion check
            if random.random() < prob:
                act = random.choice(actions)
                conf = random.choice([0.4, 0.6, 0.75, 0.8])
                kwh_saved = round(act.est_kwh * conf, 2)
                co2_saved = round(act.est_co2 * conf, 2)
                pts = round(act.base_points * conf, 1)
                
                ua = UserAction(
                    user_id=user.id,
                    action_id=act.id,
                    date=day_str,
                    status="done",
                    verification_type=act.verification_type,
                    confidence=conf,
                    proof_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400"
                )
                db.add(ua)
                db.flush()
                
                db.add(ImpactLedger(
                    user_id=user.id,
                    user_action_id=ua.id,
                    kwh=kwh_saved,
                    co2=co2_saved,
                    water_l=round(act.est_water_l * conf, 1),
                    points=pts,
                    confidence=conf,
                    created_at=day_date
                ))
                
        if i % 25 == 0:
            db.commit()
            print(f"  Processed {i}/{num_users} households...")
            
    # Inject 2 flagged reviews for GEDA review queue
    flagged_user = db.query(User).first()
    if flagged_user:
        ua_flag = UserAction(
            user_id=flagged_user.id,
            action_id=actions[0].id,
            date=today.strftime("%Y-%m-%d"),
            status="done",
            verification_type="photo",
            confidence=0.45,
            proof_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400"
        )
        db.add(ua_flag)
        
    db.commit()
    db.close()
    print("✨ Simulation dataset generation completed successfully!")

if __name__ == "__main__":
    run_simulation()
