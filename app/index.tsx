import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ToDoApp() {
    const [daftarTodo, setDaftarTodo] = useState<Array<{ id: string; teks: string; selesai: boolean }>>([]);
    const [todoBaru, setTodoBaru] = useState("");
    const [sedangEdit, setSedangEdit] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    const STORAGE_KEY = '@todo_list';

    useEffect(() => {
        ambilData();
    }, []);

    useEffect(() => {
        simpanData();
    }, [daftarTodo]);

    const ambilData = async () => {
        try {
            const dataString = await AsyncStorage.getItem(STORAGE_KEY);
            if (dataString != null) {
                setDaftarTodo(JSON.parse(dataString));
            }
        } catch (error) {
            console.log("Gagal mengambil data:", error);
        }
    };

    const simpanData = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(daftarTodo));
        } catch (error) {
            console.log("Gagal menyimpan data:", error);
        }
    };

    const tambahTodo = () => {
        if (todoBaru.trim() === "") {
            Alert.alert("Todo Kosong", "Masukkan Teks Todo");
            return;
        }

        setDaftarTodo(prev => [
            {
                id: Date.now().toString(),
                teks: todoBaru.trim(),
                selesai: false,
            },
            ...prev,
        ]);

        setTodoBaru("");
    };

    const toggleTodoSelesai = (id: string) => {
        setDaftarTodo(prev =>
            prev.map(todo =>
                todo.id === id ? { ...todo, selesai: !todo.selesai } : todo
            )
        );
    };

    // 🔥 FIX UTAMA ADA DI SINI
    const hapusTodo = (id: string) => {
        if (Platform.OS === 'web') {
            setDaftarTodo(prev => prev.filter(todo => todo.id !== id));
            return;
        }

        Alert.alert("Hapus Todo", "Apakah Anda yakin ingin menghapus todo ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: () => {
                    setDaftarTodo(prev => prev.filter(todo => todo.id !== id));
                }
            }
        ]);
    };

    const mulaiEdit = (id: string, teks: string) => {
        setSedangEdit(id);
        setEditText(teks);
    };

    const simpanEdit = () => {
        if (editText.trim() === "") {
            Alert.alert("Todo Kosong", "Masukkan Teks Todo");
            return;
        }

        setDaftarTodo(prev =>
            prev.map(todo =>
                todo.id === sedangEdit ? { ...todo, teks: editText.trim() } : todo
            )
        );

        setSedangEdit(null);
        setEditText("");
    };

    const hapusSemua = () => {
        if (daftarTodo.length === 0) return;

        if (Platform.OS === 'web') {
            setDaftarTodo([]);
            return;
        }

        Alert.alert("Hapus Semua", `Yakin hapus ${daftarTodo.length} todo?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus Semua",
                style: "destructive",
                onPress: () => setDaftarTodo([])
            }
        ]);
    };

    const tampilkanTodo = ({ item }: { item: { id: string; teks: string; selesai: boolean } }) => (
        <View style={styles.itemTodo}>
            <TouchableOpacity style={styles.kotakCentang} onPress={() => toggleTodoSelesai(item.id)}>
                <Text>{item.selesai ? "✓" : ""}</Text>
            </TouchableOpacity>

            {sedangEdit === item.id ? (
                <View style={styles.kotakEdit}>
                    <TextInput
                        style={styles.inputEdit}
                        value={editText}
                        onChangeText={setEditText}
                        autoFocus
                    />
                    <TouchableOpacity onPress={simpanEdit}>
                        <Text>Simpan</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.kotakTeks}
                    onLongPress={() => mulaiEdit(item.id, item.teks)}
                >
                    <Text style={item.selesai && styles.teksSelesai}>{item.teks}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => hapusTodo(item.id)}>
                <Text style={{ color: "red" }}>Hapus</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.layar}>
            <View style={styles.kotakInput}>
                <TextInput
                    style={styles.input}
                    value={todoBaru}
                    onChangeText={setTodoBaru}
                    placeholder="Tambah Todo"
                    onSubmitEditing={tambahTodo}
                />
                <TouchableOpacity onPress={tambahTodo}>
                    <Text>Tambah</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={daftarTodo}
                renderItem={tampilkanTodo}
                keyExtractor={item => item.id}
            />

            {daftarTodo.length > 0 && (
                <TouchableOpacity onPress={hapusSemua}>
                    <Text style={{ color: "red", textAlign: "center" }}>Hapus Semua</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    layar: {
        flex: 1,
        backgroundColor: "#f0f2f5", // WAJIB biar web ga hitam
    },

    header: {
        backgroundColor: "#4a6fa5",
        padding: 20,
    },

    judul: {
        fontSize: 22,
        color: "#ffffff",
        fontWeight: "600",
    },

    subjudul: {
        color: "rgba(255,255,255,0.8)",
    },

    kotakInput: {
        flexDirection: "row",
        margin: 15,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    input: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: "#000000", // 🔥 penting di web
    },

    tombolTambah: {
        backgroundColor: "#4a6fa5",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: "center",
    },

    teksTombolTambah: {
        color: "#ffffff",
        fontWeight: "500",
    },

    itemTodo: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#ffffff", // 🔥 item kelihatan
        marginBottom: 8,
        borderRadius: 6,
    },

    kotakCentang: {
        marginRight: 10,
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#4a6fa5",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    kotakTercentang: {
        color: "#ffffff",
        backgroundColor: "#4a6fa5",
        width: 18,
        height: 18,
        textAlign: "center",
        borderRadius: 9,
        fontSize: 14,
        lineHeight: 18,
    },

    kotakKosongText: {
        color: "transparent",
    },

    kotakTeks: {
        flex: 1,
    },

    todo: {
        fontSize: 16,
        color: "#000000", // 🔥 INI PENYELAMAT LAYAR HITAM
    },

    teksSelesai: {
        textDecorationLine: "line-through",
        color: "#888888",
    },

    kotakEdit: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
    },

    inputEdit: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#4a6fa5",
        padding: 8,
        borderRadius: 4,
        color: "#000000",
        backgroundColor: "#ffffff",
    },

    tombolSimpanEdit: {
        backgroundColor: "#5cb85c",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 4,
        marginLeft: 6,
    },

    teksTombolSimpanEdit: {
        color: "#ffffff",
        fontWeight: "500",
    },

    tombolAksi: {
        flexDirection: "row",
        marginLeft: 8,
    },

    tombolEdit: {
        backgroundColor: "#f0ad4e",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        marginRight: 6,
    },

    teksTombolEdit: {
        color: "#ffffff",
        fontSize: 12,
    },

    tombolHapus: {
        backgroundColor: "#d9534f",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
    },

    teksTombolHapus: {
        color: "#ffffff",
        fontSize: 12,
    },

    tombolHapusSemua: {
        backgroundColor: "#d9534f",
        margin: 15,
        padding: 14,
        borderRadius: 8,
    },

    teksTombolHapusSemua: {
        color: "#ffffff",
        textAlign: "center",
        fontWeight: "500",
    },
});

