import {
  Address,
  BigInt,
  Bytes,
  ByteArray,
  crypto,
} from "@graphprotocol/graph-ts";
import {
  Account,
  SeabrickContract,
  Token,
  ERC20Token,
  SeabrickMarketContract,
  OwnershipSettings,
  VaultToken,
  Vault,
} from "../generated/schema";
import { ISeabrick } from "../generated/Seabrick/ISeabrick";

export function combineToId(value1: string, value2: string): Bytes {
  return Bytes.fromHexString(
    crypto
      .keccak256(
        ByteArray.fromHexString(value1).concat(ByteArray.fromHexString(value2))
      )
      .toHex()
  );
}

export function getOwnershipSettings(): OwnershipSettings {
  const id = "contracts";
  let entity = OwnershipSettings.load(id);

  if (!entity) {
    entity = new OwnershipSettings(id);

    entity.seabrickContractAddress = Address.zero();
    entity.seabrickMarketAddress = Address.zero();
    entity.ownershipAddress = Address.zero();

    entity.save();
  }

  return entity;
}

export function getSeabrickContract(contract_: Address): SeabrickContract {
  let entity = SeabrickContract.load(contract_);

  if (!entity) {
    entity = new SeabrickContract(contract_);

    let iSeabrick = ISeabrick.bind(contract_);

    entity.name = iSeabrick.name();
    entity.symbol = iSeabrick.symbol();
    entity.totalSupply = BigInt.zero();
    entity.owner = Address.zero();
  }

  return entity;
}

export function getAccount(account_: Address): Account {
  let entity = Account.load(account_);

  if (!entity) {
    entity = new Account(account_);
    entity.isMinter = false;
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
    entity.decimals = BigInt.zero();
  }

  return entity;
}

export function getVault(id: Address): Vault {
  let vault = Vault.load(id);

  if (!vault) {
    vault = new Vault(id);
  }

  return vault;
}

export function getVaultToken(
  vaultAddress: Address,
  tokenAddress: Address
): VaultToken {
  const id = combineToId(vaultAddress.toHex(), tokenAddress.toHex());

  let vaultToken = VaultToken.load(id);

  if (!vaultToken) {
    vaultToken = new VaultToken(id);

    const vault = getVault(vaultAddress);
    const token = getERC20Token(tokenAddress);
    vaultToken.vault = vault.id;
    vaultToken.token = token.id;
    vaultToken.totalCollected = BigInt.zero();

    vault.save();
    token.save();
  }

  return vaultToken;
}

function getEvenHex(value: string): string {
  if (value.length % 2) {
    value = value.slice(0, 2) + "0" + value.slice(2);
  }
  return value;
}
