// ==============================
// Total projects
// Projects where:
// - I am owner
// OR
// - I am maintainer
// ==============================

const countProjects = `
  SELECT COUNT(DISTINCT p.id) AS total

  FROM project p

  LEFT JOIN maintainer m
    ON m.project_id = p.id

  WHERE p.deleted_at IS NULL
    AND p.is_active = true
    AND (
      p.owner_id = ?
      OR m.user_id = ?
    )
`


// ==============================
// Total secrets
// Secrets inside projects where:
// - I am owner
// OR
// - I am maintainer
// ==============================

const countSecrets = `
  SELECT COUNT(DISTINCT s.id) AS total

  FROM secret s

  JOIN project p
    ON p.id = s.project_id

  LEFT JOIN maintainer m
    ON m.project_id = p.id

  WHERE s.deleted_at IS NULL
    AND s.is_active = true
    AND p.deleted_at IS NULL
    AND p.is_active = true
    AND (
      p.owner_id = ?
      OR m.user_id = ?
    )
`


// ==============================
// Total maintainers
// Count ALL maintainers
// inside projects I OWN
// ==============================

const countMembers = `
  SELECT COUNT(DISTINCT m.user_id) AS total

  FROM maintainer m

  JOIN project p
    ON p.id = m.project_id

  WHERE p.deleted_at IS NULL
    AND p.is_active = true
    AND p.owner_id = ?
`


// ==============================
// Recent projects
// Projects where:
// - I am owner
// OR
// - I am maintainer
// ==============================

const recentProjects = `
  SELECT DISTINCT
    p.id,
    p.project_name,
    p.description,
    p.owner_id,
    p.created_at,
    p.updated_at,

    (
      SELECT COUNT(*)
      FROM secret s
      WHERE s.project_id = p.id
        AND s.deleted_at IS NULL
        AND s.is_active = true
    ) AS secrets_count,

    (
      SELECT COUNT(*)
      FROM maintainer mm
      WHERE mm.project_id = p.id
    ) AS maintainers_count

  FROM project p

  LEFT JOIN maintainer m
    ON m.project_id = p.id

  WHERE p.deleted_at IS NULL
    AND p.is_active = true
    AND (
      p.owner_id = ?
      OR m.user_id = ?
    )

  ORDER BY p.created_at DESC
  LIMIT 8
`


// ==============================
// Environment stats
// Count CURRENT secret versions
// grouped by environment
// ONLY for accessible projects
// ==============================

const environmentStats = `
  SELECT
    sv.environment,
    COUNT(DISTINCT s.id) AS total

  FROM secret s

  JOIN project p
    ON p.id = s.project_id

  LEFT JOIN maintainer m
    ON m.project_id = p.id

  JOIN secret_version sv
    ON sv.secret_id = s.id
   AND sv.version = s.current_version

  WHERE s.deleted_at IS NULL
    AND s.is_active = true
    AND p.deleted_at IS NULL
    AND p.is_active = true
    AND (
      p.owner_id = ?
      OR m.user_id = ?
    )

  GROUP BY sv.environment
`


export {
  countProjects,
  countSecrets,
  countMembers,
  recentProjects,
  environmentStats,
}