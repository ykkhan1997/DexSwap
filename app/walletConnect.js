'use client'
import React from 'react'
import {WagmiConfig,createConfig,mainnet} from 'wagmi';
import {createPublicClient,http} from 'viem';
const config=createConfig({
    autoConnect:true,
    publicClient:createPublicClient({
        chain:mainnet,
        transport:http()
    })
});
const WalletConnect = ({children}) => {
  return (
    <div>
        <WagmiConfig config={config}>
        {children}
        </WagmiConfig>
    </div>
  )
}

export default WalletConnect