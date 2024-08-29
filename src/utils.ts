import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import {
  Account,
  SeabrickContract,
  Token,
  ERC20Token,
  SeabrickMarketContract,
} from "../generated/schema";

export function getSeabrickContract(contract_: Address): SeabrickContract {
  let entity = SeabrickContract.load(contract_);

  if (!entity) {
    entity = new SeabrickContract(contract_);

    entity.name = "Seabrick NFT";
    entity.symbol = "SB_NFT";
    entity.totalSupply = BigInt.zero();
    entity.owner = Address.zero();
  }

  return entity;
}

export function getAccount(account_: Address): Account {
  let entity = Account.load(account_);

  if (!entity) {
    entity = new Account(account_);
  }

  return entity;
}

export function getToken(tokenId_: BigInt): Token {
  // The BigInt as Bytes
  const id = Bytes.fromHexString(getEvenHex(tokenId_.toHexString()));

  let entity = Token.load(id);

  if (!entity) {
    entity = new Token(id);
    entity.owner = Address.zero();
    entity.tokenId = tokenId_;
    entity.burned = false;
  }

  return entity;
}

export function getSeabrickMarketContract(
  contract_: Address
): SeabrickMarketContract {
  let entity = SeabrickMarketContract.load(contract_);

  if (!entity) {
    entity = new SeabrickMarketContract(contract_);

    entity.owner = Address.zero();
    entity.price = BigInt.zero();
    entity.token = Address.zero();
  }

  return entity;
}

export function getERC20Token(contract_: Address): ERC20Token {
  let entity = ERC20Token.load(contract_);

  if (!entity) {
    entity = new ERC20Token(contract_);
    entity.address = contract_;
    entity.totalCollected = BigInt.zero();
  }

  return entity;
}

function getEvenHex(value: string): string {
  if (value.length % 2) {
    value = value.slice(0, 2) + "0" + value.slice(2);
  }
  return value;
}
