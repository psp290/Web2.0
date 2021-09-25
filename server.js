const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const publicPath = path.join(__dirname,'./public')
const { save_user_info, get_total_amount } = require("./models/server_db");
var paypal = require('paypal-rest-sdk');
const app = express();

app.use(bodyParser.json());
app.use(express.static(publicPath));

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZxji6Z1mq7FdjO-MD8Q21DdJS2KDABkFsRsphg6OsIdW-FWrIYo3KG4BSI5MeH1XRfH0gGkfwZOy0Jk',
    'client_secret': 'EJ3RnLtNLZCYZmOrdWF9h_ZM8cc5JZ4ylD_qW5-9Iy7zDgqmajI7dCdJf9UUFseC9lSacuGMQWk2VHR_'
  });


app.post("/post_info",async (req,res)=>{
    var email = req.body.email;
    var amount = req.body.amount;

    if(amount <= 1){
        return_info = {};
        return_info.error = true;
        return_info.message = "The amount should be greater than one";
        return res.send(return_info);
    }

    var result = await save_user_info({"amount":amount,"email":email});
    console.log(result);
    res.send(result);
});


app.get('/get_total_amount',async (req,res)=>{
    var result = await get_total_amount();
    //console.log(result);
    res.send(result);
})

app.listen(3000,()=>{
    console.log(`Listening to port 3000`);
});