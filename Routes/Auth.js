const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailVerification = require("../EmailVerification");
const env = require('dotenv')
const { registerValidation, loginValidation } = require("../Validation");
env.config()


router.post("/singup", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email alredy exist");

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    name: req.body.name,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  //create verify code
  const min = 1000;
  const max = 10000;
  const uniquCode = Math.floor(Math.random() * (max - min + 1) + min);

  try {
    emailVerification(newUser, uniquCode);
    const saveUser = await newUser.save();
    res.status(200).send({ id: newUser._id, code: uniquCode });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/singin", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: "Email not found!" });

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
    res.status(400).send({ message: error.message });
  }
});

//verify account
router.put("/verify/:userId", async (req, res) => {
  try {
    // const user = await User.findById(req.params.userId);

    // const addtoUsers = new ShowUsers({
    //   _id:user._id,
    //   name:user.name,
    //   bio:user.bio,
    //   pic:user.pic
    // })

    const token = jwt.sign(
      { _id: req.params.userId },
      process.env.TOKEN_SECRET,
      {}
    );
    const updateUser = await User.updateOne(
      {
        _id: req.params.userId,
      },
      {
        $set: {
          verify: req.body.verify,
        },
      }
    );
    // const seavedAddToUsers = await addtoUsers.save()
    res.status(200).send({ userId: "user updated", token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
module.exports = router;