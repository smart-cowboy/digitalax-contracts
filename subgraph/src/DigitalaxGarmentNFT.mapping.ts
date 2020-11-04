import {log, BigInt, Address} from "@graphprotocol/graph-ts/index";

import {
    Transfer,
    ReceivedChild,
    DigitalaxGarmentNFT as DigitalaxGarmentNFTContract
} from "../generated/DigitalaxGarmentNFT/DigitalaxGarmentNFT";

import {
    DigitalaxGarment,
    DigitalaxGarmentChild
} from "../generated/schema";

export const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000');

export function handleTransfer(event: Transfer): void {
    let contract = DigitalaxGarmentNFTContract.bind(event.address);

    // This is the birthing of a garment
    if (event.params.from.equals(ZERO_ADDRESS)) {
        let garment = new DigitalaxGarment(event.params.tokenId.toString());
        garment.designer = contract.garmentDesigners(event.params.tokenId);
        garment.primarySalePrice = contract.primarySalePrice(event.params.tokenId);
        garment.save();
    }
}

export function handleChildReceived(event: ReceivedChild): void {
    let garment = DigitalaxGarment.load(event.params.toTokenId.toString());

    let childId = event.params.toTokenId.toString() + '-' + event.params.childTokenId.toString();
    let child = DigitalaxGarmentChild.load(childId);

    if (child == null) {
        child = new DigitalaxGarmentChild(childId);
        child.amount = event.params.amount;
    } else {
        child.amount = child.amount + event.params.amount;
    }

    child.save();

    let strands = garment.strands;

    if (strands == null) {
        strands = new Array<string>();
    }

    strands.push(childId);
    garment.strands = strands;

    garment.save();
}
