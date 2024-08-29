import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  AggregatorAdded as AggregatorAddedEvent,
  Buy as BuyEvent,
  Claimed as ClaimedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SaleDetails as SaleDetailsEvent,
} from "../generated/SeabrickMarket/IMarket";
import { AggregatorV3Interface } from "../generated/SeabrickMarket/AggregatorV3Interface";
import { AggregatorData, Buy, Claimed, ERC20Token } from "../generated/schema";
import { getERC20Token, getSeabrickMarketContract } from "./utils";

export function handleAggregatorAdded(event: AggregatorAddedEvent): void {
  let name = event.params.name;
  let token = event.params.token;
  let aggregator = event.params.aggregator;

  // Add the aggregator entity
  let aggregatorEntity = new AggregatorData(name);

  let aggregatorContract = AggregatorV3Interface.bind(aggregator);

  aggregatorEntity.name = name;
  aggregatorEntity.aggregator = aggregator;

  let description = aggregatorContract.try_description();
  if (description.reverted) {
    aggregatorEntity.nameReadable = name.toHexString();
  } else {
    aggregatorEntity.nameReadable = description.value;
  }

  // Add the token entity
  let erc20Entity = ERC20Token.load(token);
  if (!erc20Entity) {
    erc20Entity = getERC20Token(token);
  }

  aggregatorEntity.token = erc20Entity.id;

  aggregatorEntity.save();
  erc20Entity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = getSeabrickMarketContract(event.address);
  entity.owner = event.params.newOwner;

  entity.save();
}

export function handleSaleDetails(event: SaleDetailsEvent): void {
  let entity = getSeabrickMarketContract(event.address);
  entity.price = event.params.price;
  entity.token = event.params.nftAddress;

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
