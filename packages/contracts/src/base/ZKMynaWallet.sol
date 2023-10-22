// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@auth/ZKAuth.sol";
import "@account-abstraction/contracts/samples/callback/TokenCallbackHandler.sol";
import "@managers/ZKOwnerManager.sol";
import "@managers/EntryPointManager.sol";
import "@managers/ZKEIP1271Manager.sol";
import {Errors} from "@libraries/Errors.sol";

interface IMynaWalletVerifier {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[21] calldata _pubSignals
    ) external view returns (bool);
}

/// @title MynaWallet
/// @author a42x
/// @notice You can use this contract for ERC-4337 compiant wallet which works with My Number Card
contract ZKMynaWallet is
    BaseAccount,
    ZKAuth,
    EntryPointManager,
    ZKOwnerManager,
    ZKEIP1271Manager,
    TokenCallbackHandler,
    UUPSUpgradeable,
    Initializable
{
    IMynaWalletVerifier public immutable verifier;

    uint256 private constant _N_CONCAT_BYTES = 121;

    // @notice Event which will be emitted when this contract is initalized
    event MynaWalletInitialized(IEntryPoint indexed entryPoint, bytes32);

    /// @notice recieve fallback function
    receive() external payable {}

    /**
     * @notice Constructor of MynaWallet (Only used by factory contract)
     * @dev Cusntuctor is only used when factory is deployed and the facotry holds wallet implementation address
     * @param newEntryPoint EntryPoint contract address that can operate this contract
     */
    constructor(IEntryPoint newEntryPoint, IMynaWalletVerifier newVerifier) EntryPointManager(newEntryPoint) {
        verifier = newVerifier; // Todo move this logic to manager
        _disableInitializers();
    }

    /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of MynaWallet must be deployed with the new EntryPoint address, then upgrading
     * the implementation by calling `upgradeTo()`
     * @param newIdentityCommitment identityCommitment
     */
    function initialize(bytes32 newIdentityCommitment) external initializer {
        _setOwner(newIdentityCommitment);
        emit MynaWalletInitialized(entryPoint(), newIdentityCommitment);
    }

    /**
     * @notice Execute a transaction (called directly from entryPoint)
     * @param dest target address
     * @param value value to send
     * @param func function call data
     */
    function execute(address dest, uint256 value, bytes calldata func) external onlyEntryPoint {
        _call(dest, value, func);
    }

    /**
     * @notice Execute a sequence of transactions (called directory from by entryPoint)
     * @param dest target addresses
     * @param func function call data
     */
    function executeBatch(address[] calldata dest, bytes[] calldata func) external onlyEntryPoint {
        if (dest.length != func.length) revert Errors.INVALID_ARRAY_LENGTH(dest.length, 0, func.length);
        for (uint256 i = 0; i < dest.length;) {
            _call(dest[i], 0, func[i]);
            unchecked {
                i++;
            }
        }
    }

    /**
     * execute a sequence of transactions
     * @param dest target addreses
     * @param value value to send
     * @param func function call data
     */
    function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func)
        external
        onlyEntryPoint
    {
        if (dest.length != value.length || value.length != func.length) {
            revert Errors.INVALID_ARRAY_LENGTH(dest.length, value.length, func.length);
        }
        for (uint256 i = 0; i < dest.length;) {
            _call(dest[i], value[i], func[i]);
            unchecked {
                i++;
            }
        }
    }

    /**
     * @notice Deposit more funds for this account in the entryPoint
     * @dev This function is payable
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * @notice Withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlySelf {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    /**
     * @notice Get the entryPoint contract address
     * @return entryPoint contract address
     */
    function entryPoint() public view override(BaseAccount) returns (IEntryPoint) {
        return EntryPointManager._entryPoint();
    }

    /**
     * @notice Check current account deposit in the entryPoint
     * @return deposit amount
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /**
     * @notice Validate UserOperation and its signature, currently only supports RSA signature
     * @dev Internal function
     * @param userOp user operation
     * @param userOpHash hash of the user operation
     * @return validationData 0 if valid
     */
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal
        virtual
        override
        returns (uint256 validationData)
    {
        if (userOp.signature.length != 29 * 32) {
            return 1;
        }
        (uint256[2] memory _pA, uint256[2][2] memory _pB, uint256[2] memory _pC, uint256[21] memory _pubSignals) =
            splitToProof(userOp.signature);
        bytes32 proofHashed = concatBytes([_pubSignals[18], _pubSignals[19], _pubSignals[20]]);
        bytes32 hashed = sha256(abi.encode(userOpHash));

        // use public value that sent from entryPoint
        if (hashed != proofHashed) {
            return 1;
        }

        try verifier.verifyProof(_pA, _pB, _pC, _pubSignals) returns (bool valid) {
            if (!valid) {
                return 1;
            }
        } catch {
            return 1;
        }
    }

    /**
     * @notice Call a contract with arbitrary data and value
     * @dev Internal function
     * @param target target address
     * @param value value to send
     * @param data function call data
     */
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * @notice Upgrade this contract to a new implementation
     * @dev Internal function
     * @param newImplementation new implementation address
     */
    function _authorizeUpgrade(address newImplementation) internal view override onlySelf {
        // TODO add time lock?
        (newImplementation);
    }

    function concatBytes(uint256[3] memory arr) public pure returns (bytes32) {
        uint256 mod = 1;
        for (uint256 idx = 0; idx < _N_CONCAT_BYTES; idx++) {
            mod = mod * 2;
        }

        uint256 ret = 0;
        for (uint256 idx = arr.length; idx > 0; idx--) {
            ret = ret * mod + arr[idx - 1];
        }

        return bytes32(ret);
    }

    function splitToProof(bytes memory signature)
        public
        pure
        returns (uint256[2] memory _pA, uint256[2][2] memory _pB, uint256[2] memory _pC, uint256[21] memory _pubSignals)
    {
        bytes32[29] memory proof;

        for (uint256 i = 0; i < 29; i++) {
            bytes32 currentBytes;
            assembly {
                currentBytes := mload(add(signature, add(0x20, mul(i, 0x20))))
            }
            proof[i] = currentBytes;
        }

        // Populating the outputs
        _pA[0] = uint256(proof[0]);
        _pA[1] = uint256(proof[1]);

        _pB[0][0] = uint256(proof[2]);
        _pB[0][1] = uint256(proof[3]);
        _pB[1][0] = uint256(proof[4]);
        _pB[1][1] = uint256(proof[5]);

        _pC[0] = uint256(proof[6]);
        _pC[1] = uint256(proof[7]);

        for (uint256 j = 0; j < 21; j++) {
            _pubSignals[j] = uint256(proof[j + 8]);
        }
    }
}
