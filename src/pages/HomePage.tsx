import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Brain, ArrowRight, Users, Code, Zap, Image } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="bg-[#161b22] shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-[#238636]" />
              <h1 className="text-2xl font-bold text-white">GitHub MBTI 分析器</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {/* Navigation items can be added here */}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Github className="h-24 w-24 text-white" />
              <Brain className="h-12 w-12 text-[#238636] absolute -top-2 -right-2 bg-[#21262d] rounded-full p-2" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            通过 GitHub 代码分析你的
            <span className="text-[#238636]"> MBTI 性格类型</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            基于你的 GitHub README 文件和代码风格，使用 AI 智能分析你的编程习惯和思维模式，
            为你提供专业的 MBTI 性格类型分析报告，并可在 3D 虚拟展览馆中展示你的结果。
          </p>
          
          <div className="flex justify-center">
            <Link
              to="/analyze"
              className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <span>开始分析</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-white mb-12">
            为什么选择我们？
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-[#21262d] p-6 rounded-lg shadow-md text-center border border-gray-700">
              <div className="flex justify-center mb-4">
                <Code className="h-12 w-12 text-[#238636]" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                深度代码分析
              </h4>
              <p className="text-gray-300">
                深度分析你的编程风格、项目结构和代码组织方式，
                从技术角度洞察你的思维模式。
              </p>
            </div>
            
            <div className="bg-[#21262d] p-6 rounded-lg shadow-md text-center border border-gray-700">
              <div className="flex justify-center mb-4">
                <Brain className="h-12 w-12 text-[#238636]" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                AI 智能分析
              </h4>
              <p className="text-gray-300">
                采用先进的 AI 算法和心理学模型，
                结合 MBTI 理论为你提供准确的性格分析。
              </p>
            </div>
            
            <div className="bg-[#21262d] p-6 rounded-lg shadow-md text-center border border-gray-700">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-[#238636]" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                个性化报告
              </h4>
              <p className="text-gray-300">
                获得详细的个性化分析报告，包括性格优势、
                发展建议和职业发展方向。
              </p>
            </div>
            
            <div className="bg-[#21262d] p-6 rounded-lg shadow-md text-center border border-gray-700">
              <div className="flex justify-center mb-4">
                <Image className="h-12 w-12 text-[#238636]" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                3D 虚拟展览
              </h4>
              <p className="text-gray-300">
                在沉浸式的 3D 虚拟展览馆中展示你的 MBTI 分析结果，
                提供独特的可视化体验。
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-white mb-12">
            工作原理
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#238636] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                输入 GitHub 用户名
              </h4>
              <p className="text-gray-300">
                只需要输入你的 GitHub 用户名，我们会自动获取你的公开信息。
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#238636] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                AI 分析代码特征
              </h4>
              <p className="text-gray-300">
                AI 分析你的 README 文件、代码风格和项目特点。
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#238636] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                生成 MBTI 报告
              </h4>
              <p className="text-gray-300">
                获得详细的 MBTI 性格分析报告和 3D 展览馆展示。
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="bg-[#21262d] p-8 rounded-lg shadow-md max-w-2xl mx-auto border border-gray-700">
            <Zap className="h-16 w-16 text-[#238636] mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              准备开始了吗？
            </h3>
            <p className="text-gray-300 mb-6">
              只需要几分钟，就能获得专业的 MBTI 性格分析报告。
              完全免费，无需注册。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#161b22] border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 GitHub MBTI 分析器. 基于开源技术构建.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;