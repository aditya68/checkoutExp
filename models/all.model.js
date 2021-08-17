const query = require('./db.js');
const address = require('./address.model.js');
const orderDetails = require('./orderDetails.model.js');
var sql = "";

exports.postData = async function(data)
{
  var merchantKey=data.merchantKey;
  var txnId=data.txnId;
  var userId=data.userId;
  var firstname=data.firstname;
  var lastname=data.lastname;
  var email=data.email;
  var flatShippingCharge=data.flatShippingCharge;
  var coupons=JSON.stringify(data.coupons);
  var itemsTotalCharge=0,totalCharge; 
  var status="Initiated" ;
  for(let i=0;i<data.productInfo.length;i++)
    itemsTotalCharge+=(data.productInfo[i].pChr)*(data.productInfo[i].qt);
  totalCharge=itemsTotalCharge+flatShippingCharge;
  sql="INSERT INTO orderDetails (merchantKey,txnId,userId,firstname,lastname,email,coupons,itemsTotalCharge,shippingCharge,merchantDiscount,couponDiscount,totalCharge,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
  val=[merchantKey,txnId,userId,firstname,lastname,email,coupons,itemsTotalCharge,flatShippingCharge,0,0,totalCharge,status];
  let result=await query(sql,val);
  for(var i=0;i<data.productInfo.length;i++)
  {
    let qt=data.productInfo[i].qt;
    delete data.productInfo[i].qt;
    let pdInfo=data.productInfo[i];
    pdInfo=JSON.stringify(pdInfo);
    sql="INSERT INTO itemDetails (pdInfo,qtInfoV0,qtInfoV1,orderId) VALUES (?,?,?,?)";
    await query(sql,[pdInfo,qt,qt,result.insertId],sql);
  }
  return result.insertId;
}

exports.getData = async function(orderId)
{
  var orderDetails={
    customer: {userId: "0",firstname: "",lastname: "",email: ""},
    shippingAddress: {},
    appliedCoupon: "",
    address: [],
    coupons: [],
    orderSummary: [],
    amountDetails: {itemsTotalCharge: 0,shippingCharge: 0, merchantDiscount: 0, couponDiscount: 0, totalCharge: 0}
 };
 let result;
 sql="SELECT * FROM orderDetails WHERE orderId=?";
 result=await query(sql,orderId);
 result=result[0];
 for(let key in orderDetails.customer)
  orderDetails.customer[key]=result[key];
if(result.shippingAddress!=null)orderDetails.shippingAddress=JSON.parse(result.shippingAddress);
else orderDetails.shippingAddress=null;
orderDetails.appliedCoupon=result.appliedCoupon;
if(result.coupons!=null)orderDetails.coupons=JSON.parse(result.coupons);
else orderDetails.coupons=null;
for(let key in orderDetails.amountDetails)
  orderDetails.amountDetails[key]=result[key];
sql="SELECT * FROM itemDetails WHERE orderId=?";
result=await query(sql,orderId);
for(let i=0;i<result.length;i++)
{
  let obj={};
  let pdInfo,dlvInfo,qt;
  pdInfo=JSON.parse(result[i].pdInfo);
  if(result[i].dlvinfo!=null)dlvInfo=JSON.parse(result[i].dlvInfo);
  else dlvInfo={dlvDt:null,dlvChr: null};
  qt=result[i].qtInfoV1;
  obj={...pdInfo,...dlvInfo,qt:0};
  obj.qt=qt;
  orderDetails.orderSummary.push(obj);
}
sql="SELECT * FROM address WHERE userId=?";
result=await query(sql,orderDetails.customer.userId);
if(result.length)orderDetails.address=result;
else orderDetails.address=null;
return orderDetails;
}

exports.addAddress = async function(orderId,Address)
{
  let adr=[];
  for(let key in Address)
    adr.push(Address[key]);
  let obj={};
  let userId=await orderDetails.getUserId(orderId);
  await address.unsetDefault(userId);
  let addressId=await address.isAlreadyInserted(userId,adr);
  if(addressId!=-1)
  {
    obj.STATUS='Inserted address already in the list';
    obj.addressId=addressId;
  }
  else
  {
    sql="INSERT INTO address (userId,name,phone,pin,flat,area,landmark,city,state,isDefault) VALUES (?,?,?,?,?,?,?,?,?,?)";
    let result=await query(sql,[userId,...adr,0]);
    obj.STATUS='OK';
    obj.addressId=result.insertId;
  }
  await address.setDefault(obj.addressId);
  await orderDetails.updateShippingAddress(orderId,Address);
  return obj;
}

exports.updateAddess = async function(orderId,addressId,Address)
{
  let adr=[];
  for(let key in Address)
    adr.push(Address[key]);
  let obj={};
  let userId=await orderDetails.getUserId(orderId);
  await address.unsetDefault(userId);
  let addressId2=await address.isAlreadyInserted(userId,adr);
  if(addressId2!=-1)
  {
    addressId=addressId2;
    obj.STATUS='Updated address already in the list';
    obj.addressId=addressId;
  }
  else
  {
    sql="UPDATE address SET userId=?,name=?,phone=?,pin=?,flat=?,area=?,landmark=?,city=?,state=?,isDefault=? WHERE addressId=?";
    let result=await query(sql,[userId,...adr,0,addressId]);
    obj.STATUS='OK';
    obj.addressId=addressId;
  }
  await address.setDefault(addressId);
  await orderDetails.updateShippingAddress(orderId,Address);
  return obj;
}

exports.deleteAddress = async function(orderId,addressId)
{
  let obj={};
  let is=await address.isDefault(addressId);
  if(is){ await orderDetails.updateShippingAddress(orderId,null); }
  sql="DELETE FROM address WHERE addressId=?";
  await query(sql,[addressId]);
  obj.STATUS='OK';
  return obj;
}

exports.setAddress = async function(orderId,addressId)
{
  let obj={};
  let userId=await orderDetails.getUserId(orderId);
  await address.unsetDefault(userId);
  await address.setDefault(addressId);
  let Address=await address.getDefault(userId);
  await orderDetails.updateShippingAddress(orderId,Address);
  obj.STATUS='OK';
  return obj;
}