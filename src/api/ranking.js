import request from '@/utils/request'

export function getBorrowRanking(params) {
  return request({
    url: '/borrow/ranking',
    method: 'get',
    params
  })
}