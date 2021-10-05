const API = require('./api')
const config = require('./config')
const productId = process.env.PROD_ID || config.prodId

async function main() {
  // 設定 cookie
  const cookies = config.cookie
  if (process.env.COOKIE_ECC) cookies.ECC = process.env.COOKIE_ECC
  if (process.env.COOKIE_ECWEBSESS)
    cookies.COOKIE_ECWEBSESS = process.env.COOKIE_ECWEBSESS
  const api = new API(cookies)

  // 在加入購物車前，必須先呼叫這支 API，來取得產品狀況
  const snapupResult = await api.snapup(productId)

  // 加入購物車
  try {
    await api.add2Cart(productId, snapupResult, 1)
    console.log(productId, snapupResult)
  } catch (err) {
    console.log(productId, snapupResult)
    main()
    return
  }

  // 非必要流程，可以用來確認目前購物車的狀況、運費、支援的配送方式等...
  const primePriceInfo = (await api.prodCouponInfo()).ProdIDs.map((id) => ({
    ProdId: id,
    PrimeInfo: {},
  }))
  const res = await api.getCartInfo({
    CouponInfo: JSON.stringify({ prodCouponData: [] }),
    PrimePriceInfo: JSON.stringify(primePriceInfo),
  })
  console.log(res.shoppingFee ? '要運費' : '免運費')
  console.log(res.payment.LIP.status === 'Y' ? '可LinePay' : '不可LinePay')
  if (
    res.shoppingFee /* 需要運費 */ ||
    res.payment.LIP.status === 'N' /* 無法使用LinePay */
  ) {
    return console.log('取消流程')
  }

  // 送出訂單
  const result = await api.order({
    payWay: 'LIP', // COD 為貨到付款、ATM 為 ATM 付款、IBO 為 ibon 付款、LIP 為 LinePay 付款
    cusName: '',
    cusMobile: '',
    cusZip: '',
    cusAddress: '',
    recName: '',
    recMobile: '',
    recZip: '',
    recAddress: '',
  })

  if (result.status === 'ERR') {
    throw new Error(result.msg)
  }
  console.log(result)
}

main().catch(console.error)
