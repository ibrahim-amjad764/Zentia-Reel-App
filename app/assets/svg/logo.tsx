import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='100' height='100' viewBox='0 0 328 329' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect y='0.5' width='328' height='328' rx='164' fill='black' className='dark:fill-white' />
    </svg>
  )
}

export default Logo
