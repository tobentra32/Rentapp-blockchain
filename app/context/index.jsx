'use client'

import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum, polygon,polygonAmoy } from '@reown/appkit/networks'
import React from 'react'

// Validate project ID

const projectId = '62e79459767fff6c6ae30cd40f159bf1'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Metadata configuration
const metadata = {
  name: 'next-reown-appkit',
  description: 'next-reown-appkit',
  url: 'https://github.com/0xonerb/next-reown-appkit-ssr', // Ensure origin matches domain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal instance
export const modal = createAppKit({
  adapters: [new EthersAdapter()],
  projectId,
  networks: [mainnet, arbitrum, polygon, polygonAmoy],

  metadata,
  themeMode: 'dark',

})

// Context Provider component
function ContextProvider({ children }) {
  return <>{children}</>
}

export default ContextProvider;
