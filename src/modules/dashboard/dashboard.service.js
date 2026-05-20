import * as q from './dashboard.query.js'
import { pool } from '../../db/pool.js'

const normalizeEnvironmentStats = (rows) => {
  const base = {
    development: 0,
    staging: 0,
    production: 0,
  }

  for (const row of rows) {
    if (row.environment in base) {
      base[row.environment] =
        Number(row.total) || 0
    }
  }

  return base
}

const getDashboard = async (userId) => {
  const [
    [projectRows],
    [secretRows],
    [memberRows],
    [recentProjectsRows],
    [environmentRows],
  ] = await Promise.all([
    pool.execute(q.countProjects, [userId, userId]),

    pool.execute(q.countSecrets, [userId, userId]),

    pool.execute(q.countMembers, [userId]),

    pool.execute(q.recentProjects, [userId, userId]),

    pool.execute(q.environmentStats, [userId, userId]),
  ])

  return {
    overview: {
      totalProjects:
        Number(projectRows[0]?.total ?? 0),

      totalSecrets:
        Number(secretRows[0]?.total ?? 0),

      totalMembers:
        Number(memberRows[0]?.total ?? 0),
    },

    environmentStats:
      normalizeEnvironmentStats(environmentRows),

    recentProjects:
      recentProjectsRows,
  }
}

export { getDashboard }