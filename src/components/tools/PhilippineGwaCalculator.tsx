import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Award,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import {
  calculatePhilippineGwa,
  type CourseEntry,
} from '../../services/calculatorService';

const DEFAULT_COURSES: CourseEntry[] = [
  { id: '1', courseCode: 'MATH 10 - Mathematics in the Modern World', units: 3, grade: 1.25 },
  { id: '2', courseCode: 'COMM 10 - Purposive Communication', units: 3, grade: 1.50 },
  { id: '3', courseCode: 'ETHICS 1 - Moral Philosophy & Ethics', units: 3, grade: 1.25 },
  { id: '4', courseCode: 'CS 101 - Introduction to Programming', units: 3, grade: 1.00 },
  { id: '5', courseCode: 'STS 1 - Science, Technology, and Society', units: 3, grade: 1.75 },
  { id: '6', courseCode: 'PE 1 - Physical Activities & Wellness', units: 2, grade: 1.00 },
  { id: '7', courseCode: 'NSTP 1 - Civic Welfare Training Service', units: 3, grade: 1.25 },
];

const PH_GRADES = [
  { val: 1.0, desc: '1.00 (97-100% Excellent)' },
  { val: 1.25, desc: '1.25 (94-96% Superior)' },
  { val: 1.5, desc: '1.50 (91-93% Very Good)' },
  { val: 1.75, desc: '1.75 (88-90% Above Average)' },
  { val: 2.0, desc: '2.00 (85-87% Good)' },
  { val: 2.25, desc: '2.25 (82-84% Satisfactory)' },
  { val: 2.5, desc: '2.50 (79-81% Fair)' },
  { val: 2.75, desc: '2.75 (76-78% Marginal Pass)' },
  { val: 3.0, desc: '3.00 (75% Passing)' },
  { val: 4.0, desc: '4.00 (Conditional)' },
  { val: 5.0, desc: '5.00 (Failed)' },
];

export const PhilippineGwaCalculator: React.FC = () => {
  const [courses, setCourses] = useState<CourseEntry[]>(DEFAULT_COURSES);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    return calculatePhilippineGwa(courses);
  }, [courses]);

  const handleAddCourse = () => {
    const newCourse: CourseEntry = {
      id: Date.now().toString(),
      courseCode: `Subject ${courses.length + 1}`,
      units: 3,
      grade: 1.5,
    };
    setCourses([...courses, newCourse]);
  };

  const handleUpdateCourse = (id: string, field: keyof CourseEntry, value: string | number) => {
    setCourses(
      courses.map((c) => {
        if (c.id !== id) return c;
        if (field === 'units') {
          return { ...c, units: Math.max(0, parseFloat(value as string) || 0) };
        }
        if (field === 'grade') {
          return { ...c, grade: parseFloat(value as string) || 0 };
        }
        return { ...c, [field]: value };
      })
    );
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    setCourses(DEFAULT_COURSES);
  };

  const handleClearAll = () => {
    setCourses([]);
  };

  const handleCopySummary = () => {
    const list = courses
      .map((c) => `• ${c.courseCode || 'Subject'}: ${c.units} units @ Grade ${c.grade.toFixed(2)}`)
      .join('\n');
    const text = `🎓 PHILIPPINE GWA REPORT 🎓
General Weighted Average (GWA): ${result.gwa.toFixed(3)}
Rating: ${result.adjectiveRating}
Latin Honors Eligibility: ${result.latinHonorsStanding}
Total Academic Units: ${result.totalUnits} (${result.passedUnits} passed)

Course Breakdown:
${list}
Generated via Multi-Converter`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero GWA Banner */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-neutral-900/80 to-neutral-950 border border-indigo-500/30 rounded-3xl p-6 shadow-xl shadow-indigo-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Philippine Higher Education (1.00 – 5.00 System)
              </span>
              <span className="text-xs text-neutral-400">CHED / UP / State University Scale</span>
            </div>
            <h2 className="text-xs font-semibold text-neutral-300 mt-2 uppercase tracking-wider">
              General Weighted Average (GWA)
            </h2>
            <div className="text-4xl sm:text-5xl font-extrabold text-neutral-100 font-mono tracking-tight mt-1 flex items-baseline gap-3">
              <span>{result.gwa > 0 ? result.gwa.toFixed(3) : '0.000'}</span>
              <span className={`text-base font-semibold ${result.colorClass}`}>
                {result.adjectiveRating}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                Honors Standing:{' '}
                <strong className="text-amber-300 font-semibold">{result.latinHonorsStanding}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700/60 transition-all active:scale-95 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Summary' : 'Copy GWA Report'}</span>
            </button>
            <div className="text-[11px] text-neutral-400">
              Total Units:{' '}
              <span className="font-mono text-neutral-200 font-bold">{result.totalUnits} units</span>
              {result.failedUnits > 0 && (
                <span className="text-rose-400 ml-1">({result.failedUnits} failed)</span>
              )}
            </div>
          </div>
        </div>

        {/* Latin Honors Reference Tiers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-neutral-800 text-xs">
          <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-amber-400 font-semibold">Summa Cum Laude</div>
            <div className="font-mono text-neutral-300 font-medium">1.000 – 1.200</div>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-emerald-400 font-semibold">Magna Cum Laude</div>
            <div className="font-mono text-neutral-300 font-medium">1.201 – 1.450</div>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-sky-400 font-semibold">Cum Laude</div>
            <div className="font-mono text-neutral-300 font-medium">1.451 – 1.750</div>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-blue-400 font-semibold">Dean’s List / Scholar</div>
            <div className="font-mono text-neutral-300 font-medium">1.751 – 2.000</div>
          </div>
        </div>
      </div>

      {/* Courses List Table / Editor */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Course Subjects & Grades ({courses.length})</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title="Reset to typical semester subjects"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sample Semester</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleAddCourse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 text-neutral-950 font-semibold text-xs hover:bg-indigo-400 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-800 rounded-xl">
            No courses in list. Click "Add Course" or "Sample Semester" above.
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course, idx) => (
              <div
                key={course.id}
                className="grid grid-cols-12 gap-2.5 items-center p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                {/* Index & Subject Code */}
                <div className="col-span-12 sm:col-span-6 flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neutral-500 w-5 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={course.courseCode}
                    onChange={(e) => handleUpdateCourse(course.id, 'courseCode', e.target.value)}
                    placeholder="Course Code / Subject Name"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Units */}
                <div className="col-span-5 sm:col-span-2 flex items-center gap-1.5">
                  <label className="text-[11px] text-neutral-400 shrink-0">Units:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={course.units}
                    onChange={(e) => handleUpdateCourse(course.id, 'units', e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Grade Dropdown */}
                <div className="col-span-5 sm:col-span-3">
                  <select
                    value={course.grade}
                    onChange={(e) => handleUpdateCourse(course.id, 'grade', e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs font-mono font-medium text-indigo-300 focus:outline-none focus:border-indigo-500"
                  >
                    {PH_GRADES.map((g) => (
                      <option key={g.val} value={g.val}>
                        {g.desc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete button */}
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(course.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title="Remove course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
