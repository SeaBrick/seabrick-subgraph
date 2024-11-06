import { dataSource, Address } from "@graphprotocol/graph-ts";
import { OwnershipTransferred as OwnershipTransferredEvent } from "../generated/Ownership/IOwnership";
import { log } from "matchstick-as";
import { getSeabrickMarketContract } from "./utils";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  // Get the addresses from the context
  const context = dataSource.context();
  const seabrickNftAddress = context.getBytes("seabrick-nft");
  const seabricMarkettAddress = context.getBytes("seabrick-market");

  if (!seabrickNftAddress || !seabricMarkettAddress) {
    if (!seabrickNftAddress) {
      log.info("XD_1 - No seabrickNftAddress to create owner", []);
    }

    if (!seabricMarkettAddress) {
      log.info("XD_1 - No seabricMarkettAddress to create owner", []);
    }

    return;
  }

  // Change the owner on both
  let seabrickContract = getSeabrickMarketContract(
    Address.fromBytes(seabrickNftAddress)
  );
  seabrickContract.owner = event.params.newOwner;

  let marketContract = getSeabrickMarketContract(
    Address.fromBytes(seabricMarkettAddress)
  );
  marketContract.owner = event.params.newOwner;

  // Save the entities
  seabrickContract.save();
  marketContract.save();
}
