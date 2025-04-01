import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Voting } from "../target/types/voting";
import { describe, it } from "node:test";
import { expect } from '@jest/globals';
const IDL = require("../target/idl/voting.json");
const PROGRAM_ID = new PublicKey(IDL.address);

describe("Voting", async () => {
  // Initialize these variables at the module level
  const context = await startAnchor('', [{ name: "voting", programId: PROGRAM_ID }], []);
  const provider = new BankrunProvider(context);
  const votingProgram = new anchor.Program<Voting>(
    IDL,
    provider,
  );

  it("initializes a poll", async () => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite sweet?",
      new anchor.BN(100),
      new anchor.BN(1739370789),
    ).rpc();
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingProgram.programId,
    );
    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);
  });

  it("initializes candidates", async () => {
    await votingProgram.methods.initializeCandidate(
      "Gulab Jamun",
      new anchor.BN(1),
    ).rpc();
    await votingProgram.methods.initializeCandidate(
      "Rasgulla",
      new anchor.BN(1),
    ).rpc();
    const [gulabJamunAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Gulab Jamun")],
      votingProgram.programId,
    );
    const gulabJamunCandidate = await votingProgram.account.candidate.fetch(gulabJamunAddress);
    console.log(gulabJamunCandidate);
    const [rasgullaAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Rasgulla")],
      votingProgram.programId,
    );
    const rasgullaCandidate = await votingProgram.account.candidate.fetch(rasgullaAddress);
    console.log(rasgullaCandidate);
  });

  it("vote candidates", async () => {
    await votingProgram.methods.vote(
      "Gulab Jamun",
      new anchor.BN(1),
    ).rpc();
    await votingProgram.methods.vote(
      "Rasgulla",
      new anchor.BN(1),
    ).rpc();
    const [gulabJamunAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Gulab Jamun")],
      votingProgram.programId,
    );
    const gulabJamunCandidate = await votingProgram.account.candidate.fetch(gulabJamunAddress);
    console.log(gulabJamunCandidate);
    const [rasgullaAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Rasgulla")],
      votingProgram.programId,
    );
    const rasgullaCandidate = await votingProgram.account.candidate.fetch(rasgullaAddress);
    console.log(rasgullaCandidate);
    expect(rasgullaCandidate.candidateVotes.toNumber()).toBe(1);
    expect(rasgullaCandidate.candidateName).toBe("Rasgulla");
    expect(gulabJamunCandidate.candidateVotes.toNumber()).toBe(1);
    expect(gulabJamunCandidate.candidateName).toBe("Gulab Jamun");
  });
});