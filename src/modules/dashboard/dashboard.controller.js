import catchAsync from '../../utils/catchAsync.js'
import * as dashboardService from './dashboard.service.js'

const getDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboard(req.user.id)

  return res.status(200).json({
    success: true,
    message: 'Dashboard data fetched successfully',
    data,
  })
})

export { getDashboard }