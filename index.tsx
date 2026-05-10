import { useContext } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
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

export default function Dashboard() {
  const context = useContext(TaskContext) as {
    tasks: Task[];
    darkMode: boolean;
    toggleDarkMode: () => void;
  };
  if (!context) return null;

  const { tasks, darkMode, toggleDarkMode } = context;

  const today = new Date();

  const next7Days = tasks
    .filter((t) => {
      const d = safeParseDate(t.date);
      const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return !t.completed && diff >= 0 && diff <= 7;
    })
    .sort((a, b) => safeParseDate(a.date).getTime() - safeParseDate(b.date).getTime());

  const overdue = tasks.filter((t) => !t.completed && safeParseDate(t.date) < today).length;
  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;

  const highPending = tasks.filter((t) => !t.completed && t.priority === 'High').length;
  const stressScore = Math.min(100, overdue * 20 + highPending * 15 + pending * 5);

  const getStress = () => {
    if (stressScore >= 70) return { label: 'High 😰', msg: 'Take breaks. You can do it! 💪', color: '#ff4d4d' };
    if (stressScore >= 40) return { label: 'Medium 😐', msg: "You're managing well. Keep going!", color: '#ffa500' };
    return { label: 'Low 😊', msg: "Great job! You're on top of things 🎉", color: '#4CAF50' };
  };

  const stress = getStress();

  const getPriorityColor = (p: string) => {
    if (p === 'High') return '#ff4d4d';
    if (p === 'Medium') return '#ffa500';
    return '#4CAF50';
  };

  // 🌙 Theme colors
  const bg = darkMode ? '#121212' : '#f5f5f5';
  const card = darkMode ? '#1e1e1e' : 'white';
  const text = darkMode ? '#ffffff' : '#000000';
  const subText = darkMode ? '#aaaaaa' : '#555555';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>

      {/* Header + Dark Mode toggle */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.header, { color: text }]}>Hello, Student! 👋</Text>
          <Text style={[styles.subtitle, { color: subText }]}>You've got this! 🙌</Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={{ color: subText }}>{darkMode ? '🌙' : '☀️'}</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} thumbColor={darkMode ? '#6C63FF' : '#f4f3f4'} />
        </View>
      </View>

      {/* Stress Meter */}
      <View style={[styles.stressCard, { backgroundColor: card }]}>
        <Text style={[styles.stressTitle, { color: subText }]}>STRESS METER</Text>
        <View style={styles.stressRow}>
          <View style={[styles.stressMeterOuter, { backgroundColor: darkMode ? '#333' : '#eee' }]}>
            <View
              style={[
                styles.stressMeterFill,
                { width: `${stressScore}%` as any, backgroundColor: stress.color },
              ]}
            />
          </View>
          <Text style={[styles.stressPercent, { color: stress.color }]}>{stressScore}%</Text>
        </View>
        <Text style={[styles.stressLabel, { color: stress.color }]}>{stress.label}</Text>
        <Text style={[styles.stressMsg, { color: subText }]}>{stress.msg}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderColor: '#ff4d4d', backgroundColor: card }]}>
          <Text style={[styles.statNum, { color: '#ff4d4d' }]}>{overdue}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Overdue</Text>
        </View>
        <View style={[styles.statBox, { borderColor: '#ffa500', backgroundColor: card }]}>
          <Text style={[styles.statNum, { color: '#ffa500' }]}>{pending}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Pending</Text>
        </View>
        <View style={[styles.statBox, { borderColor: '#4CAF50', backgroundColor: card }]}>
          <Text style={[styles.statNum, { color: '#4CAF50' }]}>{completed}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Done</Text>
        </View>
      </View>

      {/* Upcoming */}
      <Text style={[styles.section, { color: text }]}>📅 Upcoming (Next 7 Days)</Text>
      {next7Days.length === 0 ? (
        <Text style={[styles.emptyText, { color: subText }]}>No upcoming tasks. Add some from Tasks tab!</Text>
      ) : (
        next7Days.map((task) => (
          <View key={task.id} style={[styles.taskRow, { backgroundColor: card }]}>
            <View style={[styles.dot, { backgroundColor: getPriorityColor(task.priority) }]} />
            <Text style={[styles.taskTitle, { color: text }]}>{task.title}</Text>
            <Text style={[styles.taskDate, { color: subText }]}>{task.date}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stressCard: { borderRadius: 16, padding: 20, marginBottom: 20, elevation: 3 },
  stressTitle: { fontWeight: 'bold', fontSize: 13, marginBottom: 10 },
  stressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stressMeterOuter: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden', marginRight: 10 },
  stressMeterFill: { height: 12, borderRadius: 6 },
  stressPercent: { fontWeight: 'bold', fontSize: 16 },
  stressLabel: { fontWeight: 'bold', fontSize: 18 },
  stressMsg: { marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, margin: 5, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2 },
  statNum: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { marginTop: 4 },
  section: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  taskTitle: { flex: 1, fontSize: 15 },
  taskDate: { fontSize: 13 },
  emptyText: { fontStyle: 'italic' },
});