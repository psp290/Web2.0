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

get_list_of_participant = (data) => new Promise((resolve,reject)=>{
    db.query(`select email from lottery_information`,null,function(err,results,fields){
        if(err){
            reject('Could not fetch list of participants');
        }
        resolve(results);
    });
});

delete_user = (data)=> new Promise((resolve, reject)=>{
    db.query('delete from lottery_information where ID > 0',null,function(err,results,fields){
        if(err){
            reject("Could not delete all users");
        }

        resolve("Successfully deleted all the users");
    })
})

module.exports = {save_user_info, get_total_amount, get_list_of_participant};