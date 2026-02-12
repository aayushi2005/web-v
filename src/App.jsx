import React, { useState, useEffect } from 'react';
import { Heart, Stars, Sparkles, Send, CheckCircle2, Camera, MessageCircleHeart, ArrowRight } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * FIREBASE SERVER CONTEXT
 * Replace these empty strings with your actual Firebase project keys
 * from the Firebase Console (Project Settings > General > Your Apps)
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

const Container = ({ children }) => (
  <div className="max-w-md w-full z-10 flex flex-col items-center px-4">
    {children}
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white/50 w-full ${className}`}>
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
        <Heart size={64} fill="currentColor" className="animate-pulse" />
      </div>
    </div>
    <div className="space-y-4">
      <h1 className="text-4xl font-black text-rose-600 tracking-tight">Hi Baby...</h1>
      <p className="text-lg text-rose-700 font-medium">
        I built this little something just to tell you something special.
      </p>
    </div>
    <button 
      onClick={onNext}
      className="group w-full bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
    >
      Step Inside <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
    </button>
  </Card>
);

const PhotoPage = ({ onNext }) => (
  <div className="space-y-8 animate-in slide-in-from-bottom duration-700 w-full flex flex-col items-center">
    <div className="bg-white p-4 pb-16 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500 rounded-sm border-8 border-white">
      <div className="relative w-72 h-72 bg-rose-100 overflow-hidden rounded-sm group">
        <img 
          src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800" 
          alt="Memory" 
          className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
        />
      </div>
      <div className="mt-6 text-center">
        <p className="text-2xl text-rose-800 opacity-80 italic font-serif">
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
    <Card className="text-center space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-rose-600">Tap to reveal my secrets...</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => handleReveal(n.id)}
            className={`h-32 rounded-3xl transition-all duration-500 p-4 border-2 flex flex-col items-center justify-center ${
              revealed.includes(n.id) ? 'bg-rose-50 border-rose-200' : 'bg-white border-dashed border-rose-100'
            }`}
          >
            <span className={`text-3xl mb-2 ${revealed.includes(n.id) ? 'opacity-100' : 'opacity-20'}`}>{n.icon}</span>
            {revealed.includes(n.id) && <span className="text-xs font-bold text-rose-700">{n.text}</span>}
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

  const moveNo = () => {
    setNoPos({
      x: Math.random() * (window.innerWidth - 200) + 100,
      y: Math.random() * (window.innerHeight - 200) + 100
    });
    setYesSize(prev => prev + 0.15);
  };

  return (
    <div className="text-center space-y-12 py-10 w-full animate-in zoom-in duration-500">
      <h2 className="text-5xl font-black text-rose-600 leading-tight">Will you be my Valentine?</h2>
      <div className="flex flex-col items-center gap-8 relative min-h-[300px]">
        <button 
          onClick={onYes}
          style={{ transform: `scale(${yesSize})` }}
          className="z-20 bg-green-500 text-white px-16 py-6 rounded-3xl font-black text-3xl shadow-[0_10px_0_rgb(22,163,74)] active:shadow-none active:translate-y-2 transition-transform"
        >
          YES!
        </button>
        <button 
          onMouseEnter={moveNo}
          className="bg-white text-rose-400 px-8 py-3 rounded-xl font-bold shadow-md border border-rose-50"
          style={noPos.x ? { position: 'fixed', left: noPos.x, top: noPos.y, zIndex: 50 } : {}}
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
      <h2 className="text-2xl font-bold text-rose-600">How do you feel about me?</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message here..."
        className="w-full h-40 p-4 rounded-2xl border-2 border-rose-100 focus:border-rose-300 outline-none resize-none font-medium"
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
  <Card className="text-center space-y-8 animate-in zoom-in duration-1000 p-12">
    <div className="flex justify-center">
      <div className="bg-rose-500 p-8 rounded-full shadow-2xl animate-pulse">
        <Heart size={80} fill="white" className="text-white" />
      </div>
    </div>
    <div className="space-y-2">
      <h2 className="text-5xl font-black text-rose-600 uppercase">Success!</h2>
      <p className="text-2xl font-bold text-rose-800">You're mine now! 🔒❤️</p>
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
    <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center justify-center p-4 font-sans text-rose-900 relative">
      <FloatingHearts />
      <Container>
        {page === 'intro' && <IntroPage onNext={() => setPage('photo')} />}
        {page === 'photo' && <PhotoPage onNext={() => setPage('notes')} />}
        {page === 'notes' && <NotesPage onNext={() => setPage('question')} />}
        {page === 'question' && <QuestionPage onYes={onYes} />}
        {page === 'feelings' && <FeelingsPage onSubmit={onFeelings} isSaving={saving} />}
        {page === 'success' && <SuccessPage />}
      </Container>
      <footer className="fixed bottom-6 text-rose-300 font-bold tracking-tighter text-[10px] uppercase">
        Valentine's Proposal
      </footer>
    </div>
  );
}

// import React, { useState, useEffect, useRef } from 'react';
// import { Heart, Stars, Sparkles, Music, Send, CheckCircle2, Camera, MessageCircleHeart, ArrowRight, PenTool } from 'lucide-react';
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// // ==========================================
// // 1. CONFIGURATION & INITIALIZATION (Server Context)
// // ==========================================
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
// const appId = typeof __app_id !== 'undefined' ? __app_id : 'web-v';

// // ==========================================
// // 2. SHARED COMPONENTS (UI Kit)
// // ==========================================

// const FloatingHearts = () => (
//   <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
//     {[...Array(20)].map((_, i) => (
//       <div 
//         key={i}
//         className="absolute animate-bounce text-pink-300 opacity-30"
//         style={{
//           left: `${Math.random() * 100}%`,
//           top: `${Math.random() * 100}%`,
//           animationDuration: `${3 + Math.random() * 5}s`,
//           animationDelay: `${Math.random() * 2}s`
//         }}
//       >
//         <Heart size={16 + Math.random() * 24} fill="currentColor" />
//       </div>
//     ))}
//   </div>
// );

// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white/90 backdrop-blur-lg rounded-[2rem] shadow-2xl p-8 border border-pink-100 ${className}`}>
//     {children}
//   </div>
// );

