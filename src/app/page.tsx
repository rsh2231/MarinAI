export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-700 mb-4 select-none">
        ⚓ MarinAI
      </h1>
      <p className="max-w-xl text-gray-600 text-base sm:text-lg mb-12 text-center leading-relaxed">
        궁금한 점을 질문하거나, 문제를 복사해 붙여넣고 AI와 함께 학습하세요.
      </p>
    </div>
  );
}