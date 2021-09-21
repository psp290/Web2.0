var db = require("../db");

save_user_info = (data) => new Promise((resolve,reject)=>{
    db.query('INSERT INTO lottery_information SET ?',data, (err, results, fields)=>{
        if(err){
            reject('could not insert lottery information');
        }
        resolve('Successful.....');
    });
});

get_total_amount = () => new Promise((resolve,reject)=>{
    db.query('SELECT sum(amount) as total_amount from lottery_information',null, (err, results, fields)=>{
        if(err){
            reject('could not get total amount');
        }
        resolve(results);
    });
});

module.exports = {save_user_info, get_total_amount};