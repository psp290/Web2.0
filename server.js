const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const publicPath = path.join(__dirname,'./public')
const { save_user_info, get_total_amount, get_list_of_participant } = require("./models/server_db");
var paypal = require('paypal-rest-sdk');
const session = require('express-session');

const app = express();

app.use(session(
    {secret:'my web app',
    cookie:{maxAge:60000}}
))

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
    var fee_amount = amount*0.9;

    var result = await save_user_info({"amount":fee_amount,"email":email});
    req.session.paypal_amount = amount;

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Lottery",
                    "sku": "funding",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            "payee": {
                "email" : "lottery_manager290@lotteryapp.com"
            },
            "description": "Lottery Purchase"
        }]
    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(">>>1",payment);
            for(var i=0;i<payment.links.length;i++){
                if(payment.links[i].rel == 'approval_url'){
                    return res.send(payment.links[i].href);
                }
            }
        }
    });

});


app.get('/get_total_amount',async (req,res)=>{
    var result = await get_total_amount();
    //console.log(result);
    res.send(result);
});



app.get('/pick_winner',async (req,res)=>{
    var result = await get_total_amount();
    var total_amount = result[0].total_amount;
    console.log(total_amount);
    req.session.paypal_amount = total_amount;

    var list_of_participant = await get_list_of_participant();
    list_of_participant = JSON.parse(JSON.stringify(list_of_participant));
    var email_array = [];
    list_of_participant.forEach(function(element){
        email_array.push(element.email);
    });

    var winner_email = email_array[Math.floor(Math.random()*email_array.length)];
    req.session.winner_picked = true;

    // Create paypal payment

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Lottery",
                    "sku": "funding",
                    "price": req.session.paypal_amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": req.session.paypal_amount
            },
            "payee": {
                "email" : winner_email
            },
            "description": "Paying winner of Lottery App"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(">>>1",payment);
            for(var i=0;i<payment.links.length;i++){
                if(payment.links[i].rel == 'approval_url'){
                    return res.redirect(payment.links[i].href);
                }
            }
        }
    });
    
})

app.get('/success',async (req, res)=>{
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    var execute_payment_json = {
        "payer_id":payerId,
        "transactions":[{
            "amount":{
                "currency":"USD",
                "total": total_amount
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(error,payment){
        if(error){
            console.log(error.response);
            throw error;
        }else{
            console.log(payment);
        }
    });

    if(req.session.winner_picked){
        var deleted = await delete_users();
    }

    req.session.winner_picked = false;
    res.redirect('http://localhost:3000');
})

app.listen(3000,()=>{
    console.log(`Listening to port 3000`);
});