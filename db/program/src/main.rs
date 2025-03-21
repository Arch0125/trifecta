//! A simple program that takes a number `n` as input, and writes the `n-1`th and `n`th fibonacci
//! number as an output.

// These two lines are necessary for the program to properly compile.
//
// Under the hood, we wrap your main function with some extra code so that it behaves properly
// inside the zkVM.
#![no_main]
sp1_zkvm::entrypoint!(main);

use std::fs;

use alloy_sol_types::SolType;
use fibonacci_lib::{fibonacci, PublicValuesStruct};
use num_bigint::BigUint;
use paillier_rs::{encrypt::paillier_encrypt, keygen::paillier_keygen};
use sp1_zkvm::io;

pub fn main() {
   

    let op_code = io::read::<u32>();
    let wallet_address = io::read::<String>();
    let debit = io::read::<u32>();
    let credit = io::read::<u32>();

    let (pubkey, privkey) = paillier_keygen(16);

    let encrypted_debit = paillier_encrypt(&pubkey, &BigUint::from(debit));
    let encrypted_credit = paillier_encrypt(&pubkey, &BigUint::from(credit));

    io::commit_slice(&encrypted_debit.to_bytes_le());
    io::commit_slice(&encrypted_credit.to_bytes_le());

}
