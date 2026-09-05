from backend.firebase_setup import db

BREEDS = [
    {"id": "gir", "name": {"en": "Gir", "hi": "गिर"}, "species": "cattle", "origin": ["Gujarat"]},
    {"id": "sahiwal", "name": {"en": "Sahiwal", "hi": "साहीवाल"}, "species": "cattle", "origin": ["Punjab"]},
    {"id": "murrah", "name": {"en": "Murrah", "hi": "मुर्रा"}, "species": "buffalo", "origin": ["Haryana"]}
]

def seed_database():
    for breed in BREEDS:
        breed_id = breed["id"]
        
        db.collection("breeds").document(breed_id).set(breed)
        db.collection("communities").document(breed_id).set({
            "breedId": breed_id,
            "displayName": breed["name"]["en"]
        })
        db.collection("feedPlans").document(breed_id).set({
            "breedId": breed_id,
            "dailyGreenFodderKg": 25,
            "dryFodderKg": 5,
            "concentrateKg": 3,
            "sourceIds": ["NDDB_REC_2024"]
        })
        db.collection("breedingRecommendations").document(breed_id).set({
            "breedId": breed_id,
            "recommendedCross": "Sahiwal",
            "notes": "Enhances thermal tolerance and milk output.",
            "sourceIds": ["ICAR_BREEDING_GUIDE"]
        })
    print(f"Database seeded successfully with {len(BREEDS)} base entities.")

if __name__ == "__main__":
    seed_database()