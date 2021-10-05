# 參考 pchome-api

forked form https://github.com/ALiangLiang/pchome-api

能夠使用LinePay結帳，直接成立訂單
 
## 也能搶購加購商品
 
在add2Cart.js中將referer還有data的value改成
-  multiReferer
-  multiProduct

並且將欲加購之商品以及贈品的prodId寫死到
"G":[]
這個陣列中