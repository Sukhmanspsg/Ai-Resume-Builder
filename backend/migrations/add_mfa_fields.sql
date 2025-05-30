-- Add MFA fields to users table
ALTER TABLE users
ADD COLUMN mfa_secret VARCHAR(255) NULL,
ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE; 