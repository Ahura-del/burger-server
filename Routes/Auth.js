const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailVerification = require("../config/EmailVerification");
const forgetPasswordCode = require('../config/ForgetPassword')
const verify = require('../config/Verification')
const env = require('dotenv').config()
const { registerValidation, loginValidation } = require("../config/Validation");


//register
router.post("/singup", async (req, res) => {

  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(500).send("Email alredy exist");

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPass,
  });

  //create verify code
  const min = 1000;
  const max = 10000;
  const uniquCode = Math.floor(Math.random() * (max - min + 1) + min);

  try {
    const saveUser = await newUser.save();
    emailVerification(newUser, uniquCode);
    res.status(200).send({ id: newUser._id, code: uniquCode });
  } catch (error) {
    res.status(400).send(error);
  }
});

//sing in
router.post("/singin", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email not found!");

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send("Invalid Password");

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN, {});
    if (user.verify) {
      res.status(200).send({ id: user._id, token });
    } else {
      //create verify code
      const min = 1000;
      const max = 10000;
      const uniquCode = Math.floor(Math.random() * (max - min + 1) + min);
      emailVerification(user, uniquCode);
      res.status(201).send({ id: user._id, code: uniquCode });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/user/:userId' ,verify, async(req,res)=>{
  const user = await User.findById(req.params.userId).select('-password')
  if(!user){
    return res.status(400).send('This user is not exist')
  }
  try {
    res.status(200).json(user)
    
  } catch (error) {
    res.status(400).send(error)
  }

} )


//verify account
router.put("/verify/:userId", async (req, res) => {
     
    const token = jwt.sign(
      { _id: req.params.userId },
      process.env.SECRET_TOKEN
      );
      try {
    const updateUser = await User.updateOne(
      {
        _id: req.params.userId,
      },
      {
        $set: {
          verify: req.body.verify,
        }
      }
      );
    res.status(200).send({ msg: "user updated", token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//forget password 

router.get("/fPass/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(400).send("Email is not exist");

    //create verify code
    const min = 1000;
    const max = 10000;
    const uniquCode = Math.floor(Math.random() * (max - min + 1) + min);

    forgetPasswordCode(user, uniquCode);
    res.status(200).send({ id: user._id, code: uniquCode });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put("/fPass/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    //generate token
    const token = jwt.sign(
      { _id: req.params.userId },
      process.env.SECRET_TOKEN,
      {}
    );
    const updateUser = await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashedPass,
        },
      }
    );
    res.status(200).send({ msg: "user updated", token, id: user._id });
  } catch (error) {
    res.status(400).send(error);
  }
});
//change password

router.put("/newPass/:userId", verify, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send("User not found!");
  //password is correct
  const validPass = await bcrypt.compare(req.body.oldPass, user.password);
  if (!validPass) return res.status(400).send("Invalid Passeord");
  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.newPass, salt);
  try {
    const updateUserPass = await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashedPass,
        },
      }
    );
    res.status(200).send("password changed");
  } catch (error) {
    res.status(400).send(error);
  }
});


//set Location

router.put('/location/:userId' , async(req, res)=>{
  try {
    const updateLocation = await User.updateOne({
      _id:req.params.userId
    },
    {
      $set:{
        location:req.body.location
      }
    }
    )

    res.status(200).send({msg : 'location was updated'})

  } catch (error) {
    res.status(400).send(error)

  }
})


//edit user
router.put('/:userId' , verify ,async(req,res)=>{
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send("User not exist");
  try {
    const updateUser = await User.updateOne({
      _id:user._id
    },
    {
      $set:{
        name:req.body.name,
        picture:req.body.picture,
        location:req.body.location
      }
    }
    )
    res.status(200).send({msg : 'Profile was updated'})
  } catch (error) {
    res.status(400).send(error)
  }
})


//delete account
router.delete("/:userId", verify, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send("User not found!");
  //password is correct
  const validPass = await bcrypt.compare(req.body.delPass, user.password);
  if (!validPass) return res.status(400).send("Invalid Passeord" );
  try {
    const removeUser = await User.deleteOne({
      _id: user._id,
    });
 
    res.status(200).send("user removed" );
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;