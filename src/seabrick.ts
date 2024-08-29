import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "../generated/Seabrick/ISeabrick";
import { Transfer } from "../generated/schema";
import { getAccount, getSeabrickContract, getToken } from "./utils";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = getSeabrickContract(event.address);
  entity.owner = event.params.newOwner;

  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  // Token entity
  let token = getToken(event.params.tokenId);
  token.owner = event.params.to; // Always the `to` address will be the new owner

  // Account entities (never create an Account with zero address)
  if (event.params.from != Address.zero()) {
    let account = getAccount(event.params.from);
    account.save();
  }

  if (event.params.to != Address.zero()) {
    let account = getAccount(event.params.to);
    account.save();
  }

  // Update the total supply
  let seabrickContract = getSeabrickContract(event.address);

  // This is a Mint
  if (event.params.from == Address.zero()) {
    seabrickContract.totalSupply = seabrickContract.totalSupply.plus(
      BigInt.fromU32(1)
    );
  }

  // This is a Burn
  if (event.params.to == Address.zero()) {
    seabrickContract.totalSupply = seabrickContract.totalSupply.minus(
      BigInt.fromU32(1)
    );

    // Mark as a token burned
    token.burned = true;
  }

  // Transfer entity
  let transferEntity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  transferEntity.from = event.params.from;
  transferEntity.to = event.params.to;
  transferEntity.tokenId = event.params.tokenId;
  transferEntity.token = token.id;

  transferEntity.blockNumber = event.block.number;
  transferEntity.blockTimestamp = event.block.timestamp;
  transferEntity.transactionHash = event.transaction.hash;

  transferEntity.save();
  seabrickContract.save();
  token.save();
}
