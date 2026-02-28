// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRiskPolicy} from "./IRiskPolicy.sol";

contract AdaptiveRiskPolicy is IRiskPolicy {
    address public owner;
    address public settlementEngine;

    uint256 public windowSize;
    uint256 public baseMaxAmount;
    uint256 public defaultMaxTxPerWindow;

    uint256 public highRiskUsageThreshold;
    uint256 public highRiskMaxMultiplierBps;

    mapping(address => bool) public blockedProvider;
    mapping(address => bool) public blockedConsumer;
    mapping(address => uint256) public maxTxPerWindowOverride;

    mapping(address => uint256) public windowStartAt;
    mapping(address => uint256) public txCountInWindow;
    mapping(address => uint256) public spentInWindow;

    mapping(bytes32 => bool) public recordedRequestIds;

    bytes32 public constant REASON_ALLOW = bytes32("ALLOW");
    bytes32 public constant REASON_PROVIDER_BLOCKED = bytes32("PROVIDER_BLOCKED");
    bytes32 public constant REASON_CONSUMER_BLOCKED = bytes32("CONSUMER_BLOCKED");
    bytes32 public constant REASON_EXCEED_TX_RATE = bytes32("EXCEED_TX_RATE");
    bytes32 public constant REASON_EXCEED_DYNAMIC_LIMIT = bytes32("EXCEED_DYNAMIC_LIMIT");

    event SettlementEngineUpdated(address indexed settlementEngine);
    event WindowParamsUpdated(uint256 windowSize, uint256 baseMaxAmount, uint256 defaultMaxTxPerWindow);
    event RiskUsageParamsUpdated(uint256 highRiskUsageThreshold, uint256 highRiskMaxMultiplierBps);
    event ProviderBlocked(address indexed provider, bool blocked);
    event ConsumerBlocked(address indexed consumer, bool blocked);
    event MaxTxPerWindowOverrideSet(address indexed consumer, uint256 maxTxPerWindow);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier onlySettlementEngine() {
        require(msg.sender == settlementEngine, "only settlementEngine");
        _;
    }

    constructor(
        address settlementEngine_,
        uint256 windowSize_,
        uint256 baseMaxAmount_,
        uint256 defaultMaxTxPerWindow_,
        uint256 highRiskUsageThreshold_,
        uint256 highRiskMaxMultiplierBps_
    ) {
        require(settlementEngine_ != address(0), "invalid settlementEngine");
        require(windowSize_ > 0, "invalid windowSize");
        require(baseMaxAmount_ > 0, "invalid baseMaxAmount");
        require(defaultMaxTxPerWindow_ > 0, "invalid maxTxPerWindow");
        require(highRiskMaxMultiplierBps_ > 0, "invalid multiplier");

        owner = msg.sender;
        settlementEngine = settlementEngine_;
        windowSize = windowSize_;
        baseMaxAmount = baseMaxAmount_;
        defaultMaxTxPerWindow = defaultMaxTxPerWindow_;
        highRiskUsageThreshold = highRiskUsageThreshold_;
        highRiskMaxMultiplierBps = highRiskMaxMultiplierBps_;
    }

    function setSettlementEngine(address settlementEngine_) external onlyOwner {
        require(settlementEngine_ != address(0), "invalid settlementEngine");
        settlementEngine = settlementEngine_;
        emit SettlementEngineUpdated(settlementEngine_);
    }

    function setWindowParams(
        uint256 windowSize_,
        uint256 baseMaxAmount_,
        uint256 defaultMaxTxPerWindow_
    ) external onlyOwner {
        require(windowSize_ > 0, "invalid windowSize");
        require(baseMaxAmount_ > 0, "invalid baseMaxAmount");
        require(defaultMaxTxPerWindow_ > 0, "invalid maxTxPerWindow");

        windowSize = windowSize_;
        baseMaxAmount = baseMaxAmount_;
        defaultMaxTxPerWindow = defaultMaxTxPerWindow_;

        emit WindowParamsUpdated(windowSize_, baseMaxAmount_, defaultMaxTxPerWindow_);
    }

    function setRiskUsageParams(
        uint256 highRiskUsageThreshold_,
        uint256 highRiskMaxMultiplierBps_
    ) external onlyOwner {
        require(highRiskMaxMultiplierBps_ > 0, "invalid multiplier");
        highRiskUsageThreshold = highRiskUsageThreshold_;
        highRiskMaxMultiplierBps = highRiskMaxMultiplierBps_;
        emit RiskUsageParamsUpdated(highRiskUsageThreshold_, highRiskMaxMultiplierBps_);
    }

    function setProviderBlocked(address provider, bool blocked) external onlyOwner {
        blockedProvider[provider] = blocked;
        emit ProviderBlocked(provider, blocked);
    }

    function setConsumerBlocked(address consumer, bool blocked) external onlyOwner {
        blockedConsumer[consumer] = blocked;
        emit ConsumerBlocked(consumer, blocked);
    }

    function setMaxTxPerWindowOverride(address consumer, uint256 maxTxPerWindow_) external onlyOwner {
        maxTxPerWindowOverride[consumer] = maxTxPerWindow_;
        emit MaxTxPerWindowOverrideSet(consumer, maxTxPerWindow_);
    }

    function validateSettlement(
        address provider,
        address consumer,
        address,
        uint256 amount,
        bytes32,
        bytes32
    ) external view override returns (bool allowed, bytes32 reasonCode) {
        if (blockedProvider[provider]) return (false, REASON_PROVIDER_BLOCKED);
        if (blockedConsumer[consumer]) return (false, REASON_CONSUMER_BLOCKED);

        (uint256 count, uint256 spent) = _currentWindowStats(consumer);

        uint256 maxTx = maxTxPerWindowOverride[consumer];
        if (maxTx == 0) maxTx = defaultMaxTxPerWindow;
        if (count >= maxTx) return (false, REASON_EXCEED_TX_RATE);

        uint256 dynamicMax = _dynamicMaxAmount(spent);
        if (amount > dynamicMax) return (false, REASON_EXCEED_DYNAMIC_LIMIT);

        return (true, REASON_ALLOW);
    }

    function recordSettlement(
        address,
        address consumer,
        address,
        uint256 amount,
        bytes32 requestId,
        bytes32
    ) external override onlySettlementEngine {
        require(requestId != bytes32(0), "invalid requestId");
        require(!recordedRequestIds[requestId], "duplicate requestId");

        _rollWindowIfNeeded(consumer);

        recordedRequestIds[requestId] = true;
        txCountInWindow[consumer] += 1;
        spentInWindow[consumer] += amount;
    }

    function previewDynamicMaxAmount(address consumer) external view returns (uint256) {
        (, uint256 spent) = _currentWindowStats(consumer);
        return _dynamicMaxAmount(spent);
    }

    function _currentWindowStats(address consumer) internal view returns (uint256 count, uint256 spent) {
        uint256 start = windowStartAt[consumer];
        if (start == 0 || block.timestamp >= start + windowSize) {
            return (0, 0);
        }
        return (txCountInWindow[consumer], spentInWindow[consumer]);
    }

    function _rollWindowIfNeeded(address consumer) internal {
        uint256 start = windowStartAt[consumer];
        if (start == 0 || block.timestamp >= start + windowSize) {
            windowStartAt[consumer] = block.timestamp;
            txCountInWindow[consumer] = 0;
            spentInWindow[consumer] = 0;
        }
    }

    function _dynamicMaxAmount(uint256 spentInCurrentWindow) internal view returns (uint256) {
        if (spentInCurrentWindow >= highRiskUsageThreshold) {
            return (baseMaxAmount * highRiskMaxMultiplierBps) / 10_000;
        }
        return baseMaxAmount;
    }
}
