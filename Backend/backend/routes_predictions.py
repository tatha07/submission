from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.firebase_setup import db, verify_firebase_token
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

router = APIRouter()

class TopPrediction(BaseModel):
    breed: str
    confidence: float

class SavePredictionRequest(BaseModel):
    animalId: str
    topPredictions: List[TopPrediction]
    modelVersion: str
    rawVisualScores: Optional[dict] = None
    geoAdjusted: bool = False

class CorrectionRequest(BaseModel):
    predictionId: str
    correctedBreed: str
    allowTrainingReuse: bool

@router.post("/predictions")
async def save_prediction(
    payload: SavePredictionRequest,
    user: dict = Depends(verify_firebase_token)
):
    animal_ref = db.collection("animals").document(payload.animalId)
    animal_doc = animal_ref.get()
    
    if not animal_doc.exists:
        raise HTTPException(status_code=404, detail="Target animal does not exist")
    if animal_doc.to_dict().get("ownerId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized write operation")

    pred_ref = db.collection("predictions").document()
    pred_data = {
        "predictionId": pred_ref.id,
        "animalId": payload.animalId,
        "ownerId": user["uid"],
        "topPredictions": [p.model_dump() for p in payload.topPredictions],
        "modelVersion": payload.modelVersion,
        "rawVisualScores": payload.rawVisualScores,
        "geoAdjusted": payload.geoAdjusted,
        "userCorrection": None,
        "allowTrainingReuse": False,
        "createdAt": SERVER_TIMESTAMP
    }
    pred_ref.set(pred_data)
    return {"status": "success", "predictionId": pred_ref.id}

@router.post("/predictions/correct")
async def correct_prediction(
    payload: CorrectionRequest,
    user: dict = Depends(verify_firebase_token)
):
    pred_ref = db.collection("predictions").document(payload.predictionId)
    pred_doc = pred_ref.get()
    
    if not pred_doc.exists:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    if pred_doc.to_dict().get("ownerId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized update operation")

    pred_ref.update({
        "userCorrection": payload.correctedBreed,
        "allowTrainingReuse": payload.allowTrainingReuse,
        "correctedAt": SERVER_TIMESTAMP
    })

    db.collection("feedback").add({
        "userId": user["uid"],
        "predictionId": payload.predictionId,
        "correctedBreed": payload.correctedBreed,
        "allowTrainingReuse": payload.allowTrainingReuse,
        "createdAt": SERVER_TIMESTAMP
    })

    return {"status": "success"}