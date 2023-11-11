// getAddress.test.ts
import { getAddress ,publicClient} from './send_zk_uop';
import { getSenderAddress } from 'permissionless';

// TypeScriptでは型をモック化するためにこれらが必要になります
jest.mock('permissionless', () => ({
  getSenderAddress: jest.fn(),
}));

// 全体のテストケースを記述します
describe('getAddress function', () => {
  it('returns the sender address and false when bytecode exists', async () => {
    const initCode = '0x...';
    const mockSenderAddress = '0x123';
    const mockBytecode = '0x60806040...';
    const ENTRY_POINT_ADDRESS = '0x456';

    // モック関数の実装をセットアップ
    (getSenderAddress as jest.Mock).mockResolvedValue(mockSenderAddress);
    (publicClient.getBytecode as jest.Mock).mockResolvedValue(mockBytecode);

    // 関数を実行
    const [senderAddress, codeExists] = await getAddress(initCode);

    // 検証
    expect(senderAddress).toEqual(mockSenderAddress);
    expect(codeExists).toBe(false);
    expect(getSenderAddress).toHaveBeenCalledWith(publicClient, {
      initCode,
      entryPoint: ENTRY_POINT_ADDRESS,
    });
    expect(publicClient.getBytecode).toHaveBeenCalledWith({ address: mockSenderAddress });
  });

  it('returns true for the code existence flag if bytecode is undefined', async () => {
    const initCode = '0x...';
    const mockSenderAddress = '0x123';

    (getSenderAddress as jest.Mock).mockResolvedValue(mockSenderAddress);
    (publicClient.getBytecode as jest.Mock).mockResolvedValue(undefined);

    // 関数を実行
    const [senderAddress, codeExists] = await getAddress(initCode);

    // 検証
    expect(senderAddress).toEqual(mockSenderAddress);
    expect(codeExists).toBe(true);
  });

  // 他のテストケースも同様に追加してください
});
