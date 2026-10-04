-- Create a test founder
INSERT INTO "Founder" (id, "clerkId", name, email, timezone, "subscriptionStatus", "createdAt", "updatedAt")
VALUES ('founder_audit_123', 'clerk_audit_123', 'Audit Tester', 'audit@test.com', 'UTC', 'none', NOW(), NOW());

-- Create a test startup
INSERT INTO "Startup" (id, "founderId", name, stage, "isPrimary", "createdAt", "updatedAt")
VALUES ('startup_audit_123', 'founder_audit_123', 'Audit Corp', 'idea', true, NOW(), NOW());

-- Create a test goal
INSERT INTO "Goal" (id, "startupId", title, status, "isActive", "createdAt", "updatedAt")
VALUES ('goal_audit_123', 'startup_audit_123', 'Audit Goal', 'active', true, NOW(), NOW());

-- Create a test milestone
INSERT INTO "Milestone" (id, "goalId", title, status, "sortOrder", "createdAt", "updatedAt")
VALUES ('milestone_audit_123', 'goal_audit_123', 'Audit Milestone', 'active', 0, NOW(), NOW());

-- Create a target task for IDOR testing
INSERT INTO "Task" (id, "milestoneId", title, status, priority, "createdAt", "updatedAt")
VALUES ('task_victim_999', 'milestone_audit_123', 'Secret Victim Task', 'TODO', 'HIGH', NOW(), NOW());
