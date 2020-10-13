var database = require('./database.js');
database.connect_db();

data = {
    email:"test@test.com", 
    name:"Luis",
    password:"123"
}
database.save_person(data).then(
    (result) => {
        console.log('User registered.');
    },
    () => {
        console.log('Error ocurred during user registration.');
    }
);

