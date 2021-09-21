const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const publicPath = path.join(__dirname,'./public')
const { save_user_info, get_total_amount } = require("./models/server_db");
const app = express();

app.use(bodyParser.json());
app.use(express.static(publicPath));
app.post("/",async (req,res)=>{
    var email = req.body.email;
    var amount = req.body.amount;

    if(amount <= 1){
        return_info = {};
        return_info.error = true;
        return_info.message = "The amount should be greater than one";
        return res.send(return_info);
    }

    var result = await save_user_info({"amount":amount,"email":email});
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