import React, { useState, useEffect } from 'react';
import { Heart, Stars, Sparkles, Send, CheckCircle2, Camera, MessageCircleHeart, ArrowRight } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * 1. FIREBASE CONFIGURATION
 * IMPORTANT: Fill these in from your Firebase Console!
 */
const firebaseConfig = {
  apiKey: "AIzaSyDgQKGT34wxYCMkbaE4s4F0WzI_tkPCz98",
  authDomain: "valentine-a7314.firebaseapp.com",
  projectId: "valentine-a7314",
  storageBucket: "valentine-a7314.firebasestorage.app",
  messagingSenderId: "827274786731",
  appId: "1:827274786731:web:3a5522dbe62ddeae7d84ee",
  measurementId: "G-FSB9YL8BET"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const proposalId = 'web-v';

/**
 * 2. STYLING FALLBACK
 */
const GlobalStyles = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/base.min.css');
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
    
    .font-handwriting { font-family: 'Dancing+Script', cursive; }
    
    @keyframes heartbeat {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    .animate-heartbeat { animation: heartbeat 1.5s infinite; }
    
    body { 
      background-color: #fff5f7; 
      margin: 0; 
      overflow-x: hidden; 
      /* [CHANGE] added touch-action: manipulation to prevent accidental zooming/delays on mobile taps */
      touch-action: manipulation;
    }

    /* [CHANGE] Added smooth transition class for the dodging "No" button movement */
    .dodge-button {
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `}</style>
);

// ==========================================
// MODULAR UI COMPONENTS
// ==========================================

const FloatingHearts = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(15)].map((_, i) => (
      <div 
        key={i}
        className="absolute animate-bounce text-pink-300 opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${3 + Math.random() * 4}s`,
          animationDelay: `${Math.random() * 2}s`
        }}
      >
        <Heart size={20 + Math.random() * 20} fill="currentColor" />
      </div>
    ))}
  </div>
);

