import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Title, Paragraph } from 'react-native-paper';
import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { PUSH_DAY_EXERCISES, PULL_DAY_EXERCISES } from '../constants/data';
import { saveWorkout, getLastWorkoutByType } from '../services/storage';
import { getTodayKey } from '../utils/dateUtils';

const SET_COUNT = 3;
const emptySet = () => ({ weight: '', reps: '' });
const buildEmptySets = (exercises) =>
  Object.fromEntries(
    exercises.map((e) => [e.id, Array.from({ length: SET_COUNT }, emptySet)])
  );

export default function WorkoutsScreen() {
  const [activeType, setActiveType] = useState(null);
  const [sets, setSets] = useState({});
  const [lastSession, setLastSession] = useState(null);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [prCount, setPrCount] = useState(0);

  const exercises =
    activeType === 'push'
      ? PUSH_DAY_EXERCISES
      : activeType === 'pull'
      ? PULL_DAY_EXERCISES
      : [];

  const startWorkout = async (type) => {
    setActiveType(type);
    setWorkoutComplete(false);
    setPrCount(0);
    const ex = type === 'push' ? PUSH_DAY_EXERCISES : PULL_DAY_EXERCISES;
    setSets(buildEmptySets(ex));
    const last = await getLastWorkoutByType(type);
    setLastSession(last);
  };

  const cancelWorkout = () => {
    Alert.alert('Cancel Workout', 'Are you sure you want to cancel?', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Cancel Workout',
        style: 'destructive',
        onPress: () => {
          setActiveType(null);
          setLastSession(null);
        },
      },
    ]);
  };

  const updateSet = (exerciseId, setIdx, field, value) => {
    setSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      ),
    }));
  };

  const getProgressIndicator = (exerciseId) => {
    if (!lastSession) return null;
    const lastEx = lastSession.exercises?.find((e) => e.id === exerciseId);
    if (!lastEx) return null;
    const lastBest = Math.max(
      ...(lastEx.sets || []).map((s) => parseFloat(s.weight) || 0)
    );
    const currentBest = Math.max(
      ...(sets[exerciseId] || []).map((s) => parseFloat(s.weight) || 0)
    );
    if (currentBest === 0 || lastBest === 0) return null;
    if (currentBest > lastBest) return 'improved';
    if (currentBest === lastBest) return 'maintained';
    return 'regressed';
  };

  const indicatorColor = (indicator) => {
    if (indicator === 'improved') return colors.success;
    if (indicator === 'maintained') return colors.warning;
    return colors.error;
  };

  const indicatorSymbol = (indicator) => {
    if (indicator === 'improved') return '▲ PR';
    if (indicator === 'maintained') return '● Same';
    return '▼ Down';
  };

  const finishWorkout = async () => {
    let prs = 0;
    const exerciseData = exercises.map((e) => {
      const indicator = getProgressIndicator(e.id);
      if (indicator === 'improved') prs++;
      return {
        id: e.id,
        name: e.name,
        sets: sets[e.id] || [],
        progressIndicator: indicator,
      };
    });

    const workout = {
      id: Date.now().toString(),
      type: activeType,
      date: getTodayKey(),
      exercises: exerciseData,
      prs,
    };

    await saveWorkout(workout);
    setPrCount(prs);
    setWorkoutComplete(true);
  };

  if (workoutComplete) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.trophy}>🏆</Text>
        <Title style={styles.completeTitle}>Workout Complete!</Title>
        <Paragraph style={styles.completeSub}>
          {prCount > 0
            ? `${prCount} new personal record${prCount > 1 ? 's' : ''}!`
            : 'Great session — keep grinding!'}
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => setActiveType(null)}
          style={styles.btn}
          buttonColor={colors.purple}
        >
          Back to Workouts
        </Button>
      </View>
    );
  }

  if (!activeType) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Title style={[styles.completeTitle, { marginBottom: spacing.xl }]}>
          Choose Workout
        </Title>
        <Button
          mode="contained"
          onPress={() => startWorkout('push')}
          style={[styles.btn, { marginBottom: spacing.md }]}
          buttonColor={colors.purple}
          contentStyle={styles.btnContent}
          icon="arm-flex"
        >
          Push Day
        </Button>
        <Button
          mode="contained"
          onPress={() => startWorkout('pull')}
          style={styles.btn}
          buttonColor={colors.purpleDark}
          contentStyle={styles.btnContent}
          icon="weight-lifter"
        >
          Pull Day
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.workoutHeader}>
        <Title style={styles.completeTitle}>
          {activeType === 'push' ? 'Push Day' : 'Pull Day'}
        </Title>
        <Button onPress={cancelWorkout} textColor={colors.error} compact>
          Cancel
        </Button>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {exercises.map((exercise) => {
          const indicator = getProgressIndicator(exercise.id);
          const lastEx = lastSession?.exercises?.find(
            (e) => e.id === exercise.id
          );
          const lastBestSet = lastEx?.sets?.reduce((best, s) =>
            (parseFloat(s.weight) || 0) > (parseFloat(best?.weight) || 0)
              ? s
              : best,
            null
          );

          return (
            <Card key={exercise.id}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {indicator && (
                  <Text
                    style={[
                      styles.indicatorText,
                      { color: indicatorColor(indicator) },
                    ]}
                  >
                    {indicatorSymbol(indicator)}
                  </Text>
                )}
              </View>
              {lastBestSet && (
                <Text style={styles.lastSession}>
                  Last: {lastBestSet.weight}lb × {lastBestSet.reps} reps
                </Text>
              )}
              <View style={styles.setHeader}>
                <Text style={[styles.setLabel, { flex: 0.4 }]}>Set</Text>
                <Text style={styles.setLabel}>Weight (lb)</Text>
                <Text style={styles.setLabel}>Reps</Text>
              </View>
              {(sets[exercise.id] || []).map((s, idx) => (
                <View key={idx} style={styles.setRow}>
                  <Text style={[styles.setNum, { flex: 0.4 }]}>
                    {idx + 1}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={s.weight}
                    onChangeText={(v) =>
                      updateSet(exercise.id, idx, 'weight', v)
                    }
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                  <TextInput
                    style={styles.input}
                    value={s.reps}
                    onChangeText={(v) =>
                      updateSet(exercise.id, idx, 'reps', v)
                    }
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              ))}
            </Card>
          );
        })}
        <Button
          mode="contained"
          onPress={finishWorkout}
          style={{ marginVertical: spacing.md }}
          buttonColor={colors.purple}
          contentStyle={{ paddingVertical: spacing.sm }}
        >
          Complete Workout
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: { padding: spacing.md },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: 0,
  },
  trophy: { fontSize: 72, marginBottom: spacing.md },
  completeTitle: { color: colors.text, fontWeight: 'bold', fontSize: 22 },
  completeSub: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  btn: { width: 240 },
  btnContent: { paddingVertical: spacing.sm },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  indicatorText: { fontSize: 12, fontWeight: 'bold', marginLeft: spacing.sm },
  lastSession: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  setHeader: { flexDirection: 'row', marginBottom: 6 },
  setLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  setNum: { color: colors.textSecondary, textAlign: 'center' },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    color: colors.text,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 14,
  },
});
