import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../services/sound';

interface LaunchScreenProps {
  onFinish: () => void;
}

const LETTERS = [
  { char: 'A', id: 'l_a' },
  { char: 'C', id: 'l_c' },
  { char: 'E', id: 'l_e' },
  { char: ' ', id: 'l_space' },
  { char: 'I', id: 'l_i' },
  { char: 'T', id: 'l_t' },
];

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onFinish }) => {
  const [showTagline, setShowTagline] = useState(false);
  const [shining, setShining] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Play subtle startup chime
    sound.tap();

    // 0.8s: Shine sweep across logo
    const shineTimer = setTimeout(() => {
      setShining(true);
    }, 750);

    // 1.1s: Tagline fades in
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 1050);

    // 2.0s: Begin smooth fade out
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2000);

    // 2.3s: Complete and unmount
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2350);

    return () => {
      clearTimeout(shineTimer);
      clearTimeout(taglineTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!fadingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090E] text-white select-none overflow-hidden"
        >
          {/* Subtle warm background aura */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.35 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-indigo-600/20 blur-3xl pointer-events-none"
          />

          {/* Core Logo Container */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ delay: 0.9, duration: 0.45, ease: 'easeInOut' }}
            className="relative flex flex-col items-center justify-center z-10"
          >
            {/* Sequential 3D letter reveal */}
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              {LETTERS.map((item, index) => {
                if (item.char === ' ') {
                  return <div key={item.id} className="w-3 sm:w-5" />;
                }
                return (
                  <motion.span
                    key={item.id}
                    initial={{ opacity: 0, y: 32, scale: 0.65, rotateX: 45 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    transition={{
                      delay: 0.15 + index * 0.09,
                      type: 'spring',
                      stiffness: 380,
                      damping: 22,
                    }}
                    className="relative text-5xl sm:text-6xl font-black tracking-tight"
                    style={{
                      textShadow:
                        '0 2px 4px rgba(0,0,0,0.8), 0 10px 25px rgba(251, 146, 60, 0.3)',
                    }}
                  >
                    <span
                      className={`inline-block ${
                        shining ? 'text-shine' : 'text-white'
                      }`}
                    >
                      {item.char}
                    </span>
                  </motion.span>
                );
              })}
            </div>

            {/* Subtle gloss line reflection below logo */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.6 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="w-28 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-3"
            />

            {/* Tagline */}
            <div className="h-8 flex items-center justify-center mt-3">
              <AnimatePresence>
                {showTagline && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="text-sm font-medium tracking-wide text-slate-300"
                  >
                    Build your streak. Ace your goals.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom subtle brand credit */}
          <div className="absolute bottom-8 text-[11px] text-slate-400 tracking-wider uppercase font-medium">
            Accountability · Streaks · Pearls
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
