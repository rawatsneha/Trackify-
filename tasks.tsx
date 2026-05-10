import { useContext, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

const TYPES = ['Assignment', 'Exam', 'Quiz', 'Other'];

export default function TasksScreen() {
  const context = useContext(TaskContext) as {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    darkMode: boolean;
  };
  if (!context) return null;

  const { tasks, setTasks, darkMode } = context;

  const bg = darkMode ? '#121212' : '#f5f5f5';
  const card = darkMode ? '#1e1e1e' : 'white';
  const text = darkMode ? '#ffffff' : '#000000';
  const subText = darkMode ? '#aaaaaa' : '#555555';
  const border = darkMode ? '#333' : '#ddd';

  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('Assignment');
  const [customType, setCustomType] = useState('');

  const [editVisible, setEditVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editType, setEditType] = useState('Assignment');
  const [editCustomType, setEditCustomType] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');

  const today = new Date();

  const overdueTasks = tasks.filter((t) => !t.completed && safeParseDate(t.date) < today);
  const upcomingTasks = tasks.filter((t) => !t.completed && safeParseDate(t.date) >= today);
  const completedTasks = tasks.filter((t) => t.completed);

  const addTask = () => {
    if (task.trim() === '' || date.trim() === '') {
      alert('Enter task name and date! (e.g. 30 Apr)');
      return;
    }
    if (type === 'Other' && customType.trim() === '') {
      alert('Please enter a custom type!');
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: task,
      priority,
      date,
      completed: false,
      subject,
      type: type === 'Other' ? customType : type,
    };
    setTasks((prev) => [...prev, newTask]);
    setTask('');
    setDate('');
    setSubject('');
    setCustomType('');
  };

  const deleteTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const toggleComplete = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const openEdit = (item: Task) => {
    setEditTask(item);
    setEditTitle(item.title);
    setEditDate(item.date);
    setEditSubject(item.subject || '');
    setEditPriority(item.priority);
    if (TYPES.slice(0, 3).includes(item.type)) {
      setEditType(item.type);
      setEditCustomType('');
    } else {
      setEditType('Other');
      setEditCustomType(item.type);
    }
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!editTask) return;
    if (!editTitle || editTitle.trim() === '' || !editDate || editDate.trim() === '') {
      alert('Title and date cannot be empty!');
      return;
    }
    if (editType === 'Other' && (!editCustomType || editCustomType.trim() === '')) {
      alert('Please enter a custom type!');
      return;
    }
    setTasks(tasks.map((t) =>
      t.id === editTask.id
        ? {
            ...t,
            title: editTitle.trim(),
            date: editDate.trim(),
            subject: editSubject?.trim() || '',
            priority: editPriority,
            type: editType === 'Other' ? editCustomType.trim() : editType,
          }
        : t
    ));
    setEditVisible(false);
    setEditTask(null);
  };

  const getColor = (p: string) => {
    if (p === 'High') return '#ff4d4d';
    if (p === 'Medium') return '#ffa500';
    return '#4CAF50';
  };

  const getTypeColor = (t: string) => {
    if (t === 'Exam') return '#9b59b6';
    if (t === 'Quiz') return '#3498db';
    if (t === 'Other') return '#888';
    return '#2ecc71';
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: card,
          borderLeftColor:
            safeParseDate(item.date) < today && !item.completed
              ? '#ff0000'
              : getColor(item.priority),
          borderLeftWidth: 6,
        },
      ]}
    >
      <TouchableOpacity onPress={() => toggleComplete(item.id)}>
        <Text style={[styles.taskTitle, { color: text }, item.completed && { textDecorationLine: 'line-through', color: 'gray' }]}>
          {item.completed ? '✅ ' : '○ '}{item.title}
        </Text>
      </TouchableOpacity>

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

      <Text style={[styles.dateText, { color: subText }]}>📅 {item.date}</Text>

      <View style={styles.cardBottom}>
        <Text style={{ color: getColor(item.priority), fontWeight: 'bold' }}>{item.priority}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => openEdit(item)}>
            <Text style={{ color: '#6C63FF', fontWeight: 'bold' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(item.id)}>
            <Text style={{ color: 'red' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.header, { color: text }]}>📝 Tasks</Text>

      <TextInput
        placeholder="Assignment / Exam name"
        placeholderTextColor={subText}
        value={task}
        onChangeText={setTask}
        style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
      />

      <TextInput
        placeholder="Due Date (e.g. 30 Apr)"
        placeholderTextColor={subText}
        value={date}
        onChangeText={setDate}
        style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
      />

      <Text style={[styles.label, { color: subText }]}>Subject</Text>
      <TextInput
        placeholder="e.g. Maths, Physics, History..."
        placeholderTextColor={subText}
        value={subject}
        onChangeText={setSubject}
        style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
      />

      <Text style={[styles.label, { color: subText }]}>Type</Text>
      <View style={styles.selectorRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.selectorBtn, { borderColor: border }, type === t && { backgroundColor: getTypeColor(t) }]}
            onPress={() => setType(t)}
          >
            <Text style={{ color: type === t ? 'white' : text, fontWeight: 'bold' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {type === 'Other' && (
        <TextInput
          placeholder="Enter custom type (e.g. Project, Viva...)"
          placeholderTextColor={subText}
          value={customType}
          onChangeText={setCustomType}
          style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
        />
      )}

      <Text style={[styles.label, { color: subText }]}>Priority</Text>
      <View style={styles.selectorRow}>
        {['High', 'Medium', 'Low'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.selectorBtn, { borderColor: border }, priority === p && { backgroundColor: getColor(p) }]}
            onPress={() => setPriority(p)}
          >
            <Text style={{ color: priority === p ? 'white' : text, fontWeight: 'bold' }}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={addTask}>
        <Text style={styles.btnText}>+ Add Task</Text>
      </TouchableOpacity>

      <Text style={[styles.section, { color: text }]}>⚠️ Overdue ({overdueTasks.length})</Text>
      <FlatList data={overdueTasks} renderItem={renderTask} keyExtractor={(item) => item.id} scrollEnabled={false} />

      <Text style={[styles.section, { color: text }]}>📅 Upcoming ({upcomingTasks.length})</Text>
      <FlatList data={upcomingTasks} renderItem={renderTask} keyExtractor={(item) => item.id} scrollEnabled={false} />

      <Text style={[styles.section, { color: text }]}>✅ Completed ({completedTasks.length})</Text>
      <FlatList data={completedTasks} renderItem={renderTask} keyExtractor={(item) => item.id} scrollEnabled={false} />

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalBox, { backgroundColor: card }]}>
            <Text style={[styles.modalHeader, { color: text }]}>✏️ Edit Task</Text>

            <Text style={[styles.label, { color: subText }]}>Title</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: text }]}
              placeholder="Task title"
              placeholderTextColor={subText}
            />

            <Text style={[styles.label, { color: subText }]}>Due Date</Text>
            <TextInput
              value={editDate}
              onChangeText={setEditDate}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: text }]}
              placeholder="e.g. 30 Apr"
              placeholderTextColor={subText}
            />

            <Text style={[styles.label, { color: subText }]}>Subject</Text>
            <TextInput
              value={editSubject}
              onChangeText={setEditSubject}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: text }]}
              placeholder="e.g. Maths, Physics..."
              placeholderTextColor={subText}
            />

            <Text style={[styles.label, { color: subText }]}>Type</Text>
            <View style={styles.selectorRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.selectorBtn, { borderColor: border }, editType === t && { backgroundColor: getTypeColor(t) }]}
                  onPress={() => setEditType(t)}
                >
                  <Text style={{ color: editType === t ? 'white' : text, fontWeight: 'bold' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {editType === 'Other' && (
              <TextInput
                placeholder="Enter custom type..."
                placeholderTextColor={subText}
                value={editCustomType}
                onChangeText={setEditCustomType}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: text }]}
              />
            )}

            <Text style={[styles.label, { color: subText }]}>Priority</Text>
            <View style={styles.selectorRow}>
              {['High', 'Medium', 'Low'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.selectorBtn, { borderColor: border }, editPriority === p && { backgroundColor: getColor(p) }]}
                  onPress={() => setEditPriority(p)}
                >
                  <Text style={{ color: editPriority === p ? 'white' : text, fontWeight: 'bold' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={saveEdit}>
              <Text style={styles.btnText}>💾 Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: '#aaa', marginTop: 10 }]}
              onPress={() => setEditVisible(false)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 10 },
  label: { fontWeight: 'bold', marginBottom: 6, marginTop: 4 },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  selectorBtn: { padding: 8, borderWidth: 1, margin: 3, alignItems: 'center', borderRadius: 8, minWidth: 75 },
  addBtn: { backgroundColor: '#6C63FF', padding: 14, borderRadius: 10, marginTop: 5, marginBottom: 5 },
  btnText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  section: { marginTop: 20, marginBottom: 5, fontSize: 18, fontWeight: 'bold' },
  card: { padding: 15, marginTop: 8, borderRadius: 12, elevation: 2 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  dateText: { marginBottom: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
});