// // ==========================================
// // 3. PAGE COMPONENTS
// // ==========================================

// const IntroPage = ({ onNext }) => (
//   <Card className="text-center space-y-8 animate-in fade-in zoom-in duration-1000 p-10">
//     <div className="relative inline-block">
//       <div className="absolute -inset-4 bg-pink-100 rounded-full animate-ping opacity-20"></div>
//       <div className="relative p-6 bg-rose-50 rounded-full text-rose-500">
//         <Heart size={64} fill="currentColor" className="animate-pulse" />
//       </div>
//     </div>
//     <div className="space-y-4">
//       <h1 className="text-4xl font-black text-rose-600 tracking-tight">Hi Handsome...</h1>
//       <p className="text-lg text-rose-700/80 leading-relaxed font-medium">
//         I built this little corner of the internet just to tell you something special.
//       </p>
//     </div>
//     <button 
//       onClick={onNext}
//       className="group w-full bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-rose-200 flex items-center justify-center gap-3 text-lg"
//     >
//       Step Inside <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
//     </button>
//   </Card>
// );

// const PhotoPage = ({ onNext }) => (
//   <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
//     <div className="bg-white p-4 pb-16 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 rounded-sm border-8 border-white">
//       <div className="relative aspect-square bg-rose-100 overflow-hidden rounded-sm group">
//         <img 
//           src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop" 
//           alt="Us" 
//           className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
//           onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=Our+Memory" }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
//           <p className="text-white font-medium italic">"My favorite view in the whole world..."</p>
//         </div>
//       </div>
//       <div className="mt-6 text-center">
//         <p className="font-handwriting text-2xl text-rose-800 opacity-80" style={{ fontFamily: 'cursive' }}>
//           Our happy place ✨
//         </p>
//       </div>
//     </div>
    
