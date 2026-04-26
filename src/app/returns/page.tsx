import React from 'react'
import Link from 'next/link'

export default function ReturnsPage() {
  return (
    <>
      <section className='relative h-[40vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]' />
        </div>
        <div className='relative z-10 text-center'>
          <h1 className='text-4xl md:text-6xl font-semibold text-white mb-4'>Returns & Exchange</h1>
          <p className='text-white/60 text-lg'>
            <Link href='/' className='hover:text-white transition-colors'>Home</Link> / Returns
          </p>
        </div>
      </section>

      <section className='section-padding bg-[#0D0D0D]'>
        <div className='container-custom'>
          <div className='max-w-4xl mx-auto'>
            <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-white mb-6'>Our Return Policy</h2>
              <p className='text-white/70 leading-relaxed mb-6'>
                We want you to be completely satisfied with your purchase. If for any reason you're not happy with your fragrance, 
                we offer a hassle-free return and exchange policy.
              </p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='bg-[#0D0D0D] rounded-xl p-6'>
                  <div className='w-12 h-12 bg-[#C9A962]/20 rounded-full flex items-center justify-center mb-4'>
                    <svg className='w-6 h-6 text-[#C9A962]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                  </div>
                  <h3 className='text-white font-semibold mb-2'>30-Day Returns</h3>
                  <p className='text-white/60 text-sm'>Return within 30 days of purchase for a full refund. Item must be unused and in original packaging.</p>
                </div>
                <div className='bg-[#0D0D0D] rounded-xl p-6'>
                  <div className='w-12 h-12 bg-[#C9A962]/20 rounded-full flex items-center justify-center mb-4'>
                    <svg className='w-6 h-6 text-[#C9A962]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4' />
                    </svg>
                  </div>
                  <h3 className='text-white font-semibold mb-2'>Free Exchanges</h3>
                  <p className='text-white/60 text-sm'>Exchange for a different size or scent at no additional cost. One exchange per order.</p>
                </div>
              </div>
            </div>

            <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-white mb-6'>How to Return</h2>
              <div className='space-y-6'>
                {[
                  { step: '01', title: 'Request a Return', desc: 'Contact our support team via email or the returns form below to initiate your return request.' },
                  { step: '02', title: 'Receive Return Label', desc: 'We\'ll email you a prepaid shipping label and return instructions within 24 hours.' },
                  { step: '03', title: 'Ship Your Item', desc: 'Pack the item securely in its original packaging and drop it off at any authorized shipping location.' },
                  { step: '04', title: 'Get Your Refund', desc: 'Once received, your refund will be processed within 5-7 business days to your original payment method.' },
                ].map((item) => (
                  <div key={item.step} className='flex gap-6'>
                    <div className='w-14 h-14 bg-[#C9A962] rounded-full flex items-center justify-center flex-shrink-0'>
                      <span className='text-[#0D0D0D] font-bold text-lg'>{item.step}</span>
                    </div>
                    <div>
                      <h3 className='text-white font-semibold mb-1'>{item.title}</h3>
                      <p className='text-white/60'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12'>
              <h2 className='text-2xl font-semibold text-white mb-6'>Request a Return</h2>
              <form className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='text-white/60 text-sm block mb-2'>Order ID</label>
                    <input
                      type='text'
                      placeholder='SAF-2024-XXXX'
                      className='w-full px-4 py-3 bg-[#0D0D0D] border border-[#2D2D2D] text-white rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors'
                    />
                  </div>
                  <div>
                    <label className='text-white/60 text-sm block mb-2'>Email</label>
                    <input
                      type='email'
                      placeholder='your@email.com'
                      className='w-full px-4 py-3 bg-[#0D0D0D] border border-[#2D2D2D] text-white rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors'
                    />
                  </div>
                </div>
                <div>
                  <label className='text-white/60 text-sm block mb-2'>Reason for Return</label>
                  <select className='w-full px-4 py-3 bg-[#0D0D0D] border border-[#2D2D2D] text-white rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors'>
                    <option value=''>Select a reason</option>
                    <option value='wrong-item'>Wrong item received</option>
                    <option value='defective'>Defective/Damaged product</option>
                    <option value='not-match'>Product not as described</option>
                    <option value='changed-mind'>Changed my mind</option>
                    <option value='other'>Other</option>
                  </select>
                </div>
                <div>
                  <label className='text-white/60 text-sm block mb-2'>Additional Details</label>
                  <textarea
                    rows={4}
                    placeholder='Please describe your return request...'
                    className='w-full px-4 py-3 bg-[#0D0D0D] border border-[#2D2D2D] text-white rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors resize-none'
                  />
                </div>
                <button type='button' className='btn-primary'>
                  Submit Return Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}