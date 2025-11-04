import React, { useEffect } from 'react'
import { TypeAnimation } from 'react-type-animation'
import image1 from '../images/image1.webp'

const Home = () => {


  return (
    <div className='flex flex-col justify-center items-center h-[75%]'>
      <img src={image1} alt="Logo" className='w-[50%] mx-auto mt-20 mb-10' />
      <TypeAnimation
            sequence={[
              'Assignment Management System', 1000, ""
            ]}
            style={{ display: 'inline-block', fontSize: '25px', fontStyle: "italic" }}
            repeat={Infinity}
            omitDeletionAnimation={true}
            className='text-richblue-200 text-center font-bold'
          />
    </div>
  )
}

export default Home
