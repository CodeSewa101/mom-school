import { useEffect, useState } from "react";

const messages = [
  "🎓 Admissions open for 2025-26 academic year!",
  "🏫 School will remain closed on Monday for maintenance.",
  "🏆 Annual sports day scheduled for next month.",
  "👪 Parent-teacher meetings next week - check schedule.",
  "📚 New library resources now available for students.",
  "🚌 School bus routes updated - please check notices.",
  "🥇 Congratulations to our science fair winners!",
];

export default function MessageScroll() {
  const [currentMessages, setCurrentMessages] = useState([
    messages[0],
    messages[1],
  ]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Cycle through messages every 5 seconds
    const messageInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
      setCurrentMessages([
        messages[index],
        messages[(index + 1) % messages.length],
      ]);
    }, 5000);

    return () => clearInterval(messageInterval);
  }, [index]);

  return (
    <div className="bg-blue-600 text-white py-3 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-center">
        <span className="font-semibold mr-3 whitespace-nowrap shrink-0">
          Announcements:
        </span>

        <div className="relative overflow-hidden flex-1">
          <div className="whitespace-nowrap inline-block animate-marquee">
            {currentMessages.join(" ••• ")} ••• {currentMessages.join(" ••• ")}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
          padding-left: 100%;
        }
      `}</style>
    </div>
  );
}
