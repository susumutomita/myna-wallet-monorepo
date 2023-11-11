// 64文字のランダムな16進数の文字列を生成
const dummyPrivateKey = '0x' +
  Array.from({ length: 64 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

// 環境変数にダミーのプライベートキーを設定
process.env.PAYMASTER_SIGNER_PRIVATE_KEY = dummyPrivateKey;
