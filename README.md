# zkPay

## Short description
Confidential payments for businesses and payslips using email and fiat(UPI)

## Description
zkPay allows user to send invoices directly to the receivers mail, then it can be paid either by replying to the mail simply with “Confirm” or the user can send the required amount to the relayer’s UPI ID.
The relayer once receiving the payments, its IMAP/SMTP server listens for bank email for credits and generates zk proofs for the email and then submits onchain, once verified, the SP1 zkVM updates the sql db using Homomorphic encryption with the transactions and sets the updated balance, the computation proof is then verified and posted onchain.
After this whole process the user can check their balances and withdraw back tokens into a different wallet, the user has to generate a proof that it has enough balance to proceed with the withdrawal and that proof is verified inside SP1 and after that onchain transaction is broadcasted for token transfer.

Throughout the whole process the users only interact with the relayer and hence neither party learns of the other’s emailid/upi id/wallet address, hence there is no onchain linkage and trace of the balance. This is possible due to the fact that relayer acts as the privacy pool and stores the liquidity.


## How it works

Components
- HE library : A paillier cryptosystem is written from scratch which enables partial HE required for updating balances
- PHE-SQL engine : A custom sql engine is made using rustsqlite to expose custom commands to allow PHE operations over sql db
- SP1 server : 5 ELFs has been written from scratch to support PHE computation and generate its proofs, and also execute SQL commands
- Mail server : This mail server checks for mails in the relayer inbox and generate zk proof of credits using the zkemail SDK

The end to end flow looks like
- User A sends a mails to the relayer with invoice to User B
- User B makes payment to the relayer using UPI/emailwallet
- The relayer fetches the eml file from mail inbox and generates the credit proof using zk email blueprint sdk
- Once amount is verified, the data is sent to SP1 to update the phe-sql with the transaction and generates proof and submits them onchain after verification 
- Once verified, User A can decrypt balance and check its updated state.
- If the User A wants to withdraw funds from the relayer pool, it send a proof to SP1, which verifies the yser has enough balance to withdraw required funds.
- Once proof is verified and submitted oncchain, an onchain tx is broadcasted to transfer back tokens

## Run the project

- Inside blueprint run `bun run mail.ts`
- inside db/crates/script `cargo run --release`
- For frontend `npm run dev`

## To test the prover separately 
- run `cd db/crates/script` and then `cargo run --release`
- make curl requests like 
```
curl -X POST -H "Content-Type: application/json" \
     -d '{"wallet": "trifecta22937@gmail.com", "amount": 1}' \
     http://127.0.0.1:8080/credit
```

```
curl -X POST -H "Content-Type: application/json" \
     -d '{"wallet": "trifecta22937@gmail.com", "amount": 1}' \
     http://127.0.0.1:8080/decrypt
```

### ENV used 
```
GMAIL_USER= # email address of the relayer
GMAIL_PASS= #email password/ app specific password
```

reuired inside `blueprint` and `fe`
