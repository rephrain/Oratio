import argon2 from 'argon2';

(async () => {
    let hash = await argon2.hash('admin', {
        type: argon2.argon2id
    });
    console.log("Admin", hash);

    hash = await argon2.hash('kasir', {
        type: argon2.argon2id
    });
    console.log("Kasir", hash);

    hash = await argon2.hash('bs', {
        type: argon2.argon2id
    });
    console.log("Dokter", hash);
})();