import { COMMUNITIES_DATA } from '../data/communities';
import { Community, CommunityPost } from '../types';
import { apiService } from './apiService';

// NOTE: reading posts back from the backend requires a GET endpoint, which
// isn't in the backend yet. Add this to Person 2's backend:
//
//   @router.get("/community/posts/{breed_id}")
//   async def list_posts(breed_id: str, user: dict = Depends(verify_firebase_token)):
//       docs = db.collection("communities").document(breed_id).collection("posts")\
//               .order_by("createdAt", direction="DESCENDING").limit(50).stream()
//       return {"posts": [d.to_dict() for d in docs]}
//
// Once that exists, replace the TODO below with a real fetch.

export const communityService = {
  getCommunities(): Community[] {
    return COMMUNITIES_DATA;
  },

  getCommunityById(id: string): Community | undefined {
    return COMMUNITIES_DATA.find((c) => c.id === id);
  },

  async getPostsForCommunity(
    communityId: string,
    _category?: CommunityPost['category']
  ): Promise<CommunityPost[]> {
    // TODO: replace with a real GET call once the backend list-posts
    // endpoint above is added. Returning an empty list rather than fake
    // local data so the UI honestly reflects "not wired up yet".
    return [];
  },

  async createPost(post: {
    communityId: string;
    content: string;
    category: CommunityPost['category'];
  }): Promise<{ postId: string }> {
    const breedId = post.communityId.replace('-farmers', '').replace('-owners', '');
    const result = await apiService.createPost(breedId, post.content);
    return { postId: result.postId };
  },

  async toggleLike(_postId: string): Promise<null> {
    // Liking isn't in the backend schema yet (posts have flagCount, not likes).
    // Add a `likes` counter + `/community/posts/{id}/like` endpoint if you want this.
    return null;
  },

  async flagPost(breedId: string, postId: string): Promise<void> {
    await apiService.flagPost(breedId, postId);
  },
};
