"use client";
import { useState } from "react";

const faqs = [
    {
        question: "هل أحتاج خبرة سابقة في البرمجة؟",
        answer: "لا، لا تحتاج إلى أي خبرة سابقة في البرمجة. دوراتنا مصممة لتناسب جميع المستويات بدءاً من المبتدئين تماماً. نبدأ معك من الأساسيات ونتدرج حتى المستويات المتقدمة خطوة بخطوة مع أمثلة عملية وتمارين تفاعلية."
    },
    {
        question: "هل الشهادات معتمدة؟",
        answer: "نعم، نقدم شهادات إتمام معتمدة لكل دورة تكملها بنجاح. شهاداتنا معترف بها في سوق العمل ويمكن إضافتها إلى سيرتك الذاتية وملفك الشخصي على LinkedIn. كما نقدم شهادات خاصة لبرامج المسارات التعليمية الكاملة."
    },
    {
        question: "كم مدة الوصول للمحتوى؟",
        answer: "بمجرد اشتراكك، تحصل على وصول مدى الحياة لجميع الدورات والمحتوى التعليمي. يمكنك التعلم بالوتيرة التي تناسبك دون أي ضغط زمني. كما أن جميع التحديثات المستقبلية للدورات ستكون متاحة لك مجاناً."
    },
    {
        question: "هل يوجد دعم فني؟",
        answer: "نعم، نوفر دعماً فنياً على مدار الساعة عبر الدردشة المباشرة والبريد الإلكتروني. بالإضافة إلى ذلك، يمكنك طرح أسئلتك في مجتمعنا النشط والحصول على إجابات من المدربين والطلاب الآخرين. كما يتوفر مساعد ذكي يعمل بالذكاء الاصطناعي للإجابة الفورية."
    },
    {
        question: "هل يمكنني استرداد أموالي؟",
        answer: "نعم، نقدم ضمان استرداد الأموال خلال 30 يوماً من تاريخ الاشتراك. إذا لم تكن راضياً عن المحتوى لأي سبب، يمكنك التواصل مع فريق الدعم وسيتم استرداد المبلغ كاملاً دون أي أسئلة."
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="section-container">
            <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    الأسئلة <span className="gradient-text">الشائعة</span>
                </h2>
                <p style={{ color: '#5c5549' }} className="max-w-2xl mx-auto">
                    إجابات على أكثر الأسئلة شيوعاً
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="glass-card overflow-hidden transition-all duration-300"
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex items-center justify-between p-6 text-right cursor-pointer"
                            aria-expanded={openIndex === index}
                        >
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: '#a89f8e' }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            <h3 className="font-bold text-base" style={{ color: '#1a1612' }}>
                                {faq.question}
                            </h3>
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="px-6 pb-6 pt-0">
                                <p className="text-sm leading-relaxed pt-4" style={{ color: '#5c5549', borderTop: '1px solid #ece4d4' }}>
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
