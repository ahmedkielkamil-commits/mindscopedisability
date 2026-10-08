import ahmed from "../assets/ahmed-kiel-kamil.png";
import aren from "../assets/aren-egwuekwe.png";
import isaiah from "../assets/isaiah-johnson.png";
import supreme from "../assets/supreme-constantine.jpg";

const founders = [
  {
    role: "CEO",
    name: "Ahmed Kiel-Kamil",
    job: "Amazon Logistics Specialist",
    photo: ahmed,
    position: "center 20%",
  },
  {
    role: "CTO",
    name: "Aren Egwuekwe",
    job: "Google Software Engineer",
    photo: aren,
    position: "center 18%",
  },
  {
    role: "CFO",
    name: "Isaiah Johnson",
    job: "John Hopkins Masters Student",
    photo: isaiah,
    position: "center 22%",
  },
  {
    role: "CXO",
    name: "Supreme Constantine",
    job: "North Carolina State University Masters Student",
    photo: supreme,
    position: "center 35%",
  },
];

const story = [
  "Growing up with dyslexia, I experienced firsthand the strain it places on not only the child but also on parents and schools that lack adequate resources to support a child's needs. Bouncing between schools made it difficult for me to keep up, and schools that didn't prepare me for the world ahead means that this is not just a problem I have researched it is an educational tension I have lived through.",
  "Going from tutor to tutor myself, while watching the families of dear friends get lost in the fight for their children's academic safety within the complex landscape of our education system, helped me understand from an early age that no amount of hard work, sacrifice, and goodwill can replace timely, well-resourced intervention.",
  "Over time, as such interventions began to reveal tangible improvements in my trajectory, I discovered programming and Computer Science. What started as a one-off summer camp experience eventually blossomed into a field of study that, for the first time, worked with my brain instead of against it. And with talent came an obligation — one I felt not just for myself, but for all those who poured into me to get me to that point.",
  "As I climbed, it became crucial for me to foster community and make a difference with my gift. This led me not only to meet my co-founders but to participate in HBCU hackathons where my peers could compete by using technology to solve some of the most pressing problems we face today. At one of these, the Morehouse President's Hackathon, I was brought back to the truth that got me here: hard work and goodwill cannot replace well-timed resources.",
  "And so it became our mission, first in that 36-hour hackathon, and eventually in a fully realized startup — to arm schools, parents, and districts with the resources to ensure that children in need are met with whatever care they require.",
];

export default function About() {
  return (
    <>
      <section style={{ backgroundColor: "#14337B" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "#F3C153" }}
          >
            About MindScope
          </p>
          <h1
            className="font-display leading-tight"
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)",
              color: "#FFFFFF",
              maxWidth: 720,
            }}
          >
            Built from lived experience, for families still finding their way.
          </h1>
        </div>
      </section>

      <section id="mission" className="scroll-mt-24" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Mission statement
          </p>
          <p
            className="font-display text-2xl md:text-3xl leading-snug max-w-3xl"
            style={{ color: "var(--foreground)" }}
          >
            MindScope supports children with learning disabilities and mental health disparities
            by empowering parents navigating the special education system while giving schools a
            means to close the gap between emotional distress left unaddressed and clinical care.
          </p>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Our story
          </p>
          <h2
            className="font-display text-3xl md:text-4xl leading-snug mb-10"
            style={{ color: "var(--foreground)" }}
          >
            From Experience to Solution
          </h2>
          <div className="max-w-3xl space-y-6">
            {story.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-base md:text-lg leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="team" className="scroll-mt-24" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            The team
          </p>
          <h2
            className="font-display text-3xl md:text-4xl leading-snug mb-10"
            style={{ color: "var(--foreground)" }}
          >
            Founders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((person) => (
              <article key={person.name}>
                <div
                  className="w-[220px] h-[220px] rounded-2xl overflow-hidden mb-4"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: person.position,
                      transform: person.zoom ? `scale(${person.zoom})` : undefined,
                      transformOrigin: "center 62%",
                    }}
                  />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--foreground)" }}>
                  <span
                    className="text-xs font-semibold tracking-widest uppercase mr-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {person.role}
                  </span>
                  {person.name}
                </h3>
                <p
                  className="text-xs text-center leading-snug rounded-lg px-2.5 py-2"
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {person.job}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Disclaimer
          </p>
          <p
            className="text-sm md:text-base leading-relaxed max-w-3xl pl-4"
            style={{ borderLeft: "3px solid var(--accent)", color: "var(--muted-foreground)" }}
          >
            MindScope is an informational platform that helps parents, educators, and mental
            health professionals collaborate around a child's needs. It is not a diagnostic tool
            and does not provide medical, psychological, or therapeutic advice. All clinical
            decisions remain the responsibility of licensed professionals. MindScope is a starting
            point, not a substitute for qualified care.
          </p>
        </div>
      </section>
    </>
  );
}
