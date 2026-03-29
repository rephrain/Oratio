import argon2 from 'argon2';

(async () => {
    const hash = await argon2.hash('admin', {
        type: argon2.argon2id
    });
    console.log(hash);
})();