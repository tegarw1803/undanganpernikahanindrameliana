export const storage = (table) => {
    const get = (key = null) => {
        const data = JSON.parse(localStorage.getItem(table));
        return key ? data[String(key)] : data;
    };

    const set = (key, value) => {
        let storage = get();
        storage[String(key)] = value;
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const has = (key) => Object.keys(get()).includes(String(key));

    const unset = (key) => {
        if (!has(key)) {
            return;
        }

        let storage = get();
        delete storage[String(key)];
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const clear = () => localStorage.setItem(table, JSON.stringify({}));

    if (!localStorage.getItem(table)) {
        clear();
    }

    return {
        get,
        set,
        unset,
        has,
        clear,
    };
};

// Fungsi untuk menghapus semua komentar dengan konfirmasi
const clearCommentsWithConfirmation = () => {
    const commentsStorage = storage("comments"); // Gunakan "comments" sebagai tabel
    if (confirm("Apakah Anda yakin ingin menghapus semua komentar?")) {
        commentsStorage.clear(); // Menghapus semua data
        console.log("Semua komentar berhasil dihapus.");
    } else {
        console.log("Penghapusan komentar dibatalkan.");
    }
};

// Panggil fungsi ini pada event handler atau di mana pun dibutuhkan
clearCommentsWithConfirmation();
    