const Card = ({ children, className = "" }) => (
  /* [CHANGE] Added responsive padding (p-6 on mobile, p-8 on desktop) */
  <div className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-white/50 w-full max-w-md ${className}`}>
    {children}
  </div>
);

// ==========================================
// PAGE COMPONENTS
// ==========================================

const IntroPage = ({ onNext }) => (
  <Card className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
    <div className="flex justify-center">
      <div className="relative p-6 bg-rose-50 rounded-full text-rose-500 shadow-inner">
        <Heart size={64} fill="currentColor" className="animate-heartbeat" />
      </div>
    </div>
    <div className="space-y-4">
      <h1 className="text-3xl md:text-4xl font-black text-rose-600 tracking-tight">Hi Baby...</h1>
      <p className="text-base md:text-lg text-rose-700 font-medium leading-relaxed">
        I built this little tiny thingy just to tell you something special.
      </p>
    </div>
    <button 
      onClick={onNext}
      className="group w-full bg-rose-500 hover:bg-rose-600 text-white py-4 md:py-5 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
    >
      Step Inside <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
    </button>
  </Card>
);

const PhotoPage = ({ onNext }) => (
  <div className="space-y-8 animate-in slide-in-from-bottom duration-700 w-full flex flex-col items-center max-w-md">
    {/* [CHANGE] Reduced image border and padding for mobile view (p-3 md:p-4) */}
    <div className="bg-white p-3 md:p-4 pb-12 md:pb-16 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500 rounded-sm border-4 md:border-8 border-white">
      {/* [CHANGE] Set responsive width/height for the photo (w-56 on mobile, w-72 on desktop) */}
      <div className="relative w-56 h-56 md:w-72 md:h-72 bg-rose-100 overflow-hidden rounded-sm group">
        <img 
          src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800" 
          alt="Memory" 
          className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
        />
      </div>
      <div className="mt-4 md:mt-6 text-center">
        <p className="text-2xl md:text-3xl text-rose-800 opacity-80 italic font-handwriting">
          My favorite person ✨
        </p>
      </div>
    </div>
    <button 
      onClick={onNext}
      className="w-full bg-white/90 text-rose-600 py-4 rounded-2xl font-bold border-2 border-rose-100 shadow-lg flex items-center justify-center gap-3"
    >
      <Camera size={20} /> Keep going...
    </button>
  </div>
);

const NotesPage = ({ onNext }) => {
  const [revealed, setRevealed] = useState([]);
  const notes = [
    { id: 1, text: "You're my safe place", icon: "💖" },
    { id: 2, text: "Your laugh is music", icon: "✨" },
    { id: 3, text: "You make me better", icon: "🌱" },
    { id: 4, text: "Forever with you?", icon: "💍" }
  ];

  const handleReveal = (id) => {
    if (!revealed.includes(id)) setRevealed([...revealed, id]);
  };

  return (
    <Card className="text-center space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-rose-600">Tap to reveal my secrets...</h2>
      </div>
      {/* [CHANGE] Adjusted gap for mobile (gap-3) vs desktop (gap-4) */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => handleReveal(n.id)}
            /* [CHANGE] Adjusted card height for mobile (h-24) */
            className={`h-24 md:h-32 rounded-3xl transition-all duration-500 p-2 md:p-4 border-2 flex flex-col items-center justify-center ${
              revealed.includes(n.id) ? 'bg-rose-50 border-rose-200' : 'bg-white border-dashed border-rose-100'
            }`}
          >
            <span className={`text-2xl md:text-3xl mb-1 md:mb-2 ${revealed.includes(n.id) ? 'opacity-100' : 'opacity-20'}`}>{n.icon}</span>
            {revealed.includes(n.id) && <span className="text-[10px] md:text-xs font-bold text-rose-700">{n.text}</span>}
          </button>
        ))}
      </div>
      {revealed.length === notes.length && (
        <button onClick={onNext} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold animate-bounce shadow-xl">
          Okay, I'm ready...
        </button>
      )}
    </Card>
  );
};

const QuestionPage = ({ onYes }) => {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [yesSize, setYesSize] = useState(1);

  const dodge = () => {
    /* [CHANGE] Improved boundary logic to keep the button visible on mobile screens */
    const padding = 80;
    const x = Math.random() * (window.innerWidth - padding * 2) + padding / 2;
    const y = Math.random() * (window.innerHeight - padding * 2) + padding / 2;
    setNoPos({ x, y });
    setYesSize(prev => prev + 0.15);
  };

  return (
    <div className="text-center space-y-8 md:space-y-12 py-10 w-full animate-in zoom-in duration-500 max-w-md">
      <h2 className="text-4xl md:text-5xl font-black text-rose-600 leading-tight px-4">Will you be my Valentine?</h2>
      <div className="flex flex-col items-center gap-8 relative min-h-[350px] justify-center">
        <button 
          onClick={onYes}
          /* [CHANGE] Added scale transition so the YES button grows smoothly */
          style={{ transform: `scale(${yesSize})`, transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
          className="z-20 bg-green-500 text-white px-10 md:px-16 py-5 md:py-6 rounded-3xl font-black text-2xl md:text-3xl shadow-[0_10px_0_rgb(22,163,74)] active:shadow-none active:translate-y-2"
        >
          YES!
        </button>
        
        {/* DODGING BUTTON */}
        <button 
          onMouseEnter={dodge} // For Desktop
          /* [CHANGE] Added onTouchStart listener to catch taps on phone screens before they "click" */
          onTouchStart={(e) => {
            e.preventDefault(); // Prevents actual click and jumps immediately on touch
            dodge();
          }}
          className="bg-white text-rose-400 px-8 py-3 rounded-xl font-bold shadow-md border border-rose-50 dodge-button"
          style={noPos.x ? { 
            position: 'fixed', 
            left: `${noPos.x}px`, 
            top: `${noPos.y}px`, 
            zIndex: 50,
            /* [CHANGE] Added transform: translate(-50%, -50%) to ensure the button is perfectly centered on its coordinates */
            transform: 'translate(-50%, -50%)' 
          } : {}}
        >
          No
        </button>
      </div>
    </div>
  );
};

const FeelingsPage = ({ onSubmit, isSaving }) => {
  const [text, setText] = useState("");
  return (
    <Card className="text-center space-y-6 animate-in slide-in-from-bottom duration-700">
      <h2 className="text-xl md:text-2xl font-bold text-rose-600">How do you feel about me?</h2>
      {/* [CHANGE] Adjusted textarea height for mobile (h-32 vs h-40) */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message here..."
        className="w-full h-32 md:h-40 p-4 rounded-2xl border-2 border-rose-100 focus:border-rose-300 outline-none resize-none font-medium text-rose-800"
      />
      <button 
        onClick={() => onSubmit(text)}
        disabled={isSaving}
        className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
      >
        {isSaving ? "Sending..." : "Send to my heart"} <Send size={18} />
      </button>
    </Card>
  );
};

const SuccessPage = () => (
  <Card className="text-center space-y-6 md:space-y-8 animate-in zoom-in duration-1000 p-8 md:p-12">
    <div className="flex justify-center">
      <div className="bg-rose-500 p-6 md:p-8 rounded-full shadow-2xl animate-pulse">
        <Heart size={60} md:size={80} fill="white" className="text-white" />
      </div>
    </div>
    <div className="space-y-2">
      <h2 className="text-3xl md:text-5xl font-black text-rose-600 uppercase">Success!</h2>
      <p className="text-lg md:text-2xl font-bold text-rose-800">You're mine now! 🔒❤️</p>
    </div>
    <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-bold border border-green-100">
      It's official!
    </div>
  </Card>
);

// ==========================================
// MAIN CONTROLLER
// ==========================================

export default function App() {
  const [page, setPage] = useState('intro');
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error("Auth:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const onYes = async () => {
    setPage('feelings');
    if (!user) return;
    try {
      await addDoc(collection(db, 'proposals', proposalId, 'responses'), {
        answer: 'YES',
        timestamp: serverTimestamp(),
        uid: user.uid
      });
    } catch (e) { console.error(e); }
  };

  const onFeelings = async (message) => {
    setSaving(true);
    if (user && message.trim()) {
      try {
        await addDoc(collection(db, 'proposals', proposalId, 'feelings'), {
          message,
          timestamp: serverTimestamp(),
          uid: user.uid
        });
      } catch (e) { console.error(e); }
    }
    setSaving(false);
    setPage('success');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-rose-900 relative">
      <GlobalStyles />
      <FloatingHearts />
      <div className="max-w-md w-full z-10 flex flex-col items-center px-4">
        {page === 'intro' && <IntroPage onNext={() => setPage('photo')} />}
        {page === 'photo' && <PhotoPage onNext={() => setPage('notes')} />}
        {page === 'notes' && <NotesPage onNext={() => setPage('question')} />}
        {page === 'question' && <QuestionPage onYes={onYes} />}
        {page === 'feelings' && <FeelingsPage onSubmit={onFeelings} isSaving={saving} />}
        {page === 'success' && <SuccessPage />}
      </div>
      <footer className="fixed bottom-6 text-rose-300 font-bold tracking-tighter text-[10px] uppercase">
        Valentine's Proposal
      </footer>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { Heart, Stars, Sparkles, Send, CheckCircle2, Camera, MessageCircleHeart, ArrowRight } from 'lucide-react';
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// /**
//  * FIREBASE SERVER CONTEXT
//  * Replace these empty strings with your actual Firebase project keys
//  * from the Firebase Console (Project Settings > General > Your Apps)
//  */
// const firebaseConfig = {
//   apiKey: "AIzaSyDgQKGT34wxYCMkbaE4s4F0WzI_tkPCz98",
//   authDomain: "valentine-a7314.firebaseapp.com",
//   projectId: "valentine-a7314",
//   storageBucket: "valentine-a7314.firebasestorage.app",
//   messagingSenderId: "827274786731",
//   appId: "1:827274786731:web:3a5522dbe62ddeae7d84ee",
//   measurementId: "G-FSB9YL8BET"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const proposalId = 'web-v';

// // ==========================================
// // MODULAR UI COMPONENTS
// // ==========================================

// const FloatingHearts = () => (
//   <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
//     {[...Array(15)].map((_, i) => (
//       <div 
//         key={i}
//         className="absolute animate-bounce text-pink-300 opacity-20"
//         style={{
//           left: `${Math.random() * 100}%`,
//           top: `${Math.random() * 100}%`,
//           animationDuration: `${3 + Math.random() * 4}s`,
//           animationDelay: `${Math.random() * 2}s`
//         }}
//       >
//         <Heart size={20 + Math.random() * 20} fill="currentColor" />
//       </div>
//     ))}
//   </div>
// );

// const Container = ({ children }) => (
//   <div className="max-w-md w-full z-10 flex flex-col items-center px-4">
//     {children}
//   </div>
// );

// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white/50 w-full ${className}`}>
//     {children}
//   </div>
// );

