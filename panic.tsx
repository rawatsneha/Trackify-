import { useContext } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TaskContext } from '../../context/TaskContext';
import { safeParseDate } from '../../utils/date';

type Task = {
  id: string;
  title: string;
  priority: string;
  date: string;
  completed: boolean;
  subject: string;
  type: string;
};

export default function PanicScreen() {
  const context = useContext(TaskContext) as {
    tasks: Task[];
    darkMode: boolean;
  };
  if (!context) return null;

  const { tasks, darkMode } = context;
  const today = new Date();

  const bg = darkMode ? '#1a0000' : '#fff5f5';
  const card = darkMode ? '#2a0000' : 'white';
  const text = darkMode ? '#ffffff' : '#000000';
  const subText = darkMode ? '#aaaaaa' : '#555555';

  const panicTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => safeParseDate(a.date).getTime() - safeParseDate(b.date).getTime());

  const getDaysLeft = (dateStr: string) => {
    const diff = Math.ceil((safeParseDate(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due TODAY ⚡';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  const getDaysNum = (dateStr: string) =>
    Math.ceil((safeParseDate(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getColor = (p: string) => {
    if (p === 'High') return '#ff4d4d';
    if (p === 'Medium') return '#ffa500';
    return '#4CAF50';
  };

  const getTypeColor = (t: string) => {
    if (t === 'Exam') return '#9b59b6';
    if (t === 'Quiz') return '#3498db';
    return '#2ecc71';
  };

  const mostUrgent = panicTasks[0];

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.header, { color: '#ff4d4d' }]}>🔥 Panic Mode</Text>

      {panicTasks.length === 0 ? (
        <View style={[styles.allGoodCard, { backgroundColor: darkMode ? '#002200' : '#e8f5e9' }]}>
          <Text style={[styles.allGoodText, { color: '#2e7d32' }]}>🎉 You're all caught up!</Text>
          <Text style={[styles.allGoodSub, { color: subText }]}>No pending tasks. Amazing work!</Text>
        </View>
      ) : (
        <>
          {mostUrgent && (
            <View style={[styles.alertCard, { backgroundColor: card }]}>
              <Text style={styles.alertTitle}>⚠️ {getDaysLeft(mostUrgent.date)}!</Text>
              <Text style={[styles.alertTask, { color: text }]}>{mostUrgent.title} — {mostUrgent.date}</Text>
              {mostUrgent.subject ? (
                <Text style={[styles.alertTask, { color: subText }]}>📚 {mostUrgent.subject}</Text>
              ) : null}
              <Text style={[styles.alertSub, { color: text }]}>Here's what to focus on:</Text>
              <Text style={[styles.focusItem, { color: subText }]}>1. Review your notes & syllabus</Text>
              <Text style={[styles.focusItem, { color: subText }]}>2. Prioritize high-weightage topics</Text>
              <Text style={[styles.focusItem, { color: subText }]}>3. Solve past papers / assignments</Text>
              <Text style={[styles.focusItem, { color: subText }]}>4. Take 5-min breaks every hour</Text>
            </View>
          )}

          <View style={styles.motivCard}>
            <Text style={styles.motivText}>You can still do it! 🚀</Text>
            <Text style={styles.motivSub}>Stay focused. Stay calm.</Text>
          </View>

          <TouchableOpacity style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Now 🚀</Text>
          </TouchableOpacity>

          <Text style={[styles.section, { color: text }]}>All Pending Tasks</Text>
          <FlatList
            data={panicTasks}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.card,
                {
                  backgroundColor: card,
                  borderLeftColor: getDaysNum(item.date) < 0 ? '#ff0000' : getColor(item.priority)
                }
              ]}>
                <Text style={[styles.taskTitle, { color: text }]}>{item.title}</Text>

                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: getTypeColor(item.type) }]}>
                    <Text style={styles.badgeText}>{item.type}</Text>
                  </View>
                  {item.subject ? (
                    <View style={[styles.badge, { backgroundColor: '#555' }]}>
                      <Text style={styles.badgeText}>{item.subject}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.taskMeta}>
                  <Text style={[styles.priorityText, { color: getColor(item.priority) }]}>{item.priority}</Text>
                  <Text style={[styles.daysLeft, { color: getDaysNum(item.date) <= 1 ? '#ff4d4d' : subText }]}>
                    {getDaysLeft(item.date)}
                  </Text>
                </View>
                <Text style={[styles.dateText, { color: subText }]}>📅 {item.date}</Text>
              </View>
            )}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
  alertCard: { borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 2, borderColor: '#ff4d4d' },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#c0392b', marginBottom: 6 },
  alertTask: { fontSize: 15, marginBottom: 6 },
  alertSub: { fontWeight: 'bold', marginBottom: 8, marginTop: 6 },
  focusItem: { marginBottom: 4, paddingLeft: 8 },
  motivCard: { backgroundColor: '#6C63FF', borderRadius: 16, padding: 18, marginBottom: 15, alignItems: 'center' },
  motivText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  motivSub: { color: '#ddd', marginTop: 4 },
  startBtn: { backgroundColor: '#ff4d4d', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  section: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { borderRadius: 12, padding: 15, marginBottom: 10, borderLeftWidth: 6, elevation: 2 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  taskMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priorityText: { fontWeight: 'bold' },
  daysLeft: { fontWeight: '600' },
  dateText: { marginTop: 2 },
  allGoodCard: { borderRadius: 16, padding: 30, alignItems: 'center', marginTop: 40 },
  allGoodText: { fontSize: 22, fontWeight: 'bold' },
  allGoodSub: { marginTop: 8 },
});