//     <button 
//       onClick={onNext}
//       className="w-full bg-white/80 backdrop-blur-sm text-rose-600 py-4 rounded-2xl font-bold border-2 border-rose-100 hover:border-rose-300 transition-all shadow-lg flex items-center justify-center gap-3"
//     >
//       <Camera size={20} /> Keep going...
//     </button>
//   </div>
// );

// const NotesPage = ({ onNext }) => {
//   const [revealed, setRevealed] = useState([]);
//   const loveNotes = [
//     { id: 1, text: "You're my favorite person", icon: "💖" },
//     { id: 2, text: "I love your laugh", icon: "✨" },
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
//         <p className="text-sm text-rose-400">Can you find all four?</p>
//       </div>
      
//       <div className="grid grid-cols-2 gap-4">
//         {loveNotes.map((note) => (
//           <button
//             key={note.id}
//             onClick={() => handleReveal(note.id)}
//             className={`h-32 rounded-2xl transition-all duration-500 transform hover:scale-105 flex flex-col items-center justify-center p-4 border-2 ${
//               revealed.includes(note.id) 
//                 ? 'bg-rose-50 border-rose-200 rotate-0' 
//                 : 'bg-white border-dashed border-rose-100 text-transparent rotate-3'
//             }`}
//           >
//             <span className={`text-3xl mb-2 transition-opacity ${revealed.includes(note.id) ? 'opacity-100' : 'opacity-20'}`}>
//               {note.icon}
//             </span>
//             <span className={`text-sm font-bold text-rose-700 leading-tight ${revealed.includes(note.id) ? 'opacity-100' : 'opacity-0'}`}>
//               {note.text}
//             </span>
//           </button>
//         ))}
//       </div>

//       {revealed.length === loveNotes.length && (
//         <button 
//           onClick={onNext}
//           className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold animate-bounce shadow-xl mt-4"
//         >
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
//     const padding = 100;
//     const newX = Math.random() * (window.innerWidth - padding * 2) + padding;
//     const newY = Math.random() * (window.innerHeight - padding * 2) + padding;
//     setNoPos({ x: newX, y: newY });
//     setYesSize(prev => prev + 0.15);
//   };

//   return (
//     <div className="space-y-12 animate-in zoom-in duration-500 text-center py-10">
//       <div className="space-y-6">
//         <div className="flex justify-center gap-4">
//           <Sparkles className="text-yellow-400 animate-pulse" />
//           <h2 className="text-5xl font-black text-rose-600 leading-tight">
//             Will you be my Valentine?
//           </h2>
//           <Sparkles className="text-yellow-400 animate-pulse" />
//         </div>
//         <div className="bg-rose-100/50 inline-block px-6 py-2 rounded-full text-rose-600 font-bold italic">
//           Choose wisely! ❤️
//         </div>
//       </div>

//       <div className="flex flex-col items-center justify-center gap-8 relative min-h-[300px]">
//         <button 
//           onClick={onYes}
//           style={{ transform: `scale(${yesSize})` }}
//           className="z-20 bg-green-500 hover:bg-green-600 text-white px-16 py-6 rounded-3xl font-black text-3xl transition-all shadow-[0_10px_0_rgb(22,163,74)] active:shadow-none active:translate-y-2"
//         >
//           YES!
//         </button>

//         <button 
//           onMouseEnter={moveNo}
//           onClick={moveNo}
//           className="bg-white text-rose-400 px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:text-rose-600 border border-rose-50"
//           style={noPos.x !== 0 ? {
//             position: 'fixed',
//             left: noPos.x,
//             top: noPos.y,
//             zIndex: 50,
//             transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
//           } : {}}
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
//       <div className="space-y-2">
//         <div className="flex justify-center">
//           <div className="p-4 bg-rose-50 rounded-full text-rose-500">
//             <MessageCircleHeart size={40} />
//           </div>
//         </div>
//         <h2 className="text-2xl font-bold text-rose-600">How do you feel about me?</h2>
//         <p className="text-sm text-rose-400 font-medium">I'd love to hear your heart... ✍️</p>
//       </div>
      