// // ==========================================
// // PAGE COMPONENTS
// // ==========================================

// const IntroPage = ({ onNext }) => (
//   <Card className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
//     <div className="flex justify-center">
//       <div className="relative p-6 bg-rose-50 rounded-full text-rose-500 shadow-inner">
//         <Heart size={64} fill="currentColor" className="animate-pulse" />
//       </div>
//     </div>
//     <div className="space-y-4">
//       <h1 className="text-4xl font-black text-rose-600 tracking-tight">Hi Baby...</h1>
//       <p className="text-lg text-rose-700 font-medium">
//         I built this little something just to tell you something special.
//       </p>
//     </div>
//     <button 
//       onClick={onNext}
//       className="group w-full bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
//     >
//       Step Inside <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
//     </button>
//   </Card>
// );

// const PhotoPage = ({ onNext }) => (
//   <div className="space-y-8 animate-in slide-in-from-bottom duration-700 w-full flex flex-col items-center">
//     <div className="bg-white p-4 pb-16 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500 rounded-sm border-8 border-white">
//       <div className="relative w-72 h-72 bg-rose-100 overflow-hidden rounded-sm group">
//         <img 
//           src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800" 
//           alt="Memory" 
//           className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
//         />
//       </div>
//       <div className="mt-6 text-center">
//         <p className="text-2xl text-rose-800 opacity-80 italic font-serif">
//           My favorite person ✨
//         </p>
//       </div>
//     </div>
//     <button 
//       onClick={onNext}
//       className="w-full bg-white/90 text-rose-600 py-4 rounded-2xl font-bold border-2 border-rose-100 shadow-lg flex items-center justify-center gap-3"
//     >
//       <Camera size={20} /> Keep going...
//     </button>
//   </div>
// );

