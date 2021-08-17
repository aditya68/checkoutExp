const all = require('../models/all.model.js');
const request = require('request');

exports.postData = function(req,res){
    var data=req.body;
    
    all.postData(data)
    .then((orderId) => {
      let obj={};
      obj.orderId=orderId;
      res.json(obj);
    })
}

exports.getData = function(req,res){
    var orderId=req.params.orderId;
 
    all.getData(orderId)
    .then((orderDetails)=> {
      res.json(orderDetails);
    })
}

exports.pinIntelligence = function(req,res){
    let govtPinCodeVerificationApi = "https://api.postalpincode.in/pincode/";
    request(govtPinCodeVerificationApi + req.params.pin, { json: true }, (err, res_, body) => {
      if (err) {
          res.status(404);
          return console.log(err);
      }
      if (!body[0]['PostOffice'])
          res.status(404);
      res.json(body[0]);
    })
}

exports.addAddress = function(req,res){
    let orderId=req.params.orderId;

    all.addAddress(orderId,req.body)
    .then((obj)=>{
      res.json(obj);
    })
}

exports.updateAddess = function(req,res){
    let orderId=req.params.orderId;
    let addressId=req.body.addressId;
 
    all.updateAddess(orderId,addressId,req.body.inputAddress)
    .then((obj)=>{
     res.json(obj);
    })
}

exports.deleteAddress = function(req,res){
    let orderId=req.params.orderId;
    let addressId=req.body.addressId;
    all.deleteAddress(orderId,addressId)
    .then((obj) => {
      res.json(obj);
    })
}

exports.setAddress = function(req,res){
    let orderId=req.params.orderId;
    let addressId=req.body.addressId;
    all.setAddress(orderId,addressId)
     .then((obj) => {
      res.json(obj);
    })
}
