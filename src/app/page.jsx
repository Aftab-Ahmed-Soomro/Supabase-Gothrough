import React from 'react'
import HomePage from '@/app/(pages)/home/page'
import { ToastContainer } from 'react-toastify'

const page = () => {
  return (
    <div>
      <HomePage />
      <ToastContainer />
    </div>
  )
}

export default page
