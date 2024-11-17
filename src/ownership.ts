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

function updateSeabrickContractOwner(): void {
  //
}

export function handleInitialized(event: InitializedEvent): void {
  const ownerSettings = getOwnershipSettings();

  // Add this address
  ownerSettings.ownershipAddress = event.address;
  ownerSettings.save();

  const seabrickNftAddress = Address.fromBytes(
    ownerSettings.seabrickContractAddress
  );
  const seabricMarkettAddress = Address.fromBytes(
    ownerSettings.seabrickMarketAddress
  );

  const ownershipContract = IOwnership.bind(event.address);
  const owner = ownershipContract.owner();

  // Change the owner on entities
  if (seabrickNftAddress != Address.zero()) {
    let seabrickContract = getSeabrickContract(seabrickNftAddress);
    seabrickContract.owner = owner;

    // Save the entity
    seabrickContract.save();
  }

  if (seabricMarkettAddress != Address.zero()) {
    let marketContract = getSeabrickMarketContract(seabricMarkettAddress);
    marketContract.owner = owner;

    // Save the entity
    marketContract.save();
  }
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

  const owner = event.params.newOwner;

  // Change the owner on entities
  if (seabrickNftAddress != Address.zero()) {
    let seabrickContract = getSeabrickContract(seabrickNftAddress);
    seabrickContract.owner = owner;

    // Save the entity
    seabrickContract.save();
  }

  if (seabricMarkettAddress != Address.zero()) {
    let marketContract = getSeabrickMarketContract(seabricMarkettAddress);
    marketContract.owner = owner;

    // Save the entity
    marketContract.save();
  }
}
