from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.firebase_setup import db, verify_firebase_token, require_role
from google.cloud.firestore_v1 import SERVER_TIMESTAMP, Increment

router = APIRouter()

class CreatePostRequest(BaseModel):
    breedId: str
    content: str

class CreateCommentRequest(BaseModel):
    breedId: str
    postId: str
    content: str

@router.get("/community/{breed_id}/posts")
async def get_posts(breed_id: str):
    """Fetches community discussion posts for a given breed."""
    posts_ref = (
        db.collection("communities")
        .document(breed_id.lower())
        .collection("posts")
        .where("flagged", "==", False)
        .stream()
    )
    posts = [doc.to_dict() | {"postId": doc.id} for doc in posts_ref]
    return {"breedId": breed_id, "posts": posts}

@router.post("/community/posts")
async def create_post(
    payload: CreatePostRequest,
    user: dict = Depends(verify_firebase_token)
):
    user_doc = db.collection("users").document(user["uid"]).get()
    author_name = user_doc.to_dict().get("fullName", "Farmer") if user_doc.exists else "Farmer"

    post_ref = db.collection("communities").document(payload.breedId.lower()).collection("posts").document()
    post_ref.set({
        "authorId": user["uid"],
        "authorName": author_name,
        "content": payload.content,
        "flagged": False,
        "flagCount": 0,
        "createdAt": SERVER_TIMESTAMP
    })
    return {"status": "success", "postId": post_ref.id}

@router.post("/community/comments")
async def create_comment(
    payload: CreateCommentRequest,
    user: dict = Depends(verify_firebase_token)
):
    user_doc = db.collection("users").document(user["uid"]).get()
    author_name = user_doc.to_dict().get("fullName", "Farmer") if user_doc.exists else "Farmer"

    comment_ref = (
        db.collection("communities").document(payload.breedId.lower())
        .collection("posts").document(payload.postId)
        .collection("comments").document()
    )
    comment_ref.set({
        "authorId": user["uid"],
        "authorName": author_name,
        "content": payload.content,
        "createdAt": SERVER_TIMESTAMP
    })
    return {"status": "success", "commentId": comment_ref.id}

@router.post("/community/posts/{breed_id}/{post_id}/flag")
async def flag_post(
    breed_id: str,
    post_id: str,
    user: dict = Depends(verify_firebase_token)
):
    post_ref = db.collection("communities").document(breed_id.lower()).collection("posts").document(post_id)
    post_doc = post_ref.get()
    
    if not post_doc.exists:
        raise HTTPException(status_code=404, detail="Post not found")

    post_ref.update({"flagCount": Increment(1)})
    if post_doc.to_dict().get("flagCount", 0) + 1 >= 3:
        post_ref.update({"flagged": True})

    return {"status": "success"}

@router.delete("/community/posts/{breed_id}/{post_id}")
async def remove_post(
    breed_id: str,
    post_id: str,
    user: dict = Depends(verify_firebase_token)
):
    await require_role(user, ["admin"])
    db.collection("communities").document(breed_id.lower()).collection("posts").document(post_id).delete()
    return {"status": "success"}