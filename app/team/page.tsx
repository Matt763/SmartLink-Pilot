import Image from "next/image";
import { Linkedin, Twitter } from "lucide-react";

const team = [
  { name: "Mclean Mbaga", role: "Founder & CEO", bio: "Visionary full-stack engineer building scalable SaaS platforms that empower businesses across Africa and beyond.", image: "/team/mclean.png" },
  { name: "Aisha Wanjiru", role: "Head of Product", bio: "Product strategist with 8+ years of experience shipping delightful user experiences at scale.", image: "/team/sarah.png" },
  { name: "Wei Chen", role: "Lead Engineer", bio: "Systems architect specializing in high-performance distributed systems and real-time analytics.", image: "/team/david.png" },
  { name: "Fatima Al-Rashid", role: "Head of Design", bio: "Award-winning designer creating beautiful, accessible interfaces that users love.", image: "/team/amina.png" },
  { name: "Carlos Rivera", role: "DevOps Lead", bio: "Infrastructure expert ensuring 99.99% uptime across our global edge network.", image: "/team/james.png" },
  { name: "Emma Lindström", role: "Marketing Director", bio: "Growth specialist driving customer acquisition through data-driven marketing strategies.", image: "/team/grace.png" },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">The Team Behind SmartLink</h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">Diverse minds, one mission — making link management smarter for everyone.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="group relative">
              {/* Glassy Card */}
              <div className="relative bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-2">
                {/* Subtle gradient accent top */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

                <div className="p-8 text-center">
                  {/* Avatar */}
                  <div className="relative mx-auto w-28 h-28 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-[3px]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-4">{member.role}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{member.bio}</p>

                  {/* Social */}
                  <div className="flex justify-center gap-2">
                    <button className="p-2.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                      <Linkedin size={16} />
                    </button>
                    <button className="p-2.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                      <Twitter size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
