import React, { useState, useCallback, ChangeEvent } from 'react';
import { analyzeXRay } from './services/geminiService';

enum Status {
  Idle,
  Loading,
  Success,
  Error,
}

// Helper Components (defined outside the main component to prevent re-creation on re-renders)

const DentalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5,8C16.5,6.07 14.43,4.5 12,4.5C9.57,4.5 7.5,6.07 7.5,8C7.5,9.25 8.16,10.33 9,11.09V12C8.16,12.67 7.5,13.75 7.5,15C7.5,16.93 9.57,18.5 12,18.5C14.43,18.5 16.5,16.93 16.5,15C16.5,13.75 15.84,12.67 15,12V11.09C15.84,10.33 16.5,9.25 16.5,8M12,3A9,9 0 0,1 21,12A9,9 0 0,1 12,21A9,9 0 0,1 3,12A9,9 0 0,1 12,3Z" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="text-lg text-blue-500 dark:text-blue-400 font-semibold">جاري إجراء القياسات، الرجاء الانتظار...</p>
    </div>
);

const Disclaimer: React.FC = () => (
    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-12 max-w-2xl mx-auto">
        إخلاء مسؤولية: هذه الأداة تعمل بالذكاء الاصطناعي وتهدف لمساعدة أطباء الأسنان في التخطيط الأولي. القياسات والتحليلات المقدمة هي تقديرية ويجب التحقق منها إكلينيكيًا قبل اتخاذ أي قرار علاجي. الاستخدام يقع على مسؤولية الطبيب المعالج.
    </p>
);

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
          setStatus(Status.Error);
          setError('نوع الملف غير مدعوم. الرجاء رفع صورة من نوع PNG, JPG, أو WEBP.');
          return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysis('');
      setError('');
      setStatus(Status.Idle);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URI prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!file) return;

    setStatus(Status.Loading);
    setError('');
    
    try {
        const base64Image = await fileToBase64(file);
        const result = await analyzeXRay(base64Image, file.type);
        setAnalysis(result);
        setStatus(Status.Success);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
        setError(`فشل التحليل: ${errorMessage}`);
        setStatus(Status.Error);
    }
  }, [file]);

  const handleReset = () => {
      setFile(null);
      setPreviewUrl(null);
      setAnalysis('');
      setError('');
      setStatus(Status.Idle);
  };


  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-8 font-[sans-serif]">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
                <DentalIcon className="w-12 h-12 text-blue-600 dark:text-blue-400"/>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
                    أداة قياس وتحليل أشعة الأسنان المتقدمة
                </h1>
            </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            أداة احترافية لأطباء الأسنان لتحليل القياسات الدقيقة من صور الأشعة.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            {!previewUrl && (
                 <div className="flex flex-col items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت الصورة هنا</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                    </label>
                </div> 
            )}

            {previewUrl && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">الصورة المرفوعة</h2>
                        <div className="w-full h-auto bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                             <img src={previewUrl} alt="معاينة الأشعة" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={handleAnalyze}
                                disabled={status === Status.Loading}
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === Status.Loading ? 'جاري التحليل...' : 'بدء التحليل'}
                            </button>
                             <button
                                onClick={handleReset}
                                className="px-8 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all shadow-md hover:shadow-lg"
                            >
                                رفع صورة أخرى
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0">
                         <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">نتائج التحليل</h2>
                        <div className="w-full min-h-[300px] p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                            {status === Status.Loading && <LoadingSpinner />}
                            {status === Status.Error && <p className="text-red-500 text-center">{error}</p>}
                            {status === Status.Success && (
                                <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-right w-full" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}></div>
                            )}
                            {status === Status.Idle && <p className="text-gray-500 dark:text-gray-400 text-center">التقرير القياسي المفصل سيظهر هنا.</p>}
                        </div>
                    </div>
                </div>
            )}
            
            {error && status !== Status.Loading && (
                 <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg text-center">
                    {error}
                </div>
            )}

        </main>
        
        <Disclaimer />

      </div>
    </div>
  );
};

export default App;