"""
JWT Authentication System

Implements token-based authentication with access and refresh tokens.
"""

import jwt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict
from pydantic import BaseModel
import bcrypt


class TokenPair(BaseModel):
    """Access and refresh token pair"""
    access_token: str
    refresh_token: str
    expires_in: int  # seconds
    token_type: str = "Bearer"


class JWTService:
    """JWT Authentication Service"""
    
    def __init__(
        self,
        secret_key: str,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 30,
        refresh_token_expire_days: int = 7
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire = timedelta(minutes=access_token_expire_minutes)
        self.refresh_token_expire = timedelta(days=refresh_token_expire_days)
        self.refresh_tokens = {}  # In production, use Redis
    
    def create_access_token(self, user_id: str, role: str, **extra_claims) -> str:
        """Create JWT access token"""
        now = datetime.utcnow()
        exp = now + self.access_token_expire
        
        payload = {
            "sub": user_id,
            "role": role,
            "iat": now,
            "exp": exp,
            "type": "access",
            **extra_claims
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: str) -> str:
        """Create refresh token (random string)"""
        token = secrets.token_urlsafe(32)
        exp = datetime.utcnow() + self.refresh_token_expire
        
        # Store refresh token (use Redis in production)
        self.refresh_tokens[token] = {
            "user_id": user_id,
            "expires_at": exp
        }
        
        return token
    
    def create_token_pair(self, user_id: str, role: str, **extra_claims) -> TokenPair:
        """Create access + refresh token pair"""
        access_token = self.create_access_token(user_id, role, **extra_claims)
        refresh_token = self.create_refresh_token(user_id)
        
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=int(self.access_token_expire.total_seconds())
        )
    
    def verify_access_token(self, token: str) -> Optional[Dict]:
        """Verify and decode access token"""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            
            # Check token type
            if payload.get("type") != "access":
                return None
            
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[TokenPair]:
        """Create new access token from refresh token"""
        # Verify refresh token
        token_data = self.refresh_tokens.get(refresh_token)
        
        if not token_data:
            return None
        
        # Check expiration
        if token_data["expires_at"] < datetime.utcnow():
            del self.refresh_tokens[refresh_token]
            return None
        
        user_id = token_data["user_id"]
        
        # Get user role (would query DB in production)
        # For now, assume analyst role
        role = "analyst"
        
        # Create new token pair
        return self.create_token_pair(user_id, role)
    
    def revoke_refresh_token(self, refresh_token: str) -> bool:
        """Revoke refresh token (logout)"""
        if refresh_token in self.refresh_tokens:
            del self.refresh_tokens[refresh_token]
            return True
        return False
    
    def revoke_all_tokens(self, user_id: str) -> int:
        """Revoke all refresh tokens for a user"""
        count = 0
        tokens_to_remove = []
        
        for token, data in self.refresh_tokens.items():
            if data["user_id"] == user_id:
                tokens_to_remove.append(token)
                count += 1
        
        for token in tokens_to_remove:
            del self.refresh_tokens[token]
        
        return count


class PasswordHasher:
    """Password hashing using bcrypt"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


class AuthService:
    """Complete authentication service"""
    
    def __init__(self, db_connection, jwt_service: JWTService, rbac_service):
        self.db = db_connection
        self.jwt = jwt_service
        self.rbac = rbac_service
        self._ensure_tables()
    
    def _ensure_tables(self):
        """Create auth tables"""
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        """)
    
    def register_user(
        self,
        username: str,
        email: str,
        password: str,
        role: str = "viewer"
    ) -> Optional[str]:
        """Register new user"""
        try:
            user_id = secrets.token_urlsafe(16)
            password_hash = PasswordHasher.hash_password(password)
            
            self.db.execute("""
                INSERT INTO users (user_id, username, email, password_hash, role)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, username, email, password_hash, role))
            
            return user_id
        except Exception as e:
            print(f"Registration failed: {e}")
            return None
    
    def login(self, username: str, password: str) -> Optional[TokenPair]:
        """Authenticate user and return tokens"""
        user = self.db.query_one("""
            SELECT user_id, password_hash, role, is_active
            FROM users
            WHERE username = %s
        """, (username,))
        
        if not user:
            return None
        
        # Check active status
        if not user['is_active']:
            return None
        
        # Verify password
        if not PasswordHasher.verify_password(password, user['password_hash']):
            return None
        
        # Update last login
        self.db.execute("""
            UPDATE users SET last_login = NOW() WHERE user_id = %s
        """, (user['user_id'],))
        
        # Create tokens
        return self.jwt.create_token_pair(user['user_id'], user['role'])
    
    def logout(self, refresh_token: str) -> bool:
        """Logout user (revoke refresh token)"""
        return self.jwt.revoke_refresh_token(refresh_token)
