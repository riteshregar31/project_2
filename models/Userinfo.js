const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userinfo=new Schema({
    Name:String,
    Age:Number,
    Gender:String,
    Country:String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    showid:[{
        idno:String
    }
    ]
}
,
{
    strictPopulate: false
})

module.exports = mongoose.model("Userinfo", userinfo);