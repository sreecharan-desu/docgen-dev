import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Home, RefreshCw, Compass, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Log the 404 error
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Handle mouse movement for parallax effects
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    setMousePosition({
      x: (clientX - centerX) / 25,
      y: (clientY - centerY) / 25,
    });
  };

  // Increment click counter and show easter egg
  const handleNumberClick = () => {
    setClickCount((prev) => prev + 1);
    if (clickCount >= 3) {
      setShowEasterEgg(true);
    }
  };

  // Random positions for floating elements
  const randomFloaters = Array(5)
    .fill()
    .map((_, i) => ({
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      size: Math.random() * 0.5 + 0.5,
      delay: i * 0.2,
    }));

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen w-full flex items-center justify-center bg-transparent text-white overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Ambient background particles */}
      {Array(20)
        .fill()
        .map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}

      {/* Glowing orb background */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl"
        animate={{
          x: mousePosition.x * 2,
          y: mousePosition.y * 2,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          x: { duration: 0.5 },
          y: { duration: 0.5 },
        }}
      />

      <div className="relative z-10 w-full max-w-3xl px-8">
        <div className="relative flex flex-col items-center">
          {/* 404 Main number */}
          <motion.div
            className="relative"
            animate={{
              rotateY: mousePosition.x * 0.5,
              rotateX: mousePosition.y * -0.5,
            }}
            transition={{ type: "spring", stiffness: 75, damping: 15 }}
          >
            <motion.h1
              className="text-9xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                textShadow: [
                  "0 0 10px rgba(99, 102, 241, 0.8)",
                  "0 0 20px rgba(99, 102, 241, 0.4)",
                  "0 0 10px rgba(99, 102, 241, 0.8)",
                ],
              }}
              transition={{
                duration: 0.8,
                textShadow: { duration: 2, repeat: Infinity },
              }}
              onClick={handleNumberClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              404
            </motion.h1>

            {/* Decorative elements floating around 404 */}
            {randomFloaters.map((floater, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: `calc(50% + ${floater.y}px)`,
                  left: `calc(50% + ${floater.x}px)`,
                  zIndex: -1,
                }}
                animate={{
                  y: [floater.y, floater.y - 10, floater.y],
                  x: [floater.x, floater.x + 5, floater.x],
                  rotate: [0, 360],
                  scale: [floater.size, floater.size * 1.2, floater.size],
                }}
                transition={{
                  duration: 8 - floater.delay * 2,
                  repeat: Infinity,
                  delay: floater.delay,
                }}
              >
                {i % 3 === 0 ? (
                  <div className="w-8 h-8 rounded-md border border-indigo-400/30 backdrop-blur-sm bg-white/5" />
                ) : i % 3 === 1 ? (
                  <div className="w-10 h-1 bg-indigo-500/50 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-purple-400/30 backdrop-blur-sm bg-white/5" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Message text */}
          <motion.div
            className="text-center space-y-6"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
          >
            <motion.h2
              className="text-3xl font-light text-white/90"
              variants={textVariants}
            >
              Page Not Found
            </motion.h2>

            <motion.p
              className="text-lg text-white/60 max-w-md"
              variants={textVariants}
            >
              The page at{" "}
              <span className="font-mono bg-white/10 px-2 py-1 rounded text-sm">
                {location.pathname}
              </span>{" "}
              seems to have wandered off into the digital void.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mt-8"
              variants={textVariants}
            >
              <motion.a
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>Go Home</span>
              </motion.a>

              <motion.button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span>Go Back</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Easter egg animation that appears after clicking 404 three times */}
          {showEasterEgg && (
            <motion.div
              className="absolute top-0 mt-32"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-white/80">
                  You found a secret! Still a 404 though.
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer attribution */}
        <motion.p
          className="text-center text-white/30 text-sm mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Error logged. Our team has been notified.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default NotFound;
