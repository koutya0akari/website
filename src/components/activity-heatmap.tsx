"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface ActivityData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  year?: number;
}

export function ActivityHeatmap({ data, year = new Date().getFullYear() }: ActivityHeatmapProps) {
  const { weeks, months, maxCount } = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Adjust start to Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const dataMap = new Map(data.map((d) => [d.date, d.count]));
    const weeks: { date: Date; count: number }[][] = [];
    const months: { name: string; week: number }[] = [];

    let currentWeek: { date: Date; count: number }[] = [];
    let currentDate = new Date(startDate);
    let weekIndex = 0;
    let lastMonth = -1;

    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = dataMap.get(dateStr) || 0;

      // Track months
      const month = currentDate.getMonth();
      if (month !== lastMonth && currentDate.getFullYear() === year) {
        months.push({
          name: currentDate.toLocaleDateString("ja-JP", { month: "short" }),
          week: weekIndex,
        });
        lastMonth = month;
      }

      currentWeek.push({ date: new Date(currentDate), count });

      if (currentDate.getDay() === 6 || currentDate > endDate) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);

      if (currentDate > endDate && currentWeek.length === 0) break;
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return { weeks, months, maxCount };
  }, [data, year]);

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const intensityColors = [
    "bg-white/5 border-white/10",
    "bg-accent/20 border-accent/30",
    "bg-accent/40 border-accent/50",
    "bg-accent/60 border-accent/70",
    "bg-accent border-accent",
  ];

  const totalActivities = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;
  const currentStreak = useMemo(() => {
    const sortedDates = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];

    for (const entry of sortedDates) {
      if (entry.count > 0) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - streak);
        const expectedStr = expectedDate.toISOString().split("T")[0];
        if (entry.date === expectedStr || entry.date === today) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl font-bold text-accent">{totalActivities}</div>
          <div className="text-xs text-white/50">総アクティビティ</div>
        </motion.div>
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl font-bold text-highlight">{activeDays}</div>
          <div className="text-xs text-white/50">アクティブ日数</div>
        </motion.div>
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-white">{currentStreak}</div>
          <div className="text-xs text-white/50">連続日数</div>
        </motion.div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4">
        {/* Month labels */}
        <div className="mb-2 ml-8 flex gap-1">
          {months.map((month, i) => (
            <div
              key={`${month.name}-${i}`}
              className="text-[10px] text-white/40"
              style={{ marginLeft: i > 0 ? `${(month.week - months[i - 1].week - 1) * 14}px` : 0 }}
            >
              {month.name}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-2 text-[10px] text-white/40">
            <span className="h-3" />
            <span className="h-3">月</span>
            <span className="h-3" />
            <span className="h-3">水</span>
            <span className="h-3" />
            <span className="h-3">金</span>
            <span className="h-3" />
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const intensity = getIntensity(day.count);
                  const dateStr = day.date.toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`group relative h-3 w-3 cursor-pointer rounded-sm border ${intensityColors[intensity]} transition-transform hover:scale-125`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (weekIndex * 7 + dayIndex) * 0.002,
                        duration: 0.2,
                      }}
                    >
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="whitespace-nowrap rounded-lg bg-night px-2 py-1 text-xs text-white shadow-lg">
                          <div className="font-medium">{dateStr}</div>
                          <div className="text-white/60">{day.count} 件の活動</div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 border-4 border-transparent border-t-night" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-white/40">
          <span>少ない</span>
          {intensityColors.map((color, i) => (
            <div key={i} className={`h-3 w-3 rounded-sm border ${color}`} />
          ))}
          <span>多い</span>
        </div>
      </div>
    </div>
  );
}

