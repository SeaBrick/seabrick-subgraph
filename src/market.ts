import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  AggregatorAdded as AggregatorAddedEvent,
  Buy as BuyEvent,
  Collected as CollectedEvent,
  Initialized as InitializedEvent,
  SaleDetails as SaleDetailsEvent,
  PriceAdded as PriceAddedEvent,
  ClaimVaultAdded as ClaimVaultAddedEvent,
} from "../generated/SeabrickMarket/IMarket";
import { AggregatorV3Interface } from "../generated/SeabrickMarket/AggregatorV3Interface";
import { IERC20 } from "../generated/SeabrickMarket/IERC20";
import {
  AggregatorData,
  Buy,
  ERC20Token,
  Vault,
  VaultToken,
} from "../generated/schema";
import {
  combineToId,
  getERC20Token,
  getOwnershipSettings,
  getSeabrickMarketContract,
  getVault,
  getVaultToken,
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
    entity.amountPaid = event.params.amountSpent;
    entity.aggregator = aggregator.id;
    entity.paymentToken = aggregator.token;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
  }
}

export function handleCollected(event: CollectedEvent): void {
  // Just generate to create the entity if does not exist
  let vault = getVault(event.params.vault);

  let vaultToken = getVaultToken(event.params.vault, event.params.token);

  vaultToken.totalCollected = vaultToken.totalCollected.plus(
    event.params.amount
  );

  vault.save();
  vaultToken.save();
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
