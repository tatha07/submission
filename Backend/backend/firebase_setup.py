import os
from typing import Optional, List
import firebase_admin
from firebase_admin import credentials, auth, firestore
from fastapi import Header, HTTPException, status

CRED_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./serviceAccountKey.json")
PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "flip-flop-8")

if not firebase_admin._apps:
    cred = credentials.Certificate(CRED_PATH)
    firebase_admin.initialize_app(cred, {
        'projectId': PROJECT_ID
    })

db = firestore.client()

async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verifies incoming Firebase Bearer ID Token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header"
        )
    token = authorization.split("Bearer ")[1]
    try:
        return auth.verify_id_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID Token: {e}"
        )

async def require_role(user: dict, allowed_roles: List[str]) -> str:
    """Enforces Role-Based Access Control against Firestore user profiles."""
    user_doc = db.collection("users").document(user["uid"]).get()
    if not user_doc.exists:
        raise HTTPException(status_code=403, detail="User profile registration missing.")
    
    role = user_doc.to_dict().get("role")
    if role not in allowed_roles:
        raise HTTPException(status_code=403, detail=f"Action requires one of roles: {allowed_roles}")
    return role