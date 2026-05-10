import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Text,
} from 'react-native';
import { Checkbox, Title } from 'react-native-paper';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { colors, spacing } from '../constants/theme';
import { DAILY_PROTOCOL, WEEKLY_HABITS } from '../constants/data';
import {
  getDaysUntilGoal,
  getWeekKey,
  getTodayKey,
  getWeekDays,
} from '../utils/dateUtils';
import {
  getDailyProtocol,
  setDailyProtocolItem,
  getWeeklyHabits,
  setWeeklyHabit,
  getWeightLog,
  getWorkouts,
  getSettings,
  getProtocolCompliance,
} from '../services/storage';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({ currentWeight: 147, targetWeight: 165 });
  const [latestWeight, setLatestWeight] = useState(null);
  const [weightChange, setWeightChange] = useState(null);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [daysUntil, setDaysUntil] = useState(0);
  const [protocol, setProtocol] = useState({});
  const [habits, setHabits] = useState({});
  const [compliance, setCompliance] = useState(0);

  const weekDays = getWeekDays();
  const todayKey = getTodayKey();
  const weekKey = getWeekKey();

  const loadData = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
    setDaysUntil(getDaysUntilGoal());

    const weightLog = await getWeightLog();
    if (weightLog.length > 0) {
      const latest = weightLog[weightLog.length - 1].weight;
      setLatestWeight(latest);
      if (weightLog.length > 1) {
        setWeightChange(latest - weightLog[weightLog.length - 2].weight);
      }
    }

    const workouts = await getWorkouts();
    const weekStart = weekDays[0].key;
    const weekEnd = weekDays[6].key;
    const thisWeekWorkouts = workouts.filter(
      (w) => w.date >= weekStart && w.date <= weekEnd
    );
    setWeeklyWorkouts(thisWeekWorkouts.length);

    const p = await getDailyProtocol(todayKey);
    setProtocol(p);

    const h = await getWeeklyHabits(weekKey);
    setHabits(h);

    const comp = await getProtocolCompliance(weekDays);
    setCompliance(comp);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleProtocol = async (itemId) => {
    const checked = !protocol[itemId];
    setProtocol((prev) => ({ ...prev, [itemId]: checked }));
    await setDailyProtocolItem(todayKey, itemId, checked);
    const comp = await getProtocolCompliance(weekDays);
    setCompliance(comp);
  };

  const toggleHabit = async (dayKey, habitId) => {
    const dayHabits = habits[dayKey] || {};
    const checked = !dayHabits[habitId];
    setHabits((prev) => ({
      ...prev,
      [dayKey]: { ...(prev[dayKey] || {}), [habitId]: checked },
    }));
    await setWeeklyHabit(weekKey, dayKey, habitId, checked);
  };

  const currentWeight = latestWeight || settings.currentWeight;
  const totalGain = settings.targetWeight - settings.currentWeight;
  const gainSoFar = currentWeight - settings.currentWeight;
  const weightProgress = totalGain > 0 ? Math.max(gainSoFar / totalGain, 0) : 0;

  const isHabitAvailable = (habit, dayOfWeek) => {
    if (!habit.daysRestricted) return true;
    return habit.daysRestricted.includes(dayOfWeek);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.purple}
        />
      }
    >
      {/* Weight Progress */}
      <Card>
        <Title style={styles.cardTitle}>Weight Progress</Title>
        <View style={styles.row}>
          <View style={styles.summaryItem}>
            <Text style={styles.bigNumber}>{currentWeight} lb</Text>
            <Text style={styles.label}>Current</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.summaryItem}>
            <Text style={[styles.bigNumber, { color: colors.purple }]}>
              {settings.targetWeight} lb
            </Text>
            <Text style={styles.label}>Target</Text>
          </View>
        </View>
        <ProgressBar progress={weightProgress} style={styles.progressBar} />
        <Text style={styles.hint}>
          {(settings.targetWeight - currentWeight).toFixed(1)} lb to go
          {weightChange !== null && (
            <Text
              style={{
                color: weightChange >= 0 ? colors.success : colors.error,
              }}
            >
              {' '}({weightChange >= 0 ? '+' : ''}
              {weightChange.toFixed(1)} lb last entry)
            </Text>
          )}
        </Text>
      </Card>

      {/* Countdown */}
      <Card>
        <Title style={styles.cardTitle}>Goal Countdown</Title>
        <Text style={[styles.bigNumber, { color: colors.purple, textAlign: 'center', fontSize: 48 }]}>
          {daysUntil}
        </Text>
        <Text style={[styles.label, { textAlign: 'center' }]}>
          days until Oct 10, 2026
        </Text>
      </Card>

      {/* This Week Summary */}
      <Card>
        <Title style={styles.cardTitle}>This Week</Title>
        <View style={styles.row}>
          <View style={styles.summaryItem}>
            <Text style={styles.bigNumber}>{weeklyWorkouts}/4</Text>
            <Text style={styles.label}>Workouts</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.bigNumber, { color: colors.purple }]}>
              {Math.round(compliance * 100)}%
            </Text>
            <Text style={styles.label}>Protocol</Text>
          </View>
        </View>
      </Card>

      {/* Daily Protocol */}
      <Card>
        <Title style={styles.cardTitle}>Today's Protocol</Title>
        {DAILY_PROTOCOL.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.protocolRow}
            onPress={() => toggleProtocol(item.id)}
            activeOpacity={0.7}
          >
            <Checkbox
              status={protocol[item.id] ? 'checked' : 'unchecked'}
              color={colors.purple}
              onPress={() => toggleProtocol(item.id)}
            />
            <Text style={styles.protocolText}>
              {item.icon} {item.name}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.hint, { marginTop: spacing.sm }]}>
          Weekly compliance: {Math.round(compliance * 100)}%
        </Text>
      </Card>

      {/* Weekly Habits Grid */}
      <Card>
        <Title style={styles.cardTitle}>Weekly Habits</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.gridRow}>
              <View style={styles.habitLabelCell} />
              {weekDays.map((d) => (
                <View key={d.key} style={styles.dayCell}>
                  <Text style={styles.dayLabel}>{d.label}</Text>
                </View>
              ))}
            </View>
            {WEEKLY_HABITS.map((habit) => (
              <View key={habit.id} style={styles.gridRow}>
                <View style={styles.habitLabelCell}>
                  <Text style={styles.habitName} numberOfLines={2}>
                    {habit.name}
                  </Text>
                </View>
                {weekDays.map((d) => {
                  const available = isHabitAvailable(habit, d.dayOfWeek);
                  const checked =
                    available && habits[d.key]?.[habit.id];
                  return (
                    <View key={d.key} style={styles.dayCell}>
                      {available ? (
                        <Checkbox
                          status={checked ? 'checked' : 'unchecked'}
                          color={colors.purple}
                          onPress={() =>
                            toggleHabit(d.key, habit.id)
                          }
                        />
                      ) : (
                        <Text style={styles.naText}>—</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  cardTitle: { color: colors.text, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  bigNumber: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  label: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 24, color: colors.textSecondary, marginHorizontal: spacing.sm },
  progressBar: { marginVertical: spacing.sm },
  hint: { fontSize: 12, color: colors.textSecondary },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  protocolText: { color: colors.text, flex: 1, marginLeft: spacing.xs },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  habitLabelCell: { width: 140, paddingRight: spacing.sm },
  habitName: { color: colors.text, fontSize: 11 },
  dayCell: { width: 44, alignItems: 'center', justifyContent: 'center' },
  dayLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  naText: { color: colors.border, fontSize: 16 },
});
