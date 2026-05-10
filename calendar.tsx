import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { TaskContext } from '../../context/TaskContext';
import { toISODate } from '../../utils/date';

type Task = {
  id: string;
  title: string;
  priority: string;
  date: string;
  completed: boolean;
  subject: string;
  type: string;
};

export default function CalendarScreen() {
  const context = useContext(TaskContext) as {
    tasks: Task[];
    darkMode: boolean;
  };
  if (!context) return null;

  const { tasks, darkMode } = context;
  const [selectedDate, setSelectedDate] = useState('');

  const bg = darkMode ? '#121212' : '#f5f5f5';
  const card = darkMode ? '#1e1e1e' : 'white';
  const text = darkMode ? '#ffffff' : '#000000';
  const subText = darkMode ? '#aaaaaa' : '#555555';

  const getPriorityColor = (p: string) => {
    if (p === 'High') return '#ff4d4d';
    if (p === 'Medium') return '#ffa500';
    return '#4CAF50';
  };

  const getTypeColor = (t: string) => {
    if (t === 'Exam') return '#9b59b6';
    if (t === 'Quiz') return '#3498db';
    return '#2ecc71';
  };

  const markedDates: any = {};
  tasks.forEach((task) => {
    const iso = toISODate(task.date);
    if (!iso) return;
    markedDates[iso] = { marked: true, dotColor: getPriorityColor(task.priority) };
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: '#6C63FF',
    };
  }

  const selectedTasks = tasks.filter((t) => toISODate(t.date) === selectedDate);

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.header, { color: text }]}>📅 Calendar</Text>

      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: card,
          calendarBackground: card,
          selectedDayBackgroundColor: '#6C63FF',
          todayTextColor: '#6C63FF',
          arrowColor: '#6C63FF',
          dayTextColor: text,
          textDisabledColor: subText,
          monthTextColor: text,
        }}
      />

      <Text style={[styles.subHeader, { color: text }]}>
        {selectedDate ? `Tasks on ${selectedDate}` : 'Tap a date to see tasks'}
      </Text>

      {selectedDate && selectedTasks.length === 0 && (
        <Text style={[styles.emptyText, { color: subText }]}>No tasks for this date 🎉</Text>
      )}

      {selectedTasks.map((task) => (
        <View key={task.id} style={[styles.card, { backgroundColor: card, borderLeftColor: getPriorityColor(task.priority) }]}>
          <Text style={[styles.taskTitle, { color: text }, task.completed && styles.done]}>
            {task.completed ? '✅ ' : '○ '}{task.title}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: getTypeColor(task.type) }]}>
              <Text style={styles.badgeText}>{task.type}</Text>
            </View>
            {task.subject ? (
              <View style={[styles.badge, { backgroundColor: '#555' }]}>
                <Text style={styles.badgeText}>{task.subject}</Text>
              </View>
            ) : null}
            <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.badgeText}>{task.priority}</Text>
            </View>
          </View>
          {task.completed && <Text style={styles.completedTag}>Completed ✅</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { marginTop: 20, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { fontStyle: 'italic' },
  card: { padding: 14, marginBottom: 10, borderRadius: 12, borderLeftWidth: 5 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  done: { textDecorationLine: 'line-through', color: 'gray' },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  completedTag: { color: '#4CAF50', fontWeight: '600', marginTop: 6 },
});