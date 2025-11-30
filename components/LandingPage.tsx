import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, PlayCircle, Drama, Brain, Database, 
    CheckCircle, AlertTriangle, Lightbulb, Cpu, AlertCircle, 
    Search, Wand2, Info, ArrowRight, MousePointer2 
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface LandingPageProps {
  onEnterApp: () => void;
}

type ScenarioType = 'safe' | 'structure' | 'creative';

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('safe');
  const [isAnimating, setIsAnimating] = useState(false);

  // Scenario Data
  const scenarios = {
      safe: {
          layers: ['pass', 'pass', 'pass', 'idle'], 
          theme: 'green',
          title: '安全 - 仅微弱相似',
          score: 17,
          chartData: [
              { subject: '语义内容', value: 20 },
              { subject: '视觉结构', value: 15 },
              { subject: '构图布局', value: 10 },
              { subject: '艺术风格', value: 20 }
          ],
          evidence: [
              "两张图均采用鲜艳、饱和度较高的色彩。",
              "两张图使用了渐变色块作为背景或元素填充。",
              "未发现具体的构图或核心元素重叠。",
              "整体风格虽同为现代插画，但叙事内容完全不同。"
          ],
          images: { 
              target: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&q=80', 
              ref: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=500&q=80' 
          }, 
          prompt: null
      },
      structure: {
          layers: ['fail', 'fail', 'fail', 'active'],
          theme: 'red',
          title: '严重侵权风险警告',
          score: 97,
          chartData: [
            { subject: '语义内容', value: 95 },
            { subject: '视觉结构', value: 95 },
            { subject: '构图布局', value: 98 },
            { subject: '艺术风格', value: 95 }
          ], 
          evidence: [
              "两张图都以清晰的方格/网格月历作为基础布局，标题字体都采用圆润、醒目的橙色手写艺术字。",
              "两张图都包含了手工绘制的表格（包括日历和追踪器），都严格遵循笔记本的点阵或方格进行划分，结构高度一致。",
              "两张图都采用了秋季主题的装饰贴纸和和纸胶带，强调了暖调的季节性氛围和手作美学。",
              "两张图都采用了俯拍的静物摄影风格，构图方式高度重合。"
          ],
          images: { 
              target: 'https://i0.wp.com/catsandcozyhome.com/wp-content/uploads/2018/11/BuJo-novembre-calendrier.jpg?w=1000&ssl=1', 
              ref: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPHYjv8TOd3Mn_jappPZDdqr2iOROW-SX18PvrwTZBKAqGGCVbZbiiCGa19euuRGEH1m4&usqp=CAU' 
          },
          prompt: "/imagine prompt: Modern calendar design --no [oval_layout] --style minimal_3d_render --composition asymmetrical --colors pastel_palette"
      },
      creative: {
          layers: ['pass', 'fail', 'warning', 'active'],
          theme: 'orange',
          title: '中度创意借鉴风险',
          score: 65,
          chartData: [
            { subject: '语义内容', value: 60 },
            { subject: '视觉结构', value: 40 },
            { subject: '构图布局', value: 75 },
            { subject: '艺术风格', value: 85 }
          ],
          evidence: [
              "构图重心位置与参考图高度一致（黄金分割点重合）。",
              "使用了与原作极度相似的‘赛博朋克’霓虹配色方案。",
              "虽然人物动作不同，但画面的孤寂感氛围与参考图雷同。",
              "背景建筑轮廓线存在高频重合。"
          ],
          images: { 
              target: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80', 
              ref: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=500&q=80' 
          },
          prompt: "/imagine prompt: Cyberpunk scene BUT change mood to [Energetic/Chaotic], use [Warm/Daylight] lighting, remove solitary figure, add crowd..."
      }
  };

  const handleScenarioChange = (type: ScenarioType) => {
      setIsAnimating(true);
      setTimeout(() => {
          setActiveScenario(type);
          setIsAnimating(false);
      }, 200);
  };

  const currentData = scenarios[activeScenario];
  
  // Theme Helper
  const getThemeColors = (theme: string) => {
      switch(theme) {
          case 'red': return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-900', icon: 'text-red-500', chart: '#ef4444' };
          case 'orange': return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-900', icon: 'text-orange-500', chart: '#f97316' };
          default: return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-900', icon: 'text-green-500', chart: '#22c55e' };
      }
  };
  const themeColors = getThemeColors(currentData.theme);

  return (
    <div className="min-h-screen flex flex-col font-sans">
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white p-2 rounded-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-tight text-slate-900">
                                Copyright<span className="text-blue-600">Guard</span> AI
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Enterprise Risk Intelligence</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <a href="#challenges" className="hidden md:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">行业挑战</a>
                        <a href="#simulator" className="hidden md:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">智能引擎演示</a>
                        <button 
                            onClick={onEnterApp}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95 transform duration-150"
                        >
                            开始鉴别
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        {/* Hero Section */}
        <header className="bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 skew-x-12 translate-x-20 -z-10"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6 border border-blue-100 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        AIGC 时代的一站式解决方案
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 animate-fade-in">
                        企业数字化时代的<br/>
                        <span className="text-blue-600">“版权守门员”</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in delay-100">
                        将事后补救转化为事前预防。结合 <strong>AI 大模型语义分析</strong> 与 <strong>图像指纹技术</strong>，
                        在毫秒级时间内精准识别创意、结构与风格的潜在侵权风险。
                    </p>
                    <div className="flex gap-4 justify-center animate-fade-in delay-200">
                        <button 
                            onClick={onEnterApp} 
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <PlayCircle size={20} />
                            体验智能鉴别
                        </button>
                        <a href="#challenges" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                            了解核心痛点
                        </a>
                    </div>
                </div>
            </div>
        </header>

        {/* Challenges Section */}
        <section id="challenges" className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">AIGC 时代的三大版权挑战</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        传统的像素级比对工具已失效。企业面临着从“微创新”到“高维概念”的全方位侵权风险。
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                            <Drama size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">隐性抄袭与“微创新”</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            侵权不再是简单的复制。AI 生成物通过颜色微调、布局重组形成“高相似度”内容，让传统哈希算法失效。
                        </p>
                    </div>

                    <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                            <Brain size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">高维度的概念侵权</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            风险焦点转移至<strong>创意概念、艺术风格、叙事模式</strong>。需要具备“语义理解”和“风格鉴赏”能力的 AI 进行判断。
                        </p>
                    </div>

                    <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">权属溯源困境</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            海量 AIGC 内容爆发，企业需快速证明生成内容的原创性，并确保训练数据源的合规性，建立全链路追溯机制。
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Simulator Section */}
        <section id="simulator" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Interactive Engine</span>
                        <h2 className="text-3xl font-bold text-slate-900 mt-2">四层级智能风险评估模型</h2>
                        <p className="mt-2 text-slate-600 max-w-xl">
                            模拟 CopyrightGuard AI 核心引擎的处理流程。点击下方不同场景，观察 AI 如何从结构到创意进行多维鉴别。
                        </p>
                    </div>
                    
                    {/* Scenario Selectors */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => handleScenarioChange('safe')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeScenario === 'safe' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <CheckCircle size={16} className={activeScenario === 'safe' ? 'text-green-500' : 'text-slate-400'} /> 原创合规
                        </button>
                        <button 
                            onClick={() => handleScenarioChange('structure')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeScenario === 'structure' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <AlertTriangle size={16} className={activeScenario === 'structure' ? 'text-red-500' : 'text-slate-400'} /> 严重侵权
                        </button>
                        <button 
                            onClick={() => handleScenarioChange('creative')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeScenario === 'creative' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Lightbulb size={16} className={activeScenario === 'creative' ? 'text-orange-500' : 'text-slate-400'} /> 创意借鉴
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Process Layers */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">鉴别流水线</h3>
                            
                            {[
                                { title: '1. 结构指纹识别 (dHash)', desc: '提取图像“DNA”，计算汉明距离。毫秒级排除明显复制。' },
                                { title: '2. 高维创意语义分析', desc: 'AI 理解主题、情感、意境。通过 Embedding 向量比对发现隐形相似。' },
                                { title: '3. 专家级风险分解', desc: '对构图、元素、风格进行独立评分，生成可解释的证据链。' },
                                { title: '4. AIGC 规避与重塑', desc: '自动生成合规 Prompt，指导二次创作。' }
                            ].map((layer, index) => {
                                const status = currentData.layers[index];
                                let layerClass = 'border-l-4 pl-4 py-3 rounded-r-lg mb-2 transition-all duration-300 ';
                                let badgeClass = 'text-xs font-bold px-2 py-0.5 rounded ';
                                let badgeText = '';

                                if (status === 'pass') {
                                    layerClass += 'border-green-500 bg-green-50';
                                    badgeClass += 'bg-green-100 text-green-700';
                                    badgeText = 'PASS';
                                } else if (status === 'fail') {
                                    layerClass += 'border-red-500 bg-red-50';
                                    badgeClass += 'bg-red-100 text-red-700';
                                    badgeText = 'RISK';
                                } else if (status === 'warning') {
                                    layerClass += 'border-orange-500 bg-orange-50';
                                    badgeClass += 'bg-orange-100 text-orange-700';
                                    badgeText = 'WARN';
                                } else if (status === 'active') {
                                    layerClass += 'border-blue-500 bg-blue-50';
                                    badgeClass += 'bg-blue-100 text-blue-700';
                                    badgeText = 'ACTIVE';
                                } else {
                                    layerClass += 'border-slate-300 opacity-60';
                                    badgeClass += 'bg-slate-200 text-slate-500';
                                    badgeText = 'IDLE';
                                }

                                return (
                                    <div key={index} className={layerClass}>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-slate-800 text-sm">{layer.title}</h4>
                                            <span className={badgeClass}>{badgeText}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{layer.desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs">
                            <div className="flex items-center gap-2 mb-2">
                                <Cpu size={18} className="text-blue-400" />
                                <span className="font-bold text-white">核心技术栈</span>
                            </div>
                            <ul className="space-y-1 pl-6 list-disc marker:text-blue-500">
                                <li><strong>Google Gemini API:</strong> 语义理解与向量化</li>
                                <li><strong>dHash:</strong> 工业级特征提取</li>
                                <li><strong>Vector DB:</strong> 高维索引匹配</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Dashboard */}
                    <div className="lg:col-span-8">
                        {/* Report Header */}
                        <div className={`rounded-xl p-6 mb-6 transition-all duration-500 flex flex-col sm:flex-row justify-between sm:items-center shadow-sm border ${themeColors.border} ${themeColors.bg}`}>
                            <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm ${themeColors.icon} transition-colors duration-300`}>
                                    {activeScenario === 'safe' ? <ShieldCheck size={32} /> : activeScenario === 'structure' ? <AlertCircle size={32} /> : <Info size={32} />}
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${themeColors.text} transition-colors duration-300`}>{currentData.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">对比源：<span className="font-medium">Library_Asset_2024.jpg</span></p>
                                </div>
                            </div>
                            <div className="text-center sm:pr-4 sm:text-right">
                                <div className="text-5xl font-black text-slate-900 tracking-tight transition-all duration-500">{currentData.score}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-wider">综合评分</div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-400 mb-2 pl-1">上传的图片 (待测)</div>
                                <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                                    <img 
                                        src={currentData.images.target} 
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`} 
                                        alt="Target" 
                                    />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-400 mb-2 pl-1">库中原图 (受保护)</div>
                                <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                                    <img 
                                        src={currentData.images.ref} 
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`} 
                                        alt="Reference" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Evidence & Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                    <Search className="text-blue-600" size={20} />
                                    <span className="font-bold text-slate-800">视觉取证证据链</span>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-3">⚠ 关键相似点 (EVIDENCE)</span>
                                    <ul className="space-y-3 text-xs leading-relaxed text-slate-600">
                                        {currentData.evidence.map((item, i) => (
                                            <li key={i} className={`flex gap-2 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                                                <span className={`${themeColors.icon} shrink-0`}>•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col items-center justify-center">
                                <div className="w-full flex justify-between items-center mb-2">
                                    <span className="font-bold text-slate-800 text-sm">多维风险图谱</span>
                                </div>
                                <div className="w-full h-48">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentData.chartData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                            <Radar
                                                name="风险值"
                                                dataKey="value"
                                                stroke={themeColors.chart}
                                                fill={themeColors.chart}
                                                fillOpacity={0.4}
                                            />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                         {/* Prompt Box */}
                         <div className={`mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 transition-all duration-500 overflow-hidden ${currentData.prompt ? 'opacity-100 h-auto' : 'opacity-0 h-0 p-0 border-0'}`}>
                            <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-xs uppercase">
                                <Wand2 size={16} />
                                AIGC 规避建议 (Prompt)
                            </div>
                            <div className="text-xs font-mono text-slate-600 bg-white p-3 rounded border border-slate-200 break-all">
                                {isAnimating ? 'Generating...' : currentData.prompt}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <ShieldCheck size={24} className="text-slate-900" />
                    <span className="font-bold text-lg text-slate-900">CopyrightGuard AI</span>
                </div>
                <p className="text-slate-500 text-sm mb-6">
                    基于豆包大模型与图像指纹技术的企业级版权风险管理方案
                </p>
                <div className="text-xs text-slate-400">
                    &copy; 2025 CopyrightGuard AI. All rights reserved.
                </div>
            </div>
        </footer>
    </div>
  );
};

export default LandingPage;