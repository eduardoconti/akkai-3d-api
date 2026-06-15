-- Uso no psql:
-- \set id_role 1
--
-- Atribui todas as permissoes cadastradas para o role informado,
-- ignorando permissoes que ele ja possui.
WITH role_alvo AS (
  SELECT id
  FROM roles
  WHERE id = :id_role
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT role_alvo.id, permissions.id
FROM role_alvo
CROSS JOIN permissions
WHERE NOT EXISTS (
  SELECT 1
  FROM role_permissions role_permission
  WHERE role_permission.role_id = role_alvo.id
    AND role_permission.permission_id = permissions.id
);
