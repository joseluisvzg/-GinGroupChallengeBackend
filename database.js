var mongoose = require('mongoose');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const app_config = require('./config');

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, app_config.encrypt_password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

// Todo: Validate data
var schema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    years_old: Number,
    sex: {
        type: String,
        enum: ['female', 'male']
    },
    hobby: String,
    creation_date: { type: Date, default: Date.now }
});
schema.pre('save', function(next) {
    this._doc.password = encrypt(this._doc.password);
    next();
});

var persons = mongoose.model('persons', schema);

module.exports = {
    connect_db : function() {
        mongoose.connect(app_config.mongo_server, { useNewUrlParser: true, useUnifiedTopology: true });
    },

    get_persons : function(res, filters) {
        return new Promise((resolve, reject) => {
            persons.find(filters, function(err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    },

    save_person : function(data) {
        var person = new persons(data);
        return new Promise((resolve, reject) => {
            person.save((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    },

    delete_person : function(id) {
        return new Promise((resolve, reject) => {
            persons.deleteOne({_id: id}, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    },

    persons_filter : function() {
        return new Promise((resolve, reject) => {
            // Todo: Factor code (avoid hardcoding) 
            persons.find({ years_old: { $gt: 18 },  sex: 'male',  creation_date: {$gte: new Date(new Date().setDate(new Date().getDate()-3))} }, function(err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    },

    auth : function(email, password) {
        return new Promise((resolve, reject) => {
            persons.find({ email: email, password: encrypt(password)}, function(err, result) {
                if (err || result.length == 0) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
};