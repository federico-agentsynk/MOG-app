import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Button, Title } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { LineChart } from 'react-native-chart-kit';
import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import {
  logWeight,
  getWeightLog,
  saveMetrics,
  getMetrics,
  savePhoto,
  getPhotos,
} from '../services/storage';
import { getTodayKey, formatShortDate } from '../utils/dateUtils';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.md * 4 - 32;

const MEASUREMENT_FIELDS = [
  ['neck', 'Neck'],
  ['chest', 'Chest'],
  ['armsFlexed', 'Arms (Flexed)'],
  ['shoulders', 'Shoulders'],
  ['waist', 'Waist'],
];

export default function MetricsScreen() {
  const [weightInput, setWeightInput] = useState('');
  const [weightLog, setWeightLog] = useState([]);
  const [measurements, setMeasurements] = useState({
    neck: '',
    chest: '',
    armsFlexed: '',
    shoulders: '',
    waist: '',
  });
  const [photos, setPhotos] = useState([]);
  const [compareA, setCompareA] = useState(0);
  const [compareB, setCompareB] = useState(1);

  const loadData = useCallback(async () => {
    const log = await getWeightLog();
    setWeightLog(log);

    const metrics = await getMetrics();
    if (metrics.length > 0) {
      const latest = metrics[metrics.length - 1];
      setMeasurements({
        neck: latest.neck || '',
        chest: latest.chest || '',
        armsFlexed: latest.armsFlexed || '',
        shoulders: latest.shoulders || '',
        waist: latest.waist || '',
      });
    }

    const savedPhotos = await getPhotos();
    setPhotos(savedPhotos);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logWeightEntry = async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) {
      Alert.alert('Invalid', 'Please enter a valid weight.');
      return;
    }
    await logWeight({ date: getTodayKey(), weight: w });
    setWeightInput('');
    await loadData();
  };

  const saveMeasurementsEntry = async () => {
    await saveMetrics({ date: getTodayKey(), ...measurements });
    Alert.alert('Saved', 'Measurements saved successfully!');
  };

  const pickPhoto = async (source) => {
    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library access is required.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
      });
    }
    if (!result.canceled && result.assets?.[0]) {
      await savePhoto({ uri: result.assets[0].uri, date: getTodayKey() });
      await loadData();
    }
  };

  const displayLog = weightLog.slice(-7);
  const chartData =
    displayLog.length >= 2
      ? {
          labels: displayLog.map((e) => formatShortDate(e.date)),
          datasets: [{ data: displayLog.map((e) => e.weight) }],
        }
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Weight Log */}
      <Card>
        <Title style={styles.cardTitle}>Log Weight</Title>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder="Weight (lb)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={logWeightEntry}
          />
          <Button
            mode="contained"
            onPress={logWeightEntry}
            buttonColor={colors.purple}
          >
            Log
          </Button>
        </View>
        {weightLog.length > 0 && (
          <Text style={[styles.hint, { marginTop: spacing.sm }]}>
            Last logged: {weightLog[weightLog.length - 1].weight} lb on{' '}
            {formatShortDate(weightLog[weightLog.length - 1].date)}
          </Text>
        )}
      </Card>

      {/* Weight Chart */}
      {chartData && (
        <Card>
          <Title style={styles.cardTitle}>Weight Trend (Last 7 entries)</Title>
          <LineChart
            data={chartData}
            width={Math.max(CHART_WIDTH, 200)}
            height={180}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
              labelColor: () => colors.textSecondary,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.purpleLight,
              },
            }}
            bezier
            style={{ borderRadius: 8 }}
          />
        </Card>
      )}

      {/* Body Measurements */}
      <Card>
        <Title style={styles.cardTitle}>Body Measurements (inches)</Title>
        {MEASUREMENT_FIELDS.map(([key, label]) => (
          <View
            key={key}
            style={[styles.row, { marginBottom: spacing.sm }]}
          >
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={measurements[key]}
              onChangeText={(v) =>
                setMeasurements((prev) => ({ ...prev, [key]: v }))
              }
              placeholder="0.0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        ))}
        <Button
          mode="contained"
          onPress={saveMeasurementsEntry}
          buttonColor={colors.purple}
          style={{ marginTop: spacing.sm }}
        >
          Save Measurements
        </Button>
      </Card>

      {/* Progress Photos */}
      <Card>
        <Title style={styles.cardTitle}>Progress Photos</Title>
        <View style={styles.row}>
          <Button
            mode="outlined"
            onPress={() => pickPhoto('camera')}
            style={{ flex: 1, marginRight: spacing.sm }}
            textColor={colors.purple}
            icon="camera"
          >
            Camera
          </Button>
          <Button
            mode="outlined"
            onPress={() => pickPhoto('library')}
            style={{ flex: 1 }}
            textColor={colors.purple}
            icon="image"
          >
            Library
          </Button>
        </View>

        {/* Side-by-side comparison */}
        {photos.length >= 2 && (
          <View style={{ marginTop: spacing.md }}>
            <Text style={[styles.hint, { marginBottom: spacing.sm }]}>
              Side-by-Side Comparison
            </Text>
            <View style={styles.compareRow}>
              <Image
                source={{ uri: photos[compareA]?.uri }}
                style={styles.comparePhoto}
              />
              <Image
                source={{ uri: photos[compareB]?.uri }}
                style={styles.comparePhoto}
              />
            </View>
            <Text style={styles.hint}>
              {photos[compareA]?.date} vs {photos[compareB]?.date}
            </Text>
            <Text style={[styles.hint, { marginTop: 4 }]}>
              Tap a thumbnail below to set comparison photo
            </Text>
          </View>
        )}

        {/* Thumbnail grid */}
        {photos.length > 0 && (
          <View style={styles.photoGrid}>
            {photos.map((photo, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() =>
                  idx === compareA ? setCompareA(idx) : setCompareB(idx)
                }
                onLongPress={() => setCompareA(idx)}
                style={[
                  styles.thumbnailWrapper,
                  (idx === compareA || idx === compareB) && styles.thumbnailSelected,
                ]}
              >
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.thumbnail}
                />
                <Text style={styles.photoDate}>{photo.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {photos.length === 0 && (
          <Text style={[styles.hint, { textAlign: 'center', marginTop: spacing.md }]}>
            No photos yet. Take your first progress photo!
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  cardTitle: { color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  fieldLabel: { color: colors.text, fontSize: 14, width: 130 },
  hint: { color: colors.textSecondary, fontSize: 12 },
  input: {
    backgroundColor: colors.surfaceVariant,
    color: colors.text,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  compareRow: { flexDirection: 'row', marginBottom: spacing.sm },
  comparePhoto: {
    flex: 1,
    height: 200,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.surfaceVariant,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  thumbnailWrapper: {
    margin: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: { borderColor: colors.purple },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: 6,
    backgroundColor: colors.surfaceVariant,
  },
  photoDate: {
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
});
