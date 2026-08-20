import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#FCF2E5] flex items-center justify-center p-4">
      <div className="bg-white border border-[#A8A492]/40 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <div className="w-16 h-16 bg-[#EC5B38]/10 text-[#EC5B38] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-[#524646] mb-2">Bid Successful!</h1>
        <p className="text-[#524646]/75 text-sm mb-8 leading-relaxed">
          Your payment is being processed. It may take a few moments for the leaderboard to update.
        </p>
        
        <Link 
          href="/" 
          className="inline-block w-full py-3 px-4 bg-[#EC5B38] hover:bg-[#d94d2c] text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          Return to Leaderboard
        </Link>
      </div>
    </main>
  );
}
