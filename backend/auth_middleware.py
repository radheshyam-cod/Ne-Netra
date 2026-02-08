"""
FastAPI Authentication Middleware

Integrates JWT auth and RBAC into API routes.
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
from pydantic import BaseModel

from .auth import AuthService, JWTService, TokenPair
from .rbac import RBACService, Role, Action
from .cache import CacheService


# Security scheme
security = HTTPBearer()

# Request/Response models
class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "viewer"


class RefreshRequest(BaseModel):
    refresh_token: str


class PermissionRequest(BaseModel):
    user_id: str
    role: Role
    districts: List[str]
    expires_days: Optional[int] = None


# Dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    jwt_service: JWTService = Depends()
) -> dict:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = jwt_service.verify_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload


async def require_role(required_role: Role):
    """Dependency to require specific role"""
    async def role_checker(user: dict = Depends(get_current_user)):
        user_role = Role(user.get("role"))
        
        # Role hierarchy: admin > analyst > district_officer > viewer
        role_hierarchy = {
            Role.ADMIN: 4,
            Role.ANALYST: 3,
            Role.DISTRICT_OFFICER: 2,
            Role.VIEWER: 1
        }
        
        if role_hierarchy.get(user_role, 0) < role_hierarchy.get(required_role, 0):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        return user
    
    return role_checker


async def require_district_access(district: str):
    """Dependency to require access to specific district"""
    async def district_checker(
        user: dict = Depends(get_current_user),
        rbac_service: RBACService = Depends()
    ):
        user_id = user.get("sub")
        
        # Check permission
        has_access = rbac_service.check_permission(
            user_id=user_id,
            action=Action.READ,
            district=district
        )
        
        if not has_access:
            raise HTTPException(
                status_code=403,
                detail=f"No access to district: {district}"
            )
        
        return user
    
    return district_checker


# API Routes
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
async def register(request: RegisterRequest, auth_service: AuthService = Depends()):
    """Register new user"""
    user_id = auth_service.register_user(
        username=request.username,
        email=request.email,
        password=request.password,
        role=request.role
    )
    
    if not user_id:
        raise HTTPException(status_code=400, detail="Registration failed")
    
    return {"user_id": user_id, "message": "Registration successful"}


@router.post("/login", response_model=TokenPair)
async def login(request: LoginRequest, auth_service: AuthService = Depends()):
    """Login and get access token"""
    tokens = auth_service.login(request.username, request.password)
    
    if not tokens:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return tokens


@router.post("/refresh", response_model=TokenPair)
async def refresh_token(
    request: RefreshRequest,
    jwt_service: JWTService = Depends()
):
    """Refresh access token"""
    new_tokens = jwt_service.refresh_access_token(request.refresh_token)
    
    if not new_tokens:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    return new_tokens


@router.post("/logout")
async def logout(
    request: RefreshRequest,
    auth_service: AuthService = Depends(),
    user: dict = Depends(get_current_user)
):
    """Logout (revoke refresh token)"""
    success = auth_service.logout(request.refresh_token)
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user_info(
    user: dict = Depends(get_current_user),
    rbac_service: RBACService = Depends()
):
    """Get current user information"""
    user_id = user.get("sub")
    permissions = rbac_service.get_user_permissions(user_id)
    
    return {
        "user_id": user_id,
        "role": user.get("role"),
        "permissions": permissions.dict() if permissions else None
    }


# Protected API routes example
protected_router = APIRouter(prefix="/api/protected", tags=["Protected"])


@protected_router.get("/risk/{district}")
async def get_risk_score_protected(
    district: str,
    user: dict = Depends(require_district_access(district)),
    cache: CacheService = Depends()
):
    """Get risk score (requires district access)"""
    # Try cache first
    cached = cache.get_risk_score(district)
    if cached:
        return cached
    
    # Query database (placeholder)
    # risk_data = db.get_risk_score(district)
    risk_data = {"district": district, "score": 65}
    
    # Cache result
    cache.set_risk_score(district, risk_data)
    
    return risk_data


@protected_router.post("/risk/{district}/update")
async def update_risk_score(
    district: str,
    new_score: float,
    user: dict = Depends(require_role(Role.ANALYST)),
    rbac_service: RBACService = Depends(),
    cache: CacheService = Depends()
):
    """Update risk score (requires analyst role + district access)"""
    user_id = user.get("sub")
    
    # Check district access AND write permission
    has_write = rbac_service.check_permission(
        user_id=user_id,
        action=Action.WRITE,
        district=district
    )
    
    if not has_write:
        raise HTTPException(status_code=403, detail="No write access to district")
    
    # Update database (placeholder)
    # db.update_risk_score(district, new_score)
    
    # Invalidate cache
    cache.invalidate_risk_score(district)
    
    return {"message": "Risk score updated", "district": district, "score": new_score}


@protected_router.get("/admin/users")
async def list_users(user: dict = Depends(require_role(Role.ADMIN))):
    """List all users (admin only)"""
    # Query database (placeholder)
    # users = db.get_all_users()
    users = [{"user_id": "user1", "username": "analyst1", "role": "analyst"}]
    
    return {"users": users}


@protected_router.post("/admin/permissions")
async def grant_permission(
    request: PermissionRequest,
    user: dict = Depends(require_role(Role.ADMIN)),
    rbac_service: RBACService = Depends(),
    cache: CacheService = Depends()
):
    """Grant permissions to user (admin only)"""
    from datetime import datetime, timedelta
    from .rbac import Permission
    
    expires_at = None
    if request.expires_days:
        expires_at = datetime.utcnow() + timedelta(days=request.expires_days)
    
    permission = Permission(
        user_id=request.user_id,
        role=request.role,
        districts=request.districts,
        actions=rbac_service.ROLE_PERMISSIONS[request.role],
        expires_at=expires_at,
        created_by=user.get("sub")
    )
    
    success = rbac_service.create_permission(permission)
    
    if success:
        # Invalidate permissions cache
        cache.invalidate_user_permissions(request.user_id)
        return {"message": "Permission granted"}
    else:
        raise HTTPException(status_code=500, detail="Failed to grant permission")


# Export router
def get_auth_router():
    """Get authentication router"""
    return router


def get_protected_router():
    """Get protected routes example"""
    return protected_router
