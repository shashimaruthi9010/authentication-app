import unittest
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

class TestAuthenticationAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # We need a unique email suffix to prevent run-to-run collisions
        cls.unique_suffix = int(time.time())
        cls.test_email = f"testuser_{cls.unique_suffix}@example.com"
        cls.test_password = "securePassword123"

    def test_01_empty_fields_signup(self):
        """Test signup with empty fields."""
        payload = {
            "first_name": "",
            "last_name": "Doe",
            "email": "test@example.com",
            "password": "password123",
            "confirm_password": "password123"
        }
        res = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        self.assertEqual(res.status_code, 422) # Unprocessable Entity
        data = res.json()
        self.assertIn("detail", data)

    def test_02_password_mismatch_signup(self):
        """Test signup with password mismatch."""
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "email": f"mismatch_{self.unique_suffix}@example.com",
            "password": "password123",
            "confirm_password": "differentPassword"
        }
        res = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        self.assertEqual(res.status_code, 422)
        data = res.json()
        # Verify custom Pydantic validation message
        self.assertIn("Passwords do not match", str(data))

    def test_03_invalid_email_signup(self):
        """Test signup with invalid email format."""
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "invalid-email-format",
            "password": "password123",
            "confirm_password": "password123"
        }
        res = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        self.assertEqual(res.status_code, 422)
        data = res.json()
        self.assertIn("value is not a valid email address", str(data))

    def test_04_valid_signup(self):
        """Test valid signup."""
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "email": self.test_email,
            "password": self.test_password,
            "confirm_password": self.test_password
        }
        res = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        self.assertEqual(res.status_code, 201) # 201 Created
        data = res.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], self.test_email)
        self.assertEqual(data["user"]["first_name"], "John")
        self.assertEqual(data["user"]["last_name"], "Doe")
        # Ensure password_hash is never exposed
        self.assertNotIn("password_hash", data["user"])
        self.assertNotIn("password", data["user"])

    def test_05_duplicate_email_signup(self):
        """Test signup with duplicate email."""
        payload = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": self.test_email, # already signed up in previous test
            "password": "differentPass123",
            "confirm_password": "differentPass123"
        }
        res = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        self.assertEqual(res.status_code, 409) # 409 Conflict
        data = res.json()
        self.assertEqual(data["detail"], "An account with this email address already exists.")

    def test_06_login_empty_fields(self):
        """Test login with empty fields."""
        payload = {
            "email": "",
            "password": ""
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_07_login_non_existent_email(self):
        """Test login with non-existent email."""
        payload = {
            "email": "doesnotexist@example.com",
            "password": "somePassword"
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(res.status_code, 401)
        data = res.json()
        self.assertEqual(data["detail"], "Invalid email or password.")

    def test_08_login_wrong_password(self):
        """Test login with wrong password."""
        payload = {
            "email": self.test_email,
            "password": "wrongPassword123"
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(res.status_code, 401)
        data = res.json()
        self.assertEqual(data["detail"], "Invalid email or password.")

    def test_09_login_correct_credentials(self):
        """Test login with correct credentials."""
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], self.test_email)
        # Store token for subsequent requests
        self.__class__.token = data["access_token"]

    def test_10_get_me_profile(self):
        """Test retrieving current user profile (protected route)."""
        headers = {"Authorization": f"Bearer {self.token}"}
        res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["email"], self.test_email)
        self.assertNotIn("password_hash", data)

    def test_11_logout(self):
        """Test user logout validation."""
        headers = {"Authorization": f"Bearer {self.token}"}
        res = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["message"], "Logged out successfully.")

    def test_12_access_profile_after_logout(self):
        """Verify accessing protected endpoint with invalid/simulated expired token is unauthorized."""
        # Note: Since JWT is stateless, client clears the token.
        # But let's verify that a request with no token or a malformed token fails.
        res = requests.get(f"{BASE_URL}/auth/me")
        self.assertEqual(res.status_code, 403) # No authorization header

        headers = {"Authorization": "Bearer invalidToken123"}
        res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        self.assertEqual(res.status_code, 401) # Invalid token

if __name__ == "__main__":
    unittest.main()
