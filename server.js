const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student.js');
const User = require('./models/User.js');  
const bcrypt = require('bcrypt'); 
const bodyParser = require('body-parser');

const cors=require('cors');
const app = express(); 
app.use(express.static('public'));
const { json } = require('express/lib/response');
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/bee_users')
app.use(express.json());
app.use(express.urlencoded()); 

app.post('/register', async (req, res) => {
    const user = req.body; 
    if (!user.password || !user.username) {
        res.status(404).send("Username and password are required"); 
        return;     
    }
    if (user.password.length < 4) {
        res.status(404).send("Password length must be >= 4");
        return; 
    }

    const newUser = new User(user);
    const saltRounds = 10;

    const hashedPwd = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = hashedPwd; 

    try {
        await newUser.save();
        res.send("Registration successful"); 
    } catch(err) {
        res.status(404).send("Couldn't register account");
    }

})


app.get('/profile', (req, res) => {
    res.send("User's profile");
})


app.post('/login', async (req, res) => {
    const loginData = req.body; 
    const account = await User.findOne().where('username').equals(loginData.username)

    if (!account) {
        res.status(404).send("No such account"); 
        return;
    }
    const match = await bcrypt.compare(loginData.password, account.password)
    if (!match) {
        res.status(404).send("Incorrect password"); 
        return; 
    }

    res.send({
        msg: "Login succesful",
    })

})

app.get('/students', async (req, res) => {
    try {
        const students = await Student.find({}, { _id: 1, name: 1, rollno: 1 });
        res.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/students', async (req, res) => {
    try {
        const { name, rollno } = req.body;
        const newStudent = new Student({ name, rollno });
        await newStudent.save();
        res.json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rollno } = req.body;

        const updatedStudent = await Student.findByIdAndUpdate(id, { name, rollno }, { new: true });
        res.json({ updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Student.findByIdAndDelete(id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

app.listen(3000, () => {
    console.log("http://localhost:3000"); 
})