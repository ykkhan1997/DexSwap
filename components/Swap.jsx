'use client'
import React, { useEffect, useState } from 'react'
import {Popover,Radio,Input,Modal,message} from 'antd';
import { SettingOutlined,ArrowDownOutlined,DownOutlined} from '@ant-design/icons';
import tokenList from '../tokenList.json';
import axios from 'axios';
import { useSendTransaction,useWaitForTransaction,useAccount } from 'wagmi';
const Swap = () => {
  const [messageApi,contextHolder]=message.useMessage();
  const [slippage,setSlippage]=useState(2.5);
  const {address,isConnected}=useAccount();
  const [tokenOneAmount,setTokenOneAmount]=useState(null);
  const [tokenTwoAmount,setTokenTwoAmount]=useState(null);
  const [tokenOne,setTokenOne]=useState(tokenList[0]);
  const [tokenTwo,setTokenTwo]=useState(tokenList[1]);
  const [price,setPrice]=useState(null);
  const [changeToken,setChangeToken]=useState(1);
  const [isOpen,setIsOpen]=useState(false);
  const [trxDetails,setTrxDetails]=useState({
    data:null,
    to:null,
    value:null
  });
  const {data,sendTransaction}=useSendTransaction({
    request:{
      from:address,
      data:String(trxDetails.data),
      to:String(trxDetails.to),
      value:String(trxDetails.value)

    }
  });
  const {isLoading,isSuccess}=useWaitForTransaction({
    hash:data?.hash
  });
  useEffect(()=>{
    if(trxDetails?.to && isConnected){
      sendTransaction();
    }
  },[trxDetails]);
  const fetchSwap=async()=>{
    try {
      const allowance=await axios.get(`https://api.1inch.io/v5.2/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`);
      if(allowance.data.allowance==='0'){
        const approve=await axios.get(`https://api.1inch.io/v5.2/1/approve/transaction?tokenAddress=${tokenOne.address}`);
        setTrxDetails(approve.data);
        console.log('not approved');
        return;
      }
      const tx=await axios.get(`https://api.1inch.io/v5.2/1/swap?src=${tokenOne.address}&dst=${tokenTwo.address}&amount=${tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length,'0')}&from=${address}&slippage=${slippage}`);
      let decimals=Number(`1E${tokenTwo.decimals}`);
      setTokenTwoAmount((Number(tx.data.toAmount)/decimals).toFixed(2));
      setTrxDetails(tx.data.tx);
    } catch (error) {
      
    }
  }
  const changeAmount=(e)=>{
    setTokenOneAmount(e.target.value);
    if(e.target.value && price){
      setTokenTwoAmount((e.target.value*price.ratio).toFixed(2));
    }else{
      setTokenTwoAmount(null);
    }
  }

  const switchToken=()=>{
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    setPrice(null);
    const one=tokenOne;
    const two=tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrice(two.address,one.address);
  }
  const handleSlippageChange=(e)=>{
    setSlippage(e.target.value);
  }
  const openModel=(asset)=>{
    setChangeToken(asset);
    setIsOpen(true);
  }
  const modifyToken=(i)=>{
    setPrice(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if(changeToken===1){
      setTokenOne(tokenList[i]);
      fetchPrice(tokenList[i].address,tokenTwo.address)
    }else{
      setTokenTwo(tokenList[i]);
      fetchPrice(tokenList[i].address,tokenOne.address);
    }
    setIsOpen(false);
  }
  const fetchPrice=async(one,two)=>{
    try {
      const res=await axios.get(`https://coruscating-crepe-b5469c.netlify.app/tokenPrice`,{
        params:{addressOne:one,addressTwo:two}
      });
      setPrice(res.data);
    } catch (error) {
      console.log(error.message);
    }
  }
  useEffect(()=>{
    fetchPrice(tokenList[0].address,tokenList[1].address);
  },[]);
  useEffect(()=>{
    messageApi.destroy();
    if(isLoading){
      messageApi.open({
        type:'loading',
        content:'Transaction is pending',
        duration:0
      })
    }
  },[isLoading])
  useEffect(()=>{
    if(isSuccess){
      messageApi.open({
      type:'success',
      content:'Transaction is successful',
      duration:1.5
      })
    }else if(trxDetails.to){
      messageApi.open({
        type:'error',
        content:'Transaction Failed',
        duration:1.50
      });
    }
  },[isSuccess]);
  const settings=(
    <Radio.Group value={slippage} onChange={handleSlippageChange}>
      <Radio.Button value={0.5}>0.5%</Radio.Button>
      <Radio.Button value={2.5}>2.5%</Radio.Button>
      <Radio.Button value={5.0}>5.0%</Radio.Button>
    </Radio.Group>
  )
  return (
    <>
    {contextHolder}
    <Modal
    open={isOpen}
    onCancel={()=>setIsOpen(false)}
    footer={null}
    title='Select a Token'
    >
      <div className='modalContent'>
        {tokenList.map((el,i)=>(
          <div className='tokenChoice' key={i} onClick={()=>modifyToken(i)}>
            <img src={el.img} alt={el.ticker} className='tokenLogo'/>
            <div className='tokenName'>{el.name}</div>
            <div className='tokenTicker'>{el.ticker}</div>
          </div>
        ))}
      </div>
    </Modal>
    <div className='tradeBox'>
      <div className='tradeBoxHeader'>
        <h4>Swap</h4>
        <Popover
        content={settings}
        title='Settings'
        trigger={'click'}
        className='bottomRight'>
          <SettingOutlined className='cog'/>
        </Popover>
      </div>
      <div className='inputs'>
        <Input
        placeholder='0'
        value={tokenOneAmount}
        onChange={changeAmount}
        // disabled={!price}
        />
        <Input placeholder='0' value={tokenTwoAmount} disabled={true}/>
        <div className='switchButton' onClick={switchToken}>
          <ArrowDownOutlined className={`switchArrow`}/>
        </div>
        <div className='assetOne' onClick={()=>{openModel(1)}}>
        <img src={tokenOne.img} alt='tokenOne' className='assetLogo'/>
        {tokenOne.ticker}
        <DownOutlined/>
      </div>
      <div className='assetTwo' onClick={()=>{openModel(2)}}>
        <img src={tokenTwo.img} alt='tokenTwo' className='assetLogo'/>
        {tokenTwo.ticker}
        <DownOutlined/>
      </div>
      </div>
      <div disabled={!isConnected ||!tokenOneAmount} className='swapButton' onClick={fetchSwap}>
        Swap
      </div>
      <div>
      </div>
    </div>
    </>
  )
}

export default Swap