import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.wrap}>
        <Image
          source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }}
          style={styles.bg}
          contentFit="cover"
        />
        <View style={styles.overlay} />

        <View style={styles.content}>
          <Text style={styles.code}>404</Text>
          <Text style={styles.text}>The page you are looking for not available!</Text>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Go back</Text></TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#2b2b31' },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  code: { color: '#fff', fontSize: 88, fontWeight: '800' },
  text: { color: '#d1d1d6', marginTop: 8, textAlign: 'center' },
  btn: { marginTop: 16, backgroundColor: '#e50914', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
});
