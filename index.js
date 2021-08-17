const express = require('express');
const bodyParser = require('body-parser'); 

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

require('./routes/checkoutExpress.routes.js')(app);

app.listen(3000, () => {
  console.log(`app listening at http://localhost:3000`);
})