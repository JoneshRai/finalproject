const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51R0fXjGBr8pN7wEJK9Ip4Pi9ONNtXi4oy8DCZ14V0u8BFxrzGRfXwsSepLLtGv2cgaCKlPy4OZAYUzYv1AZtz9oR0082DP3e0g')

const app = express();

app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello World');
});


app.post('/payment', async (req, res) => {

    const product = await stripe.products.create({
        name:"Ticket"
    });

    
    if(product){
        var price = await stripe.prices.create({
            product: `${product.id}`,
            unit_amount: 100 * 100,
            currency:'NPR',
        });
    }


    if(price.id){
       var session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: `${price.id}`,
                quantity: 1,
            }
        ],
        mode:'payment',
        success_url: 'http://localhost:5173/bookevent/',
        cancel_url: 'http://localhost:5173/bookevent/',
        

       }) 
    }

    res.json(session)


})


app.listen(3000, () => {
    console.log('Server running on port 3000');
});