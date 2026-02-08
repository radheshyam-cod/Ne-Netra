"""
Enhanced Role-Based Access Control (RBAC)

Implements fine-grained permissions with district-level access control.
"""

from enum import Enum
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from pydantic import BaseModel


class Role(str, Enum):
    """User roles with hierarchical permissions"""
    ADMIN = "admin"  # Full access to all districts
    ANALYST = "analyst"  # Read + write analysis for assigned districts
    DISTRICT_OFFICER = "district_officer"  # District-specific access
    VIEWER = "viewer"  # Read-only access
    

class Action(str, Enum):
    """Granular action permissions"""
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    EXPORT = "export"
    APPROVE = "approve"
    CONFIGURE = "configure"


class Permission(BaseModel):
    """Permission model"""
    user_id: str
    role: Role
    districts: List[str]  # Empty list = all districts (admin only)
    actions: List[Action]
    expires_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    created_by: Optional[str] = None


class RBACService:
    """RBAC Service for permission management"""
    
    # Role-action mapping
    ROLE_PERMISSIONS = {
        Role.ADMIN: [Action.READ, Action.WRITE, Action.DELETE, Action.EXPORT, Action.APPROVE, Action.CONFIGURE],
        Role.ANALYST: [Action.READ, Action.WRITE, Action.EXPORT],
        Role.DISTRICT_OFFICER: [Action.READ, Action.WRITE, Action.EXPORT],
        Role.VIEWER: [Action.READ, Action.EXPORT],
    }
    
    def __init__(self, db_connection):
        """Initialize with database connection"""
        self.db = db_connection
        self._ensure_tables()
    
    def _ensure_tables(self):
        """Create RBAC tables if they don't exist"""
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS user_permissions (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                districts JSONB DEFAULT '[]',
                actions JSONB NOT NULL,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                created_by VARCHAR(255),
                UNIQUE(user_id)
            );
            
            CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id 
                ON user_permissions(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_permissions_role 
                ON user_permissions(role);
        """)
        
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS permission_audit (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                action VARCHAR(50) NOT NULL,
                resource_type VARCHAR(100),
                resource_id VARCHAR(255),
                district VARCHAR(100),
                allowed BOOLEAN NOT NULL,
                timestamp TIMESTAMP DEFAULT NOW(),
                ip_address VARCHAR(45),
                user_agent TEXT
            );
            
            CREATE INDEX IF NOT EXISTS idx_permission_audit_user_timestamp 
                ON permission_audit(user_id, timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_permission_audit_district 
                ON permission_audit(district, timestamp DESC);
        """)
    
    def create_permission(self, permission: Permission) -> bool:
        """Create or update user permission"""
        try:
            self.db.execute("""
                INSERT INTO user_permissions 
                    (user_id, role, districts, actions, expires_at, created_by)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    role = EXCLUDED.role,
                    districts = EXCLUDED.districts,
                    actions = EXCLUDED.actions,
                    expires_at = EXCLUDED.expires_at
            """, (
                permission.user_id,
                permission.role.value,
                permission.districts,
                [a.value for a in permission.actions],
                permission.expires_at,
                permission.created_by
            ))
            return True
        except Exception as e:
            print(f"Failed to create permission: {e}")
            return False
    
    def get_user_permissions(self, user_id: str) -> Optional[Permission]:
        """Get user's permissions"""
        result = self.db.query_one("""
            SELECT user_id, role, districts, actions, expires_at, created_at
            FROM user_permissions
            WHERE user_id = %s
        """, (user_id,))
        
        if not result:
            return None
        
        # Check expiration
        if result['expires_at'] and result['expires_at'] < datetime.utcnow():
            return None
        
        return Permission(
            user_id=result['user_id'],
            role=Role(result['role']),
            districts=result['districts'] or [],
            actions=[Action(a) for a in result['actions']],
            expires_at=result['expires_at'],
            created_at=result['created_at']
        )
    
    def check_permission(
        self,
        user_id: str,
        action: Action,
        district: Optional[str] = None,
        audit: bool = True
    ) -> bool:
        """
        Check if user has permission for action on district
        
        Args:
            user_id: User ID
            action: Action to check
            district: District (None = any district)
            audit: Whether to log this check
        """
        permissions = self.get_user_permissions(user_id)
        
        if not permissions:
            if audit:
                self._audit_permission(user_id, action, district, False)
            return False
        
        # Check action permission
        if action not in permissions.actions:
            if audit:
                self._audit_permission(user_id, action, district, False)
            return False
        
        # Check district access
        if district:
            # Admin has access to all districts
            if permissions.role == Role.ADMIN:
                allowed = True
            # Others need explicit district access
            elif len(permissions.districts) == 0:
                # Empty districts list = no access (unless admin)
                allowed = False
            else:
                allowed = district in permissions.districts
        else:
            # No district specified = general permission check
            allowed = True
        
        if audit:
            self._audit_permission(user_id, action, district, allowed)
        
        return allowed
    
    def _audit_permission(
        self,
        user_id: str,
        action: Action,
        district: Optional[str],
        allowed: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log permission check to audit trail"""
        try:
            self.db.execute("""
                INSERT INTO permission_audit 
                    (user_id, action, district, allowed, ip_address, user_agent)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (user_id, action.value, district, allowed, ip_address, user_agent))
        except Exception as e:
            print(f"Failed to audit permission: {e}")
    
    def revoke_permission(self, user_id: str) -> bool:
        """Revoke all permissions for a user"""
        try:
            self.db.execute("""
                DELETE FROM user_permissions WHERE user_id = %s
            """, (user_id,))
            return True
        except:
            return False
    
    def get_district_users(self, district: str) -> List[Dict]:
        """Get all users with access to a district"""
        results = self.db.query("""
            SELECT user_id, role, actions
            FROM user_permissions
            WHERE 
                role = 'admin' 
                OR districts @> %s::jsonb
        """, ([district],))
        
        return results
    
    def get_audit_trail(
        self,
        user_id: Optional[str] = None,
        district: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get permission audit trail"""
        conditions = []
        params = []
        
        if user_id:
            conditions.append("user_id = %s")
            params.append(user_id)
        
        if district:
            conditions.append("district = %s")
            params.append(district)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        params.append(limit)
        
        results = self.db.query(f"""
            SELECT *
            FROM permission_audit
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT %s
        """, params)
        
        return results
