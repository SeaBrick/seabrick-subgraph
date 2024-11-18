import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  AggregatorAdded as AggregatorAddedEvent,
  Buy as BuyEvent,
  Claimed as ClaimedEvent,
  Initialized as InitializedEvent,
  SaleDetails as SaleDetailsEvent,
  PriceAdded as PriceAddedEvent,
  ClaimVaultAdded as ClaimVaultAddedEvent,
} from "../generated/SeabrickMarket/IMarket";
import { AggregatorV3Interface } from "../generated/SeabrickMarket/AggregatorV3Interface";
import { IERC20 } from "../generated/SeabrickMarket/IERC20";
import { AggregatorData, Buy, Claimed, ERC20Token } from "../generated/schema";
import {
  getERC20Token,
  getOwnershipSettings,
  getSeabrickMarketContract,
} from "./utils";
import { IOwnership } from "../generated/Ownership/IOwnership";

export function handleInitialized(event: InitializedEvent): void {
  const ownerSettings = getOwnershipSettings();
  ownerSettings.seabrickMarketAddress = event.address;

  ownerSettings.save();
}

export function handleAggregatorAdded(event: AggregatorAddedEvent): void {
  let name = event.params.name;

  // Add the aggregator entity
  let aggregatorEntity = new AggregatorData(name);

  let aggregatorContract = AggregatorV3Interface.bind(event.params.aggregator);

  aggregatorEntity.name = name;
  aggregatorEntity.aggregator = event.params.aggregator;

  let description = aggregatorContract.try_description();
  if (description.reverted) {
    aggregatorEntity.nameReadable = name.toHexString();
  } else {
    aggregatorEntity.nameReadable = description.value;
  }
  let aggregatorDecimals = aggregatorContract.decimals();
  aggregatorEntity.decimals = BigInt.fromString(aggregatorDecimals.toString());

  // Add the token entity
  let erc20Entity = getERC20Token(event.params.token);
  let ierc20 = IERC20.bind(event.params.token);

  let erc20Decimal = ierc20.decimals();
  let erc20Name = ierc20.name();
  let erc20Symbol = ierc20.symbol();

  erc20Entity.decimals = BigInt.fromString(erc20Decimal.toString());
  erc20Entity.name = erc20Name;
  erc20Entity.symbol = erc20Symbol;

  aggregatorEntity.token = erc20Entity.id;

  aggregatorEntity.save();
  erc20Entity.save();
}

export function handleSaleDetails(event: SaleDetailsEvent): void {
  let entity = getSeabrickMarketContract(event.address);

  entity.price = event.params.price;
  entity.token = event.params.nftAddress;
  entity.claimVault = event.params.claimVault;

  // Try to update the owner entity here
  const ownershipContract = IOwnership.bind(event.params.ownershipContract);
  const owner = ownershipContract.owner();
  entity.owner = owner;

  entity.save();
}

export function handleBuy(event: BuyEvent): void {
  let entity = new Buy(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let aggregator = AggregatorData.load(event.params.aggregator);

  if (aggregator) {
    entity.buyer = event.params.buyer;
    entity.tokenId = event.params.id;
    entity.aggregator = aggregator.id;
    entity.amountPayed = event.params.amountSpent;

    // Update the total collected
    let erc20Token = getERC20Token(Address.fromBytes(aggregator.token));
    erc20Token.totalCollected = erc20Token.totalCollected.plus(
      event.params.amountSpent
    );

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    erc20Token.save();
    entity.save();
  }
}

export function handleClaimed(event: ClaimedEvent): void {
  let entity = new Claimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let aggregator = AggregatorData.load(event.params.aggregator);

  if (aggregator) {
    entity.amount = event.params.amount;
    entity.token = event.params.token;
    entity.vaultAddress = event.params.vault;
    entity.aggregator = aggregator.id;

    // Update the total collected
    let erc20Token = getERC20Token(Address.fromBytes(aggregator.token));
    erc20Token.totalCollected = BigInt.zero();

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    erc20Token.save();
    entity.save();
  }
}

export function handlePriceAdded(event: PriceAddedEvent): void {
  let entity = getSeabrickMarketContract(event.address);

  entity.price = event.params.newPrice;

  entity.save();
}

export function handleClaimVaultAdded(event: ClaimVaultAddedEvent): void {
  let entity = getSeabrickMarketContract(event.address);

  entity.claimVault = event.params.newClaimVault;

  entity.save();
}