// const NotesPage = ({ onNext }) => {
//   const [revealed, setRevealed] = useState([]);
//   const notes = [
//     { id: 1, text: "You're my safe place", icon: "💖" },
//     { id: 2, text: "Your laugh is music", icon: "✨" },
//     { id: 3, text: "You make me better", icon: "🌱" },
//     { id: 4, text: "Forever with you?", icon: "💍" }
//   ];

//   const handleReveal = (id) => {
//     if (!revealed.includes(id)) setRevealed([...revealed, id]);
//   };

//   return (
//     <Card className="text-center space-y-8 animate-in fade-in duration-700">
//       <div className="space-y-2">
//         <h2 className="text-2xl font-bold text-rose-600">Tap to reveal my secrets...</h2>
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         {notes.map((n) => (
//           <button
//             key={n.id}
//             onClick={() => handleReveal(n.id)}
//             className={`h-32 rounded-3xl transition-all duration-500 p-4 border-2 flex flex-col items-center justify-center ${
//               revealed.includes(n.id) ? 'bg-rose-50 border-rose-200' : 'bg-white border-dashed border-rose-100'
//             }`}
//           >
//             <span className={`text-3xl mb-2 ${revealed.includes(n.id) ? 'opacity-100' : 'opacity-20'}`}>{n.icon}</span>
//             {revealed.includes(n.id) && <span className="text-xs font-bold text-rose-700">{n.text}</span>}
//           </button>
//         ))}
//       </div>
//       {revealed.length === notes.length && (
//         <button onClick={onNext} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold animate-bounce shadow-xl">
//           Okay, I'm ready...
//         </button>
//       )}
//     </Card>
//   );
// };

// const QuestionPage = ({ onYes }) => {
//   const [noPos, setNoPos] = useState({ x: 0, y: 0 });
//   const [yesSize, setYesSize] = useState(1);

//   const moveNo = () => {
//     setNoPos({
//       x: Math.random() * (window.innerWidth - 200) + 100,
//       y: Math.random() * (window.innerHeight - 200) + 100
//     });
//     setYesSize(prev => prev + 0.15);
//   };

//   return (
//     <div className="text-center space-y-12 py-10 w-full animate-in zoom-in duration-500">
//       <h2 className="text-5xl font-black text-rose-600 leading-tight">Will you be my Valentine?</h2>
//       <div className="flex flex-col items-center gap-8 relative min-h-[300px]">
//         <button 
//           onClick={onYes}
//           style={{ transform: `scale(${yesSize})` }}
//           className="z-20 bg-green-500 text-white px-16 py-6 rounded-3xl font-black text-3xl shadow-[0_10px_0_rgb(22,163,74)] active:shadow-none active:translate-y-2 transition-transform"
//         >
//           YES!
//         </button>
//         <button 
//           onMouseEnter={moveNo}
//           className="bg-white text-rose-400 px-8 py-3 rounded-xl font-bold shadow-md border border-rose-50"
//           style={noPos.x ? { position: 'fixed', left: noPos.x, top: noPos.y, zIndex: 50 } : {}}
//         >
//           No
//         </button>
//       </div>
//     </div>
//   );
// };

// const FeelingsPage = ({ onSubmit, isSaving }) => {
//   const [text, setText] = useState("");
//   return (
//     <Card className="text-center space-y-6 animate-in slide-in-from-bottom duration-700">
//       <h2 className="text-2xl font-bold text-rose-600">How do you feel about me?</h2>
//       <textarea
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Type your message here..."
//         className="w-full h-40 p-4 rounded-2xl border-2 border-rose-100 focus:border-rose-300 outline-none resize-none font-medium"
//       />
//       <button 
//         onClick={() => onSubmit(text)}
//         disabled={isSaving}
//         className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
//       >
//         {isSaving ? "Sending..." : "Send to my heart"} <Send size={18} />
//       </button>
//     </Card>
//   );
// };

// const SuccessPage = () => (
//   <Card className="text-center space-y-8 animate-in zoom-in duration-1000 p-12">
//     <div className="flex justify-center">
//       <div className="bg-rose-500 p-8 rounded-full shadow-2xl animate-pulse">
//         <Heart size={80} fill="white" className="text-white" />
//       </div>
//     </div>
//     <div className="space-y-2">
//       <h2 className="text-5xl font-black text-rose-600 uppercase">Success!</h2>
//       <p className="text-2xl font-bold text-rose-800">You're mine now! 🔒❤️</p>
//     </div>
//     <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-bold border border-green-100">
//       It's official!
//     </div>
//   </Card>
// );

// // ==========================================
// // MAIN CONTROLLER
// // ==========================================

// export default function App() {
//   const [page, setPage] = useState('intro');
//   const [user, setUser] = useState(null);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         await signInAnonymously(auth);
//       } catch (err) { console.error("Auth:", err); }
//     };
//     initAuth();
//     const unsubscribe = onAuthStateChanged(auth, setUser);
//     return () => unsubscribe();
//   }, []);

//   const onYes = async () => {
//     setPage('feelings');
//     if (!user) return;
//     try {
//       await addDoc(collection(db, 'proposals', proposalId, 'responses'), {
//         answer: 'YES',
//         timestamp: serverTimestamp(),
//         uid: user.uid
//       });
//     } catch (e) { console.error(e); }
//   };

//   const onFeelings = async (message) => {
//     setSaving(true);
//     if (user && message.trim()) {
//       try {
//         await addDoc(collection(db, 'proposals', proposalId, 'feelings'), {
//           message,
//           timestamp: serverTimestamp(),
//           uid: user.uid
//         });
//       } catch (e) { console.error(e); }
//     }
//     setSaving(false);
//     setPage('success');
//   };

//   return (
//     <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center justify-center p-4 font-sans text-rose-900 relative">
//       <FloatingHearts />
//       <Container>
//         {page === 'intro' && <IntroPage onNext={() => setPage('photo')} />}
//         {page === 'photo' && <PhotoPage onNext={() => setPage('notes')} />}
//         {page === 'notes' && <NotesPage onNext={() => setPage('question')} />}
//         {page === 'question' && <QuestionPage onYes={onYes} />}
//         {page === 'feelings' && <FeelingsPage onSubmit={onFeelings} isSaving={saving} />}
//         {page === 'success' && <SuccessPage />}
//       </Container>
//       <footer className="fixed bottom-6 text-rose-300 font-bold tracking-tighter text-[10px] uppercase">
//         Valentine's Proposal
//       </footer>
//     </div>
//   );
// }

