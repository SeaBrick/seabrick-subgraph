import { dataSource, Address, log } from "@graphprotocol/graph-ts";
import { OwnershipTransferred as OwnershipTransferredEvent } from "../generated/Ownership/IOwnership";
import { getSeabrickMarketContract } from "./utils";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  log.info("XD_1 - ENTER HANDLER", []);

  // Get the addresses from the context
  const context = dataSource.context();
  log.info("XD_2 - CONTEXT CREATING", []);

  const seabrickNftAddress = context.getBytes("seabrick-nft");
  log.info("XD_3 - CONTEXT getBytes Nft", []);
  const seabricMarkettAddress = context.getBytes("seabrick-market");
  log.info("XD_4 - CONTEXT getBytes markeet", []);

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
