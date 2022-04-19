const router = require('express').Router()
const Product = require('../model/Product')
const verification = require('../config/Verification')

router.get('/' , verification , async(req,res)=>{
    try {
        const products = await Product.find()
        res.status(200).json(products)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/' , verification , async(req,res)=>{
    const newProduct = new Product({
        name:req.body.name,
        image:req.body.image,
        info:req.body.info,
        price:req.body.price
    })

    try {
        const saveProduct = await newProduct.save()
        res.status(200).send('New Product added')
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router