import { Address, log } from "@graphprotocol/graph-ts";
import { OwnershipTransferred as OwnershipTransferredEvent } from "../generated/Ownership/IOwnership";
import { getOwnershipSettings, getSeabrickMarketContract } from "./utils";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  // Get the addresses from the entity settins
  const ownerSettings = getOwnershipSettings();

  const seabrickNftAddress = ownerSettings.seabrickContractAddress;
  const seabricMarkettAddress = ownerSettings.seabrickMarketAddress;

  if (
    seabrickNftAddress == Address.zero() ||
    seabricMarkettAddress == Address.zero()
  ) {
    if (seabrickNftAddress == Address.zero()) {
      log.info("XD_1 - No seabrickNftAddress to create owner", []);
    }

    if (seabricMarkettAddress == Address.zero()) {
      log.info("XD_1 - No seabricMarkettAddress to create owner", []);
    }

    return;
  }

  // Change the owner on both
  let seabrickContract = getSeabrickMarketContract(seabrickNftAddress);
  seabrickContract.owner = event.params.newOwner;

  let marketContract = getSeabrickMarketContract(seabricMarkettAddress);
  marketContract.owner = event.params.newOwner;

  // Save the entities
  seabrickContract.save();
  marketContract.save();
}
