use rusqlite::{functions::FunctionFlags, params, Connection, Result};
use num_bigint::BigUint;
use sp1_sdk::{utils, ProverClient, SP1Stdin};

pub fn insert_data(conn: &Connection, a: u64, b: u64, wallet: &str) {

    const ELF: &[u8] = include_bytes!("../../program/sql/encrypt");
    
    utils::setup_logger();

    let mut stdin = SP1Stdin::new();
    stdin.write(&a);
    stdin.write(&b);

    // Create a `ProverClient` method.
    let client = ProverClient::from_env();

    // Execute the program using the `ProverClient.execute` method, without generating a proof.
    let (_, report) = client.execute(ELF, &stdin).run().unwrap();
    println!(
        "executed program with {} cycles",
        report.total_instruction_count()
    );

    let (pk, vk) = client.setup(ELF);
    let mut proof = client.prove(&pk, &stdin).compressed().run().unwrap();

    let ct1 = proof.public_values.read::<u64>();
    let ct2 = proof.public_values.read::<u64>();

    client.verify(&proof, &vk).expect("verification failed");

    println!("ct1: {}", ct1);
    println!("ct2: {}", ct2);

    //select the last net entry
    let mut stmt = conn.prepare("SELECT net FROM wallet_txs ORDER BY id DESC LIMIT 1").unwrap();
    let mut rows = stmt.query(params![]).unwrap();
    let mut net_res = 0u64;
    while let Some(row) = rows.next().unwrap() {
        net_res = row.get(0).unwrap();
    }

    println!("==============================");
    let ELF_ADD: &[u8] = include_bytes!("../../program/sql/add");
    let mut stdin1 = SP1Stdin::new();
    if b == 0 {
        stdin1.write(&ct1);
        stdin1.write(&net_res);
    } else {
        stdin1.write(&ct2);
        stdin1.write(&net_res);
    }
    let(_, report1) = client.execute(ELF_ADD, &stdin1).run().unwrap();
    print!(
        "executed program with {} cycles",
        report1.total_instruction_count()
    );
    let(pk1, vk1) = client.setup(ELF_ADD);
    let mut proof1 = client.prove(&pk1, &stdin1).compressed().run().unwrap();
    let result = proof1.public_values.read::<u64>();
    println!("result: {}", result);
    client.verify(&proof1, &vk1).expect("verification failed");

    conn.execute(
        "INSERT INTO wallet_txs (wallet, debit, credit, net) VALUES (?1, ?2, ?3, ?4)",
        params![wallet, ct1, ct2, result],
    ).expect("insert failed");
}