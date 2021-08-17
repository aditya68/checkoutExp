const checkoutExpress = require('../controllers/checkoutExpress.controller.js');

module.exports = (app) => {
  app.post('/_order', checkoutExpress.postData);

  app.get('/:orderId/_orderDetails', checkoutExpress.getData);

  app.get('/pinIntelligence/:pin', checkoutExpress.pinIntelligence);

  app.post('/:orderId/_address/', checkoutExpress.addAddress);

  app.put('/:orderId/_address/', checkoutExpress.updateAddess);

  app.delete('/:orderId/_address/', checkoutExpress.deleteAddress);

  app.post('/:orderId/_setAddress/', checkoutExpress.setAddress);
}