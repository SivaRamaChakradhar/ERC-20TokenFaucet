import { expect } from "chai";
import pkg from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";

const { ethers } = pkg;

const DAY = 24 * 60 * 60;
const FAUCET_AMOUNT = ethers.parseEther("50");

async function setTotalSupply(token, value) {
  // ERC20 _totalSupply slot index (OZ): 2
  const slot = "0x" + (2).toString(16).padStart(64, "0");
  const hexValue = ethers.toBeHex(value, 32);
  await ethers.provider.send("hardhat_setStorageAt", [token.target, slot, hexValue]);
}

describe("TokenFaucet", function () {
  let deployer, user, other;
  let token, faucet;

  beforeEach(async function () {
    [deployer, user, other] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("FaucetToken");
    token = await Token.deploy();

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(token.target);

    await token.setFaucet(faucet.target);
  });

  it("deploys with correct defaults", async function () {
    expect(await faucet.admin()).to.equal(deployer.address);
    expect(await faucet.isPaused()).to.equal(false);
    expect(await faucet.token()).to.equal(token.target);
  });

  it("allows an eligible user to claim", async function () {
    await expect(faucet.connect(user).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user.address, FAUCET_AMOUNT, anyValue);

    const balance = await token.balanceOf(user.address);
    expect(balance).to.equal(FAUCET_AMOUNT);

    const last = await faucet.lastClaimAt(user.address);
    expect(last).to.be.gt(0);

    const claimed = await faucet.totalClaimed(user.address);
    expect(claimed).to.equal(FAUCET_AMOUNT);
  });

  it("enforces cooldown with clear message", async function () {
    await faucet.connect(user).requestTokens();

    await expect(faucet.connect(user).requestTokens()).to.be.revertedWith(
      "Cooldown active"
    );
  });

  it("enforces lifetime limit", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user).requestTokens();
      if (i < 9) {
        await time.increase(DAY);
      }
    }

    await time.increase(DAY);

    await expect(faucet.connect(user).requestTokens()).to.be.revertedWith(
      "Lifetime allowance reached"
    );

    const remaining = await faucet.remainingAllowance(user.address);
    expect(remaining).to.equal(0n);
  });

  it("blocks claims when paused", async function () {
    await faucet.setPaused(true);
    expect(await faucet.isPaused()).to.equal(true);

    await expect(faucet.connect(user).requestTokens()).to.be.revertedWith(
      "Faucet is paused"
    );
  });

  it("restricts pause to admin", async function () {
    await expect(faucet.connect(other).setPaused(true)).to.be.revertedWith(
      "Only admin"
    );
  });

  it("emits event with timestamp", async function () {
    await expect(faucet.connect(user).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user.address, FAUCET_AMOUNT, anyValue);
  });

  it("reverts when remaining supply is insufficient", async function () {
    const maxSupply = await token.MAX_SUPPLY();
    const nearMax = maxSupply - FAUCET_AMOUNT / 2n;
    await setTotalSupply(token, nearMax);

    await expect(faucet.connect(user).requestTokens()).to.be.revertedWith(
      "Faucet has insufficient token supply"
    );
  });
});
