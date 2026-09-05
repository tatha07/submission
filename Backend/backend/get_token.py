import firebase_admin
from firebase_admin import auth, credentials

# Initialize Firebase Admin using your existing service key
cred = credentials.Certificate("serviceAccountKey.json")
try:
    firebase_admin.initialize_app(cred)
except ValueError:
    pass

def get_test_token():
    uid = "test_farmer_1"
    # Create test user if not already present
    try:
        user = auth.get_user(uid)
    except:
        user = auth.create_user(uid=uid, email="farmer@flipflop8.com")

    # Generate token
    custom_token = auth.create_custom_token(uid)
    print("\n================ YOUR BEARER TOKEN ================")
    print(f"Bearer {custom_token.decode('utf-8')}")
    print("===================================================\n")

if __name__ == "__main__":
    get_test_token()