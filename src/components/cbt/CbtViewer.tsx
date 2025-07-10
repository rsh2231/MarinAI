'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { QnaItem, Question, Choice, SubjectGroup } from '@/types/ProblemViewer';
import { SUBJECTS_BY_LICENSE } from '@/lib/constants';
import Button from '@/components/ui/Button';
import SelectBox from '@/components/ui/SelectBox';
import SubjectTabs from '@/components/solve/SubjectTabs';
import QuestionCard from '@/components/solve/QuestionCard';
import { OmrSheet } from '@/components/exam/OmrSheet';
import { ResultView } from '@/components/exam/ResultView';
import { SubmitModal } from '@/components/exam/SubmitModal';
import { EmptyMessage } from '@/components/ui/EmptyMessage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    answersAtom,
    groupedQuestionsAtom,
    selectedSubjectAtom,
    allQuestionsAtom
} from '@/atoms/examAtoms';

type LicenseType = '기관사' | '항해사' | '소형선박조종사';
type ExamStatus = 'not-started' | 'in-progress' | 'finished';

const LICENSE_LEVELS: Record<string, string[]> = {
    항해사: ["1급", "2급", "3급", "4급", "5급", "6급"],
    기관사: ["1급", "2급", "3급", "4급", "5급", "6급"],
    소형선박조종사: ["일반"],
};

// 데이터 변환 로직 (ProblemViewer에서 가져옴)
const transformData = (qnas: QnaItem[]): SubjectGroup[] => {
    if (!qnas || qnas.length === 0) return [];
    const subjectMap = new Map<string, Question[]>();
    const isImageCode = (str: string) => str.trim().startsWith('@pic');
    const findImagePath = (code: string, paths: string[]): string | undefined => {
        const key = code.replace('@', '').trim();
        return paths.find((p) => p.includes(key));
    };

    qnas.forEach((item) => {
        const questionImageCode = isImageCode(item.questionstr) ? item.questionstr : null;
        const questionImagePath = questionImageCode && item.imgPaths ? findImagePath(questionImageCode, item.imgPaths) : undefined;

        const choices: Choice[] = [
            { label: '가', text: item.ex1str },
            { label: '나', text: item.ex2str },
            { label: '사', text: item.ex3str },
            { label: '아', text: item.ex4str },
        ].map((choice) => {
            const isImg = isImageCode(choice.text);
            const imgPath = isImg && item.imgPaths ? findImagePath(choice.text, item.imgPaths) : undefined;
            return {
                ...choice,
                isImage: isImg,
                text: isImg ? '' : choice.text,
                imageUrl: imgPath ? `/api/solve/img/${imgPath}` : undefined,
            };
        });

        const question: Question = {
            id: item.id,
            num: item.qnum,
            questionStr: questionImageCode ? '' : item.questionstr,
            choices,
            answer: item.answer,
            explanation: item.explanation,
            subjectName: item.subject,
            isImageQuestion: !!item.imgPaths,
            imageUrl: questionImagePath ? `/api/solve/img/${questionImagePath}` : undefined,
        };

        if (!subjectMap.has(item.subject)) {
            subjectMap.set(item.subject, []);
        }
        subjectMap.get(item.subject)!.push(question);
    });

    return Array.from(subjectMap.entries()).map(([subjectName, questions]) => ({
        subjectName,
        questions: questions.sort((a, b) => a.num - b.num), // 문제 번호순으로 정렬
    }));
};

