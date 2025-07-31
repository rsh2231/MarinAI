interface WrongNoteBadgesProps {
  year?: number;
  type?: string;
  grade?: string;
  inning?: string;
  className?: string;
}

export const WrongNoteBadges = ({ year, type, grade, inning, className = "" }: WrongNoteBadgesProps) => (
  <div className={`flex flex-wrap gap-1.5 ${className}`}>
    {/* 연도 */}
    {year && (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-purple-500/30 hover:to-purple-600/30">
        {year}년
      </span>
    )}
    {/* 자격증 */}
    {type && (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-blue-500/30 hover:to-blue-600/30">
        {type}
      </span>
    )}
    {/* 급수 */}
    {grade && type !== "소형선박조종사" && (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-green-500/30 hover:to-green-600/30">
        {grade}급
      </span>
    )}
    {/* 회차 */}
    {inning && (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-orange-500/30 hover:to-orange-600/30">
        {inning}회차
      </span>
    )}
  </div>
); 