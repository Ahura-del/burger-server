const Joi = require('joi')

const registerValidation = data=>{
    const schema = Joi.object({
        name:Joi.string().min(2).required(),
        email:Joi.string().required().email(),
        password:Joi.string().min(4).max(1024).required()
    })
    return schema.validate(data)
}

const loginValidation = data =>{
    const schema = Joi.object({
        email:Joi.string().required().email(),
        password:Joi.string().min(4).max(1024).required()
    })
    return schema.validate(data)
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation