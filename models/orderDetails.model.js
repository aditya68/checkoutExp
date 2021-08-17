const query = require('./db.js');
var sql = "";

exports.getUserId = async function(orderId) {
    sql="SELECT userId FROM orderDetails WHERE orderId=?";
    let result=await query(sql,orderId);
    return result[0].userId;
}

exports.updateShippingAddress = async function(orderId,address)
{
  address=JSON.stringify(address);
  sql="UPDATE orderDetails SET shippingAddress=? WHERE orderId=?";
  await query(sql,[address,orderId]);
}

