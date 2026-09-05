from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.firebase_setup import db, verify_firebase_token
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

router = APIRouter()

class UserProfileRequest(BaseModel):
    fullName: str
    role: str  # "farmer" | "fieldworker"

class AnimalRegistrationRequest(BaseModel):
    tagNumber: str
    species: str  # "cattle" | "buffalo"
    district: str
    state: str
    imageUrl: Optional[str] = None  # Receives free ImgBB CDN link

@router.post("/users/profile")
async def create_user_profile(
    payload: UserProfileRequest,
    user: dict = Depends(verify_firebase_token)
):
    if payload.role not in ("farmer", "fieldworker"):
        raise HTTPException(status_code=400, detail="Invalid role specified")
    
    user_ref = db.collection("users").document(user["uid"])
    user_ref.set({
        "uid": user["uid"],
        "email": user.get("email"),
        "fullName": payload.fullName,
        "role": payload.role,
        "createdAt": SERVER_TIMESTAMP
    })
    return {"status": "success", "uid": user["uid"]}

@router.post("/animals")
async def register_animal(
    payload: AnimalRegistrationRequest,
    user: dict = Depends(verify_firebase_token)
):
    animal_ref = db.collection("animals").document()
    animal_data = {
        "animalId": animal_ref.id,
        "ownerId": user["uid"],
        "tagNumber": payload.tagNumber,
        "species": payload.species,
        "imageUrl": payload.imageUrl,  # ImgBB URL stored directly
        "confirmedBreedId": None,
        "roughLocation": {"district": payload.district, "state": payload.state},
        "registeredAt": SERVER_TIMESTAMP
    }
    animal_ref.set(animal_data)
    return {"status": "success", "animalId": animal_ref.id}

@router.patch("/animals/{animal_id}/confirm-breed")
async def confirm_breed(
    animal_id: str,
    breed_id: str,
    user: dict = Depends(verify_firebase_token)
):
    animal_ref = db.collection("animals").document(animal_id)
    animal_doc = animal_ref.get()
    
    if not animal_doc.exists:
        raise HTTPException(status_code=404, detail="Animal not found")
    if animal_doc.to_dict().get("ownerId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to animal record")

    animal_ref.update({"confirmedBreedId": breed_id})
    return {"status": "success", "confirmedBreedId": breed_id}

@router.get("/breeds/{breed_id}/feed-plan")
async def get_feed_plan(breed_id: str):
    doc = db.collection("feedPlans").document(breed_id.lower()).get()
    if doc.exists:
        return doc.to_dict()
    return {
        "breedId": breed_id.lower(),
        "dailyGreenFodderKg": 25,
        "dryFodderKg": 5,
        "concentrateKg": 3,
        "sourceIds": ["NDDB_REC_2024"]
    }

@router.get("/breeds/{breed_id}/breeding-advice")
async def get_breeding_advice(breed_id: str):
    doc = db.collection("breedingRecommendations").document(breed_id.lower()).get()
    if doc.exists:
        return doc.to_dict()
    return {
        "breedId": breed_id.lower(),
        "recommendedCross": "Selective Purebred",
        "notes": "Enhances thermal tolerance and milk output.",
        "sourceIds": ["ICAR_BREEDING_GUIDE"]
    }