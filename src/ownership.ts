import { Address, log } from "@graphprotocol/graph-ts";
import {
  OwnershipTransferred as OwnershipTransferredEvent,
  Initialized as InitializedEvent,
} from "../generated/Ownership/IOwnership";
import { IOwnership } from "../generated/Ownership/IOwnership";
import {
  getOwnershipSettings,
  getSeabrickMarketContract,
  getSeabrickContract,
} from "./utils";

export function handleInitialized(event: InitializedEvent): void {
  const ownerSettings = getOwnershipSettings();

  const seabrickNftAddress = Address.fromBytes(
    ownerSettings.seabrickContractAddress
  );
  const seabricMarkettAddress = Address.fromBytes(
    ownerSettings.seabrickMarketAddress
  );

  const ownershipContract = IOwnership.bind(event.address);
  const owner = ownershipContract.owner();

  // Change the owner on both
  let seabrickContract = getSeabrickContract(seabrickNftAddress);
  seabrickContract.owner = owner;

  let marketContract = getSeabrickMarketContract(seabricMarkettAddress);
  marketContract.owner = owner;

  // Save the entities
  seabrickContract.save();
  marketContract.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  // Get the addresses from the entity settins
  const ownerSettings = getOwnershipSettings();

  const seabrickNftAddress = Address.fromBytes(
    ownerSettings.seabrickContractAddress
  );
  const seabricMarkettAddress = Address.fromBytes(
    ownerSettings.seabrickMarketAddress
  );

  // Change the owner on both
  let seabrickContract = getSeabrickContract(seabrickNftAddress);
  seabrickContract.owner = event.params.newOwner;

  let marketContract = getSeabrickMarketContract(seabricMarkettAddress);
  marketContract.owner = event.params.newOwner;

  // Save the entities
  seabrickContract.save();
  marketContract.save();
}
