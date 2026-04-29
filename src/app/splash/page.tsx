"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CountdownPill from "@/components/CountdownPill";

const quotes = [
  { quote: "No human is ever limited.", author: "Eliud Kipchoge" },
  { quote: "Stay hard.", author: "David Goggins" },
  { quote: "The mountains are calling and I must go.", author: "John Muir" },
  { quote: "It never always gets worse.", author: "Kilian Jornet" },
  { quote: "Your body can withstand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { quote: "Run when you can, walk when you have to, crawl if you must. Just never give up.", author: "Dean Karnazes" },
  { quote: "The altitude is not your enemy. Your doubt is.", author: "Unknown" },
  { quote: "Leh is not the finish line. It is the proof.", author: "Unknown" },
  { quote: "Pain is temporary. Leh is forever.", author: "Unknown" },
  { quote: "Every kilometre at altitude is worth three at sea level.", author: "Milind Soman" },
  { quote: "We run, not because we think it is doing us good, but because we enjoy it.", author: "Sir Roger Bannister" },
  { quote: "The will to win means nothing without the will to prepare.", author: "Juma Ikangaa" },
  { quote: "Ask yourself: can I give more? The answer is usually yes.", author: "Paul Tergat" },
  { quote: "To give anything less than your best is to sacrifice the gift.", author: "Steve Prefontaine" },
  { quote: "I always loved running. It was something you could do by yourself.", author: "Steve Prefontaine" },
  { quote: "Run the first half with your head, the second half with your heart.", author: "Mike Fanelli" },
  { quote: "The body does not want you to do this. As you run, it tells you to stop. You just tell it to be quiet.", author: "Unknown" },
  { quote: "Champions aren't made in the gyms. Champions are made from something deep inside.", author: "Muhammad Ali" },
  { quote: "It's very hard in the beginning to understand that the whole idea is not to beat the other runners. Eventually you learn that the competition is against the little voice inside you.", author: "George Sheehan" },
  { quote: "The miracle isn't that I finished. The miracle is that I had the courage to start.", author: "John Bingham" },
  { quote: "Somewhere in the world someone is training when you are not. When you race him, he will win.", author: "Tom Fleming" },
  { quote: "Pain is inevitable. Suffering is optional.", author: "Haruki Murakami" },
  { quote: "There will be days you don't think you can run a marathon. There will be a lifetime knowing you have.", author: "Unknown" },
  { quote: "The long run is what puts the tiger in the cat.", author: "Bill Squires" },
  { quote: "Run like hell and get the agony over with.", author: "Clarence DeMar" },
  { quote: "If you run, you are a runner. It doesn't matter how fast or how far.", author: "John Bingham" },
  { quote: "Most people run a race to see who is fastest. I run a race to see who has the most guts.", author: "Steve Prefontaine" },
  { quote: "The obsession with running is really an obsession with the potential for more and more life.", author: "George Sheehan" },
  { quote: "Running is alone time that lets my brain unspool the tangles that build up over days.", author: "Rob Haneisen" },
  { quote: "I run because if I didn't, I'd be sluggish and glum and spend too much time sitting around.", author: "Pam Houston" },
  { quote: "Every morning in Africa, a gazelle wakes up. It knows it must run faster than the fastest lion or it will be killed.", author: "Unknown" },
  { quote: "A race is a work of art that people can look at and be affected in as many ways as they're capable of understanding.", author: "Steve Prefontaine" },
  { quote: "In running, it doesn't matter whether you come in first, in the middle of the pack, or last. You can say, 'I have finished.' There is a lot of satisfaction in that.", author: "Fred Lebow" },
  { quote: "You have a choice. You can throw in the towel, or you can use it to wipe the sweat off your face.", author: "Gatorade" },
  { quote: "The difference between the impossible and the possible lies in a person's determination.", author: "Tommy Lasorda" },
  { quote: "Do a little more each day than you think you possibly can.", author: "Lowell Thomas" },
  { quote: "What seems hard now will one day be your warm-up.", author: "Unknown" },
  { quote: "Believe that you can run farther or faster. Believe that you're young enough, old enough, strong enough.", author: "John Bingham" },
  { quote: "The five S's of sports training are: stamina, speed, strength, skill, and spirit; but the greatest of these is spirit.", author: "Ken Doherty" },
  { quote: "An athlete cannot run with money in his pockets. He must run with hope in his heart and dreams in his head.", author: "Emil Zatopek" },
  { quote: "Today I will do what others won't, so tomorrow I can accomplish what others can't.", author: "Jerry Rice" },
  { quote: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { quote: "The hardest step for a runner is the first one out the front door.", author: "Unknown" },
  { quote: "Your legs are not giving out. Your head is giving up. Keep going.", author: "Unknown" },
  { quote: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito" },
  { quote: "When your legs get tired, run with your heart.", author: "Unknown" },
  { quote: "The road to the finish line is paved with miles of determination.", author: "Unknown" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "You are stronger than you think.", author: "Unknown" },
  { quote: "Don't dream of winning. Train for it.", author: "Mo Farah" },
  { quote: "I don't run to add days to my life. I run to add life to my days.", author: "Ronald Rook" },
  { quote: "Running is the greatest metaphor for life, because you get out of it what you put into it.", author: "Oprah Winfrey" },
  { quote: "The voice inside your head that says you can't do this is a liar.", author: "Unknown" },
  { quote: "Mountains are not stadiums where I satisfy my ambition to achieve, they are the cathedrals where I practice my religion.", author: "Anatoli Boukreev" },
  { quote: "It's not about the mountain we conquer, but ourselves.", author: "Edmund Hillary" },
  { quote: "He who climbs upon the highest mountains laughs at all tragedies.", author: "Friedrich Nietzsche" },
  { quote: "The summit is what drives us, but the climb itself is what matters.", author: "Conrad Anker" },
  { quote: "You cannot stay on the summit forever; you have to come down again.", author: "René Daumal" },
  { quote: "Great things are done when men and mountains meet.", author: "William Blake" },
  { quote: "Somewhere between the bottom of the climb and the summit is the answer to the mystery why we climb.", author: "Greg Child" },
  { quote: "The mountains have rules. They are harsh rules, but they are there.", author: "Walter Bonatti" },
  { quote: "Ladakh teaches you that silence is not empty. It is full of answers.", author: "Unknown" },
  { quote: "At altitude, everything slows down except your heartbeat and your will.", author: "Unknown" },
  { quote: "Leh at dawn. Cold air. Empty roads. This is where champions are made.", author: "Unknown" },
  { quote: "The Himalayas do not care about your excuses.", author: "Unknown" },
  { quote: "Train in the plains. Race in the clouds.", author: "Unknown" },
  { quote: "Every step at altitude is a negotiation with your body and a conversation with the mountain.", author: "Unknown" },
  { quote: "The Indus does not stop flowing because the season is hard.", author: "Unknown" },
  { quote: "Ladakh rewards those who show up. Every single time.", author: "Unknown" },
  { quote: "In Leh, even the air is thin. Bring thick determination.", author: "Unknown" },
  { quote: "The Zanskar does not flow uphill. Neither does greatness come without effort.", author: "Unknown" },
  { quote: "You trained at sea level. You will race above the clouds. Respect that distance.", author: "Unknown" },
  { quote: "Three friends. One mountain. Thirteen September. This is the story.", author: "Unknown" },
  { quote: "21 kilometres at 11,000 feet is not a race. It is a statement.", author: "Unknown" },
  { quote: "Discipline is the bridge between your training log and the finish line.", author: "Unknown" },
  { quote: "Log the run. Every single one. The data doesn't lie.", author: "Unknown" },
  { quote: "Rest days are not lazy days. They are growth days.", author: "Unknown" },
  { quote: "Your streak is your spine. Don't break it.", author: "Unknown" },
  { quote: "Consistency beats intensity every single week.", author: "Unknown" },
  { quote: "The leaderboard changes daily. Your character is built daily too.", author: "Unknown" },
  { quote: "You don't have to be the fastest. You have to be the most consistent.", author: "Unknown" },
  { quote: "A 3km run on a tired day is worth more than a 10km run you skipped.", author: "Unknown" },
  { quote: "Track everything. Especially the days you didn't feel like it.", author: "Unknown" },
  { quote: "Points accumulate like altitude. Slowly, then suddenly.", author: "Unknown" },
  { quote: "The week resets. Your habits don't have to.", author: "Unknown" },
  { quote: "Do not let a bad day become a broken streak.", author: "Unknown" },
  { quote: "Each activity logged is a vote for the person you are becoming.", author: "Unknown" },
  { quote: "The challenge this week is not just physical. It is a test of your word.", author: "Unknown" },
  { quote: "Finish the weekly challenge. Not for the points. For the proof.", author: "Unknown" },
  { quote: "Show up for your teammates even when you don't show up for yourself.", author: "Unknown" },
  { quote: "Three people, one goal, zero excuses.", author: "Unknown" },
  { quote: "Your friends are watching the leaderboard. More importantly, they are watching your effort.", author: "Unknown" },
  { quote: "A team that trains together suffers together and finishes together.", author: "Unknown" },
  { quote: "Push your friend up the hill. They will carry you across the finish line.", author: "Unknown" },
  { quote: "The best pace is a sustainable pace. The best team is a supportive one.", author: "Unknown" },
  { quote: "Running alone builds fitness. Running with others builds character.", author: "Unknown" },
  { quote: "The body achieves what the mind believes.", author: "Unknown" },
  { quote: "Tough times never last, but tough people do.", author: "Robert H. Schuller" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "You miss 100% of the runs you don't take.", author: "Unknown" },
  { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { quote: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
  { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { quote: "The only bad run is the one that didn't happen.", author: "Unknown" },
  { quote: "You are one run away from a good mood.", author: "Unknown" },
  { quote: "Sweat is just fat crying.", author: "Unknown" },
  { quote: "Your future self is watching you right now through your memories.", author: "Unknown" },
  { quote: "One day or day one. You decide.", author: "Unknown" },
  { quote: "Excuses don't burn calories.", author: "Unknown" },
  { quote: "Be stronger than your excuses.", author: "Unknown" },
  { quote: "Train hard. Race easy.", author: "Unknown" },
  { quote: "The finish line is just the beginning of a whole new race.", author: "Unknown" },
  { quote: "You were given this life because you are strong enough to live it.", author: "Unknown" },
  { quote: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { quote: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { quote: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { quote: "I hated every minute of training, but I said, don't quit. Suffer now and live the rest of your life as a champion.", author: "Muhammad Ali" },
  { quote: "If you want to achieve greatness, stop asking for permission.", author: "Unknown" },
  { quote: "It's supposed to be hard. If it were easy, everyone would do it.", author: "Unknown" },
  { quote: "You don't find the will to win. You bring it with you.", author: "Unknown" },
  { quote: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { quote: "The only way to define your limits is by going beyond them.", author: "Arthur C. Clarke" },
  { quote: "If something stands between you and your success, move it. Never be denied.", author: "Dwayne Johnson" },
  { quote: "You are your only limit.", author: "Unknown" },
  { quote: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { quote: "There is no finish line.", author: "Nike" },
  { quote: "Yesterday you said tomorrow. Just do it.", author: "Nike" },
  { quote: "Impossible is just a big word thrown around by small men.", author: "Muhammad Ali" },
  { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { quote: "Do something today that your future self will thank you for.", author: "Unknown" },
  { quote: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { quote: "The distance is nothing; it is only the first step that is difficult.", author: "Madame du Deffand" },
  { quote: "If you are going through hell, keep going.", author: "Winston Churchill" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "I run because I can. When I cannot run, I shall dream of it.", author: "Unknown" },
  { quote: "Running is a road to self-awareness and reliance.", author: "Doris Brown Heritage" },
  { quote: "The runs you don't want to do are the ones that make you.", author: "Unknown" },
  { quote: "September 13. Circle it. Fear it. Train for it. Own it.", author: "Unknown" },
  { quote: "137 days is enough. But only if you use them.", author: "Unknown" },
  { quote: "The race is long. It begins today.", author: "Unknown" },
];

function MountainSilhouette() {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none", userSelect: "none" }}>
      <svg
        viewBox="0 0 430 280"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "38vh", display: "block" }}
      >
        <path d="M0 280 L0 175 L18 158 L32 140 L44 118 L54 94 L61 68 L67 42 L72 18 L76 4 L80 16 L84 6 L88 22 L93 10 L98 28 L104 14 L109 34 L115 20 L121 42 L128 28 L136 50 L145 35 L156 58 L167 43 L180 64 L193 50 L206 70 L220 56 L235 74 L251 60 L267 80 L283 66 L300 85 L317 72 L334 90 L352 78 L369 96 L387 84 L406 100 L430 95 L430 280 Z" fill="#162033" />
        <path d="M0 280 L0 200 L16 188 L30 174 L44 160 L56 144 L67 128 L76 112 L84 98 L90 86 L96 98 L101 86 L106 74 L112 86 L117 74 L124 90 L130 77 L139 94 L147 80 L158 98 L168 84 L180 103 L192 88 L206 107 L220 92 L236 111 L252 97 L268 115 L285 101 L303 118 L320 104 L338 122 L356 108 L374 125 L393 112 L412 128 L430 122 L430 280 Z" fill="#1A2744" />
        <path d="M0 280 L0 222 L18 212 L34 200 L48 187 L61 173 L72 159 L81 146 L89 134 L96 146 L102 134 L108 122 L115 134 L121 123 L130 138 L137 126 L147 143 L156 130 L167 148 L178 134 L191 152 L204 138 L218 157 L233 143 L249 161 L265 147 L282 165 L298 151 L316 168 L333 154 L350 172 L368 158 L386 174 L404 161 L430 168 L430 280 Z" fill="#1E2E50" />
        <path d="M0 280 L0 242 L20 233 L36 222 L50 211 L63 199 L74 188 L83 177 L91 167 L99 177 L106 167 L113 157 L121 168 L128 157 L137 171 L145 159 L155 174 L164 162 L175 178 L185 165 L197 181 L209 168 L223 184 L237 172 L252 188 L267 175 L283 191 L299 178 L316 194 L333 181 L350 197 L368 184 L385 200 L403 187 L420 202 L430 197 L430 280 Z" fill="#243358" />
        <path d="M0 280 L0 258 L22 250 L38 240 L52 230 L64 220 L75 211 L84 203 L93 213 L100 203 L108 194 L116 204 L124 195 L133 208 L142 197 L152 210 L162 200 L172 214 L183 203 L194 218 L206 206 L219 221 L232 209 L246 224 L260 212 L275 228 L290 215 L305 230 L321 218 L337 233 L353 221 L369 236 L386 223 L402 238 L418 226 L430 230 L430 280 Z" fill="#1A2744" />
      </svg>
    </div>
  );
}

export default function SplashPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<{ quote: string; author: string } | null>(null);

  useEffect(() => {
    setSelected(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <>
      <style>{`
        @keyframes gentlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div
        onClick={() => router.push("/")}
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#0D1829",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <MountainSilhouette />

        {/* Countdown pill */}
        <div style={{ paddingTop: "52px", position: "relative", zIndex: 10 }}>
          <CountdownPill />
        </div>

        {/* Quote area — empty on server, filled on client */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 10%",
          position: "relative",
          zIndex: 10,
          textAlign: "center",
        }}>
          {selected && (
            <>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(20px, 5.5vw, 28px)",
                fontWeight: 600,
                color: "#F5F2ED",
                lineHeight: 1.6,
                marginBottom: "22px",
              }}>
                &ldquo;{selected.quote}&rdquo;
              </p>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#C9B87A",
                letterSpacing: "0.06em",
              }}>
                &mdash; {selected.author}
              </p>
            </>
          )}
        </div>

        {/* Tap to continue */}
        <div style={{
          paddingBottom: "calc(38vh + 28px)",
          position: "relative",
          zIndex: 10,
        }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            color: "#C9B87A",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            animation: "gentlePulse 2.4s ease-in-out infinite",
          }}>
            Tap Anywhere to Continue
          </p>
        </div>
      </div>
    </>
  );
}
