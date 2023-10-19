'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Ethereum, Logo } from "@/public";
import Link from "next/link";
import {useAccount,useConnect} from 'wagmi';
import {MetaMaskConnector} from "wagmi/connectors/metaMask";
const Navbar = () => {
  const {address,isConnected}=useAccount();
  const {connect}=useConnect({
    connector: new MetaMaskConnector(),
  });
  const [buttonText,setButtonText]=useState("Connect");
  useEffect(()=>{
    if(isConnected){
      setButtonText(address.slice(0,4)+'...'+address.slice(38));
    }else{
      setButtonText("Connect");
    }
  },[isConnected,address])
  return (
    <header className="flex justify-between items-center pl-[50px] pr-[50px]">
      <div className="flex items-center gap-20">
        <Image
          src={Logo}
          alt="logo"
          width={40}
          height={40}
          className="pr-[20px"
        />
        <Link
          href={{ pathname: "/" }}
          className={`text-white decoration-slate-50`}
        >
          <div
            className={`p-[10px] pr-[15px] pl-[15px] rounded-sm text-bold flex items-center`}
          >
            Swap
          </div>
        </Link>
        <Link
          href={{ pathname: "/token" }}
          className={`text-white decoration-slate-50`}
        >
          <div
            className={`p-[10px] pr-[15px] pl-[15px] rounded-sm text-bold flex items-center`}
          >
            Token
          </div>
        </Link>
      </div>
      <div className="flex justify-end items-center gap-20">
        <div className="p-[10px] pr-[15px] pl-[15px] rounded-sm text-bold flex items-center">
          <Image
            src={Ethereum}
            alt="ethereum"
            width={40}
            height={40}
            className="pr-[10px]"
          />
          <p className="uppercase font-bold">Ethereum</p>
        </div>
        <div className="p-[10px] pr-[20px] pl-[20px] rounded-[100px] font-bold transition ease-in-out delay-150 bg-[#243056] hover:-translate-y-1 hover:scale-110 hover:bg-[#3b4874] duration-300 hover:cursor-pointer"
        onClick={connect}
        >
          {buttonText}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
