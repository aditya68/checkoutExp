const query = require('./db.js');
var sql ="";

exports.getDefault = async function(userId)
{
  sql="SELECT name, phone, pin, flat, area, landmark, city, state FROM address WHERE userId=? AND isDefault=?";
  let result=await query(sql,[userId,1]);
  return result[0];
}

exports.setDefault = async function(addressId) {
  sql="UPDATE address SET isDefault=? WHERE addressId=?";
  await query(sql,[1,addressId]);
}

exports.unsetDefault = async function(userId) {
    sql="UPDATE address SET isDefault=? WHERE userId=? AND isDefault=?";
    await query(sql,[0,userId,1]);
}

exports.isDefault = async function(addressId) {
  sql="SELECT isDefault FROM address WHERE addressId=?";
  let result=await query(sql,[addressId]);
  return result[0].isDefault;
}

exports.isAlreadyInserted = async function(userId,address)
{
  sql="SELECT addressId FROM address WHERE userId=? AND name=? AND phone=? AND pin=? AND flat=? AND area=? AND landmark=? AND city=? AND state=?";
  let result=await query(sql, [userId,...address]);
  if(!result.length)return -1;
  return result[0].addressId;
}