//       <textarea
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Type your message here..."
//         className="w-full h-40 p-4 rounded-2xl border-2 border-rose-100 focus:border-rose-300 focus:ring-0 resize-none text-rose-800 placeholder:text-rose-200 transition-all font-medium"
//       />

//       <button 
//         onClick={() => onSubmit(text)}
//         disabled={isSaving}
//         className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
//       >
//         {isSaving ? "Sending..." : "Send to my heart"} <Send size={18} />
//       </button>
//     </Card>
//   );
// };

// const SuccessPage = ({ isSaving }) => (
//   <Card className="rounded-[3rem] p-12 text-center space-y-8 animate-in zoom-in duration-1000 border-4 border-pink-50">
//     <div className="relative">
//       <div className="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-20 scale-150"></div>
//       <div className="relative bg-rose-500 p-8 rounded-full shadow-xl inline-block">
//         <Heart size={80} fill="white" className="text-white animate-pulse" />
//       </div>
//     </div>
    
//     <div className="space-y-3">
//       <h2 className="text-5xl font-black text-rose-600 uppercase tracking-widest">Success!</h2>
//       <p className="text-2xl font-bold text-rose-800">You're mine now! 🔒❤️</p>
//     </div>

//     <div className="p-5 bg-green-50 rounded-2xl border-2 border-green-100 flex items-center justify-center gap-3 text-green-700 font-bold text-lg">
//       <CheckCircle2 size={24} />
//       {isSaving ? "Locking it in..." : "It's official!"}
//     </div>

//     <div className="flex justify-center gap-4 opacity-40">
//       <Sparkles size={32} className="text-rose-300" />
//       <Heart size={32} fill="currentColor" className="text-rose-300" />
//       <Sparkles size={32} className="text-rose-300" />
//     </div>
//   </Card>
// );

// // ==========================================
// // 4. MAIN APP CONTAINER (Controller/Client Logic)
// // ==========================================

// export default function App() {
//   const [page, setPage] = useState('intro');
//   const [user, setUser] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // Auth Effect
//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
//           await signInWithCustomToken(auth, __initial_auth_token);
//         } else {
//           await signInAnonymously(auth);
//         }
//       } catch (err) { console.error("Auth error:", err); }
//     };
//     initAuth();
//     const unsubscribe = onAuthStateChanged(auth, setUser);
//     return () => unsubscribe();
//   }, []);

//   // Server Actions (Simulated Controller)
//   const submitYesResponse = async () => {
//     setPage('feelings');
//     if (!user) return;
//     setSaving(true);
//     try {
//       await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'responses'), {
//         answer: 'YES!',
//         timestamp: serverTimestamp(),
//         uid: user.uid
//       });
//     } catch (e) { console.error("Error saving response:", e); }
//     finally { setSaving(false); }
//   };

//   const submitFeelings = async (message) => {
//     if (!user || !message.trim()) {
//       setPage('success');
//       return;
//     }
//     setSaving(true);
//     try {
//       await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feelings'), {
//         message,
//         timestamp: serverTimestamp(),
//         uid: user.uid
//       });
//       setPage('success');
//     } catch (e) { console.error("Error saving feelings:", e); }
//     finally { setSaving(false); }
//   };

//   return (
//     <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center justify-center p-4 font-sans text-rose-900 relative overflow-hidden transition-colors duration-1000">
//       <FloatingHearts />

//       <div className="max-w-md w-full z-10">
//         {page === 'intro' && <IntroPage onNext={() => setPage('photo')} />}
//         {page === 'photo' && <PhotoPage onNext={() => setPage('notes')} />}
//         {page === 'notes' && <NotesPage onNext={() => setPage('question')} />}
//         {page === 'question' && <QuestionPage onYes={submitYesResponse} />}
//         {page === 'feelings' && <FeelingsPage onSubmit={submitFeelings} isSaving={saving} />}
//         {page === 'success' && <SuccessPage isSaving={saving} />}
//       </div>

//       <footer className="fixed bottom-6 text-rose-300 font-bold tracking-widest text-xs uppercase z-10">
//         Valentine's Proposal 2024
//       </footer>
//     </div>
//   );
// }