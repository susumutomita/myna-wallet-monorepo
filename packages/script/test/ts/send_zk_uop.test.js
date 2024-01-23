"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const send_zk_uop = __importStar(require("../../ts/send_zk_uop"));
const viem = __importStar(require("viem"));
jest.mock('permissionless/actions', () => ({
    getSenderAddress: jest.fn().mockReturnValue('0x456789'),
}));
jest.mock('viem', () => {
    const originalModule = jest.requireActual('viem');
    return {
        ...originalModule,
        encodeFunctionData: jest.fn().mockReturnValue('0x456'),
        encodeFunctionData: jest.fn().mockReturnValue('0x456')
    };
});
describe('getSenderDetails', () => {
    it('should return correct details', async () => {
        const expectedInitCode = '0xe49E809BC7368bbf7E9E341E4513805Fa20b1E5e456';
        const expectedSenderAddress = '0x456789';
        const expectedIsPhantom = true;
        jest.spyOn(send_zk_uop, 'createInitCode').mockReturnValue(expectedInitCode);
        jest.spyOn(send_zk_uop, 'getAddress').mockResolvedValue([expectedSenderAddress, expectedIsPhantom]);
        const result = await send_zk_uop.getSenderDetails();
        expect(result).toEqual([expectedInitCode, expectedSenderAddress, expectedIsPhantom]);
        expect(send_zk_uop.createInitCode).toHaveBeenCalledWith('0x123', 0n);
        expect(send_zk_uop.getAddress).toHaveBeenCalledWith(expectedInitCode);
    });
});
describe('getTestRsaKey', () => {
    it('should return correct key', () => {
        const expected_result = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAj2BHBk9AD9L/gK1lacLP/COAeeLLGGSDBaWbnx84lzD5v5te\nPkNviAZcBiQccYm6Q7atvl7HqXnUtC8qRQzRnoB15agXsEMooNFuv8trwJqWAgIX\nr2IY83ZdvBKRMe3QBEcqtFkIvwLsNbfAROHJAPffF5/BnJSDWALljEMrxzzuVBSK\nbyTXMWzKGVeRyH4H6FsH+Atx3cFbmwU+bwJlqOgcJ8dUbeo4y7lRynHDhIkrgd8S\nyMsERPngTSTQ0zI/qFcHW+JnRvS3MaGGpRzsJBUVl7nTHJ73jbg/J+8Nlz1NKi2K\nkJPHEYv4YyJgOhfXgUoF9hUJY7cqJ19kWgmTGQIDAQABAoIBAHSqkyC/PBGkT+QV\nNIBq1XMGMHT95uViZHsj1w4UCah9YbxYYMepeAfnpNoaaEq7F6Yh8B8IYM+3Iy27\nc1ncpHWlckn+DciP3W9+++91R6jiIU5hBYTg/gyeNIflU+Cc8reIcWdvS36ikjLj\n4sAqObVf/Vjr1k/jST1EniUUQ3tLCKaaePcuHPJ3fcthrKX3doZ9ym2PNn+XYecz\nQE6QR5txEowPN7MVyExaP8TaYZdRQGSE0cMruxdbCebhSKgw7PtrIOjq6LPhDzDy\ngUG9kLI/lI4FlDkJYC4hOdezycZ+T13KLHYsGnw+dsC4PAqk4w/JVaqgut4jtUU6\npe8XNQECgYEA807085nVLkV6cEJOHRxVtS5oblw8ZI27deg2mQpBBEaD8/H7IpR2\nR1nyNj5UV6Ba8UhBGG+9CLjMrm9yuefydPZN6ki+yxK0d1aF20OjllFKEolKJzG7\nZyE+xulCU9cKHajvTJWra9tKvyheNd+ct1Ae5G47DB9pmzKX/uFJclUCgYEAltrd\nOrufmMoNnc0N8uha4SM68s3+pz2tGbQ954Qqux3Co+JgQwsVL0OuUT198BG2wSYB\nkTySLU3bKHx68Z8p4HMXVzLheJI3eob+2yJ/UIZKjoz3dO4MsFb2KseiWXYeV7Gp\nuUE47KVGlfC6gNM32m2iKB361i1YJDo2oxn7ybUCgYEA3toz/Cerng0fP1FL8Nfy\nHNhb6LFs04EJ8c32rCg7MupPlBHQv3SR/XqCInLml7gVdCiFDxfRYfq55w/HWkX7\nymuLJArrTl9ckm3afuGuJVFhcibzl4CysJw/vrsJ+HbfGhmQzWnNMCYUiZA08k1V\nYoXtNbdNOCZReUhW9apttl0CgYBxiHiVWl2r1O1YhNnppZu38xbLY+MypMVhIfix\nBBRQzP4O7zF5Y57m+m338GqWwg4j4WGul8J/3CeDmePBcwNGS/gWBVIRtyGP0od+\nDsF4rgjwrgES/JGKKXiNC8AQykfdwfU1WnPoDh9Ie2sxx0Uy2+39eUqt5GSAp1s1\ndzm7PQKBgQDTWs2NKZuB4b6o0CEHte+SoINfHvVFDWbotJAZ//l+z1SmTlH7qb+/\njsDhmF/uizOdlopee6fdDaIzYNxEOseI2dx3UjLk6QYqtPBCu9KJ1juSeCReMSjH\nBWhALtiQk07pmfH+zFEYEwBhZ0OKaUAZuabat21qFr0cuX1VN8jtBQ==\n-----END RSA PRIVATE KEY-----';
        const key = send_zk_uop.getTestRsaKey();
        expect(key.exportKey('private')).toBe(expected_result);
    });
});
describe('createInitCode', () => {
    it('should return correct init code', () => {
        const identityCommitment = '0x123';
        const salt = 0n;
        const exptexted_result = '0xe49E809BC7368bbf7E9E341E4513805Fa20b1E5e456';
        const initCode = send_zk_uop.createInitCode(identityCommitment, salt);
        expect(viem.encodeFunctionData).toHaveBeenCalledWith({
            abi: expect.any(Object),
            functionName: 'createAccount',
            args: [identityCommitment, salt],
        });
        expect(initCode).toBe(exptexted_result);
    });
});
describe('generateDummyZKPSignature', () => {
    it('should return correct signature', () => {
        const expected_result = '0x198705050f6c5ec7ce8d0e3beacd67f2143019213cd285db697cb26ce1aff66716c8f21aa09f9dbada9c17d9ec83dd59e484f12c50689a2df48ef41adc9cde6c0e6da20c7b38c80c3f3cc16f8585cca37ddd80d909adcc32a0ae9a524afe195012083fe96e774eedf83bed1d379c40580426c381250d997e7e9dc9222f5e05d504df90947b055418cb10bf5a37eccdb804797dfc9ad53df220bbde205e7ad98006f65c9ff03b25169869a2f65e98f169eb4859c33cbb3f2e86da11572a21d2891f61fa72e55a56acee6cc98bb28be2274ee93e9d0be4d89a4af39ab37e60123b262fcfceeb87403f870fcec0900de2a1c2908b592ec1c98255fe2ecd2fbbf2bf1efdb9c5013a9706e0c16627c36de8dd60731bd96d5bf705bf3db1801267790a00000000000000000000000000000000014a92b6297dc8b5ffb107949f196baf00000000000000000000000000000000009e1187340bc4fd07167462a34b64310000000000000000000000000000000000ed7428f4493d8d819efa6bf71d77c90000000000000000000000000000000000b5d4ef1307ccccefcd331654707e7000000000000000000000000000000000016e2d82bcf9fc45163273840ea8832200000000000000000000000000000000003fb7da2955b7e1c2877da6184af1c800000000000000000000000000000000013876f6867269b091706adf9e6b1ec000000000000000000000000000000000015822b6a7a18159d530974b18a1bb530000000000000000000000000000000001a29c85d823645c5994c167b83090590000000000000000000000000000000001d43619afdf3f353529fdfa1b4f2152000000000000000000000000000000000189975eed5aa142beae1260bf663efd0000000000000000000000000000000001732fd6983070ea2046900a7c3adb430000000000000000000000000000000001564393bb317edbb1cb57cbfa8049ba0000000000000000000000000000000000ac9e95037ab029dae9f9cea8d81c97000000000000000000000000000000000186b47a64af8ea1b79a07d9a97b846b00000000000000000000000000000000007a42797379374010d310f32536bd9f000000000000000000000000000000000000458b290364b9b0bd1d68984c1896000000000000000000000000000000000154b3e7d909e2e281d716c1269b212d0000000000000000000000000000000000482dd4f9954d79b2b46c1e38767ef6000000000000000000000000000000000000000000000000000000000000375c';
        const actual_result = send_zk_uop.generateDummyZKPSignature();
        expect(actual_result).toBe(expected_result);
    });
});
