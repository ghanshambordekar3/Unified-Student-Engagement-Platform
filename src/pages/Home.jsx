import React from "react";
import { motion } from "framer-motion";
import { PageTransition } from "../components/ui/PageTransition";
import { Button } from "../components/ui/Button";
import { Tilt3D } from "../components/ui/Tilt3D";
import { GlassCard } from "../components/ui/GlassCard";
import { staggerContainer, popIn } from "../utils/animations";
import { Sparkles, ArrowRight, GraduationCap, Users, Bookmark, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <PageTransition transitionKey="home">
      <div className="min-h-screen relative overflow-hidden flex items-center pt-24 pb-16">
        
        {/* Advanced Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-100 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full">

          {/* Hero Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col items-start gap-8"
          >
            <motion.div 
              variants={popIn} 
              className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-4 py-2 rounded-full backdrop-blur-md shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-bold text-teal-700 tracking-wide uppercase">Next-Gen Education OS</span>
            </motion.div>

            <motion.h1
              variants={popIn}
              className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight"
            >
              Unified <span className="text-gradient">Education</span> Experience
            </motion.h1>

            <motion.p
              variants={popIn}
              className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium"
            >
              The most premium, highly interactive workspace for international students. Plan your path, manage finances, and explore opportunities with ease.
            </motion.p>

            <motion.div variants={popIn} className="flex flex-wrap items-center gap-6 mt-4">
              <Button 
                onClick={() => navigate('/onboarding')}
                className="flex items-center gap-3 px-8 py-4 shadow-teal-500/20"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4"
              >
                View Dashboard
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={popIn} className="flex gap-8 mt-4 pt-8 border-t border-gray-100 w-full">
              <div>
                <p className="text-2xl font-black text-gray-900">50k+</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active Users</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">200+</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Partner Unis</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">4.9/5</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">User Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero 3D Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex justify-center items-center relative"
          >
            {/* Background Glow for the card */}
            <div className="absolute inset-0 bg-teal-50 blur-[120px] rounded-full scale-75" />
            
            <Tilt3D tiltMaxAngle={12} className="w-full max-w-lg aspect-square">
              <GlassCard className="w-full h-full flex flex-col items-center justify-center p-12 gap-8 relative overflow-hidden group shadow-lg border-gray-200">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg border border-gray-300">
                    <GraduationCap className="w-16 h-16 text-gray-900" />
                  </div>
                  
                  {/* Floating mini-icons */}
                  <motion.div 
                    animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-4 -right-4 w-10 h-10 rounded-xl glass flex items-center justify-center border border-gray-300 shadow-lg"
                  >
                    <Globe className="w-5 h-5 text-teal-500" />
                  </motion.div>
                  <motion.div 
                    animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-4 -left-4 w-12 h-12 rounded-xl glass flex items-center justify-center border border-gray-300 shadow-lg"
                  >
                    <Users className="w-6 h-6 text-blue-500" />
                  </motion.div>
                </motion.div>

                <div className="space-y-4 text-center">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Master Your Journey</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">
                    The intelligence of AI meets a beautiful design to help you reach your goals faster.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-teal-500/30" />
                  ))}
                </div>
              </GlassCard>
            </Tilt3D>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};