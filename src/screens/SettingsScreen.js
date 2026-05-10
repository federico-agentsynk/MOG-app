import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TextInput, Alert } from 'react-native';
import { Button, Switch, Title, Divider } from 'react-native-paper';
import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { getSettings, saveSettings, clearAllData } from '../services/storage';
import {
  scheduleAllNotifications,
  sendTestNotification,
} from '../services/notifications';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(null);

  const loadSettings = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const update = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    await saveSettings(settings);
    await scheduleAllNotifications();
    Alert.alert('Saved', 'Settings saved and notifications rescheduled.');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all workouts, weight logs, photos, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await loadSettings();
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
    Alert.alert('Sent', 'Test notification will arrive in ~1 second.');
  };

  if (!settings) return null;

  const NOTIFICATION_TOGGLES = [
    ['notifyMorning', 'Morning Protocol (8am)'],
    ['notifyCheckin', 'Daily Check-In (8pm)'],
    ['notifyNighttime', 'Nighttime Stack (10pm)'],
    ['notifyWorkout', 'Workout Reminder (if 48hr gap)'],
    ['notifyWeighIn', 'Monday Weigh-In Reminder'],
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Goal Settings */}
      <Card>
        <Title style={styles.cardTitle}>Goal Settings</Title>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Current Weight (lb)</Text>
          <TextInput
            style={styles.input}
            value={String(settings.currentWeight)}
            onChangeText={(v) =>
              update('currentWeight', parseFloat(v) || settings.currentWeight)
            }
            keyboardType="numeric"
            selectTextOnFocus
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Target Weight (lb)</Text>
          <TextInput
            style={styles.input}
            value={String(settings.targetWeight)}
            onChangeText={(v) =>
              update('targetWeight', parseFloat(v) || settings.targetWeight)
            }
            keyboardType="numeric"
            selectTextOnFocus
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Goal Date</Text>
          <TextInput
            style={styles.input}
            value={settings.goalDate}
            onChangeText={(v) => update('goalDate', v)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </Card>

      {/* Notification Time Pickers */}
      <Card>
        <Title style={styles.cardTitle}>Notification Times</Title>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Morning Protocol</Text>
          <TextInput
            style={styles.input}
            value={settings.morningTime}
            onChangeText={(v) => update('morningTime', v)}
            placeholder="08:00"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Daily Check-In</Text>
          <TextInput
            style={styles.input}
            value={settings.checkinTime}
            onChangeText={(v) => update('checkinTime', v)}
            placeholder="20:00"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Nighttime Stack</Text>
          <TextInput
            style={styles.input}
            value={settings.nighttimeTime}
            onChangeText={(v) => update('nighttimeTime', v)}
            placeholder="22:00"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </Card>

      {/* Notification Toggles */}
      <Card>
        <Title style={styles.cardTitle}>Notifications</Title>
        {NOTIFICATION_TOGGLES.map(([key, label]) => (
          <View key={key} style={styles.toggleRow}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Switch
              value={!!settings[key]}
              onValueChange={(v) => update(key, v)}
              color={colors.purple}
            />
          </View>
        ))}
      </Card>

      {/* Actions */}
      <Card>
        <Title style={styles.cardTitle}>Actions</Title>
        <Button
          mode="contained"
          onPress={handleSave}
          buttonColor={colors.purple}
          style={styles.actionBtn}
          icon="content-save"
        >
          Save Settings
        </Button>
        <Button
          mode="outlined"
          onPress={handleTestNotification}
          textColor={colors.purple}
          style={styles.actionBtn}
          icon="bell"
        >
          Send Test Notification
        </Button>
        <Divider
          style={{ marginVertical: spacing.md, backgroundColor: colors.border }}
        />
        <Button
          mode="contained"
          onPress={handleClearData}
          buttonColor={colors.error}
          icon="delete"
        >
          Clear All Data
        </Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  cardTitle: { color: colors.text, marginBottom: spacing.sm },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  fieldLabel: { color: colors.text, fontSize: 14, flex: 1 },
  input: {
    backgroundColor: colors.surfaceVariant,
    color: colors.text,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    width: 120,
    textAlign: 'right',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  actionBtn: { marginBottom: spacing.sm },
});
