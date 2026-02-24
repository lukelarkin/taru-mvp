import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import { useTaruStore, selectSelfTrustScore, type SurrenderEntry, type RelapseEntry } from '@/store/taru-store';
import { QUADRANT_ACCENT } from '@/constants/surrender-states';

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateInsights(
  surrenders: SurrenderEntry[],
  relapses: RelapseEntry[]
): string[] {
  const insights: string[] = [];
  const allEntries = [...surrenders, ...relapses];

  if (allEntries.length < 5) return insights;

  // Night-time pattern (10pm–4am)
  const nightCount = allEntries.filter((e) => {
    const hour = new Date(e.timestamp).getHours();
    return hour >= 22 || hour < 4;
  }).length;
  if (nightCount > allEntries.length * 0.4) {
    insights.push('Most of your hard moments happen at night. Build a night-time ritual.');
  }

  // Dominant emotional state
  const stateCounts: Record<string, number> = {};
  allEntries.forEach((e) => {
    stateCounts[e.emotionalState] = (stateCounts[e.emotionalState] ?? 0) + 1;
  });
  const topEntry = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0];
  if (topEntry && topEntry[1] >= 3) {
    insights.push(
      `"${topEntry[0]}" is your most common trigger. That is the feeling to build a response to first.`
    );
  }

  // Surrender rate
  if (surrenders.length > 0 && relapses.length > 0) {
    const ratio = surrenders.length / (surrenders.length + relapses.length);
    if (ratio > 0.6) {
      insights.push(
        `You caught yourself ${surrenders.length} time${surrenders.length !== 1 ? 's' : ''} before acting. That pattern is real.`
      );
    }
  } else if (surrenders.length >= 5 && relapses.length === 0) {
    insights.push(`${surrenders.length} surrenders. Zero relapses logged. That is not an accident.`);
  }

  return insights;
}

type TimelineEntry =
  | ({ type: 'surrender' } & SurrenderEntry)
  | ({ type: 'relapse' } & RelapseEntry);

export default function CollapseMapScreen() {
  const surrenders = useTaruStore((s) => s.surrenders);
  const relapses = useTaruStore((s) => s.relapses);
  const archetype = useTaruStore((s) => s.archetype);
  const score = useTaruStore(selectSelfTrustScore);

  const accentColor = archetype ? ArchetypeColors[archetype] : TaruColors.electricBlue;

  const timeline: TimelineEntry[] = [
    ...surrenders.map((s) => ({ ...s, type: 'surrender' as const })),
    ...relapses.map((r) => ({ ...r, type: 'relapse' as const })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const insights = generateInsights(surrenders, relapses);
  const totalEntries = surrenders.length + relapses.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Score */}
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreLabel}>Self-Trust Score</Text>
          <Text style={[styles.scoreValue, { color: accentColor }]}>{score}</Text>
          <Text style={styles.scoreSubtext}>
            {surrenders.length} surrender{surrenders.length !== 1 ? 's' : ''} ·{' '}
            {relapses.length} relapse{relapses.length !== 1 ? 's' : ''} logged
          </Text>
        </View>

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Patterns</Text>
            {insights.map((insight, i) => (
              <View key={i} style={styles.insightCard}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {totalEntries > 0 && totalEntries < 5 && (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>
              {5 - totalEntries} more {5 - totalEntries === 1 ? 'entry' : 'entries'} until patterns surface.
            </Text>
          </View>
        )}

        {/* Timeline */}
        {timeline.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing here yet.</Text>
            <Text style={styles.emptyText}>
              Use the app in hard moments. Your entries will appear here — no judgment, just data.
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Timeline</Text>
            {timeline.map((entry, i) => {
              const isSurrender = entry.type === 'surrender';
              const dotColor = isSurrender
                ? (entry.type === 'surrender' && entry.quadrant
                    ? QUADRANT_ACCENT[entry.quadrant]
                    : TaruColors.neonGreen)
                : TaruColors.hotPink;
              return (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.timelineLine}>
                    <View style={[styles.dot, { backgroundColor: dotColor }]} />
                    {i < timeline.length - 1 && <View style={styles.connector} />}
                  </View>
                  <View style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <Text style={[styles.entryType, { color: dotColor }]}>
                        {isSurrender ? 'Surrender' : 'Relapse'}
                      </Text>
                      <Text style={styles.entryDate}>{formatDate(entry.timestamp)}</Text>
                    </View>
                    <Text style={styles.entryEmotion}>{entry.emotionalState}</Text>
                    {entry.type === 'surrender' && entry.quadrant && (
                      <Text style={[styles.quadrantLabel, { color: QUADRANT_ACCENT[entry.quadrant] }]}>
                        {entry.quadrant.replace('_', ' ').toLowerCase()}
                      </Text>
                    )}
                    {entry.type === 'relapse' && entry.honestSentence ? (
                      <Text style={styles.entrySentence}>"{entry.honestSentence}"</Text>
                    ) : null}
                    {entry.type === 'relapse' && entry.patternNotes.length > 0 ? (
                      <View style={styles.noteRow}>
                        {entry.patternNotes.map((note, j) => (
                          <View key={j} style={styles.noteChip}>
                            <Text style={styles.noteChipText}>{note}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TaruColors.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 60 },
  scoreHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    color: TaruColors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
  },
  scoreSubtext: {
    fontSize: 14,
    color: TaruColors.textSecondary,
  },
  section: {
    marginBottom: 40,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    color: TaruColors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  insightCard: {
    backgroundColor: TaruColors.surface,
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: TaruColors.electricBlue,
  },
  insightText: {
    fontSize: 15,
    color: TaruColors.textPrimary,
    lineHeight: 22,
  },
  hintCard: {
    backgroundColor: TaruColors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 32,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    color: TaruColors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TaruColors.textSecondary,
  },
  emptyText: {
    fontSize: 15,
    color: TaruColors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLine: {
    alignItems: 'center',
    width: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  connector: {
    width: 1,
    flex: 1,
    backgroundColor: TaruColors.border,
    marginTop: 4,
    marginBottom: -12,
  },
  entryCard: {
    flex: 1,
    paddingBottom: 24,
    gap: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryType: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  entryDate: {
    fontSize: 12,
    color: TaruColors.textMuted,
  },
  entryEmotion: {
    fontSize: 16,
    color: TaruColors.textPrimary,
    fontWeight: '500',
  },
  entrySentence: {
    fontSize: 14,
    color: TaruColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  noteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  noteChip: {
    backgroundColor: TaruColors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  noteChipText: {
    fontSize: 12,
    color: TaruColors.textSecondary,
  },
  quadrantLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
});
