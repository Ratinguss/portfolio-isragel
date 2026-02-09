const Skills = () => {
  const skills = [
    {
      category: 'Frontend',
      items: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Python', 'Express', 'Django', 'PostgreSQL'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      category: 'Tools & Others',
      items: ['Git', 'Docker', 'AWS', 'CI/CD', 'REST APIs'],
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section id="skills" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title text-center">Skills & Technologies</h2>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Tools and technologies I work with
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {skills.map((skillSet, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-8 shadow-xl hover:transform hover:scale-105 transition-all duration-300"
            >
              <div
                className={`inline-block bg-gradient-to-r ${skillSet.color} text-white font-bold px-4 py-2 rounded-lg mb-6`}
              >
                {skillSet.category}
              </div>
              <ul className="space-y-3">
                {skillSet.items.map((skill, skillIndex) => (
                  <li
                    key={skillIndex}
                    className="flex items-center text-gray-300"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
