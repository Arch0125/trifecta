use script::dbhandler::{decrypt, insert_data, withdraw};
use sp1_sdk::{include_elf, utils, ProverClient, SP1ProofWithPublicValues, SP1Stdin};
use rusqlite::{functions::FunctionFlags, params, Connection, Result};
use num_bigint::BigUint;

/// The ELF (executable and linkable format) file for the Succinct RISC-V zkVM.
const ELF: &[u8] = include_bytes!("../../program/sql/decrypt");

fn main() {

    let conn = Connection::open("wallets.db").unwrap();

    //create table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS wallet_txs (
            id INTEGER PRIMARY KEY,
            wallet TEXT NOT NULL,
            debit INTEGER NOT NULL,
            credit INTEGER NOT NULL,
            net INTEGER NOT NULL
        )",
        [],
    ).expect("table creation failed");

    let debit = 0u64;
    let credit = 100u64;

    let wallet = "Alice";

    // Insert the data into the database.
    // insert_data(&conn, debit, credit, wallet);
    // // withdraw(wallet, credit, &conn);
    // // insert_data(&conn, debit, credit, wallet);
    // withdraw(wallet, 50u64, &conn);
    withdraw(wallet, 150u64, &conn);

    // decrypt(wallet,credit, &conn);

    // Setup the logger.
//     utils::setup_logger();

//     let conn = Connection::open("example.db").unwrap();

// //     a: 2048255844951298233
// // b: 179846505611096650

//     // Create an input stream and write '500' to it.
//     let pt_1 = 2048255844951298233u64;
//     let pt_2 = 179846505611096650u64;

//     //res : 4129133346
    
//     // let pt1_bg = BigUint::from(3604835356u32);
//     // let pt2_bg = BigUint::from(4129133346u32);
//     // let pt1_bytes = pt1_bg.to_bytes_be();
//     // let pt2_bytes = pt2_bg.to_bytes_be();

//     // The input stream that the program will read from using `sp1_zkvm::io::read`. Note that the
//     // types of the elements in the input stream must match the types being read in the program.
//     let mut stdin = SP1Stdin::new();
//     stdin.write(&pt_1);
//     stdin.write(&pt_2);

//     // Create a `ProverClient` method.
//     let client = ProverClient::from_env();

//     // Execute the program using the `ProverClient.execute` method, without generating a proof.
//     let (_, report) = client.execute(ELF, &stdin).run().unwrap();
//     println!(
//         "executed program with {} cycles",
//         report.total_instruction_count()
//     );

//     // Generate the proof for the given program and input.
//     let (pk, vk) = client.setup(ELF);
//     let mut proof = client.prove(&pk, &stdin).compressed().run().unwrap();

//     println!("generated proof");

//     // Read and verify the output.
//     //
//     // Note that this output is read from values committed to in the program using
//     // `sp1_zkvm::io::commit`.
//     let a = proof.public_values.read::<u64>();
//     let b = proof.public_values.read::<u64>();

//     println!("a: {}", a);
//     println!("b: {}", b);

//     // Verify proof and public values
//     client.verify(&proof, &vk).expect("verification failed");

//     // Test a round trip of proof serialization and deserialization.
//     proof
//         .save("proof-with-pis.bin")
//         .expect("saving proof failed");
//     let deserialized_proof =
//         SP1ProofWithPublicValues::load("proof-with-pis.bin").expect("loading proof failed");

//     // Verify the deserialized proof.
//     client
//         .verify(&deserialized_proof, &vk)
//         .expect("verification failed");

//     println!("successfully generated and verified proof for the program!")
}
