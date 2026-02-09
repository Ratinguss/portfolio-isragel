const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title text-center">About Me</h2>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Get to know me better
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                My Journey
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                I'm a passionate developer with a love for creating beautiful,
                functional, and user-friendly applications. My journey in tech
                started with curiosity and has evolved into a career dedicated
                to continuous learning and innovation.
              </p>
              <p className="text-gray-300 leading-relaxed">
                I specialize in modern web technologies and enjoy tackling
                complex challenges. Whether it's building responsive frontends
                or architecting scalable backends, I bring dedication and
                creativity to every project.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 shadow-xl text-center">
              <div className="text-4xl font-bold text-white mb-2">5+</div>
              <div className="text-blue-200">Years Experience</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 shadow-xl text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-purple-200">Projects Completed</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-6 shadow-xl text-center">
              <div className="text-4xl font-bold text-white mb-2">30+</div>
              <div className="text-indigo-200">Happy Clients</div>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg p-6 shadow-xl text-center">
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-pink-200">Technologies</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
