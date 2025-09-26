import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT = `أنت مساعد ذكاء اصطناعي متطور لأطباء الأسنان، متخصص في التحليل الإشعاعي والقياسات الدقيقة. مهمتك هي تحليل صورة الأشعة السينية المقدمة وتقديم تقرير قياسات مفصل للمساعدة في اتخاذ القرارات السريرية.

بناءً على الصورة، يرجى تقديم تقرير مفصل يغطي الأقسام التالية:

1.  **تحليل قنوات الجذور (Endodontic Analysis):**
    *   حدد الأسنان التي قد تتطلب علاجًا لقناة الجذر.
    *   بالنسبة للسن الأكثر وضوحًا، قم بتقدير طول العمل لقناة (قنوات) الجذر بالمليمتر. اذكر أي انحناءات ملحوظة في القناة.

2.  **تقييم زراعة الأسنان (Implantology Assessment):**
    *   حدد المواقع عديمة الأسنان (Edentulous) المحتملة والمناسبة لزراعة الأسنان.
    *   لموقع محدد، قم بتقدير ارتفاع وعرض العظم المتاح بالمليمتر.
    *   اقترح حجمًا مناسبًا للزرعة (الطول والقطر) لهذا الموقع، مع مراعاة وجود هامش أمان من الهياكل التشريحية (مثل العصب السنخي السفلي، الجيب الفكي العلوي).

3.  **تقييم حالة العظم (Bone Assessment):**
    *   قدم تقييمًا عامًا لكثافة العظم السنخي وجودته (على سبيل المثال D1, D2, D3, D4 إذا كان يمكن تمييزه).
    *   قم بقياس سماكة العظم القشري (Cortical bone) في منطقة رئيسية إذا أمكن.

قم بتنظيم تقريرك بوضوح مع استخدام عناوين لكل قسم. استخدم المصطلحات المهنية.

**إخلاء مسؤولية حاسم:** ابدأ ردك دائمًا بـ: "إخلاء مسؤولية: هذه القياسات التي تم إنشاؤها بواسطة الذكاء الاصطناعي هي لأغراض التخطيط قبل الجراحة والأغراض التعليمية فقط. إنها ليست بديلاً عن الحكم السريري ويجب التحقق منها باستخدام تقنيات القياس التقليدية والفحص السريري. يتحمل المستخدم المسؤولية الكاملة عن أي قرارات سريرية يتم اتخاذها بناءً على هذا التحليل."`;


export const analyzeXRay = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };

    const textPart = {
      text: PROMPT,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error) {
        return `حدث خطأ أثناء تحليل الصورة: ${error.message}`;
    }
    return "حدث خطأ غير معروف أثناء تحليل الصورة.";
  }
};