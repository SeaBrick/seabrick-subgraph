import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  AggregatorAdded as AggregatorAddedEvent,
  Buy as BuyEvent,
  Claimed as ClaimedEvent,
  IMarket,
  OwnershipTransferred as OwnershipTransferredEvent,
  SaleDetails as SaleDetailsEvent,
} from "../generated/SeabrickMarket/IMarket";
import { AggregatorV3Interface } from "../generated/SeabrickMarket/AggregatorV3Interface";
import {
  AggregatorData,
  ERC20Token,
  SeabrickMarketContract,
  Transfer,
} from "../generated/schema";

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
    erc20Entity = createERC20Token(token);
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

function getSeabrickMarketContract(contract_: Address): SeabrickMarketContract {
  let entity = SeabrickMarketContract.load(contract_);

  if (!entity) {
    entity = new SeabrickMarketContract(contract_);

    entity.owner = Address.zero();
    entity.price = BigInt.zero();
    entity.token = Address.zero();
  }

  return entity;
}

function createERC20Token(contract_: Address): ERC20Token {
  let entity = new ERC20Token(contract_);

  entity.address = Address.zero();
  entity.totalCollected = BigInt.zero();

  return entity;
}
