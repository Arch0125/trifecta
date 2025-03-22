// index.js
import { createRequire } from 'module';
import Imap from 'node-imap';
const require = createRequire(import.meta.url);
import { inspect } from 'util';

const imap = new Imap({
    user: process.env.GMAIL_USER,         // replace with your Gmail address
    password: process.env.GMAIL_PASS, // replace with your app-specific password
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});

const REQUIRED_SUBJECT = "=?UTF-8?q?=E2=9D=97__You_have_done_a_UPI_txn._Check_details!?=";
// Capture the start timestamp so we only process emails with Date >= startTime.
const startTime = new Date();

let startUID: number;

// Open the INBOX folder in read-write mode (to mark messages as seen)
function openInbox(callback: (err: Error | null, box?: any) => void) {
    imap.openBox('INBOX', false, callback);
}

// This function searches for new unseen emails (with UID >= startUID)
// that have the required subject and are from "hdfcbank.net"
function fetchNewEmails() {
    // Search criteria: UID range, subject header, sender, and unseen flag.
    const criteria = [
        ['UID', `${startUID}:*`],
        ['FROM', 'hdfcbank.net'],
        'UNSEEN'
    ];
    imap.search(criteria, (err: Error, results: number[]) => {
        if (err) {
            console.error('Search error:', err);
            return;
        }
        if (!results || results.length === 0) {
            console.log('No new matching emails.');
            return;
        }
        console.log('Found matching email UIDs:', results);

        // Fetch both header (optional) and the full raw message.
        const fetchOptions = { bodies: ['HEADER.FIELDS (SUBJECT FROM DATE)', ''], uid: true };
        const f = imap.fetch(results, fetchOptions);

        f.on('message', (msg: any, seqno: number) => {
            let fullEmlData = '';
            let uid: number;

            msg.on('attributes', (attrs: any) => {
                uid = attrs.uid;
            });

            msg.on('body', (stream: any, info: any) => {
                let buffer = '';
                stream.on('data', (chunk: Buffer) => {
                    buffer += chunk.toString('utf8');
                });
                stream.once('end', () => {
                    // When info.which is an empty string, it represents the full message.
                    if (info.which === '') {
                        fullEmlData = buffer;
                    }
                });
            });

            msg.once('end', () => {
                console.log(`\nEML content for new message UID ${uid}:\n`);
                if (fullEmlData.includes(REQUIRED_SUBJECT)) {
                    console.log('Email contains required subject and is from hdfcbank.net');
                }
                console.log('-----------------------------------------------------');

                // Mark the email as seen so it's not processed again.
                imap.addFlags(uid, '\\Seen', (err: Error) => {
                    if (err) {
                        console.error(`Error marking message UID ${uid} as seen:`, err);
                    } else {
                        console.log(`Message UID ${uid} marked as seen.`);
                    }
                });
            });
        });

        f.once('error', (err: Error) => {
            console.error('Fetch error:', err);
        });

        f.once('end', () => {
            console.log('Done fetching new emails.');
        });
    });
}

imap.once('ready', () => {
    openInbox((err, box) => {
        if (err) throw err;
        console.log('Mailbox opened.');

        // Record the current next UID. This ensures that any emails that arrived before the service started are ignored.
        startUID = box.uidnext;
        console.log(`Service started at UID: ${startUID}`);

        // Listen for new mail events.
        imap.on('mail', (numNewMsgs: number) => {
            console.log(`New mail event: ${numNewMsgs} new message(s)`);
            fetchNewEmails();
        });
    });
});

imap.once('error', (err: Error) => {
    console.error('Connection error:', err);
});

imap.once('end', () => {
    console.log('Connection ended.');
});

imap.connect();