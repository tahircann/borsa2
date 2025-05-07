import React, { ReactNode } from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Script from 'next/script'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Borsa22 - Trading Platform</title>
        <meta name="description" content="Interactive Brokers trading platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hesap konfigürasyonu */}
      <Script src="/account-config.js" strategy="beforeInteractive" />
      
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </>
  )
} 