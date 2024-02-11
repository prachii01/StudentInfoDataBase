const mongoose = require('mongoose'); 

const StudentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rollno: {
        type:Number,
        require: true,
    }
})

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student; 