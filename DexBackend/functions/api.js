const express=require("express");
const Morails=require("moralis").default;
const {EvmChain}=require("@moralisweb3/common-evm-utils");
const dotenv=require("dotenv");
const serverless=require('serverless-http');
dotenv.config();
const app=express();
const cors=require("cors");
app.use(cors());
app.use(express.json());
const router=express.Router();
router.get('/',(req,res)=>{
    res.status(200).json({
        message:"Hello World"
    });
});
router.get('/tokenPrice',async(req,res)=>{
    try {
        const {query}=req;
        const responseOne=await Morails.EvmApi.token.getTokenPrice({
            address:query.addressOne,
            chain:EvmChain.ETHEREUM
        });
        const responseTwo=await Morails.EvmApi.token.getTokenPrice({
            address:query.addressTwo,
            chain:EvmChain.ETHEREUM
        });
        const usdPrice={
            tokenOne:responseOne.raw.usdPrice,
            tokenTwo:responseTwo.raw.usdPrice,
            ratio:responseOne.raw.usdPrice/responseTwo.raw.usdPrice
        };
        res.status(200).json(usdPrice);
    } catch (error) {
        console.log(error.message);
    }
})
const startServer=async()=>{
    await Morails.start({
        apiKey:process.env.MORAILS_KEY
    })
}
startServer();
app.use('/',router);
module.exports.handler=serverless(app);