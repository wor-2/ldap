INSERT INTO permissions (name, description, category, created_at) VALUES
('READ_USERS', 'View user information from Active Directory', 'READ', CURRENT_TIMESTAMP),
('WRITE_USERS', 'Create and modify user accounts in Active Directory', 'WRITE', CURRENT_TIMESTAMP),
('DELETE_USERS', 'Delete user accounts from Active Directory', 'ADMIN', CURRENT_TIMESTAMP),
('READ_GROUPS', 'View Active Directory groups and memberships', 'READ', CURRENT_TIMESTAMP),
('MANAGE_GROUPS', 'Create, modify, and delete AD groups', 'WRITE', CURRENT_TIMESTAMP),
('ASSIGN_PERMISSIONS', 'Assign and revoke permissions for users', 'ADMIN', CURRENT_TIMESTAMP),
('VIEW_AUDIT_LOG', 'Access the system audit log', 'READ', CURRENT_TIMESTAMP),
('FULL_ADMIN', 'Full administrative access to all features', 'ADMIN', CURRENT_TIMESTAMP),
('SSH_ACCESS', 'SSH access to production servers', 'CUSTOM', CURRENT_TIMESTAMP),
('DB_READ', 'Read access to production databases', 'CUSTOM', CURRENT_TIMESTAMP),
('DB_WRITE', 'Write access to production databases', 'CUSTOM', CURRENT_TIMESTAMP),
('DEPLOY_PROD', 'Deploy applications to production environment', 'CUSTOM', CURRENT_TIMESTAMP);
