import { useState, useEffect } from 'react';

interface TerminalProps {
  commands: string[];
  loop?: boolean;
}

export const Terminal = ({ commands, loop = true }: TerminalProps) => {
  const [currentCommand, setCurrentCommand] = useState(0);
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const command = commands[currentCommand];

    const typingInterval = setInterval(() => {
      if (currentIndex <= command.length) {
        setText(command.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCurrentCommand((prev) => 
            loop ? (prev + 1) % commands.length : 
            prev < commands.length - 1 ? prev + 1 : prev
          );
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [currentCommand, commands, loop]);

  return (
    <div className="terminal glass-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </div>
      <div className="font-mono">
        <span className="text-green-400">$ </span>
        {text}
        {showCursor && <span className="animate-cursor-blink">|</span>}
      </div>
    </div>
  );
};