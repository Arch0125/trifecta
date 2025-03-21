//! A simple program that takes a number `n` as input, and writes the `n-1`th and `n`th fibonacci
//! number as an output.

// These two lines are necessary for the program to properly compile.
//
// Under the hood, we wrap your main function with some extra code so that it behaves properly
// inside the zkVM.
#![no_main]
sp1_zkvm::entrypoint!(main);

use std::{fs, result};

use alloy_sol_types::SolType;
use fibonacci_lib::{fibonacci, PublicValuesStruct};
use num_bigint::BigUint;
use paillier_rs::{arithmetic::paillier_add, decrypt, encrypt::paillier_encrypt, keygen::paillier_keygen};
use sp1_zkvm::io;
use num_traits::ToPrimitive;

pub fn main() {

    //elf for encryption
    // let plaintext_1 = io::read::<u32>();
    // let plaintext_2 = io::read::<u32>();
    // let (pk, _) = paillier_keygen(16);
    // let ciphertext_1 = paillier_encrypt(&pk, &BigUint::from(plaintext_1));
    // let ciphertext_2 = paillier_encrypt(&pk, &BigUint::from(plaintext_2));
    // let ct1_u64 = ciphertext_1.to_u64().unwrap();
    // let ct2_u64 = ciphertext_2.to_u64().unwrap();
    // io::commit::<u64>(&ct1_u64);
    // io::commit::<u64>(&ct2_u64);

    //elf for paillier addition
    let ciphertext_1 = io::read::<u64>();
    let ciphertext_2 = io::read::<u64>();
    let (pk, sk) = paillier_keygen(16);
    let ct1_bg = BigUint::from(ciphertext_1);
    let ct2_bg = BigUint::from(ciphertext_2);
    let result = paillier_add(&ct1_bg, &ct2_bg, &pk);
    let result_u64 = result.to_u64().unwrap();
    io::commit::<u64>(&result_u64);


    //elf for decryption

    // let ciphertext_1 = io::read::<u64>();
    // let ciphertext_2 = io::read::<u64>();
    // let (pk, sk) = paillier_keygen(16);
    // let ct1_bg = BigUint::from(ciphertext_1);
    // let ct2_bg = BigUint::from(ciphertext_2);
    // let plaintext_1 = decrypt::paillier_decrypt(&sk, &pk, &ct1_bg);
    // let plaintext_2 = decrypt::paillier_decrypt(&sk, &pk, &ct2_bg);
    // let pt1_u64 = plaintext_1.to_u64().unwrap();
    // let pt2_u64 = plaintext_2.to_u64().unwrap();
    // io::commit::<u64>(&pt1_u64);
    // io::commit::<u64>(&pt2_u64);
    

}