export default function CbtViewer() {

    const [license, setLicense] = useState<LicenseType>('항해사');
    const [level, setLevel] = useState<string>('3급');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // --- 시험의 주요 상태는 Jotai에서 관리 ---
    const [status, setStatus] = useState<ExamStatus>('not-started'); // 시험의 전체적인 흐름 상태는 여기에 둬도 괜찮음
    const [answers, setAnswers] = useAtom(answersAtom);
    const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);

    // --- Atom 값을 설정하는 함수만 가져오기 ---
    const setGroupedQuestions = useSetAtom(groupedQuestionsAtom);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const groupedData = useAtomValue(groupedQuestionsAtom);
    const allQuestionsData = useAtomValue(allQuestionsAtom);

    useEffect(() => {
        setLevel(LICENSE_LEVELS[license][0]);
        setSelectedSubjects([]);
    }, [license]);

    const handleStartExam = async () => {
        if (selectedSubjects.length === 0) {
            alert('과목을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ license, level });
            selectedSubjects.forEach(subject => params.append('subjects', subject));
            const res = await fetch(`/api/cbt?${params.toString()}`);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || '데이터를 불러오는데 실패했습니다.');
            }

            const responseData: { qnas: QnaItem[] } = await res.json();
            const transformed = transformData(responseData.qnas);

            if (transformed.length === 0) {
                setError('선택하신 조건에 해당하는 문제 데이터가 없습니다.');
                setGroupedQuestions([]);
            } else {
                setGroupedQuestions(transformed);
                setSelectedSubject(transformed[0].subjectName) // 전역 상태 업데이트
                setStatus('in-progress');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        setIsModalOpen(false);
        setStatus('finished');
    };

    const handleSelectAnswer = (questionId: number, choice: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: choice }));
    };

    const onSelectSubject = useCallback((subj: string) => {
        setSelectedSubject(subj);
    }, [setSelectedSubject]);

    const selectedBlock = groupedData.find(group => group.subjectName === selectedSubject);
    const selectedIndex = groupedData.findIndex(s => s.subjectName === selectedSubject);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'auto' });

    const handleRetry = () => {
        setStatus('not-started');
        setAnswers({});
        setGroupedQuestions([]);
        setSelectedSubjects([]);
        setSelectedSubject(null);
    };

    // 렌더링 로직
    if (status === 'finished') {
        const correctAnswers = allQuestionsData.filter(q => answers[q.id] === q.answer).length;
        return <ResultView total={allQuestionsData.length} correct={correctAnswers} onRetry={handleRetry} />;
    }

    if (status === 'in-progress') {
        return (
            <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 pb-10 flex flex-col lg:flex-row gap-8">
                <div className="flex-grow">
                    {isLoading && <p className="text-center mt-8">문제를 불러오는 중...</p>}
                    {error && <p className="text-red-500 text-center mt-8">⚠️ {error}</p>}
                    {!isLoading && !error && (
                        <>
                            <div className="flex justify-center overflow-x-auto px-2 sm:px-6 no-scrollbar mb-4">
                                <SubjectTabs
                                    subjects={groupedData.map(g => g.subjectName)}
                                    selected={selectedSubject}
                                    setSelected={onSelectSubject}
                                />
                            </div>
                            <AnimatePresence mode="wait">
                                {selectedBlock ? (
                                    <motion.section
                                        key={selectedBlock.subjectName}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-6 sm:mt-8 space-y-5 sm:space-y-8"
                                    >
                                        {selectedBlock.questions.map((q) => (
                                            <QuestionCard
                                                key={q.id}
                                                question={q}
                                                selected={answers[q.id]}
                                                onSelect={(choice) => handleSelectAnswer(q.id, choice)}
                                                showAnswer={false}
                                            />
                                        ))}
                                        <div className="flex justify-center items-center gap-3 mt-8">
                                            <Button variant="neutral" onClick={() => { if (selectedIndex > 0) { setSelectedSubject(groupedData[selectedIndex - 1].subjectName); scrollToTop(); } }} disabled={selectedIndex <= 0}><ChevronLeft className="mr-1 h-4 w-4" /> 이전</Button>
                                            <Button onClick={() => { if (selectedIndex < groupedData.length - 1) { setSelectedSubject(groupedData[selectedIndex + 1].subjectName); scrollToTop(); } }} disabled={selectedIndex >= groupedData.length - 1}>다음 <ChevronRight className="ml-1 h-4 w-4" /></Button>
                                        </div>
                                    </motion.section>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center min-h-[300px]"><EmptyMessage /></div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
                <aside className="lg:w-80 lg:sticky top-24 self-start">
                    <OmrSheet />
                    <Button onClick={() => setIsModalOpen(true)} className="w-full mt-4">시험지 제출</Button>
                </aside>
                <AnimatePresence>
                    {isModalOpen && (
                        <SubmitModal
                            onConfirm={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            totalCount={allQuestionsData.length}
                            answeredCount={Object.keys(answers).length}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">CBT 시험 설정</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">자격증 선택</label>
                        <SelectBox
                            id="license-select"
                            label="자격증"
                            value={license}
                            onChange={(e) => setLicense(e.target.value as LicenseType)}
                            options={Object.keys(LICENSE_LEVELS)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">급수 선택</label>
                        <SelectBox
                            id="level"
                            label='급수'
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            options={LICENSE_LEVELS[license]} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">과목 선택 (다중 선택 가능)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SUBJECTS_BY_LICENSE[license]?.map((subject) => (
                                <Button key={subject} onClick={() => setSelectedSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject])} variant={selectedSubjects.includes(subject) ? 'primary' : 'neutral'} className="w-full">
                                    {subject}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    <Button onClick={handleStartExam} disabled={selectedSubjects.length === 0 || isLoading} className="w-full text-lg py-3">
                        {isLoading ? '불러오는 중...' : '시험 시작'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}