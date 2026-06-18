"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const designs = [
    {
      number: 1,
      name: "جريء وديناميكي",
      description: "تصميم داكن مع تدرجات متحركة، جزيئات تفاعلية، أزرار حركية، وبطاقات إحصائية عائمة",
      features: ["تدرجات متحركة", "جزيئات تفاعلية", "أزرار حركية", "تأثيرات زجاجية"],
      route: "/test1",
      color: "#9B7FE8"
    },
    {
      number: 2,
      name: "الفخامة الراقية",
      description: "تصميم أنيق مع رسومات زجاجات SVG، تمرير سلس، وتخطيطات تحريرية غير متماثلة",
      features: ["رسومات الزجاجات", "تمرير متوازي", "شريط متحرك", "شبكة تحريرية"],
      route: "/test2",
      color: "#C9A96E"
    },
    {
      number: 3,
      name: "بريميوم 2026",
      description: "تصميم هجين نهائي يجمع أفضل الرسوم المتحركة من جميع التصاميم مع جمالية 2026 الحديثة",
      features: ["جميع الحركات", "تفاعلي", "فن SVG", "حديث جداً"],
      route: "/test3",
      color: "#D4AF37"
    },
    {
      number: 4,
      name: "الأناقة الكلاسيكية",
      description: "تصميم نظيف، احترافي، وخالد مع هندسة معمارية قائمة على المكونات",
      features: ["تحميل سريع", "محسّن لمحركات البحث", "تخطيط بسيط", "سهل الصيانة"],
      route: "/test4",
      color: "#C9A84C"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12" style={{ backgroundColor: "#FAFAF7", direction: "rtl" }}>
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl">
        <h1 
          className="text-5xl md:text-7xl mb-6 leading-tight"
          style={{ 
            fontFamily: "Amiri, serif", 
            fontWeight: 700, 
            color: "#1A1A1A",
            letterSpacing: "-0.01em"
          }}
        >
          اختر
          <br />
          <span style={{ fontStyle: "italic", color: "#C9A96E" }}>التصميم المثالي</span>
        </h1>
        <p 
          className="text-lg leading-relaxed"
          style={{ 
            fontFamily: "Tajawal, sans-serif", 
            color: "#6B6B6B",
            fontWeight: 300
          }}
        >
          اختر تصميماً لمعاينة تجربة الصفحة الرئيسية الكاملة.
          <br />
          كل تصميم يعرض أنماطاً وتفاعلات مختلفة.
        </p>
      </div>

      {/* Design Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full mb-12">
        {designs.map((design) => (
          <Link 
            key={design.number} 
            href={design.route}
            className="group relative block"
          >
            <div 
              className="relative overflow-hidden rounded-2xl p-8 md:p-10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
              style={{ 
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E4DC",
              }}
            >
              {/* Number Badge */}
              <div 
                className="absolute top-6 left-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-light transition-all duration-500 group-hover:scale-110"
                style={{ 
                  backgroundColor: `${design.color}20`,
                  color: design.color,
                  fontFamily: "Amiri, serif"
                }}
              >
                {design.number}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <span 
                  className="inline-block text-xs tracking-[0.3em] uppercase mb-3"
                  style={{ 
                    fontFamily: "Tajawal, sans-serif",
                    color: design.color,
                    fontWeight: 500
                  }}
                >
                  تصميم {design.number}
                </span>
                
                <h2 
                  className="text-3xl md:text-4xl mb-4 leading-tight"
                  style={{ 
                    fontFamily: "Amiri, serif",
                    fontWeight: 700,
                    color: "#1A1A1A"
                  }}
                >
                  {design.name}
                </h2>

                <p 
                  className="text-sm md:text-base leading-relaxed mb-6"
                  style={{ 
                    fontFamily: "Tajawal, sans-serif",
                    color: "#6B6B6B",
                    fontWeight: 300
                  }}
                >
                  {design.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {design.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{
                        fontFamily: "Tajawal, sans-serif",
                        backgroundColor: `${design.color}10`,
                        color: design.color,
                        border: `1px solid ${design.color}20`,
                        fontWeight: 400
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div 
                  className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase transition-all duration-300 group-hover:gap-5"
                  style={{ 
                    fontFamily: "Tajawal, sans-serif",
                    color: design.color,
                    fontWeight: 500
                  }}
                >
                  عرض التصميم
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "scaleX(-1)" }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>

              {/* Gradient Accent */}
              <div 
                className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ 
                  background: `radial-gradient(circle, ${design.color}20 0%, transparent 70%)`,
                  filter: "blur(40px)"
                }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Note */}
      <div 
        className="text-center text-sm max-w-2xl"
        style={{ 
          fontFamily: "Tajawal, sans-serif",
          color: "#9B9B9B",
          fontWeight: 300
        }}
      >
        <p className="mb-2">
          💡 <strong style={{ fontWeight: 500 }}>نصيحة:</strong> افتح كل تصميم في تبويب جديد للمقارنة جنباً إلى جنب
        </p>
        <p>
          بمجرد اختيار التصميم المفضل لديك، سنواصل التطوير بهذا التصميم
        </p>
      </div>
    </div>
  );
}